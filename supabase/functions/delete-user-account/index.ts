import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Get CORS headers based on request origin
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Create service role client (bypass RLS)
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

    const userId = user.id

    console.log(`[Delete Account] Starting deletion for user: ${userId}`)

    // 1. Sprawdź czy użytkownik ma aktywne rezerwacje na przyszłe wydarzenia
    const { data: futureRegistrations, error: regCheckError } = await supabase
      .from('registrations')
      .select(`
        id,
        activities (
          date_time,
          name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'registered')
      .gte('activities.date_time', new Date().toISOString())

    if (regCheckError) {
      console.error('[Delete Account] Error checking registrations:', regCheckError)
      throw regCheckError
    }

    if (futureRegistrations && futureRegistrations.length > 0) {
      const eventNames = futureRegistrations
        .map((r: any) => r.activities?.name || 'Nieznane wydarzenie')
        .join(', ')

      return new Response(
        JSON.stringify({
          error: `Masz aktywne rezerwacje na przyszłe wydarzenia: ${eventNames}. Anuluj je przed usunięciem konta.`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    // 2. Usuń dane użytkownika z wszystkich tabel (kaskadowo przez RLS jest wyłączone, więc musimy ręcznie)

    console.log('[Delete Account] Deleting push subscriptions...')
    await supabase.from('push_subscriptions').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting push notifications log...')
    await supabase.from('push_notifications_log').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting user interests...')
    await supabase.from('user_interests').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting attendance records...')
    await supabase.from('attendance').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting registrations...')
    await supabase.from('registrations').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting balance transactions...')
    await supabase.from('balance_transactions').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting user section balances...')
    await supabase.from('user_section_balances').delete().eq('user_id', userId)

    console.log('[Delete Account] Deleting user profile...')
    await supabase.from('users').delete().eq('id', userId)

    // 3. Usuń użytkownika z auth (to usunie też sesję)
    console.log('[Delete Account] Deleting auth user...')
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('[Delete Account] Error deleting auth user:', deleteAuthError)
      throw deleteAuthError
    }

    console.log(`[Delete Account] Successfully deleted user: ${userId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Konto zostało pomyślnie usunięte'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error: any) {
    console.error('[Delete Account] Function error:', error)
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
