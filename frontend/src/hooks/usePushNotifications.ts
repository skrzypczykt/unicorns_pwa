import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

// VAPID public key - TO SAMO CO W EDGE FUNCTION
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Sprawdź czy przeglądarka wspiera powiadomienia
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (supported) {
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }

  const requestPermission = async () => {
    if (!isSupported) {
      alert('Twoja przeglądarka nie wspiera powiadomień push')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  const subscribeToPush = async () => {
    setIsLoading(true)

    try {
      // 1. Prośba o zgodę
      const granted = await requestPermission()
      if (!granted) {
        alert('Musisz wyrazić zgodę na powiadomienia aby otrzymywać alerty o nowych zajęciach')
        setIsLoading(false)
        return false
      }

      // 2. Zarejestruj service worker
      const registration = await navigator.serviceWorker.ready

      // 3. Subskrybuj push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // 4. Zapisz token w bazie
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const subscriptionJSON = subscription.toJSON()

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint!,
          p256dh: subscriptionJSON.keys!.p256dh!,
          auth: subscriptionJSON.keys!.auth!,
          user_agent: navigator.userAgent
        }, {
          onConflict: 'user_id,endpoint'
        })

      if (error) throw error

      setIsSubscribed(true)
      return true
    } catch (error) {
      console.error('Error subscribing to push:', error)
      alert('Wystąpił błąd podczas włączania powiadomień')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Usuń z bazy
        const subscriptionJSON = subscription.toJSON()
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscriptionJSON.endpoint!)

        if (error) throw error
      }

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      alert('Wystąpił błąd podczas wyłączania powiadomień')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush
  }
}

// Helper: konwertuj VAPID key z base64 do Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
