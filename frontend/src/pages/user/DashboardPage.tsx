import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { UnicornHeader } from '@/components/common/UnicornHeader'
import { Navigation } from '@/components/common/Navigation'
import { UnicornCard } from '@/components/common/UnicornCard'
import { BalanceDisplay } from '@/components/common/BalanceDisplay'
import { UnicornButton } from '@/components/common/UnicornButton'

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { profile, signOut } = useAuth()

  if (!profile) return null

  return (
    <div className="min-h-screen">
      <UnicornHeader user={profile} onLogout={signOut} />
      <Navigation userRole={profile.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-rainbow mb-2">
            {t('dashboard.welcome', { name: profile.display_name })}
          </h1>
          <p className="text-gray-600">
            Witaj w systemie zarządzania zajęciami sportowymi! 🦄
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Balance card */}
          <UnicornCard title={t('dashboard.myBalance')}>
            <BalanceDisplay balance={profile.balance} size="lg" />
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 Saldo zostanie pomniejszone po oznaczeniu obecności przez trenera</p>
            </div>
          </UnicornCard>

          {/* Quick actions */}
          <UnicornCard title={t('dashboard.quickActions')}>
            <div className="space-y-3">
              <Link to="/activities">
                <UnicornButton className="w-full">
                  🏃 {t('dashboard.browseActivities')}
                </UnicornButton>
              </Link>
              <Link to="/my-classes">
                <UnicornButton variant="outline" className="w-full">
                  📅 {t('nav.myClasses')}
                </UnicornButton>
              </Link>
              <Link to="/profile">
                <UnicornButton variant="ghost" className="w-full">
                  👤 {t('nav.profile')}
                </UnicornButton>
              </Link>
            </div>
          </UnicornCard>
        </div>

        {/* Decorative unicorn */}
        <div className="mt-12 text-center">
          <div className="text-9xl animate-bounce-slow inline-block">
            🦄
          </div>
          <p className="text-unicorn-purple font-semibold mt-4">
            Zapisz się na zajęcia i ciesz się aktywnością! 🌈
          </p>
        </div>
      </main>
    </div>
  )
}
