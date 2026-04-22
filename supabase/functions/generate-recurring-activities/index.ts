import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

// Decode JWT without verification (we trust the token from Supabase)
function decodeJWT(token: string): any {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  const payload = parts[1]
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(decoded)
}

// Calculate next occurrence for new-style templates (day of week + time)
// Returns the nearest occurrence within the next 7 days
function calculateNextOccurrence(dayOfWeek: string, time: string): Date {
  const now = new Date()
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const targetDay = daysOfWeek.indexOf(dayOfWeek)

  if (targetDay === -1) {
    throw new Error(`Invalid day of week: ${dayOfWeek}`)
  }

  const currentDay = now.getDay()
  let daysUntilTarget = targetDay - currentDay

  // If target day is today or already passed this week, get next week's occurrence
  // BUT: if it's today and the time hasn't passed yet, use today
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7
  } else if (daysUntilTarget === 0) {
    // It's today - check if time has passed
    const [hours, minutes, seconds = '0'] = time.split(':')
    const targetTime = new Date(now)
    targetTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'), 0)

    if (now >= targetTime) {
      // Time already passed today, get next week
      daysUntilTarget = 7
    }
  }

  const nextDate = new Date(now)
  nextDate.setDate(now.getDate() + daysUntilTarget)

  // Set the time
  const [hours, minutes, seconds = '0'] = time.split(':')
  nextDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'), 0)

  return nextDate
}

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
    // Get and decode the JWT token (ES256 tokens can't be verified with SERVICE_ROLE_KEY)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    let userId: string

    try {
      const payload = decodeJWT(token)
      userId = payload.sub

      if (!userId) {
        throw new Error('Missing user ID in token')
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Verify user exists and is admin
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    if (!template.is_recurring) {
      return new Response(
        JSON.stringify({ error: 'Activity is not recurring' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Detect template format
    const isOldStyle = template.date_time && !template.recurrence_day_of_week
    const isNewStyle = !template.date_time && template.recurrence_day_of_week && template.recurrence_time

    if (!isOldStyle && !isNewStyle) {
      return new Response(
        JSON.stringify({ error: 'Invalid template format: must have either date_time (old) or day/time (new)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    const instances = []
    let startDate: Date

    // Calculate start date based on template format
    if (isOldStyle) {
      // Old-style template: use date_time as base
      startDate = new Date(template.date_time)
    } else {
      // New-style template: calculate next occurrence from day/time
      startDate = calculateNextOccurrence(template.recurrence_day_of_week, template.recurrence_time)
    }

    // Handle end date (can be NULL for infinite recurrence)
    const endDate = template.recurrence_end_date
      ? new Date(template.recurrence_end_date)
      : null

    // LIMIT: Generuj max 8 tygodni do przodu od teraz
    const maxFutureDate = new Date()
    maxFutureDate.setDate(maxFutureDate.getDate() + 56) // 8 tygodni = 56 dni

    // Użyj wcześniejszej daty: końcowa data serii LUB 8 tygodni od teraz
    // Dla nieskończonych serii (endDate = null), generuj do 8 tygodni
    const effectiveEndDate = endDate
      ? (endDate < maxFutureDate ? endDate : maxFutureDate)
      : maxFutureDate

    let currentDate = new Date(startDate)
    let count = 0
    const MAX_INSTANCES = 52 // Limit bezpieczeństwa: max 52 instancje

    // Dla starego stylu: pomiń pierwszą datę (szablon już istnieje jako parent)
    // Dla nowego stylu: zaczynamy od pierwszej daty (template nie ma date_time)
    if (isOldStyle) {
      if (template.recurrence_pattern === 'weekly') {
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      } else if (template.recurrence_pattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
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
        recurrence_end_date: null,
        recurrence_day_of_week: null,
        recurrence_time: null
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
