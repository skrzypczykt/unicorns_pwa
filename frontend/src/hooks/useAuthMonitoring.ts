import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

interface UserProfile {
  id: string
  role: string
  [key: string]: any
}

interface UseAuthMonitoringProps {
  user: any
  profile: UserProfile | null
  onProfileUpdate: (profile: UserProfile | null) => void
  onUserUpdate: (user: any) => void
}

/**
 * Hook monitorujący stan autoryzacji i sesji użytkownika
 *
 * Obsługuje:
 * 1. Zmiana hasła - automatyczne wylogowanie innych sesji (Supabase native)
 * 2. Zmiana roli - wymuszenie ponownego logowania
 * 3. Usunięcie konta - natychmiastowe wylogowanie
 */
export const useAuthMonitoring = ({
  user,
  profile,
  onProfileUpdate,
  onUserUpdate
}: UseAuthMonitoringProps) => {
  const navigate = useNavigate()
  const previousRoleRef = useRef<string | null>(null)
  const accountCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize previous role
  useEffect(() => {
    if (profile?.role && !previousRoleRef.current) {
      previousRoleRef.current = profile.role
    }
  }, [profile?.role])

  // Auth state change monitoring
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth Monitor] Event:', event, 'Session:', !!session)

        // Wylogowanie
        if (event === 'SIGNED_OUT') {
          console.log('[Auth Monitor] User signed out')
          onUserUpdate(null)
          onProfileUpdate(null)
          previousRoleRef.current = null
          navigate('/login')
          return
        }

        // Nowa sesja lub odświeżenie tokena
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            onUserUpdate(session.user)

            // Pobierz aktualny profil
            const { data: currentProfile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (error || !currentProfile) {
              // Użytkownik usunięty lub profil nie istnieje
              console.warn('[Auth Monitor] Profile not found, logging out')
              await supabase.auth.signOut()
              alert('Twoje konto zostało usunięte lub wystąpił błąd. Zaloguj się ponownie.')
              navigate('/login')
              return
            }

            // Sprawdź czy rola się zmieniła
            if (previousRoleRef.current && currentProfile.role !== previousRoleRef.current) {
              console.warn('[Auth Monitor] Role changed:', previousRoleRef.current, '->', currentProfile.role)

              // Wyloguj użytkownika
              await supabase.auth.signOut()

              // Pokaż komunikat
              alert(`Twoje uprawnienia zostały zmienione z "${previousRoleRef.current}" na "${currentProfile.role}". Zaloguj się ponownie.`)

              // Przekieruj do logowania
              navigate('/login')
              return
            }

            // Aktualizuj profil
            onProfileUpdate(currentProfile)
            previousRoleRef.current = currentProfile.role
          }
        }

        // Błąd użytkownika (np. invalid token)
        if (event === 'USER_DELETED') {
          console.log('[Auth Monitor] User deleted')
          await supabase.auth.signOut()
          alert('Twoje konto zostało usunięte.')
          navigate('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.role, navigate, onProfileUpdate, onUserUpdate])

  // Polling - sprawdzanie czy użytkownik nadal istnieje
  useEffect(() => {
    if (!user) {
      // Wyczyść interval jeśli user nie istnieje
      if (accountCheckIntervalRef.current) {
        clearInterval(accountCheckIntervalRef.current)
        accountCheckIntervalRef.current = null
      }
      return
    }

    const checkAccountExists = async () => {
      try {
        // Sprawdź sesję
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.warn('[Auth Monitor] Session invalid, logging out')
          await supabase.auth.signOut()
          navigate('/login')
          return
        }

        // Sprawdź czy profil istnieje
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (profileError || !profileData) {
          console.warn('[Auth Monitor] Profile deleted, logging out')
          await supabase.auth.signOut()
          alert('Twoje konto zostało usunięte.')
          navigate('/login')
          return
        }

        // Sprawdź czy rola się zmieniła (dodatkowa walidacja)
        if (profile && profileData.role !== profile.role) {
          console.warn('[Auth Monitor] Role changed (polling detected):', profile.role, '->', profileData.role)
          await supabase.auth.signOut()
          alert(`Twoje uprawnienia zostały zmienione. Zaloguj się ponownie.`)
          navigate('/login')
        }
      } catch (error) {
        console.error('[Auth Monitor] Account check error:', error)
      }
    }

    // Sprawdź natychmiast
    checkAccountExists()

    // Sprawdzaj co 5 minut
    accountCheckIntervalRef.current = setInterval(checkAccountExists, 5 * 60 * 1000)

    return () => {
      if (accountCheckIntervalRef.current) {
        clearInterval(accountCheckIntervalRef.current)
      }
    }
  }, [user, profile?.role, navigate])

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      if (accountCheckIntervalRef.current) {
        clearInterval(accountCheckIntervalRef.current)
      }
    }
  }, [])
}
