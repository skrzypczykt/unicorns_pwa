import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PublicHamburgerMenu = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: 'Strona główna', path: '/', icon: '🏠' },
    { label: 'Harmonogram zajęć', path: '/activities', icon: '📅' },
    { label: 'Aktualności', path: '/news', icon: '📰' },
    { label: 'O aplikacji', path: '/about-app', icon: 'ℹ️' },
    { label: 'Wsparcie', path: '/donations', icon: '💝' },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-[9999]"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-br from-purple-900 via-black to-purple-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-purple-300">Unicorns Łódź 🦄</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all text-left"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-purple-700" />

            {/* Login Button */}
            <button
              onClick={() => handleNavigate('/login')}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Zaloguj się
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-purple-700">
            <p className="text-xs text-purple-300 text-center">
              Sport | Kultura | Rozrywka
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicHamburgerMenu
