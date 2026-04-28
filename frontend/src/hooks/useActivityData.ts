import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

export interface Activity {
  id: string
  name: string
  description: string
  date_time: string | null
  duration_minutes: number
  duration_description?: string | null
  max_participants: number | null
  cost: number
  location: string
  trainer_id: string
  cancellation_hours: number
  status: string
  activity_type_id: string | null
  registration_opens_at?: string | null
  registration_closes_at?: string | null
  is_recurring?: boolean
  recurrence_pattern?: string
  recurrence_end_date?: string | null
  recurrence_day_of_week?: string | null
  recurrence_time?: string | null
  parent_activity_id?: string | null
  image_url?: string | null
  is_special_event?: boolean
  registered_count?: number
  whatsapp_group_url?: string | null
  requires_immediate_payment?: boolean
  payment_deadline_hours?: number
  requires_registration?: boolean
  is_online?: boolean
  meeting_link?: string | null
}

export interface Trainer {
  id: string
  display_name: string
  email: string
}

export interface ActivityType {
  id: string
  name: string
}

export const useActivityData = (weekOffset: number) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
    fetchTrainers()
    fetchActivityTypes()
  }, [weekOffset])

  const fetchActivities = async () => {
    try {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() + (weekOffset * 7))
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)

      const { data: regularActivitiesData, error: regularError } = await supabase
        .from('activities')
        .select('*')
        .eq('is_special_event', false)
        .neq('status', 'template')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .order('date_time', { ascending: true })

      if (regularError) throw regularError

      const { data: specialActivitiesData, error: specialError } = await supabase
        .from('activities')
        .select('*')
        .eq('is_special_event', true)
        .neq('status', 'template')
        .eq('status', 'scheduled')
        .order('date_time', { ascending: true })

      if (specialError) throw specialError

      const activitiesData = [...(regularActivitiesData || []), ...(specialActivitiesData || [])]

      const { data: registrationCounts, error: countsError } = await supabase
        .from('registrations')
        .select('activity_id')
        .in('status', ['registered', 'attended'])

      if (countsError) throw countsError

      const counts: Record<string, number> = {}
      registrationCounts?.forEach(reg => {
        counts[reg.activity_id] = (counts[reg.activity_id] || 0) + 1
      })

      const activitiesWithCounts = activitiesData?.map(activity => ({
        ...activity,
        registered_count: counts[activity.id] || 0
      }))

      setActivities(activitiesWithCounts || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email, role')
        .in('role', ['trainer', 'admin', 'external_trainer'])
        .order('display_name', { ascending: true})

      if (error) throw error
      setTrainers(data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
    }
  }

  const fetchActivityTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_types')
        .select('id, name, default_trainer_id')
        .order('name', { ascending: true })

      if (error) throw error
      setActivityTypes(data || [])
    } catch (error) {
      console.error('Error fetching activity types:', error)
    }
  }

  const refetchActivities = () => {
    setLoading(true)
    fetchActivities()
  }

  return {
    activities,
    trainers,
    activityTypes,
    loading,
    refetchActivities
  }
}
