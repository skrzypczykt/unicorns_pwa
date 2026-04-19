/**
 * Formatuje czas trwania wydarzenia w czytelny sposób
 * - > 120 min → godziny (np. "3h", "2h 30min")
 * - ≥ 24h → dni (np. "2 dni", "1 dzień 5h")
 * - ≤ 120 min → minuty (np. "90 min")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes >= 1440) {
    // >= 24h = pokaż dni
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    if (remainingHours > 0) {
      return `${days} ${days === 1 ? 'dzień' : 'dni'} ${remainingHours}h`
    }
    return `${days} ${days === 1 ? 'dzień' : 'dni'}`
  } else if (minutes > 120) {
    // > 120 min = pokaż godziny
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${hours}h`
  } else {
    // <= 120 min = pokaż minuty
    return `${minutes} min`
  }
}
