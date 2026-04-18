import { useNavigate } from 'react-router-dom'

interface MembershipBalanceWidgetProps {
  balance: number
  plan: 'monthly' | 'yearly'
  last_charge: string | null
}

const MembershipBalanceWidget = ({ balance, plan, last_charge }: MembershipBalanceWidgetProps) => {
  const navigate = useNavigate()

  const getPlanLabel = () => {
    return plan === 'monthly' ? 'Miesięczny (15 zł/m)' : 'Roczny (160 zł/rok)'
  }

  const getBalanceStatus = () => {
    if (balance >= 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '✅',
        message: 'Składka opłacona'
      }
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '⚠️',
        message: 'Zaległość w składce'
      }
    }
  }

  const status = getBalanceStatus()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Brak'
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`rounded-xl border-2 ${status.borderColor} ${status.bgColor} p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{status.icon}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Składka członkowska</h3>
          <p className={`text-sm ${status.color} font-semibold`}>{status.message}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Aktualne saldo:</p>
          <p className={`text-3xl font-bold ${status.color}`}>
            {balance.toFixed(2)} zł
          </p>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-600">Plan składki:</p>
          <p className="text-lg font-semibold text-gray-800">{getPlanLabel()}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Ostatnie naliczenie:</p>
          <p className="text-sm text-gray-800">{formatDate(last_charge)}</p>
        </div>

        <button
          onClick={() => navigate('/member-zone/fees')}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
        >
          <span>💰</span>
          <span>Zarządzaj składką</span>
        </button>
      </div>
    </div>
  )
}

export default MembershipBalanceWidget
