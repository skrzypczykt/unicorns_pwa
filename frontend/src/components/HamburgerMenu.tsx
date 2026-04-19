import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface HamburgerMenuProps {
  profile: {
    display_name: string
    role: string
    is_association_member?: boolean
  }
  onSignOut: () => void
}

const HamburgerMenu = ({ profile, onSignOut }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-purple-200 z-[9999] overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {profile.display_name}
              </p>
              <p className="text-xs text-gray-600">
                {profile.role === 'admin' ? 'Administrator' :
                 profile.role === 'trainer' ? 'Trener' :
                 profile.role === 'external_trainer' ? 'Trener zewnętrzny' : 'Członek'}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Dashboard */}
              <button
                onClick={() => handleNavigate('/dashboard')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>🏠</span>
                <span className="text-sm">Strefa użytkownika</span>
              </button>

              {/* Activities */}
              <button
                onClick={() => handleNavigate('/activities')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>📅</span>
                <span className="text-sm">Harmonogram zajęć</span>
              </button>

              {/* My Classes */}
              {profile.role !== 'external_trainer' && (
                <button
                  onClick={() => handleNavigate('/my-classes')}
                  className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <span>🎯</span>
                  <span className="text-sm">Moje rezerwacje</span>
                </button>
              )}

              {/* Member Zone */}
              {profile.is_association_member && (
                <button
                  onClick={() => handleNavigate('/member-zone')}
                  className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <span>🏛️</span>
                  <span className="text-sm">Strefa Członka</span>
                </button>
              )}

              <div className="border-t border-gray-200 my-2"></div>

              {/* Profile Settings */}
              <button
                onClick={() => handleNavigate('/profile')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>⚙️</span>
                <span className="text-sm">Ustawienia konta</span>
              </button>

              {/* Donations - placeholder */}
              <button
                onClick={() => handleNavigate('/donations')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>💝</span>
                <span className="text-sm">Wsparcie / Darowizny</span>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Admin/Trainer Sections */}
              {(profile.role === 'trainer' || profile.role === 'external_trainer' || profile.role === 'admin') && (
                <button
                  onClick={() => handleNavigate('/trainer/classes')}
                  className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <span>✅</span>
                  <span className="text-sm">Panel trenera</span>
                </button>
              )}

              {profile.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleNavigate('/admin/activities')}
                    className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <span>📋</span>
                    <span className="text-sm">Zarządzaj zajęciami</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('/admin/users')}
                    className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <span>👥</span>
                    <span className="text-sm">Użytkownicy</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('/admin/reports')}
                    className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <span>📊</span>
                    <span className="text-sm">Raporty księgowe</span>
                  </button>
                </>
              )}

              <div className="border-t border-gray-200 my-2"></div>

              {/* Logout */}
              <button
                onClick={onSignOut}
                className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
              >
                <span>🚪</span>
                <span className="text-sm font-semibold">Wyloguj się</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default HamburgerMenu
