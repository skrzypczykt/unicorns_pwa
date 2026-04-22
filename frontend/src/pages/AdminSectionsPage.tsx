import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

interface ActivityType {
  id: string
  name: string
  description: string
  image_url: string | null
  default_trainer_id: string | null
  whatsapp_group_url: string | null
  active_count?: number
  trainer_name?: string
}

interface RecurringActivity {
  id: string
  name: string
  recurrence_day_of_week: string | null
  recurrence_time: string | null
  recurrence_pattern: string
  recurrence_end_date: string | null
  description: string
  duration_minutes: number
  location: string
  cost: number
  max_participants: number | null
}

interface Trainer {
  id: string
  display_name: string
  email: string
}

const AdminSectionsPage = () => {
  const navigate = useNavigate()
  const [sections, setSections] = useState<ActivityType[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [recurringActivities, setRecurringActivities] = useState<RecurringActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ActivityType | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<RecurringActivity | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    default_trainer_id: '',
    whatsapp_group_url: ''
  })
  const [activityFormData, setActivityFormData] = useState({
    name: '',
    description: '',
    recurrence_day_of_week: '',
    recurrence_time: '',
    recurrence_end_date: '',
    infinite_recurrence: false,
    duration_minutes: 60,
    location: '',
    cost: 30,
    max_participants: 15
  })

  useEffect(() => {
    fetchSections()
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email')
        .in('role', ['trainer', 'external_trainer', 'admin'])
        .order('display_name', { ascending: true })

      if (error) throw error
      setTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    }
  }

  const fetchSections = async () => {
    try {
      // Pobierz typy zajęć z nazwą trenera
      const { data: typesData, error: typesError } = await supabase
        .from('activity_types')
        .select(`
          *,
          users!activity_types_default_trainer_id_fkey (
            display_name
          )
        `)
        .order('name', { ascending: true })

      if (typesError) throw typesError

      // Pobierz liczbę aktywnych zajęć dla każdej sekcji
      const sectionsWithCounts = await Promise.all(
        (typesData || []).map(async (type: any) => {
          const { count } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('activity_type_id', type.id)
            .eq('status', 'scheduled')

          const trainerName = type.users?.display_name || null

          return {
            ...type,
            trainer_name: trainerName,
            active_count: count || 0
          }
        })
      )

      setSections(sectionsWithCounts)
    } catch (error) {
      console.error('Error fetching sections:', error)
      alert('Błąd podczas pobierania sekcji')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecurringActivities = async (sectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, name, description, recurrence_day_of_week, recurrence_time, recurrence_pattern, recurrence_end_date, duration_minutes, location, cost, max_participants')
        .eq('activity_type_id', sectionId)
        .eq('is_recurring', true)
        .is('parent_activity_id', null)
        .order('recurrence_day_of_week', { ascending: true, nullsFirst: false })
        .order('recurrence_time', { ascending: true })

      if (error) throw error
      setRecurringActivities(data || [])
    } catch (error) {
      console.error('Error fetching recurring activities:', error)
    }
  }

  const handleEdit = (section: ActivityType) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      description: section.description || '',
      image_url: section.image_url || '',
      default_trainer_id: section.default_trainer_id || '',
      whatsapp_group_url: section.whatsapp_group_url || ''
    })
    setShowForm(true)
    fetchRecurringActivities(section.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddNew = () => {
    setEditingSection(null)
    setFormData({
      name: '',
      description: '',
      image_url: '',
      default_trainer_id: '',
      whatsapp_group_url: ''
    })
    setRecurringActivities([])
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingSection) {
        // Edycja istniejącej sekcji
        const { error } = await supabase
          .from('activity_types')
          .update({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url || null,
            default_trainer_id: formData.default_trainer_id || null,
            whatsapp_group_url: formData.whatsapp_group_url || null
          })
          .eq('id', editingSection.id)

        if (error) throw error
        alert('✅ Sekcja zaktualizowana')
      } else {
        // Dodawanie nowej sekcji
        const { error } = await supabase
          .from('activity_types')
          .insert({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url || null,
            default_trainer_id: formData.default_trainer_id || null,
            whatsapp_group_url: formData.whatsapp_group_url || null
          })

        if (error) throw error
        alert('✅ Sekcja dodana')
      }

      setShowForm(false)
      fetchSections()
    } catch (error: any) {
      console.error('Error saving section:', error)
      alert(`Błąd: ${error.message}`)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSection(null)
    setRecurringActivities([])
    setFormData({ name: '', description: '', image_url: '', default_trainer_id: '', whatsapp_group_url: '' })
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2">🏷️ Zarządzanie Sekcjami</h1>
          <p className="text-gray-600">Typy zajęć i sekcje sportowe</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {!showForm && (
        <div className="mb-6">
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            + Nowa sekcja
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-600 mb-4">
            {editingSection ? 'Edytuj sekcję' : 'Nowa sekcja'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nazwa sekcji *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="np. Badminton, Siatkówka..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Krótki opis sekcji..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL obrazka (opcjonalnie)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Podaj link do obrazka z Unsplash lub innego serwisu
              </p>

              {/* Podgląd obrazka */}
              {formData.image_url && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Podgląd:</p>
                  <div className="h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-purple-200">
                    <img
                      src={formData.image_url}
                      alt="Podgląd obrazka sekcji"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ''
                        e.currentTarget.alt = '❌ Nie można załadować obrazka'
                        e.currentTarget.className = 'w-full h-full flex items-center justify-center text-red-500 text-sm'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Domyślny trener/organizator (opcjonalnie)
              </label>
              <select
                value={formData.default_trainer_id}
                onChange={(e) => setFormData({ ...formData, default_trainer_id: e.target.value })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Brak domyślnego trenera</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.display_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Trener zostanie automatycznie przypisany do nowych zajęć tej sekcji
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link do grupy WhatsApp (opcjonalnie)
              </label>
              <input
                type="url"
                value={formData.whatsapp_group_url}
                onChange={(e) => setFormData({ ...formData, whatsapp_group_url: e.target.value })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="https://chat.whatsapp.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link zapraszający do grupy WhatsApp tej sekcji
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {editingSection ? 'Zapisz zmiany' : 'Dodaj sekcję'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
              >
                Anuluj
              </button>
            </div>
          </form>

          {/* Recurring Activities Section - After Save Button */}
          {editingSection && recurringActivities.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-600 mb-4">
                🔄 Wydarzenia cykliczne dla tej sekcji
              </h3>

              {editingActivity ? (
                <div className="bg-white p-6 rounded-lg border-2 border-purple-300 mb-4">
                  <h4 className="text-lg font-semibold text-purple-600 mb-4">Edytuj wydarzenie cykliczne</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      const { error } = await supabase
                        .from('activities')
                        .update({
                          name: activityFormData.name,
                          description: activityFormData.description,
                          recurrence_day_of_week: activityFormData.recurrence_day_of_week,
                          recurrence_time: activityFormData.recurrence_time,
                          recurrence_end_date: activityFormData.infinite_recurrence ? null : activityFormData.recurrence_end_date || null,
                          duration_minutes: activityFormData.duration_minutes,
                          location: activityFormData.location,
                          cost: activityFormData.cost,
                          max_participants: activityFormData.max_participants
                        })
                        .eq('id', editingActivity.id)

                      if (error) throw error
                      alert('✅ Wydarzenie zaktualizowane')
                      setEditingActivity(null)
                      fetchRecurringActivities(editingSection.id)
                    } catch (error: any) {
                      console.error('Error updating activity:', error)
                      alert(`Błąd: ${error.message}`)
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa</label>
                      <input
                        type="text"
                        value={activityFormData.name}
                        onChange={(e) => setActivityFormData({ ...activityFormData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label>
                      <textarea
                        value={activityFormData.description}
                        onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dzień tygodnia *</label>
                        <select
                          value={activityFormData.recurrence_day_of_week}
                          onChange={(e) => setActivityFormData({ ...activityFormData, recurrence_day_of_week: e.target.value })}
                          required
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="">Wybierz dzień</option>
                          <option value="Monday">Poniedziałek</option>
                          <option value="Tuesday">Wtorek</option>
                          <option value="Wednesday">Środa</option>
                          <option value="Thursday">Czwartek</option>
                          <option value="Friday">Piątek</option>
                          <option value="Saturday">Sobota</option>
                          <option value="Sunday">Niedziela</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Godzina *</label>
                        <input
                          type="time"
                          value={activityFormData.recurrence_time}
                          onChange={(e) => setActivityFormData({ ...activityFormData, recurrence_time: e.target.value })}
                          required
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Czas trwania (min)</label>
                        <input
                          type="number"
                          value={activityFormData.duration_minutes}
                          onChange={(e) => setActivityFormData({ ...activityFormData, duration_minutes: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Koszt (zł)</label>
                        <input
                          type="number"
                          value={activityFormData.cost}
                          onChange={(e) => setActivityFormData({ ...activityFormData, cost: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Max. uczestników</label>
                        <input
                          type="number"
                          value={activityFormData.max_participants}
                          onChange={(e) => setActivityFormData({ ...activityFormData, max_participants: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lokalizacja</label>
                      <input
                        type="text"
                        value={activityFormData.location}
                        onChange={(e) => setActivityFormData({ ...activityFormData, location: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activityFormData.infinite_recurrence}
                          onChange={(e) => setActivityFormData({ ...activityFormData, infinite_recurrence: e.target.checked })}
                          className="h-4 w-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">Nieskończone powtarzanie</span>
                      </label>
                    </div>

                    {!activityFormData.infinite_recurrence && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Data końcowa</label>
                        <input
                          type="date"
                          value={activityFormData.recurrence_end_date}
                          onChange={(e) => setActivityFormData({ ...activityFormData, recurrence_end_date: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        Zapisz zmiany
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingActivity(null)}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Anuluj
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  {recurringActivities.map(activity => {
                    const dayOfWeek = activity.recurrence_day_of_week
                    const time = activity.recurrence_time?.slice(0, 5)

                    // Translate day to Polish
                    const dayTranslations: { [key: string]: string } = {
                      'Monday': 'Poniedziałek',
                      'Tuesday': 'Wtorek',
                      'Wednesday': 'Środa',
                      'Thursday': 'Czwartek',
                      'Friday': 'Piątek',
                      'Saturday': 'Sobota',
                      'Sunday': 'Niedziela'
                    }

                    const displayDay = dayOfWeek ? dayTranslations[dayOfWeek] || dayOfWeek : null
                    const displayTime = displayDay && time
                      ? `${displayDay} o ${time}`
                      : '⚠️ Brak danych - kliknij Edytuj aby zaktualizować'

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {displayTime}
                            {activity.recurrence_end_date
                              ? ` • do ${new Date(activity.recurrence_end_date).toLocaleDateString('pl-PL')}`
                              : ' • nieskończone'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Czy na pewno chcesz usunąć wydarzenie cykliczne "${activity.name}"? To usunie także wszystkie przyszłe instancje.`)) {
                                try {
                                  const { error } = await supabase
                                    .from('activities')
                                    .delete()
                                    .eq('id', activity.id)

                                  if (error) throw error
                                  alert('✅ Wydarzenie cykliczne usunięte')
                                  fetchRecurringActivities(editingSection.id)
                                } catch (error: any) {
                                  console.error('Error deleting recurring activity:', error)
                                  alert(`Błąd: ${error.message}`)
                                }
                              }
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                          >
                            🗑️ Usuń
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingActivity(activity)
                              setActivityFormData({
                                name: activity.name,
                                description: activity.description,
                                recurrence_day_of_week: activity.recurrence_day_of_week || '',
                                recurrence_time: activity.recurrence_time?.slice(0, 5) || '',
                                recurrence_end_date: activity.recurrence_end_date || '',
                                infinite_recurrence: !activity.recurrence_end_date,
                                duration_minutes: activity.duration_minutes,
                                location: activity.location,
                                cost: activity.cost,
                                max_participants: activity.max_participants || 15
                              })
                            }}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
                          >
                            ✏️ Edytuj
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lista sekcji - ukryj "Inne" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.filter(s => s.name !== 'Inne').map((section) => (
          <div
            key={section.id}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all"
          >
            {section.image_url && (
              <div className="mb-4 h-32 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={section.image_url}
                  alt={section.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
                  }}
                />
              </div>
            )}

            <h3 className="text-xl font-bold text-purple-600 mb-2">
              {section.name}
            </h3>

            {section.description && (
              <p className="text-sm text-gray-600 mb-3">
                {section.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">📊 Aktywnych zajęć:</span>
                <span className="font-semibold">{section.active_count}</span>
              </div>

              {section.trainer_name && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">👤 Domyślny trener:</span>
                  <span className="font-semibold">{section.trainer_name}</span>
                </div>
              )}

              {section.whatsapp_group_url && (
                <div className="text-sm">
                  <a
                    href={section.whatsapp_group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
                  >
                    💬 Grupa WhatsApp →
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => handleEdit(section)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              ✏️ Edytuj
            </button>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🏷️</span>
          <p className="text-gray-600">Brak sekcji. Dodaj pierwszą!</p>
        </div>
      )}
    </div>
  )
}

export default AdminSectionsPage
