import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Get CORS headers based on request origin
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    console.log('=== Function invoked ===')

    // Create service role client (no user auth required)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header (Bearer token from user)
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)

    // Verify the JWT token using admin client
    console.log('Verifying JWT with admin client...')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      console.error('JWT verification failed:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', details: userError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User verified:', user.id, user.email)

    // Check if user is admin
    console.log('Checking admin role for user:', user.id)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Error fetching user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User role:', profile?.role)

    if (profile?.role !== 'admin') {
      console.error('Access denied - user is not admin')
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required', role: profile?.role }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Admin verified, reading request body...')
    const { month, activityTypeId } = await req.json()
    console.log('Request params:', { month, activityTypeId })

    // Validation
    if (!month) {
      console.error('Missing month parameter')
      return new Response(
        JSON.stringify({ error: 'Month parameter required (format: YYYY-MM-DD)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Call the database function
    console.log('Calling get_accounting_report...')
    const { data, error } = await supabaseAdmin.rpc('get_accounting_report', {
      report_month: month,
      activity_type_filter: activityTypeId || null
    })

    if (error) {
      console.error('Database function error:', error)
      throw error
    }

    console.log('Success! Rows returned:', data?.length || 0)

    return new Response(
      JSON.stringify({ data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error: any) {
    console.error('=== ERROR ===', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
