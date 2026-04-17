// Custom Service Worker dla obsługi Push Notifications
// Ten plik będzie połączony z automatycznie generowanym SW przez vite-plugin-pwa

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event)

  let notificationData = {
    title: 'Unicorns Łódź',
    body: 'Nowe powiadomienie',
    icon: '/unicorns-logo.png',
    badge: '/unicorns-logo.png',
    data: {
      url: '/'
    }
  }

  // Parsuj dane z push
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data
      }
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e)
      notificationData.body = event.data.text()
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      tag: 'unicorns-notification',
      requireInteraction: false
    }
  )

  event.waitUntil(promiseChain)
})

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
    .then((windowClients) => {
      // Sprawdź czy aplikacja już jest otwarta
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }

      // Jeśli nie, otwórz nową kartę
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })

  event.waitUntil(promiseChain)
})

console.log('[Service Worker] Push notifications handler loaded')
