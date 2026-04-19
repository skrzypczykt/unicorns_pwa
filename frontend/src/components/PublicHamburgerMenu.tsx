import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PublicHamburgerMenu = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6"
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
            {/* Guest Info */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
              <p className="text-sm font-semibold text-gray-800">
                Menu
              </p>
              <p className="text-xs text-gray-600">
                Unicorns Łódź 🦄
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Home */}
              <button
                onClick={() => handleNavigate('/')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>🏠</span>
                <span className="text-sm">Strona główna</span>
              </button>

              {/* Activities */}
              <button
                onClick={() => handleNavigate('/activities')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>📅</span>
                <span className="text-sm">Harmonogram zajęć</span>
              </button>

              {/* News */}
              <button
                onClick={() => handleNavigate('/news')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>📰</span>
                <span className="text-sm">Aktualności</span>
              </button>

              {/* About App */}
              <button
                onClick={() => handleNavigate('/about-app')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>ℹ️</span>
                <span className="text-sm">O aplikacji</span>
              </button>

              {/* Donations */}
              <button
                onClick={() => handleNavigate('/donations')}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span>💝</span>
                <span className="text-sm">Wsparcie</span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-200"></div>

              {/* Login Button */}
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full mx-2 my-2 px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                Zaloguj się
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PublicHamburgerMenu
