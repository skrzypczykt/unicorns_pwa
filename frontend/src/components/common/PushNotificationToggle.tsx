import { usePushNotifications } from '../../hooks/usePushNotifications'

const PushNotificationToggle = () => {
  const { isSupported, isSubscribed, isLoading, subscribeToPush, unsubscribeFromPush } = usePushNotifications()

  if (!isSupported) {
    return null // Nie pokazuj jeśli przeglądarka nie wspiera
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush()
    } else {
      await subscribeToPush()
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-purple-600 mb-2 flex items-center gap-2">
            🔔 Powiadomienia o nowych zajęciach
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Otrzymuj powiadomienia gdy pojawią się nowe terminy zajęć, na które zapisywałeś się w przeszłości.
          </p>
          {isSubscribed && (
            <p className="text-xs text-green-600 font-semibold">
              ✓ Powiadomienia włączone
            </p>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isSubscribed
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-lg'
          } disabled:opacity-50`}
        >
          {isLoading ? 'Ładowanie...' : isSubscribed ? 'Wyłącz' : 'Włącz'}
        </button>
      </div>
    </div>
  )
}

export default PushNotificationToggle
