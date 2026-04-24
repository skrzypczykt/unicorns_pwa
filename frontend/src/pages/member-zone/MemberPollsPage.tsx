import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import PollCard from '../../components/member-zone/PollCard'

interface PollOption {
  id: string
  option_text: string
  display_order: number
}

interface Poll {
  id: string
  title: string
  description: string | null
  end_date: string
  poll_type: 'resolution' | 'survey' | 'other'
  options: PollOption[]
}

interface PollResults {
  option_id: string
  option_text: string
  vote_count: number
}

const MemberPollsPage = () => {
  const navigate = useNavigate()
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [archivedPolls, setArchivedPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, { option_id: string }>>({})
  const [pollResults, setPollResults] = useState<Record<string, PollResults[]>>({})
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMembershipAndFetchPolls()
  }, [])

  const checkMembershipAndFetchPolls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      // Check if user is association member
      const { data: profile } = await supabase
        .from('users')
        .select('is_association_member')
        .eq('id', user.id)
        .single()

      if (!profile?.is_association_member) {
        navigate('/')
        return
      }

      await fetchPolls(user.id)
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPolls = async (userId: string) => {
    // Fetch all polls
    const { data: pollsData } = await supabase
      .from('association_polls')
      .select('*')
      .order('end_date', { ascending: false })

    if (!pollsData) return

    // Fetch options for all polls
    const { data: optionsData } = await supabase
      .from('association_poll_options')
      .select('*')
      .in('poll_id', pollsData.map(p => p.id))

    // Fetch user's votes
    const { data: votesData } = await supabase
      .from('association_poll_votes')
      .select('poll_id, option_id')
      .eq('user_id', userId)

    // Map options to polls
    const pollsWithOptions = pollsData.map(poll => ({
      ...poll,
      options: (optionsData || [])
        .filter(opt => opt.poll_id === poll.id)
        .sort((a, b) => a.display_order - b.display_order)
    }))

    // Separate active and archived
    const now = new Date()
    const active = pollsWithOptions.filter(p => new Date(p.end_date) > now)
    const archived = pollsWithOptions.filter(p => new Date(p.end_date) <= now)

    setActivePolls(active)
    setArchivedPolls(archived)

    // Map user votes
    const votesMap: Record<string, { option_id: string }> = {}
    votesData?.forEach(vote => {
      votesMap[vote.poll_id] = { option_id: vote.option_id }
    })
    setUserVotes(votesMap)

    // Fetch results for polls user voted on or archived polls
    const resultsToFetch = pollsData.filter(poll =>
      votesMap[poll.id] || new Date(poll.end_date) <= now
    )

    const resultsMap: Record<string, PollResults[]> = {}
    for (const poll of resultsToFetch) {
      try {
        const { data: results } = await supabase.rpc('get_poll_results', {
          poll_uuid: poll.id
        })
        if (results) {
          resultsMap[poll.id] = results
        }
      } catch (err) {
        console.error(`Error fetching results for poll ${poll.id}:`, err)
      }
    }
    setPollResults(resultsMap)
  }

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('association_poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: user.id
        })

      if (error) throw error

      // Refresh polls to update UI
      await fetchPolls(user.id)
      alert('✅ Głos został zapisany!')
    } catch (error: any) {
      console.error('Error voting:', error)
      if (error.code === '23505') {
        alert('⚠️ Już oddałeś głos w tym głosowaniu')
      } else {
        alert('❌ Wystąpił błąd podczas głosowania')
      }
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
