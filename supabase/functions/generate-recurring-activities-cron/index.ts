import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Znajdź wszystkie parent activities (is_recurring = true)
    const { data: templates, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('is_recurring', true)
      .is('parent_activity_id', null)
      .gte('recurrence_end_date', new Date().toISOString()) // Tylko aktywne serie

    if (fetchError) throw fetchError

    let totalCreated = 0

    // Dla każdego szablonu wywołaj funkcję generate-recurring-activities
    for (const template of templates || []) {
      try {
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-recurring-activities`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({ activityId: template.id })
          }
        )

        const result = await response.json()
        if (result.created) {
          totalCreated += result.created
        }
      } catch (error) {
        console.error(`Error generating for ${template.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, totalCreated, processedTemplates: templates?.length || 0 }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Cron error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
