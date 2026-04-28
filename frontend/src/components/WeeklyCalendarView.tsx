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
  is_online?: boolean
  meeting_link?: string | null
}

interface WeeklyCalendarViewProps {
  activities: Activity[]
  userRegistrations: Record<string, {
    registrationId: string
    canCancelUntil: string
    paymentProcessed: boolean
  }>
  participantCounts: Record<string, number>
  onActivityClick: (activity: Activity) => void
  isLoggedIn: boolean
}

const WeeklyCalendarView = ({
  activities,
  userRegistrations,
  participantCounts,
  onActivityClick,
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

  // Generuj tablicę godzin (od 9:00 do 22:00)
  const getHourSlots = () => {
    const hours = []
    for (let h = 9; h <= 22; h++) {
      hours.push(h)
    }
    return hours
  }

  // Oblicz wysokość kafelka bazując na czasie trwania
  // 1 godzina = 80px bazowa wysokość
  const calculateCardHeight = (durationMinutes: number) => {
    const maxDisplayDuration = 180 // 3h w minutach
    const effectiveDuration = Math.min(durationMinutes, 60) // Dla >3h pokazuj jako 1h
    const baseHeightPerHour = 80 // piksele
    const heightInPixels = (effectiveDuration / 60) * baseHeightPerHour
    return Math.max(heightInPixels, 80) // minimum 80px
  }

  // Sprawdź czy wydarzenie jest długie (>3h)
  const isLongEvent = (durationMinutes: number) => {
    return durationMinutes > 180
  }

  // Sprawdź czy dana godzina ma jakiekolwiek zajęcia w dowolnym dniu
  const hasAnyActivitiesAtHour = (hour: number, days: Date[]) => {
    return days.some(day => {
      const slotActivities = getActivitiesForSlot(day, hour)
      return slotActivities.length > 0
    })
  }

  // Znajdź puste bloki (minimum 2 kolejne godziny bez zajęć)
  const getEmptyBlocks = (hours: number[], days: Date[]) => {
    const emptyBlocks: { start: number; end: number }[] = []
    let currentBlockStart: number | null = null

    hours.forEach((hour, index) => {
      const hasActivities = hasAnyActivitiesAtHour(hour, days)

      if (!hasActivities) {
        if (currentBlockStart === null) {
          currentBlockStart = hour
        }
      } else {
        if (currentBlockStart !== null) {
          const blockLength = hour - currentBlockStart
          // Tylko bloki minimum 2 godziny
          if (blockLength >= 2) {
            emptyBlocks.push({ start: currentBlockStart, end: hour - 1 })
          }
          currentBlockStart = null
        }
      }
    })

    // Sprawdź ostatni blok
    if (currentBlockStart !== null) {
      const lastHour = hours[hours.length - 1]
      const blockLength = lastHour - currentBlockStart + 1
      if (blockLength >= 2) {
        emptyBlocks.push({ start: currentBlockStart, end: lastHour })
      }
    }

    return emptyBlocks
  }

  // Sprawdź czy godzina jest częścią pustego bloku
  const isInEmptyBlock = (hour: number, emptyBlocks: { start: number; end: number }[]) => {
    return emptyBlocks.some(block => hour >= block.start && hour <= block.end)
  }

  // Sprawdź czy to początek pustego bloku (renderujemy separator)
  const isEmptyBlockStart = (hour: number, emptyBlocks: { start: number; end: number }[]) => {
    return emptyBlocks.some(block => block.start === hour)
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
  const emptyBlocks = getEmptyBlocks(hourSlots, daysOfWeek)

  // Sprawdź czy kalendarz jest całkowicie pusty
  const isCalendarEmpty = activities.length === 0

  // Formatuj nagłówek dnia
  const formatDayHeader = (date: Date) => {
    const dayNames = ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb']
    const dayName = dayNames[date.getDay()]
    const dayNum = date.getDate()
    return `${dayName} ${dayNum}`
  }

  // Jeśli kalendarz jest pusty, pokaż komunikat
  if (isCalendarEmpty) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <span className="text-6xl mb-4 block">📅</span>
        <p className="text-xl text-gray-600 font-semibold mb-2">Brak zajęć w tym tygodniu</p>
        <p className="text-sm text-gray-500">Sprawdź widok kafelkowy lub wróć później</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px] relative">
        {/* Header - Dni tygodnia */}
        <div className="grid grid-cols-8 gap-1 mb-1 sticky top-0 z-20 bg-white/95 backdrop-blur-sm pb-1">
          {/* Kolumna godzin - pusta komórka */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 text-center font-bold text-gray-700 text-sm sticky left-0 z-30">
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
        {hourSlots.map((hour) => {
          // Sprawdź czy ta godzina jest w pustym bloku
          const inEmptyBlock = isInEmptyBlock(hour, emptyBlocks)
          const isBlockStart = isEmptyBlockStart(hour, emptyBlocks)

          // Jeśli w pustym bloku, pokaż separator tylko na początku bloku
          if (inEmptyBlock) {
            if (isBlockStart) {
              const block = emptyBlocks.find(b => b.start === hour)
              const blockHours = block ? block.end - block.start + 1 : 0

              return (
                <div key={`empty-${hour}`} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="col-span-8 bg-white/40 rounded-lg border border-dashed border-gray-300 p-3 flex items-center justify-center">
                    <div className="text-center text-gray-400 text-xs">
                      <div className="mb-1">⋮</div>
                      <div className="text-[10px]">Brak zajęć ({blockHours}h)</div>
                    </div>
                  </div>
                </div>
              )
            }
            // Pomiń pozostałe godziny w tym bloku
            return null
          }

          // Renderuj normalny wiersz z zajęciami
          return (
            <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
              {/* Kolumna godzin */}
              <div className="bg-white/80 rounded-lg p-2 flex items-start justify-center text-xs font-semibold text-gray-600 border border-purple-100 sticky left-0 z-10">
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Komórki dla każdego dnia */}
              {daysOfWeek.map((day, dayIdx) => {
                const slotActivities = getActivitiesForSlot(day, hour)

                if (slotActivities.length === 0) {
                  return (
                    <div
                      key={dayIdx}
                      className="bg-white/40 rounded-lg border border-gray-200 min-h-[80px] relative"
                    ></div>
                  )
                }

                // Oblicz maksymalną wysokość potrzebną dla tej komórki
                // uwzględniając przesunięcie + wysokość kafelka
                const maxHeight = Math.max(...slotActivities.map(activity => {
                  const activityDate = new Date(activity.date_time)
                  const minutes = activityDate.getMinutes()
                  const minuteOffset = (minutes / 60) * 80
                  const cardHeight = calculateCardHeight(activity.duration_minutes)
                  return minuteOffset + cardHeight
                }), 80) // minimum 80px

              // Renderuj zajęcia w tym slocie
              return (
                <div
                  key={dayIdx}
                  className="relative bg-white/20 rounded-lg border border-gray-200"
                  style={{ minHeight: `${maxHeight}px` }}
                >
                  {slotActivities.map((activity) => {
                    const activityDate = new Date(activity.date_time)
                    const minutes = activityDate.getMinutes()
                    const hours = activityDate.getHours()
                    const isRegistered = !!userRegistrations[activity.id]
                    const registration = userRegistrations[activity.id]
                    const participantCount = participantCounts[activity.id] || 0
                    const isFull = activity.max_participants ? participantCount >= activity.max_participants : false
                    const cardHeight = calculateCardHeight(activity.duration_minutes)
                    const isLong = isLongEvent(activity.duration_minutes)

                    // Oblicz przesunięcie w pionie bazując na minutach rozpoczęcia
                    // 1 minuta = (80px / 60 min) = ~1.33px
                    const minuteOffset = (minutes / 60) * 80

                    return (
                      <div
                        key={activity.id}
                        data-testid="activity-card"
                        data-activity-type="calendar-view"
                        className={`absolute left-0 right-0 rounded-lg p-2 border-2 shadow-sm hover:shadow-md transition-all cursor-pointer text-xs overflow-hidden ${
                          isRegistered
                            ? 'bg-green-50 border-green-400'
                            : isFull
                            ? 'bg-gray-100 border-gray-400'
                            : 'bg-white/90 border-purple-300 hover:border-purple-500'
                        }`}
                        style={{
                          minHeight: `${cardHeight}px`,
                          top: `${minuteOffset}px`
                        }}
                        onClick={() => onActivityClick(activity)}
                      >
                        {/* Pełna godzina rozpoczęcia (zawsze pokazuj jeśli nie :00) */}
                        {minutes !== 0 && (
                          <div className="text-[10px] text-purple-600 font-semibold mb-1">
                            🕐 {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                          </div>
                        )}

                        {/* Nazwa */}
                        <div data-testid="activity-name" className="font-bold text-purple-700 truncate mb-1">
                          {activity.name}
                        </div>

                        {/* Czas trwania */}
                        <div data-testid="activity-date" className="text-gray-600 mb-1">
                          ⏱ {formatDuration(activity.duration_minutes)}
                        </div>

                        {/* Cena */}
                        <div data-testid="activity-price" className="text-[10px] text-purple-600 font-semibold mb-1">
                          {activity.cost === 0 ? '🎉 Darmowe' : `💰 ${activity.cost.toFixed(2)} zł`}
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

                        {/* Gradient fade-out dla długich wydarzeń */}
                        {isLong && (
                          <>
                            <div className="text-[10px] text-gray-500 italic mt-1">
                              (trwa dłużej...)
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 to-transparent pointer-events-none"></div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyCalendarView
