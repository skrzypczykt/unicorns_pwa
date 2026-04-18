import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'

interface Member {
  id: string
  display_name: string
  email: string
  membership_fee_plan: 'monthly' | 'yearly'
  last_membership_charge: string | null
  balance: number
  membership_fee_exempt: boolean
  exemption_reason: string | null
  exemption_granted_by: string | null
  exemption_granted_at: string | null
}

const AdminMemberFeesPage = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [membershipTypeId, setMembershipTypeId] = useState<string | null>(null)

  // Filters
  const [planFilter, setPlanFilter] = useState<'all' | 'monthly' | 'yearly'>('all')
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'positive' | 'negative'>('all')

  // Exemption modal
  const [exemptionModal, setExemptionModal] = useState<{
    userId: string
    userName: string
  } | null>(null)
  const [exemptionData, setExemptionData] = useState({ reason: '' })

  useEffect(() => {
    checkAdminAndFetchMembers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [members, planFilter, balanceFilter])

  const checkAdminAndFetchMembers = async () => {
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

      await fetchMembers()
    } catch (error) {
      console.error('Error checking admin:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
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

      setMembershipTypeId(membershipType.id)

      // Fetch all association members
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, email, membership_fee_plan, last_membership_charge, membership_fee_exempt, exemption_reason, exemption_granted_by, exemption_granted_at')
        .eq('is_association_member', true)
        .order('display_name')

      if (usersError) throw usersError

      if (!usersData) return

      // Fetch balances for all members
      const { data: balancesData } = await supabase
        .from('user_section_balances')
        .select('user_id, balance')
        .eq('activity_type_id', membershipType.id)
        .in('user_id', usersData.map(u => u.id))

      // Combine data
      const membersWithBalances = usersData.map(user => {
        const balanceRecord = balancesData?.find(b => b.user_id === user.id)
        return {
          ...user,
          balance: balanceRecord?.balance || 0
        }
      })

      setMembers(membersWithBalances)
      setFilteredMembers(membersWithBalances)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...members]

    if (planFilter !== 'all') {
      filtered = filtered.filter(m => m.membership_fee_plan === planFilter)
    }

    if (balanceFilter === 'positive') {
      filtered = filtered.filter(m => m.balance >= 0)
    } else if (balanceFilter === 'negative') {
      filtered = filtered.filter(m => m.balance < 0)
    }

    setFilteredMembers(filtered)
  }

  const handleChargeFee = async (userId: string, plan: 'monthly' | 'yearly') => {
    const fee = plan === 'monthly' ? -15.00 : -160.00
    const description = plan === 'monthly' ? 'Składka miesięczna' : 'Składka roczna'

    if (!confirm(`Czy na pewno chcesz naliczyć składkę ${Math.abs(fee)} zł dla tego członka?`)) return

    if (!membershipTypeId) {
      alert('❌ Brak ID typu aktywności Członkostwo')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current balance
      const { data: balanceData } = await supabase
        .from('user_section_balances')
        .select('balance')
        .eq('user_id', userId)
        .eq('activity_type_id', membershipTypeId)
        .single()

      const balanceBefore = balanceData?.balance || 0
      const balanceAfter = balanceBefore + fee

      // Update balance
      if (balanceData) {
        await supabase
          .from('user_section_balances')
          .update({ balance: balanceAfter })
          .eq('user_id', userId)
          .eq('activity_type_id', membershipTypeId)
      } else {
        // Create balance record if doesn't exist
        await supabase
          .from('user_section_balances')
          .insert({
            user_id: userId,
            activity_type_id: membershipTypeId,
            balance: balanceAfter
          })
      }

      // Create transaction
      await supabase
        .from('balance_transactions')
        .insert({
          user_id: userId,
          amount: fee,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          type: 'membership_fee_charge',
          activity_type_id: membershipTypeId,
          description,
          created_by: user.id
        })

      // Update last charge date
      await supabase
        .from('users')
        .update({ last_membership_charge: new Date().toISOString() })
        .eq('id', userId)

      alert('✅ Składka naliczona')
      await fetchMembers()
    } catch (error: any) {
      console.error('Error charging fee:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleAddPayment = async (userId: string) => {
    const amountStr = prompt('Podaj kwotę wpłaty (zł):')
    if (!amountStr) return

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      alert('❌ Nieprawidłowa kwota')
      return
    }

    if (!membershipTypeId) {
      alert('❌ Brak ID typu aktywności Członkostwo')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current balance
      const { data: balanceData } = await supabase
        .from('user_section_balances')
        .select('balance')
        .eq('user_id', userId)
        .eq('activity_type_id', membershipTypeId)
        .single()

      const balanceBefore = balanceData?.balance || 0
      const balanceAfter = balanceBefore + amount

      // Update balance
      if (balanceData) {
        await supabase
          .from('user_section_balances')
          .update({ balance: balanceAfter })
          .eq('user_id', userId)
          .eq('activity_type_id', membershipTypeId)
      } else {
        await supabase
          .from('user_section_balances')
          .insert({
            user_id: userId,
            activity_type_id: membershipTypeId,
            balance: balanceAfter
          })
      }

      // Create transaction
      await supabase
        .from('balance_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          type: 'membership_fee_payment',
          activity_type_id: membershipTypeId,
          description: 'Wpłata składki członkowskiej',
          created_by: user.id
        })

      alert('✅ Wpłata dodana')
      await fetchMembers()
    } catch (error: any) {
      console.error('Error adding payment:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleChangePlan = async (userId: string, newPlan: 'monthly' | 'yearly') => {
    if (!confirm(`Czy na pewno chcesz zmienić plan na ${newPlan === 'monthly' ? 'miesięczny' : 'roczny'}?`)) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ membership_fee_plan: newPlan })
        .eq('id', userId)

      if (error) throw error

      alert('✅ Plan zmieniony')
      await fetchMembers()
    } catch (error: any) {
      console.error('Error changing plan:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleChargeAll = async () => {
    if (!confirm('Czy na pewno chcesz naliczyć składkę WSZYSTKIM członkom (oprócz zwolnionych)?')) return

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const member of members) {
      // Skip exempt members
      if (member.membership_fee_exempt) {
        skippedCount++
        continue
      }
      try {
        const fee = member.membership_fee_plan === 'monthly' ? -15.00 : -160.00
        const description = member.membership_fee_plan === 'monthly' ? 'Składka miesięczna' : 'Składka roczna'

        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !membershipTypeId) continue

        const { data: balanceData } = await supabase
          .from('user_section_balances')
          .select('balance')
          .eq('user_id', member.id)
          .eq('activity_type_id', membershipTypeId)
          .single()

        const balanceBefore = balanceData?.balance || 0
        const balanceAfter = balanceBefore + fee

        if (balanceData) {
          await supabase
            .from('user_section_balances')
            .update({ balance: balanceAfter })
            .eq('user_id', member.id)
            .eq('activity_type_id', membershipTypeId)
        } else {
          await supabase
            .from('user_section_balances')
            .insert({
              user_id: member.id,
              activity_type_id: membershipTypeId,
              balance: balanceAfter
            })
        }

        await supabase
          .from('balance_transactions')
          .insert({
            user_id: member.id,
            amount: fee,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            type: 'membership_fee_charge',
            activity_type_id: membershipTypeId,
            description,
            created_by: user.id
          })

        await supabase
          .from('users')
          .update({ last_membership_charge: new Date().toISOString() })
          .eq('id', member.id)

        successCount++
      } catch (error) {
        console.error(`Error charging member ${member.id}:`, error)
        errorCount++
      }
    }

    alert(`✅ Naliczono składki: ${successCount} udanych${skippedCount > 0 ? `, ${skippedCount} pominiętych (zwolnieni)` : ''}${errorCount > 0 ? `, ${errorCount} błędów` : ''}`)
    await fetchMembers()
  }

  const handleGrantExemption = async () => {
    if (!exemptionModal || !exemptionData.reason.trim()) {
      alert('❌ Powód zwolnienia jest wymagany')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('users')
        .update({
          membership_fee_exempt: true,
          exemption_reason: exemptionData.reason,
          exemption_granted_by: user.id,
          exemption_granted_at: new Date().toISOString()
        })
        .eq('id', exemptionModal.userId)

      // Opcjonalnie: zapisz w historii
      await supabase
        .from('membership_exemption_history')
        .insert({
          user_id: exemptionModal.userId,
          action: 'granted',
          reason: exemptionData.reason,
          granted_by: user.id
        })

      alert('✅ Członek zwolniony ze składki')
      setExemptionModal(null)
      setExemptionData({ reason: '' })
      await fetchMembers()
    } catch (error: any) {
      console.error('Error granting exemption:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const revokeExemption = async (userId: string) => {
    if (!confirm('Na pewno chcesz cofnąć zwolnienie ze składki?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('users')
        .update({
          membership_fee_exempt: false,
          exemption_reason: null,
          exemption_granted_by: null,
          exemption_granted_at: null
        })
        .eq('id', userId)

      // Opcjonalnie: zapisz w historii
      await supabase
        .from('membership_exemption_history')
        .insert({
          user_id: userId,
          action: 'revoked',
          reason: null,
          granted_by: user.id
        })

      alert('✅ Zwolnienie cofnięte')
      await fetchMembers()
    } catch (error: any) {
      console.error('Error revoking exemption:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nigdy'
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">💰</div>
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
              <span>💰</span>
              Zarządzanie Składkami
            </h1>
            <p className="text-gray-600">Naliczaj składki i zarządzaj wpłatami członków</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Panel Admin
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan:</label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">Wszystkie</option>
                  <option value="monthly">Miesięczny</option>
                  <option value="yearly">Roczny</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Saldo:</label>
                <select
                  value={balanceFilter}
                  onChange={(e) => setBalanceFilter(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">Wszystkie</option>
                  <option value="positive">Opłacone (≥0)</option>
                  <option value="negative">Zaległości (&lt;0)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleChargeAll}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              ⚡ Nalicz wszystkim
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-4">
            <p className="text-sm text-gray-600">Wszyscy członkowie</p>
            <p className="text-3xl font-bold text-purple-600">{members.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-4">
            <p className="text-sm text-gray-600">Opłacone</p>
            <p className="text-3xl font-bold text-green-600">
              {members.filter(m => m.balance >= 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-4">
            <p className="text-sm text-gray-600">Zaległości</p>
            <p className="text-3xl font-bold text-red-600">
              {members.filter(m => m.balance < 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4">
            <p className="text-sm text-gray-600">Wyświetlono</p>
            <p className="text-3xl font-bold text-blue-600">{filteredMembers.length}</p>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Członek</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Saldo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Ostatnie naliczenie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-600">
                      Brak członków spełniających kryteria
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-purple-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800">{member.display_name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {member.membership_fee_exempt ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              ✅ Zwolniony
                            </span>
                            {member.exemption_reason && (
                              <span
                                className="text-xs text-gray-500 cursor-help"
                                title={member.exemption_reason}
                              >
                                ({member.exemption_reason.substring(0, 20)}{member.exemption_reason.length > 20 ? '...' : ''})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Standardowo</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.membership_fee_plan}
                          onChange={(e) => handleChangePlan(member.id, e.target.value as any)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
                        >
                          <option value="monthly">Miesięczny (15 zł)</option>
                          <option value="yearly">Roczny (160 zł)</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${
                          member.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {member.balance.toFixed(2)} zł
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(member.last_membership_charge)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleChargeFee(member.id, member.membership_fee_plan)}
                            disabled={member.membership_fee_exempt}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                              member.membership_fee_exempt
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                            title={member.membership_fee_exempt ? 'Członek zwolniony ze składki' : 'Nalicz składkę'}
                          >
                            ⚡ Nalicz
                          </button>
                          <button
                            onClick={() => handleAddPayment(member.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-all"
                            title="Dodaj wpłatę"
                          >
                            ➕ Wpłata
                          </button>
                          {member.membership_fee_exempt ? (
                            <button
                              onClick={() => revokeExemption(member.id)}
                              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded transition-all"
                              title="Cofnij zwolnienie"
                            >
                              🔄 Cofnij
                            </button>
                          ) : (
                            <button
                              onClick={() => setExemptionModal({ userId: member.id, userName: member.display_name })}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition-all"
                              title="Zwolnij ze składki"
                            >
                              🎯 Zwolnij
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Informacje</span>
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Nalicz</strong> - odejmuje składkę (15 zł lub 160 zł) od salda członka</li>
            <li>• <strong>Wpłata</strong> - dodaje wpłatę do salda członka</li>
            <li>• <strong>Zwolnij</strong> - zwolnienie ze składki (członek nie będzie naliczany automatycznie)</li>
            <li>• <strong>Nalicz wszystkim</strong> - automatycznie nalicza składkę każdemu członkowi zgodnie z jego planem (oprócz zwolnionych)</li>
            <li>• Zmiana planu będzie uwzględniona przy następnym naliczeniu</li>
          </ul>
        </div>

        {/* Exemption Modal */}
        {exemptionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-purple-600 mb-4">
                🎯 Zwolnij członka ze składki
              </h3>
              <p className="text-gray-700 mb-4">
                Zwalniasz: <strong>{exemptionModal.userName}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Powód zwolnienia *
                </label>
                <input
                  type="text"
                  value={exemptionData.reason}
                  onChange={(e) => setExemptionData({ reason: e.target.value })}
                  placeholder="np. Zarząd, Wolontariat, Sytuacja finansowa"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Powód będzie widoczny w panelu członków
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGrantExemption}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Potwierdź zwolnienie
                </button>
                <button
                  onClick={() => {
                    setExemptionModal(null)
                    setExemptionData({ reason: '' })
                  }}
                  className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMemberFeesPage
