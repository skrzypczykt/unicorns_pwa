import { useNavigate } from 'react-router-dom'

interface DashboardPageProps {
  profile: {
    display_name: string
    role: string
    balance: number
    email: string
  }
}

const DashboardPage = ({ profile }: DashboardPageProps) => {
  const navigate = useNavigate()

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard Cards */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📅</span>
            <h2 className="text-xl font-bold text-purple-600">Nadchodzące zajęcia</h2>
          </div>
          <p className="text-gray-600 mb-4">Zobacz dostępne zajęcia sportowe</p>
          <button
            onClick={() => navigate('/activities')}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Przeglądaj zajęcia
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🎯</span>
            <h2 className="text-xl font-bold text-purple-600">Moje rezerwacje</h2>
          </div>
          <p className="text-gray-600 mb-4">Sprawdź swoje zapisane zajęcia</p>
          <button
            onClick={() => navigate('/my-classes')}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Moje zajęcia
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">👤</span>
            <h2 className="text-xl font-bold text-purple-600">Profil</h2>
          </div>
          <p className="text-gray-600 mb-4">Zarządzaj swoim kontem</p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Ustawienia
          </button>
        </div>
      </div>

      {/* Role-specific sections */}
      {profile.role === 'trainer' && (
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">✅</span>
            <h2 className="text-2xl font-bold text-purple-600">Panel trenera</h2>
          </div>
          <p className="text-gray-600 mb-4">Oznaczaj obecność na swoich zajęciach</p>
          <button
            onClick={() => navigate('/trainer/classes')}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Moje zajęcia do prowadzenia
          </button>
        </div>
      )}

      {profile.role === 'admin' && (
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">⚙️</span>
            <h2 className="text-2xl font-bold text-purple-600">Panel administratora</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/admin/activities')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Zarządzaj zajęciami
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Zarządzaj użytkownikami
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              📊 Raporty Księgowe
            </button>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              👥 Zarządzaj Obecnością
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 p-6 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl border-2 border-purple-300">
        <div className="flex items-start gap-4">
          <span className="text-6xl">🌈</span>
          <div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">
              Witamy w Stowarzyszeniu Unicorns Łódź! 🦄
            </h3>
            <p className="text-gray-700 mb-3">
              Dołącz do naszej społeczności pasjonatów sportu, kultury i rozrywki!
              Badminton, siatkówka, squash, taniec, gry planszowe i wiele więcej czeka na Ciebie.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Jesteś zalogowany/a jako:</strong> {profile.email}
            </p>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-xs text-gray-600">
                💡 Kliknij na karty powyżej, aby przeglądać zajęcia, zarządzać rezerwacjami lub edytować profil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardPage
