import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

type Role = 'admin' | 'trainer' | 'external_trainer' | 'user'

interface UseRequireAuthOptions {
  requiredRole?: Role
  allowedRoles?: Role[]
  redirectTo?: string
  onUnauthorized?: () => void
}

interface AuthState {
  isLoading: boolean
  isAuthorized: boolean
  user: any | null
  profile: any | null
}

/**
 * Hook that ensures user is authenticated and optionally has required role(s).
 * Redirects to login if not authenticated, or to home if unauthorized.
 *
 * @example
 * // Require any authenticated user
 * useRequireAuth()
 *
 * @example
 * // Require admin role
 * useRequireAuth({ requiredRole: 'admin' })
 *
 * @example
 * // Allow multiple roles
 * useRequireAuth({ allowedRoles: ['trainer', 'external_trainer', 'admin'] })
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): AuthState {
  const {
    requiredRole,
    allowedRoles,
    redirectTo = '/login',
    onUnauthorized,
  } = options

  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthorized: false,
    user: null,
    profile: null,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          navigate(redirectTo)
          return
        }

        // If no role requirement, user is authorized
        if (!requiredRole && !allowedRoles) {
          setAuthState({
            isLoading: false,
            isAuthorized: true,
            user,
            profile: null,
          })
          return
        }

        // Fetch user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          navigate(redirectTo)
          return
        }

        // Check role authorization
        let isAuthorized = false

        if (allowedRoles) {
          isAuthorized = allowedRoles.includes(profile.role)
        } else if (requiredRole) {
          // Special handling for trainer role - allow admin and external_trainer too
          if (requiredRole === 'trainer') {
            isAuthorized = ['trainer', 'external_trainer', 'admin'].includes(profile.role)
          } else {
            isAuthorized = profile.role === requiredRole
          }
        }

        if (!isAuthorized) {
          if (onUnauthorized) {
            onUnauthorized()
          }
          navigate('/')
          return
        }

        setAuthState({
          isLoading: false,
          isAuthorized: true,
          user,
          profile,
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Auth check failed:', error)
        }
        navigate(redirectTo)
      }
    }

    checkAuth()
  }, [requiredRole, allowedRoles, redirectTo, navigate, onUnauthorized])

  return authState
}

/**
 * Convenience hook for requiring admin role
 */
export function useRequireAdmin() {
  return useRequireAuth({ requiredRole: 'admin' })
}

/**
 * Convenience hook for requiring trainer role (includes external trainers and admins)
 */
export function useRequireTrainer() {
  return useRequireAuth({ allowedRoles: ['trainer', 'external_trainer', 'admin'] })
}

/**
 * Convenience hook for requiring association member
 */
export function useRequireMember() {
  const authState = useRequireAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authState.isLoading && authState.profile && !authState.profile.is_association_member) {
      navigate('/')
    }
  }, [authState.isLoading, authState.profile, navigate])

  return authState
}
