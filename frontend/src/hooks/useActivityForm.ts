import { useState } from 'react'
import type { ActivityType } from './useActivityData'

export interface ActivityFormData {
  name: string
  description: string
  date_time: string
  duration_minutes: number
  duration_description: string
  max_participants: number
  unlimited_participants: boolean
  cost: number
  location: string
  trainer_id: string
  activity_type_id: string
  cancellation_hours: number
  status: string
  registration_opens_at: string
  registration_closes_at: string
  is_recurring: boolean
  recurrence_pattern: string
  recurrence_end_date: string
  recurrence_day_of_week: string
  recurrence_time: string
  image_url: string
  is_special_event: boolean
  whatsapp_group_url: string
  send_notification: boolean
  send_email_notification: boolean
  email_subject: string
  email_body: string
  requires_immediate_payment: boolean
  payment_deadline_hours: number
  requires_registration: boolean
  is_online: boolean
  meeting_link: string
}

const initialFormData: ActivityFormData = {
  name: '',
  description: '',
  date_time: '',
  duration_minutes: 60,
  duration_description: '',
  max_participants: 15,
  unlimited_participants: false,
  cost: 30,
  location: '',
  trainer_id: '',
  activity_type_id: '',
  cancellation_hours: 24,
  status: 'scheduled',
  registration_opens_at: '',
  registration_closes_at: '',
  is_recurring: false,
  recurrence_pattern: 'none',
  recurrence_end_date: '',
  recurrence_day_of_week: '',
  recurrence_time: '',
  image_url: '',
  is_special_event: false,
  whatsapp_group_url: '',
  send_notification: false,
  send_email_notification: false,
  email_subject: '',
  email_body: '',
  requires_immediate_payment: true,
  payment_deadline_hours: 48,
  requires_registration: true,
  is_online: false,
  meeting_link: ''
}

export const useActivityForm = (activityTypes: ActivityType[]) => {
  const [formData, setFormData] = useState<ActivityFormData>(initialFormData)
  const [creationStep, setCreationStep] = useState<number>(1)
  const [activityMode, setActivityMode] = useState<'single' | 'recurring' | 'special' | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleModeSelection = (mode: 'single' | 'recurring' | 'special') => {
    setActivityMode(mode)
    setCreationStep(2)

    const innTypeId = activityTypes.find(t => t.name === 'Inne')?.id || ''

    setFormData({
      ...formData,
      is_special_event: mode === 'special',
      is_recurring: mode === 'recurring',
      activity_type_id: mode === 'special' ? innTypeId : '',
      trainer_id: mode === 'special' ? '' : formData.trainer_id,
      recurrence_pattern: mode === 'recurring' ? 'weekly' : 'none'
    })
  }

  const handleBackStep = () => {
    if (creationStep > 1) {
      setCreationStep(creationStep - 1)
      if (creationStep === 2) {
        setActivityMode(null)
      }
    } else {
      resetForm()
    }
  }

  const handleNextStep = () => {
    if (creationStep === 2) {
      if (!formData.name && activityMode !== 'recurring') {
        alert('Nazwa jest wymagana')
        return
      }
      if (!formData.activity_type_id && activityMode !== 'special') {
        alert('Typ zajęć / Nazwa sekcji jest wymagany')
        return
      }
      if (!formData.trainer_id && activityMode !== 'special') {
        alert('Trener jest wymagany')
        return
      }
      if (!formData.date_time && activityMode !== 'recurring') {
        alert('Data i godzina są wymagane')
        return
      }
    }
    setCreationStep(3)
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCreationStep(1)
    setActivityMode(null)
    setShowForm(false)
  }

  const updateFormData = (updates: Partial<ActivityFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const setFormDataFromActivity = (activity: any) => {
    setFormData({
      name: activity.name || '',
      description: activity.description || '',
      date_time: activity.date_time || '',
      duration_minutes: activity.duration_minutes || 60,
      duration_description: activity.duration_description || '',
      max_participants: activity.max_participants || 15,
      unlimited_participants: activity.max_participants === null,
      cost: activity.cost || 30,
      location: activity.location || '',
      trainer_id: activity.trainer_id || '',
      activity_type_id: activity.activity_type_id || '',
      cancellation_hours: activity.cancellation_hours || 24,
      status: activity.status || 'scheduled',
      registration_opens_at: activity.registration_opens_at || '',
      registration_closes_at: activity.registration_closes_at || '',
      is_recurring: activity.is_recurring || false,
      recurrence_pattern: activity.recurrence_pattern || 'none',
      recurrence_end_date: activity.recurrence_end_date || '',
      recurrence_day_of_week: activity.recurrence_day_of_week || '',
      recurrence_time: activity.recurrence_time || '',
      image_url: activity.image_url || '',
      is_special_event: activity.is_special_event || false,
      whatsapp_group_url: activity.whatsapp_group_url || '',
      send_notification: false,
      send_email_notification: false,
      email_subject: '',
      email_body: '',
      requires_immediate_payment: activity.requires_immediate_payment ?? true,
      payment_deadline_hours: activity.payment_deadline_hours || 48,
      requires_registration: activity.requires_registration ?? true,
      is_online: activity.is_online || false,
      meeting_link: activity.meeting_link || ''
    })
  }

  return {
    formData,
    creationStep,
    activityMode,
    showForm,
    setShowForm,
    handleModeSelection,
    handleBackStep,
    handleNextStep,
    resetForm,
    updateFormData,
    setFormDataFromActivity,
    setCreationStep,
    setActivityMode
  }
}
