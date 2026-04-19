import { APP_VERSION } from '../version'
import PublicHamburgerMenu from '../components/PublicHamburgerMenu'

interface NewsItem {
  title: string
  date: string
  description: string
  link: string
  emoji: string
  imageUrl: string
}

interface NewsPageProps {
  user?: any
  profile?: {
    display_name: string
    role: string
  }
  onSignOut?: () => void
}

const NewsPage = ({ user, profile }: NewsPageProps) => {
  const isLoggedIn = !!user && !!profile
  const news: NewsItem[] = [
    {
      title: "Turniej badmintona za nami!",
      date: "2026-01-19",
      description: "Podsumowanie UNICORNS BADMIN DOUBLES CHAMPIONSHIP 2025 - 66 zawodników, 10 miast, 73 mecze w 3 kategoriach (D/C/B)",
      link: "/news/turniej-badmintona-2025",
      emoji: "🏸",
      imageUrl: "https://www.unicorns.org.pl/7cda174a-f0e8-4bbd-a8bb-163fe72f0f2a.a3ae51e1.jpeg"
    },
    {
      title: "UNICORNS BADMIN DOUBLES CHAMPIONSHIP 2025",
      date: "2025-09-21",
      description: "Ogłoszenie ogólnopolskiego tęczowego turnieju badmintona na 22 listopada 2025 w Łodzi",
      link: "https://www.unicorns.org.pl/unicorns-badmin-doubles-championship-2025/",
      emoji: "🏆",
      imageUrl: "https://www.unicorns.org.pl/52670a15-0eb4-42b5-9540-bfb4f309316b.9ae74eb6.jpeg"
    },
    {
      title: "SPOTKANIE WZC",
      date: "2025-01-19",
      description: "Informacja o Walnym Zebraniu Członków zaplanowanym na 03.02.2025",
      link: "https://www.unicorns.org.pl/spotkanie-wzc/",
      emoji: "🏛️",
      imageUrl: "https://www.unicorns.org.pl/logo1_final_rainbow_nl1.aa5735ec.png"
    },
    {
      title: "WESOŁYCH ŚWIĄT",
      date: "2024-12-22",
      description: "Życzenia świąteczne od całego Stowarzyszenia Unicorns",
      link: "https://www.unicorns.org.pl/wesolych-swiat/",
      emoji: "🎄",
      imageUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop"
    },
    {
      title: "FINAŁ MINI LIGI SIATKÓWKI ZA NAMI",
      date: "2024-12-15",
      description: "Podsumowanie UNICORNS SMASH - TRIPLES COMPETITION (7.11-12.12.2024), zwycięzcy: UNHOLY TRINITY",
      link: "https://www.unicorns.org.pl/final-mini-ligi-siatkowki-za-nami/",
      emoji: "🏐",
      imageUrl: "https://www.unicorns.org.pl/90505925-5436-41a3-85f2-0cb53a7efe8f.7b2d2c97.jpeg"
    },
    {
      title: "FINAŁ MINI LIGI BADMINTONA ZA NAMI",
      date: "2024-11-19",
      description: "Relacja z turnieju UNICORNS BAD CUP – DOUBLES 2024, ponad 40 uczestników, dwa poziomy zaawansowania",
      link: "https://www.unicorns.org.pl/final-mini-ligi-badmintona-za-nami/",
      emoji: "🏸",
      imageUrl: "https://www.unicorns.org.pl/06553c86-8884-432f-8b69-83aad2bcba30.a12e81cd.jpeg"
    },
    {
      title: "BAL ROGACZA, CZYLI PIERWSZE URODZINY STOWARZYSZENIA UNICORNS",
      date: "2024-10-14",
      description: "Zapowiedź imprezy urodzinowej z podsumowaniem pierwszego roku działalności",
      link: "https://www.unicorns.org.pl/bal-rogacza-1-urodziny-unicorns/",
      emoji: "🎉",
      imageUrl: "https://www.unicorns.org.pl/unicorns_urodziny.815e15a7.jpg"
    },
    {
      title: "ZAPISY NA TURNIEJ SIATKÓWKI",
      date: "2024-10-04",
      description: "Informacja o zapisach na Mini Ligę Siatkówki",
      link: "https://www.unicorns.org.pl/zapisy-na-turnej-siatkowki/",
      emoji: "🏐",
      imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop"
    },
    {
      title: "SEKCJA SIATKÓWKI RUSZYŁA",
      date: "2024-10-03",
      description: "Relacja z pierwszego spotkania sekcji UNICORNS SIATKÓWKA",
      link: "https://www.unicorns.org.pl/sekcja-siatkowki-ruszyla/",
      emoji: "🏐",
      imageUrl: "https://images.unsplash.com/photo-1593787157977-95bfbf688d7a?w=400&h=300&fit=crop"
    },
    {
      title: "ZAPISY NA TURNIEJ BADMINTONA",
      date: "2024-10-01",
      description: "Ogłoszenie zapisów na Mini Ligę Badmintona",
      link: "https://www.unicorns.org.pl/zapisy-na-turniej-badmintona/",
      emoji: "🏸",
      imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop"
    }
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={isLoggedIn ? '' : 'min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200'}>
      {/* Header tylko dla niezalogowanych - zalogowani używają headera z App.tsx */}
      {!isLoggedIn && (
        <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-sm shadow-lg border-b-4 border-purple-500 relative z-[10000]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src="/unicorns-logo.png"
                alt="Unicorns Łódź"
                className="h-10 sm:h-12 md:h-16 w-auto flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                  Unicorns Łódź
                </h1>
                <p className="hidden sm:block text-xs text-gray-300 uppercase tracking-wide">Sport | Kultura | Rozrywka</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <PublicHamburgerMenu />
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl border-2 border-purple-300 p-8 mb-8 text-center">
          <div className="text-7xl mb-4">📰🦄</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Aktualności
          </h2>
          <p className="text-xl text-purple-600 mb-2">
            Co słychać w społeczności Unicorns?
          </p>
          <p className="text-sm text-gray-600">
            Najnowsze wydarzenia, turnieje i ogłoszenia
          </p>
        </div>

        {/* News Grid */}
        <div className="space-y-6">
          {news.map((item, index) => (
            <button
              key={index}
              onClick={() => window.location.href = item.link}
              className="w-full text-left block bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <div className="flex flex-col md:flex-row">
                {/* Zdjęcie */}
                <div className="md:w-1/3 flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 md:h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Treść */}
                <div className="flex-1 p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl flex-shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-600 hover:text-purple-700 mb-2">
                        {item.title}
                      </h3>
                      <div className="text-xs text-gray-500 mb-2">
                        📅 {formatDate(item.date)}
                      </div>
                      <p className="text-gray-700 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                        <span>Czytaj więcej</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>Więcej aktualności</span>
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Wszystkie najnowsze informacje znajdziesz również na naszych social mediach!
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.facebook.com/groups/604562728465563"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all"
            >
              <img src="/facebook-icon.svg" alt="" className="h-4 w-4" />
              Facebook
            </a>
            <a
              href="https://www.instagram.com/unicorns_lodz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm transition-all"
            >
              <img src="/instagram-icon.svg" alt="" className="h-4 w-4" />
              Instagram
            </a>
            <a
              href="https://www.unicorns.org.pl/category/aktualnosci/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-all"
            >
              🌐 Strona WWW
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 text-xs text-gray-500 mb-3">
            <button
              onClick={() => window.location.href = '/'}
              className="hover:text-purple-600 transition-colors"
            >
              Strona główna
            </button>
            <span>•</span>
            <button
              onClick={() => window.location.href = '/about-app'}
              className="hover:text-purple-600 transition-colors"
            >
              O aplikacji
            </button>
            <span>•</span>
            <button
              onClick={() => window.location.href = '/donations'}
              className="hover:text-purple-600 transition-colors"
            >
              Wsparcie
            </button>
            <span>•</span>
            <a
              href="/polityka-prywatnosci.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 transition-colors"
            >
              Polityka prywatności
            </a>
            <span>•</span>
            <a
              href="/regulamin-zajec.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 transition-colors"
            >
              Regulamin zajęć
            </a>
          </div>
          <p className="text-xs text-gray-500">© 2026 Stowarzyszenie Unicorns. Wszystkie prawa zastrzeżone.</p>
          <p className="text-xs text-gray-500 mt-1">Aplikacja stworzona z magią jednorożców 🦄🌈✨</p>
          <p className="text-xs text-gray-400 mt-2">Wersja {APP_VERSION}</p>
        </div>
      </footer>
    </div>
  )
}

export default NewsPage
