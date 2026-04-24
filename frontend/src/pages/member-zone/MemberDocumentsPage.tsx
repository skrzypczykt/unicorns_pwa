import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import DocumentCard from '../../components/member-zone/DocumentCard'

interface Document {
  id: string
  title: string
  description: string | null
  document_url: string
  category: 'statute' | 'resolution' | 'report' | 'other'
  upload_date: string
}

const MemberDocumentsPage = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMembershipAndFetchDocuments()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDocuments(documents)
    } else {
      setFilteredDocuments(documents.filter(doc => doc.category === selectedCategory))
    }
  }, [selectedCategory, documents])

  const checkMembershipAndFetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      // Check if user is association member
      const { data: profile } = await supabase
        .from('users')
        .select('is_association_member')
        .eq('id', user.id)
        .single()

      if (!profile?.is_association_member) {
        navigate('/')
        return
      }

      // Fetch all documents
      const { data: docsData, error } = await supabase
        .from('association_documents')
        .select('*')
        .order('upload_date', { ascending: false })

      if (error) throw error
      setDocuments(docsData || [])
      setFilteredDocuments(docsData || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'all': return 'Wszystkie'
      case 'statute': return 'Statut'
      case 'resolution': return 'Uchwały'
      case 'report': return 'Raporty'
      case 'other': return 'Inne'
      default: return cat
    }
  }

  const categories = ['all', 'statute', 'resolution', 'report', 'other']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📄</div>
          <p className="text-purple-600">Ładowanie dokumentów...</p>
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
              Dokumenty
            </h1>
            <p className="text-gray-600">Statut, uchwały, raporty i inne dokumenty stowarzyszenia</p>
          </div>
          <button
            onClick={() => navigate('/member-zone')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {getCategoryLabel(cat)}
                {cat !== 'all' && (
                  <span className="ml-2 text-sm">
                    ({documents.filter(d => d.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-12 text-center">
            <span className="text-8xl mb-4 block">📄</span>
            <p className="text-gray-600 text-lg">
              {selectedCategory === 'all'
                ? 'Brak dokumentów'
                : `Brak dokumentów w kategorii "${getCategoryLabel(selectedCategory)}"`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                description={doc.description}
                category={doc.category}
                document_url={doc.document_url}
                upload_date={doc.upload_date}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberDocumentsPage
