interface DocumentCardProps {
  title: string
  description: string | null
  category: 'statute' | 'resolution' | 'report' | 'other'
  document_url: string
  upload_date: string
}

const DocumentCard = ({ title, description, category, document_url, upload_date }: DocumentCardProps) => {
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
      case 'statute': return 'bg-blue-100 text-blue-700'
      case 'resolution': return 'bg-purple-100 text-purple-700'
      case 'report': return 'bg-green-100 text-green-700'
      case 'other': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
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

  const handleOpenDocument = () => {
    window.open(document_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 transition-all hover:shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-purple-600">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}>
          {getCategoryLabel(category)}
        </span>
      </div>

      {description && (
        <p className="text-gray-600 mb-4 text-sm">{description}</p>
      )}

      <div className="text-sm text-gray-500 mb-4">
        📅 Dodano: {formatDate(upload_date)}
      </div>

      <button
        onClick={handleOpenDocument}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
      >
        <span>📄</span>
        <span>Otwórz dokument</span>
      </button>
    </div>
  )
}

export default DocumentCard
