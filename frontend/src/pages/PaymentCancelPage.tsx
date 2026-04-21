import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentCancelPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('OrderID') ||
                  searchParams.get('orderId') ||
                  searchParams.get('order_id')

  const registrationId = orderId?.replace('reg_', '').replace('fee_', '').replace('don_', '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-9xl mb-6">⚠️</div>
          <h1 className="text-4xl font-bold text-orange-600 mb-3">
            Płatność anulowana
          </h1>
          <p className="text-xl text-gray-600">
            Przerwano proces płatności
          </p>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Płatność została anulowana. Żadne środki nie zostały pobrane z Twojego konta.
          </p>

          {orderId && (
            <p className="text-sm text-gray-600">
              <strong>Nr zamówienia:</strong> <span className="font-mono">{orderId}</span>
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 Co możesz zrobić:</strong>
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
            <li>Spróbuj ponownie opłacić zajęcia</li>
            <li>Zapisz się na inne zajęcia</li>
            <li>Skontaktuj się z nami, jeśli masz pytania</li>
          </ul>
        </div>

        <div className="space-y-3">
          {registrationId && (
            <button
              onClick={() => navigate('/my-classes')}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">💳</span>
              <span>Spróbuj opłacić ponownie</span>
            </button>
          )}

          <button
            onClick={() => navigate('/activities')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">🏃</span>
            <span>Zobacz dostępne zajęcia</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            ← Powrót do strony głównej
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Masz pytania? Skontaktuj się z nami:
            <br />
            <a href="mailto:unicorns.lodz@gmail.com" className="text-purple-600 hover:underline font-semibold">
              unicorns.lodz@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
