import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Wywołaj funkcję bazodanową aktualizującą status minionych wydarzeń
    const { data, error } = await supabaseAdmin.rpc('update_past_activities_status')

    if (error) {
      console.error('Error updating past activities:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const updatedCount = data?.[0]?.updated_count ?? 0

    console.log(`Updated ${updatedCount} past activities to 'completed' status`)

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        message: `${updatedCount} wydarzeń zaktualizowanych na status 'completed'`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
