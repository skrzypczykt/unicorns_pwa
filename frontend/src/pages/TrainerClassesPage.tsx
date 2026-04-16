import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'

interface Activity {
  id: string
  name: string
  description: string
  date_time: string
  duration_minutes: number
  cost: number
  location: string
  status: string
}

interface Registration {
  id: string
  user_id: string
  status: string
  payment_processed: boolean
  users: {
    display_name: string
    email: string
    balance: number
  }
}

const TrainerClassesPage = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    fetchTrainerActivities()
  }, [])

  const fetchTrainerActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('status', 'scheduled')
        .order('date_time', { ascending: true })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async (activityId: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          status,
          payment_processed,
          users (
            display_name,
            email,
            balance
          )
        `)
        .eq('activity_id', activityId)
        .eq('status', 'registered')

      if (error) throw error

      // Transform the data
      const transformed = data?.map(reg => ({
        ...reg,
        users: Array.isArray(reg.users) ? reg.users[0] : reg.users
      })) || []

      setRegistrations(transformed as any)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  const handleSelectActivity = async (activity: Activity) => {
    setSelectedActivity(activity)
    await fetchRegistrations(activity.id)
  }

  const markAttendance = async (
    registrationId: string,
    userId: string,
    status: 'present' | 'absent',
    activityCost: number,
    userBalance: number
  ) => {
    if (status === 'present' && userBalance < activityCost) {
      if (!confirm(`Użytkownik ma niewystarczające saldo (${userBalance.toFixed(2)} zł < ${activityCost.toFixed(2)} zł). Czy chcesz oznaczyć obecność i utworzyć zadłużenie?`)) {
        return
      }
    }

    setMarking(registrationId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (status === 'present') {
        // Mark as present and process payment
        // 1. Create attendance record
        const { error: attendanceError } = await supabase
          .from('attendance')
          .insert({
            activity_id: selectedActivity!.id,
            user_id: userId,
            registration_id: registrationId,
            marked_by: user.id,
            status: 'present'
          })

        if (attendanceError) {
          if (attendanceError.code === '23505') {
            alert('Obecność już została oznaczona dla tego użytkownika')
            return
          }
          throw attendanceError
        }

        // 2. Get current balance
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('balance')
          .eq('id', userId)
          .single()

        if (userError) throw userError

        const balanceBefore = userData.balance
        const balanceAfter = balanceBefore - activityCost

        // 3. Deduct balance
        const { error: balanceError } = await supabase
          .from('users')
          .update({
            balance: balanceAfter,
            balance_updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (balanceError) throw balanceError

        // 4. Create transaction record
        const { error: transactionError } = await supabase
          .from('balance_transactions')
          .insert({
            user_id: userId,
            amount: -activityCost,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            type: 'class_payment',
            reference_id: selectedActivity!.id,
            description: `Płatność za zajęcia: ${selectedActivity!.name}`,
            created_by: user.id
          })

        if (transactionError) throw transactionError

        // 5. Update registration
        const { error: regError } = await supabase
          .from('registrations')
          .update({
            status: 'attended',
            payment_processed: true
          })
          .eq('id', registrationId)

        if (regError) throw regError

        alert(`✅ Obecność oznaczona! Pobrano ${activityCost.toFixed(2)} zł z konta użytkownika.`)
      } else {
        // Mark as absent - no payment
        const { error: attendanceError } = await supabase
          .from('attendance')
          .insert({
            activity_id: selectedActivity!.id,
            user_id: userId,
            registration_id: registrationId,
            marked_by: user.id,
            status: 'absent'
          })

        if (attendanceError) {
          if (attendanceError.code === '23505') {
            alert('Obecność już została oznaczona dla tego użytkownika')
            return
          }
          throw attendanceError
        }

        // Update registration status
        const { error: regError } = await supabase
          .from('registrations')
          .update({
            status: 'no_show'
          })
          .eq('id', registrationId)

        if (regError) throw regError

        alert('✅ Oznaczono nieobecność (bez płatności)')
      }

      // Refresh registrations
      await fetchRegistrations(selectedActivity!.id)
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Wystąpił błąd podczas oznaczania obecności')
    } finally {
      setMarking(null)
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2">✅ Panel Trenera</h1>
          <p className="text-gray-600">Oznacz obecność na zajęciach</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {!selectedActivity ? (
        <>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🦄</span>
              <p className="text-xl text-gray-600">Brak zaplanowanych zajęć do prowadzenia</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleSelectActivity(activity)}
                >
                  <h3 className="text-xl font-bold text-purple-600 mb-2">{activity.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(activity.date_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-purple-600">
                      <span>💰</span>
                      <span>{activity.cost.toFixed(2)} zł</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg">
                    Oznacz obecność →
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <button
            onClick={() => {
              setSelectedActivity(null)
              setRegistrations([])
            }}
            className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót do listy zajęć
          </button>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">{selectedActivity.name}</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formatDate(selectedActivity.date_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{selectedActivity.location}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-purple-600">
                <span>💰</span>
                <span>Koszt: {selectedActivity.cost.toFixed(2)} zł</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-purple-600 mb-4">
            Lista uczestników ({registrations.length})
          </h3>

          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Brak zapisanych uczestników</p>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-purple-600">{reg.users.display_name}</h4>
                    <p className="text-sm text-gray-600">{reg.users.email}</p>
                    <p className="text-sm">
                      Saldo: <span className={reg.users.balance >= selectedActivity.cost ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {reg.users.balance.toFixed(2)} zł
                      </span>
                      {reg.users.balance < selectedActivity.cost && (
                        <span className="ml-2 text-xs text-red-600">⚠️ Niewystarczające</span>
                      )}
                    </p>
                  </div>

                  {reg.payment_processed ? (
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                      ✓ Opłacono
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(reg.id, reg.user_id, 'present', selectedActivity.cost, reg.users.balance)}
                        disabled={marking === reg.id}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50"
                      >
                        ✓ Obecny/a
                      </button>
                      <button
                        onClick={() => markAttendance(reg.id, reg.user_id, 'absent', selectedActivity.cost, reg.users.balance)}
                        disabled={marking === reg.id}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50"
                      >
                        ✗ Nieobecny/a
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TrainerClassesPage
