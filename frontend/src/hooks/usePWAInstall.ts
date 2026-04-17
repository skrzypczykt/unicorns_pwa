import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log('[PWA] usePWAInstall hook initialized')

    // Sprawdź czy już zainstalowane
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    console.log('[PWA] Display mode standalone:', isStandalone)

    if (isStandalone) {
      console.log('[PWA] App already installed')
      setIsInstalled(true)
      return
    }

    // Przechwytuj event beforeinstallprompt
    const handler = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired!')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    console.log('[PWA] beforeinstallprompt listener added')

    // Obsłuż event appinstalled
    const installedHandler = () => {
      console.log('[PWA] App installed!')
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', installedHandler)

    // Check if event was already fired before listener was added
    setTimeout(() => {
      console.log('[PWA] Status check - deferredPrompt:', !!deferredPrompt, 'isInstalled:', isInstalled)
    }, 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    handleInstall
  }
}
