import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'

interface Registration {
  id: string
  activity_id: string
  status: string
  can_cancel_until: string
  registered_at: string
  payment_processed: boolean
  activity: {
    name: string
    description: string
    date_time: string
    duration_minutes: number
    cost: number
    location: string
    status: string
  }
}

const MyClassesPage = () => {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    fetchMyRegistrations()
  }, [])

  const fetchMyRegistrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          activity_id,
          status,
          can_cancel_until,
          registered_at,
          payment_processed,
          activities (
            name,
            description,
            date_time,
            duration_minutes,
            cost,
            location,
            status
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['registered', 'attended', 'cancelled'])
        .order('registered_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const transformed = data?.map(reg => ({
        ...reg,
        activity: Array.isArray(reg.activities) ? reg.activities[0] : reg.activities
      })) || []

      setRegistrations(transformed as any)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (registrationId: string, canCancelUntil: string, paymentProcessed: boolean) => {
    // Check if cancellation is allowed
    const now = new Date()
    const deadline = new Date(canCancelUntil)

    if (now > deadline) {
      alert('Termin anulowania upłynął!')
      return
    }

    if (paymentProcessed) {
      alert('Nie możesz anulować - zajęcia zostały już opłacone (oznaczono obecność).')
      return
    }

    if (!confirm('Czy na pewno chcesz anulować te zajęcia?')) {
      return
    }

    setCancelling(registrationId)
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (error) throw error

      alert('✅ Zajęcia zostały anulowane')
      await fetchMyRegistrations()
    } catch (error) {
      console.error('Error cancelling:', error)
      alert('Wystąpił błąd podczas anulowania')
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

  const canCancel = (canCancelUntil: string, status: string, paymentProcessed: boolean) => {
    if (status !== 'registered') return false
    if (paymentProcessed) return false
    const now = new Date()
    const deadline = new Date(canCancelUntil)
    return now < deadline
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">🎯 Moje zajęcia</h1>
          <p className="text-gray-600">Zarządzaj swoimi rezerwacjami</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🦄</span>
          <p className="text-xl text-gray-600 mb-4">Nie masz jeszcze żadnych rezerwacji</p>
          <button
            onClick={() => navigate('/activities')}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Przeglądaj zajęcia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const isProcessing = cancelling === reg.id
            const canCancelNow = canCancel(reg.can_cancel_until, reg.status, reg.payment_processed)
            const isPast = new Date(reg.activity.date_time) < new Date()

            return (
              <div
                key={reg.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-purple-600">{reg.activity.name}</h3>
                      {reg.status === 'registered' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Aktywna rezerwacja
                        </span>
                      )}
                      {reg.status === 'attended' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          Uczestniczyłeś/aś
                        </span>
                      )}
                      {reg.status === 'cancelled' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Anulowano
                        </span>
                      )}
                      {reg.payment_processed && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          ✓ Opłacone
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">{reg.activity.description}</p>

                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(reg.activity.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{reg.activity.duration_minutes} minut</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{reg.activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-purple-600">
                        <span>💰</span>
                        <span>{reg.activity.cost.toFixed(2)} zł</span>
                      </div>
                    </div>

                    {reg.status === 'registered' && !reg.payment_processed && (
                      <div className="mt-3 text-xs text-gray-500">
                        <span>⚠️ Możesz anulować do: {formatDate(reg.can_cancel_until)}</span>
                      </div>
                    )}
                  </div>

                  {canCancelNow && (
                    <button
                      onClick={() => handleCancel(reg.id, reg.can_cancel_until, reg.payment_processed)}
                      disabled={isProcessing}
                      className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Anulowanie...' : 'Anuluj'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyClassesPage
