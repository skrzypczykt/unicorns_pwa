import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { useNavigate } from 'react-router-dom'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { AccessDenied } from '../../components/AccessDenied'

interface RefundItem {
  id: string
  user_id: string
  activity_id: string
  refund_status: 'none' | 'pending' | 'processed' | 'failed'
  refund_date: string | null
  refund_amount: number | null
  payment_status: string
  created_at: string
  users: {
    display_name: string
    email: string
  }
  activities: {
    name: string
    date_time: string
    cost: number
  }
}

export default function AdminRefundsPage() {
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized } = useRequireAdmin()
  const [refunds, setRefunds] = useState<RefundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'failed'>('pending')

  useEffect(() => {
    fetchRefunds()
  }, [filter])

  const fetchRefunds = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          activity_id,
          refund_status,
          refund_date,
          refund_amount,
          payment_status,
          created_at,
          users!inner (
            display_name,
            email
          ),
          activities!inner (
            name,
            date_time,
            cost
          )
        `)
        .neq('refund_status', 'none')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('refund_status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setRefunds(data || [])
    } catch (error) {
      console.error('Error fetching refunds:', error)
      alert('Błąd podczas ładowania zwrotów')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsProcessed = async (registrationId: string, activityCost: number) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          refund_status: 'processed',
          refund_date: new Date().toISOString(),
          refund_amount: activityCost
        })
        .eq('id', registrationId)

      if (error) throw error

      alert('✅ Zwrot oznaczony jako wykonany')
      await fetchRefunds()
    } catch (error) {
      console.error('Error marking refund as processed:', error)
      alert('Wystąpił błąd podczas aktualizacji statusu')
    }
  }

  const handleMarkAsFailed = async (registrationId: string) => {
    const reason = prompt('Podaj przyczynę niepowodzenia zwrotu:')
    if (!reason) return

    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          refund_status: 'failed',
          refund_date: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (error) throw error

      alert('✅ Zwrot oznaczony jako nieudany')
      await fetchRefunds()
    } catch (error) {
      console.error('Error marking refund as failed:', error)
      alert('Wystąpił błąd podczas aktualizacji statusu')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      processed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: '⏳ Oczekuje',
      processed: '✅ Wykonany',
      failed: '❌ Błąd'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <p className="text-gray-600">Ładowanie zwrotów...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return <AccessDenied />
  }

  const pendingCount = refunds.filter(r => r.refund_status === 'pending').length
  const totalPendingAmount = refunds
    .filter(r => r.refund_status === 'pending')
    .reduce((sum, r) => sum + (r.activities.cost || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Nagłówek */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💸 Zwroty płatności</h1>
            <p className="text-gray-600">
              Zarządzaj zwrotami dla anulowanych zajęć
            </p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Powrót
          </button>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Oczekujące zwroty</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Kwota do zwrotu</p>
            <p className="text-3xl font-bold text-purple-600">{totalPendingAmount} zł</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wszystkie zwroty</p>
            <p className="text-3xl font-bold text-gray-900">{refunds.length}</p>
          </div>
        </div>

        {/* Filtry */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Oczekujące
            </button>
            <button
              onClick={() => setFilter('processed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'processed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Wykonane
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Błędy
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Wszystkie
            </button>
          </div>
        </div>

        {/* Lista zwrotów */}
        {refunds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">Brak zwrotów do wyświetlenia</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zajęcia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data zajęć
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kwota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data zwrotu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{refund.users.display_name}</p>
                          <p className="text-sm text-gray-500">{refund.users.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{refund.activities.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(refund.activities.date_time).toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-900">
                          {refund.refund_amount || refund.activities.cost} zł
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(refund.refund_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {refund.refund_date
                          ? new Date(refund.refund_date).toLocaleDateString('pl-PL')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {refund.refund_status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkAsProcessed(refund.id, refund.activities.cost)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              ✓ Wykonano
                            </button>
                            <button
                              onClick={() => handleMarkAsFailed(refund.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              ✗ Błąd
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instrukcja */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">📋 Jak wykonać zwrot?</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Zaloguj się do panelu bramki płatniczej (np. Stripe, PayPal, Przelewy24)</li>
            <li>Znajdź płatność dla danego użytkownika i zajęć</li>
            <li>Wykonaj zwrot (refund) w panelu bramki</li>
            <li>Po potwierdzeniu zwrotu, kliknij "✓ Wykonano" w tej tabeli</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            💡 W przyszłości zwroty będą automatyczne przez API bramki płatniczej.
          </p>
        </div>
      </div>
    </div>
  )
}
