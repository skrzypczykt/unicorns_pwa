import { useEffect, useState } from 'react'

const PWADebugPanel = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const addLog = (message: string) => {
      setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    // Sprawdź podstawowe informacje
    addLog('=== PWA Debug Info ===')
    addLog(`User Agent: ${navigator.userAgent}`)
    addLog(`Standalone mode: ${window.matchMedia('(display-mode: standalone)').matches}`)
    addLog(`iOS standalone: ${(navigator as any).standalone}`)
    addLog(`Location: ${window.location.href}`)
    addLog(`Protocol: ${window.location.protocol}`)

    // Service Worker
    if ('serviceWorker' in navigator) {
      addLog('✅ Service Worker API supported')
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        addLog(`Service Workers registered: ${registrations.length}`)
        registrations.forEach((reg, i) => {
          addLog(`  SW ${i}: ${reg.active?.state || 'not active'}`)
        })
      })
    } else {
      addLog('❌ Service Worker API NOT supported')
    }

    // localStorage
    const dismissedAndroid = localStorage.getItem('pwa-install-dismissed')
    const dismissedIOS = localStorage.getItem('pwa-install-dismissed-ios')
    addLog(`localStorage pwa-install-dismissed: ${dismissedAndroid || 'null'}`)
    addLog(`localStorage pwa-install-dismissed-ios: ${dismissedIOS || 'null'}`)

    // beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      addLog('🎉 beforeinstallprompt EVENT FIRED!')
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    addLog('=== Listening for events... ===')

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const clearLocalStorage = () => {
    localStorage.removeItem('pwa-install-dismissed')
    localStorage.removeItem('pwa-install-dismissed-ios')
    setLogs((prev) => [...prev, '🗑️ Cleared localStorage'])
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[100] bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg"
      >
        🐛 PWA DEBUG
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <h2 className="font-bold">🐛 PWA Debug Panel</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 flex gap-2 border-b">
          <button
            onClick={clearLocalStorage}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
          >
            Wyczyść localStorage
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
          >
            Przeładuj stronę
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-1 font-mono text-xs">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  log.includes('❌')
                    ? 'bg-red-100 text-red-800'
                    : log.includes('✅') || log.includes('🎉')
                    ? 'bg-green-100 text-green-800'
                    : log.includes('===')
                    ? 'bg-purple-100 text-purple-800 font-bold'
                    : 'bg-white text-gray-800'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWADebugPanel
