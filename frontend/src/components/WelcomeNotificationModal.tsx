import { useEffect, useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'

const WelcomeNotificationModal = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { isSupported, isSubscribed, subscribeToPush } = usePushNotifications()

  useEffect(() => {
    // Sprawdź czy użytkownik już widział ten modal
    const hasSeenWelcome = localStorage.getItem('has_seen_notification_welcome')

    // Pokaż modal tylko jeśli:
    // 1. Nie widział go wcześniej
    // 2. Powiadomienia są wspierane
    // 3. Nie jest jeszcze zasubskrybowany
    if (!hasSeenWelcome && isSupported && !isSubscribed) {
      // Opóźnienie 1s żeby użytkownik zobaczył najpierw aplikację
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isSupported, isSubscribed])

  const handleEnableNotifications = async () => {
    await subscribeToPush()
    localStorage.setItem('has_seen_notification_welcome', 'true')
    setIsVisible(false)
  }

  const handleMaybeLater = () => {
    localStorage.setItem('has_seen_notification_welcome', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce">🦄🔔</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Witaj w Unicorns!
          </h2>
          <p className="text-gray-600 text-sm">
            Nie przegap żadnych zajęć ani wydarzeń!
          </p>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-purple-700 mb-3">
            📲 Włącz powiadomienia i otrzymuj:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Przypomnienia o nadchodzących zajęciach</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Powiadomienia o nowych aktywnościach</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Przypomnienia o płatnościach i ważne ogłoszenia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Aktualności ze Stowarzyszenia</span>
            </li>
          </ul>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-800">
            <strong>🔒 Twoja prywatność jest ważna:</strong> Możesz w każdej chwili wyłączyć powiadomienia w ustawieniach.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleEnableNotifications}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            🔔 Włącz powiadomienia
          </button>
          <button
            onClick={handleMaybeLater}
            className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
          >
            Może później
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Możesz zmienić ustawienia powiadomień w każdej chwili w zakładce Ustawienia
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default WelcomeNotificationModal
