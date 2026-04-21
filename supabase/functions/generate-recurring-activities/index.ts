import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Get CORS headers based on request origin
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    const { activityTemplate } = await req.json()

    if (!activityTemplate || !activityTemplate.id) {
      return new Response(
        JSON.stringify({ error: 'Missing activityTemplate or id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Pobierz szablon wydarzenia
    const { data: template, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityTemplate.id)
      .single()

    if (fetchError || !template) {
      return new Response(
        JSON.stringify({ error: 'Activity template not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    if (!template.is_recurring || !template.recurrence_end_date) {
      return new Response(
        JSON.stringify({ error: 'Activity is not recurring or missing end date' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    const instances = []
    const startDate = new Date(template.date_time)
    const endDate = new Date(template.recurrence_end_date)

    // LIMIT: Generuj max 8 tygodni do przodu od teraz
    const maxFutureDate = new Date()
    maxFutureDate.setDate(maxFutureDate.getDate() + 56) // 8 tygodni = 56 dni

    // Użyj wcześniejszej daty: końcowa data serii LUB 8 tygodni od teraz
    const effectiveEndDate = endDate < maxFutureDate ? endDate : maxFutureDate

    let currentDate = new Date(startDate)
    let count = 0
    const MAX_INSTANCES = 52 // Limit bezpieczeństwa: max 52 instancje

    // Pomiń pierwszą datę (szablon już istnieje jako parent)
    if (template.recurrence_pattern === 'weekly') {
      currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (template.recurrence_pattern === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Generuj instancje do effectiveEndDate (max 8 tygodni)
    while (currentDate <= effectiveEndDate && count < MAX_INSTANCES) {
      instances.push({
        name: template.name,
        description: template.description,
        date_time: currentDate.toISOString(),
        duration_minutes: template.duration_minutes,
        max_participants: template.max_participants,
        cost: template.cost,
        location: template.location,
        trainer_id: template.trainer_id,
        cancellation_hours: template.cancellation_hours,
        status: 'scheduled',
        activity_type_id: template.activity_type_id,
        registration_opens_at: template.registration_opens_at
          ? new Date(new Date(template.registration_opens_at).getTime() +
              (currentDate.getTime() - startDate.getTime())).toISOString()
          : null,
        registration_closes_at: template.registration_closes_at
          ? new Date(new Date(template.registration_closes_at).getTime() +
              (currentDate.getTime() - startDate.getTime())).toISOString()
          : null,
        parent_activity_id: template.id,
        is_recurring: false,
        recurrence_pattern: 'none',
        recurrence_end_date: null
      })

      // Przesuń datę
      if (template.recurrence_pattern === 'weekly') {
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      } else if (template.recurrence_pattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      count++
    }

    if (instances.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No instances to create', created: 0 }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Wstaw wszystkie instancje
    const { data, error: insertError } = await supabase
      .from('activities')
      .insert(instances)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: instances.length,
        pattern: template.recurrence_pattern,
        parent_id: template.id
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})
