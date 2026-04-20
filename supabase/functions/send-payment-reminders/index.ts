import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper: Get OAuth2 access token from Service Account
async function getAccessToken(): Promise<string> {
  const serviceAccountBase64 = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
  if (!serviceAccountBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
  }

  // Decode base64 to get JSON
  const serviceAccountJson = atob(serviceAccountBase64)
  const serviceAccount = JSON.parse(serviceAccountJson)

  const { client_email, private_key, project_id } = serviceAccount

  // Create JWT
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: client_email,
    sub: client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  }

  // Import crypto for signing
  const encoder = new TextEncoder()
  const header = { alg: 'RS256', typ: 'JWT' }
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  // Import private key
  const pemHeader = '-----BEGIN PRIVATE KEY-----'
  const pemFooter = '-----END PRIVATE KEY-----'
  const pemContents = private_key.substring(
    pemHeader.length,
    private_key.length - pemFooter.length - 1
  ).replace(/\s/g, '')

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Sign JWT
  const signatureInput = `${headerB64}.${payloadB64}`
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const jwt = `${signatureInput}.${signatureB64}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Failed to get access token: ${errorText}`)
  }

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get Service Account project_id
    const serviceAccountBase64 = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountBase64) {
      return new Response(
        JSON.stringify({ error: 'FIREBASE_SERVICE_ACCOUNT not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const serviceAccount = JSON.parse(atob(serviceAccountBase64))
    const projectId = serviceAccount.project_id

    // Get OAuth2 access token
    const accessToken = await getAccessToken()

    // 1. Pobierz rejestracje wymagające przypomnienia
    const { data: registrations, error: fetchError } = await supabaseAdmin
      .rpc('get_registrations_needing_payment_reminders')

    if (fetchError) {
      console.error('Error fetching registrations:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!registrations || registrations.length === 0) {
      console.log('No registrations need reminders')
      return new Response(
        JSON.stringify({ sent: 0, message: 'No registrations need reminders' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${registrations.length} registrations needing reminders`)

    let sentCount = 0
    let errorCount = 0

    // 2. Dla każdej rejestracji wyślij push notification
    for (const reg of registrations) {
      try {
        // Pobierz FCM tokeny użytkownika
        const { data: tokens, error: tokenError } = await supabaseAdmin
          .from('fcm_tokens')
          .select('token')
          .eq('user_id', reg.user_id)

        if (tokenError) {
          console.error(`Error fetching tokens for user ${reg.user_id}:`, tokenError)
          errorCount++
          continue
        }

        if (!tokens || tokens.length === 0) {
          console.log(`No FCM tokens found for user ${reg.user_id}`)
          continue
        }

        // Formatuj datę płatności
        const dueDate = new Date(reg.payment_due_date)
        const formattedDate = dueDate.toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        })

        // Określ pilność przypomnienia
        const now = new Date()
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        const isUrgent = hoursUntilDue <= 24

        const title = isUrgent
          ? '⚠️ PILNE: Przypomnienie o płatności!'
          : '💳 Przypomnienie o płatności'

        const body = `Zapłać za "${reg.activity_name}" do ${formattedDate}. Kwota: ${reg.activity_cost.toFixed(2)} zł`

        // Wyślij push do każdego tokenu użytkownika (FCM v1 API)
        for (const { token } of tokens) {
          try {
            const response = await fetch(
              `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: {
                    token: token,
                    notification: {
                      title: title,
                      body: body
                    },
                    data: {
                      type: 'payment_reminder',
                      registration_id: reg.registration_id,
                      activity_id: reg.activity_id,
                      payment_due_date: reg.payment_due_date,
                      amount: reg.activity_cost.toString()
                    },
                    webpush: {
                      notification: {
                        icon: '/icon-192x192.png',
                        badge: '/icon-192x192.png',
                        tag: `payment-reminder-${reg.registration_id}`,
                        requireInteraction: isUrgent
                      }
                    }
                  }
                })
              }
            )

            if (response.ok) {
              console.log(`Push sent to user ${reg.user_id} for registration ${reg.registration_id}`)
              sentCount++

              // Zapisz do push_notifications_log
              await supabaseAdmin.from('push_notifications_log').insert({
                user_id: reg.user_id,
                activity_id: reg.activity_id,
                title: title,
                body: body,
                type: 'payment_reminder',
                status: 'sent'
              })
            } else {
              const errorText = await response.text()
              console.error(`Failed to send push to token ${token}:`, errorText)
              errorCount++
            }
          } catch (pushError) {
            console.error(`Error sending push to token ${token}:`, pushError)
            errorCount++
          }
        }

        // 3. Zaktualizuj last_payment_reminder_sent_at
        const { error: updateError } = await supabaseAdmin
          .from('registrations')
          .update({ last_payment_reminder_sent_at: new Date().toISOString() })
          .eq('id', reg.registration_id)

        if (updateError) {
          console.error(`Error updating reminder timestamp for ${reg.registration_id}:`, updateError)
          errorCount++
        }

      } catch (regError) {
        console.error(`Error processing registration ${reg.registration_id}:`, regError)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        total_registrations: registrations.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
