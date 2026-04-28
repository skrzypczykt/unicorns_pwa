import { useState } from 'react'
import type { Activity } from './useActivityData'
import type { ActivityFormData } from './useActivityForm'

const toDateTimeLocal = (isoString: string | null | undefined): string => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

interface UseActivityEditProps {
  setFormDataFromActivity: (activity: any) => void
  setShowForm: (show: boolean) => void
  saveActivity: (dataToSave: any, sendNotifications: boolean) => Promise<void>
}

export const useActivityEdit = ({ setFormDataFromActivity, setShowForm, saveActivity }: UseActivityEditProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showEditNotificationModal, setShowEditNotificationModal] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  const handleEdit = (activity: Activity) => {
    if (activity.status === 'template') {
      alert('⚠️ Szablony wydarzeń cyklicznych można edytować tylko z poziomu Zarządzania Sekcjami.')
      return
    }

    setEditingId(activity.id)
    setFormDataFromActivity(activity)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditingActivity = (participantsCount: number, dataToSave: any) => {
    setPendingFormData(dataToSave)
    setParticipantCount(participantsCount)
    setShowEditNotificationModal(true)
  }

  const handleConfirmNotifications = async () => {
    setShowEditNotificationModal(false)
    await saveActivity(pendingFormData, true)
  }

  const handleSkipNotifications = async () => {
    setShowEditNotificationModal(false)
    await saveActivity(pendingFormData, false)
  }

  const handleCancelEdit = () => {
    setShowEditNotificationModal(false)
    setPendingFormData(null)
  }

  const resetEditState = () => {
    setEditingId(null)
    setPendingFormData(null)
    setParticipantCount(0)
    setShowEditNotificationModal(false)
  }

  return {
    editingId,
    showEditNotificationModal,
    participantCount,
    pendingFormData,
    handleEdit,
    handleEditingActivity,
    handleConfirmNotifications,
    handleSkipNotifications,
    handleCancelEdit,
    resetEditState,
    setEditingId
  }
}
