import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'

interface UserProfile {
  id: string
  email: string
  display_name: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

const EditProfilePage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    display_name: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        display_name: data.display_name || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      alert('❌ Błąd podczas pobierania profilu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Auto-generate display_name jeśli puste
      const displayName = formData.display_name.trim() ||
        `${formData.first_name}${formData.last_name ? ' ' + formData.last_name : ''}`

      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim() || null,
          phone: formData.phone.trim() || null,
          display_name: displayName.trim()
        })
        .eq('id', user.id)

      if (error) throw error

      alert('✅ Profil zaktualizowany!')
      navigate('/account')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('❌ Błąd podczas aktualizacji profilu')
    } finally {
      setSaving(false)
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

  const autoDisplayName = `${formData.first_name}${formData.last_name ? ' ' + formData.last_name : ''}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">✏️ Edytuj Profil</h1>
          <p className="text-gray-600">Zaktualizuj swoje dane osobowe</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imię *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Jan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nazwisko
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Kowalski"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+48 123 456 789"
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wyświetlana nazwa (opcjonalnie)
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder={autoDisplayName}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pozostaw puste aby użyć: {autoDisplayName}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || !formData.first_name.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfilePage
