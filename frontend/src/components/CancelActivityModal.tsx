import { useState } from 'react'

interface CancelActivityModalProps {
  activityName: string
  participantsCount: number
  hasPaidParticipants: boolean
  onConfirm: (sendNotification: boolean, emailSubject: string, emailBody: string) => Promise<void>
  onCancel: () => void
}

export default function CancelActivityModal({
  activityName,
  participantsCount,
  hasPaidParticipants,
  onConfirm,
  onCancel
}: CancelActivityModalProps) {
  const [sendNotification, setSendNotification] = useState(true)
  const [emailSubject, setEmailSubject] = useState(`Anulowanie zajęć: ${activityName}`)
  const [emailBody, setEmailBody] = useState(
    `Szanowni Państwo,\n\nZ przykrością informujemy, że zajęcia "${activityName}" zostały anulowane.\n\n` +
    (hasPaidParticipants
      ? `Jeśli dokonaliście Państwo płatności za te zajęcia, środki zostaną zwrócone w ciągu 7 dni roboczych.\n\n`
      : '') +
    `Przepraszamy za niedogodności.\n\nPozdrawiamy,\nZespół Unicorns`
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(sendNotification, emailSubject, emailBody)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ⚠️ Anulowanie zajęć
          </h2>

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Wydarzenie:</strong> {activityName}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Liczba zapisanych uczestników:</strong> {participantsCount}
            </p>
            {hasPaidParticipants && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Niektórzy użytkownicy mogliby być opłaceni. Konieczne będzie ręczne wykonanie zwrotów.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-700 font-medium">
                Powiadom użytkowników o anulowaniu (email + push)
              </span>
            </label>
          </div>

          {sendNotification && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temat wiadomości email
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Temat emaila"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treść wiadomości email
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Treść wiadomości dla uczestników"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Ta wiadomość zostanie wysłana do wszystkich zapisanych uczestników.
                </p>
              </div>
            </div>
          )}

          {hasPaidParticipants && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">
                📋 Procedura zwrotów
              </h3>
              <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                <li>Anuluj zajęcia w systemie</li>
                <li>Sprawdź listę płatności w panelu "Płatności"</li>
                <li>Wykonaj zwroty ręcznie przez panel bramki płatniczej</li>
                <li>Oznacz płatności jako zwrócone w systemie</li>
              </ol>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Anulowanie...' : 'Potwierdź anulowanie'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
