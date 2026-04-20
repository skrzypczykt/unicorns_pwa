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

    // Znajdź wydarzenia stacjonarne które zaczynają się w ciągu następnych 15 minut
    // (uruchomiane co 10 minut, więc 15 min to buffer)
    const now = new Date()
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000)

    const { data: activities, error: fetchError } = await supabaseAdmin
      .from('activities')
      .select('id, name, date_time, is_online, location, meeting_link')
      .eq('status', 'scheduled')
      .eq('is_online', false) // Tylko wydarzenia stacjonarne (na żywo)
      .gte('date_time', now.toISOString())
      .lte('date_time', fifteenMinutesFromNow.toISOString())

    if (fetchError) {
      console.error('Error fetching activities:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!activities || activities.length === 0) {
      console.log('No activities starting soon')
      return new Response(
        JSON.stringify({ sent: 0, message: 'No activities starting soon' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${activities.length} activities starting soon`)

    let sentCount = 0
    let errorCount = 0

    // Dla każdego wydarzenia wyślij powiadomienia do zarejestrowanych użytkowników
    for (const activity of activities) {
      try {
        // Pobierz listę zarejestrowanych użytkowników
        const { data: registrations, error: regError } = await supabaseAdmin
          .from('registrations')
          .select('user_id')
          .eq('activity_id', activity.id)
          .eq('status', 'registered')

        if (regError) {
          console.error(`Error fetching registrations for activity ${activity.id}:`, regError)
          errorCount++
          continue
        }

        if (!registrations || registrations.length === 0) {
          console.log(`No registrations for activity ${activity.id}`)
          continue
        }

        const startTime = new Date(activity.date_time).toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit'
        })

        const title = '🏃 Wydarzenie za chwilę!'
        const body = `"${activity.name}" zaczyna się o ${startTime}. Lokalizacja: ${activity.location}`

        // Wyślij powiadomienie do każdego zarejestrowanego użytkownika
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
                          type: 'activity_start',
                          activity_id: activity.id,
                          activity_name: activity.name,
                          location: activity.location
                        },
                        webpush: {
                          notification: {
                            icon: '/icon-192x192.png',
                            badge: '/icon-192x192.png',
                            tag: `activity-start-${activity.id}`,
                            requireInteraction: true
                          }
                        }
                      }
                    })
                  }
                )

                if (response.ok) {
                  console.log(`Push sent to user ${reg.user_id} for activity ${activity.id}`)
                  sentCount++

                  // Zapisz do push_notifications_log
                  await supabaseAdmin.from('push_notifications_log').insert({
                    user_id: reg.user_id,
                    activity_id: activity.id,
                    title: title,
                    body: body,
                    type: 'activity_start',
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
          } catch (userError) {
            console.error(`Error processing user ${reg.user_id}:`, userError)
            errorCount++
          }
        }
      } catch (activityError) {
        console.error(`Error processing activity ${activity.id}:`, activityError)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        total_activities: activities.length
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
