import { PaymentRequest, PaymentResponse, PaymentStatus, WebhookPayload } from './types'

/**
 * Abstrakcyjny interfejs dla dostawców płatności
 *
 * Każdy dostawca (Autopay, Stripe, PayPal, etc.) implementuje ten interfejs,
 * dzięki czemu zmiana dostawcy wymaga tylko podmiany implementacji.
 */
export interface PaymentProvider {
  /** Nazwa dostawcy (np. 'autopay', 'stripe') */
  name: string

  /**
   * Inicjuje płatność i zwraca URL do przekierowania użytkownika
   */
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>

  /**
   * Przetwarza webhook od dostawcy płatności (ITN/IPN)
   * Parsuje dane i zwraca ustandaryzowany status
   */
  handleWebhook(payload: WebhookPayload): Promise<PaymentStatus>

  /**
   * Weryfikuje autentyczność webhooka (podpis/hash)
   */
  verifyWebhookSignature(payload: WebhookPayload): Promise<boolean>

  /**
   * Opcjonalnie: sprawdza aktualny status płatności (dla polling)
   */
  checkPaymentStatus?(transactionId: string): Promise<PaymentStatus>
}
