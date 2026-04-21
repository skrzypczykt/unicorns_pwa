// Universal Payment Webhook - Supports multiple payment providers
// Autopay (Blue Media), Stripe, PayU, Tpay

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import {
  detectProvider,
  parsePaymentData,
  verifyAutopaySignature,
  verifyStripeSignature,
  verifyPayUSignature,
  verifyTpaySignature,
  type PaymentProvider
} from './_shared/providers.ts'

serve(async (req) => {
  // Get CORS headers
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  console.log('=== Payment Webhook Received ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  try {
    // Only accept POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Detect payment provider
    const provider = detectProvider(req)
    if (!provider) {
      console.error('Could not detect payment provider')
      return new Response(
        JSON.stringify({ error: 'Unknown payment provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Detected provider:', provider)

    // Parse request body
    const contentType = req.headers.get('content-type') || ''
    let payload: any

    if (contentType.includes('application/json')) {
      payload = await req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      payload = Object.fromEntries(new URLSearchParams(text))
    } else {
      const text = await req.text()
      try {
        payload = JSON.parse(text)
      } catch {
        payload = Object.fromEntries(new URLSearchParams(text))
      }
    }

    console.log('Payload received (type):', typeof payload)

    // Verify signature based on provider
    const isValid = await verifySignature(provider, req, payload)

    if (!isValid) {
      console.error('Signature verification failed for', provider)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Signature verified')

    // Parse payment data
    const paymentData = parsePaymentData(provider, payload)
    if (!paymentData) {
      console.error('Failed to parse payment data')
      return new Response(
        JSON.stringify({ error: 'Invalid payment data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Payment data:', {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      status: paymentData.status
    })

    // Log webhook event to database
    const webhookEventId = await logWebhookEvent(
      provider,
      payload,
      req.headers,
      paymentData,
      isValid
    )

    // Process payment
    const result = await processPayment(paymentData, provider, webhookEventId)

    if (!result.success) {
      console.error('Payment processing failed:', result.error)
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Payment processed successfully')

    // Return provider-specific response
    return new Response(
      getProviderResponse(provider, result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': getProviderContentType(provider) }
      }
    )
  } catch (error: any) {
    console.error('Payment webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Verify webhook signature based on provider
 */
async function verifySignature(
  provider: PaymentProvider,
  req: Request,
  payload: any
): Promise<boolean> {
  switch (provider) {
    case 'autopay': {
      const hash = payload.Hash || req.headers.get('x-autopay-hash')
      const sharedKey = Deno.env.get('AUTOPAY_SHARED_KEY') || ''
      if (!hash || !sharedKey) return false
      return verifyAutopaySignature(payload, hash, sharedKey)
    }

    case 'stripe': {
      const signature = req.headers.get('stripe-signature')
      const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      if (!signature || !secret) return false
      const rawBody = JSON.stringify(payload)
      return verifyStripeSignature(rawBody, signature, secret)
    }

    case 'payu': {
      const signature = req.headers.get('openpayu-signature')
      const secondKey = Deno.env.get('PAYU_SECOND_KEY') || ''
      if (!signature || !secondKey) return false
      const parts = signature.split(';')
      const sigValue = parts.find(p => p.startsWith('signature='))?.split('=')[1]
      return verifyPayUSignature(payload, sigValue || '', secondKey)
    }

    case 'tpay': {
      const checksum = payload.md5sum
      const securityCode = Deno.env.get('TPAY_SECURITY_CODE') || ''
      if (!checksum || !securityCode) return false
      return verifyTpaySignature(payload, checksum, securityCode)
    }

    default:
      return false
  }
}

/**
 * Log webhook event to database for audit
 */
async function logWebhookEvent(
  provider: PaymentProvider,
  payload: any,
  headers: Headers,
  paymentData: any,
  signatureValid: boolean
): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert headers to object
    const headersObj: Record<string, string> = {}
    headers.forEach((value, key) => {
      // Don't log sensitive headers
      if (!key.toLowerCase().includes('secret') && !key.toLowerCase().includes('key')) {
        headersObj[key] = value
      }
    })

    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        provider,
        raw_payload: payload,
        headers: headersObj,
        order_id: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_status: paymentData.status,
        signature_valid: signatureValid,
        processed_status: 'processing'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to log webhook event:', error)
      return ''
    }

    return data.id
  } catch (error) {
    console.error('Error logging webhook:', error)
    return ''
  }
}

/**
 * Process payment and update database
 */
async function processPayment(
  paymentData: any,
  provider: PaymentProvider,
  webhookEventId: string
): Promise<{ success: boolean; error?: string; registrationId?: string }> {
  try {
    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract registration ID from orderId (format: reg_{uuid} or just uuid)
    const registrationId = paymentData.orderId.replace('reg_', '')

    console.log('Looking for registration:', registrationId)

    // Get registration details
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*, activities(*), users(*)')
      .eq('id', registrationId)
      .single()

    if (regError || !registration) {
      console.error('Registration not found:', regError)
      return { success: false, error: 'Registration not found' }
    }

    console.log('Found registration for user:', registration.users?.display_name)

    // Check for duplicate webhook (idempotency)
    const { data: isDuplicate } = await supabase
      .rpc('is_webhook_duplicate', {
        order_id_param: paymentData.orderId,
        provider_param: provider
      })

    if (isDuplicate) {
      console.log('⚠️ Duplicate webhook detected - skipping processing')

      // Update webhook event status
      if (webhookEventId) {
        await supabase
          .from('webhook_events')
          .update({ processed_status: 'duplicate', processed_at: new Date().toISOString() })
          .eq('id', webhookEventId)
      }

      return { success: true, registrationId } // Return success to stop retries
    }

    // Check payment status
    if (paymentData.status === 'success') {
      // Update registration payment status
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (updateError) {
        console.error('Failed to update registration:', updateError)

        // Update webhook event with error
        if (webhookEventId) {
          await supabase
            .from('webhook_events')
            .update({
              processed_status: 'failed',
              error_message: updateError.message,
              processed_at: new Date().toISOString()
            })
            .eq('id', webhookEventId)
        }

        return { success: false, error: 'Failed to update registration' }
      }

      // Add transaction to balance_transactions
      const { error: transactionError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: registration.user_id,
          activity_type_id: registration.activities?.activity_type_id,
          amount: paymentData.amount,
          type: 'class_payment',
          description: `Płatność za zajęcia: ${registration.activities?.name}`,
          reference_id: registrationId,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('Failed to create transaction:', transactionError)
        // Don't fail - registration is already marked as paid
      }

      console.log('✅ Payment recorded successfully')

      // Update webhook event status
      if (webhookEventId) {
        await supabase
          .from('webhook_events')
          .update({
            processed_status: 'success',
            processed_at: new Date().toISOString(),
            registration_id: registrationId,
            user_id: registration.user_id
          })
          .eq('id', webhookEventId)
      }

      // TODO: Send confirmation email/push notification

      return { success: true, registrationId }

    } else if (paymentData.status === 'failed') {
      // Update registration to failed
      await supabase
        .from('registrations')
        .update({
          payment_status: 'failed'
        })
        .eq('id', registrationId)

      console.log('⚠️ Payment failed - registration updated')

      return { success: true, registrationId }

    } else {
      // Pending status - no action needed
      console.log('ℹ️ Payment pending')
      return { success: true, registrationId }
    }

  } catch (error: any) {
    console.error('Process payment error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get provider-specific response format
 */
function getProviderResponse(provider: PaymentProvider, result: any): string {
  switch (provider) {
    case 'autopay':
      return 'OK' // Autopay expects simple "OK"

    case 'stripe':
      return JSON.stringify({ received: true })

    case 'payu':
      return JSON.stringify({ status: 'SUCCESS' })

    case 'tpay':
      return 'TRUE' // Tpay expects "TRUE"

    default:
      return JSON.stringify({ success: true })
  }
}

/**
 * Get provider-specific content type
 */
function getProviderContentType(provider: PaymentProvider): string {
  switch (provider) {
    case 'autopay':
    case 'tpay':
      return 'text/plain'

    default:
      return 'application/json'
  }
}
