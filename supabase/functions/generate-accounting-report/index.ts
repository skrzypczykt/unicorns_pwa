import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    console.log('Function invoked')

    // Create Supabase client with the Authorization header from the request
    // This allows Supabase to automatically verify the JWT
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create client that will use the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Get the authenticated user
    console.log('Getting authenticated user...')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('User verification failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User authenticated:', user.id)

    // Check if user is admin (using service role for this query)
    console.log('Checking admin role...')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('Profile:', profile, 'Error:', profileError)

    if (profileError || profile?.role !== 'admin') {
      console.error('Not admin. Role:', profile?.role)
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required', role: profile?.role }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('User is admin, reading request body...')
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

    // Call the database function (using service role client)
    console.log('Calling database function...')
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error: any) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
