import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  balance_before: number
  balance_after: number
  created_at: string
}

const MemberBalancePage = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number>(0)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [lastCharge, setLastCharge] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchMembershipData()
  }, [])

  const fetchMembershipData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setUserId(user.id)

      // Check if user is association member
      const { data: profile } = await supabase
        .from('users')
        .select('is_association_member, membership_fee_plan, last_membership_charge')
        .eq('id', user.id)
        .single()

      if (!profile?.is_association_member) {
        navigate('/')
        return
      }

      setPlan(profile.membership_fee_plan || 'monthly')
      setLastCharge(profile.last_membership_charge)

      // Get membership activity type
      const { data: membershipType } = await supabase
        .from('activity_types')
        .select('id')
        .eq('name', 'Członkostwo')
        .single()

      if (!membershipType) {
        console.error('Membership activity type not found')
        return
      }

      // Fetch balance
      const { data: balanceData } = await supabase
        .from('user_section_balances')
        .select('balance')
        .eq('user_id', user.id)
        .eq('activity_type_id', membershipType.id)
        .single()

      setBalance(balanceData?.balance || 0)

      // Fetch transaction history
      const { data: transactionsData } = await supabase
        .from('balance_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type_id', membershipType.id)
        .order('created_at', { ascending: false })

      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error fetching membership data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (newPlan: 'monthly' | 'yearly') => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ membership_fee_plan: newPlan })
        .eq('id', userId)

      if (error) throw error

      setPlan(newPlan)
      alert(`✅ Plan zmieniony na ${newPlan === 'monthly' ? 'miesięczny' : 'roczny'}`)
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('❌ Nie udało się zmienić planu')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'membership_fee_payment':
        return 'Wpłata składki'
      case 'membership_fee_charge':
        return 'Naliczenie składki'
      case 'manual_credit':
        return 'Uznanie ręczne'
      case 'manual_debit':
        return 'Obciążenie ręczne'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">💰</div>
          <p className="text-purple-600">Ładowanie danych składki...</p>
        </div>
      </div>
    )
  }

  const balanceStatus = balance >= 0
    ? { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: '✅', message: 'Składka opłacona' }
    : { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: '⚠️', message: 'Zaległość w składce' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>💰</span>
              Składka Członkowska
            </h1>
            <p className="text-gray-600">Zarządzaj swoją składką i sprawdź historię płatności</p>
          </div>
          <button
            onClick={() => navigate('/member-zone')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Balance & Plan */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <div className={`rounded-xl border-2 ${balanceStatus.borderColor} ${balanceStatus.bgColor} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{balanceStatus.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Aktualne saldo</h3>
                  <p className={`text-sm ${balanceStatus.color} font-semibold`}>{balanceStatus.message}</p>
                </div>
              </div>

              <p className={`text-4xl font-bold ${balanceStatus.color} mb-4`}>
                {balance.toFixed(2)} zł
              </p>

              {lastCharge && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">Ostatnie naliczenie:</p>
                  <p className="text-sm text-gray-800">{formatDate(lastCharge)}</p>
                </div>
              )}
            </div>

            {/* Plan Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
              <h3 className="text-xl font-bold text-purple-600 mb-4">Plan składki</h3>

              <div className="space-y-3">
                <button
                  onClick={() => handlePlanChange('monthly')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    plan === 'monthly'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Miesięczny</p>
                      <p className="text-sm text-gray-600">15 zł/miesiąc</p>
                    </div>
                    {plan === 'monthly' && (
                      <span className="text-2xl">✓</span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handlePlanChange('yearly')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    plan === 'yearly'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Roczny</p>
                      <p className="text-sm text-gray-600">160 zł/rok</p>
                      <p className="text-xs text-green-600 font-semibold">Oszczędzasz 20 zł!</p>
                    </div>
                    {plan === 'yearly' && (
                      <span className="text-2xl">✓</span>
                    )}
                  </div>
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 Zmiana planu będzie uwzględniona przy następnym naliczeniu składki
                </p>
              </div>
            </div>

            {/* Payment Button (disabled - future feature) */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
              <h3 className="text-xl font-bold text-purple-600 mb-4">Wpłata składki</h3>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>💳</span>
                <span>Wpłać BLIK (wkrótce)</span>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Funkcja płatności będzie dostępna po integracji z systemem płatniczym
              </p>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-6">Historia transakcji</h3>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📜</span>
                  <p className="text-gray-600">Brak transakcji</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Historia wpłat i naliczeń pojawi się tutaj
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-lg font-semibold ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} zł
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </div>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">Saldo po operacji</p>
                          <p className={`text-lg font-semibold ${
                            transaction.balance_after >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.balance_after.toFixed(2)} zł
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Informacje o składce członkowskiej</span>
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Plan miesięczny:</strong> 15 zł naliczane co miesiąc</li>
            <li>• <strong>Plan roczny:</strong> 160 zł naliczane raz w roku (oszczędność 20 zł)</li>
            <li>• Składka jest automatycznie naliczana przez system zgodnie z wybranym planem</li>
            <li>• Możesz zmienić plan w dowolnym momencie - zmiana zacznie obowiązywać od następnego okresu rozliczeniowego</li>
            <li>• W razie pytań skontaktuj się z zarządem stowarzyszenia</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MemberBalancePage
