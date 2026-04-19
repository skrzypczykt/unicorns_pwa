import { useNavigate } from 'react-router-dom'

const DonationsPage = () => {
  const navigate = useNavigate()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✅ Skopiowano do schowka!')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">💝 Wsparcie Stowarzyszenia</h1>
        <p className="text-gray-600">Pomóż rozwijać Unicorns Łódź</p>
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
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Odbiorca:</p>
              <p className="font-semibold text-gray-800">Stowarzyszenie UNICORNS</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-300">
              <p className="text-xs text-gray-500 mb-1">Numer konta:</p>
              <p className="font-mono font-bold text-purple-600 text-sm sm:text-base break-all">
                10 1870 1045 2078 1081 1636 0001
              </p>
              <button
                onClick={() => copyToClipboard('10187010452078108116360001')}
                className="mt-2 w-full px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-all"
              >
                📋 Kopiuj numer konta
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">SWIFT (dla przelewów zagranicznych):</p>
              <p className="font-mono font-semibold text-gray-700">NESBPLPW</p>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-300">
              <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Ważne - Tytuł przelewu:</p>
              <p className="font-semibold text-gray-800">
                "Darowizna na cele pożytku publicznego"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Ten tytuł jest wymagany do odliczenia podatkowego
              </p>
            </div>
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
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-3xl">💰</span>
          <div>
            <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
              <span>📋</span> Odliczenie podatkowe
            </h3>
            <div className="space-y-3 text-sm text-green-900">
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-semibold mb-2">✅ Możesz odliczyć darowiznę od podstawy opodatkowania (dochodu)</p>
                <ul className="list-disc list-inside space-y-1 text-green-800">
                  <li>Maksymalna kwota odliczenia: <strong>do 6% Twojego dochodu</strong></li>
                  <li>Dochód = przychód minus koszty jego uzyskania</li>
                  <li>Zachowaj potwierdzenie przelewu bankowego</li>
                  <li>Uwzględnij przy rocznym rozliczeniu PIT</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 font-semibold mb-1">
                  ℹ️ To nie to samo co 1,5% podatku
                </p>
                <p className="text-xs text-blue-700">
                  Darowizna bezpośrednia to inny mechanizm wsparcia niż przekazanie 1,5% podatku w ramach rocznego rozliczenia podatkowego.
                </p>
              </div>

              <p className="text-xs text-gray-600 italic">
                💡 Na życzenie wystawimy potwierdzenie darowizny do rozliczenia podatkowego
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Fund */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
        <h3 className="text-xl font-bold text-purple-600 mb-4">💰 Na co przeznaczamy darowizny?</h3>
        <p className="text-sm text-gray-700 mb-4">
          Środki z darowizn są przeznaczane na <strong>działalność pożytku publicznego</strong> - rozwój i doskonalenie aktywności dla członków oraz sympatyków.
          <strong> Członkowie organizacji nie pobierają z tych środków żadnych korzyści osobistych.</strong>
        </p>
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

      {/* Privacy info */}
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-700">
          🔒 <strong>Ochrona danych osobowych:</strong> Przed dokonaniem darowizny zalecamy zapoznanie się z{' '}
          <a
            href="/polityka-prywatnosci.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 underline hover:text-purple-800"
          >
            informacjami o ochronie danych osobowych
          </a>.
        </p>
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
