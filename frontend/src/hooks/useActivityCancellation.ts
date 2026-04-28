import { useState } from 'react'
import { supabase } from '../supabase/client'
import type { Activity } from './useActivityData'

interface UseActivityCancellationProps {
  activities: Activity[]
  refetchActivities: () => void
}

export const useActivityCancellation = ({ activities, refetchActivities }: UseActivityCancellationProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activityToCancel, setActivityToCancel] = useState<Activity | null>(null)
  const [cancelParticipantsCount, setCancelParticipantsCount] = useState(0)
  const [cancelHasPaidParticipants, setCancelHasPaidParticipants] = useState(false)

  const handleCancel = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId)
    if (!activity) return

    try {
      const { count: participantsCount, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId)
        .eq('status', 'registered')

      if (countError) throw countError

      const { count: paidCount, error: paidError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId)
        .eq('payment_status', 'paid')

      if (paidError) throw paidError

      setActivityToCancel(activity)
      setCancelParticipantsCount(participantsCount || 0)
      setCancelHasPaidParticipants((paidCount || 0) > 0)
      setShowCancelModal(true)
    } catch (error) {
      console.error('Error checking participants:', error)
      alert('Wystąpił błąd podczas sprawdzania uczestników')
    }
  }

  const handleConfirmCancel = async (
    sendNotification: boolean,
    emailSubject: string,
    emailBody: string
  ) => {
    if (!activityToCancel) return

    try {
      const { error } = await supabase
        .from('activities')
        .update({ status: 'cancelled' })
        .eq('id', activityToCancel.id)

      if (error) throw error

      if (cancelHasPaidParticipants) {
        const { error: refundError } = await supabase
          .from('registrations')
          .update({ refund_status: 'pending' })
          .eq('activity_id', activityToCancel.id)
          .eq('payment_status', 'paid')

        if (refundError) {
          console.error('Error marking refunds as pending:', refundError)
        }
      }

      if (sendNotification && cancelParticipantsCount > 0) {
        await sendCancellationNotifications(activityToCancel, emailSubject, emailBody)
      } else {
        alert('✅ Zajęcia anulowane')
      }

      setShowCancelModal(false)
      setActivityToCancel(null)
      refetchActivities()
    } catch (error) {
      console.error('Error cancelling activity:', error)
      alert('Wystąpił błąd podczas anulowania')
    }
  }

  const sendCancellationNotifications = async (
    activity: Activity,
    emailSubject: string,
    emailBody: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const pushResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            activityId: activity.id,
            activityName: activity.name,
            dateTime: activity.date_time,
            isCancellation: true
          })
        }
      )

      const pushData = await pushResponse.json()

      const emailResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            subject: emailSubject,
            body: emailBody,
            activityId: activity.id,
            notificationType: 'event_cancelled'
          })
        }
      )

      const emailData = await emailResponse.json()

      alert(
        `✅ Zajęcia anulowane!\n\nWysłano powiadomienia:\n📱 Push: ${pushData.sent || 0}\n📧 Email: ${emailData.sent || 0}`
      )
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
      alert('✅ Zajęcia anulowane, ale wystąpił błąd przy wysyłaniu powiadomień')
    }
  }

  const handleCancelCancellation = () => {
    setShowCancelModal(false)
    setActivityToCancel(null)
  }

  return {
    showCancelModal,
    activityToCancel,
    cancelParticipantsCount,
    cancelHasPaidParticipants,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancellation
  }
}
