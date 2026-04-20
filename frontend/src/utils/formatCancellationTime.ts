/**
 * Formatuje czas anulowania w bardziej czytelny sposób
 * @param hours - liczba godzin przed zajęciami
 * @returns sformatowany string, np. "7 dni przed zajęciami", "24h przed zajęciami"
 */
export const formatCancellationTime = (hours: number): string => {
  if (hours === 0) {
    return 'Do ostatniej chwili'
  }

  // Powyżej 48h - formatuj jako dni
  if (hours >= 48) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24

    if (remainingHours === 0) {
      return `${days} ${days === 1 ? 'dzień' : days < 5 ? 'dni' : 'dni'} przed zajęciami`
    }
    return `${days} ${days === 1 ? 'dzień' : days < 5 ? 'dni' : 'dni'} i ${remainingHours}h przed zajęciami`
  }

  // Poniżej 48h - zostaw godziny
  return `${hours}h przed zajęciami`
}
