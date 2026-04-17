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
    // Get authorization header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Create client with user's token to check permissions
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    const { data: profile } = await supabaseUser
      .from('users')
      .select('role')
      .eq('id', user.id)
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

    // Create service role client for actual operations
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

    const { activityId, activityName, dateTime } = body

    console.log('Received request:', { activityId, activityName, dateTime })

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

    const userIds = interestedUsers.map((u: any) => u.user_id)

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

    // Wyślij powiadomienia używając web-push library
    const sendResults = await Promise.allSettled(
      subscriptions.map(async (sub) => {
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
