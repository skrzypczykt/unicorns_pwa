import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Webhook endpoint dla Autopay ITN (Instant Transaction Notification)
 *
 * Ten endpoint obsługuje powiadomienia o statusie płatności wysyłane przez Autopay.
 * URL tego endpointa musi być skonfigurowany w panelu Autopay jako "ITN URL".
 */

serve(async (req) => {
  try {
    console.log('[Autopay Webhook] VERSION 2026-04-24-11:45 - Received notification')

    // 1. Odczytaj body (URL-encoded)
    const rawBody = await req.text()
    console.log('[Autopay Webhook] Raw body:', rawBody)

    // 2. Dekoduj URL-encoded body (format: transactions=BASE64_XML)
    const urlParams = new URLSearchParams(rawBody)
    const transactionsBase64 = urlParams.get('transactions')

    if (!transactionsBase64) {
      console.error('[Autopay Webhook] Missing transactions parameter')
      return new Response('NOTOK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // 3. Dekoduj Base64 → XML
    const xmlDecoded = atob(transactionsBase64)
    console.log('[Autopay Webhook] Decoded XML:', xmlDecoded)

    // 4. Parsuj XML z ITN
    const data = parseITN(xmlDecoded)

    // 3. Weryfikuj hash
    const sharedKeyRaw = Deno.env.get('AUTOPAY_SHARED_KEY') ?? ''
    const sharedKey = sharedKeyRaw.trim() // Remove whitespace
    console.log('[Autopay Webhook] SharedKey SHA256:',
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sharedKey))))
        .map(b => b.toString(16).padStart(2, '0')).join(''))
    const isValid = await verifyHash(data, sharedKey)

    if (!isValid) {
      console.error('[Autopay Webhook] Invalid hash')
      return new Response('NOTOK', {
        status: 200, // Autopay wymaga 200 nawet przy błędzie
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    console.log('[Autopay Webhook] Hash verified, processing transaction:', data.orderId)

    // 4. Utwórz klienta Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 5. Znajdź transakcję - SELECT tylko potrzebne pola (szybciej niż JOIN)
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, status, registration_id')
      .eq('provider_transaction_id', data.orderId)
      .single()

    if (txError || !transaction) {
      return new Response('NOTOK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
    }

    // 6. Mapuj status i sprawdź deduplication
    const status = mapAutopayStatus(data.paymentStatus)

    // DEDUPLICATION: zwróć OK natychmiast
    if ((transaction.status === 'completed' || transaction.status === 'failed') && transaction.status === status) {
      return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
    }

    // 6a. Zwróć OK NATYCHMIAST - Autopay ma timeout ~500ms
    const okResponse = new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })

    // 7. Wykonaj wszystkie UPDATE w tle (fire-and-forget)
    // Autopay już dostał OK więc nie retry'uje, a my dokańczamy przetwarzanie
    const webhookEventId = crypto.randomUUID()

    Promise.all([
      supabase.from('webhook_events').insert({
        id: webhookEventId,
        provider: 'autopay',
        event_type: data.paymentStatus,
        raw_payload: { ...data, xmlDecoded },
        order_id: data.orderId,
        amount: parseFloat(data.amount),
        currency: data.currency,
        payment_status: data.paymentStatus.toLowerCase() === 'success' ? 'success' :
                        data.paymentStatus.toLowerCase() === 'failure' ? 'failed' : 'pending',
        signature_valid: true,
        registration_id: transaction.registration_id,
        processed_status: 'success'
      }),
      supabase
        .from('transactions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', transaction.id),
      status === 'completed' && transaction.registration_id
        ? supabase.from('registrations').update({ payment_status: 'paid' }).eq('id', transaction.registration_id)
        : Promise.resolve()
    ]).catch(err => console.error('[Autopay Webhook] Background update error:', err))

    return okResponse
  } catch (error) {
    console.error('[Autopay Webhook] Error:', error)
    return new Response('NOTOK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
})

/**
 * Parsuje XML z ITN
 */
function parseITN(xml: string): {
  serviceId: string
  orderId: string
  remoteId: string
  amount: string
  currency: string
  gatewayId: string
  paymentDate: string
  paymentStatus: string
  paymentStatusDetails: string
  hash: string
} {
  const extractValue = (tag: string): string => {
    const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i'))
    return match ? match[1].trim() : ''
  }

  return {
    serviceId: extractValue('serviceID'),
    orderId: extractValue('orderID'),
    remoteId: extractValue('remoteID'),
    amount: extractValue('amount'),
    currency: extractValue('currency'),
    gatewayId: extractValue('gatewayID'),
    paymentDate: extractValue('paymentDate'),
    paymentStatus: extractValue('paymentStatus'),
    paymentStatusDetails: extractValue('paymentStatusDetails'),
    hash: extractValue('hash')
  }
}

/**
 * Weryfikuje hash z Autopay
 */
async function verifyHash(
  data: ReturnType<typeof parseITN>,
  sharedKey: string
): Promise<boolean> {
  // Hash ITN: zgodnie z dokumentacją Autopay - pomijamy puste wartości
  // Kolejność: ServiceID|OrderID|RemoteID|Amount|Currency|[GatewayID]|PaymentDate|PaymentStatus|[PaymentStatusDetails]|SharedKey
  const hashParts: string[] = [
    data.serviceId,
    data.orderId,
    data.remoteId,
    data.amount,
    data.currency
  ]

  // GatewayID - tylko jeśli niepuste
  if (data.gatewayId) {
    hashParts.push(data.gatewayId)
  }

  // PaymentDate i PaymentStatus - zawsze
  hashParts.push(data.paymentDate)
  hashParts.push(data.paymentStatus)

  // PaymentStatusDetails - tylko jeśli niepuste
  if (data.paymentStatusDetails) {
    hashParts.push(data.paymentStatusDetails)
  }

  // SharedKey na końcu
  hashParts.push(sharedKey)

  const hashInput = hashParts.join('|')

  console.log('[Autopay Webhook] Hash input:', hashInput.replace(sharedKey, '***'))
  console.log('[Autopay Webhook] Parsed data:', JSON.stringify(data, null, 2))

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(hashInput)
  )
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  console.log('[Autopay Webhook] Expected hash:', data.hash.toLowerCase())
  console.log('[Autopay Webhook] Computed hash:', computedHash)

  return computedHash === data.hash.toLowerCase()
}

/**
 * Mapuje status Autopay na nasz standardowy status
 */
function mapAutopayStatus(
  paymentStatus: string
): 'pending' | 'completed' | 'failed' | 'cancelled' {
  switch (paymentStatus.toUpperCase()) {
    case 'PENDING':
    case 'PROCESSING':
      return 'pending'
    case 'SUCCESS':
    case 'COMPLETED':
      return 'completed'
    case 'FAILURE':
    case 'REJECTED':
      return 'failed'
    case 'CANCELLED':
      return 'cancelled'
    default:
      console.warn('[Autopay Webhook] Unknown status:', paymentStatus)
      return 'pending'
  }
}
