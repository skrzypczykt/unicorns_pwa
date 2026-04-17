import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'

interface Activity {
  id: string
  name: string
  description: string
  date_time: string
  duration_minutes: number
  max_participants: number
  cost: number
  location: string
  trainer_id: string
  status: string
  cancellation_hours: number
  registration_opens_at?: string | null
  registration_closes_at?: string | null
}

const ActivitiesPage = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchActivities()
    fetchUserRegistrations()
  }, [])

  const fetchActivities = async () => {
    try {
      // Filtruj do najbliższych 7 dni
      const now = new Date()
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('status', 'scheduled')
        .gte('date_time', now.toISOString())
        .lte('date_time', sevenDaysLater.toISOString())
        .order('date_time', { ascending: true })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRegistrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('registrations')
        .select('activity_id')
        .eq('user_id', user.id)
        .in('status', ['registered'])

      if (error) throw error

      const registeredIds = new Set(data?.map(r => r.activity_id) || [])
      setUserRegistrations(registeredIds)
    } catch (error) {
      console.error('Error fetching user registrations:', error)
    }
  }

  const handleRegister = async (activityId: string, cost: number, cancellationHours: number) => {
    setRegistering(activityId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Musisz być zalogowany')
        return
      }

      // Get user's current balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      // Check if user has sufficient balance (for future payment after attendance)
      if (userData.balance < cost) {
        alert(`Niewystarczające saldo! Potrzebujesz ${cost.toFixed(2)} zł, a masz ${userData.balance.toFixed(2)} zł.`)
        return
      }

      // Get activity details to calculate cancellation deadline
      const activity = activities.find(a => a.id === activityId)
      if (!activity) return

      const activityDate = new Date(activity.date_time)
      const cancellationDeadline = new Date(activityDate.getTime() - (cancellationHours * 60 * 60 * 1000))

      // Create registration
      const { error: regError } = await supabase
        .from('registrations')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          status: 'registered',
          can_cancel_until: cancellationDeadline.toISOString(),
          payment_processed: false
        })

      if (regError) {
        if (regError.code === '23505') {
          alert('Już jesteś zapisany na te zajęcia!')
        } else {
          throw regError
        }
        return
      }

      alert('✅ Zapisano na zajęcia! Pamiętaj, że płatność zostanie pobrana po oznaczeniu obecności przez trenera.')

      // Refresh registrations
      await fetchUserRegistrations()
    } catch (error) {
      console.error('Error registering:', error)
      alert('Wystąpił błąd podczas zapisu')
    } finally {
      setRegistering(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTimeUntil = (targetDate: Date) => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const checkRegistrationWindow = (activity: Activity) => {
    const now = new Date()
    const opensAt = activity.registration_opens_at ? new Date(activity.registration_opens_at) : null
    const closesAt = activity.registration_closes_at ? new Date(activity.registration_closes_at) : null

    const isBeforeOpen = opensAt && now < opensAt
    const isAfterClose = closesAt && now > closesAt
    const isOpen = !isBeforeOpen && !isAfterClose

    return { isOpen, isBeforeOpen, isAfterClose, opensAt, closesAt }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie zajęć...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">📅 Zajęcia na najbliższe 7 dni</h1>
          <p className="text-gray-600">Wybierz zajęcia i zapisz się!</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {/* Info banner o filtrowaniu */}
      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>ℹ️ Informacja:</strong> Wyświetlamy zajęcia z najbliższych 7 dni. Więcej zajęć pojawi się automatycznie w kolejnych tygodniach.
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🦄</span>
          <p className="text-xl text-gray-600">Brak nadchodzących zajęć</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {activities.map((activity) => {
            const isRegistered = userRegistrations.has(activity.id)
            const isProcessing = registering === activity.id
            const { isOpen, isBeforeOpen, isAfterClose, opensAt, closesAt } = checkRegistrationWindow(activity)

            return (
              <div
                key={activity.id}
                className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all ${!isOpen && !isRegistered ? 'opacity-60' : ''}`}
              >
                <h3 className="text-xl font-bold text-purple-600 mb-2">{activity.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>📅</span>
                    <span>{formatDate(activity.date_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>⏱️</span>
                    <span>{activity.duration_minutes} minut</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>👥</span>
                    <span>Max {activity.max_participants} osób</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
                    <span>💰</span>
                    <span>{activity.cost.toFixed(2)} zł</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>⚠️</span>
                    <span>Anulowanie: {activity.cancellation_hours}h przed zajęciami</span>
                  </div>
                </div>

                {/* Status okna rejestracji */}
                {isBeforeOpen && opensAt && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <strong>⏰ Zapisy otwarte za:</strong> {formatTimeUntil(opensAt)}
                  </div>
                )}

                {isAfterClose && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <strong>🔒 Zapisy zamknięte</strong>
                  </div>
                )}

                {isRegistered ? (
                  <div className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg text-center">
                    ✓ Zapisany/a
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(activity.id, activity.cost, activity.cancellation_hours)}
                    disabled={isProcessing || !isOpen}
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Zapisywanie...' :
                     isBeforeOpen ? `Zapisy otwarte za ${opensAt && formatTimeUntil(opensAt)}` :
                     isAfterClose ? 'Zapisy zamknięte' :
                     'Zapisz się'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage
