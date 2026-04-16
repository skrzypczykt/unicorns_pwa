import React from 'react'
import { useTranslation } from 'react-i18next'

interface UnicornHeaderProps {
  user?: {
    display_name: string
    role: string
  } | null
  onLogout?: () => void
}

export const UnicornHeader: React.FC<UnicornHeaderProps> = ({ user, onLogout }) => {
  const { t } = useTranslation()

  return (
    <header className="bg-rainbow-gradient shadow-rainbow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-bounce-slow">
              🦄
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t('common.appName')}
              </h1>
              <p className="text-xs text-white/80">
                Zajęcia Sportowe NGO
              </p>
            </div>
          </div>

          {/* User info and actions */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">
                  {user.display_name}
                </p>
                <p className="text-xs text-white/80">
                  {t(`admin.roles.${user.role}`)}
                </p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                >
                  {t('nav.logout')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
