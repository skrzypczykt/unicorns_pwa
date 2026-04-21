// Rainbow Unicorn Sports - Process Attendance Edge Function
// Marks attendance and processes payment when user is marked as "present"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

interface AttendanceRecord {
  user_id: string
  status: 'present' | 'absent'
  notes?: string
}

interface RequestBody {
  activity_id: string
  attendances: AttendanceRecord[]
}

serve(async (req) => {
  // Get CORS headers based on request origin
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

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
    const { activity_id, attendances } = body

    if (!activity_id || !attendances || !Array.isArray(attendances)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is trainer for this activity or admin
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: activity } = await supabaseAdmin
      .from('activities')
      .select('trainer_id, cost, name')
      .eq('id', activity_id)
      .single()

    if (!activity) {
      return new Response(
        JSON.stringify({ error: 'Activity not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isAdmin = userProfile?.role === 'admin'
    const isTrainerForActivity = activity.trainer_id === user.id && userProfile?.role === 'trainer'

    if (!isAdmin && !isTrainerForActivity) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: You are not authorized to mark attendance for this activity' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each attendance record
    const results = []
    const errors = []

    for (const attendance of attendances) {
      try {
        // Get registration
        const { data: registration } = await supabaseAdmin
          .from('registrations')
          .select('id, payment_status')
          .eq('activity_id', activity_id)
          .eq('user_id', attendance.user_id)
          .eq('status', 'registered')
          .single()

        if (!registration) {
          errors.push({
            user_id: attendance.user_id,
            error: 'Registration not found or already processed'
          })
          continue
        }

        // Insert or update attendance record
        const { data: attendanceRecord, error: attendanceError } = await supabaseAdmin
          .from('attendance')
          .upsert({
            activity_id,
            user_id: attendance.user_id,
            registration_id: registration.id,
            marked_by: user.id,
            status: attendance.status,
            notes: attendance.notes || null,
            marked_at: new Date().toISOString()
          }, {
            onConflict: 'activity_id,user_id'
          })
          .select()
          .single()

        if (attendanceError) {
          errors.push({
            user_id: attendance.user_id,
            error: attendanceError.message
          })
          continue
        }

        // If marked as PRESENT and payment not yet paid, mark as paid
        if (attendance.status === 'present' && registration.payment_status !== 'paid') {
          // Get user's current balance
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('balance, display_name')
            .eq('id', attendance.user_id)
            .single()

          if (!userData) {
            errors.push({
              user_id: attendance.user_id,
              error: 'User not found'
            })
            continue
          }

          const currentBalance = parseFloat(userData.balance)
          const cost = parseFloat(activity.cost)

          // Check if user has sufficient balance
          if (currentBalance < cost) {
            errors.push({
              user_id: attendance.user_id,
              error: `Insufficient balance: ${currentBalance} PLN < ${cost} PLN`,
              warning: 'Attendance marked but payment failed'
            })
            // Still mark attendance but flag the payment issue
            await supabaseAdmin
              .from('registrations')
              .update({ status: 'attended' })
              .eq('id', registration.id)
            continue
          }

          const newBalance = currentBalance - cost

          // Update user balance
          const { error: balanceError } = await supabaseAdmin
            .from('users')
            .update({
              balance: newBalance,
              balance_updated_at: new Date().toISOString()
            })
            .eq('id', attendance.user_id)

          if (balanceError) {
            errors.push({
              user_id: attendance.user_id,
              error: `Failed to update balance: ${balanceError.message}`
            })
            continue
          }

          // Create balance transaction record
          await supabaseAdmin
            .from('balance_transactions')
            .insert({
              user_id: attendance.user_id,
              amount: -cost,
              balance_before: currentBalance,
              balance_after: newBalance,
              type: 'class_payment',
              reference_id: activity_id,
              description: `Płatność za zajęcia: ${activity.name}`,
              created_by: user.id
            })

          // Update registration status
          await supabaseAdmin
            .from('registrations')
            .update({
              status: 'attended',
              payment_status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', registration.id)

          // Create audit log entry
          await supabaseAdmin
            .from('audit_log')
            .insert({
              user_id: user.id,
              action: 'mark_attendance_and_process_payment',
              table_name: 'attendance',
              record_id: attendanceRecord.id,
              new_values: {
                attendance_user_id: attendance.user_id,
                status: attendance.status,
                payment_status: 'paid',
                amount_charged: cost,
                new_balance: newBalance
              }
            })

          results.push({
            user_id: attendance.user_id,
            user_name: userData.display_name,
            status: attendance.status,
            payment_status: 'paid',
            amount_charged: cost,
            new_balance: newBalance
          })
        } else if (attendance.status === 'absent') {
          // Mark as no-show, no payment
          await supabaseAdmin
            .from('registrations')
            .update({ status: 'no_show' })
            .eq('id', registration.id)

          results.push({
            user_id: attendance.user_id,
            status: attendance.status,
            payment_status: 'pending'
          })
        } else {
          // Already processed
          results.push({
            user_id: attendance.user_id,
            status: attendance.status,
            payment_status: registration.payment_status,
            note: 'Already processed'
          })
        }
      } catch (error) {
        errors.push({
          user_id: attendance.user_id,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        activity_id,
        results,
        errors: errors.length > 0 ? errors : undefined
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
