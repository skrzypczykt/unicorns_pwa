import { supabase } from '../client'
import type { Database } from '../../types/database.types'
import type { User as AuthUser } from '@supabase/supabase-js'
import {
  QueryResult,
  QueryListResult,
  handleQueryError,
  successResult,
  successListResult,
  errorResult,
  errorListResult,
} from './base'

// Types from database
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export type { User, UserInsert, UserUpdate }

/**
 * User role type
 */
export type UserRole = User['role']

/**
 * Membership fee plan type
 */
export type MembershipFeePlan = User['membership_fee_plan']

/**
 * User profile (subset of user data for display)
 */
export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: UserRole
  is_association_member: boolean
}

/**
 * Auth result with user profile
 */
export interface AuthResult {
  authUser: AuthUser | null
  profile: User | null
  error: Error | null
}

// ============================================================================
// AUTH OPERATIONS
// ============================================================================

/**
 * Get current authenticated user with profile
 * Combines Supabase auth user with database profile
 *
 * @returns Auth user and profile data
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      handleQueryError(authError as any, 'getting current user')
      return { authUser: null, profile: null, error: authError }
    }

    if (!user) {
      return { authUser: null, profile: null, error: null }
    }

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      handleQueryError(profileError, `fetching profile for user ${user.id}`)
      return { authUser: user, profile: null, error: profileError as any }
    }

    return { authUser: user, profile, error: null }
  } catch (error) {
    return { authUser: null, profile: null, error: error as Error }
  }
}

/**
 * Get current session
 * Returns active session if user is logged in
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      handleQueryError(error as any, 'getting current session')
      return { session: null, error }
    }

    return { session, error: null }
  } catch (error) {
    return { session: null, error: error as Error }
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Fetch user by ID
 *
 * @param id - User ID
 * @returns User record
 */
export async function getUserById(id: string): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      handleQueryError(error, `fetching user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch user by email
 *
 * @param email - User email
 * @returns User record
 */
export async function getUserByEmail(email: string): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      handleQueryError(error, `fetching user by email ${email}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch all trainers (users with trainer role)
 * Includes admin, trainer, and external_trainer roles
 *
 * @returns List of trainers
 */
export async function getTrainers(): Promise<QueryListResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, email, role')
      .in('role', ['trainer', 'admin', 'external_trainer'])
      .order('display_name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching trainers')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all association members
 *
 * @returns List of association members
 */
export async function getMemberUsers(): Promise<QueryListResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_association_member', true)
      .order('display_name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching association members')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all users (admin function)
 *
 * @param role - Optional role filter
 * @returns List of all users
 */
export async function getAllUsers(role?: UserRole): Promise<QueryListResult<User>> {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) {
      handleQueryError(error, 'fetching all users')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Search users by name or email
 *
 * @param query - Search query string
 * @returns Matching users
 */
export async function searchUsers(query: string): Promise<QueryListResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('display_name', { ascending: true })
      .limit(50)

    if (error) {
      handleQueryError(error, `searching users for "${query}"`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Get users with membership fee exemptions
 *
 * @returns Users with fee exemptions
 */
export async function getExemptUsers(): Promise<QueryListResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('membership_fee_exempt', true)
      .order('display_name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching exempt users')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new user profile
 * Called after successful authentication signup
 *
 * @param userData - User data to insert
 * @returns Created user
 */
export async function createUser(userData: UserInsert): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating user')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update user profile
 *
 * @param id - User ID
 * @param updates - Fields to update
 * @returns Updated user
 */
export async function updateUserProfile(
  id: string,
  updates: UserUpdate
): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating user profile ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update user role (admin only)
 *
 * @param id - User ID
 * @param role - New role
 * @returns Updated user
 */
export async function updateUserRole(
  id: string,
  role: UserRole
): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating user ${id} role to ${role}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Toggle association member status
 *
 * @param id - User ID
 * @param isMember - Whether user is a member
 * @returns Updated user
 */
export async function toggleMemberStatus(
  id: string,
  isMember: boolean
): Promise<QueryResult<User>> {
  try {
    const updates: UserUpdate = {
      is_association_member: isMember,
    }

    // Set member_since date when granting membership
    if (isMember) {
      updates.association_member_since = new Date().toISOString()
    } else {
      updates.association_member_since = null
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `toggling member status for user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update user balance
 *
 * @param id - User ID
 * @param balance - New balance
 * @returns Updated user
 */
export async function updateUserBalance(
  id: string,
  balance: number
): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        balance,
        balance_updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating balance for user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Grant membership fee exemption
 *
 * @param id - User ID
 * @param reason - Exemption reason
 * @param grantedBy - Admin user ID who granted exemption
 * @returns Updated user
 */
export async function grantFeeExemption(
  id: string,
  reason: string,
  grantedBy: string
): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        membership_fee_exempt: true,
        exemption_reason: reason,
        exemption_granted_by: grantedBy,
        exemption_granted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `granting fee exemption for user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Revoke membership fee exemption
 *
 * @param id - User ID
 * @returns Updated user
 */
export async function revokeFeeExemption(id: string): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        membership_fee_exempt: false,
        exemption_reason: null,
        exemption_granted_by: null,
        exemption_granted_at: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `revoking fee exemption for user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update GDPR consent
 *
 * @param id - User ID
 * @returns Updated user
 */
export async function updateGdprConsent(id: string): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ gdpr_consent_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating GDPR consent for user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Accept sports terms
 *
 * @param id - User ID
 * @returns Updated user
 */
export async function acceptSportsTerms(id: string): Promise<QueryResult<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ sports_terms_accepted_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `accepting sports terms for user ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}
