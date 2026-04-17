import { usePWAInstall } from '../../hooks/usePWAInstall'

const PWAInstallButton = () => {
  const { isInstallable, handleInstall } = usePWAInstall()

  if (!isInstallable) return null

  return (
    <button
      onClick={handleInstall}
      className="w-full mt-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
    >
      <span className="text-2xl">📱</span>
      <span>Pobierz aplikację na telefon</span>
    </button>
  )
}

export default PWAInstallButton
