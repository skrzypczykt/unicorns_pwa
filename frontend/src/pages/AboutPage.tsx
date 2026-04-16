import { useNavigate } from 'react-router-dom'

const AboutPage = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">ℹ️ O Nas</h1>
          <p className="text-gray-600">Poznaj Stowarzyszenie Unicorns Łódź</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-xl border-2 border-purple-300 p-8 mb-8 text-center">
        <img
          src="/unicorns-logo.png"
          alt="Unicorns Łódź"
          className="h-40 w-auto mx-auto mb-4"
        />
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
          Unicorns Łódź
        </h2>
        <p className="text-xl text-purple-600 uppercase tracking-wide">
          Sport | Kultura | Rozrywka
        </p>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Stowarzyszenie sportowo-kulturalno-rozrywkowe łączące pasjonatów aktywnego stylu życia w Łodzi
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
        <h3 className="text-2xl font-bold text-purple-600 mb-4">🎯 Nasza Misja</h3>
        <p className="text-gray-700 leading-relaxed">
          Unicorns Łódź to społeczność ludzi, którzy wierzą, że aktywność fizyczna, kultura i wspólna zabawa
          są kluczem do szczęśliwego życia. Organizujemy różnorodne zajęcia sportowe, wydarzenia kulturalne
          i integracyjne spotkania, które łączą mieszkańców Łodzi w duchu przyjaźni i wzajemnego wsparcia.
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

      {/* Events */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
        <h3 className="text-2xl font-bold text-purple-600 mb-4">🏆 Nasze Wydarzenia</h3>
        <div className="space-y-3">
          <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
            <h4 className="font-bold text-purple-600">Turniej Badmintona 2025</h4>
            <p className="text-sm text-gray-600">Coroczny turniej łączący graczy wszystkich poziomów</p>
          </div>
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
            <h4 className="font-bold text-blue-600">Mini Liga Siatkówki</h4>
            <p className="text-sm text-gray-600">Rekreacyjna liga siatkówki dla miłośników gry zespołowej</p>
          </div>
          <div className="p-3 border-l-4 border-pink-500 bg-pink-50">
            <h4 className="font-bold text-pink-600">Unicorns BadCup</h4>
            <p className="text-sm text-gray-600">Prestiżowy puchar badmintona organizowany przez Unicorns</p>
          </div>
        </div>
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
            <p className="text-xs text-gray-500 mt-2">
              <img src="/whatsapp-icon.svg" alt="" className="inline h-4 w-4 mr-1" />
              Dostępna również grupa WhatsApp - zapytaj na Facebooku!
            </p>
          </div>
        </div>
      </div>

      {/* Join Us */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl shadow-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-3">🦄 Zostań Unicorns!</h3>
        <p className="mb-6 max-w-2xl mx-auto">
          Dołącz do naszej społeczności i odkryj nowe pasje, poznaj wspaniałych ludzi
          i czerp radość z aktywnego stylu życia!
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/activities')}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all"
          >
            Zobacz Zajęcia
          </button>
          <a
            href="https://www.unicorns.org.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all"
          >
            Więcej Informacji
          </a>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
