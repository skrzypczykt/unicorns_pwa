import { supabase } from '../client'
import type { Database } from '../../types/database.types'
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
type Registration = Database['public']['Tables']['registrations']['Row']
type RegistrationInsert = Database['public']['Tables']['registrations']['Insert']
type RegistrationUpdate = Database['public']['Tables']['registrations']['Update']

export type { Registration, RegistrationInsert, RegistrationUpdate }

/**
 * Registration status type
 */
export type RegistrationStatus = Registration['status']

/**
 * Payment status type
 */
export type PaymentStatus = Registration['payment_status']

/**
 * Registration with user details
 */
export interface RegistrationWithUser extends Registration {
  user?: {
    id: string
    display_name: string
    email: string
  }
}

/**
 * Registration with activity details
 */
export interface RegistrationWithActivity extends Registration {
  activity?: {
    id: string
    name: string
    date_time: string | null
    location: string
    cost: number
  }
}

/**
 * Attendance update payload
 */
export interface AttendanceUpdate {
  id: string
  attended: boolean
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Fetch all registrations for a specific user
 *
 * @param userId - User ID
 * @param excludePending - Whether to exclude pending payment registrations (default: true)
 * @returns User's registrations
 */
export async function getUserRegistrations(
  userId: string,
  excludePending = true
): Promise<QueryListResult<Registration>> {
  try {
    let query = supabase
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['registered', 'attended'])

    if (excludePending) {
      query = query.neq('payment_status', 'pending')
    }

    const { data, error } = await query.order('registered_at', { ascending: false })

    if (error) {
      handleQueryError(error, `fetching registrations for user ${userId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all registrations for a specific activity
 *
 * @param activityId - Activity ID
 * @returns Activity's registrations
 */
export async function getActivityRegistrations(
  activityId: string
): Promise<QueryListResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .order('registered_at', { ascending: true })

    if (error) {
      handleQueryError(error, `fetching registrations for activity ${activityId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch active (registered or attended) registrations for an activity
 * Used for counting participants
 *
 * @param activityId - Activity ID
 * @returns Active registrations count
 */
export async function getActiveRegistrations(
  activityId: string
): Promise<QueryListResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .in('status', ['registered', 'attended'])

    if (error) {
      handleQueryError(error, `fetching active registrations for activity ${activityId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch a single registration by ID
 *
 * @param id - Registration ID
 * @returns Registration record
 */
export async function getRegistrationById(id: string): Promise<QueryResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      handleQueryError(error, `fetching registration ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Check if a user is registered for an activity
 *
 * @param userId - User ID
 * @param activityId - Activity ID
 * @returns Registration if exists, null otherwise
 */
export async function getUserActivityRegistration(
  userId: string,
  activityId: string
): Promise<QueryResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_id', activityId)
      .neq('payment_status', 'pending') // Exclude pending payments
      .maybeSingle()

    if (error) {
      handleQueryError(error, `checking registration for user ${userId} and activity ${activityId}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch registrations with user details (for admin views)
 *
 * @param activityId - Activity ID
 * @returns Registrations with user information
 */
export async function getActivityRegistrationsWithUsers(
  activityId: string
): Promise<QueryListResult<RegistrationWithUser>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(
        `
        *,
        user:users!user_id (
          id,
          display_name,
          email
        )
      `
      )
      .eq('activity_id', activityId)
      .order('registered_at', { ascending: true })

    if (error) {
      handleQueryError(error, `fetching registrations with users for activity ${activityId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch registrations for refund processing (paid registrations)
 *
 * @param status - Filter by registration status (optional)
 * @returns Registrations eligible for refunds
 */
export async function getRefundEligibleRegistrations(
  status?: RegistrationStatus
): Promise<QueryListResult<RegistrationWithUser>> {
  try {
    let query = supabase
      .from('registrations')
      .select(
        `
        *,
        user:users!user_id (
          id,
          display_name,
          email
        )
      `
      )
      .eq('payment_status', 'paid')

    if (status) {
      query = query.eq('status', status)
    } else {
      query = query.eq('status', 'cancelled')
    }

    const { data, error } = await query.order('cancelled_at', { ascending: false })

    if (error) {
      handleQueryError(error, 'fetching refund-eligible registrations')
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
 * Create a new registration
 *
 * @param registrationData - Registration data to insert
 * @returns Created registration
 */
export async function createRegistration(
  registrationData: RegistrationInsert
): Promise<QueryResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert(registrationData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating registration')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update registration status
 *
 * @param id - Registration ID
 * @param status - New status
 * @returns Updated registration
 */
export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus
): Promise<QueryResult<Registration>> {
  try {
    const updates: RegistrationUpdate = { status }

    // Set cancelled_at timestamp if cancelling
    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating registration ${id} status to ${status}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update registration payment status
 *
 * @param id - Registration ID
 * @param paymentStatus - New payment status
 * @returns Updated registration
 */
export async function updateRegistrationPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
): Promise<QueryResult<Registration>> {
  try {
    const updates: RegistrationUpdate = { payment_status: paymentStatus }

    // Set paid_at timestamp if marking as paid
    if (paymentStatus === 'paid') {
      updates.paid_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating registration ${id} payment status to ${paymentStatus}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Cancel a registration
 * Sets status to 'cancelled' and records cancellation timestamp
 *
 * @param id - Registration ID
 * @returns Updated registration
 */
export async function cancelRegistration(id: string): Promise<QueryResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `cancelling registration ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Mark attendance for a registration
 * Sets status to 'attended' or 'no_show'
 *
 * @param id - Registration ID
 * @param attended - Whether the user attended
 * @returns Updated registration
 */
export async function markAttendance(
  id: string,
  attended: boolean
): Promise<QueryResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .update({ status: attended ? 'attended' : 'no_show' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `marking attendance for registration ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Delete pending registrations for a user and activity
 * Used when cleaning up incomplete payment flows
 *
 * @param userId - User ID
 * @param activityId - Activity ID
 * @returns Success/error result
 */
export async function deletePendingRegistration(
  userId: string,
  activityId: string
): Promise<QueryResult<void>> {
  try {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('user_id', userId)
      .eq('activity_id', activityId)
      .eq('payment_status', 'pending')

    if (error) {
      handleQueryError(error, `deleting pending registration for user ${userId} activity ${activityId}`)
      return errorResult(error)
    }

    return successResult(undefined as void)
  } catch (error) {
    return errorResult(error as any)
  }
}

// ============================================================================
// COMPLEX OPERATIONS
// ============================================================================

/**
 * Bulk update attendance for multiple registrations
 * Used by trainers to mark attendance for all participants at once
 *
 * @param updates - Array of registration IDs and attendance status
 * @returns Updated registrations
 */
export async function bulkUpdateAttendance(
  updates: AttendanceUpdate[]
): Promise<QueryListResult<Registration>> {
  try {
    const results: Registration[] = []

    // Process updates sequentially to avoid race conditions
    for (const update of updates) {
      const result = await markAttendance(update.id, update.attended)
      if (result.error) {
        handleQueryError(result.error, `bulk attendance update for registration ${update.id}`)
        continue
      }
      if (result.data) {
        results.push(result.data)
      }
    }

    return successListResult(results)
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Cancel all registrations for an activity
 * Used when an activity is cancelled
 *
 * @param activityId - Activity ID
 * @returns Updated registrations
 */
export async function cancelActivityRegistrations(
  activityId: string
): Promise<QueryListResult<Registration>> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('activity_id', activityId)
      .in('status', ['registered']) // Only cancel active registrations
      .select()

    if (error) {
      handleQueryError(error, `cancelling all registrations for activity ${activityId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}
