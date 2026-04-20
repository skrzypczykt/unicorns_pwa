import { formatDuration } from '../utils/formatDuration'
import { getActivityImage } from '../data/activityImages'

interface Activity {
  id: string
  name: string
  description: string
  date_time: string
  duration_minutes: number
  duration_description?: string | null
  max_participants: number | null
  cost: number
  location: string
  status: string
  cancellation_hours: number
  image_url?: string | null
  whatsapp_group_url?: string | null
  requires_immediate_payment?: boolean
  payment_deadline_hours?: number
  requires_registration?: boolean
  is_online?: boolean
  meeting_link?: string | null
}

interface ActivitySlidePanelProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
  isRegistered: boolean
  participantCount: number
  onRegister: () => void
  onCancel: () => void
  isLoggedIn: boolean
  isProcessing: boolean
}

const ActivitySlidePanel = ({
  activity,
  isOpen,
  onClose,
  isRegistered,
  participantCount,
  onRegister,
  onCancel,
  isLoggedIn,
  isProcessing
}: ActivitySlidePanelProps) => {
  if (!activity) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
    const monthNames = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']

    const dayName = dayNames[date.getDay()]
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return {
      full: `${dayName}, ${day} ${month} ${year}`,
      time: `${hours}:${minutes}`
    }
  }

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
  }

  const dateInfo = formatDate(activity.date_time)
  const endTime = calculateEndTime(activity.date_time, activity.duration_minutes)
  const isFull = activity.max_participants ? participantCount >= activity.max_participants : false

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[9998] transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          aria-label="Zamknij"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Header Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={getActivityImage(activity.name, activity.image_url)}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{activity.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-semibold">{dateInfo.full}</div>
                <div className="text-sm text-gray-600">
                  {dateInfo.time} - {endTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="font-semibold">
                  {activity.duration_description || formatDuration(activity.duration_minutes)}
                </div>
              </div>
            </div>

            {activity.is_online ? (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🌐</span>
                <a
                  href={activity.meeting_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-purple-600 hover:underline"
                >
                  Spotkanie online - kliknij aby dołączyć
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">📍</span>
                <div className="font-semibold">{activity.location}</div>
              </div>
            )}

            {activity.cost === 0 ? (
              <div className="flex items-center gap-3 text-green-600">
                <span className="text-2xl">🎉</span>
                <div className="font-bold">Wstęp wolny</div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">💰</span>
                <div className="font-semibold">{activity.cost.toFixed(2)} zł</div>
              </div>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Opis</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{activity.description}</p>
            </div>
          )}

          {/* Participants */}
          {activity.max_participants && (
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">👥 Uczestnicy</span>
                <span className={`font-bold text-lg ${
                  isFull ? 'text-red-600' : 'text-purple-600'
                }`}>
                  {participantCount}/{activity.max_participants}
                </span>
              </div>
              {isFull && (
                <div className="mt-2 text-sm text-red-600 font-semibold">
                  Brak wolnych miejsc
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Group */}
          {activity.whatsapp_group_url && (
            <a
              href={activity.whatsapp_group_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-50 border-2 border-green-400 rounded-lg p-4 hover:bg-green-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-semibold text-green-800">Grupa WhatsApp</div>
                  <div className="text-sm text-green-600">Kliknij aby dołączyć</div>
                </div>
              </div>
            </a>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t-2 border-gray-200">
            {!isLoggedIn ? (
              <div className="text-center text-gray-600 text-sm py-4">
                Zaloguj się, aby zapisać się na zajęcia
              </div>
            ) : isRegistered ? (
              <>
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 text-center">
                  <div className="text-green-600 font-bold text-lg">
                    ✓ Jesteś zapisany
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  {isProcessing ? 'Anulowanie...' : '❌ Anuluj rezerwację'}
                </button>
              </>
            ) : (
              <button
                onClick={onRegister}
                disabled={isProcessing || isFull}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all"
              >
                {isProcessing ? 'Zapisywanie...' : isFull ? '🔒 Brak miejsc' : '✨ Zapisz się'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ActivitySlidePanel
