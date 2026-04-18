import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'

interface Document {
  id: string
  title: string
  description: string | null
  document_url: string
  category: 'statute' | 'resolution' | 'report' | 'other'
  uploaded_by: string
  upload_date: string
  file_size_kb: number | null
  created_at: string
}

const AdminMemberDocumentsPage = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [category, setCategory] = useState<'statute' | 'resolution' | 'report' | 'other'>('other')
  const [fileSizeKb, setFileSizeKb] = useState('')

  useEffect(() => {
    checkAdminAndFetchDocuments()
  }, [])

  const checkAdminAndFetchDocuments = async () => {
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

      await fetchDocuments()
    } catch (error) {
      console.error('Error checking admin:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('association_documents')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
    } else {
      setDocuments(data || [])
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDocumentUrl('')
    setCategory('other')
    setFileSizeKb('')
    setEditingId(null)
  }

  const handleEdit = (doc: Document) => {
    setEditingId(doc.id)
    setTitle(doc.title)
    setDescription(doc.description || '')
    setDocumentUrl(doc.document_url)
    setCategory(doc.category)
    setFileSizeKb(doc.file_size_kb?.toString() || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!title.trim() || !documentUrl.trim()) {
      alert('❌ Tytuł i URL dokumentu są wymagane')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const documentData = {
        title: title.trim(),
        description: description.trim() || null,
        document_url: documentUrl.trim(),
        category,
        file_size_kb: fileSizeKb ? parseInt(fileSizeKb) : null,
        uploaded_by: user.id
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('association_documents')
          .update(documentData)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Dokument zaktualizowany')
      } else {
        // Insert
        const { error } = await supabase
          .from('association_documents')
          .insert(documentData)

        if (error) throw error
        alert('✅ Dokument dodany')
      }

      resetForm()
      await fetchDocuments()
    } catch (error: any) {
      console.error('Error saving document:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dokument?')) return

    try {
      const { error } = await supabase
        .from('association_documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('✅ Dokument usunięty')
      await fetchDocuments()
    } catch (error: any) {
      console.error('Error deleting document:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'statute': return 'Statut'
      case 'resolution': return 'Uchwała'
      case 'report': return 'Raport'
      case 'other': return 'Inne'
      default: return cat
    }
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'statute': return 'bg-purple-500'
      case 'resolution': return 'bg-blue-500'
      case 'report': return 'bg-green-500'
      case 'other': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📄</div>
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
              <span>📄</span>
              Zarządzanie Dokumentami
            </h1>
            <p className="text-gray-600">Dodawaj i edytuj dokumenty stowarzyszenia</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Panel Admin
          </button>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            {editingId ? 'Edytuj dokument' : 'Nowy dokument'}
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
                placeholder="Np. Statut Stowarzyszenia 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opis (opcjonalne)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Krótki opis dokumentu..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL dokumentu *
              </label>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="https://drive.google.com/... lub https://www.dropbox.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link do dokumentu na Google Drive, Dropbox lub innej platformie
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="statute">Statut</option>
                  <option value="resolution">Uchwała</option>
                  <option value="report">Raport</option>
                  <option value="other">Inne</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rozmiar pliku (KB) - opcjonalne
                </label>
                <input
                  type="number"
                  value={fileSizeKb}
                  onChange={(e) => setFileSizeKb(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Np. 1024"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                {editingId ? '💾 Zapisz zmiany' : '➕ Dodaj dokument'}
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

        {/* Documents List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            Wszystkie dokumenty ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📄</span>
              <p className="text-gray-600">Brak dokumentów</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 ${getCategoryColor(doc.category)} text-white text-xs font-semibold rounded`}>
                      {getCategoryLabel(doc.category)}
                    </span>
                    {doc.file_size_kb && (
                      <span className="text-xs text-gray-500">
                        {doc.file_size_kb} KB
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2">{doc.title}</h3>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                  )}

                  <p className="text-xs text-gray-500 mb-3">
                    📅 Dodano: {formatDate(doc.upload_date)}
                  </p>

                  <div className="text-xs text-gray-500 mb-3 break-all">
                    🔗 <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {doc.document_url}
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      ✏️ Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      🗑️ Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMemberDocumentsPage
