import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase/client'

interface PaymentDetails {
  orderId: string
  amount?: number
  status: 'paid' | 'pending' | 'failed' | 'unknown'
  activityName?: string
  activityDate?: string
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      // Get parameters from URL (different providers use different param names)
      const orderId = searchParams.get('OrderID') ||
                      searchParams.get('orderId') ||
                      searchParams.get('order_id') ||
                      searchParams.get('tr_crc')

      if (!orderId) {
        setError('Brak identyfikatora płatności')
        setLoading(false)
        return
      }

      console.log('Verifying payment for orderId:', orderId)

      // Extract registration ID from orderId (format: reg_{uuid})
      const registrationId = orderId.replace('reg_', '').replace('fee_', '').replace('don_', '')

      // Check registration status
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          payment_status,
          paid_at,
          activities (
            name,
            date_time,
            cost
          )
        `)
        .eq('id', registrationId)
        .single()

      if (regError) {
        console.error('Error fetching registration:', regError)

        // Payment might not be processed yet - set as pending
        setPaymentDetails({
          orderId,
          status: 'pending'
        })
        setLoading(false)
        return
      }

      const activity = Array.isArray(registration.activities)
        ? registration.activities[0]
        : registration.activities

      setPaymentDetails({
        orderId,
        amount: activity?.cost,
        status: registration.payment_status === 'paid' ? 'paid' : 'pending',
        activityName: activity?.name,
        activityDate: activity?.date_time
      })

    } catch (err: any) {
      console.error('Payment verification error:', err)
      setError('Nie udało się zweryfikować płatności')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="text-8xl mb-6 animate-spin">💫</div>
          <h1 className="text-2xl font-bold text-purple-600 mb-2">
            Weryfikacja płatności...
          </h1>
          <p className="text-gray-600">
            Sprawdzamy status Twojej płatności
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <div className="text-8xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-orange-600 mb-4">
            Problem z weryfikacją
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/my-classes')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Przejdź do Moich Rezerwacji
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
        {paymentDetails?.status === 'paid' ? (
          // Payment successful
          <>
            <div className="text-center mb-8">
              <div className="text-9xl mb-6 animate-bounce">✅</div>
              <h1 className="text-4xl font-bold text-green-600 mb-3">
                Płatność potwierdzona!
              </h1>
              <p className="text-xl text-gray-600">
                Twoja płatność została pomyślnie przetworzona
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4">
                Szczegóły płatności:
              </h2>

              <div className="space-y-3">
                {paymentDetails.activityName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zajęcia:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentDetails.activityName}
                    </span>
                  </div>
                )}

                {paymentDetails.activityDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(paymentDetails.activityDate)}
                    </span>
                  </div>
                )}

                {paymentDetails.amount && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Kwota:</span>
                    <span className="font-bold text-green-600">
                      {paymentDetails.amount.toFixed(2)} zł
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nr zamówienia:</span>
                  <span className="font-mono text-xs text-gray-500">
                    {paymentDetails.orderId}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Co dalej?</strong><br />
                Potwierdzenie płatności zostało wysłane na Twój adres email.
                Zajęcia zostały dodane do Twoich rezerwacji.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/my-classes')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                📅 Moje Rezerwacje
              </button>
              <button
                onClick={() => navigate('/activities')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                🏃 Zobacz Zajęcia
              </button>
            </div>
          </>
        ) : paymentDetails?.status === 'pending' ? (
          // Payment pending
          <>
            <div className="text-center mb-8">
              <div className="text-9xl mb-6">⏳</div>
              <h1 className="text-4xl font-bold text-orange-600 mb-3">
                Płatność w trakcie
              </h1>
              <p className="text-xl text-gray-600">
                Przetwarzamy Twoją płatność
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
              <p className="text-gray-700 mb-4">
                Twoja płatność jest obecnie przetwarzana. Może to potrwać kilka minut.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Nr zamówienia:</strong> <span className="font-mono">{paymentDetails.orderId}</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Wskazówka:</strong><br />
                Jeśli status nie zmieni się w ciągu 10 minut, sprawdź swój email
                lub skontaktuj się z nami.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => verifyPayment()}
                className="flex-1 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all"
              >
                🔄 Odśwież Status
              </button>
              <button
                onClick={() => navigate('/my-classes')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                Moje Rezerwacje
              </button>
            </div>
          </>
        ) : (
          // Payment failed or unknown
          <>
            <div className="text-center mb-8">
              <div className="text-9xl mb-6">❌</div>
              <h1 className="text-4xl font-bold text-red-600 mb-3">
                Problem z płatnością
              </h1>
              <p className="text-xl text-gray-600">
                Nie udało się potwierdzić płatności
              </p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <p className="text-gray-700 mb-4">
                Wystąpił problem podczas przetwarzania płatności.
                Środki nie zostały pobrane z Twojego konta.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Nr zamówienia:</strong> <span className="font-mono">{paymentDetails?.orderId}</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Co możesz zrobić:</strong><br />
                • Spróbuj ponownie opłacić zajęcia<br />
                • Sprawdź czy masz wystarczające środki<br />
                • Skontaktuj się z nami: unicorns.lodz@gmail.com
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/my-classes')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Moje Rezerwacje
              </button>
              <button
                onClick={() => navigate('/activities')}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                Zobacz Zajęcia
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
