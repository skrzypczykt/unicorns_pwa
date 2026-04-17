import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    if (!formData.displayName.trim()) {
      setError('Podaj swoje imię i nazwisko')
      return
    }

    setLoading(true)

    try {
      // Create auth user with email redirect to production URL
      // Trigger w bazie danych automatycznie utworzy profil w tabeli users
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            display_name: formData.displayName.trim()
          }
        }
      })

      if (signUpError) {
        // Sprawdź czy to duplikat (użytkownik już istnieje)
        if (signUpError.message.includes('already registered')) {
          throw new Error('To konto już istnieje. Jeśli masz problem z logowaniem, skontaktuj się z administratorem.')
        }
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('Nie udało się utworzyć konta')
      }

      // Sprawdź czy email confirmation jest włączone
      // Jeśli użytkownik jest od razu zalogowany (autoConfirm enabled), przekieruj do home
      if (authData.session) {
        // Email confirmation wyłączone - użytkownik od razu zalogowany
        alert('✅ Konto utworzone! Witaj w Unicorns!')
        navigate('/')
      } else {
        // Email confirmation włączone - pokaż modal
        setShowSuccessModal(true)
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Wystąpił błąd podczas rejestracji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
      {/* Przycisk powrotu */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 px-4 py-2 bg-white/80 hover:bg-white text-purple-600 rounded-lg text-sm font-semibold transition-all shadow-md"
      >
        ← Strona główna
      </button>

      {/* Decorative unicorns */}
      <div className="fixed top-10 left-10 text-6xl opacity-20">🦄</div>
      <div className="fixed bottom-10 right-10 text-6xl opacity-20">🦄</div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/unicorns-logo.png"
            alt="Unicorns Łódź"
            className="h-32 w-auto mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Unicorns Łódź
          </h1>
          <p className="text-purple-600 text-sm uppercase tracking-wide">Sport | Kultura | Rozrywka</p>
          <p className="text-gray-500 text-xs mt-2">Stowarzyszenie sportowo-kulturalno-rozrywkowe</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
            Załóż konto
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                Imię i nazwisko *
              </label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                placeholder="Jan Kowalski"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                placeholder="twoj@email.pl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Hasło *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 znaków</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Potwierdź hasło *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Masz już konto?{' '}
              <Link
                to="/"
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-center">
          <p className="text-blue-800">
            <strong>ℹ️ Informacja:</strong> Konta tworzone przez tę stronę mają domyślnie rolę "Użytkownik".
            Jeśli chcesz zostać trenerem lub potrzebujesz innych uprawnień, skontaktuj się z administratorem.
          </p>
        </div>

        {/* About Organization */}
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
          <p className="text-sm text-purple-800 mb-2">
            🦄 Dołącz do społeczności Unicorns Łódź!
          </p>
          <p className="text-xs text-purple-600">
            Badminton • Siatkówka • Squash • Taniec • Gry planszowe i więcej
          </p>
        </div>
      </div>

      {/* Success Modal - Email Verification */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Sprawdź swoją skrzynkę!</h3>
              <p className="text-gray-700 mb-4">
                Wysłaliśmy email weryfikacyjny na adres:<br />
                <strong className="text-purple-600">{formData.email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>📌 Ważne kroki:</strong>
                </p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Otwórz email od Supabase (może być w folderze SPAM)</li>
                  <li>Kliknij w link "Confirm your email"</li>
                  <li>Po przekierowaniu zaloguj się swoim emailem i hasłem</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Jeśli link nie działa, skopiuj go i wklej bezpośrednio w pasku przeglądarki.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl transition-all"
              >
                Przejdź do logowania
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisterPage
