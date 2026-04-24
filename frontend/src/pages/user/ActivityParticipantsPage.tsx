import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabase/client'

interface Activity {
  id: string
  name: string
  description: string
  date_time: string
  duration_minutes: number
  max_participants: number
  cost: number
  location: string
  status: string
  is_special_event?: boolean
}

interface Registration {
  id: string
  user_id: string
  status: string
  registered_at: string
  payment_status: string
  can_cancel_until: string
  users: {
    display_name: string
    email: string
    balance: number
  }
}

const ActivityParticipantsPage = () => {
  const navigate = useNavigate()
  const { activityId } = useParams<{ activityId: string }>()

  const [activity, setActivity] = useState<Activity | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (activityId) {
      fetchActivityAndRegistrations()
    }
  }, [activityId])

  const fetchActivityAndRegistrations = async () => {
    try {
      setLoading(true)

      // Fetch activity details
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (activityError) throw activityError
      setActivity(activityData)

      // Fetch registrations with user details
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          status,
          registered_at,
          payment_status,
          can_cancel_until,
          users (
            display_name,
            email,
            balance
          )
        `)
        .eq('activity_id', activityId)
        .order('registered_at', { ascending: true })

      if (registrationsError) throw registrationsError
      setRegistrations(registrationsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Błąd podczas pobierania danych')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async (registrationId: string, userName: string) => {
    if (!confirm(`Czy na pewno chcesz anulować zapis użytkownika ${userName}?`)) return

    setCancelling(registrationId)
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId)

      if (error) throw error

      alert('✅ Zapis anulowany')
      await fetchActivityAndRegistrations()
    } catch (error) {
      console.error('Error cancelling registration:', error)
      alert('Wystąpił błąd podczas anulowania zapisu')
    } finally {
      setCancelling(null)
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Zapisany</span>
      case 'attended':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">Uczestniczył</span>
      case 'no_show':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">Nieobecny</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-semibold">Anulowany</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-semibold">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 mb-4">Nie znaleziono aktywności</p>
          <button
            onClick={() => navigate('/admin/activities')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Powrót do listy zajęć
          </button>
        </div>
      </div>
    )
  }

  const activeRegistrations = registrations.filter(r => r.status === 'registered' || r.status === 'attended')
  const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled' || r.status === 'no_show')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/activities')}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all text-sm"
        >
          ← Powrót do listy zajęć
        </button>

        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
          {activity.is_special_event && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                🏆 WYDARZENIE SPECJALNE
              </span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-purple-600 mb-4">{activity.name}</h1>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>📅 Data:</strong> {formatDate(activity.date_time)}</p>
              <p className="text-gray-600"><strong>📍 Lokalizacja:</strong> {activity.location}</p>
              <p className="text-gray-600"><strong>💰 Koszt:</strong> {activity.cost.toFixed(2)} zł</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>👥 Maksymalna liczba:</strong> {activity.max_participants}</p>
              <p className="text-gray-600"><strong>✅ Zapisanych:</strong> {activeRegistrations.length}</p>
              <p className="text-gray-600">
                <strong>🎯 Wolnych miejsc:</strong> {activity.max_participants - activeRegistrations.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{activeRegistrations.length}</div>
          <div className="text-sm text-gray-600">Aktywne zapisy</div>
        </div>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-600">{cancelledRegistrations.length}</div>
          <div className="text-sm text-gray-600">Anulowane</div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {registrations.filter(r => r.status === 'attended').length}
          </div>
          <div className="text-sm text-gray-600">Uczestniczyli</div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{registrations.length}</div>
          <div className="text-sm text-gray-600">Wszystkie zapisy</div>
        </div>
      </div>

      {/* Active Registrations */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          ✅ Aktywne zapisy ({activeRegistrations.length})
        </h2>

        {activeRegistrations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Brak aktywnych zapisów</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-purple-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Uczestnik</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Data zapisu</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Saldo</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {activeRegistrations.map((reg, index) => (
                  <tr key={reg.id} className="border-b border-gray-200 hover:bg-purple-50">
                    <td className="py-3 px-2 text-sm">{index + 1}</td>
                    <td className="py-3 px-2 text-sm font-semibold">{reg.users?.display_name}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{reg.users?.email}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{formatDateTime(reg.registered_at)}</td>
                    <td className="py-3 px-2">{getStatusBadge(reg.status)}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={`font-semibold ${reg.users?.balance && reg.users.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {reg.users?.balance?.toFixed(0)} zł
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleCancelRegistration(reg.id, reg.users?.display_name || '')}
                        disabled={cancelling === reg.id}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        {cancelling === reg.id ? 'Anulowanie...' : 'Anuluj zapis'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancelled Registrations */}
      {cancelledRegistrations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            ❌ Anulowane zapisy ({cancelledRegistrations.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Uczestnik</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Data zapisu</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {cancelledRegistrations.map((reg, index) => (
                  <tr key={reg.id} className="border-b border-gray-200">
                    <td className="py-3 px-2 text-sm">{index + 1}</td>
                    <td className="py-3 px-2 text-sm">{reg.users?.display_name}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{reg.users?.email}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{formatDateTime(reg.registered_at)}</td>
                    <td className="py-3 px-2">{getStatusBadge(reg.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityParticipantsPage
