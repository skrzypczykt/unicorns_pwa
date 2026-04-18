import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Placeholder - funkcjonalność nie jest jeszcze zaimplementowana
    setTimeout(() => {
      alert('⚠️ Funkcja resetowania hasła będzie wkrótce dostępna!\n\nW razie problemów z logowaniem skontaktuj się z administratorem:\nunicorns.lodz@gmail.com')
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center p-4">
      {/* Przycisk powrotu */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-4 left-4 px-4 py-2 bg-white/80 hover:bg-white text-purple-600 rounded-lg text-sm font-semibold transition-all shadow-md"
      >
        ← Powrót do logowania
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
        </div>

        {/* Reset Password Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-2 text-center">
            Resetuj hasło
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Wpisz adres email powiązany z Twoim kontem
          </p>

          {/* Coming Soon Badge */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <p className="font-semibold text-yellow-800">Funkcja w przygotowaniu</p>
            </div>
            <p className="text-sm text-yellow-700">
              Resetowanie hasła będzie wkrótce dostępne. W razie problemów z logowaniem skontaktuj się z administratorem:
            </p>
            <a
              href="mailto:unicorns.lodz@gmail.com"
              className="text-sm text-purple-600 font-semibold hover:underline block mt-2"
            >
              unicorns.lodz@gmail.com
            </a>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
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
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all bg-gray-50 cursor-not-allowed"
                placeholder="twoj@email.pl"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed opacity-60"
            >
              Wyślij link resetujący (wkrótce)
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pamiętasz hasło?{' '}
              <a
                href="/login"
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Zaloguj się
              </a>
            </p>
          </div>
        </div>

        {/* Help Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-800 mb-2">💡 Potrzebujesz pomocy?</p>
          <p className="text-blue-700 text-xs">
            Jeśli nie możesz się zalogować, skontaktuj się z administratorem przez email lub grupę WhatsApp stowarzyszenia.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
