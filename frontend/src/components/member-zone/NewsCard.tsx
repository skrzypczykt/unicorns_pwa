interface NewsCardProps {
  title: string
  content: string
  published_at: string
  is_pinned: boolean
  expires_at: string | null
}

const NewsCard = ({ title, content, published_at, is_pinned, expires_at }: NewsCardProps) => {
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

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${
      is_pinned ? 'border-yellow-400 bg-yellow-50' : 'border-purple-200'
    } p-6 transition-all hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
          {is_pinned && <span className="text-yellow-500">📌</span>}
          {title}
        </h3>
      </div>

      <div className="text-sm text-gray-500 mb-4 flex items-center gap-4">
        <span>📅 {formatDate(published_at)}</span>
        {expires_at && (
          <span className="text-orange-500">
            ⏰ Wygasa: {formatDate(expires_at)}
          </span>
        )}
      </div>

      <div className="text-gray-700 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  )
}

export default NewsCard
