import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can send emails' }),
        { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const { subject, body, activityId, notificationType } = await req.json()

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Subject and body are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log(`[Send Email] Sending notification for activity ${activityId || 'N/A'}, type: ${notificationType || 'general'}`)

    let users

    // Jeśli to aktualizacja wydarzenia - wyślij tylko do uczestników
    if (notificationType === 'event_updated' && activityId) {
      const { data: participants, error: participantsError } = await supabase
        .from('registrations')
        .select(`
          user_id,
          users!registrations_user_id_fkey (
            email,
            display_name,
            email_notifications_enabled
          )
        `)
        .eq('activity_id', activityId)
        .eq('status', 'registered')

      if (participantsError) {
        console.error('[Send Email] Error fetching participants:', participantsError)
        throw participantsError
      }

      // Filtruj tylko tych z włączonymi powiadomieniami email
      users = participants
        ?.filter(p => p.users?.email_notifications_enabled)
        .map(p => ({ email: p.users.email, display_name: p.users.display_name })) || []

    } else {
      // Standardowa wysyłka - do wszystkich z włączonymi powiadomieniami
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('email, display_name')
        .eq('email_notifications_enabled', true)

      if (usersError) {
        console.error('[Send Email] Error fetching users:', usersError)
        throw usersError
      }

      users = allUsers
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No users with email notifications enabled' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log(`[Send Email] Found ${users.length} users to send emails`)

    // Prepare HTML email
    const htmlBody = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(to right, #ec4899, #8b5cf6, #3b82f6); padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px;">🦄 Unicorns Łódź</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Sport | Kultura | Rozrywka</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #8b5cf6; margin-top: 0; font-size: 24px;">${subject}</h2>
      <div style="color: #374151; line-height: 1.6; white-space: pre-wrap; font-size: 16px;">
${body}
      </div>
    </div>

    <!-- CTA Button -->
    <div style="padding: 0 30px 30px 30px; text-align: center;">
      <a href="https://unicorns.org.pl/activities" style="display: inline-block; background: linear-gradient(to right, #ec4899, #8b5cf6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        🗓️ Zobacz harmonogram
      </a>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 2px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        © 2026 Stowarzyszenie Unicorns. Wszystkie prawa zastrzeżone.
      </p>
      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">
        Otrzymujesz tę wiadomość, ponieważ zapisałeś/aś się na powiadomienia email.
        <br>
        Możesz zarządzać preferencjami w <a href="https://unicorns.org.pl/settings" style="color: #8b5cf6;">ustawieniach aplikacji</a>.
      </p>
    </div>
  </div>
</body>
</html>
    `

    let sentCount = 0
    const errors: string[] = []

    // Send emails via Resend API
    for (const recipient of users) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Unicorns Łódź <onboarding@resend.dev>',
            to: [recipient.email],
            subject: subject,
            html: htmlBody,
          }),
        })

        if (response.ok) {
          sentCount++
          console.log(`[Send Email] Sent to ${recipient.email}`)

          // Log to database
          await supabase.from('push_notifications_log').insert({
            user_id: null, // Email sent to specific user, but we'll query by email
            activity_id: activityId || null,
            title: subject,
            body: body,
            type: notificationType || 'special_event',
            status: 'sent'
          })
        } else {
          const errorData = await response.text()
          console.error(`[Send Email] Failed to send to ${recipient.email}:`, errorData)
          errors.push(`${recipient.email}: ${errorData}`)
        }
      } catch (error) {
        console.error(`[Send Email] Error sending to ${recipient.email}:`, error)
        errors.push(`${recipient.email}: ${error.message}`)
      }
    }

    console.log(`[Send Email] Successfully sent ${sentCount}/${users.length} emails`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: users.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error: any) {
    console.error('[Send Email] Function error:', error)
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
