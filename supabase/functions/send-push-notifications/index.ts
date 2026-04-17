import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// VAPID keys dla Web Push - NALEŻY WYGENEROWAĆ I DODAĆ DO ZMIENNYCH ŚRODOWISKOWYCH
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = 'mailto:unicorns.lodz@gmail.com'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { activityId, activityName, dateTime } = await req.json()

    if (!activityId || !activityName || !dateTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Znajdź użytkowników zainteresowanych tym typem zajęć
    const { data: interestedUsers, error: usersError } = await supabase
      .rpc('get_users_interested_in_activity_type', {
        activity_name_param: activityName.split(' ')[0] // Pierwsze słowo nazwy (np. "Badminton" z "Badminton - Liga")
      })

    if (usersError) {
      console.error('Error fetching interested users:', usersError)
      throw usersError
    }

    if (!interestedUsers || interestedUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No interested users found', sent: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userIds = interestedUsers.map((u: any) => u.user_id)

    // Pobierz tokeny push dla zainteresowanych użytkowników
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subsError) throw subsError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push subscriptions found', sent: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Przygotuj treść powiadomienia
    const formattedDate = new Date(dateTime).toLocaleString('pl-PL', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const notification = {
      title: `🦄 Nowe zajęcia: ${activityName}`,
      body: `📅 ${formattedDate} - Zapisz się teraz!`,
      icon: '/unicorns-logo.png',
      badge: '/unicorns-logo.png',
      data: {
        url: '/activities',
        activityId
      }
    }

    // Wyślij powiadomienia (używając Web Push API)
    const sendResults = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Web Push wymaga biblioteki - dla uproszczenia używamy fetch
          // W produkcji użyj biblioteki web-push lub @supabase/functions web-push
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '86400',
              'Authorization': `vapid t=${VAPID_PRIVATE_KEY}, k=${VAPID_PUBLIC_KEY}`
            },
            body: JSON.stringify(notification)
          })

          if (!response.ok) {
            throw new Error(`Push failed: ${response.status}`)
          }

          // Loguj wysłane powiadomienie
          await supabase.from('push_notifications_log').insert({
            user_id: sub.user_id,
            activity_id: activityId,
            title: notification.title,
            body: notification.body,
            status: 'sent'
          })

          return { success: true, userId: sub.user_id }
        } catch (error: any) {
          console.error(`Failed to send push to user ${sub.user_id}:`, error)

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

    const successCount = sendResults.filter((r) => r.status === 'fulfilled' && r.value.success).length
    const failedCount = sendResults.length - successCount

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
        total: sendResults.length
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
