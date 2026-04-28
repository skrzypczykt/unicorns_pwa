import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import PWAInstallButton from '../../components/common/PWAInstallButton'

const SimpleLoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Sprawdź czy błąd to brak potwierdzenia email
        if (signInError.message.includes('email') || signInError.message.includes('confirm') || signInError.message.includes('verify')) {
          setError('⚠️ Najpierw potwierdź swój adres email. Sprawdź skrzynkę pocztową (także folder SPAM).')
        } else {
          setError(signInError.message)
        }
      } else {
        window.location.reload() // Refresh to show authenticated state
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) {
        setError('Błąd logowania przez Google: ' + signInError.message)
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania przez Google')
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

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
            Zaloguj się
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
              {error.includes('potwierdź') && (
                <button
                  onClick={async () => {
                    if (!email) {
                      alert('Wprowadź adres email')
                      return
                    }
                    const { error: resendError } = await supabase.auth.resend({
                      type: 'signup',
                      email: email
                    })
                    if (!resendError) {
                      alert('✅ Email weryfikacyjny wysłany ponownie!')
                    } else {
                      alert('❌ Błąd: ' + resendError.message)
                    }
                  }}
                  className="mt-2 text-sm text-purple-600 underline hover:text-purple-700"
                >
                  Wyślij ponownie email weryfikacyjny
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                placeholder="twoj@email.pl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Hasło
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                Zapomniałeś hasła?
              </a>
            </div>
          </form>

          {/* Google OAuth */}
          <div className="mt-4">
            <div className="relative">
              <div className="text-center text-xs text-gray-500 mb-2">lub</div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Przekierowywanie...' : 'Zaloguj przez Google'}
              </button>
            </div>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nie masz konta?{' '}
              <a
                href="/register"
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Zarejestruj się
              </a>
            </p>
          </div>
        </div>

        {/* Test accounts */}
        <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg text-sm text-center">
          <p className="font-semibold text-purple-600 mb-2">🧪 Konta testowe:</p>
          <p className="text-xs text-gray-600">
            admin@unicorn.test | trener1@unicorn.test | user1@unicorn.test
          </p>
        </div>
      </div>
    </div>
  )
}

export default SimpleLoginPage
