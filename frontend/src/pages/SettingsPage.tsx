import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { useInstallPWA } from '../hooks/useInstallPWA'
import { usePushNotifications } from '../hooks/usePushNotifications'
import PWADebugPanel from '../components/PWADebugPanel'

interface UserProfile {
  id: string
  email: string
  display_name: string
  role: string
}

interface NotificationSettings {
  push_enabled: boolean
  email_enabled: boolean
  activity_reminders: boolean
  new_activities: boolean
  balance_alerts: boolean
  member_news: boolean
}

const SettingsPage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { isInstallable, isInstalled, promptInstall } = useInstallPWA()
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications()

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    activity_reminders: true,
    new_activities: true,
    balance_alerts: true,
    member_news: true
  })

  // Other settings
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })

  useEffect(() => {
    fetchProfile()
    loadNotificationSettings()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationSettings = () => {
    // TODO: Załaduj ustawienia z localStorage lub backend
    const saved = localStorage.getItem('notification_settings')
    if (saved) {
      setNotificationSettings(JSON.parse(saved))
    }
  }

  const saveNotificationSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings)
    localStorage.setItem('notification_settings', JSON.stringify(newSettings))
    // TODO: Zapisz na backend
  }

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    const newValue = !notificationSettings[key]
    let newSettings = { ...notificationSettings, [key]: newValue }

    // Jeśli włączamy/wyłączamy główne powiadomienia (push/email),
    // automatycznie włącz/wyłącz wszystkie powiązane powiadomienia
    if (key === 'push_enabled' || key === 'email_enabled') {
      newSettings = {
        ...newSettings,
        activity_reminders: newValue,
        new_activities: newValue,
        balance_alerts: newValue,
        member_news: newValue
      }
    }

    saveNotificationSettings(newSettings)
  }

  const handleChangePassword = async () => {
    if (!passwordData.new || passwordData.new.length < 6) {
      alert('Nowe hasło musi mieć minimum 6 znaków')
      return
    }

    if (passwordData.new !== passwordData.confirm) {
      alert('Nowe hasła nie są identyczne')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error

      alert('✅ Hasło zostało zmienione')
      setShowChangePasswordModal(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Wystąpił błąd podczas zmiany hasła')
    }
  }

  const handleExportData = async () => {
    if (!confirm('Czy chcesz pobrać wszystkie swoje dane w formacie JSON?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pobierz wszystkie dane użytkownika
      const [profileRes, registrationsRes, transactionsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('registrations').select('*, activities(*)').eq('user_id', user.id),
        supabase.from('balance_transactions').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        export_date: new Date().toISOString(),
        profile: profileRes.data,
        registrations: registrationsRes.data,
        transactions: transactionsRes.data,
        notification_settings: notificationSettings
      }

      // Pobierz jako JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unicorns_data_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      alert('✅ Dane zostały pobrane')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Wystąpił błąd podczas eksportu danych')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'USUŃ MOJE KONTO') {
      alert('Wpisz "USUŃ MOJE KONTO" aby potwierdzić')
      return
    }

    try {
      // Wywołaj Edge Function
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: profile?.id }
      })

      if (error) throw error

      if (data.error) {
        alert(`❌ ${data.error}`)
        return
      }

      alert('✅ Konto zostało usunięte. Zostaniesz wylogowany.')

      // Wyloguj użytkownika
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      alert(`Wystąpił błąd: ${error.message}`)
    } finally {
      setShowDeleteAccountModal(false)
      setDeleteConfirmation('')
    }
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">⚙️ Ustawienia</h1>
          <p className="text-gray-600">Zarządzaj preferencjami i ustawieniami konta</p>
        </div>
      </div>

      {/* Ustawienia powiadomień */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">🔔 Preferencje powiadomień</h2>
        <p className="text-sm text-gray-600 mb-4">Wybierz, o czym chcesz być powiadamiany</p>

        <div className="space-y-4">
          {/* Push notifications - główny toggle */}
          {isSupported && (
            <div className="flex items-center justify-between py-3 border-b border-gray-200 bg-purple-50 -mx-6 px-6">
              <div>
                <p className="font-semibold text-purple-800">🔔 Powiadomienia Push</p>
                <p className="text-xs text-purple-600">
                  {isSubscribed ? '✓ Włączone - otrzymujesz powiadomienia' : 'Włącz aby otrzymywać powiadomienia w aplikacji'}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (isSubscribed) {
                    await unsubscribeFromPush()
                    // Wyłącz wszystkie powiązane powiadomienia
                    const newSettings = {
                      ...notificationSettings,
                      push_enabled: false,
                      activity_reminders: false,
                      new_activities: false,
                      balance_alerts: false,
                      member_news: false
                    }
                    saveNotificationSettings(newSettings)
                  } else {
                    await subscribeToPush()
                    // Włącz wszystkie powiązane powiadomienia
                    const newSettings = {
                      ...notificationSettings,
                      push_enabled: true,
                      activity_reminders: true,
                      new_activities: true,
                      balance_alerts: true,
                      member_news: true
                    }
                    saveNotificationSettings(newSettings)
                  }
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  isSubscribed ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isSubscribed ? 'translate-x-6' : ''
                }`}></div>
              </button>
            </div>
          )}

          {/* Activity reminders */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">⏰ Przypomnienia o zajęciach</p>
              <p className="text-xs text-gray-500">Powiadomienie 2h przed zajęciami</p>
            </div>
            <button
              onClick={() => handleToggleNotification('activity_reminders')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificationSettings.activity_reminders ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notificationSettings.activity_reminders ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* New activities */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">🆕 Nowe zajęcia</p>
              <p className="text-xs text-gray-500">Powiadomienie o nowych aktywnościach</p>
            </div>
            <button
              onClick={() => handleToggleNotification('new_activities')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificationSettings.new_activities ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notificationSettings.new_activities ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Balance alerts */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">💰 Alerty salda</p>
              <p className="text-xs text-gray-500">Powiadomienie gdy saldo jest niskie</p>
            </div>
            <button
              onClick={() => handleToggleNotification('balance_alerts')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificationSettings.balance_alerts ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notificationSettings.balance_alerts ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Member news */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">📰 Aktualności Stowarzyszenia</p>
              <p className="text-xs text-gray-500">Nowości i ogłoszenia dla członków</p>
            </div>
            <button
              onClick={() => handleToggleNotification('member_news')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificationSettings.member_news ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notificationSettings.member_news ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Email notifications */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 bg-blue-50 -mx-6 px-6">
            <div>
              <p className="font-semibold text-blue-800">📧 Powiadomienia email</p>
              <p className="text-xs text-blue-600">Otrzymuj ważne informacje na email</p>
            </div>
            <button
              onClick={() => handleToggleNotification('email_enabled')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificationSettings.email_enabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notificationSettings.email_enabled ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Instalacja PWA */}
      {!isInstalled && (
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl shadow-lg p-6 text-white mb-6">
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
                      <li>Kliknij przycisk "Udostępnij" 📤 w Safari</li>
                      <li>Wybierz "Dodaj do ekranu początkowego"</li>
                      <li>Kliknij "Dodaj"</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isInstalled && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6">
          <span className="text-3xl">✅</span>
          <div>
            <p className="font-semibold text-green-800">Aplikacja zainstalowana!</p>
            <p className="text-sm text-green-600">Korzystasz z pełnej wersji PWA Unicorns.</p>
          </div>
        </div>
      )}

      {/* Bezpieczeństwo i prywatność */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-purple-600 mb-4">🔒 Bezpieczeństwo i prywatność</h2>

        <div className="space-y-3">
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔑</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Zmień hasło</p>
                <p className="text-xs text-gray-500">Zaktualizuj hasło do konta</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Eksportuj dane</p>
                <p className="text-xs text-gray-500">Pobierz kopię swoich danych</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => navigate('/account')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Zarządzaj kontem</p>
                <p className="text-xs text-gray-500">Zobacz informacje o koncie i saldo</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Strefa niebezpieczna */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Strefa niebezpieczna</h2>
        <p className="text-sm text-red-700 mb-4">
          Te akcje są nieodwracalne. Upewnij się przed kontynuowaniem.
        </p>

        <button
          onClick={() => setShowDeleteAccountModal(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
        >
          🗑️ Usuń konto
        </button>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-purple-600 mb-4">🔑 Zmień hasło</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nowe hasło
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="Minimum 6 znaków"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Potwierdź nowe hasło
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Wpisz ponownie nowe hasło"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChangePasswordModal(false)
                  setPasswordData({ current: '', new: '', confirm: '' })
                }}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
              >
                Zmień hasło
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Usuń konto</h3>
              <p className="text-gray-700 mb-4">
                Czy na pewno chcesz usunąć swoje konto? Ta akcja jest <strong>nieodwracalna</strong>.
              </p>
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-red-800 font-semibold mb-2">Zostaną usunięte:</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Wszystkie Twoje dane osobowe</li>
                  <li>Historia transakcji i rezerwacji</li>
                  <li>Powiadomienia i subskrypcje</li>
                  <li>Dostęp do konta i aplikacji</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Wpisz dokładnie: <span className="text-red-600">USUŃ MOJE KONTO</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="USUŃ MOJE KONTO"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'USUŃ MOJE KONTO'}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Usuń konto na zawsze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Debug Panel - tylko dla adminów */}
      {profile?.role === 'admin' && (
        <div className="mt-8">
          <PWADebugPanel />
        </div>
      )}
    </div>
  )
}

export default SettingsPage
