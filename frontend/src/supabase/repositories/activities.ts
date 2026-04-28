import { supabase } from '../client'
import type { Activity, ActivityInsert, ActivityUpdate, ActivityType } from '../../types/activity'
import { QueryResult, QueryListResult, handleQueryError, successResult, successListResult, errorResult, errorListResult } from './base'

/**
 * Activity with participant count
 */
export interface ActivityWithCount extends Activity {
  registered_count?: number
}

/**
 * Activity with full participant details
 */
export interface ActivityWithParticipants extends Activity {
  registrations?: Array<{
    id: string
    user_id: string
    status: string
    payment_status: string
  }>
  participants_count?: number
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Fetch activities within a specific week range
 * Excludes template activities and includes registered participant counts
 *
 * @param startDate - Start of the week
 * @param endDate - End of the week
 * @returns Regular activities (non-special events) within the date range
 */
export async function getActivitiesInWeek(
  startDate: Date,
  endDate: Date
): Promise<QueryListResult<ActivityWithCount>> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('is_special_event', false)
      .neq('status', 'template')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString())
      .order('date_time', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching activities in week')
      return errorListResult(error)
    }

    // Fetch registration counts
    const { data: registrationCounts, error: countsError } = await supabase
      .from('registrations')
      .select('activity_id')
      .in('status', ['registered', 'attended'])

    if (countsError) {
      handleQueryError(countsError, 'fetching registration counts')
    }

    // Add participant counts to activities
    const activitiesWithCounts = (data || []).map((activity) => ({
      ...activity,
      registered_count: registrationCounts?.filter((r) => r.activity_id === activity.id).length || 0,
    }))

    return successListResult(activitiesWithCounts)
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all special events (regardless of date)
 * Special events are displayed separately from regular activities
 *
 * @returns All scheduled special events
 */
export async function getSpecialEvents(): Promise<QueryListResult<ActivityWithCount>> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('is_special_event', true)
      .neq('status', 'template')
      .eq('status', 'scheduled')
      .order('date_time', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching special events')
      return errorListResult(error)
    }

    // Fetch registration counts
    const { data: registrationCounts, error: countsError } = await supabase
      .from('registrations')
      .select('activity_id')
      .in('status', ['registered', 'attended'])

    if (countsError) {
      handleQueryError(countsError, 'fetching registration counts for special events')
    }

    // Add participant counts
    const eventsWithCounts = (data || []).map((activity) => ({
      ...activity,
      registered_count: registrationCounts?.filter((r) => r.activity_id === activity.id).length || 0,
    }))

    return successListResult(eventsWithCounts)
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch a single activity by ID with participant details
 *
 * @param id - Activity ID
 * @returns Activity with registrations and participant count
 */
export async function getActivityById(id: string): Promise<QueryResult<ActivityWithParticipants>> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      handleQueryError(error, `fetching activity ${id}`)
      return errorResult(error)
    }

    // Fetch registrations for this activity
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('id, user_id, status, payment_status')
      .eq('activity_id', id)
      .in('status', ['registered', 'attended'])

    if (regError) {
      handleQueryError(regError, `fetching registrations for activity ${id}`)
    }

    const activityWithParticipants: ActivityWithParticipants = {
      ...data,
      registrations: registrations || [],
      participants_count: registrations?.length || 0,
    }

    return successResult(activityWithParticipants)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch recurring activity templates
 * These are master templates used to generate recurring instances
 *
 * @returns All recurring activity templates
 */
export async function getRecurringActivityTemplates(): Promise<QueryListResult<Activity>> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('status', 'template')
      .eq('is_recurring', true)
      .is('parent_activity_id', null)
      .order('name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching recurring templates')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all activity types
 *
 * @returns List of all activity types
 */
export async function getActivityTypes(): Promise<QueryListResult<ActivityType>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching activity types')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch activities for a specific trainer
 *
 * @param trainerId - Trainer user ID
 * @param includeCompleted - Whether to include completed activities
 * @returns Activities assigned to the trainer
 */
