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
  activity_type_id: string
  trainer_id: string
  activity_types?: {
    name: string
  } | null
  users?: {
    display_name: string
  } | null
}

interface Registration {
  id: string
  user_id: string
  status: string
  payment_status: string
  users: {
    display_name: string
    email: string
  } | null
  section_balance?: number
}

interface ActivityType {
  id: string
  name: string
}

interface Trainer {
  id: string
  display_name: string
  email: string
}

interface AttendanceSummary {
  total: number
  attended: number
  no_show: number
  pending: number
}

const AdminAttendancePage = () => {
  const navigate = useNavigate()

  // Filters
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [selectedActivityType, setSelectedActivityType] = useState<string>('')
  const [selectedTrainer, setSelectedTrainer] = useState<string>('')

  // Activities and registrations
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)
  const [summary, setSummary] = useState<AttendanceSummary>({
    total: 0,
    attended: 0,
    no_show: 0,
    pending: 0
  })

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    if (selectedActivityType || selectedTrainer) {
      fetchActivities()
    }
  }, [selectedActivityType, selectedTrainer])

  const fetchFilters = async () => {
    try {
      // Fetch activity types
      const { data: types, error: typesError } = await supabase
        .from('activity_types')
        .select('id, name')
        .order('name')

      if (typesError) throw typesError
      setActivityTypes(types || [])

      // Fetch trainers
      const { data: trainersData, error: trainersError } = await supabase
        .from('users')
        .select('id, display_name, email')
        .eq('role', 'trainer')
        .order('display_name')

      if (trainersError) throw trainersError
      setTrainers(trainersData || [])

    } catch (error) {
      console.error('Error fetching filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivities = async () => {
    try {
      setLoading(true)

      // Get activities from last 7 days and future
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      let query = supabase
        .from('activities')
        .select(`
          *,
          activity_types (
            name
          ),
          users:trainer_id (
            display_name
          )
        `)
        .gte('date_time', sevenDaysAgo.toISOString())
        .order('date_time', { ascending: true })

      if (selectedActivityType) {
        query = query.eq('activity_type_id', selectedActivityType)
      }

      if (selectedTrainer) {
        query = query.eq('trainer_id', selectedTrainer)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data
      const transformed = data?.map(act => ({
        ...act,
        activity_types: Array.isArray(act.activity_types) ? act.activity_types[0] : act.activity_types,
        users: Array.isArray(act.users) ? act.users[0] : act.users
      })) || []

      setActivities(transformed as any)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async (activityId: string, activityTypeId: string) => {
    try {
      // Get all registrations
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          status,
          payment_status,
          users!registrations_user_id_fkey (
            display_name,
            email
          )
        `)
        .eq('activity_id', activityId)
        .in('status', ['registered', 'attended', 'no_show'])

      if (error) {
        console.error('Error fetching registrations:', error)
        throw error
      }

      console.log('Raw registrations data:', data)

      // Transform the data and handle null users
      const transformed = data?.map(reg => {
        const userData = Array.isArray(reg.users) ? reg.users[0] : reg.users

        // Log if user is null
        if (!userData) {
          console.warn('Registration has null user:', reg)
        }

        return {
          ...reg,
          users: userData || null
        }
      }) || []

      // Filter out registrations with null users (deleted users)
      const validRegistrations = transformed.filter(reg => reg.users !== null)

      if (validRegistrations.length < transformed.length) {
        console.warn(`Filtered out ${transformed.length - validRegistrations.length} registrations with deleted users`)
      }

      // Fetch section balances
      const userIds = validRegistrations.map(r => r.user_id)

      if (userIds.length > 0) {
        const { data: balances, error: balanceError } = await supabase
          .from('user_section_balances')
          .select('user_id, balance')
          .eq('activity_type_id', activityTypeId)
          .in('user_id', userIds)

        if (balanceError) {
          console.error('Error fetching balances:', balanceError)
        } else {
          const balanceMap = new Map(balances?.map(b => [b.user_id, b.balance]) || [])
          validRegistrations.forEach(reg => {
            reg.section_balance = balanceMap.get(reg.user_id) || 0
          })
        }
      }

      setRegistrations(validRegistrations as any)

      // Calculate summary
      const summary: AttendanceSummary = {
        total: validRegistrations.length,
        attended: validRegistrations.filter(r => r.status === 'attended').length,
        no_show: validRegistrations.filter(r => r.status === 'no_show').length,
        pending: validRegistrations.filter(r => r.status === 'registered').length
      }
      setSummary(summary)

    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  const handleSelectActivity = async (activity: Activity) => {
    setSelectedActivity(activity)
    await fetchRegistrations(activity.id, activity.activity_type_id)
  }

  const markAttendance = async (
    registrationId: string,
    userId: string,
    newStatus: 'attended' | 'no_show',
    activityCost: number,
    userBalance: number
  ) => {
    if (newStatus === 'attended' && userBalance < activityCost) {
      if (!confirm(`Użytkownik ma niewystarczające saldo w tej sekcji (${userBalance.toFixed(2)} zł < ${activityCost.toFixed(2)} zł).\n\nCzy chcesz oznaczyć obecność i utworzyć zadłużenie?`)) {
        return
      }
    }

    // Validate activity has activity_type_id
    if (!selectedActivity!.activity_type_id) {
      alert('❌ Błąd: Te zajęcia nie mają przypisanej sekcji.\n\nSkontaktuj się z administratorem aby naprawić dane.')
      console.error('Activity missing activity_type_id:', selectedActivity)
      return
    }

    setMarking(registrationId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Musisz być zalogowany')
        return
      }

      if (newStatus === 'attended') {
        // Mark as present and process payment

        // 1. Create/update attendance record
        const { error: attendanceError } = await supabase
          .from('attendance')
          .upsert({
            activity_id: selectedActivity!.id,
            user_id: userId,
            registration_id: registrationId,
            marked_by: user.id,
            status: 'present'
          }, {
            onConflict: 'activity_id,user_id',
            ignoreDuplicates: false
          })

        if (attendanceError) throw attendanceError

        // 2. Get current section balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_section_balances')
          .select('balance')
          .eq('user_id', userId)
          .eq('activity_type_id', selectedActivity!.activity_type_id)
          .maybeSingle()  // Use maybeSingle() instead of single() to handle no records

        // If balanceError is real error (not just "no records"), throw it
        if (balanceError && balanceError.code !== 'PGRST116') {
          console.error('Error fetching balance:', balanceError)
          throw balanceError
        }

        const balanceBefore = balanceData?.balance || 0
        const balanceAfter = balanceBefore - activityCost

        console.log(`Balance update: ${balanceBefore} -> ${balanceAfter} (cost: ${activityCost})`)

        // 3. Update section balance
        const { error: updateBalanceError } = await supabase
          .from('user_section_balances')
          .upsert({
            user_id: userId,
            activity_type_id: selectedActivity!.activity_type_id,
            balance: balanceAfter,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,activity_type_id'
          })

        if (updateBalanceError) throw updateBalanceError

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
            activity_type_id: selectedActivity!.activity_type_id,
            description: `Płatność za zajęcia: ${selectedActivity!.name}`,
            created_by: user.id
          })

        if (transactionError) throw transactionError

        // 5. Update registration
        const { error: regError } = await supabase
          .from('registrations')
          .update({
            status: 'attended',
            payment_status: 'paid'
          })
          .eq('id', registrationId)

        if (regError) throw regError

        alert(`✅ Obecność oznaczona!\n\nPobrano ${activityCost.toFixed(2)} zł z konta sekcji: ${selectedActivity!.activity_types?.name || 'Brak sekcji'}\nNowe saldo: ${balanceAfter.toFixed(2)} zł`)
      } else {
        // Mark as absent - no payment
        const { error: attendanceError } = await supabase
          .from('attendance')
          .upsert({
            activity_id: selectedActivity!.id,
            user_id: userId,
            registration_id: registrationId,
            marked_by: user.id,
            status: 'absent'
          }, {
            onConflict: 'activity_id,user_id',
            ignoreDuplicates: false
          })

        if (attendanceError) throw attendanceError

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
      await fetchRegistrations(selectedActivity!.id, selectedActivity!.activity_type_id)
    } catch (error: any) {
      console.error('Error marking attendance:', error)
      alert(`❌ Wystąpił błąd podczas oznaczania obecności:\n\n${error.message || error}`)
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

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  if (loading && activityTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600 text-lg">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">👥 Zarządzanie Obecnością</h1>
            <p className="text-gray-600">Panel admina - oznaczanie obecności</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all font-semibold"
          >
            ← Powrót
          </button>
        </div>

        {!selectedActivity ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4">Filtry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sekcja
                  </label>
                  <select
                    value={selectedActivityType}
                    onChange={(e) => setSelectedActivityType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Wszystkie sekcje</option>
                    {activityTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trener
                  </label>
                  <select
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Wszyscy trenerzy</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Activities List */}
            {!selectedActivityType && !selectedTrainer ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <span className="text-6xl mb-4 block">🎯</span>
                <p className="text-xl text-gray-600">Wybierz sekcję lub trenera, aby zobaczyć zajęcia</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4 animate-bounce">🦄</div>
                <p className="text-gray-600">Ładowanie zajęć...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <span className="text-6xl mb-4 block">🦄</span>
                <p className="text-xl text-gray-600">Brak zajęć spełniających kryteria</p>
                <p className="text-sm text-gray-500 mt-2">Zajęcia z ostatnich 7 dni i nadchodzące</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => {
                  const upcoming = isUpcoming(activity.date_time)
                  return (
                    <div
                      key={activity.id}
                      className={`bg-white rounded-xl shadow-lg border-2 ${
                        upcoming ? 'border-purple-300' : 'border-gray-300'
                      } p-6 hover:shadow-xl transition-all cursor-pointer ${
                        !upcoming ? 'opacity-75' : ''
                      }`}
                      onClick={() => handleSelectActivity(activity)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-purple-600 flex-1">{activity.name}</h3>
                        {!upcoming && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                            Zakończone
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{activity.activity_types?.name || 'Brak sekcji'}</p>
                      <p className="text-sm text-gray-600 mb-3">Trener: {activity.users?.display_name || 'Nieznany'}</p>
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
                      <button className="mt-4 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all">
                        {upcoming ? 'Oznacz obecność →' : 'Zobacz listę →'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div>
            <button
              onClick={() => {
                setSelectedActivity(null)
                setRegistrations([])
                setSummary({ total: 0, attended: 0, no_show: 0, pending: 0 })
              }}
              className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all font-semibold"
            >
              ← Powrót do listy zajęć
            </button>

            {/* Activity Info */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-purple-600 mb-2">{selectedActivity.name}</h2>
                  <p className="text-gray-600">{selectedActivity.activity_types?.name || 'Brak sekcji'}</p>
                  <p className="text-sm text-gray-500">Trener: {selectedActivity.users?.display_name || 'Nieznany'}</p>
                </div>
                {!isUpcoming(selectedActivity.date_time) && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-lg">
                    Zakończone
                  </span>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
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
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{selectedActivity.duration_minutes} minut</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
                <div className="text-sm text-gray-600">Zapisani</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{summary.attended}</div>
                <div className="text-sm text-gray-600">Obecni</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{summary.no_show}</div>
                <div className="text-sm text-gray-600">Nieobecni</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{summary.pending}</div>
                <div className="text-sm text-gray-600">Oczekuje</div>
              </div>
            </div>

            {/* Participants List */}
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              Lista uczestników
            </h3>

            {registrations.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow-md">
                <p className="text-gray-600">Brak zapisanych uczestników</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => {
                  const balance = reg.section_balance ?? 0
                  const hasEnough = balance >= selectedActivity.cost
                  const isPending = reg.status === 'registered'
                  const isAttended = reg.status === 'attended'
                  const isNoShow = reg.status === 'no_show'

                  return (
                    <div
                      key={reg.id}
                      className={`bg-white rounded-xl shadow-lg border-2 ${
                        isAttended ? 'border-green-200 bg-green-50/50' :
                        isNoShow ? 'border-red-200 bg-red-50/50' :
                        'border-purple-200'
                      } p-4 flex flex-col md:flex-row md:items-center justify-between gap-4`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-purple-600">{reg.users?.display_name || 'Nieznany użytkownik'}</h4>
                          {isAttended && <span className="text-green-600 text-sm">✓ Obecny</span>}
                          {isNoShow && <span className="text-red-600 text-sm">✗ Nieobecny</span>}
                        </div>
                        <p className="text-sm text-gray-600">{reg.users?.email || 'Brak emaila'}</p>
                        <p className="text-sm mt-1">
                          <span className="text-gray-500">Saldo {selectedActivity.activity_types?.name || 'sekcji'}:</span>{' '}
                          <span className={hasEnough ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {balance.toFixed(2)} zł
                          </span>
                          {!hasEnough && isPending && (
                            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                              ⚠️ Niewystarczające saldo
                            </span>
                          )}
                        </p>
                        {reg.payment_status === 'paid' && (
                          <p className="text-xs text-green-600 mt-1">✓ Płatność przetworzona</p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => markAttendance(reg.id, reg.user_id, 'attended', selectedActivity.cost, balance)}
                              disabled={marking === reg.id}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                              {marking === reg.id ? '⏳ Zapisuję...' : 'Obecny'}
                            </button>
                            <button
                              onClick={() => markAttendance(reg.id, reg.user_id, 'no_show', selectedActivity.cost, balance)}
                              disabled={marking === reg.id}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                              {marking === reg.id ? '⏳ Zapisuję...' : 'Nieobecny'}
                            </button>
                          </>
                        ) : (
                          <div className={`px-4 py-2 rounded-lg font-semibold ${
                            isAttended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isAttended ? '✓ Opłacono' : '✗ Nieobecność'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAttendancePage
