export const ACTIVITY_TYPE_IMAGES: Record<string, string> = {
  // Sport
  'badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=500&fit=crop',
  'siatkówka': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=500&fit=crop',
  'volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=500&fit=crop',
  'squash': 'https://images.unsplash.com/photo-1533071115214-8b8ddfa44bf2?w=800&h=500&fit=crop',
  'rowery': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
  'cycling': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
  'kajaki': 'https://images.unsplash.com/photo-1578972474928-34aafffea0e3?w=800&h=500&fit=crop',
  'kayaking': 'https://images.unsplash.com/photo-1578972474928-34aafffea0e3?w=800&h=500&fit=crop',

  // Kultura & Rozrywka
  'taniec': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=500&fit=crop',
  'dance': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=500&fit=crop',
  'gry planszowe': 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&h=500&fit=crop',
  'board games': 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&h=500&fit=crop',
  'joga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
  'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=500&fit=crop'
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
