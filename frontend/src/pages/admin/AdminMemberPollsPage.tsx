import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { AccessDenied } from '../../components/AccessDenied'
import {
  getCurrentUser,
  getPollsWithOptions,
  getPollResults,
  createPollWithOptions,
  updatePoll,
  deletePoll,
  type PollWithOptions,
  type PollOptionResult,
  type PollType
} from '../../supabase/repositories'

interface PollOption {
  id?: string
  option_text: string
  display_order: number
}

type Poll = PollWithOptions & { options?: PollOption[] }
type PollResults = PollOptionResult

const AdminMemberPollsPage = () => {
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized } = useRequireAdmin()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingResultsId, setViewingResultsId] = useState<string | null>(null)
  const [pollResults, setPollResults] = useState<PollResults[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pollType, setPollType] = useState<PollType>('resolution')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [options, setOptions] = useState<PollOption[]>([
    { option_text: '', display_order: 0 },
    { option_text: '', display_order: 1 }
  ])

  useEffect(() => {
    checkAdminAndFetchPolls()
  }, [])

  const checkAdminAndFetchPolls = async () => {
    try {
      await fetchPolls()
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPolls = async () => {
    const result = await getPollsWithOptions(false) // false = include all polls
    if (result.error) {
      console.error('Failed to fetch polls:', result.error)
      return
    }
    setPolls(result.data as Poll[])
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPollType('resolution')
    setStartDate('')
    setEndDate('')
    setIsActive(true)
    setOptions([
      { option_text: '', display_order: 0 },
      { option_text: '', display_order: 1 }
    ])
    setEditingId(null)
  }

  const handleEdit = (poll: Poll) => {
    setEditingId(poll.id)
    setTitle(poll.title)
    setDescription(poll.description || '')
    setPollType(poll.poll_type)
    setStartDate(poll.start_date.substring(0, 16))
    setEndDate(poll.end_date.substring(0, 16))
    setIsActive(poll.is_active)
    setOptions(poll.options || [{ option_text: '', display_order: 0 }, { option_text: '', display_order: 1 }])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewResults = async (pollId: string) => {
    try {
      const result = await getPollResults(pollId)
      if (result.error) throw result.error

      setPollResults(result.data?.options || [])
      setViewingResultsId(pollId)
    } catch (error: any) {
      console.error('Error fetching results:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !endDate) {
      alert('❌ Tytuł i data zakończenia są wymagane')
      return
    }

    const validOptions = options.filter(opt => opt.option_text.trim())
    if (validOptions.length < 2) {
      alert('❌ Musisz dodać co najmniej 2 opcje głosowania')
      return
    }

    try {
      const userResult = await getCurrentUser()
      if (userResult.error || !userResult.authUser) return

      const pollData = {
        title: title.trim(),
        description: description.trim() || null,
        poll_type: pollType,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate,
        is_active: isActive,
        created_by: userResult.authUser.id
      }

      const optionsToInsert = validOptions.map((opt, idx) => ({
        option_text: opt.option_text.trim(),
        display_order: idx
      }))

      if (editingId) {
        // Update poll (Note: repository doesn't have updatePollWithOptions, so we do it manually)
        const pollResult = await updatePoll(editingId, pollData)
        if (pollResult.error) throw pollResult.error

        // For now, we'll need to manually handle options update
        // This is a limitation that could be improved in the repository
        alert('✅ Głosowanie zaktualizowane (opcje nie są aktualizowane - wymaga rozszerzenia repository)')
      } else {
        // Insert new poll with options
        const result = await createPollWithOptions(pollData, optionsToInsert)
        if (result.error) throw result.error
        alert('✅ Głosowanie utworzone')
      }

      resetForm()
      await fetchPolls()
    } catch (error: any) {
      console.error('Error saving poll:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to głosowanie? Usuną się również wszystkie oddane głosy.')) return

    try {
      const result = await deletePoll(id)
      if (result.error) throw result.error

      alert('✅ Głosowanie usunięte')
      await fetchPolls()
    } catch (error: any) {
      console.error('Error deleting poll:', error)
      alert('❌ Błąd: ' + error.message)
    }
  }

  const addOption = () => {
    setOptions([...options, { option_text: '', display_order: options.length }])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('❌ Musisz mieć co najmniej 2 opcje')
      return
    }
    setOptions(options.filter((_, idx) => idx !== index))
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].option_text = text
    setOptions(newOptions)
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

  const getPollTypeLabel = (type: string) => {
    switch (type) {
      case 'resolution': return 'Uchwała'
      case 'survey': return 'Ankieta'
      case 'other': return 'Inne'
      default: return type
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🗳️</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return <AccessDenied />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🗳️</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>🗳️</span>
              Zarządzanie Głosowaniami
            </h1>
            <p className="text-gray-600">Twórz głosowania i sprawdź wyniki</p>
          </div>
          <button
            onClick={() => navigate('/admin/member-zone-management')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Zarządzanie Strefą Członka
          </button>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            {editingId ? 'Edytuj głosowanie' : 'Nowe głosowanie'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tytuł *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Np. Uchwała w sprawie budżetu na 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opis (opcjonalne)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Szczegółowy opis głosowania..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Typ głosowania *
                </label>
                <select
                  value={pollType}
                  onChange={(e) => setPollType(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="resolution">Uchwała</option>
                  <option value="survey">Ankieta</option>
                  <option value="other">Inne</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data rozpoczęcia
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Pozostaw puste dla "teraz"</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data zakończenia *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <span className="text-sm font-semibold text-gray-700">Aktywne</span>
              </label>
            </div>

            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Opcje głosowania (min. 2) *
                </label>
                <button
                  onClick={addOption}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  ➕ Dodaj opcję
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={`Opcja ${index + 1} (np. Za, Przeciw, Wstrzymuję się)`}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                      >
                        ✖️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                {editingId ? '💾 Zapisz zmiany' : '➕ Utwórz głosowanie'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                >
                  ✖️ Anuluj
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Polls List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            Wszystkie głosowania ({polls.length})
          </h2>

          {polls.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🗳️</span>
              <p className="text-gray-600">Brak głosowań</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const isEnded = new Date(poll.end_date) < new Date()
                const isViewingResults = viewingResultsId === poll.id

                return (
                  <div
                    key={poll.id}
                    className={`border-2 rounded-lg p-4 ${
                      poll.is_active
                        ? isEnded
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            poll.is_active
                              ? isEnded
                                ? 'bg-gray-400 text-white'
                                : 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {poll.is_active ? (isEnded ? 'Zakończone' : 'Aktywne') : 'Nieaktywne'}
                          </span>
                          <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded">
                            {getPollTypeLabel(poll.poll_type)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{poll.title}</h3>
                        {poll.description && (
                          <p className="text-gray-600 mb-3">{poll.description}</p>
                        )}
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p>📅 Zakończenie: {formatDate(poll.end_date)}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Opcje:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {poll.options?.map((opt, idx) => (
                              <li key={idx}>{opt.option_text}</li>
                            ))}
                          </ul>
                        </div>

                        {isViewingResults && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-600 mb-3">Wyniki głosowania:</h4>
                            <div className="space-y-2">
                              {pollResults.map((result) => {
                                const total = pollResults.reduce((sum, r) => sum + Number(r.vote_count), 0)
                                const percentage = total > 0 ? (Number(result.vote_count) / total * 100).toFixed(1) : '0.0'

                                return (
                                  <div key={result.option_id}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="font-semibold">{result.option_text}</span>
                                      <span className="text-gray-600">{result.vote_count} głosów ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                              Łącznie głosów: {pollResults.reduce((sum, r) => sum + Number(r.vote_count), 0)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isEnded && (
                        <button
                          onClick={() => handleEdit(poll)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
                        >
                          ✏️ Edytuj
                        </button>
                      )}
                      <button
                        onClick={() => isViewingResults ? setViewingResultsId(null) : handleViewResults(poll.id)}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
                      >
                        {isViewingResults ? '👁️ Ukryj wyniki' : '📊 Zobacz wyniki'}
                      </button>
                      {!isEnded && (
                        <button
                          onClick={() => handleDelete(poll.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
                        >
                          🗑️ Usuń
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminMemberPollsPage
