import { PaymentProvider } from './PaymentProvider'
import { PaymentRequest, PaymentResponse } from './types'

/**
 * Serwis płatności - używa aktualnie skonfigurowanego providera
 *
 * Dzięki temu cała aplikacja używa PaymentService,
 * a zmiana dostawcy wymaga tylko zmiany providera w konfiguracji.
 */
export class PaymentService {
  private provider: PaymentProvider

  constructor(provider: PaymentProvider) {
    this.provider = provider
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    return await this.provider.initiatePayment(request)
  }

  getProviderName(): string {
    return this.provider.name
  }

  // Dodatkowe metody pomocnicze mogą być tutaj
}
