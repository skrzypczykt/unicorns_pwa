import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import NewsCard from '../../components/member-zone/NewsCard'

interface News {
  id: string
  title: string
  content: string
  published_at: string
  is_pinned: boolean
  expires_at: string | null
}

const MemberNewsPage = () => {
  const navigate = useNavigate()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMembershipAndFetchNews()
  }, [])

  const checkMembershipAndFetchNews = async () => {
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

      // Fetch all news (pinned first, then by date)
      const { data: newsData, error } = await supabase
        .from('association_news')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })

      if (error) throw error
      setNews(newsData || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📰</div>
          <p className="text-purple-600">Ładowanie aktualności...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>📰</span>
              Aktualności dla Członków
            </h1>
            <p className="text-gray-600">Ogłoszenia i informacje od stowarzyszenia</p>
          </div>
          <button
            onClick={() => navigate('/member-zone')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>

        {/* News List */}
        {news.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-12 text-center">
            <span className="text-8xl mb-4 block">📰</span>
            <p className="text-gray-600 text-lg">Brak aktualności</p>
            <p className="text-gray-500 text-sm mt-2">
              Nowe ogłoszenia pojawią się tutaj
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                title={item.title}
                content={item.content}
                published_at={item.published_at}
                is_pinned={item.is_pinned}
                expires_at={item.expires_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberNewsPage
