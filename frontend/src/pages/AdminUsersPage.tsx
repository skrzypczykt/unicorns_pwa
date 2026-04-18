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

const AdminUsersPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [updating, setUpdating] = useState(false)

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

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum === 0) {
      alert('Wprowadź prawidłową kwotę')
      return
    }

    setUpdating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', selectedUser.id)
        .single()

      if (userError) throw userError

      const balanceBefore = userData.balance
      const balanceAfter = balanceBefore + amountNum

      // Update balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({
          balance: balanceAfter,
          balance_updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      if (balanceError) throw balanceError

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: selectedUser.id,
          amount: amountNum,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          type: amountNum > 0 ? 'manual_credit' : 'manual_debit',
          description: description || (amountNum > 0 ? 'Wpłata na konto' : 'Korekta salda'),
          created_by: user.id
        })

      if (transactionError) throw transactionError

      alert(`✅ Saldo zaktualizowane!\nPoprzednie: ${balanceBefore.toFixed(2)} zł\nNowe: ${balanceAfter.toFixed(2)} zł`)

      // Reset form
      setAmount('')
      setDescription('')
      setSelectedUser(null)

      // Refresh users
      await fetchUsers()
    } catch (error) {
      console.error('Error updating balance:', error)
      alert('Wystąpił błąd podczas aktualizacji salda')
    } finally {
      setUpdating(false)
    }
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
          <p className="text-gray-600">Przeglądaj użytkowników i aktualizuj salda</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
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
                onClick={() => setSelectedUser(user)}
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

              {/* Balance update form */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
                <h2 className="text-xl font-bold text-purple-600 mb-4">Zarządzaj saldem</h2>

              <form onSubmit={handleUpdateBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kwota (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="100.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wpisz liczbę dodatnią (wpłata) lub ujemną (wypłata)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opis (opcjonalny)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="np. Wpłata za styczeń 2026"
                  />
                </div>

                {amount && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-semibold text-blue-700">Podgląd:</p>
                    <p>Obecne saldo: {selectedUser.balance.toFixed(2)} zł</p>
                    <p className="font-bold text-blue-600">
                      Nowe saldo: {(selectedUser.balance + parseFloat(amount || '0')).toFixed(2)} zł
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updating || !amount}
                    className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Zapisywanie...' : 'Zaktualizuj saldo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null)
                      setAmount('')
                      setDescription('')
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
              </div>
            </>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 text-center">
              <span className="text-6xl mb-4 block">👈</span>
              <p className="text-gray-600">Wybierz użytkownika z listy, aby zaktualizować saldo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
