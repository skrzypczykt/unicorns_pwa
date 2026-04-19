import { useNavigate } from 'react-router-dom'
import { APP_VERSION } from '../version'

interface AboutAppPageProps {
  user?: any
  profile?: any
}

const AboutAppPage = ({ user, profile }: AboutAppPageProps) => {
  const navigate = useNavigate()
  const isLoggedIn = !!user && !!profile

  return (
    <div className={isLoggedIn ? '' : 'min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200'}>
      {/* Header tylko dla niezalogowanych - zalogowani używają headera z App.tsx */}
      {!isLoggedIn && (
        <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-sm shadow-lg border-b-4 border-purple-500">
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
          </div>
        </div>
      </header>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl border-2 border-purple-300 p-8 mb-8 text-center">
          <div className="text-7xl mb-4">📱🦄</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Aplikacja Unicorns PWA
          </h2>
          <p className="text-xl text-purple-600 mb-2">
            Twoja mobilna baza wszystkich zajęć i wydarzeń
          </p>
          <p className="text-sm text-gray-600">
            Wersja {APP_VERSION}
          </p>
        </div>

        {/* Co to jest PWA */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">🚀 Czym jest PWA?</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>PWA (Progressive Web App)</strong> to nowoczesna aplikacja webowa, która działa jak natywna aplikacja mobilna.
            Możesz ją zainstalować na telefonie i korzystać z niej <strong>offline</strong>, otrzymywać <strong>powiadomienia push</strong>
            i mieć szybki dostęp z ekranu głównego.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-bold text-purple-600 mb-2">✅ Zalety PWA</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Brak konieczności pobierania z App Store</li>
                <li>• Działa na iOS i Android</li>
                <li>• Małe zużycie pamięci telefonu</li>
                <li>• Automatyczne aktualizacje</li>
                <li>• Szybkie ładowanie</li>
              </ul>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-bold text-pink-600 mb-2">🔔 Funkcje</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Powiadomienia push</li>
                <li>• Działanie offline</li>
                <li>• Instalacja na ekranie głównym</li>
                <li>• Szybkie ładowanie</li>
                <li>• Dostęp z poziomu ikony</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Funkcjonalności aplikacji */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">⭐ Co możesz zrobić w aplikacji?</h3>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
              <h4 className="font-bold text-purple-600">📅 Harmonogram zajęć i wydarzeń</h4>
              <p className="text-sm text-gray-600">Przeglądaj wszystkie zajęcia sportowe, kulturalne i integracyjne</p>
            </div>
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-bold text-blue-600">🎯 Rezerwacje i zapisy</h4>
              <p className="text-sm text-gray-600">Zapisuj się na zajęcia jednym kliknięciem i zarządzaj swoimi rezerwacjami</p>
            </div>
            <div className="p-3 border-l-4 border-pink-500 bg-pink-50">
              <h4 className="font-bold text-pink-600">💰 Saldo i płatności</h4>
              <p className="text-sm text-gray-600">Śledź swoje saldo, historię transakcji i opłacaj zajęcia (BLIK wkrótce!)</p>
            </div>
            <div className="p-3 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-bold text-green-600">🔔 Powiadomienia</h4>
              <p className="text-sm text-gray-600">Otrzymuj przypomnienia o zajęciach, alerty salda i ogłoszenia</p>
            </div>
            <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
              <h4 className="font-bold text-yellow-600">🏛️ Strefa Członka (dla członków Stowarzyszenia)</h4>
              <p className="text-sm text-gray-600">Aktualności, dokumenty, ankiety i składki członkowskie</p>
            </div>
            <div className="p-3 border-l-4 border-red-500 bg-red-50">
              <h4 className="font-bold text-red-600">📱 Grupy WhatsApp</h4>
              <p className="text-sm text-gray-600">Bezpośrednie linki do grup WhatsApp dla każdych zajęć</p>
            </div>
          </div>
        </div>

        {/* Jak zainstalować */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">📲 Jak zainstalować aplikację?</h3>

          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <img src="/apple-icon.png" alt="iOS" className="h-5 w-5" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span>Na iPhone (iOS - Safari):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li>Otwórz aplikację w przeglądarce <strong>Safari</strong></li>
              <li>Kliknij przycisk "Udostępnij" <span className="inline-block text-xl">📤</span> na dole ekranu</li>
              <li>Przewiń w dół i wybierz <strong>"Dodaj do ekranu początkowego"</strong></li>
              <li>Kliknij <strong>"Dodaj"</strong> w prawym górnym rogu</li>
              <li>Gotowe! Ikona Unicorns pojawi się na ekranie głównym 🦄</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span>Na Android (Chrome):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li>Otwórz aplikację w przeglądarce <strong>Chrome</strong></li>
              <li>Pojawi się automatyczny monit "Dodaj Unicorns do ekranu głównego"</li>
              <li>Kliknij <strong>"Zainstaluj"</strong> lub <strong>"Dodaj"</strong></li>
              <li>Alternatywnie: Menu (⋮) → <strong>"Dodaj do ekranu głównego"</strong></li>
              <li>Gotowe! Aplikacja zainstalowana 🎉</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Wskazówka:</strong> Po instalacji możesz korzystać z aplikacji jak z normalnej aplikacji mobilnej,
              także częściowo offline! Powiadomienia push będą działać nawet gdy aplikacja jest zamknięta.
            </p>
          </div>
        </div>

        {/* Technologie */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">🛠️ Technologie</h3>
          <p className="text-gray-700 mb-4">Aplikacja została stworzona z użyciem nowoczesnych technologii:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="font-bold text-blue-600">React</p>
              <p className="text-xs text-gray-600">Frontend</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="font-bold text-purple-600">TypeScript</p>
              <p className="text-xs text-gray-600">Type Safety</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="font-bold text-green-600">Supabase</p>
              <p className="text-xs text-gray-600">Backend</p>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg text-center">
              <p className="font-bold text-pink-600">Tailwind CSS</p>
              <p className="text-xs text-gray-600">Styling</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <p className="font-bold text-yellow-600">PWA</p>
              <p className="text-xs text-gray-600">Progressive</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <p className="font-bold text-red-600">Service Worker</p>
              <p className="text-xs text-gray-600">Offline</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-center">
              <p className="font-bold text-indigo-600">Push API</p>
              <p className="text-xs text-gray-600">Notifications</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <p className="font-bold text-orange-600">Vite</p>
              <p className="text-xs text-gray-600">Build Tool</p>
            </div>
          </div>
        </div>

        {/* Wsparcie i kontakt */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">💬 Pomoc i wsparcie</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Masz pytania lub problemy?</h4>
              <p className="text-sm text-gray-700 mb-2">
                Skontaktuj się z nami:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:unicorns.lodz@gmail.com"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-all"
                >
                  📧 unicorns.lodz@gmail.com
                </a>
                <a
                  href="https://www.facebook.com/groups/604562728465563"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-all"
                >
                  <img src="/facebook-icon.svg" alt="" className="h-4 w-4" />
                  Facebook
                </a>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-2">🐛 Znalazłeś błąd?</h4>
              <p className="text-sm text-gray-700">
                Pomóż nam ulepszyć aplikację! Zgłoś problem lub zaproponuj nową funkcjonalność
                pisząc na <a href="mailto:unicorns.lodz@gmail.com" className="text-purple-600 font-semibold underline">unicorns.lodz@gmail.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Prywatność i bezpieczeństwo */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">🔒 Prywatność i bezpieczeństwo</h3>
          <p className="text-gray-700 mb-4">
            Twoja prywatność jest dla nas ważna. Wszystkie dane są przechowywane bezpiecznie i nie są udostępniane osobom trzecim.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/polityka-prywatnosci.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all"
            >
              📄 Polityka prywatności
            </a>
            <a
              href="/regulamin-zajec.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all"
            >
              📋 Regulamin zajęć
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl shadow-lg p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Dołącz do nas! 🦄</h3>
          <p className="mb-6 text-lg">
            Zainstaluj aplikację, zapisz się na zajęcia i bądź częścią społeczności Unicorns!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold transition-all shadow-lg"
            >
              Zarejestruj się
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg font-semibold transition-all"
            >
              Zaloguj się
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">© 2026 Stowarzyszenie Unicorns. Wszystkie prawa zastrzeżone.</p>
          <p className="text-xs text-gray-500 mt-1">Aplikacja stworzona z magią jednorożców 🦄🌈✨</p>
          <p className="text-xs text-gray-400 mt-2">Wersja {APP_VERSION}</p>
        </div>
      </footer>
    </div>
  )
}

export default AboutAppPage
