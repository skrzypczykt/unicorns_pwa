import { formatDuration } from '../utils/formatDuration'

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
  trainer_id: string
  status: string
  cancellation_hours: number
  registered_count?: number
  image_url?: string | null
  whatsapp_group_url?: string | null
  requires_immediate_payment?: boolean
  payment_deadline_hours?: number
  requires_registration?: boolean
}

interface WeeklyCalendarViewProps {
  activities: Activity[]
  userRegistrations: Record<string, {
    registrationId: string
    canCancelUntil: string
    paymentProcessed: boolean
  }>
  participantCounts: Record<string, number>
  onViewDetails: (activityId: string) => void
  isLoggedIn: boolean
}

const WeeklyCalendarView = ({
  activities,
  userRegistrations,
  participantCounts,
  onViewDetails,
  isLoggedIn
}: WeeklyCalendarViewProps) => {
  // Generuj tablicę dni tygodnia (7 dni od dziś)
  const getDaysOfWeek = () => {
    const days = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  // Generuj tablicę godzin (od 6:00 do 23:00)
  const getHourSlots = () => {
    const hours = []
    for (let h = 6; h <= 23; h++) {
      hours.push(h)
    }
    return hours
  }

  // Znajdź zajęcia dla danego dnia i godziny
  const getActivitiesForSlot = (date: Date, hour: number) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date_time)
      const isSameDay =
        activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear()
      const activityHour = activityDate.getHours()
      return isSameDay && activityHour === hour
    })
  }

  const daysOfWeek = getDaysOfWeek()
  const hourSlots = getHourSlots()

  // Formatuj nagłówek dnia
  const formatDayHeader = (date: Date) => {
    const dayNames = ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb']
    const dayName = dayNames[date.getDay()]
    const dayNum = date.getDate()
    return `${dayName} ${dayNum}`
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        {/* Header - Dni tygodnia */}
        <div className="grid grid-cols-8 gap-1 mb-1">
          {/* Kolumna godzin - pusta komórka */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 text-center font-bold text-gray-700 text-sm">
            Godz.
          </div>

          {/* Kolumny dni */}
          {daysOfWeek.map((day, idx) => {
            const isToday =
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={idx}
                className={`rounded-lg p-2 text-center font-bold text-sm ${
                  isToday
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700'
                }`}
              >
                {formatDayHeader(day)}
              </div>
            )
          })}
        </div>

        {/* Grid - Godziny x Dni */}
        {hourSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
            {/* Kolumna godzin */}
            <div className="bg-white/80 rounded-lg p-2 flex items-start justify-center text-xs font-semibold text-gray-600 border border-purple-100">
              {hour.toString().padStart(2, '0')}:00
            </div>

            {/* Komórki dla każdego dnia */}
            {daysOfWeek.map((day, dayIdx) => {
              const slotActivities = getActivitiesForSlot(day, hour)

              if (slotActivities.length === 0) {
                return (
                  <div
                    key={dayIdx}
                    className="bg-white/40 rounded-lg border border-gray-200 min-h-[80px]"
                  ></div>
                )
              }

              // Renderuj zajęcia w tym slocie
              return (
                <div key={dayIdx} className="space-y-1">
                  {slotActivities.map((activity) => {
                    const activityDate = new Date(activity.date_time)
                    const minutes = activityDate.getMinutes()
                    const isRegistered = !!userRegistrations[activity.id]
                    const registration = userRegistrations[activity.id]
                    const participantCount = participantCounts[activity.id] || 0
                    const isFull = activity.max_participants ? participantCount >= activity.max_participants : false

                    return (
                      <div
                        key={activity.id}
                        className={`rounded-lg p-2 border-2 shadow-sm hover:shadow-md transition-all cursor-pointer text-xs ${
                          isRegistered
                            ? 'bg-green-50 border-green-400'
                            : isFull
                            ? 'bg-gray-100 border-gray-400'
                            : 'bg-white/90 border-purple-300 hover:border-purple-500'
                        }`}
                        onClick={() => onViewDetails(activity.id)}
                      >
                        {/* Minuty jeśli nie :00 */}
                        {minutes !== 0 && (
                          <div className="text-[10px] text-gray-500 mb-1">
                            :{minutes.toString().padStart(2, '0')}
                          </div>
                        )}

                        {/* Nazwa */}
                        <div className="font-bold text-purple-700 truncate mb-1">
                          {activity.name}
                        </div>

                        {/* Czas trwania */}
                        <div className="text-gray-600 mb-1">
                          ⏱ {formatDuration(activity.duration_minutes)}
                        </div>

                        {/* Liczba uczestników */}
                        {activity.max_participants && (
                          <div className={`text-[10px] mb-1 ${
                            isFull ? 'text-red-600 font-semibold' : 'text-gray-600'
                          }`}>
                            {participantCount}/{activity.max_participants}
                          </div>
                        )}

                        {/* Status rejestracji */}
                        {isRegistered ? (
                          <div className="text-[10px] text-green-600 font-semibold">
                            ✓ Zapisany
                          </div>
                        ) : isFull ? (
                          <div className="text-[10px] text-red-600 font-semibold">
                            Pełne
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyCalendarView
