import { useNavigate } from 'react-router-dom'
import { APP_VERSION } from '../version'
import PublicHamburgerMenu from '../components/PublicHamburgerMenu'

interface LegalNoticePageProps {
  user?: any
  profile?: any
}

const LegalNoticePage = ({ user, profile }: LegalNoticePageProps) => {
  const navigate = useNavigate()
  const isLoggedIn = !!user && !!profile

  return (
    <div className={isLoggedIn ? '' : 'min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200'}>
      {/* Header tylko dla niezalogowanych */}
      {!isLoggedIn && (
        <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-sm shadow-lg border-b-4 border-purple-500 relative z-[10000]">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
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
              </button>
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
          <div className="text-7xl mb-4">⚖️📜</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Nota Prawna
          </h2>
          <p className="text-xl text-purple-600 mb-2">
            Dokumenty i informacje prawne
          </p>
          <p className="text-sm text-gray-600">
            Stowarzyszenie Unicorns - Regulaminy i polityki
          </p>
        </div>

        {/* Statut i Regulaminy */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">📋 Dokumenty statutowe</h3>
          <div className="space-y-3">
            <a
              href="https://www.unicorns.org.pl/wp-content/uploads/2024/11/Statut-Stowarzyszenia-Unicorns.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all border-l-4 border-purple-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <div>
                  <h4 className="font-bold text-purple-700">Statut Stowarzyszenia</h4>
                  <p className="text-sm text-gray-600">Podstawowy dokument określający cele i zasady działania</p>
                </div>
              </div>
            </a>

            <a
              href="/regulamin-zajec.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border-l-4 border-blue-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <div>
                  <h4 className="font-bold text-blue-700">Regulamin zajęć sportowych</h4>
                  <p className="text-sm text-gray-600">Zasady uczestnictwa w zajęciach i wydarzeniach</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Ochrona danych osobowych */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">🔒 Ochrona danych osobowych (RODO)</h3>
          <div className="space-y-3">
            <a
              href="/polityka-prywatnosci.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all border-l-4 border-green-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div>
                  <h4 className="font-bold text-green-700">Polityka prywatności</h4>
                  <p className="text-sm text-gray-600">Jak przetwarzamy i chronimy Twoje dane osobowe</p>
                </div>
              </div>
            </a>

            <a
              href="https://www.unicorns.org.pl/wp-content/uploads/2024/11/Polityka-ochrony-danych-osobowych-Stowarzyszenie-Unicorns.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all border-l-4 border-green-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📋</span>
                <div>
                  <h4 className="font-bold text-green-700">Polityka ochrony danych osobowych (pełna wersja PDF)</h4>
                  <p className="text-sm text-gray-600">Szczegółowe informacje o przetwarzaniu danych</p>
                </div>
              </div>
            </a>

            <a
              href="https://www.unicorns.org.pl/wp-content/uploads/2024/11/Klauzula-dotyczaca-ochrony-danych-osobowych-dla-uczestnikow-wydarzen-Stowarzyszenie-Unicorns.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all border-l-4 border-green-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <h4 className="font-bold text-green-700">Klauzula dla uczestników wydarzeń</h4>
                  <p className="text-sm text-gray-600">Informacje RODO dla osób biorących udział w zajęciach</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Media elektroniczne */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">💻 Korzystanie z mediów elektronicznych</h3>
          <div className="space-y-3">
            <a
              href="https://www.unicorns.org.pl/wp-content/uploads/2024/11/Informacja-dotyczaca-korzystania-z-mediow-elektronicznych-strona-www.unicorns_.org_.pl_.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all border-l-4 border-orange-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌐</span>
                <div>
                  <h4 className="font-bold text-orange-700">Strona www.unicorns.org.pl</h4>
                  <p className="text-sm text-gray-600">Zasady korzystania ze strony internetowej</p>
                </div>
              </div>
            </a>

            <a
              href="https://www.unicorns.org.pl/wp-content/uploads/2024/11/Informacja-dotyczaca-korzystania-z-mediow-elektronicznych-poczta-elektroniczna-Stowarzyszenie-Unicorns.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all border-l-4 border-orange-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📧</span>
                <div>
                  <h4 className="font-bold text-orange-700">Poczta elektroniczna</h4>
                  <p className="text-sm text-gray-600">Informacje o komunikacji mailowej</p>
                </div>
              </div>
            </a>

            <a
              href="https://www.unicorns.org.pl/wp-content/uploads/2024/11/Informacja-dotyczaca-korzystania-z-mediow-elektronicznych-portale-Facebook-Messenger-Instagram-WhatsApp-oraz-przekierowania-Stowarzyszenie-Unicorns.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all border-l-4 border-orange-500"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📱</span>
                <div>
                  <h4 className="font-bold text-orange-700">Media społecznościowe</h4>
                  <p className="text-sm text-gray-600">Facebook, Instagram, WhatsApp - zasady korzystania</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Ważne informacje */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Ważne informacje</span>
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              📌 Korzystając z naszych stron internetowych, mediów społecznościowych oraz uczestnicząc w wydarzeniach,
              wyrażasz zgodę na zasady określone w powyższych dokumentach.
            </p>
            <p>
              📌 Możesz w każdej chwili wycofać swoją zgodę, po wcześniejszym poinformowaniu administratora danych osobowych
              drogą elektroniczną na adres: <a href="mailto:unicorns.lodz@gmail.com" className="underline font-semibold">unicorns.lodz@gmail.com</a>
            </p>
            <p>
              📌 Wszystkie dokumenty są chronione prawem autorskim i stanowią własność Stowarzyszenia Unicorns.
            </p>
            <p>
              📌 W przypadku pytań dotyczących ochrony danych osobowych, skontaktuj się z nami: <a href="mailto:unicorns.lodz@gmail.com" className="underline font-semibold">unicorns.lodz@gmail.com</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs text-gray-500 mb-3">
            <button
              onClick={() => navigate('/')}
              className="hover:text-purple-600 transition-colors whitespace-nowrap"
            >
              Strona główna
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => navigate('/news')}
              className="hover:text-purple-600 transition-colors whitespace-nowrap"
            >
              Aktualności
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => navigate('/about-app')}
              className="hover:text-purple-600 transition-colors whitespace-nowrap"
            >
              O aplikacji
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => navigate('/donations')}
              className="hover:text-purple-600 transition-colors whitespace-nowrap"
            >
              Wsparcie
            </button>
          </div>
          <p className="text-xs text-gray-500">© 2026 Stowarzyszenie Unicorns. Wszystkie prawa zastrzeżone.</p>
          <p className="text-xs text-gray-500 mt-1">Aplikacja stworzona z magią jednorożców 🦄🌈✨</p>
          <p className="text-xs text-gray-400 mt-2">Wersja {APP_VERSION}</p>
        </div>
      </footer>
    </div>
  )
}

export default LegalNoticePage
