/**
 * Formatuje czas anulowania w bardziej czytelny sposób
 * @param hours - liczba godzin przed wydarzeniem
 * @returns sformatowany string, np. "do 7 dni przed wydarzeniem", "do 24h przed wydarzeniem"
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
      return `do ${days} ${days === 1 ? 'dnia' : 'dni'} przed wydarzeniem`
    }
    return `do ${days} ${days === 1 ? 'dnia' : 'dni'} i ${remainingHours}h przed wydarzeniem`
  }

  // Poniżej 48h - zostaw godziny
  return `do ${hours}h przed wydarzeniem`
}
