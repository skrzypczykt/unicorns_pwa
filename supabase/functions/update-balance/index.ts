// Rainbow Unicorn Sports - Update Balance Edge Function
// Allows admins to manually update user balances

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  amount: number
  description: string
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

    // Verify user is admin
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: RequestBody = await req.json()
    const { user_id, amount, description } = body

    if (!user_id || amount === undefined || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, amount, description' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate amount (prevent extreme values)
    if (Math.abs(amount) > 10000) {
      return new Response(
        JSON.stringify({ error: 'Amount too large. Maximum: ±10,000 PLN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get target user's current balance
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('balance, display_name, email')
      .eq('id', user_id)
      .single()

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentBalance = parseFloat(targetUser.balance)
    const newBalance = currentBalance + amount

    // Prevent negative balance (optional - you can remove this if you want to allow debt)
    if (newBalance < 0) {
      return new Response(
        JSON.stringify({
          error: 'Operation would result in negative balance',
          current_balance: currentBalance,
          attempted_amount: amount,
          would_be: newBalance
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user balance
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        balance: newBalance,
        balance_updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update balance: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create balance transaction record
    const transactionType = amount > 0 ? 'manual_credit' : 'manual_debit'

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('balance_transactions')
      .insert({
        user_id,
        amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        type: transactionType,
        description,
        created_by: user.id
      })
      .select()
      .single()

    if (transactionError) {
      // Rollback balance update
      await supabaseAdmin
        .from('users')
        .update({ balance: currentBalance })
        .eq('id', user_id)

      return new Response(
        JSON.stringify({ error: `Failed to create transaction record: ${transactionError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create audit log entry
    await supabaseAdmin
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'update_balance',
        table_name: 'users',
        record_id: user_id,
        old_values: { balance: currentBalance },
        new_values: {
          balance: newBalance,
          amount,
          description,
          transaction_type: transactionType
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user_id,
          name: targetUser.display_name,
          email: targetUser.email
        },
        balance_before: currentBalance,
        amount,
        balance_after: newBalance,
        transaction_id: transaction.id,
        description
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
