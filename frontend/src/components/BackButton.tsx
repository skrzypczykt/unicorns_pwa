import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const BackButton = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
  }, [])

  // Nie pokazuj na stronie głównej ani na innych systemach
  if (location.pathname === '/' || !isIOS) {
    return null
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed bottom-4 left-4 z-40 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-full shadow-lg transition-all"
      aria-label="Wstecz"
    >
      ← Wstecz
    </button>
  )
}

export default BackButton
