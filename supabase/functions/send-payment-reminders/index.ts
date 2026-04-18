import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')
    if (!FCM_SERVER_KEY) {
      console.error('FCM_SERVER_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'FCM not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

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

        // Wyślij push do każdego tokenu użytkownika
        for (const { token } of tokens) {
          try {
            const response = await fetch('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Authorization': `key=${FCM_SERVER_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: token,
                notification: {
                  title: title,
                  body: body,
                  icon: '/icon-192x192.png',
                  badge: '/icon-192x192.png',
                  tag: `payment-reminder-${reg.registration_id}`,
                  requireInteraction: isUrgent
                },
                data: {
                  type: 'payment_reminder',
                  registration_id: reg.registration_id,
                  activity_id: reg.activity_id,
                  payment_due_date: reg.payment_due_date,
                  amount: reg.activity_cost.toString()
                }
              })
            })

            if (response.ok) {
              console.log(`Push sent to user ${reg.user_id} for registration ${reg.registration_id}`)
              sentCount++
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
