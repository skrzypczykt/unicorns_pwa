// Wspólne typy dla modułu płatności

export type PaymentMethod = 'default' | 'blik' | 'pbl' | 'card'

export interface PaymentRequest {
  amount: number
  currency: string
  description: string
  userId: string
  registrationId: string
  returnUrl: string
  customerEmail?: string
  paymentMethod?: PaymentMethod
  blikCode?: string // Dla BLIK (6 cyfr)
}

export interface PaymentResponse {
  redirectUrl: string
  transactionId: string
  providerTransactionId?: string
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transactionId: string
  providerTransactionId?: string
  amount?: number
  currency?: string
  metadata?: Record<string, any>
}

export interface WebhookPayload {
  rawBody: string
  signature?: string
  headers: Record<string, string>
}
