import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    console.log('[InstallPWAPrompt] Komponent zamontowany')

    // Sprawdź czy aplikacja jest już zainstalowana
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      )
    }

    const standalone = isInStandaloneMode()
    setIsStandalone(standalone)
    console.log('[InstallPWAPrompt] Is standalone:', standalone)

    // Wykryj iOS
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent)
    }
    const iOS = checkIsIOS()
    setIsIOS(iOS)
    console.log('[InstallPWAPrompt] Is iOS:', iOS)
    console.log('[InstallPWAPrompt] User agent:', window.navigator.userAgent)

    // Słuchaj eventu beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[InstallPWAPrompt] beforeinstallprompt event fired!')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Sprawdź czy użytkownik już odrzucił prompt wcześniej
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const dismissedTime = dismissed ? parseInt(dismissed) : null
      const now = Date.now()
      console.log('[InstallPWAPrompt] Dismissed until:', dismissedTime, 'Now:', now)

      // Jeśli nie było dismissed lub minął czas
      if (!dismissedTime || dismissedTime < now) {
        setShowPrompt(true)
        console.log('[InstallPWAPrompt] Showing prompt')
        // Wyczyść stare dismissed
        if (dismissedTime && dismissedTime < now) {
          localStorage.removeItem('pwa-install-dismissed')
        }
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Dla iOS - pokaż instrukcje jeśli nie jest zainstalowane
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios')
      const dismissedTime = dismissed ? parseInt(dismissed) : null
      const now = Date.now()
      console.log('[InstallPWAPrompt] iOS dismissed until:', dismissedTime, 'Now:', now)

      // Jeśli nie było dismissed lub minął czas
      if (!dismissedTime || dismissedTime < now) {
        setShowPrompt(true)
        console.log('[InstallPWAPrompt] Showing iOS prompt')
        // Wyczyść stare dismissed
        if (dismissedTime && dismissedTime < now) {
          localStorage.removeItem('pwa-install-dismissed-ios')
        }
      }
    }

    // TEMPORARY: Zawsze pokaż prompt na desktopie dla testów
    if (!iOS && !standalone) {
      console.log('[InstallPWAPrompt] Desktop detected - showing test prompt in 2 seconds')
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Pokaż natywny prompt
    deferredPrompt.prompt()

    // Czekaj na wybór użytkownika
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    } else {
      console.log('PWA installation dismissed')
    }

    // Wyczyść prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Zapisz że użytkownik odrzucił prompt (nie pokazuj przez 7 dni)
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000
    localStorage.setItem(
      isIOS ? 'pwa-install-dismissed-ios' : 'pwa-install-dismissed',
      dismissedUntil.toString()
    )
  }

  // Debug info
  console.log('[InstallPWAPrompt] Render state:', {
    isStandalone,
    showPrompt,
    isIOS,
    hasDeferredPrompt: !!deferredPrompt
  })

  // Nie pokazuj jeśli aplikacja jest już zainstalowana
  if (isStandalone) {
    console.log('[InstallPWAPrompt] Hidden - app is standalone')
    return null
  }

  // Nie pokazuj jeśli użytkownik odrzucił
  if (!showPrompt) {
    console.log('[InstallPWAPrompt] Hidden - showPrompt is false')
    return null
  }

  // iOS - pokaż instrukcje
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl shadow-2xl p-4 text-white border-2 border-white/30">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/80 hover:text-white text-2xl leading-none"
            aria-label="Zamknij"
          >
            ×
          </button>

          <div className="flex items-start gap-3">
            <div className="text-4xl flex-shrink-0">🦄</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Zainstaluj aplikację Unicorns!</h3>
              <p className="text-sm mb-3 text-white/90">
                Dodaj aplikację do ekranu głównego dla szybkiego dostępu i powiadomień.
              </p>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm space-y-2">
                <p className="font-semibold">Jak zainstalować:</p>
                <ol className="list-decimal list-inside space-y-1 text-white/90">
                  <li>Kliknij przycisk "Udostępnij" <span className="inline-block">📤</span> poniżej</li>
                  <li>Przewiń w dół i wybierz "Dodaj do ekranu początkowego"</li>
                  <li>Gotowe! Aplikacja pojawi się na Twoim ekranie</li>
                </ol>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all"
                >
                  Później
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Android/Chrome - natywny prompt
  if (deferredPrompt) {
    console.log('[InstallPWAPrompt] Rendering Android/Chrome prompt')
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl shadow-2xl p-4 text-white border-2 border-white/30">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/80 hover:text-white text-2xl leading-none"
            aria-label="Zamknij"
          >
            ×
          </button>

          <div className="flex items-start gap-3">
            <div className="text-4xl flex-shrink-0">🦄</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Zainstaluj aplikację Unicorns!</h3>
              <p className="text-sm mb-3 text-white/90">
                📱 Szybki dostęp z ekranu głównego<br />
                🔔 Powiadomienia o nowych zajęciach<br />
                ⚡ Działa offline
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold transition-all shadow-lg"
                >
                  Zainstaluj teraz
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all"
                >
                  Później
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback - pokaż ogólny prompt (desktop/inne przeglądarki)
  console.log('[InstallPWAPrompt] Rendering fallback prompt')
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl shadow-2xl p-4 text-white border-2 border-white/30">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white text-2xl leading-none"
          aria-label="Zamknij"
        >
          ×
        </button>

        <div className="flex items-start gap-3">
          <div className="text-4xl flex-shrink-0">🦄</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Używaj Unicorns jako aplikacji!</h3>
            <p className="text-sm mb-3 text-white/90">
              📱 Dodaj do ekranu głównego na telefonie<br />
              🔔 Otrzymuj powiadomienia o zajęciach<br />
              ⚡ Korzystaj offline
            </p>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm space-y-2">
              <p className="font-semibold">Na telefonie:</p>
              <ul className="list-disc list-inside space-y-1 text-white/90 text-xs">
                <li><strong>Chrome Android:</strong> Menu → "Dodaj do ekranu głównego"</li>
                <li><strong>Safari iOS:</strong> Udostępnij 📤 → "Dodaj do ekranu"</li>
              </ul>
            </div>

            <div className="mt-3">
              <button
                onClick={handleDismiss}
                className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all"
              >
                Rozumiem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstallPWAPrompt
