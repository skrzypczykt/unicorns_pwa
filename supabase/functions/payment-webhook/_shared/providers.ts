// Payment Provider Configurations and Signature Verification
// Supports: Autopay, Stripe, PayU, Tpay

import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

export type PaymentProvider = 'autopay' | 'stripe' | 'payu' | 'tpay'

export interface PaymentData {
  orderId: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending' | 'refunded'
  customerEmail?: string
  customData?: Record<string, any>
}

/**
 * Detect payment provider from request
 */
export function detectProvider(req: Request): PaymentProvider | null {
  const url = new URL(req.url)
  const pathname = url.pathname

  // Check URL path
  if (pathname.includes('/autopay')) return 'autopay'
  if (pathname.includes('/stripe')) return 'stripe'
  if (pathname.includes('/payu')) return 'payu'
  if (pathname.includes('/tpay')) return 'tpay'

  // Check headers
  const stripeSignature = req.headers.get('stripe-signature')
  if (stripeSignature) return 'stripe'

  const userAgent = req.headers.get('user-agent')?.toLowerCase() || ''
  if (userAgent.includes('autopay')) return 'autopay'
  if (userAgent.includes('payu')) return 'payu'
  if (userAgent.includes('tpay')) return 'tpay'

  return null
}

/**
 * Verify webhook signature for Autopay (Blue Media)
 * Uses SHA256 HMAC
 */
export function verifyAutopaySignature(
  payload: Record<string, any>,
  receivedHash: string,
  sharedKey: string
): boolean {
  try {
    // Autopay hash format: ServiceID|OrderID|Amount|Currency|GatewayID|...
    const hashString = [
      payload.ServiceID,
      payload.OrderID,
      payload.RemoteID,
      payload.Amount,
      payload.Currency,
      payload.GatewayID,
      payload.PaymentDate,
      payload.PaymentStatus,
      payload.PaymentStatusDetails,
      sharedKey
    ].join('|')

    const computed = createHmac('sha256', sharedKey)
      .update(hashString)
      .digest('hex')

    return computed === receivedHash
  } catch (error) {
    console.error('Autopay signature verification error:', error)
    return false
  }
}

/**
 * Verify webhook signature for Stripe
 * Uses Stripe's webhook secret and timestamp validation
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Stripe signature format: t=timestamp,v1=signature1,v1=signature2
    const elements = signature.split(',')
    const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1]
    const signatures = elements.filter(e => e.startsWith('v1='))

    if (!timestamp || signatures.length === 0) return false

    // Check timestamp (max 5 minutes old)
    const currentTime = Math.floor(Date.now() / 1000)
    const timestampNum = parseInt(timestamp, 10)
    if (currentTime - timestampNum > 300) {
      console.warn('Stripe webhook too old')
      return false
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex')

    // Check if any provided signature matches
    return signatures.some(sig => {
      const providedSig = sig.split('=')[1]
      return providedSig === expectedSignature
    })
  } catch (error) {
    console.error('Stripe signature verification error:', error)
    return false
  }
}

/**
 * Verify webhook signature for PayU
 * Uses MD5 or SHA256
 */
export function verifyPayUSignature(
  payload: Record<string, any>,
  receivedSignature: string,
  secondKey: string
): boolean {
  try {
    // PayU signature algorithm (can vary by merchant config)
    // Common format: MD5(value + currency + merchantId + merchantPosId + orderId + refReqId + secondKey)

    const signString = [
      payload.order?.currencyCode,
      payload.order?.totalAmount,
      payload.order?.orderId,
      secondKey
    ].filter(Boolean).join('')

    // Try MD5 first (legacy)
    const md5Hash = createHmac('md5', '')
      .update(signString)
      .digest('hex')

    if (md5Hash === receivedSignature) return true

    // Try SHA256 (newer)
    const sha256Hash = createHmac('sha256', secondKey)
      .update(signString)
      .digest('hex')

    return sha256Hash === receivedSignature
  } catch (error) {
    console.error('PayU signature verification error:', error)
    return false
  }
}

