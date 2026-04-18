// Helper functions for calendar integration

interface CalendarEvent {
  title: string
  description?: string
  location?: string
  startDateTime: string // ISO format
  endDateTime: string // ISO format
}

/**
 * Generates a Google Calendar add event URL
 * @param event Event details
 * @returns Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render'

  // Format dates for Google Calendar (yyyyMMddTHHmmssZ in UTC)
  const formatGoogleDate = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDateTime)}/${formatGoogleDate(event.endDateTime)}`,
    details: event.description || '',
    location: event.location || '',
  })

  return `${baseUrl}?${params.toString()}`
}

/**
 * Opens Google Calendar in a new tab to add the event
 * @param event Event details
 */
export const addToGoogleCalendar = (event: CalendarEvent): void => {
  const url = generateGoogleCalendarUrl(event)
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Calculates end time based on start time and duration in minutes
 * @param startDateTime ISO string of start time
 * @param durationMinutes Duration in minutes
 * @returns ISO string of end time
 */
export const calculateEndTime = (startDateTime: string, durationMinutes: number): string => {
  const start = new Date(startDateTime)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  return end.toISOString()
}
