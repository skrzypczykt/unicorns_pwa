import { useNavigate } from 'react-router-dom'

export const AccessDenied = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-8xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Brak dostępu</h1>
        <p className="text-gray-700 mb-6">
          Nie masz uprawnień do przeglądania tej strony. Ta sekcja jest dostępna tylko dla administratorów.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          Wróć do strony głównej
        </button>
      </div>
    </div>
  )
}
