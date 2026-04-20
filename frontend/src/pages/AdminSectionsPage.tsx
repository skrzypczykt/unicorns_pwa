import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

interface ActivityType {
  id: string
  name: string
  description: string
  image_url: string | null
  active_count?: number
}

const AdminSectionsPage = () => {
  const navigate = useNavigate()
  const [sections, setSections] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ActivityType | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  })

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      // Pobierz typy zajęć
      const { data: typesData, error: typesError } = await supabase
        .from('activity_types')
        .select('*')
        .order('name', { ascending: true })

      if (typesError) throw typesError

      // Pobierz liczbę aktywnych zajęć dla każdej sekcji
      const sectionsWithCounts = await Promise.all(
        (typesData || []).map(async (type) => {
          const { count } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('activity_type_id', type.id)
            .eq('status', 'scheduled')

          return {
            ...type,
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
      image_url: section.image_url || ''
    })
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingSection(null)
    setFormData({
      name: '',
      description: '',
      image_url: ''
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
            image_url: formData.image_url || null
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
            image_url: formData.image_url || null
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
    setFormData({ name: '', description: '', image_url: '' })
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

      {/* Lista sekcji */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
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

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                📊 {section.active_count} aktywnych zajęć
              </span>
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
