// Helper functions for week-based calendar view

export interface WeekRange {
  start: Date
  end: Date
  weekNumber: number
}

/**
 * Get Monday of the current week
 */
export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

/**
 * Get Sunday of the current week
 */
export function getSunday(date: Date): Date {
  const monday = getMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

/**
 * Get week range for a given offset from current week
 * @param weekOffset 0 = current week, 1 = next week, -1 = previous week
 */
export function getWeekRange(weekOffset: number = 0): WeekRange {
  const today = new Date()
  const monday = getMonday(today)

  // Apply offset
  monday.setDate(monday.getDate() + (weekOffset * 7))

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  // Set start to beginning of Monday
  const start = new Date(monday)
  start.setHours(0, 0, 0, 0)

  // Set end to end of Sunday
  const end = new Date(sunday)
  end.setHours(23, 59, 59, 999)

  // Calculate week number (simple: weeks since start of year)
  const startOfYear = new Date(monday.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(((monday.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)

  return { start, end, weekNumber }
}

/**
 * Format week range as string "14-20 kwi"
 */
export function formatWeekRange(weekRange: WeekRange): string {
  const start = weekRange.start
  const end = weekRange.end

  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']

  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = months[start.getMonth()]
  const endMonth = months[end.getMonth()]

  if (start.getMonth() === end.getMonth()) {
    return `${startDay}-${endDay} ${startMonth}`
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
  }
}

/**
 * Get day name in Polish
 */
export function getPolishDayName(date: Date): string {
  const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
  return days[date.getDay()]
}

/**
 * Get short day name in Polish
 */
export function getShortDayName(dayIndex: number): string {
  const days = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb']
  return days[dayIndex]
}

/**
 * Group activities by day of week
 */
export function groupActivitiesByDay(activities: any[]): Map<number, any[]> {
  const grouped = new Map<number, any[]>()

  // Initialize all days (1=Monday, 7=Sunday)
  for (let i = 1; i <= 7; i++) {
    grouped.set(i, [])
  }

  activities.forEach(activity => {
    if (!activity.date_time) return

    const date = new Date(activity.date_time)
    let day = date.getDay() // 0=Sunday, 1=Monday, etc.

    // Convert Sunday from 0 to 7
    if (day === 0) day = 7

    const dayActivities = grouped.get(day) || []
    dayActivities.push(activity)
    grouped.set(day, dayActivities)
  })

  // Sort each day's activities by time
  grouped.forEach((dayActivities, day) => {
    dayActivities.sort((a, b) => {
      return new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    })
  })

  return grouped
}
