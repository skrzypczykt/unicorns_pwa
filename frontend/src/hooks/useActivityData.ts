import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import {
  getActivitiesInWeek,
  getSpecialEvents,
  getActivityTypes,
  type ActivityWithCount,
  type ActivityType,
} from '../supabase/repositories'

// Re-export for backward compatibility
export type Activity = ActivityWithCount

export interface Trainer {
  id: string
  display_name: string
  email: string
}

export type { ActivityType }

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

      // Use repository for regular activities
      const regularResult = await getActivitiesInWeek(startDate, endDate)
      if (regularResult.error) throw regularResult.error

      // Use repository for special events
      const specialResult = await getSpecialEvents()
      if (specialResult.error) throw specialResult.error

      // Combine results
      const activitiesData = [...regularResult.data, ...specialResult.data]
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
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
      // Use repository for activity types
      const result = await getActivityTypes()
      if (result.error) throw result.error
      setActivityTypes(result.data)
    } catch (error) {
      console.error('Error fetching activity types:', error)
      setActivityTypes([])
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
