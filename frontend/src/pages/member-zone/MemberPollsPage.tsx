import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  getPollsWithOptions,
  getUserPollVote,
  getPollResults,
  castVote,
  type PollWithOptions,
  type PollOptionResult
} from '../../supabase/repositories'
import PollCard from '../../components/member-zone/PollCard'

// Local interface for poll with options (compatible with repository type)
type Poll = PollWithOptions

const MemberPollsPage = () => {
  const navigate = useNavigate()
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [archivedPolls, setArchivedPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, { option_id: string }>>({})
  const [pollResults, setPollResults] = useState<Record<string, PollOptionResult[]>>({})
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMembershipAndFetchPolls()
  }, [])

  const checkMembershipAndFetchPolls = async () => {
    try {
      // Get current user with profile
      const userResult = await getCurrentUser()
      if (userResult.error || !userResult.authUser) {
        navigate('/login')
        return
      }

      // Check if user is association member
      if (!userResult.profile?.is_association_member) {
        navigate('/')
        return
      }

      await fetchPolls(userResult.authUser.id)
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPolls = async (userId: string) => {
    // Fetch all polls with options using repository
    const pollsResult = await getPollsWithOptions(false) // false = include archived
    if (pollsResult.error) {
      console.error('Failed to fetch polls:', pollsResult.error)
      return
    }

    const pollsWithOptions = pollsResult.data

    // Separate active and archived
    const now = new Date()
    const active = pollsWithOptions.filter(p => new Date(p.end_date) > now)
    const archived = pollsWithOptions.filter(p => new Date(p.end_date) <= now)

    setActivePolls(active)
    setArchivedPolls(archived)

    // Fetch user votes for all polls
    const votesMap: Record<string, { option_id: string }> = {}
    for (const poll of pollsWithOptions) {
      const voteResult = await getUserPollVote(poll.id, userId)
      if (!voteResult.error && voteResult.data) {
        votesMap[poll.id] = { option_id: voteResult.data.option_id }
      }
    }
    setUserVotes(votesMap)

    // Fetch results for polls user voted on or archived polls
    const resultsToFetch = pollsWithOptions.filter(poll =>
      votesMap[poll.id] || new Date(poll.end_date) <= now
    )

    const resultsMap: Record<string, PollOptionResult[]> = {}
    for (const poll of resultsToFetch) {
      try {
        const resultsResponse = await getPollResults(poll.id)
        if (!resultsResponse.error && resultsResponse.data) {
          resultsMap[poll.id] = resultsResponse.data.options
        }
      } catch (err) {
        console.error(`Error fetching results for poll ${poll.id}:`, err)
      }
    }
    setPollResults(resultsMap)
  }

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const userResult = await getCurrentUser()
      if (userResult.error || !userResult.authUser) return

      const voteResult = await castVote({
        poll_id: pollId,
        option_id: optionId,
        user_id: userResult.authUser.id
      })

      if (voteResult.error) {
        // Check for duplicate vote error
        if ((voteResult.error as any).code === '23505') {
          alert('⚠️ Już oddałeś głos w tym głosowaniu')
        } else {
          alert('❌ Wystąpił błąd podczas głosowania')
        }
        return
      }

      // Refresh polls to update UI
      await fetchPolls(userResult.authUser.id)
      alert('✅ Głos został zapisany!')
    } catch (error) {
      console.error('Error voting:', error)
      alert('❌ Wystąpił błąd podczas głosowania')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🗳️</div>
          <p className="text-purple-600">Ładowanie głosowań...</p>
        </div>
      </div>
    )
  }

  const displayedPolls = showArchived ? archivedPolls : activePolls

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <span>🗳️</span>
              Głosowania
            </h1>
            <p className="text-gray-600">Głosuj nad uchwałami i sprawdź wyniki</p>
          </div>
          <button
            onClick={() => navigate('/member-zone')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-2 flex gap-2">
          <button
            onClick={() => setShowArchived(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              !showArchived
                ? 'bg-purple-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-purple-100'
            }`}
          >
            Aktywne ({activePolls.length})
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              showArchived
                ? 'bg-purple-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-purple-100'
            }`}
          >
            Archiwalne ({archivedPolls.length})
          </button>
        </div>

        {/* Polls List */}
        {displayedPolls.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-12 text-center">
            <span className="text-8xl mb-4 block">🗳️</span>
            <p className="text-gray-600 text-lg">
              {showArchived ? 'Brak archiwalnych głosowań' : 'Brak aktywnych głosowań'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {showArchived
                ? 'Zakończone głosowania pojawią się tutaj'
                : 'Nowe głosowania pojawią się tutaj'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                userVote={userVotes[poll.id] || null}
                results={pollResults[poll.id] || null}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberPollsPage
