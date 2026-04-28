import { useNavigate } from 'react-router-dom'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { AccessDenied } from '../../components/AccessDenied'

const AdminMemberZoneManagementPage = () => {
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized } = useRequireAdmin()

  const managementSections = [
    {
      title: 'Aktualności dla członków',
      description: 'Zarządzaj wiadomościami i ogłoszeniami w strefie członka',
      icon: '📰',
      path: '/admin/member-news',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Dokumenty członkowskie',
      description: 'Dodawaj i zarządzaj dokumentami stowarzyszenia',
      icon: '📄',
      path: '/admin/member-documents',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Głosowania',
      description: 'Twórz i zarządzaj głosowaniami dla członków',
      icon: '🗳️',
      path: '/admin/member-polls',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Zarządzanie składkami',
      description: 'Przeglądaj i zarządzaj składkami członkowskimi',
      icon: '💰',
      path: '/admin/member-fees',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏛️ Zarządzanie Strefą Członka
          </h1>
          <p className="text-gray-600">
            Panel administracyjny do zarządzania treściami w strefie członka stowarzyszenia
          </p>
        </div>

        {/* Management Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {managementSections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl hover:scale-105 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-all`}>
                  {section.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {section.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Informacja</h4>
              <p className="text-sm text-blue-800">
                Wszystkie treści zarządzane w tym panelu są widoczne tylko dla członków stowarzyszenia
                (użytkowników z ustawionym <code className="bg-blue-100 px-1 rounded">is_association_member = true</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
          >
            ← Powrót do strony głównej
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminMemberZoneManagementPage
