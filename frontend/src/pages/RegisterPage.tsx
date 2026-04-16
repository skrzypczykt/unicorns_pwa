import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UnicornButton } from '@/components/common/UnicornButton'
import { UnicornCard } from '@/components/common/UnicornCard'
import { useAuth } from '@/hooks/useAuth'

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await signUp(email, password, displayName)

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Show success message
      alert(t('auth.registerSuccess'))
      navigate('/login')
    } catch (err) {
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decorative unicorns */}
      <div className="fixed top-10 right-10 text-6xl opacity-20 animate-bounce-slow">
        🦄
      </div>
      <div className="fixed bottom-10 left-10 text-6xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}>
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

        {/* Register form */}
        <UnicornCard>
          <h2 className="text-2xl font-bold text-unicorn-purple mb-6 text-center">
            {t('auth.register')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.displayName')}
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-unicorn-lavender rounded-lg focus:border-unicorn-purple focus:outline-none focus:ring-2 focus:ring-unicorn-purple/20 transition-all"
                placeholder="Jan Kowalski"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 border-2 border-unicorn-lavender rounded-lg focus:border-unicorn-purple focus:outline-none focus:ring-2 focus:ring-unicorn-purple/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-unicorn-lavender rounded-lg focus:border-unicorn-purple focus:outline-none focus:ring-2 focus:ring-unicorn-purple/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <UnicornButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              {t('auth.signUpButton')}
            </UnicornButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="text-unicorn-purple font-semibold hover:text-unicorn-pink transition-colors"
              >
                {t('auth.signInButton')}
              </Link>
            </p>
          </div>
        </UnicornCard>
      </div>
    </div>
  )
}
