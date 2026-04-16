import { useState } from 'react'
import { supabase } from '../supabase/client'

const SimpleLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        setError(signInError.message)
      } else {
        console.log('Logged in:', data)
        window.location.reload() // Refresh to show authenticated state
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>

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
