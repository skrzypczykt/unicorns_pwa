import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase/client'
import SimpleLoginPage from './pages/SimpleLoginPage'
import RegisterPage from './pages/RegisterPage'
import PublicAboutPage from './pages/PublicAboutPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import ActivitiesPage from './pages/ActivitiesPage'
import MyClassesPage from './pages/MyClassesPage'
import TrainerClassesPage from './pages/TrainerClassesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ProfilePage from './pages/ProfilePage'
import AdminActivitiesPage from './pages/AdminActivitiesPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminAttendancePage from './pages/AdminAttendancePage'
import ActivityParticipantsPage from './pages/ActivityParticipantsPage'
import InstallPWAPrompt from './components/InstallPWAPrompt'
import MemberZonePage from './pages/MemberZonePage'
import MemberNewsPage from './pages/MemberNewsPage'
import MemberDocumentsPage from './pages/MemberDocumentsPage'
import MemberPollsPage from './pages/MemberPollsPage'
import MemberBalancePage from './pages/MemberBalancePage'
import AdminMemberNewsPage from './pages/admin/AdminMemberNewsPage'
import AdminMemberDocumentsPage from './pages/admin/AdminMemberDocumentsPage'
import AdminMemberPollsPage from './pages/admin/AdminMemberPollsPage'
import AdminMemberFeesPage from './pages/admin/AdminMemberFeesPage'

interface UserProfile {
  id: string
  email: string
  display_name: string
  role: string
  balance: number
  is_association_member?: boolean
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
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

  if (!user || !profile) {
    return (
      <BrowserRouter>
        <InstallPWAPrompt />
        <Routes>
          <Route path="/" element={<PublicAboutPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/login" element={<SimpleLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <AppContent user={user} profile={profile} handleSignOut={handleSignOut} />
    </BrowserRouter>
  )
}

const AppContent = ({ user, profile, handleSignOut }: { user: any, profile: any, handleSignOut: () => void }) => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <>
      <InstallPWAPrompt />
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200">
        {/* Header - Responsywny - ukryj na stronie głównej (PublicAboutPage ma własny) */}
        {!isHomePage && profile && (
          <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b-4 border-purple-500">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
            <div className="flex items-center justify-between gap-2">
              {/* Logo + Tytuł - Responsywne */}
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0"
              >
                <img
                  src="/unicorns-logo.png"
                  alt="Unicorns Łódź"
                  className="h-10 sm:h-12 md:h-16 w-auto flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent truncate">
                    Unicorns Łódź
                  </h1>
                  {/* Ukryj tagline na mobile */}
                  <p className="hidden md:block text-xs text-gray-500 uppercase tracking-wide">
                    Sport | Kultura | Rozrywka
                  </p>
                </div>
              </button>

              {/* Saldo + Wyloguj + Profil - Responsywne */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
                {/* Pokaż saldo tylko jeśli jest ujemne i user nie jest external_trainer */}
                {profile.role !== 'external_trainer' && profile.balance < 0 && (
                  <div className="text-right">
                    {/* Ukryj label "Twoje saldo" na mobile */}
                    <p className="hidden sm:block text-xs text-gray-500">Do zapłaty</p>
                    <p className="text-base sm:text-xl md:text-2xl font-bold text-red-600">
                      {profile.balance.toFixed(0)}
                      <span className="hidden sm:inline"> zł</span>
                      <span className="ml-1">💳</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs sm:text-sm font-semibold transition-all"
                >
                  <span className="hidden sm:inline">Wyloguj</span>
                  <span className="sm:hidden">🚪</span>
                </button>

                {/* Profil użytkownika - po prawej */}
                <div className="hidden sm:flex items-center gap-2 text-right">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                      {profile.display_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profile.role === 'admin' ? 'Admin' :
                       profile.role === 'trainer' ? 'Trener' :
                       profile.role === 'external_trainer' ? 'Trener zewnętrzny' : 'User'}
                    </p>
                  </div>
                </div>

                {/* Przycisk ustawień - kółko zębate */}
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                  title="Ustawienia profilu"
                >
                  <span className="text-2xl">⚙️</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        )}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<PublicAboutPage user={user} profile={profile} onSignOut={handleSignOut} />} />
          <Route path="/dashboard" element={<DashboardPage profile={profile} />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/my-classes" element={<MyClassesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/activities" element={<AdminActivitiesPage />} />
          <Route path="/admin/activities/:activityId/participants" element={<ActivityParticipantsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/attendance" element={<AdminAttendancePage />} />
          <Route path="/admin/member-news" element={<AdminMemberNewsPage />} />
          <Route path="/admin/member-documents" element={<AdminMemberDocumentsPage />} />
          <Route path="/admin/member-polls" element={<AdminMemberPollsPage />} />
          <Route path="/admin/member-fees" element={<AdminMemberFeesPage />} />
          <Route path="/member-zone" element={<MemberZonePage />} />
          <Route path="/member-zone/news" element={<MemberNewsPage />} />
          <Route path="/member-zone/documents" element={<MemberDocumentsPage />} />
          <Route path="/member-zone/polls" element={<MemberPollsPage />} />
          <Route path="/member-zone/fees" element={<MemberBalancePage />} />
          <Route path="/admin/*" element={
            <div className="p-8 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">⚙️</div>
              <h1 className="text-3xl font-bold text-purple-600 mb-4">Panel administratora</h1>
              <p className="text-gray-600 mb-6">Ta funkcja będzie wkrótce dostępna!</p>
              <button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                ← Powrót do strony głównej
              </button>
            </div>
          } />
          <Route path="/trainer/classes" element={<TrainerClassesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <footer className="mt-12 py-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              {/* Organization Info */}
              <div>
                <h3 className="text-lg font-bold text-purple-600 mb-2">🦄 Unicorns Łódź</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Stowarzyszenie sportowo-kulturalno-rozrywkowe
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Sport | Kultura | Rozrywka
                </p>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Kontakt</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📧 unicorns.lodz@gmail.com</p>
                  <p>📍 Łódź, Polska</p>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Media społecznościowe</h3>
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/groups/604562728465563"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition-all"
                    title="Facebook"
                  >
                    <img src="/facebook-icon.svg" alt="Facebook" className="h-4 w-4" />
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/unicorns_lodz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs transition-all"
                    title="Instagram"
                  >
                    <img src="/instagram-icon.svg" alt="Instagram" className="h-4 w-4" />
                    Instagram
                  </a>
                  <a
                    href="https://www.unicorns.org.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs transition-all"
                    title="Strona WWW"
                  >
                    🌐 Strona WWW
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-center gap-4 text-xs text-gray-500 mb-3">
                <a
                  href="/polityka-prywatnosci.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-600 transition-colors"
                >
                  Polityka prywatności
                </a>
                <span>•</span>
                <a
                  href="/regulamin-zajec.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-600 transition-colors"
                >
                  Regulamin zajęć
                </a>
              </div>
              <p className="text-xs text-gray-500 text-center">© 2026 Stowarzyszenie Unicorns. Wszystkie prawa zastrzeżone.</p>
              <p className="text-xs text-gray-500 mt-1 text-center">Aplikacja stworzona z magią jednorożców 🦄🌈✨</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App
