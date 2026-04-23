import { useState, useEffect } from 'react'
import { APP_VERSION } from '../version'

const VersionBanner = () => {
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [isOutdated, setIsOutdated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    checkVersion()
  }, [])

  const checkVersion = async () => {
    try {
      // Pobierz version.ts z GitHub (raw)
      const response = await fetch(
        'https://raw.githubusercontent.com/skrzypczykt/unicorns_pwa/main/frontend/src/version.ts',
        { cache: 'no-cache' }
      )

      if (!response.ok) {
        console.warn('Failed to fetch latest version from GitHub')
        setLoading(false)
        return
      }

      const content = await response.text()

      // Parsuj wersję z pliku (export const APP_VERSION = '0.3.9')
      const match = content.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)

      if (match && match[1]) {
        const remoteVersion = match[1]
        setLatestVersion(remoteVersion)

        // Porównaj wersje
        if (remoteVersion !== APP_VERSION) {
          setIsOutdated(true)
        }
      }
    } catch (error) {
      console.error('Error checking version:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReload = () => {
    // Hard reload - wyczyść cache i przeładuj
    if ('serviceWorker' in navigator) {
      // Zaktualizuj Service Worker
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update()
        })
      })
    }

    // Hard reload
    window.location.reload()
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Zapisz w localStorage że użytkownik zamknął banner dla tej wersji
    localStorage.setItem('dismissed-version-banner', APP_VERSION)
  }

  // Sprawdź czy użytkownik już zamknął banner dla tej wersji
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed-version-banner')
    if (dismissed === APP_VERSION && !isOutdated) {
      setShowBanner(false)
    }
  }, [isOutdated])

  if (!showBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      {/* Test version info */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">⚠️</span>
            <span className="font-semibold">Wersja testowa aplikacji</span>
            <span className="hidden sm:inline text-xs opacity-90">
              v{APP_VERSION} • Niektóre funkcje mogą działać niestabilnie
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-100 transition-colors text-xl leading-none"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>
      </div>

      {/* Outdated version warning */}
      {isOutdated && latestVersion && (
        <div className="bg-blue-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">🔄</span>
              <span className="font-semibold">Dostępna nowa wersja!</span>
              <span className="text-xs opacity-90">
                Twoja wersja: v{APP_VERSION} → Najnowsza: v{latestVersion}
              </span>
            </div>
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-md text-sm whitespace-nowrap"
            >
              🔃 Przeładuj aplikację
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator (subtle) */}
      {loading && !isOutdated && (
        <div className="bg-gray-100 px-4 py-1">
          <div className="max-w-7xl mx-auto text-xs text-gray-500 text-center">
            Sprawdzanie aktualizacji...
          </div>
        </div>
      )}
    </div>
  )
}

export default VersionBanner
