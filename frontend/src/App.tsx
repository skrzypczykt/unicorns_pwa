import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase/client'
import SimpleLoginPage from './pages/SimpleLoginPage'
import DashboardPage from './pages/DashboardPage'
import ActivitiesPage from './pages/ActivitiesPage'
import MyClassesPage from './pages/MyClassesPage'
import TrainerClassesPage from './pages/TrainerClassesPage'
import AdminUsersPage from './pages/AdminUsersPage'

interface UserProfile {
  id: string
  email: string
  display_name: string
  role: string
  balance: number
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
    return <SimpleLoginPage />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b-4 border-purple-500">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-5xl">🦄</span>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    Rainbow Unicorn Sports
                  </h1>
                  <p className="text-sm text-gray-600">
                    Witaj, {profile.display_name}!
                    <span className="ml-2 px-2 py-1 bg-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                      {profile.role === 'admin' ? 'Administrator' : profile.role === 'trainer' ? 'Trener' : 'Użytkownik'}
                    </span>
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Twoje saldo</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {profile.balance.toFixed(2)} zł 💰
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition-all"
                >
                  Wyloguj
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<DashboardPage profile={profile} />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/my-classes" element={<MyClassesPage />} />
          <Route path="/profile" element={
            <div className="p-8 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">👤</div>
              <h1 className="text-3xl font-bold text-purple-600 mb-4">Profil</h1>
              <p className="text-gray-600 mb-6">Ta funkcja będzie wkrótce dostępna!</p>
              <button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                ← Powrót do strony głównej
              </button>
            </div>
          } />
          <Route path="/admin/users" element={<AdminUsersPage />} />
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

        <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
          <p>🦄 Rainbow Unicorn Sports NGO © 2026</p>
          <p className="mt-1">Zarządzanie zajęciami sportowymi z magią jednorożców! 🌈✨</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
