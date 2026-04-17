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
  cancellation_hours: number
  status: string
  activity_type_id: string | null
  registration_opens_at?: string | null
  registration_closes_at?: string | null
  is_recurring?: boolean
  recurrence_pattern?: string
  recurrence_end_date?: string | null
  parent_activity_id?: string | null
}

interface Trainer {
  id: string
  display_name: string
  email: string
}

const AdminActivitiesPage = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date_time: '',
    duration_minutes: 60,
    max_participants: 15,
    cost: 30,
    location: '',
    trainer_id: '',
    cancellation_hours: 24,
    status: 'scheduled',
    registration_opens_at: '',
    registration_closes_at: '',
    is_recurring: false,
    recurrence_pattern: 'none',
    recurrence_end_date: ''
  })

  useEffect(() => {
    fetchActivities()
    fetchTrainers()
  }, [])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date_time', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email, role')
        .eq('role', 'trainer')
        .order('display_name', { ascending: true })

      if (error) throw error
      console.log('Fetched trainers:', data)
      setTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    }
  }

  // Helper: konwertuj datetime-local (lokalny czas) na ISO string z timezone
  const toISOWithTimezone = (dateTimeLocal: string | null | undefined): string | null => {
    if (!dateTimeLocal) return null
    // datetime-local zwraca "2024-04-18T18:00" bez TZ
    // Tworzymy Date obiekt z lokalnego czasu i konwertujemy na ISO (UTC)
    const localDate = new Date(dateTimeLocal)
    return localDate.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Konwertuj puste stringi na null i datetime-local na ISO z timezone
      const dataToSave = {
        ...formData,
        date_time: toISOWithTimezone(formData.date_time),
        registration_opens_at: toISOWithTimezone(formData.registration_opens_at),
        registration_closes_at: toISOWithTimezone(formData.registration_closes_at),
        recurrence_end_date: toISOWithTimezone(formData.recurrence_end_date),
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : 'none'
      }

      console.log('[Admin] Saving activity with data:', dataToSave)

      if (editingId) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Zajęcia zaktualizowane!')
      } else {
        // Create new activity
        const { data: newActivity, error } = await supabase
          .from('activities')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error

        console.log('[Admin] Created activity:', newActivity)

        // Jeśli cykliczne, generuj instancje
        if (formData.is_recurring && newActivity) {
          const { error: funcError } = await supabase.functions.invoke('generate-recurring-activities', {
            body: { activityTemplate: newActivity }
          })

          if (funcError) {
            console.error('Error generating instances:', funcError)
            alert(`⚠️ Zajęcia utworzone, ale wystąpił błąd przy generowaniu serii: ${funcError.message}`)
          } else {
            alert(`✅ Zajęcia cykliczne utworzone! Wygenerowano serię wydarzeń.`)
          }
        } else {
          alert('✅ Nowe zajęcia utworzone!')
        }

        // Wyślij powiadomienia push do zainteresowanych użytkowników
        if (newActivity) {
          console.log('[Push] Calling send-push-notifications with:', {
            activityId: newActivity.id,
            activityName: newActivity.name,
            dateTime: newActivity.date_time
          })

          const { data: { user } } = await supabase.auth.getUser()

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notifications`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                  activityId: newActivity.id,
                  activityName: newActivity.name,
                  dateTime: newActivity.date_time,
                  userId: user?.id
                })
              }
            )

            const pushData = await response.json()

            if (!response.ok) {
              console.error('[Push] Error sending push notifications:', pushData)
            } else {
              console.log('[Push] Notifications sent successfully:', pushData)
            }
          } catch (err) {
            console.error('[Push] Error sending push notifications:', err)
          }
        }
      }

      resetForm()
      await fetchActivities()
    } catch (error) {
      console.error('Error saving activity:', error)
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  // Helper: konwertuj ISO string (UTC z bazy) na format datetime-local (lokalny czas)
  const toDateTimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return ''
    // Parsuj UTC string z bazy i sformatuj jako lokalny czas dla datetime-local
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setFormData({
      name: activity.name,
      description: activity.description,
      date_time: toDateTimeLocal(activity.date_time),
      duration_minutes: activity.duration_minutes,
      max_participants: activity.max_participants,
      cost: activity.cost,
      location: activity.location,
      trainer_id: activity.trainer_id,
      cancellation_hours: activity.cancellation_hours,
      status: activity.status,
      registration_opens_at: toDateTimeLocal(activity.registration_opens_at),
      registration_closes_at: toDateTimeLocal(activity.registration_closes_at),
      is_recurring: activity.is_recurring || false,
      recurrence_pattern: activity.recurrence_pattern || 'none',
      recurrence_end_date: toDateTimeLocal(activity.recurrence_end_date)
    })
    setShowForm(true)
  }

  const handleCancel = async (activityId: string) => {
    if (!confirm('Czy na pewno chcesz anulować te zajęcia?')) return

    try {
      const { error } = await supabase
        .from('activities')
        .update({ status: 'cancelled' })
        .eq('id', activityId)

      if (error) throw error
      alert('✅ Zajęcia anulowane')
      await fetchActivities()
    } catch (error) {
      console.error('Error cancelling activity:', error)
      alert('Wystąpił błąd podczas anulowania')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date_time: '',
      duration_minutes: 60,
      max_participants: 15,
      cost: 30,
      location: '',
      trainer_id: '',
      cancellation_hours: 24,
      status: 'scheduled',
      registration_opens_at: '',
      registration_closes_at: '',
      is_recurring: false,
      recurrence_pattern: 'none',
      recurrence_end_date: ''
    })
    setEditingId(null)
    setShowForm(false)
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

  const calculateInstanceCount = () => {
    if (!formData.date_time || !formData.recurrence_end_date || !formData.is_recurring) {
      return 0
    }

    const start = new Date(formData.date_time)
    const end = new Date(formData.recurrence_end_date)

    if (start >= end) {
      return 0
    }

    const diffMs = end.getTime() - start.getTime()

    if (formData.recurrence_pattern === 'weekly') {
      const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
      return Math.min(weeks + 1, 52)
    } else if (formData.recurrence_pattern === 'monthly') {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      return Math.min(months + 1, 52)
    }

    return 0
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2">📅 Zarządzanie Zajęciami</h1>
          <p className="text-gray-600">Twórz, edytuj i zarządzaj wszystkimi zajęciami</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              + Dodaj zajęcia
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-600 mb-4">
            {editingId ? 'Edytuj zajęcia' : 'Nowe zajęcia'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nazwa zajęć *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trener *
                </label>
                <select
                  value={formData.trainer_id}
                  onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Wybierz trenera</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data i godzina *
                </label>
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Czas trwania (minuty) *
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                  min="15"
                  step="15"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maksymalna liczba uczestników *
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Koszt (zł) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lokalizacja *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Anulowanie (godz. przed zajęciami) *
                </label>
                <input
                  type="number"
                  value={formData.cancellation_hours}
                  onChange={(e) => setFormData({ ...formData, cancellation_hours: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Okna rejestracji */}
              <div className="col-span-2 border-t-2 border-purple-200 pt-4 mt-4">
                <h3 className="text-lg font-bold text-purple-600 mb-3">⏰ Okna rejestracji (opcjonalnie)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Określ kiedy zapisy są otwarte. Pozostaw puste aby zapisy były otwarte od razu do rozpoczęcia zajęć.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zapisy otwarte od
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registration_opens_at || ''}
                      onChange={(e) => setFormData({ ...formData, registration_opens_at: e.target.value || '' })}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pozostaw puste aby zapisy były otwarte od razu
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zapisy zamknięte o
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registration_closes_at || ''}
                      onChange={(e) => setFormData({ ...formData, registration_closes_at: e.target.value || '' })}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pozostaw puste aby zapisy były otwarte do początku zajęć
                    </p>
                  </div>
                </div>
              </div>

              {/* Zajęcia cykliczne */}
              <div className="border-t-2 border-purple-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring || false}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                    className="h-5 w-5 text-purple-600 rounded"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-semibold text-gray-700">
                    🔄 Zajęcia cykliczne (powtarzające się)
                  </label>
                </div>

                {formData.is_recurring && (
                  <div className="space-y-4 pl-8 border-l-4 border-purple-300">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Częstotliwość *
                      </label>
                      <select
                        value={formData.recurrence_pattern || 'weekly'}
                        onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      >
                        <option value="weekly">Co tydzień</option>
                        <option value="monthly">Co miesiąc</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Powtarzaj do *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.recurrence_end_date || ''}
                        onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                        required={formData.is_recurring}
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    {formData.date_time && formData.recurrence_end_date && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ℹ️ Zostanie utworzonych <strong>{calculateInstanceCount()}</strong> zajęć.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Pierwsze zajęcia będą rodzicielskie (szablon), pozostałe zostaną wygenerowane automatycznie.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="scheduled">Zaplanowane</option>
                  <option value="completed">Zakończone</option>
                  <option value="cancelled">Anulowane</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {editingId ? 'Zapisz zmiany' : 'Utwórz zajęcia'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-purple-600">
          Wszystkie zajęcia ({activities.length})
        </h2>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-gray-600">Brak zajęć w systemie</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-purple-600">{activity.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activity.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.status === 'scheduled' ? 'Zaplanowane' :
                       activity.status === 'completed' ? 'Zakończone' :
                       'Anulowane'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>

                  <div className="grid md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(activity.date_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span>{activity.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>Max {activity.max_participants} osób</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-purple-600">
                      <span>💰</span>
                      <span>{activity.cost.toFixed(2)} zł</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>⚠️</span>
                      <span>Anulowanie: {activity.cancellation_hours}h</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
                  >
                    ✏️ Edytuj
                  </button>
                  {activity.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancel(activity.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm"
                    >
                      ✗ Anuluj
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminActivitiesPage
