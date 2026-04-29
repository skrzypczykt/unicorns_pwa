import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewsCard from '../../components/member-zone/NewsCard'
import MembershipBalanceWidget from '../../components/member-zone/MembershipBalanceWidget'
import {
  getCurrentUser,
  getUserBalance,
  getRecentNews,
  type AssociationNews,
  type MembershipFeePlan
} from '../../supabase/repositories'

type News = AssociationNews

const MemberZonePage = () => {
  const navigate = useNavigate()
  const [recentNews, setRecentNews] = useState<News[]>([])
  const [membershipBalance, setMembershipBalance] = useState<number>(0)
  const [membershipPlan, setMembershipPlan] = useState<MembershipFeePlan>('monthly')
  const [lastCharge, setLastCharge] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userResult = await getCurrentUser()
      if (userResult.error || !userResult.authUser) {
        navigate('/login')
        return
      }

      // Check if user is association member
      if (!userResult.profile?.is_association_member) {
        navigate('/')
        return
      }

      setMembershipPlan(userResult.profile.membership_fee_plan || 'monthly')
      setLastCharge(userResult.profile.last_membership_charge)

      // Fetch membership balance
      const balanceResult = await getUserBalance(userResult.authUser.id)
      if (!balanceResult.error && balanceResult.data) {
        setMembershipBalance(balanceResult.data.balance)
      }

      // Fetch recent news (3 most recent)
      const newsResult = await getRecentNews(3)
      if (!newsResult.error) {
        setRecentNews(newsResult.data)
      }
    } catch (error) {
      console.error('Error fetching member zone data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🏛️</div>
          <p className="text-purple-600">Ładowanie Strefy Członka...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>🏛️</span>
              Strefa Członka
            </h1>
            <p className="text-gray-600">Witaj w dedykowanej strefie dla członków stowarzyszenia!</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate('/member-zone/news')}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="text-5xl mb-3">📰</div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">Aktualności</h3>
            <p className="text-gray-600 text-sm">Ogłoszenia i informacje dla członków</p>
          </button>

          <button
            onClick={() => navigate('/member-zone/documents')}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="text-5xl mb-3">📄</div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">Dokumenty</h3>
            <p className="text-gray-600 text-sm">Statut, uchwały, raporty</p>
          </button>

          <button
            onClick={() => navigate('/member-zone/polls')}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="text-5xl mb-3">🗳️</div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">Głosowania</h3>
            <p className="text-gray-600 text-sm">Głosuj nad uchwałami</p>
          </button>

          <button
            onClick={() => navigate('/member-zone/fees')}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="text-5xl mb-3">💰</div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">Składka</h3>
            <p className="text-gray-600 text-sm">Zarządzaj składką członkowską</p>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Recent News */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-600">Najnowsze ogłoszenia</h2>
              <button
                onClick={() => navigate('/member-zone/news')}
                className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
              >
                Zobacz wszystkie →
              </button>
            </div>

            {recentNews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-8 text-center">
                <span className="text-6xl mb-4 block">📰</span>
                <p className="text-gray-600">Brak aktualności</p>
              </div>
            ) : (
              recentNews.map((news) => (
                <NewsCard
                  key={news.id}
                  title={news.title}
                  content={news.content}
                  published_at={news.published_at}
                  is_pinned={news.is_pinned}
                  expires_at={news.expires_at}
                />
              ))
            )}
          </div>

          {/* Right Column - Membership Balance */}
          <div>
            <h2 className="text-2xl font-bold text-purple-600 mb-6">Twoja składka</h2>
            <MembershipBalanceWidget
              balance={membershipBalance}
              plan={membershipPlan}
              last_charge={lastCharge}
            />

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>Korzyści członkostwa</span>
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Prawo głosu w uchwałach</li>
                <li>• Dostęp do wszystkich dokumentów</li>
                <li>• Uczestnictwo w wydarzeniach</li>
                <li>• Wpływ na rozwój stowarzyszenia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberZonePage
