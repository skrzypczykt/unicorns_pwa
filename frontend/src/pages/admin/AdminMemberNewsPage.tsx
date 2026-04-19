import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'

interface News {
  id: string
  title: string
  content: string
  author_id: string
  published_at: string
  expires_at: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

const AdminMemberNewsPage = () => {
  const navigate = useNavigate()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    checkAdminAndFetchNews()
  }, [])

  const checkAdminAndFetchNews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        navigate('/')
        return
      }

      await fetchNews()
    } catch (error) {
      console.error('Error checking admin:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('association_news')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching news:', error)
    } else {
      setNews(data || [])
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setExpiresAt('')
    setIsPinned(false)
    setEditingId(null)
  }

  const handleEdit = (item: News) => {
    setEditingId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setExpiresAt(item.expires_at ? item.expires_at.substring(0, 16) : '')
    setIsPinned(item.is_pinned)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('❌ Tytuł i treść są wymagane')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newsData = {
        title: title.trim(),
        content: content.trim(),
        expires_at: expiresAt || null,
        is_pinned: isPinned,
        author_id: user.id
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('association_news')
          .update(newsData)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Ogłoszenie zaktualizowane')
      } else {
        // Insert
        const { error } = await supabase
          .from('association_news')
          .insert(newsData)

        if (error) throw error
        alert('✅ Ogłoszenie dodane')
      }

      resetForm()
      await fetchNews()
    } catch (error: any) {
      console.error('Error saving news:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return

    try {
      const { error } = await supabase
        .from('association_news')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('✅ Ogłoszenie usunięte')
      await fetchNews()
    } catch (error: any) {
      console.error('Error deleting news:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📰</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>📰</span>
              Zarządzanie Ogłoszeniami
            </h1>
            <p className="text-gray-600">Twórz i edytuj aktualności dla członków</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Panel Admin
          </button>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            {editingId ? 'Edytuj ogłoszenie' : 'Nowe ogłoszenie'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tytuł *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Wprowadź tytuł ogłoszenia"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treść *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Wprowadź treść ogłoszenia..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data wygaśnięcia (opcjonalne)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pozostaw puste jeśli ogłoszenie nie ma wygasnąć
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Przypnij na górze</span>
                    <p className="text-xs text-gray-500">Przypięte ogłoszenia są zawsze na początku listy</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                {editingId ? '💾 Zapisz zmiany' : '➕ Dodaj ogłoszenie'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                >
                  ✖️ Anuluj
                </button>
              )}
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            Wszystkie ogłoszenia ({news.length})
          </h2>

          {news.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📰</span>
              <p className="text-gray-600">Brak ogłoszeń</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => {
                const isExpired = item.expires_at && new Date(item.expires_at) < new Date()

                return (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 ${
                      item.is_pinned
                        ? 'border-yellow-400 bg-yellow-50'
                        : isExpired
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-purple-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.is_pinned && (
                            <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
                              📌 PRZYPIĘTE
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded">
                              Wygasłe
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-3 whitespace-pre-wrap">{item.content}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>📅 Opublikowano: {formatDate(item.published_at)}</p>
                          {item.expires_at && (
                            <p className={isExpired ? 'text-red-600 font-semibold' : ''}>
                              ⏰ Wygasa: {formatDate(item.expires_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
                        >
                          ✏️ Edytuj
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                        >
                          🗑️ Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMemberNewsPage
