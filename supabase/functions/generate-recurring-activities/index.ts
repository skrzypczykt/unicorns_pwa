import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { activityTemplate } = await req.json()

    if (!activityTemplate || !activityTemplate.id) {
      return new Response(
        JSON.stringify({ error: 'Missing activityTemplate or id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!template.is_recurring || !template.recurrence_end_date) {
      return new Response(
        JSON.stringify({ error: 'Activity is not recurring or missing end date' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const instances = []
    const startDate = new Date(template.date_time)
    const endDate = new Date(template.recurrence_end_date)
    let currentDate = new Date(startDate)
    let count = 0
    const MAX_INSTANCES = 52 // Limit: max 52 instancje (1 rok tygodniowo)

    // Pomiń pierwszą datę (szablon już istnieje jako parent)
    if (template.recurrence_pattern === 'weekly') {
      currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (template.recurrence_pattern === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Generuj instancje
    while (currentDate <= endDate && count < MAX_INSTANCES) {
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
        { headers: { 'Content-Type': 'application/json' } }
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
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: instances.length,
        pattern: template.recurrence_pattern,
        parent_id: template.id
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
