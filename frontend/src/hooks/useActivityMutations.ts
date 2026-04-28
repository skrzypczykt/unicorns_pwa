import { supabase } from '../supabase/client'
import type { ActivityFormData } from './useActivityForm'
import type { ActivityType } from './useActivityData'

const toISOWithTimezone = (dateTimeLocal: string | null | undefined): string | null => {
  if (!dateTimeLocal) return null
  const localDate = new Date(dateTimeLocal)
  return localDate.toISOString()
}

interface UseActivityMutationsProps {
  formData: ActivityFormData
  activityMode: 'single' | 'recurring' | 'special' | null
  activityTypes: ActivityType[]
  editingId: string | null
  onSuccess: () => void
  onEditingActivity: (participantCount: number, dataToSave: any) => void
}

export const useActivityMutations = ({
  formData,
  activityMode,
  activityTypes,
  editingId,
  onSuccess,
  onEditingActivity
}: UseActivityMutationsProps) => {

  const validateAndPrepareData = (): any => {
    if (!formData.activity_type_id) {
      alert('❌ Musisz wybrać typ zajęć (np. Joga, Taniec, Fitness).')
      return null
    }

    if (!formData.is_special_event && !formData.trainer_id) {
      alert('❌ Musisz wybrać trenera dla zwykłych zajęć. Jeśli to wydarzenie specjalne, zaznacz "Wydarzenie specjalne".')
      return null
    }

    let finalName = formData.name
    if (activityMode === 'recurring' && !formData.name.trim()) {
      const typeName = activityTypes.find(t => t.id === formData.activity_type_id)?.name || 'Zajęcia'
      finalName = `${typeName} - zajęcia cykliczne`
    }

    const { send_notification, unlimited_participants, send_email_notification, email_subject, email_body, ...formDataWithoutNotification } = formData

    const dataToSave = {
      ...formDataWithoutNotification,
      name: finalName,
      date_time: (formData.is_recurring && activityMode === 'recurring')
        ? null
        : toISOWithTimezone(formData.date_time),
      registration_opens_at: (formData.is_recurring && activityMode === 'recurring')
        ? null
        : (formData.is_special_event ? null : toISOWithTimezone(formData.registration_opens_at)),
      registration_closes_at: (formData.is_recurring && activityMode === 'recurring')
        ? null
        : toISOWithTimezone(formData.registration_closes_at),
      recurrence_end_date: toISOWithTimezone(formData.recurrence_end_date) || null,
      recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : 'none',
      recurrence_day_of_week: (formData.is_recurring && activityMode === 'recurring')
        ? formData.recurrence_day_of_week
        : null,
      recurrence_time: (formData.is_recurring && activityMode === 'recurring')
        ? formData.recurrence_time
        : null,
      status: (formData.is_recurring && activityMode === 'recurring')
        ? 'template'
        : formData.status,
      trainer_id: formData.is_special_event ? null : (formData.trainer_id || null),
      duration_minutes: formData.duration_description ? 0 : formData.duration_minutes,
      duration_description: formData.duration_description || null,
      max_participants: (formData.unlimited_participants || !formData.requires_registration) ? null : formData.max_participants
    }

    return dataToSave
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dataToSave = validateAndPrepareData()
      if (!dataToSave) return

      if (editingId) {
        const { count, error: countError } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('activity_id', editingId)
          .eq('status', 'registered')

        if (countError) {
          console.error('Error counting participants:', countError)
        }

        const participantsCount = count || 0

        if (participantsCount > 0) {
          onEditingActivity(participantsCount, dataToSave)
          return
        }
      }

      await saveActivity(dataToSave, false)
    } catch (error) {
      console.error('[Admin] ❌ ERROR saving activity:', error)
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  const saveActivity = async (dataToSave: any, sendNotifications: boolean) => {
    try {
      if (editingId) {
        const { data: updatedActivity, error } = await supabase
          .from('activities')
          .update(dataToSave)
          .eq('id', editingId)
          .select()
          .single()

        if (error) throw error

        if (sendNotifications && updatedActivity) {
          await sendEventUpdateNotifications(updatedActivity)
        } else {
          alert('✅ Zajęcia zaktualizowane!')
        }
      } else {
        const { data: newActivity, error } = await supabase
          .from('activities')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error

        if (formData.is_recurring && newActivity) {
          await generateRecurringInstances(newActivity)
        } else {
          alert('✅ Nowe zajęcia utworzone!')
        }

        if (newActivity && formData.send_notification) {
          await sendPushNotifications(newActivity)
        }

        if (newActivity && formData.send_email_notification && formData.email_subject && formData.email_body) {
          await sendEmailNotifications(newActivity)
        }
      }

      onSuccess()
    } catch (error) {
      console.error('[Admin] ❌ ERROR saving activity:', error)
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  const generateRecurringInstances = async (activity: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recurring-activities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ activityTemplate: activity })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Error generating instances:', data)
        alert(`⚠️ Zajęcia utworzone, ale wystąpił błąd przy generowaniu serii: ${data.error}`)
      } else {
        alert(`✅ Zajęcia cykliczne utworzone! Wygenerowano ${data.created} instancji.`)
      }
    } catch (err) {
      console.error('Error generating instances:', err)
      alert('⚠️ Zajęcia utworzone, ale wystąpił błąd przy generowaniu serii')
    }
  }

  const sendPushNotifications = async (activity: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            activityId: activity.id,
            activityName: activity.name,
            dateTime: activity.date_time,
            userId: user?.id,
            sendToAll: formData.is_special_event
          })
        }
      )

      const pushData = await response.json()

      if (!response.ok) {
        console.error('[Push] Error sending push notifications:', pushData)
        alert(`⚠️ Zajęcia utworzone, ale wystąpił błąd przy wysyłaniu powiadomień: ${pushData.error}`)
      } else {
        alert(`✅ Zajęcia utworzone i wysłano ${pushData.sent} powiadomień!`)
      }
    } catch (err) {
      console.error('[Push] Error sending push notifications:', err)
      alert('⚠️ Zajęcia utworzone, ale wystąpił błąd przy wysyłaniu powiadomień')
    }
  }

  const sendEmailNotifications = async (activity: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

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
            subject: formData.email_subject,
            body: formData.email_body,
            activityId: activity.id
          })
        }
      )

      const emailData = await emailResponse.json()

      if (!emailResponse.ok) {
        console.error('[Email] Error sending emails:', emailData)
        alert(`⚠️ Powiadomienia email: ${emailData.error}`)
      } else {
        alert(`✅ Wysłano ${emailData.sent} emaili!`)
      }
    } catch (err) {
      console.error('[Email] Error sending emails:', err)
      alert('⚠️ Wystąpił błąd przy wysyłaniu powiadomień email')
    }
  }

  const sendEventUpdateNotifications = async (activity: any) => {
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
            isUpdate: true
          })
        }
      )

      const pushData = await pushResponse.json()

      const emailBody = `Informujemy o zmianach w wydarzeniu "${activity.name}".\n\nNowa data: ${new Date(activity.date_time).toLocaleString('pl-PL')}\nMiejsce: ${activity.location}\n\nZaloguj się do aplikacji Unicorns aby zobaczyć szczegóły.`

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
            subject: `🔔 Zmiana w wydarzeniu: ${activity.name}`,
            body: emailBody,
            activityId: activity.id,
            notificationType: 'event_updated'
          })
        }
      )

      const emailData = await emailResponse.json()

      alert(`✅ Zajęcia zaktualizowane!\n\nWysłano powiadomienia:\n📱 Push: ${pushData.sent || 0}\n📧 Email: ${emailData.sent || 0}`)
    } catch (err) {
      console.error('[Notifications] Error:', err)
      alert('✅ Zajęcia zaktualizowane, ale wystąpił błąd przy wysyłaniu powiadomień')
    }
  }

  return {
    handleSubmit,
    saveActivity
  }
}
