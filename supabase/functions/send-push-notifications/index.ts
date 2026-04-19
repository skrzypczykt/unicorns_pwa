import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import web-push library for proper VAPID signing
import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = 'mailto:unicorns.lodz@gmail.com'

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Create service role client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body with better error handling
    let body
    try {
      const text = await req.text()
      console.log('Raw request body:', text)
      body = JSON.parse(text)
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    const { activityId, activityName, dateTime, userId, sendToAll } = body

    console.log('Received request:', { activityId, activityName, dateTime, userId, sendToAll })

    // Verify userId is admin (optional security check)
    if (userId) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (profile?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Only admins can send push notifications' }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }
    }

    if (!activityId || !activityName || !dateTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    let userIds: string[] = []

    if (sendToAll) {
      // Wyślij do WSZYSTKICH użytkowników którzy mają push subscriptions
      console.log('Sending to ALL users with push subscriptions')

      const { data: allSubscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('user_id')

      if (subsError) throw subsError

      userIds = [...new Set(allSubscriptions?.map((s: any) => s.user_id) || [])]
      console.log('All users with subscriptions:', userIds.length)
    } else {
      // Znajdź użytkowników zainteresowanych tym typem zajęć
      const { data: interestedUsers, error: usersError } = await supabase
        .rpc('get_users_interested_in_activity_type', {
          activity_name_param: activityName.split(' ')[0]
        })

      console.log('Interested users:', interestedUsers?.length || 0)

      if (usersError) {
        console.error('Error fetching interested users:', usersError)
        throw usersError
      }

      if (!interestedUsers || interestedUsers.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No interested users found', sent: 0 }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }

      userIds = interestedUsers.map((u: any) => u.user_id)
    }

    // Pobierz tokeny push dla zainteresowanych użytkowników
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    console.log('Push subscriptions found:', subscriptions?.length || 0)

    if (subsError) throw subsError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push subscriptions found', sent: 0 }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Filtruj nieważne endpointy przed wysyłką
    const validSubscriptions = subscriptions.filter((sub) => {
      // Sprawdź czy endpoint nie zawiera placeholder "permanently-removed.invalid"
      if (sub.endpoint.includes('permanently-removed.invalid')) {
        console.log(`Skipping invalid endpoint for user ${sub.user_id}`)
        // Oznacz do usunięcia
        supabase.from('push_subscriptions').delete().eq('id', sub.id).then(() => {
          console.log(`Deleted invalid subscription ${sub.id}`)
        })
        return false
      }
      return true
    })

    console.log(`Valid subscriptions: ${validSubscriptions.length} / ${subscriptions.length}`)

    if (validSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No valid push subscriptions found', sent: 0 }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Pobierz szczegóły aktywności (w tym is_special_event i link WhatsApp)
    const { data: activity } = await supabase
      .from('activities')
      .select(`
        is_special_event,
        whatsapp_group_url,
        activity_types (
          whatsapp_group_url
        )
      `)
      .eq('id', activityId)
      .single()

    // Przygotuj treść powiadomienia
    const formattedDate = new Date(dateTime).toLocaleString('pl-PL', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Rozróżnij tytuł: wydarzenie specjalne vs zwykłe zajęcia
    const isSpecialEvent = activity?.is_special_event || sendToAll
    const titlePrefix = isSpecialEvent ? '🎉 Nowe wydarzenie' : '🦄 Nowe zajęcia'

    // Dodaj wzmiankę o WhatsApp jeśli dostępna (z fallbackiem do activity_type)
    let bodyText = `📅 ${formattedDate} - Zapisz się teraz!`
    const whatsappLink = activity?.whatsapp_group_url || activity?.activity_types?.whatsapp_group_url
    if (whatsappLink) {
      bodyText += ` 💬 Grupa WhatsApp dostępna!`
    }

    const notification = {
      title: `${titlePrefix}: ${activityName}`,
      body: bodyText,
      icon: '/unicorns-logo.png',
      badge: '/badge-icon.svg',
      data: {
        url: '/activities',
        activityId,
        hasWhatsApp: !!whatsappLink,
        isSpecialEvent: isSpecialEvent
      }
    }

    // Wyślij powiadomienia używając web-push library
    const sendResults = await Promise.allSettled(
      validSubscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notification)
          )

          // Loguj wysłane powiadomienie
          await supabase.from('push_notifications_log').insert({
            user_id: sub.user_id,
            activity_id: activityId,
            title: notification.title,
            body: notification.body,
            status: 'sent'
          })

          console.log(`Push sent to user ${sub.user_id}`)
          return { success: true, userId: sub.user_id }
        } catch (error: any) {
          console.error(`Failed to send push to user ${sub.user_id}:`, error)

          // Jeśli błąd 410 Gone (token wygasł) - usuń subskrypcję
          if (error.statusCode === 410 || error.message.includes('410')) {
            console.log(`Token expired for user ${sub.user_id}, deleting subscription`)
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }

          // Loguj błąd
          await supabase.from('push_notifications_log').insert({
            user_id: sub.user_id,
            activity_id: activityId,
            title: notification.title,
            body: notification.body,
            status: 'failed',
            error_message: error.message
          })

          return { success: false, userId: sub.user_id, error: error.message }
        }
      })
    )

    const successCount = sendResults.filter((r) => r.status === 'fulfilled' && (r.value as any).success).length
    const failedCount = sendResults.length - successCount

    console.log(`Push results: ${successCount} sent, ${failedCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
        total: sendResults.length
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error: any) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
