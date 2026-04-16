import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

interface NavigationProps {
  userRole: 'user' | 'trainer' | 'admin'
}

export const Navigation: React.FC<NavigationProps> = ({ userRole }) => {
  const { t } = useTranslation()

  const navItems = {
    user: [
      { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
      { to: '/activities', label: t('nav.activities'), icon: '🏃' },
      { to: '/my-classes', label: t('nav.myClasses'), icon: '📅' },
      { to: '/profile', label: t('nav.profile'), icon: '👤' },
    ],
    trainer: [
      { to: '/trainer/dashboard', label: t('nav.dashboard'), icon: '🏠' },
      { to: '/trainer/activities', label: t('nav.activities'), icon: '🏃' },
      { to: '/profile', label: t('nav.profile'), icon: '👤' },
    ],
    admin: [
      { to: '/admin/dashboard', label: t('nav.dashboard'), icon: '🏠' },
      { to: '/admin/activities', label: t('nav.activities'), icon: '🏃' },
      { to: '/admin/users', label: t('nav.admin'), icon: '👥' },
      { to: '/profile', label: t('nav.profile'), icon: '👤' },
    ],
  }

  const items = navItems[userRole] || navItems.user

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b-2 border-unicorn-lavender sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-rainbow-gradient text-white shadow-rainbow'
                    : 'text-unicorn-purple hover:bg-unicorn-lavender'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
