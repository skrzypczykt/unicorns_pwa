import { AutopayProvider } from './providers/AutopayProvider'
import { PaymentProvider } from './PaymentProvider'

/**
 * Konfiguracja aktualnego dostawcy płatności
 *
 * Aby zmienić dostawcę, wystarczy zwrócić inną implementację PaymentProvider
 */
export function getPaymentProvider(): PaymentProvider {
  // W przyszłości możesz to sterować zmienną środowiskową
  const providerType = import.meta.env.VITE_PAYMENT_PROVIDER || 'autopay'

  switch (providerType) {
    case 'autopay':
      return new AutopayProvider({
        serviceId: import.meta.env.VITE_AUTOPAY_SERVICE_ID || '',
        sharedKey: import.meta.env.VITE_AUTOPAY_SHARED_KEY || '',
        gatewayUrl: import.meta.env.VITE_AUTOPAY_GATEWAY_URL || 'https://pay.bm.pl/payment'
      })

    // case 'stripe':
    //   return new StripeProvider({
    //     apiKey: import.meta.env.VITE_STRIPE_API_KEY || ''
    //   })

    default:
      throw new Error(`Unknown payment provider: ${providerType}`)
  }
}
