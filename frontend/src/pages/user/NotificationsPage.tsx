import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  title: string
  body: string
  type: 'payment_reminder' | 'new_activity' | 'special_event' | 'general'
  sent_at: string
  read_at: string | null
  activity_id: string | null
}

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('push_notifications_log')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('push_notifications_log')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      // Odśwież listę
      fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return '💳'
      case 'new_activity':
        return '🆕'
      case 'special_event':
        return '🎉'
      default:
        return '🔔'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return 'Przypomnienie o płatności'
      case 'new_activity':
        return 'Nowe zajęcia'
      case 'special_event':
        return 'Wydarzenie specjalne'
      default:
        return 'Ogólne'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">🔔 Powiadomienia</h1>
          <p className="text-gray-600">Historia twoich powiadomień</p>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-gray-600 text-lg">Brak powiadomień</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 p-4 transition-all cursor-pointer hover:shadow-xl ${
                  notif.read_at ? 'border-gray-200 opacity-75' : 'border-purple-300'
                }`}
                onClick={() => !notif.read_at && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-purple-600">{notif.title}</h3>
                      {!notif.read_at && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                          Nowe
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notif.body}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <span>{getTypeLabel(notif.type)}</span>
                      </span>
                      <span>•</span>
                      <span>{new Date(notif.sent_at).toLocaleString('pl-PL')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
