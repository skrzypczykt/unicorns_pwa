import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

interface ActivityType {
  id: string
  name: string
  description: string
  image_url: string | null
  default_trainer_id: string | null
  facebook_group_url: string | null
  active_count?: number
  trainer_name?: string
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
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ActivityType | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    default_trainer_id: '',
    facebook_group_url: ''
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

  const handleEdit = (section: ActivityType) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      description: section.description || '',
      image_url: section.image_url || '',
      default_trainer_id: section.default_trainer_id || '',
      facebook_group_url: section.facebook_group_url || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddNew = () => {
    setEditingSection(null)
    setFormData({
      name: '',
      description: '',
      image_url: '',
      default_trainer_id: '',
      facebook_group_url: ''
    })
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
            facebook_group_url: formData.facebook_group_url || null
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
            facebook_group_url: formData.facebook_group_url || null
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
    setFormData({ name: '', description: '', image_url: '', default_trainer_id: '', facebook_group_url: '' })
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
                Link do grupy Facebook (opcjonalnie)
              </label>
              <input
                type="url"
                value={formData.facebook_group_url}
                onChange={(e) => setFormData({ ...formData, facebook_group_url: e.target.value })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="https://facebook.com/groups/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link będzie widoczny dla uczestników zajęć tej sekcji
              </p>
            </div>

            <div className="flex gap-2">
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

              {section.facebook_group_url && (
                <div className="text-sm">
                  <a
                    href={section.facebook_group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    📘 Grupa Facebook →
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
