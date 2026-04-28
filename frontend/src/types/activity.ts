import { Database } from './database.types'

// Base types from database
export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activities']['Update']

export type ActivityType = Database['public']['Tables']['activity_types']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']

// Extended types with relations (for queries with joins)
export interface ActivityWithRelations extends Activity {
  activity_type?: ActivityType | null
  trainer?: User | null
  registrations?: Registration[]
  participants_count?: number
}

// For recurring activities
export interface RecurringActivity extends Activity {
  is_recurring: boolean
  parent_activity_id?: string | null
  recurrence_rule?: string | null
}

// Activity status helpers
export type ActivityStatus = Activity['status']

export const isActivityCancelled = (activity: Activity): boolean => {
  return activity.status === 'cancelled'
}

export const isActivityCompleted = (activity: Activity): boolean => {
  return activity.status === 'completed'
}

export const isActivityScheduled = (activity: Activity): boolean => {
  return activity.status === 'scheduled'
}

export const isSpecialEvent = (activity: Activity): boolean => {
  return activity.is_special_event
}

export const isActivityFull = (activity: ActivityWithRelations): boolean => {
  return (activity.participants_count || 0) >= activity.max_participants
}
