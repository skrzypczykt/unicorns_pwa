import { useState } from 'react'

interface PaymentChoiceModalProps {
  activityName: string
  activityCost: number
  requiresImmediate: boolean
  onPayNow: () => void
  onPayLater: () => void
  onCancel: () => void
  paymentMethod: 'pbl' | 'blik' | 'card'
  onPaymentMethodChange: (method: 'pbl' | 'blik' | 'card') => void
  blikCode: string
  onBlikCodeChange: (code: string) => void
}

const PaymentChoiceModal = ({
  activityName,
  activityCost,
  requiresImmediate,
  onPayNow,
  onPayLater,
  onCancel,
  paymentMethod,
  onPaymentMethodChange,
  blikCode,
  onBlikCodeChange
}: PaymentChoiceModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-2xl font-bold text-purple-600 mb-2">
            {requiresImmediate ? 'Płatność wymagana' : 'Wybierz opcję płatności'}
          </h3>
          <p className="text-gray-600 mb-1">{activityName}</p>
          <p className="text-2xl font-bold text-purple-600">{activityCost.toFixed(2)} zł</p>
        </div>

        {requiresImmediate ? (
          // Wymaga natychmiastowej płatności
          <div>
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-semibold mb-2">⚡ Płatność natychmiastowa wymagana</p>
              <p className="text-sm text-yellow-700">
                Te zajęcia wymagają opłacenia w momencie zapisu. Kliknij "Opłać teraz", aby kontynuować.
              </p>
            </div>

            {/* Wybór metody płatności */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Wybierz metodę płatności:
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => onPaymentMethodChange('pbl')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'pbl'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl">🏦</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Szybki Przelew Online</div>
                    <div className="text-xs text-gray-600">(rekomendowane)</div>
                  </div>
                  {paymentMethod === 'pbl' && <div className="text-purple-500">✓</div>}
                </button>

                <button
                  onClick={() => onPaymentMethodChange('blik')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'blik'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl">📱</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">BLIK</div>
                    <div className="text-xs text-gray-600">Szybka płatność kodem</div>
                  </div>
                  {paymentMethod === 'blik' && <div className="text-purple-500">✓</div>}
                </button>
              </div>
            </div>

            {/* Kod BLIK jeśli wybrano BLIK */}
            {paymentMethod === 'blik' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kod BLIK (6 cyfr):
                </label>
                <input
                  type="text"
                  value={blikCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    onBlikCodeChange(value)
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 Wygeneruj kod w aplikacji bankowej przed kliknięciem "Opłać teraz"
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onPayNow}
                disabled={paymentMethod === 'blik' && blikCode.length !== 6}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💳 Opłać teraz i zapisz się
              </button>

              <button
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          // Opcja wyboru
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Możesz opłacić teraz lub wybrać opcję "Opłać później".
                W przypadku wybrania płatności później otrzymasz przypomnienie przed terminem zajęć.
              </p>
            </div>

            {/* Wybór metody płatności */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Metoda płatności:
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => onPaymentMethodChange('pbl')}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'pbl'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-xl">🏦</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">Szybki Przelew Online</div>
                    <div className="text-xs text-gray-600">(rekomendowane)</div>
                  </div>
                  {paymentMethod === 'pbl' && <div className="text-purple-500">✓</div>}
                </button>

                <button
                  onClick={() => onPaymentMethodChange('blik')}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'blik'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-xl">📱</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">BLIK</div>
                    <div className="text-xs text-gray-600">Szybka płatność kodem</div>
                  </div>
                  {paymentMethod === 'blik' && <div className="text-purple-500">✓</div>}
                </button>
              </div>
            </div>

            {/* Kod BLIK jeśli wybrano BLIK */}
            {paymentMethod === 'blik' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kod BLIK (6 cyfr):
                </label>
                <input
                  type="text"
                  value={blikCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    onBlikCodeChange(value)
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 Wygeneruj kod w aplikacji bankowej
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onPayNow}
                disabled={paymentMethod === 'blik' && blikCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl">💳</span>
                <span>Opłać teraz</span>
              </button>

              <button
                onClick={onPayLater}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-xl">⏰</span>
                <span>Opłać później</span>
              </button>

              <button
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
              >
                Anuluj
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>💡 Wskazówka:</strong> Jeśli wybierzesz "Opłać później", otrzymasz automatyczne
                przypomnienia push przed terminem płatności.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentChoiceModal
