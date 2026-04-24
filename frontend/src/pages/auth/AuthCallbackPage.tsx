import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'

const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        setStatus('error')
        return
      }

      setStatus('success')
      setTimeout(() => navigate('/login'), 2000)
    }

    handleEmailConfirmation()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
      {status === 'loading' && (
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Weryfikuję email...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-8">
          <div className="text-8xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-purple-600 mb-2">Email potwierdzony!</h2>
          <p className="text-gray-600">Za chwilę przekierujemy Cię do logowania...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-8">
          <div className="text-8xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Błąd weryfikacji</h2>
          <p className="text-gray-600 mb-4">Link może być nieważny lub wygasł.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-all"
          >
            Wróć do logowania
          </button>
        </div>
      )}
    </div>
  )
}

export default AuthCallbackPage
