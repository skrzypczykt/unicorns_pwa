export const ACTIVITY_TYPE_IMAGES: Record<string, string> = {
  // Sport - Zajęcia regularne
  'badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=500&fit=crop&auto=format',
  'siatkówka': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=500&fit=crop&auto=format',
  'volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=500&fit=crop&auto=format',
  'squash': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=500&fit=crop&auto=format', // Lepszy obraz squasha
  'rowery': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=500&fit=crop&auto=format', // Grupa rowerzystów
  'cycling': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=500&fit=crop&auto=format',
  'bieganie': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop&auto=format',
  'running': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop&auto=format',
  'piłka nożna': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop&auto=format', // Bramka piłkarska
  'football': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop&auto=format',
  'soccer': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop&auto=format',
  'siłownia': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format', // Trening ze sztangą
  'siłowy': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format',
  'gym': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format',
  'trening siłowy': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format',
  'weights': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format',

  // Kultura & Rozrywka
  'taniec': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=500&fit=crop&auto=format',
  'dance': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=500&fit=crop&auto=format',
  'gry planszowe': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=500&fit=crop&auto=format', // Bardziej kolorowe planszówki
  'board games': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=500&fit=crop&auto=format',
  'joga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop&auto=format',
  'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop&auto=format',

  // Wydarzenia specjalne
  'spływ': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=500&fit=crop&auto=format', // Kajaki na rzece
  'kajaki': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=500&fit=crop&auto=format',
  'kayaking': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=500&fit=crop&auto=format',
  'krutynia': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop&auto=format', // Kajaki Mazury
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=500&fit=crop&auto=format', // Amsterdam kanały
  'pride': 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&h=500&fit=crop&auto=format', // Rainbow flag/pride
  'wigilia': 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&h=500&fit=crop&auto=format', // Świąteczna impreza
  'christmas': 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&h=500&fit=crop&auto=format',
  'świąteczn': 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&h=500&fit=crop&auto=format', // Dekoracje świąteczne
  'turniej': 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=500&fit=crop&auto=format', // Zawody sportowe
  'zawody': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop&auto=format', // Zawody/rywalizacja
  'wyjazd': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&auto=format', // Podróż autokar
  'wycieczka': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&auto=format',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=500&fit=crop&auto=format'
}

/**
 * Helper: Znajdź obrazek dla aktywności na podstawie nazwy
 */
export function getActivityImage(activityName: string, customImageUrl?: string | null): string {
  // Priorytet 1: Custom URL z bazy danych
  if (customImageUrl) return customImageUrl

  // Priorytet 2: Dopasowanie po nazwie (case-insensitive)
  const lowerName = activityName.toLowerCase()

  for (const [key, imageUrl] of Object.entries(ACTIVITY_TYPE_IMAGES)) {
    if (lowerName.includes(key)) {
      return imageUrl
    }
  }

  // Fallback: default image
  return ACTIVITY_TYPE_IMAGES['default']
}
