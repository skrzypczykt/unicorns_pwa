import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'

interface WebhookEvent {
  id: string
  provider: 'autopay' | 'stripe' | 'payu' | 'tpay'
  order_id: string
  amount: number
  currency: string
  payment_status: 'success' | 'failed' | 'pending' | 'refunded'
  processed_status: 'pending' | 'processing' | 'success' | 'failed' | 'duplicate'
  signature_valid: boolean
  created_at: string
  processed_at: string | null
  error_message: string | null
  users?: {
    display_name: string
    email: string
  }
  registrations?: {
    activities?: {
      name: string
      date_time: string
    }
  }
}

interface Stats {
  provider: string
  total_count: number
  success_count: number
  failed_count: number
  pending_count: number
  total_amount: number
  success_rate: number
}

export default function AdminPaymentsPage() {
  const navigate = useNavigate()
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [daysBack, setDaysBack] = useState(7)

  useEffect(() => {
    checkAdminAndFetch()
  }, [daysBack])

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        navigate('/')
        return
      }

      await Promise.all([fetchWebhookEvents(), fetchStats()])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWebhookEvents = async () => {
    const { data, error } = await supabase
      .from('webhook_events')
      .select(`
        *,
        users (display_name, email),
        registrations (
          activities (name, date_time)
        )
      `)
      .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching webhook events:', error)
    } else {
      setWebhookEvents(data || [])
    }
  }

  const fetchStats = async () => {
    const { data, error } = await supabase
      .rpc('get_webhook_events_summary', { days_back: daysBack })

    if (error) {
      console.error('Error fetching stats:', error)
    } else {
      setStats(data || [])
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`
  }

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'autopay': return 'bg-blue-100 text-blue-700'
      case 'stripe': return 'bg-purple-100 text-purple-700'
      case 'payu': return 'bg-green-100 text-green-700'
      case 'tpay': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return '✅ Sukces'
      case 'failed': return '❌ Błąd'
      case 'pending': return '⏳ Oczekuje'
      case 'duplicate': return '🔁 Powtórny webhook (OK)'
      case 'processing': return '⚙️ Przetwarzanie'
      default: return status
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'success': return 'Płatność pomyślnie przetworzona'
      case 'failed': return 'Błąd podczas przetwarzania płatności'
      case 'pending': return 'Oczekuje na przetworzenie'
      case 'duplicate': return 'Webhook ITN został już wcześniej przetworzony - zabezpieczenie przed podwójnym bookingiem. To jest poprawne zachowanie systemu.'
      case 'processing': return 'Płatność w trakcie przetwarzania'
      default: return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-orange-100 text-orange-700'
      case 'duplicate': return 'bg-gray-100 text-gray-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredEvents = webhookEvents.filter(event => {
    if (filterProvider !== 'all' && event.provider !== filterProvider) return false
    if (filterStatus !== 'all' && event.processed_status !== filterStatus) return false
    return true
  })

  const totalStats = stats.reduce((acc, stat) => ({
    total_count: acc.total_count + Number(stat.total_count),
    success_count: acc.success_count + Number(stat.success_count),
    failed_count: acc.failed_count + Number(stat.failed_count),
    total_amount: acc.total_amount + Number(stat.total_amount)
  }), { total_count: 0, success_count: 0, failed_count: 0, total_amount: 0 })

  const overallSuccessRate = totalStats.total_count > 0
    ? ((totalStats.success_count / totalStats.total_count) * 100).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">💳</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>💳</span>
              Panel Płatności
            </h1>
            <p className="text-gray-600">Historia webhooków i statystyki płatności</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>

        {/* Info Box - Status Explanation */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Wyjaśnienie statusów webhooków</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold text-green-700">✅ Sukces:</span> Płatność pomyślnie przetworzona
            </div>
            <div>
              <span className="font-semibold text-red-700">❌ Błąd:</span> Problem z przetworzeniem płatności
            </div>
            <div>
              <span className="font-semibold text-orange-700">⏳ Oczekuje:</span> Webhook w kolejce do przetworzenia
            </div>
            <div>
              <span className="font-semibold text-gray-700">🔁 Powtórny webhook:</span> Autopay wysłał ten sam webhook wielokrotnie (np. retry). System zignorował duplikat - <strong>to prawidłowe zachowanie</strong> zabezpieczające przed podwójnym bookingiem.
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Wszystkie płatności</div>
            <div className="text-3xl font-bold text-purple-600">{totalStats.total_count}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Sukces</div>
            <div className="text-3xl font-bold text-green-600">{totalStats.success_count}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Błędy</div>
            <div className="text-3xl font-bold text-red-600">{totalStats.failed_count}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Łącznie</div>
            <div className="text-3xl font-bold text-purple-600">
              {formatAmount(totalStats.total_amount, 'PLN')}
            </div>
          </div>
        </div>

        {/* Provider Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Statystyki per dostawca (ostatnie {daysBack} dni)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.provider} className="border-2 border-gray-200 rounded-lg p-4">
                <div className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-3 ${getProviderBadgeColor(stat.provider)}`}>
                  {stat.provider.toUpperCase()}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Płatności:</span>
                    <span className="font-semibold">{stat.total_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success rate:</span>
                    <span className="font-semibold text-green-600">{stat.success_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kwota:</span>
                    <span className="font-semibold">{formatAmount(stat.total_amount, 'PLN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Okres
              </label>
              <select
                value={daysBack}
                onChange={(e) => setDaysBack(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="1">Ostatni dzień</option>
                <option value="7">Ostatnie 7 dni</option>
                <option value="30">Ostatnie 30 dni</option>
                <option value="90">Ostatnie 90 dni</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dostawca
              </label>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Wszyscy</option>
                <option value="autopay">Autopay</option>
                <option value="stripe">Stripe</option>
                <option value="payu">PayU</option>
                <option value="tpay">Tpay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Wszystkie</option>
                <option value="success">Sukces</option>
                <option value="failed">Błąd</option>
                <option value="pending">Oczekuje</option>
                <option value="duplicate">Duplikaty</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dostawca</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zajęcia</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kwota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Podpis</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => {
                  const user = Array.isArray(event.users) ? event.users[0] : event.users
                  const registration = Array.isArray(event.registrations) ? event.registrations[0] : event.registrations
                  const activity = registration?.activities
                    ? (Array.isArray(registration.activities) ? registration.activities[0] : registration.activities)
                    : null

                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(event.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getProviderBadgeColor(event.provider)}`}>
                          {event.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user?.display_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {activity?.name || event.order_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        {formatAmount(event.amount, event.currency)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(event.processed_status)}`}
                          title={getStatusDescription(event.processed_status)}
                        >
                          {getStatusBadge(event.processed_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {event.signature_valid ? (
                          <span className="text-green-600 text-lg" title="Podpis prawidłowy">✓</span>
                        ) : (
                          <span className="text-red-600 text-lg" title="Błędny podpis">✗</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-600">Brak webhooków dla wybranych filtrów</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
