import { PaymentProvider } from '../PaymentProvider'
import {
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  WebhookPayload
} from '../types'

interface AutopayConfig {
  serviceId: string
  sharedKey: string
  gatewayUrl: string
}

/**
 * Implementacja PaymentProvider dla Autopay (Blue Media)
 *
 * Dokumentacja: https://developers.bluemedia.pl/
 */
export class AutopayProvider implements PaymentProvider {
  name = 'autopay'

  private serviceId: string
  private sharedKey: string
  private gatewayUrl: string

  constructor(config: AutopayConfig) {
    this.serviceId = config.serviceId
    this.sharedKey = config.sharedKey
    this.gatewayUrl = config.gatewayUrl
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 1. Wygeneruj unikalny OrderID
    const orderId = `${request.registrationId}-${Date.now()}`

    // 2. Przygotuj parametry transakcji
    const amount = (request.amount * 100).toString() // grosze
    const params: Record<string, string> = {
      ServiceID: this.serviceId,
      OrderID: orderId,
      Amount: amount,
      Description: request.description,
      CustomerEmail: request.customerEmail || '',
      CustomerIP: '', // Opcjonalnie
      Title: request.description,
      ValidityTime: '', // Opcjonalnie - czas ważności transakcji
      Hash: this.generateHash([
        this.serviceId,
        orderId,
        amount
      ])
    }

    // 3. BLIK - wymaga WhiteLabel mode (GatewayID=509)
    if (request.paymentMethod === 'blik' && request.blikCode) {
      params.GatewayID = '509' // BLIK w trybie WhiteLabel
      params.AuthorizationCode = request.blikCode
    }

    // 4. PBL - TEST 106 (test PayByLink)
    if (request.paymentMethod === 'pbl') {
      params.GatewayID = '106' // TEST PBL
    }

    // 5. Zbuduj URL przekierowania do bramki
    const queryString = new URLSearchParams(params).toString()
    const redirectUrl = `${this.gatewayUrl}?${queryString}`

    return {
      redirectUrl,
      transactionId: orderId,
      providerTransactionId: orderId
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<PaymentStatus> {
    // Autopay wysyła webhook w formacie XML (ITN - Instant Transaction Notification)
    const data = this.parseITN(payload.rawBody)

    // Mapuj status Autopay na nasz standardowy status
    const status = this.mapAutopayStatus(data.paymentStatus)

    return {
      status,
      transactionId: data.orderId,
      providerTransactionId: data.remoteId,
      amount: parseFloat(data.amount) / 100, // z groszy na złote
      currency: data.currency,
      metadata: {
        gatewayId: data.gatewayId,
        paymentDate: data.paymentDate,
        paymentStatusDetails: data.paymentStatusDetails
      }
    }
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    const data = this.parseITN(payload.rawBody)

    // Zbuduj hash zgodnie z dokumentacją Autopay
    const expectedHash = this.generateHash([
      data.serviceId,
      data.orderId,
      data.remoteId,
      data.amount,
      data.currency,
      data.gatewayId,
      data.paymentDate,
      data.paymentStatus,
      data.paymentStatusDetails
    ])

    return data.hash === expectedHash
  }

  /**
   * Generuje hash SHA256 zgodnie z wymaganiami Autopay
   */
  private generateHash(params: string[]): string {
    // Node.js/Deno crypto
    if (typeof window === 'undefined') {
      // Środowisko Node/Deno
      const crypto = require('crypto')
      const concatenated = params.join('|') + '|' + this.sharedKey
      return crypto.createHash('sha256').update(concatenated).digest('hex')
    } else {
      // Środowisko przeglądarki - nie powinno być używane
      // (hash generujemy tylko po stronie serwera)
      throw new Error('Hash generation not available in browser')
    }
  }

  /**
   * Parsuje XML z ITN (Instant Transaction Notification)
   *
   * Przykład XML:
   * <transactions>
   *   <transaction>
   *     <serviceID>123</serviceID>
   *     <orderID>order-123</orderID>
   *     <remoteID>BM-456</remoteID>
   *     <amount>10000</amount>
   *     <currency>PLN</currency>
   *     <gatewayID>1</gatewayID>
   *     <paymentDate>2024-01-01 12:00:00</paymentDate>
   *     <paymentStatus>SUCCESS</paymentStatus>
   *     <paymentStatusDetails>STATUS OK</paymentStatusDetails>
   *     <hash>abc123...</hash>
   *   </transaction>
   * </transactions>
   */
  private parseITN(xml: string): {
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
    // Prosty parser XML (w produkcji użyj biblioteki jak xml2js lub fast-xml-parser)
    const extractValue = (tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`))
      return match ? match[1] : ''
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
   * Mapuje status Autopay na nasz standardowy status
   */
  private mapAutopayStatus(
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
        return 'pending'
    }
  }
}