export async function getTrainerActivities(
  trainerId: string,
  includeCompleted = false
): Promise<QueryListResult<ActivityWithCount>> {
  try {
    let query = supabase
      .from('activities')
      .select('*')
      .eq('trainer_id', trainerId)
      .neq('status', 'template')
      .order('date_time', { ascending: true })

    if (!includeCompleted) {
      query = query.neq('status', 'completed')
    }

    const { data, error } = await query

    if (error) {
      handleQueryError(error, `fetching activities for trainer ${trainerId}`)
      return errorListResult(error)
    }

    // Fetch registration counts
    const { data: registrationCounts, error: countsError } = await supabase
      .from('registrations')
      .select('activity_id')
      .in('status', ['registered', 'attended'])

    if (countsError) {
      handleQueryError(countsError, 'fetching registration counts for trainer activities')
    }

    const activitiesWithCounts = (data || []).map((activity) => ({
      ...activity,
      registered_count: registrationCounts?.filter((r) => r.activity_id === activity.id).length || 0,
    }))

    return successListResult(activitiesWithCounts)
  } catch (error) {
    return errorListResult(error as any)
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new activity
 *
 * @param activityData - Activity data to insert
 * @returns Created activity
 */
export async function createActivity(activityData: ActivityInsert): Promise<QueryResult<Activity>> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert(activityData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating activity')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update an existing activity
 *
 * @param id - Activity ID
 * @param updates - Fields to update
 * @returns Updated activity
 */
export async function updateActivity(
  id: string,
  updates: ActivityUpdate
): Promise<QueryResult<Activity>> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating activity ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Cancel an activity
 * Sets status to 'cancelled' and optionally stores cancellation reason
 *
 * @param id - Activity ID
 * @param reason - Optional cancellation reason
 * @returns Updated activity
 */
export async function cancelActivity(
  id: string,
  reason?: string
): Promise<QueryResult<Activity>> {
  try {
    const updates: ActivityUpdate = {
      status: 'cancelled',
    }

    // Note: cancellation_reason field would need to be added to the schema
    // For now, we just update the status

    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `cancelling activity ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Delete an activity
 * Note: This is a hard delete. Consider using cancelActivity instead.
 *
 * @param id - Activity ID
 * @returns Success/error result
 */
export async function deleteActivity(id: string): Promise<QueryResult<void>> {
  try {
    const { error } = await supabase.from('activities').delete().eq('id', id)

    if (error) {
      handleQueryError(error, `deleting activity ${id}`)
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
 * Generate recurring activity instances from a template
 * Creates multiple activity records based on recurrence pattern
 *
 * @param templateId - ID of the recurring template
 * @param count - Number of instances to generate
 * @returns Created activity instances
 */
export async function generateRecurringInstances(
  templateId: string,
  count: number
): Promise<QueryListResult<Activity>> {
  try {
    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', templateId)
      .eq('status', 'template')
      .single()

    if (templateError) {
      handleQueryError(templateError, `fetching recurring template ${templateId}`)
      return errorListResult(templateError)
    }

    if (!template.recurrence_pattern || !template.recurrence_time) {
      const error = { message: 'Template missing recurrence configuration' } as any
      handleQueryError(error, 'generating recurring instances')
      return errorListResult(error)
    }

    // Generate instances based on recurrence pattern
    // This is a simplified implementation - full implementation would parse recurrence_pattern
    const instances: ActivityInsert[] = []
    const baseDate = new Date()

    for (let i = 0; i < count; i++) {
      const instanceDate = new Date(baseDate)
      instanceDate.setDate(baseDate.getDate() + i * 7) // Weekly recurrence example

      const [hours, minutes] = template.recurrence_time.split(':')
      instanceDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      instances.push({
        ...template,
        id: undefined, // Let database generate new ID
        parent_activity_id: templateId,
        status: 'scheduled',
        date_time: instanceDate.toISOString(),
      })
    }

    // Insert all instances
    const { data, error } = await supabase.from('activities').insert(instances).select()

    if (error) {
      handleQueryError(error, 'inserting recurring instances')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}