/**
 * Verify webhook signature for Tpay
 * Uses MD5 checksum
 */
export function verifyTpaySignature(
  payload: Record<string, any>,
  receivedChecksum: string,
  securityCode: string
): boolean {
  try {
    // Tpay checksum format (varies by notification type)
    // Basic format: MD5(id + tr_id + tr_amount + tr_crc + security_code)

    const checksumString = [
      payload.id,
      payload.tr_id,
      payload.tr_amount,
      payload.tr_crc,
      securityCode
    ].filter(Boolean).join('')

    const computed = createHmac('md5', '')
      .update(checksumString)
      .digest('hex')

    return computed === receivedChecksum
  } catch (error) {
    console.error('Tpay signature verification error:', error)
    return false
  }
}

/**
 * Parse payment data from provider-specific payload
 */
export function parsePaymentData(provider: PaymentProvider, payload: any): PaymentData | null {
  try {
    switch (provider) {
      case 'autopay':
        return {
          orderId: payload.OrderID || payload.RemoteID,
          amount: parseFloat(payload.Amount) / 100, // Autopay sends in grosze
          currency: payload.Currency || 'PLN',
          status: mapAutopayStatus(payload.PaymentStatus),
          customerEmail: payload.CustomerEmail,
          customData: payload.CustomData ? JSON.parse(payload.CustomData) : null
        }

      case 'stripe':
        const stripeData = payload.data?.object
        return {
          orderId: stripeData?.metadata?.order_id || stripeData?.id,
          amount: (stripeData?.amount || 0) / 100, // Stripe sends in cents
          currency: (stripeData?.currency || 'pln').toUpperCase(),
          status: mapStripeStatus(payload.type),
          customerEmail: stripeData?.receipt_email || stripeData?.customer_email,
          customData: stripeData?.metadata
        }

      case 'payu':
        const payuOrder = payload.order
        return {
          orderId: payuOrder?.orderId || payuOrder?.extOrderId,
          amount: parseFloat(payuOrder?.totalAmount) / 100, // PayU sends in grosze
          currency: payuOrder?.currencyCode || 'PLN',
          status: mapPayUStatus(payload.order?.status),
          customerEmail: payuOrder?.buyer?.email,
          customData: { payuOrderId: payuOrder?.orderId }
        }

      case 'tpay':
        return {
          orderId: payload.tr_crc || payload.id,
          amount: parseFloat(payload.tr_amount),
          currency: 'PLN',
          status: mapTpayStatus(payload.tr_status),
          customerEmail: payload.tr_email,
          customData: { tpayId: payload.tr_id }
        }

      default:
        return null
    }
  } catch (error) {
    console.error(`Error parsing ${provider} payment data:`, error)
    return null
  }
}

// Status mapping functions
function mapAutopayStatus(status: string): PaymentData['status'] {
  switch (status) {
    case 'SUCCESS': return 'success'
    case 'FAILURE': return 'failed'
    case 'PENDING': return 'pending'
    default: return 'pending'
  }
}

function mapStripeStatus(eventType: string): PaymentData['status'] {
  if (eventType.includes('succeeded')) return 'success'
  if (eventType.includes('failed')) return 'failed'
  if (eventType.includes('refund')) return 'refunded'
  return 'pending'
}

function mapPayUStatus(status: string): PaymentData['status'] {
  switch (status?.toUpperCase()) {
    case 'COMPLETED': return 'success'
    case 'CANCELED': return 'failed'
    case 'PENDING': return 'pending'
    default: return 'pending'
  }
}

function mapTpayStatus(status: string): PaymentData['status'] {
  switch (status) {
    case 'TRUE': return 'success'
    case 'FALSE': return 'failed'
    default: return 'pending'
  }
}
