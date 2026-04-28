import type { ActivityFormData } from '../../../hooks/useActivityForm'

interface RecurringActivityFieldsProps {
  formData: ActivityFormData
  updateFormData: (updates: Partial<ActivityFormData>) => void
  calculateInstanceCount: () => number | string
}

export const RecurringActivityFields = ({ formData, updateFormData, calculateInstanceCount }: RecurringActivityFieldsProps) => {
  return (
    <div className="border-t-2 border-purple-200 pt-6">
      <h3 className="text-lg font-bold text-purple-600 mb-4">
        🔄 Reguła powtarzania
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Częstotliwość *
          </label>
          <select
            value={formData.recurrence_pattern || 'weekly'}
            onChange={(e) => updateFormData({ recurrence_pattern: e.target.value })}
            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            <option value="weekly">Co tydzień</option>
            <option value="monthly">Co miesiąc</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dzień tygodnia *
            </label>
            <select
              value={formData.recurrence_day_of_week || ''}
              onChange={(e) => updateFormData({ recurrence_day_of_week: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="">Wybierz dzień...</option>
              <option value="Monday">Poniedziałek</option>
              <option value="Tuesday">Wtorek</option>
              <option value="Wednesday">Środa</option>
              <option value="Thursday">Czwartek</option>
              <option value="Friday">Piątek</option>
              <option value="Saturday">Sobota</option>
              <option value="Sunday">Niedziela</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Godzina *
            </label>
            <input
              type="time"
              value={formData.recurrence_time || ''}
              onChange={(e) => updateFormData({ recurrence_time: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Czas trwania (minuty) *
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => updateFormData({ duration_minutes: parseInt(e.target.value) })}
              required
              min="15"
              step="15"
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Anulowanie (godz. przed) *
            </label>
            <input
              type="number"
              value={formData.cancellation_hours}
              onChange={(e) => updateFormData({ cancellation_hours: parseInt(e.target.value) })}
              required
              min="0"
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t-2 border-purple-200 pt-4 mt-4">
          <h4 className="text-md font-bold text-purple-600 mb-3">⏰ Okna rejestracji (domyślne dla wszystkich instancji)</h4>
          <p className="text-sm text-gray-600 mb-4">
            Określ domyślne okna zapisów dla wszystkich wydarzeń wygenerowanych z tego szablonu.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zapisy otwarte (godzin przed)
              </label>
              <input
                type="number"
                value={formData.registration_opens_at || ''}
                onChange={(e) => updateFormData({ registration_opens_at: e.target.value })}
                placeholder="np. 168 (tydzień)"
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pozostaw puste aby zapisy były otwarte od razu
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zapisy zamknięte (godzin przed)
              </label>
              <input
                type="number"
                value={formData.registration_closes_at || ''}
                onChange={(e) => updateFormData({ registration_closes_at: e.target.value })}
                placeholder="np. 2"
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pozostaw puste aby zapisy były otwarte do początku zajęć
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="infinite_recurrence"
            checked={!formData.recurrence_end_date || formData.recurrence_end_date === ''}
            onChange={(e) => {
              if (e.target.checked) {
                updateFormData({ recurrence_end_date: '' })
              } else {
                const threeMonthsLater = new Date()
                threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
                updateFormData({ recurrence_end_date: threeMonthsLater.toISOString().slice(0, 16) })
              }
            }}
            className="h-4 w-4 text-purple-600 rounded"
          />
          <label htmlFor="infinite_recurrence" className="text-sm font-semibold text-gray-700">
            ♾️ Nieskończone powtarzanie (bez daty końcowej)
          </label>
        </div>

        {formData.recurrence_end_date && formData.recurrence_end_date !== '' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Powtarzaj do
            </label>
            <input
              type="datetime-local"
              value={formData.recurrence_end_date || ''}
              onChange={(e) => updateFormData({ recurrence_end_date: e.target.value })}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        )}

        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ Zostanie utworzonych <strong>{calculateInstanceCount()}</strong> zajęć.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Szablon będzie bez konkretnej daty - instancje będą generowane automatycznie.
          </p>
        </div>
      </div>
    </div>
  )
}
