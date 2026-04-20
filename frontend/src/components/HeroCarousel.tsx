import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const HeroCarousel = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-przełączanie slajdów co 5 sekund
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const slides = [
    // Slajd 1: Oryginalny kafelek z przyciskiem
    {
      type: 'card' as const,
      content: (
        <div className="h-full flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">📅</span>
              <h2 className="text-xl font-bold text-purple-600">Nadchodzące zajęcia</h2>
            </div>
            <p className="text-gray-600 mb-4">Zobacz dostępne zajęcia sportowe</p>
          </div>
          <button
            onClick={() => navigate('/activities')}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Przeglądaj zajęcia
          </button>
        </div>
      )
    },
    // Slajd 2: Zdjęcie z Google Drive
    {
      type: 'image' as const,
      imageUrl: 'https://lh3.googleusercontent.com/d/1WG71CNLfc4M0XTDo81GsUW6BvkXIbWVj',
      alt: 'Unicorns Łódź - Zajęcia sportowe'
    }
  ]

  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-all">
      {/* Slajdy */}
      <div className="relative h-[280px] md:h-[320px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.type === 'card' ? (
              slide.content
            ) : (
              <div className="h-full w-full relative">
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient dla lepszej czytelności */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Wskaźniki slajdów (dots) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Slajd ${index + 1}`}
          />
        ))}
      </div>

      {/* Strzałki nawigacji (opcjonalne) */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
        aria-label="Poprzedni slajd"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
        aria-label="Następny slajd"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  )
}

export default HeroCarousel
