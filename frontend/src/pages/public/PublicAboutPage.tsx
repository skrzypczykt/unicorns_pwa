import { useNavigate } from 'react-router-dom'
import Timeline from '../../components/about/Timeline'
import InstagramFeed from '../../components/social/InstagramFeed'
import { useMainWhatsAppChannel } from '../../hooks/useMainWhatsAppChannel'
import { APP_VERSION } from '../../version'
import PublicHamburgerMenu from '../../components/PublicHamburgerMenu'
import { useInstallPWA } from '../../hooks/useInstallPWA'

interface PublicAboutPageProps {
  user?: any
  profile?: {
    display_name: string
    role: string
    balance: number
    email: string
    is_association_member?: boolean
  }
  onSignOut?: () => void
}

const PublicAboutPage = ({ user, profile, onSignOut }: PublicAboutPageProps) => {
  const navigate = useNavigate()
  const { whatsappUrl } = useMainWhatsAppChannel()
  const { isInstalled } = useInstallPWA()
  const isLoggedIn = !!user && !!profile

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

      {/* Zawartość strony O Nas */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl border-2 border-purple-300 p-8 mb-8 text-center">
          <img
            src="/unicorns-logo.png"
            alt="Unicorns Łódź"
            className="h-40 w-auto mx-auto mb-4"
          />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Unicorns Łódź 🦄
          </h2>
          <p className="text-xl text-purple-600 uppercase tracking-wide mb-2">
            Sport | Kultura | Rozrywka
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🏳️‍🌈</span>
            <p className="text-gray-700 font-medium">Przestrzeń inkluzywna dla wszystkich</p>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oficjalne łódzkie stowarzyszenie sportowe - <strong>446 członków</strong> pełnych pozytywnej energii!
          </p>
        </div>

        {/* CTA - Zapisz się */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl shadow-lg p-8 text-white mb-8">
          <h3 className="text-3xl font-bold mb-4 text-center">📝 Zapisz się na zajęcia i weź udział w wydarzeniach!</h3>
          <p className="mb-6 max-w-2xl mx-auto text-center text-lg">
            <strong>446 członków</strong> nie może się mylić! 🏳️‍🌈
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate('/activities')}
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <span>🗓️</span>
              Zobacz harmonogram zajęć i wydarzeń
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Zaloguj się
              </button>
            )}
          </div>
          {!isLoggedIn && (
            <p className="text-sm text-white/80 mt-4 text-center">
              Nie masz konta?{' '}
              <a
                href="/register"
                className="underline font-semibold hover:text-white transition-colors"
              >
                Zarejestruj się
              </a>
            </p>
          )}
        </div>

        {/* Mission */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">🎯 Kim Jesteśmy?</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Jesteśmy <strong>różnorodną drużyną</strong>, która wierzy w siłę płynącą ze wspólnego grania, wspierania się
            i budowania pozytywnej energii. Unicorns Łódź to przestrzeń, gdzie sport spotyka się z kulturą i rozrywką,
            a każdy znajduje coś dla siebie.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Od regularnych treningów i rozgrywek, przez integracyjne spotkania świąteczne, aż po ambitne wyjazdy
            międzynarodowe - tworzymy społeczność opartą na wzajemnym wsparciu, sportowej rywalizacji i poczuciu wspólnoty.
          </p>
        </div>

        {/* Activities */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">🏃 Co Robimy?</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-bold text-purple-600 mb-2">🏸 Sport</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Badminton (turnieje i ligi)</li>
                <li>• Siatkówka (mini ligi)</li>
                <li>• Squash</li>
                <li>• Rowery</li>
                <li>• Kajaki</li>
              </ul>
            </div>

            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-bold text-pink-600 mb-2">🎭 Kultura & Rozrywka</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Taniec</li>
                <li>• Gry planszowe</li>
                <li>• Wydarzenia kulturalne</li>
                <li>• Integracja społeczności</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nasza Historia - Timeline */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">📜 Nasza Historia</h3>
          <Timeline />
        </div>

        {/* Aktualności */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-purple-600">📰 Aktualności</h3>
            <button
              onClick={() => navigate('/news')}
              className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
            >
              Zobacz wszystkie →
            </button>
          </div>
          <div className="space-y-4">
            <a
              href="/news/turniej-badmintona-2025"
              className="block overflow-hidden rounded-xl border-l-4 border-purple-500 bg-purple-50 hover:bg-purple-100 transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src="https://www.unicorns.org.pl/7cda174a-f0e8-4bbd-a8bb-163fe72f0f2a.a3ae51e1.jpeg"
                  alt="Turniej badmintona"
                  className="w-full sm:w-32 h-32 object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex items-start gap-3 p-4 flex-1">
                  <span className="text-3xl">🏸</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-600 mb-1">Turniej badmintona za nami!</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      UNICORNS BADMIN DOUBLES CHAMPIONSHIP 2025 - 66 zawodników, 10 miast, 73 mecze!
                    </p>
                    <p className="text-xs text-gray-500">📅 19 stycznia 2026</p>
                  </div>
                </div>
              </div>
            </a>

            <a
              href="https://www.unicorns.org.pl/final-mini-ligi-siatkowki-za-nami/"
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src="https://www.unicorns.org.pl/90505925-5436-41a3-85f2-0cb53a7efe8f.7b2d2c97.jpeg"
                  alt="Mini Liga Siatkówki"
                  className="w-full sm:w-32 h-32 object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex items-start gap-3 p-4 flex-1">
                  <span className="text-3xl">🏐</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-600 mb-1">Finał Mini Ligi Siatkówki za nami</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      UNICORNS SMASH - TRIPLES COMPETITION, zwycięzcy: UNHOLY TRINITY
                    </p>
                    <p className="text-xs text-gray-500">📅 15 grudnia 2024</p>
                  </div>
                </div>
              </div>
            </a>

            <a
              href="https://www.unicorns.org.pl/bal-rogacza-1-urodziny-unicorns/"
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border-l-4 border-pink-500 bg-pink-50 hover:bg-pink-100 transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src="https://www.unicorns.org.pl/unicorns_urodziny.815e15a7.jpg"
                  alt="Bal Rogacza"
                  className="w-full sm:w-32 h-32 object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex items-start gap-3 p-4 flex-1">
                  <span className="text-3xl">🎉</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-pink-600 mb-1">Pierwsze urodziny Stowarzyszenia!</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Bal Rogacza z podsumowaniem pierwszego roku działalności Unicorns
                    </p>
                    <p className="text-xs text-gray-500">📅 14 października 2024</p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">👥 Nasz Zespół</h3>
          <p className="text-gray-700 mb-4">
            Stowarzyszenie prowadzone jest przez pasjonatów sportu i integracji społecznej:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-semibold text-purple-600">Administracja</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Fryderyk Żeromiński</li>
                <li>• Tomek Pełczewski</li>
                <li>• Adam Prusik</li>
              </ul>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg">
              <p className="font-semibold text-pink-600">Koordynatorzy Wydarzeń</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Przemek Kaleta</li>
                <li>• Tomasz Skrzypczyk</li>
                <li>• Luca Corso</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            ...i wielu innych aktywnych członków tworzących magię Unicorns! 🦄✨
          </p>
        </div>

        {/* Contact & Social */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">📞 Kontakt i Social Media</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> <a href="mailto:unicorns.lodz@gmail.com" className="text-purple-600 hover:underline">unicorns.lodz@gmail.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Lokalizacja:</strong> Łódź, Polska
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">Dołącz do społeczności:</p>
              <div className="flex flex-wrap gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-all font-semibold shadow-lg"
                  >
                    <img src="/whatsapp-icon.svg" alt="" className="h-5 w-5" />
                    Kanał WhatsApp 🦄
                  </a>
                )}
                <a
                  href="https://www.facebook.com/groups/604562728465563"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all"
                >
                  <img src="/facebook-icon.svg" alt="" className="h-5 w-5" />
                  Grupa Facebook
                </a>
                <a
                  href="https://www.instagram.com/unicorns_lodz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm transition-all"
                >
                  <img src="/instagram-icon.svg" alt="" className="h-5 w-5" />
                  Instagram
                </a>
                <a
                  href="https://www.unicorns.org.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-all"
                >
                  🌐 Strona WWW
                </a>
              </div>
              {whatsappUrl && (
                <p className="text-sm text-green-700 font-medium mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                  💬 <strong>Dołącz do głównego kanału WhatsApp!</strong> Aktualności, ogłoszenia, pytania i integracja całej społeczności Unicorns.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instagram Feed */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-purple-600">📸 Nasza Galeria</h3>
            <a
              href="https://www.instagram.com/unicorns_lodz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              Zobacz więcej na Instagram →
            </a>
          </div>
          <InstagramFeed />
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 text-xs text-gray-500 mb-3">
            <button
              onClick={() => navigate('/about-app')}
              className="hover:text-purple-600 transition-colors"
            >
              O aplikacji
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/legal')}
              className="hover:text-purple-600 transition-colors"
            >
              Nota prawna
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

          {/* Przycisk instalacji PWA */}
          {!isInstalled && (
            <button
              onClick={() => {
                // Wyczyść dismissed localStorage żeby pokazać prompt ponownie
                localStorage.removeItem('pwa-install-dismissed-ios')
                localStorage.removeItem('pwa-install-dismissed')
                // Odśwież stronę żeby prompt się pojawił
                window.location.reload()
              }}
              className="mt-4 text-xs text-purple-400 hover:text-purple-600 underline transition-colors"
            >
              📱 Zainstaluj aplikację
            </button>
          )}

          {/* Wyloguj - ukryty na dole dla zalogowanych */}
          {isLoggedIn && onSignOut && (
            <button
              onClick={onSignOut}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline transition-colors block mx-auto"
            >
              Wyloguj się
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default PublicAboutPage
