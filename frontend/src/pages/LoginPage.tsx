import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UnicornButton } from '@/components/common/UnicornButton'
import { UnicornCard } from '@/components/common/UnicornCard'
import { useAuth } from '@/hooks/useAuth'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(t('auth.loginError'))
        return
      }

      // Navigate based on user role (will be handled by route protection)
      navigate('/dashboard')
    } catch (err) {
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decorative unicorns */}
      <div className="fixed top-10 left-10 text-6xl opacity-20 animate-bounce-slow">
        🦄
      </div>
      <div className="fixed bottom-10 right-10 text-6xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}>
        🦄
      </div>

      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce-slow">
            🦄
          </div>
          <h1 className="text-4xl font-bold text-rainbow mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-unicorn-purple">
            Zajęcia Sportowe NGO
          </p>
        </div>

        {/* Login form */}
        <UnicornCard>
          <h2 className="text-2xl font-bold text-unicorn-purple mb-6 text-center">
            {t('auth.login')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-unicorn-lavender rounded-lg focus:border-unicorn-purple focus:outline-none focus:ring-2 focus:ring-unicorn-purple/20 transition-all"
                placeholder="twoj@email.pl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-unicorn-lavender rounded-lg focus:border-unicorn-purple focus:outline-none focus:ring-2 focus:ring-unicorn-purple/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <UnicornButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              {t('auth.signInButton')}
            </UnicornButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link
                to="/register"
                className="text-unicorn-purple font-semibold hover:text-unicorn-pink transition-colors"
              >
                {t('auth.signUpButton')}
              </Link>
            </p>
          </div>
        </UnicornCard>

        {/* Test accounts hint */}
        <div className="mt-6 p-4 bg-unicorn-blue/10 border border-unicorn-blue/30 rounded-lg text-sm text-center">
          <p className="font-semibold text-unicorn-purple mb-2">
            🧪 Konta testowe:
          </p>
          <p className="text-xs text-gray-600">
            admin@unicorn.test | trener1@unicorn.test | user1@unicorn.test
          </p>
        </div>
      </div>
    </div>
  )
}
