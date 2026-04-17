import { usePWAInstall } from '../../hooks/usePWAInstall'
import { useEffect, useState } from 'react'

const PWAInstallButton = () => {
  const { isInstallable, isInstalled, handleInstall } = usePWAInstall()
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    console.log('[PWA Button] isInstallable:', isInstallable, 'isInstalled:', isInstalled)

    // Wykryj iOS (Safari nie wspiera beforeinstallprompt)
    const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)
    console.log('[PWA Button] Is iOS:', iOS)
  }, [isInstallable, isInstalled])

  // Pokaż przycisk dla Chrome/Edge (beforeinstallprompt)
  if (isInstallable) {
    console.log('[PWA Button] Rendering install button (Chrome/Edge)')
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

  // Dla iOS - pokaż instrukcje manualne
  if (isIOS && !isInstalled) {
    console.log('[PWA Button] Showing iOS instructions')
    return (
      <div className="w-full mt-4">
        <button
          onClick={() => setShowIOSInstructions(!showIOSInstructions)}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2"
        >
          <span className="text-2xl">📱</span>
          <span>Jak zainstalować na iPhone?</span>
        </button>

        {showIOSInstructions && (
          <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm text-left">
            <p className="font-semibold mb-2">Instrukcja instalacji (Safari):</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Kliknij ikonę "Udostępnij" <span className="text-blue-600">⎋</span> na dole ekranu</li>
              <li>Przewiń w dół i wybierz "Dodaj do ekranu głównego"</li>
              <li>Kliknij "Dodaj" w prawym górnym rogu</li>
            </ol>
          </div>
        )}
      </div>
    )
  }

  console.log('[PWA Button] Not showing button - not installable and not iOS')
  return null
}

export default PWAInstallButton
