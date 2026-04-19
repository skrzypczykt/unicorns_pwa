import { useNavigate } from 'react-router-dom'

const DonationsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">💝 Wsparcie Stowarzyszenia</h1>
          <p className="text-gray-600">Pomóż rozwijać Unicorns Łódź</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-xl border-2 border-purple-300 p-8 mb-8 text-center">
        <div className="text-6xl mb-4">🦄✨</div>
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          Dziękujemy za wsparcie!
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Twoje darowizny pomagają nam organizować więcej wydarzeń, treningów i spotkań integracyjnych
          dla całej społeczności Unicorns Łódź.
        </p>
      </div>

      {/* Donation Methods */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Bank Transfer */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏦</span>
            <h3 className="text-xl font-bold text-purple-600">Przelew bankowy</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-800">Stowarzyszenie Unicorns</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Numer konta:</p>
              <p className="font-mono font-bold text-purple-600 break-all">
                [NUMER KONTA - DO UZUPEŁNIENIA]
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              W tytule przelewu wpisz: "Darowizna na cele statutowe"
            </p>
          </div>
        </div>

        {/* Online Payment */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">💳</span>
            <h3 className="text-xl font-bold text-purple-600">Płatność online</h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Szybka i bezpieczna płatność kartą lub BLIK
          </p>
          <button
            onClick={() => alert('🚧 Płatności online będą wkrótce dostępne!\n\nW międzyczasie możesz wspierać nas przelewem bankowym.')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
          >
            Wpłać darowiznę online
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            🔒 Bezpieczne płatności
          </p>
        </div>
      </div>

      {/* Tax Deduction Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-3xl">📋</span>
          <div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">
              Odliczenie podatkowe
            </h3>
            <p className="text-sm text-blue-700">
              Darowizny na rzecz Stowarzyszenia Unicorns mogą być odliczone od podatku zgodnie z art. 26 ust. 1 pkt 9 ustawy o podatku dochodowym od osób fizycznych.
              Po roku otrzymasz od nas potwierdzenie wpłaty, które możesz załączyć do zeznania podatkowego (PIT).
            </p>
          </div>
        </div>
      </div>

      {/* What We Fund */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
        <h3 className="text-xl font-bold text-purple-600 mb-4">💰 Na co przeznaczamy darowizny?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏸</span>
            <div>
              <p className="font-semibold text-gray-800">Sprzęt sportowy</p>
              <p className="text-sm text-gray-600">Rakiety, piłki, siatki i inne akcesoria</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏟️</span>
            <div>
              <p className="font-semibold text-gray-800">Wynajem obiektów</p>
              <p className="text-sm text-gray-600">Hale sportowe i sale treningowe</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-semibold text-gray-800">Turnieje</p>
              <p className="text-sm text-gray-600">Organizacja zawodów i pucharów</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-gray-800">Integracja</p>
              <p className="text-sm text-gray-600">Wyjazdy, spotkania, wydarzenia kulturalne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Note */}
      <div className="mt-8 text-center p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-purple-200">
        <p className="text-lg text-gray-700 mb-2">
          <strong>Każda złotówka się liczy! 🙏</strong>
        </p>
        <p className="text-sm text-gray-600">
          Dzięki Waszemu wsparciu możemy tworzyć coraz więcej niesamowitych wydarzeń dla całej społeczności. 🦄💜
        </p>
      </div>
    </div>
  )
}

export default DonationsPage
