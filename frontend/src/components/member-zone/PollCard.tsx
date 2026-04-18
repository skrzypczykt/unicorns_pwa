import { useState } from 'react'

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

interface PollCardProps {
  poll: Poll
  userVote: { option_id: string } | null
  results: PollResults[] | null
  onVote: (pollId: string, optionId: string) => Promise<void>
}

const PollCard = ({ poll, userVote, results, onVote }: PollCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [voting, setVoting] = useState(false)

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

  const isPollEnded = () => {
    return new Date(poll.end_date) < new Date()
  }

  const getPollTypeLabel = (type: string) => {
    switch (type) {
      case 'resolution': return 'Uchwała'
      case 'survey': return 'Ankieta'
      case 'other': return 'Inne'
      default: return type
    }
  }

  const handleVote = async () => {
    if (!selectedOption || voting) return

    setVoting(true)
    try {
      await onVote(poll.id, selectedOption)
    } finally {
      setVoting(false)
    }
  }

  const totalVotes = results ? results.reduce((sum, r) => sum + r.vote_count, 0) : 0

  const getPercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0
    return Math.round((voteCount / totalVotes) * 100)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-purple-600">{poll.title}</h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {getPollTypeLabel(poll.poll_type)}
        </span>
      </div>

      {poll.description && (
        <p className="text-gray-600 mb-4">{poll.description}</p>
      )}

      <div className={`text-sm mb-4 flex items-center gap-2 ${
        isPollEnded() ? 'text-red-500' : 'text-green-600'
      }`}>
        <span>⏰</span>
        <span>
          {isPollEnded() ? 'Zakończone: ' : 'Kończy się: '}
          {formatDate(poll.end_date)}
        </span>
      </div>

      {userVote ? (
        // Already voted - show confirmation and results if available
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Oddano głos</p>
              <p className="text-sm text-green-600">
                Twój głos został zarejestrowany
              </p>
            </div>
          </div>

          {results && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-2">
                Wyniki głosowania ({totalVotes} {totalVotes === 1 ? 'głos' : 'głosów'}):
              </h4>
              {results.map((result) => (
                <div key={result.option_id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={userVote.option_id === result.option_id ? 'font-bold text-purple-600' : 'text-gray-700'}>
                      {result.option_text}
                      {userVote.option_id === result.option_id && ' (Twój głos)'}
                    </span>
                    <span className="text-gray-600">
                      {result.vote_count} ({getPercentage(result.vote_count)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        userVote.option_id === result.option_id
                          ? 'bg-purple-500'
                          : 'bg-blue-400'
                      }`}
                      style={{ width: `${getPercentage(result.vote_count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Not voted yet - show voting form
        <div className="space-y-4">
          <div className="space-y-2">
            {poll.options
              .sort((a, b) => a.display_order - b.display_order)
              .map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-5 h-5 text-purple-600"
                  />
                  <span className="text-gray-700">{option.option_text}</span>
                </label>
              ))}
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedOption || voting || isPollEnded()}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              !selectedOption || voting || isPollEnded()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {voting ? 'Zapisywanie głosu...' : isPollEnded() ? 'Głosowanie zakończone' : 'Oddaj głos'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PollCard
