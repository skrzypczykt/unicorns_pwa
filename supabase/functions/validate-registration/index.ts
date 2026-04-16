// Rainbow Unicorn Sports - Validate Registration Edge Function
// Validates and processes activity registration with capacity checks

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  activity_id: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: RequestBody = await req.json()
    const { activity_id } = body

    if (!activity_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: activity_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get activity details
    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('id', activity_id)
      .single()

    if (activityError || !activity) {
      return new Response(
        JSON.stringify({ error: 'Activity not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if activity is cancelled
    if (activity.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'Activity has been cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if activity is in the past
    const activityDate = new Date(activity.date_time)
    const now = new Date()

    if (activityDate < now) {
      return new Response(
        JSON.stringify({ error: 'Cannot register for past activities' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already registered
    const { data: existingRegistration } = await supabaseAdmin
      .from('registrations')
      .select('id, status')
      .eq('activity_id', activity_id)
      .eq('user_id', user.id)
      .single()

    if (existingRegistration) {
      if (existingRegistration.status === 'registered') {
        return new Response(
          JSON.stringify({
            error: 'Already registered for this activity',
            registration_id: existingRegistration.id
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (existingRegistration.status === 'cancelled') {
        // Allow re-registration after cancellation
        // Continue to capacity check
      }
    }

    // Check activity capacity using the PostgreSQL function
    const { data: isFullData, error: capacityError } = await supabaseAdmin
      .rpc('is_activity_full', { activity_uuid: activity_id })

    if (capacityError) {
      return new Response(
        JSON.stringify({ error: `Capacity check failed: ${capacityError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (isFullData === true) {
      // Get current participant count for user feedback
      const { data: countData } = await supabaseAdmin
        .rpc('get_participant_count', { activity_uuid: activity_id })

      return new Response(
        JSON.stringify({
          error: 'Activity is full',
          max_participants: activity.max_participants,
          current_participants: countData || activity.max_participants
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate cancellation deadline
    const { data: cancellationDeadline, error: deadlineError } = await supabaseAdmin
      .rpc('calculate_cancellation_deadline', { activity_uuid: activity_id })

    if (deadlineError) {
      return new Response(
        JSON.stringify({ error: `Failed to calculate deadline: ${deadlineError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create or update registration
    const registrationData = {
      activity_id,
      user_id: user.id,
      status: 'registered' as const,
      can_cancel_until: cancellationDeadline,
      payment_processed: false,
      cancelled_at: null
    }

    let registration

    if (existingRegistration?.status === 'cancelled') {
      // Update existing cancelled registration
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .update(registrationData)
        .eq('id', existingRegistration.id)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: `Failed to update registration: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      registration = data
    } else {
      // Create new registration
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .insert(registrationData)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: `Failed to create registration: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      registration = data
    }

    // Get updated participant count
    const { data: newCount } = await supabaseAdmin
      .rpc('get_participant_count', { activity_uuid: activity_id })

    // Get user info for response
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        registration: {
          id: registration.id,
          activity_id,
          activity_name: activity.name,
          activity_date: activity.date_time,
          cost: activity.cost,
          can_cancel_until: cancellationDeadline,
          status: registration.status
        },
        user: {
          id: user.id,
          name: userProfile?.display_name,
          email: userProfile?.email
        },
        capacity: {
          current: newCount,
          max: activity.max_participants,
          available: activity.max_participants - (newCount || 0)
        },
        payment_info: {
          amount_due: activity.cost,
          payment_timing: 'Payment will be deducted when attendance is marked as present',
          payment_processed: false
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
