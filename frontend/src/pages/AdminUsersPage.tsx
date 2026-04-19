import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  display_name: string
  role: string
  balance: number
  balance_updated_at: string
  is_association_member: boolean
}

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

const AdminUsersPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('display_name', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTransactions = async (userId: string) => {
    setLoadingTransactions(true)
    try {
      const { data, error } = await supabase
        .from('balance_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    fetchUserTransactions(user.id)
  }

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return

    if (!confirm(`Czy na pewno chcesz zmienić rolę użytkownika ${selectedUser.display_name} na "${newRole}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', selectedUser.id)

      if (error) throw error

      alert(`✅ Rola zmieniona na: ${newRole}`)
      await fetchUsers()

      // Update selected user
      setSelectedUser({ ...selectedUser, role: newRole })
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Wystąpił błąd podczas zmiany roli')
    }
  }

  const handleToggleMembership = async () => {
    if (!selectedUser) return

    const newStatus = !selectedUser.is_association_member
    const action = newStatus ? 'nadać status członka stowarzyszenia' : 'odebrać status członka stowarzyszenia'

    if (!confirm(`Czy na pewno chcesz ${action} użytkownikowi ${selectedUser.display_name}?`)) {
      return
    }

    try {
      const updateData: any = {
        is_association_member: newStatus
      }

      // Jeśli nadajemy status członka, ustaw też datę
      if (newStatus) {
        updateData.association_member_since = new Date().toISOString()
      } else {
        updateData.association_member_since = null
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedUser.id)

      if (error) throw error

      alert(`✅ ${newStatus ? 'Nadano status członka stowarzyszenia' : 'Odebrano status członka stowarzyszenia'}`)
      await fetchUsers()

      // Update selected user
      setSelectedUser({ ...selectedUser, is_association_member: newStatus })
    } catch (error) {
      console.error('Error updating membership:', error)
      alert('Wystąpił błąd podczas zmiany statusu członkostwa')
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'manual_credit': return 'Wpłata manualna'
      case 'manual_debit': return 'Wypłata manualna'
      case 'class_payment': return 'Płatność za zajęcia'
      case 'cancellation_refund': return 'Zwrot - anulowanie'
      case 'membership_fee': return 'Składka członkowska'
      default: return type
    }
  }

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">👥 Zarządzanie Użytkownikami</h1>
          <p className="text-gray-600">Przeglądaj użytkowników i ich historię transakcji</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Users list */}
        <div>
          <h2 className="text-xl font-bold text-purple-600 mb-4">
            Wszyscy użytkownicy ({users.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 p-4 transition-all cursor-pointer hover:shadow-xl ${
                  selectedUser?.id === user.id ? 'border-purple-500' : 'border-purple-200'
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-purple-600">{user.display_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'trainer' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'external_trainer' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' :
                         user.role === 'trainer' ? 'Trener' :
                         user.role === 'external_trainer' ? 'Trener zewnętrzny' :
                         'Użytkownik'}
                      </span>
                      {user.is_association_member && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          🏛️ Członek
                        </span>
                      )}
                    </div>
                  </div>
                  {user.role !== 'external_trainer' && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Saldo</p>
                      <p className={`text-xl font-bold ${
                        user.balance > 100 ? 'text-green-600' :
                        user.balance > 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {user.balance.toFixed(2)} zł
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance update form */}
        <div className="sticky top-4 space-y-6">
          {selectedUser ? (
            <>
              {/* User info card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
                <h2 className="text-xl font-bold text-purple-600 mb-4">Wybrany użytkownik</h2>

                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <p className="font-bold text-purple-600">{selectedUser.display_name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm mt-2">
                    Obecne saldo: <span className="font-bold text-purple-600">{selectedUser.balance.toFixed(2)} zł</span>
                  </p>
                </div>
              </div>

              {/* Role and membership management */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
                <h2 className="text-xl font-bold text-purple-600 mb-4">Uprawnienia</h2>

                <div className="space-y-4">
                  {/* Role selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rola użytkownika
                    </label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => handleUpdateRole(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="user">Użytkownik</option>
                      <option value="trainer">Trener</option>
                      <option value="external_trainer">Trener zewnętrzny</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Zmiana roli natychmiast aktualizuje uprawnienia
                    </p>
                  </div>

                  {/* Association membership toggle */}
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Członek stowarzyszenia</p>
                        <p className="text-xs text-gray-500">Dostęp do strefy członka, głosowania, składki</p>
                      </div>
                      <button
                        onClick={handleToggleMembership}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedUser.is_association_member
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {selectedUser.is_association_member ? '✓ Aktywny' : '✗ Nieaktywny'}
                      </button>
                    </div>
                  </div>

                  {selectedUser.is_association_member && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">🏛️ Członek stowarzyszenia</span>
                        <br />
                        Ten użytkownik ma dostęp do Strefy Członka i może uczestniczyć w głosowaniach.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-600">
                    Historia transakcji ({transactions.length})
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-all"
                  >
                    ← Wróć
                  </button>
                </div>

                {loadingTransactions ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Ładowanie transakcji...</p>
                  </div>
                ) : transactions.length === 0 ? (
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
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-200 hover:bg-purple-50">
                            <td className="py-3 px-2 text-sm text-gray-600">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-800">
                              {transaction.description}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                transaction.type === 'manual_credit' ? 'bg-green-100 text-green-700' :
                                transaction.type === 'manual_debit' ? 'bg-red-100 text-red-700' :
                                transaction.type === 'class_payment' ? 'bg-purple-100 text-purple-700' :
                                transaction.type === 'membership_fee' ? 'bg-blue-100 text-blue-700' :
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 text-center">
              <span className="text-6xl mb-4 block">👈</span>
              <p className="text-gray-600">Wybierz użytkownika z listy, aby zobaczyć historię transakcji</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
