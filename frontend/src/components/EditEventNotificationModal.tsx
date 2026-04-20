interface EditEventNotificationModalProps {
  participantCount: number
  onConfirm: () => void
  onSkip: () => void
  onCancel: () => void
}

const EditEventNotificationModal = ({
  participantCount,
  onConfirm,
  onSkip,
  onCancel
}: EditEventNotificationModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📢</div>
          <h2 className="text-2xl font-bold text-purple-600 mb-2">
            Powiadomić uczestników?
          </h2>
          <p className="text-gray-700 mb-1">
            Wprowadziłeś zmiany w wydarzeniu.
          </p>
          <p className="text-sm text-gray-600">
            Czy chcesz powiadomić wszystkich uczestników o wprowadzonych zmianach?
          </p>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-900 font-semibold text-center">
            📧 Wiadomość zostanie wysłana do <span className="text-xl text-purple-600">{participantCount}</span> {participantCount === 1 ? 'uczestnika' : participantCount < 5 ? 'uczestników' : 'uczestników'}
          </p>
          <p className="text-xs text-purple-700 text-center mt-2">
            Push notification + Email
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            ✅ Tak, wyślij powiadomienia
          </button>
          <button
            onClick={onSkip}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
          >
            🔕 Nie, tylko zapisz zmiany
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditEventNotificationModal
