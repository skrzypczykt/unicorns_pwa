import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import PushNotificationToggle from '../components/common/PushNotificationToggle'
import { useInstallPWA } from '../hooks/useInstallPWA'
import PWADebugPanel from '../components/PWADebugPanel'

interface Transaction {
  id: string
  amount: number
  balance_before: number
  balance_after: number
  type: string
  description: string
  created_at: string
  reference_id: string | null
}

interface UserProfile {
  id: string
  email: string
  display_name: string
  role: string
  balance: number
  balance_updated_at: string
  created_at: string
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlikModal, setShowBlikModal] = useState(false)
  const { isInstallable, isInstalled, promptInstall } = useInstallPWA()

  useEffect(() => {
    fetchProfile()
    fetchTransactions()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('balance_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'manual_credit': return 'Wpłata manualna'
      case 'manual_debit': return 'Wypłata manualna'
      case 'class_payment': return 'Płatność za zajęcia'
      case 'cancellation_refund': return 'Zwrot - anulowanie'
      default: return type
    }
  }

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Nie udało się załadować profilu</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">👤 Mój Profil</h1>
          <p className="text-gray-600">Zarządzaj swoim kontem i przeglądaj historię transakcji</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Profile Info */}
        <div className="md:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-xl font-bold text-purple-600 mb-4">Informacje o koncie</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Imię i nazwisko</label>
              <p className="text-lg font-semibold text-gray-800">{profile.display_name}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
              <p className="text-lg text-gray-800">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Rola</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                profile.role === 'admin' ? 'bg-red-100 text-red-700' :
                profile.role === 'trainer' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {profile.role === 'admin' ? 'Administrator' : profile.role === 'trainer' ? 'Trener' : 'Użytkownik'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Konto utworzone</label>
              <p className="text-gray-800">{formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">💰</span>
            <h2 className="text-xl font-bold">Twoje saldo</h2>
          </div>
          <p className="text-5xl font-bold mb-4">{profile.balance.toFixed(2)} zł</p>
          <p className="text-sm opacity-90">
            Ostatnia aktualizacja:<br />
            {formatDate(profile.balance_updated_at)}
          </p>

          <div className="mt-6 pt-4 border-t border-white/30">
            <p className="text-sm opacity-75">
              {profile.balance > 100 ? '✅ Świetne saldo!' :
               profile.balance > 50 ? '⚠️ Rozważ doładowanie' :
               '❗ Niskie saldo - opłać zajęcia w historii transakcji'}
            </p>
          </div>
        </div>
      </div>

      {/* BLIK Payment Modal */}
      {showBlikModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">Płatność BLIK</h3>
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-semibold mb-2">⚠️ Wersja testowa aplikacji</p>
                <p className="text-sm text-yellow-700">
                  Płatności BLIK są jeszcze nieaktywne. Ta funkcjonalność będzie dostępna wkrótce.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kwota doładowania (zł)
                </label>
                <input
                  type="number"
                  placeholder="np. 100"
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kod BLIK (6 cyfr)
                </label>
                <input
                  type="text"
                  placeholder="000 000"
                  maxLength={6}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed text-center text-2xl tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBlikModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Zamknij
              </button>
              <button
                disabled
                className="flex-1 px-4 py-3 bg-purple-300 text-white font-semibold rounded-lg cursor-not-allowed opacity-60"
              >
                Zapłać (niedostępne)
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 W pełnej wersji aplikacji będziesz mógł doładować saldo za pomocą BLIK w kilka sekund.
            </p>
          </div>
        </div>
      )}

      {/* Push Notifications Toggle */}
      <div className="mb-8">
        <PushNotificationToggle />
      </div>

      {/* Install PWA Button */}
      {!isInstalled && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">📱</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Zainstaluj aplikację</h3>
                <p className="text-white/90 mb-4 text-sm">
                  Dodaj Unicorns do ekranu głównego dla szybszego dostępu, powiadomień push i możliwości korzystania offline.
                </p>
                <div className="flex flex-wrap gap-2">
                  {isInstallable ? (
                    <button
                      onClick={async () => {
                        const accepted = await promptInstall()
                        if (accepted) {
                          alert('✅ Aplikacja została zainstalowana!')
                        }
                      }}
                      className="px-4 py-2 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold transition-all shadow-lg"
                    >
                      Zainstaluj teraz
                    </button>
                  ) : (
                    <div className="text-sm text-white/80">
                      <p className="mb-2"><strong>Jak zainstalować na iOS:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Kliknij przycisk "Udostępnij" <span className="inline-block">📤</span> w Safari</li>
                        <li>Wybierz "Dodaj do ekranu początkowego"</li>
                        <li>Kliknij "Dodaj"</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isInstalled && (
        <div className="mb-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Aplikacja zainstalowana!</p>
              <p className="text-sm text-green-600">Korzystasz z pełnej wersji PWA Unicorns.</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">
          Historia transakcji ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📊</span>
            <p className="text-gray-600">Brak transakcji</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-purple-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Data</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Opis</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Typ</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Kwota</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Saldo przed</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Saldo po</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-purple-50">
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.type === 'manual_credit' ? 'bg-green-100 text-green-700' :
                        transaction.type === 'manual_debit' ? 'bg-red-100 text-red-700' :
                        transaction.type === 'class_payment' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className={`py-3 px-2 text-right font-bold ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} zł
                    </td>
                    <td className="py-3 px-2 text-right text-sm text-gray-600">
                      {transaction.balance_before.toFixed(2)} zł
                    </td>
                    <td className="py-3 px-2 text-right text-sm font-semibold text-gray-800">
                      {transaction.balance_after.toFixed(2)} zł
                    </td>
                    <td className="py-3 px-2 text-center">
                      {transaction.amount < 0 && (
                        <button
                          onClick={() => setShowBlikModal(true)}
                          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          💳 Opłać
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Wskazówka:</strong> Transakcje typu "Płatność za zajęcia" są automatycznie
          dodawane gdy trener oznaczy Twoją obecność na zajęciach. Wpłaty manualne są dodawane
          przez administratora.
        </p>
      </div>

      {/* PWA Debug Panel - tylko dla adminów */}
      {profile?.role === 'admin' && (
        <div className="mt-8">
          <PWADebugPanel />
        </div>
      )}
    </div>
  )
}

export default ProfilePage
