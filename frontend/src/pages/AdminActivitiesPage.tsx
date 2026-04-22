import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from '../utils/formatDuration'
import { ACTIVITY_TYPE_IMAGES } from '../data/activityImages'
import EditEventNotificationModal from '../components/EditEventNotificationModal'
import ActivityTypeSelector from '../components/ActivityTypeSelector'
import ActivityCreationBreadcrumbs from '../components/ActivityCreationBreadcrumbs'

interface Activity {
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

interface Trainer {
  id: string
  display_name: string
  email: string
}

interface ActivityType {
  id: string
  name: string
}

const AdminActivitiesPage = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string[]>(['scheduled']) // Domyślnie aktywne
  const [showEditNotificationModal, setShowEditNotificationModal] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  // Wieloetapowy flow dodawania wydarzenia
  const [creationStep, setCreationStep] = useState<number>(1)
  const [activityMode, setActivityMode] = useState<'single' | 'recurring' | 'special' | null>(null)

  // Form state
  const [formData, setFormData] = useState({
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
  })

  useEffect(() => {
    fetchActivities()
    fetchTrainers()
    fetchActivityTypes()
  }, [statusFilter]) // Odśwież gdy zmieni się filtr

  const fetchActivities = async () => {
    try {
      // Fetch activities - always exclude templates (status='template')
      let query = supabase
        .from('activities')
        .select('*')
        .in('status', statusFilter)
        .neq('status', 'template') // Zawsze ukryj szablony wydarzeń cyklicznych

      const { data: activitiesData, error: activitiesError } = await query
        .order('is_special_event', { ascending: false })  // Wydarzenia specjalne najpierw
        .order('date_time', { ascending: false, nullsFirst: false }) // Potem po dacie

      if (activitiesError) throw activitiesError

      // Fetch registration counts for each activity
      const { data: registrationCounts, error: countsError } = await supabase
        .from('registrations')
        .select('activity_id')
        .in('status', ['registered', 'attended'])

      if (countsError) throw countsError

      // Count registrations per activity
      const counts: Record<string, number> = {}
      registrationCounts?.forEach(reg => {
        counts[reg.activity_id] = (counts[reg.activity_id] || 0) + 1
      })

      // Add counts to activities
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
        .order('display_name', { ascending: true })

      if (error) throw error
      console.log('Fetched trainers:', data)
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
      console.log('Fetched activity types:', data)
      setActivityTypes(data || [])
    } catch (error) {
      console.error('Error fetching activity types:', error)
    }
  }

  // Helper: konwertuj datetime-local (lokalny czas) na ISO string z timezone
  const toISOWithTimezone = (dateTimeLocal: string | null | undefined): string | null => {
    if (!dateTimeLocal) return null
    // datetime-local zwraca "2024-04-18T18:00" bez TZ
    // Tworzymy Date obiekt z lokalnego czasu i konwertujemy na ISO (UTC)
    const localDate = new Date(dateTimeLocal)
    return localDate.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Walidacja: typ aktywności jest wymagany
      if (!formData.activity_type_id) {
        alert('❌ Musisz wybrać typ zajęć (np. Joga, Taniec, Fitness).')
        return
      }

      // Walidacja: zwykłe zajęcia (nie-special_event) muszą mieć trenera
      if (!formData.is_special_event && !formData.trainer_id) {
        alert('❌ Musisz wybrać trenera dla zwykłych zajęć. Jeśli to wydarzenie specjalne, zaznacz "Wydarzenie specjalne".')
        return
      }

      // Auto-generuj nazwę dla wydarzeń cyklicznych jeśli pusta
      let finalName = formData.name
      if (activityMode === 'recurring' && !formData.name.trim()) {
        const typeName = activityTypes.find(t => t.id === formData.activity_type_id)?.name || 'Zajęcia'
        finalName = `${typeName} - zajęcia cykliczne`
      }

      // Konwertuj puste stringi na null i datetime-local na ISO z timezone
      // Wykluczamy pola UI które nie są kolumnami w bazie
      const { send_notification, unlimited_participants, send_email_notification, email_subject, email_body, ...formDataWithoutNotification } = formData

      const dataToSave = {
        ...formDataWithoutNotification,
        name: finalName,
        // For recurring templates: set date_time to NULL and use recurrence fields
        // For instances/single: use date_time
        date_time: (formData.is_recurring && activityMode === 'recurring')
          ? null
          : toISOWithTimezone(formData.date_time),
        // Registration windows handling:
        // - For recurring: store as NULL (hours-before values are not stored in DB for templates)
        // - For special events: NULL (open immediately)
        // - For single/regular: convert datetime-local to ISO
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
        // Szablony mają status 'template', nie 'scheduled'
        status: (formData.is_recurring && activityMode === 'recurring')
          ? 'template'
          : formData.status,
        // Wydarzenia specjalne nie mają trenera
        trainer_id: formData.is_special_event ? null : (formData.trainer_id || null),
        // Jeśli używamy duration_description, ustaw duration_minutes na 0 (placeholder)
        duration_minutes: formData.duration_description ? 0 : formData.duration_minutes,
        // Jeśli duration_description jest puste, wyczyść pole
        duration_description: formData.duration_description || null,
        // Nielimitowane miejsca = NULL, bez zapisu również NULL
        max_participants: (formData.unlimited_participants || !formData.requires_registration) ? null : formData.max_participants
      }

      console.log('[Admin] Saving activity with data:', dataToSave)
      console.log('[Admin] Is editing?', !!editingId, 'ID:', editingId)

      // Jeśli edycja - sprawdź liczbę uczestników i pokaż modal
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

        // Zapisz dane i pokaż modal (tylko jeśli są uczestnicy)
        setPendingFormData(dataToSave)
        setParticipantCount(participantsCount)

        if (participantsCount > 0) {
          setShowEditNotificationModal(true)
          return // Czekaj na decyzję użytkownika
        }
      }

      // Kontynuuj zapis (dla nowych lub edycji bez uczestników)
      await saveActivity(dataToSave, false)
    } catch (error) {
      console.error('[Admin] ❌ ERROR saving activity:', error)
      console.error('[Admin] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  const saveActivity = async (dataToSave: any, sendNotifications: boolean) => {
    try {
      if (editingId) {
        // Update existing activity
        console.log('[Admin] Updating activity ID:', editingId)
        const { data: updatedActivity, error } = await supabase
          .from('activities')
          .update(dataToSave)
          .eq('id', editingId)
          .select()
          .single()

        if (error) {
          console.error('[Admin] Update error:', error)
          throw error
        }
        console.log('[Admin] Updated activity:', updatedActivity)

        // Wyślij powiadomienia jeśli requested
        if (sendNotifications && updatedActivity) {
          await sendEventUpdateNotifications(updatedActivity)
        } else {
          alert('✅ Zajęcia zaktualizowane!')
        }
      } else {
        // Create new activity
        const { data: newActivity, error } = await supabase
          .from('activities')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error

        console.log('[Admin] Created activity:', newActivity)

        // Jeśli cykliczne, generuj instancje
        if (formData.is_recurring && newActivity) {
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
                body: JSON.stringify({ activityTemplate: newActivity })
              }
            )

            const data = await response.json()

            if (!response.ok) {
              console.error('Error generating instances:', data)
              alert(`⚠️ Zajęcia utworzone, ale wystąpił błąd przy generowaniu serii: ${data.error}`)
            } else {
              console.log('Generated instances:', data)
              alert(`✅ Zajęcia cykliczne utworzone! Wygenerowano ${data.created} instancji.`)
            }
          } catch (err) {
            console.error('Error generating instances:', err)
            alert('⚠️ Zajęcia utworzone, ale wystąpił błąd przy generowaniu serii')
          }
        } else {
          alert('✅ Nowe zajęcia utworzone!')
        }

        // Wyślij powiadomienia push (jeśli zaznaczone)
        if (newActivity && formData.send_notification) {
          console.log('[Push] Calling send-push-notifications with:', {
            activityId: newActivity.id,
            activityName: newActivity.name,
            dateTime: newActivity.date_time,
            sendToAll: formData.is_special_event
          })

          const { data: { user } } = await supabase.auth.getUser()

          try {
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
                  activityId: newActivity.id,
                  activityName: newActivity.name,
                  dateTime: newActivity.date_time,
                  userId: user?.id,
                  sendToAll: formData.is_special_event // Wydarzenia specjalne -> wszyscy
                })
              }
            )

            const pushData = await response.json()

            if (!response.ok) {
              console.error('[Push] Error sending push notifications:', pushData)
              alert(`⚠️ Zajęcia utworzone, ale wystąpił błąd przy wysyłaniu powiadomień: ${pushData.error}`)
            } else {
              console.log('[Push] Notifications sent successfully:', pushData)
              alert(`✅ Zajęcia utworzone i wysłano ${pushData.sent} powiadomień!`)
            }
          } catch (err) {
            console.error('[Push] Error sending push notifications:', err)
            alert('⚠️ Zajęcia utworzone, ale wystąpił błąd przy wysyłaniu powiadomień')
          }
        } else if (!formData.send_notification && newActivity && !formData.is_recurring) {
          alert('✅ Nowe zajęcia utworzone!')
        }

        // Wyślij powiadomienia email (jeśli zaznaczone)
        if (newActivity && formData.send_email_notification && formData.email_subject && formData.email_body) {
          console.log('[Email] Calling send-email-notification')

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
                  activityId: newActivity.id
                })
              }
            )

            const emailData = await emailResponse.json()

            if (!emailResponse.ok) {
              console.error('[Email] Error sending emails:', emailData)
              alert(`⚠️ Powiadomienia email: ${emailData.error}`)
            } else {
              console.log('[Email] Emails sent successfully:', emailData)
              alert(`✅ Wysłano ${emailData.sent} emaili!`)
            }
          } catch (err) {
            console.error('[Email] Error sending emails:', err)
            alert('⚠️ Wystąpił błąd przy wysyłaniu powiadomień email')
          }
        }
      }

      console.log('[Admin] Resetting form and refreshing activities list')
      resetForm()
      await fetchActivities()
    } catch (error) {
      console.error('[Admin] ❌ ERROR saving activity:', error)
      console.error('[Admin] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
      alert('Wystąpił błąd podczas zapisywania')
    }
  }

  const sendEventUpdateNotifications = async (activity: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Wyślij powiadomienia push
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
            isUpdate: true // Flaga że to edycja
          })
        }
      )

      const pushData = await pushResponse.json()

      // Wyślij email
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

  // Helper: konwertuj ISO string (UTC z bazy) na format datetime-local (lokalny czas)
  const toDateTimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return ''
    // Parsuj UTC string z bazy i sformatuj jako lokalny czas dla datetime-local
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleEdit = (activity: Activity) => {
    // Blokuj edycję szablonów wydarzeń cyklicznych
    if (activity.status === 'template') {
      alert('⚠️ Szablony wydarzeń cyklicznych można edytować tylko z poziomu Zarządzania Sekcjami.')
      return
    }

    console.log('[Admin] Editing activity:', activity.id, activity.name)
    console.log('[Admin] Activity data:', activity)
    setEditingId(activity.id)
    setFormData({
      name: activity.name,
      description: activity.description,
      date_time: toDateTimeLocal(activity.date_time),
      duration_minutes: activity.duration_minutes,
      duration_description: activity.duration_description || '',
      max_participants: activity.max_participants || 15,
      unlimited_participants: activity.max_participants === null,
      cost: activity.cost,
      location: activity.location,
      trainer_id: activity.trainer_id,
      activity_type_id: activity.activity_type_id || '',
      cancellation_hours: activity.cancellation_hours,
      status: activity.status,
      registration_opens_at: toDateTimeLocal(activity.registration_opens_at),
      registration_closes_at: toDateTimeLocal(activity.registration_closes_at),
      is_recurring: activity.is_recurring || false,
      recurrence_pattern: activity.recurrence_pattern || 'none',
      recurrence_end_date: toDateTimeLocal(activity.recurrence_end_date),
      image_url: activity.image_url || '',
      is_special_event: activity.is_special_event || false,
      whatsapp_group_url: activity.whatsapp_group_url || '',
      send_notification: false,
      requires_immediate_payment: (activity as any).requires_immediate_payment || false,
      payment_deadline_hours: (activity as any).payment_deadline_hours || 48,
      requires_registration: (activity as any).requires_registration !== undefined ? (activity as any).requires_registration : true
    })
    setShowForm(true)

    // Przewiń na górę strony do formularza
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = async (activityId: string) => {
    if (!confirm('Czy na pewno chcesz anulować te zajęcia?')) return

    try {
      const { error } = await supabase
        .from('activities')
        .update({ status: 'cancelled' })
        .eq('id', activityId)

      if (error) throw error
      alert('✅ Zajęcia anulowane')
      await fetchActivities()
    } catch (error) {
      console.error('Error cancelling activity:', error)
      alert('Wystąpił błąd podczas anulowania')
    }
  }

  const handleModeSelection = async (mode: 'single' | 'recurring' | 'special') => {
    setActivityMode(mode)
    setCreationStep(2)

    // Ustaw wartości domyślne w zależności od trybu
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
        // Wróciliśmy do wyboru typu - resetuj mode
        setActivityMode(null)
      }
    } else {
      // Zamknij formularz
      resetForm()
      setCreationStep(1)
      setActivityMode(null)
    }
  }

  const handleNextStep = () => {
    // Walidacja przed przejściem do etapu 3
    if (creationStep === 2) {
      // Sprawdź wymagane pola
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
      // Data i godzina - tylko dla single i special, nie dla recurring
      if (!formData.date_time && activityMode !== 'recurring') {
        alert('Data i godzina są wymagane')
        return
      }
    }
    setCreationStep(3)
  }

  const resetForm = () => {
    setFormData({
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
      requires_immediate_payment: false,
      payment_deadline_hours: 48,
      requires_registration: true,
      send_email_notification: false,
      email_subject: '',
      email_body: '',
      is_online: false,
      meeting_link: ''
    })
    setEditingId(null)
    setShowForm(false)
    setCreationStep(1)
    setActivityMode(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateInstanceCount = () => {
    if (!formData.is_recurring) {
      return 0
    }

    // Infinite recurrence
    if (!formData.recurrence_end_date) {
      return '∞ (nieskończone - 8 tygodni generowane na raz)'
    }

    // For new-style templates (day/time), we can't calculate without full date
    // Just show that it will be generated
    if (formData.recurrence_day_of_week && !formData.date_time) {
      const end = new Date(formData.recurrence_end_date)
      const now = new Date()
      const diffMs = end.getTime() - now.getTime()

      if (formData.recurrence_pattern === 'weekly' && diffMs > 0) {
        const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
        return Math.min(weeks + 1, 52)
      }

      return '~8 tygodni naprzód'
    }

    // Old-style calculation with date_time
    if (!formData.date_time || !formData.recurrence_end_date) {
      return 0
    }

    const start = new Date(formData.date_time)
    const end = new Date(formData.recurrence_end_date)

    console.log('[Admin] Calculating instances:', {
      start: start.toISOString(),
      end: end.toISOString(),
      pattern: formData.recurrence_pattern,
      startTime: start.getTime(),
      endTime: end.getTime()
    })

    if (start >= end) {
      console.log('[Admin] Instance count = 0: start >= end')
      return 0
    }

    const diffMs = end.getTime() - start.getTime()

    if (formData.recurrence_pattern === 'weekly') {
      const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
      const count = Math.min(weeks + 1, 52)
      console.log('[Admin] Weekly instances:', { weeks, count })
      return count
    } else if (formData.recurrence_pattern === 'monthly') {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      const count = Math.min(months + 1, 52)
      console.log('[Admin] Monthly instances:', { months, count })
      return count
    }

    console.log('[Admin] Instance count = 0: unknown pattern')
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">📅 Zarządzanie Zajęciami</h1>
          <p className="text-gray-600">Twórz, edytuj i zarządzaj wszystkimi zajęciami</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              + Dodaj zajęcia
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            ← Powrót
          </button>
        </div>
      </div>

      {!showForm && (
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(['scheduled'])}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter.includes('scheduled') && statusFilter.length === 1
                  ? 'bg-green-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ✅ Aktywne
            </button>
            <button
              onClick={() => setStatusFilter(['completed'])}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter.includes('completed') && statusFilter.length === 1
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🏁 Minione
            </button>
            <button
              onClick={() => setStatusFilter(['cancelled'])}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter.includes('cancelled') && statusFilter.length === 1
                  ? 'bg-red-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ❌ Anulowane
            </button>
            <button
              onClick={() => setStatusFilter(['scheduled', 'completed', 'cancelled'])}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter.length === 3
                  ? 'bg-purple-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🔍 Wszystkie
            </button>
          </div>

        </div>
      )}

      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-purple-600">
              {editingId ? 'Edytuj zajęcia' : 'Nowe zajęcia'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕ Zamknij
            </button>
          </div>

          {/* Breadcrumbs tylko dla nowych (nie edycji) */}
          {!editingId && (
            <ActivityCreationBreadcrumbs currentStep={creationStep} activityMode={activityMode} />
          )}

          {/* ETAP 1: Wybór typu (tylko dla nowych) */}
          {!editingId && creationStep === 1 && (
            <ActivityTypeSelector onSelect={handleModeSelection} />
          )}

          {/* ETAP 2 & 3: Formularz (lub edycja) */}
          {(editingId || creationStep >= 2) && (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pokazuj pola tylko w etapie 2 lub przy edycji */}
            {(editingId || creationStep === 2) && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Typ zajęć / Nazwa sekcji - ukryty dla special (auto="Inne") - PIERWSZY */}
                {activityMode !== 'special' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Typ zajęć / Nazwa sekcji *
                    </label>
                    <select
                      value={formData.activity_type_id}
                      onChange={(e) => {
                        const selectedTypeId = e.target.value
                        const selectedType = activityTypes.find(t => t.id === selectedTypeId)

                        // Auto-wypełnij trainera jeśli sekcja ma domyślnego trenera
                        const newTrainerId = (selectedType as any)?.default_trainer_id || formData.trainer_id

                        setFormData({
                          ...formData,
                          activity_type_id: selectedTypeId,
                          trainer_id: newTrainerId
                        })
                      }}
                      required
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Wybierz typ / sekcję</option>
                      {activityTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nazwa - opcjonalna dla recurring - DRUGI */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nazwa zajęć {activityMode !== 'recurring' && '*'}
                    {activityMode === 'recurring' && (
                      <span className="text-xs text-gray-500 ml-2">(opcjonalna - wygenerowana z typu)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={activityMode !== 'recurring' && !editingId}
                    placeholder={activityMode === 'recurring' ? 'Zostanie wygenerowana automatycznie...' : ''}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Trener/Organizator */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {activityMode === 'special' ? 'Organizator (opcjonalnie)' : 'Trener *'}
                  </label>
                  <select
                    value={formData.trainer_id}
                    onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                    required={activityMode !== 'special' && !editingId}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{activityMode === 'special' ? 'Brak organizatora' : 'Wybierz trenera'}</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* POZOSTAŁE POLA - Etap 2 lub edycja */}
            {(editingId || creationStep === 2) && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Opis
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Data i godzina - tylko dla single i special, nie dla recurring */}
                  {activityMode !== 'recurring' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Data i godzina *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.date_time}
                        onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                        required
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    // Dla recurring - placeholder, żeby grid był równy
                    <div></div>
                  )}

              {/* Czas trwania - tylko dla single i special, nie dla recurring */}
              {activityMode !== 'recurring' && (
                !formData.is_special_event ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Czas trwania (minuty) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      required
                      min="15"
                      step="15"
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Czas trwania (opis tekstowy)
                    </label>
                    <input
                      type="text"
                      value={formData.duration_description}
                      onChange={(e) => setFormData({ ...formData, duration_description: e.target.value })}
                      placeholder='np. "3 dni", "cały weekend", "do ustalenia"'
                      className="w-full px-4 py-2 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dla wydarzeń specjalnych możesz wpisać dowolny opis czasu trwania zamiast konkretnej liczby minut
                    </p>
                  </div>
                )
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maksymalna liczba uczestników {!formData.requires_registration && !formData.unlimited_participants && '*'}
                </label>

                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    id="unlimited_participants"
                    checked={formData.unlimited_participants || !formData.requires_registration}
                    onChange={(e) => setFormData({
                      ...formData,
                      unlimited_participants: e.target.checked,
                      max_participants: e.target.checked ? null : 15
                    })}
                    disabled={!formData.requires_registration}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                  <label htmlFor="unlimited_participants" className="text-sm text-gray-700">
                    ♾️ Bez limitu miejsc (nielimitowane)
                  </label>
                </div>

                {formData.requires_registration && !formData.unlimited_participants && (
                  <input
                    type="number"
                    value={formData.max_participants || 15}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 15 })}
                    required
                    min="1"
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                )}

                {!formData.requires_registration && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Wydarzenie nie wymaga zapisu - limit miejsc nieaktywny
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Koszt (zł) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Checkbox: Wydarzenie online */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_online}
                    onChange={(e) => setFormData({ ...formData, is_online: e.target.checked, location: '', meeting_link: '' })}
                    className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">🌐 Wydarzenie online</span>
                </label>
              </div>

              {/* Pole: Lokalizacja (tylko dla wydarzeń stacjonarnych) */}
              {!formData.is_online && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Lokalizacja *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required={!formData.is_online}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="np. Hala sportowa, ul. Piotrkowska 1"
                  />
                </div>
              )}

              {/* Pole: Link do spotkania (tylko dla wydarzeń online) */}
              {formData.is_online && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔗 Link do spotkania online *
                  </label>
                  <input
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    required={formData.is_online}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="https://meet.google.com/abc-def-ghi"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Może to być Google Meet, Zoom, Microsoft Teams lub inny link do spotkania online.
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zdjęcie (URL - opcjonalnie)
                </label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pozostaw puste aby użyć domyślnego zdjęcia na podstawie nazwy zajęć.
                  Możesz użyć Unsplash, Pexels lub własnego linku.
                </p>

                {/* Podgląd obrazka */}
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border-2 border-purple-200">
                    <img
                      src={formData.image_url}
                      alt="Podgląd"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ACTIVITY_TYPE_IMAGES['default']
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link do grupy WhatsApp
                </label>
                <input
                  type="url"
                  value={formData.whatsapp_group_url || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp_group_url: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💬 Grupa WhatsApp dla uczestników - ankiety, pytania, integracja. Zachęca do aktywności!
                </p>
              </div>

              {/* Anulowanie - tylko dla single i special, dla recurring będzie w step 3 */}
              {activityMode !== 'recurring' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Anulowanie (godz. przed zajęciami) *
                  </label>
                  <input
                    type="number"
                    value={formData.cancellation_hours}
                    onChange={(e) => setFormData({ ...formData, cancellation_hours: parseInt(e.target.value) })}
                    required
                    min="0"
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div></div>
              )}

              {/* Okna rejestracji - tylko dla single i special, nie dla recurring */}
              {activityMode !== 'recurring' && (
                <div className="col-span-2 border-t-2 border-purple-200 pt-4 mt-4">
                  <h3 className="text-lg font-bold text-purple-600 mb-3">⏰ Okna rejestracji (opcjonalnie)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Określ kiedy zapisy są otwarte. Pozostaw puste aby zapisy były otwarte od razu do rozpoczęcia zajęć.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zapisy otwarte od
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.registration_opens_at || ''}
                        onChange={(e) => setFormData({ ...formData, registration_opens_at: e.target.value || '' })}
                        disabled={formData.is_special_event}
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.is_special_event
                          ? 'Wydarzenia specjalne - zapisy od razu po dodaniu'
                          : 'Pozostaw puste aby zapisy były otwarte od razu'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zapisy zamknięte o
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.registration_closes_at || ''}
                        onChange={(e) => setFormData({ ...formData, registration_closes_at: e.target.value || '' })}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pozostaw puste aby zapisy były otwarte do początku zajęć
                    </p>
                  </div>
                </div>
                </div>
              )}

              {/* Wydarzenia specjalne - tylko dla single, nie dla recurring */}
              {activityMode !== 'recurring' && (
                <div className="border-t-2 border-yellow-200 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="is_special_event"
                      checked={formData.is_special_event || false}
                      onChange={(e) => setFormData({ ...formData, is_special_event: e.target.checked })}
                      className="h-5 w-5 text-yellow-600 rounded"
                    />
                    <label htmlFor="is_special_event" className="text-sm font-semibold text-gray-700">
                      🏆 Wydarzenie specjalne (zawody, spływy, wyjazdy)
                    </label>
                  </div>

                  {formData.is_special_event && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      <p className="font-semibold mb-2">ℹ️ Wydarzenia specjalne:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Nie wymagają przypisanego trenera</li>
                        <li>Zapisy otwarte od razu po dodaniu do bazy</li>
                        <li>Obecność nie jest sprawdzana (brak oznaczeń uczestnictwa)</li>
                        <li>Idealne dla wycieczek, zawodów, spływów kajakowych itp.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Powiadomienia push - tylko dla single i special, nie dla recurring */}
              {activityMode !== 'recurring' && (
                <div className="border-t-2 border-blue-200 pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="send_notification"
                      checked={formData.send_notification || false}
                      onChange={(e) => setFormData({ ...formData, send_notification: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="send_notification" className="text-sm font-semibold text-gray-700">
                      🔔 Wyślij powiadomienie push
                    </label>
                  </div>

                  {formData.send_notification && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      {formData.is_special_event ? (
                        <>
                          <p className="font-semibold mb-1">📢 Powiadomienie dla WSZYSTKICH użytkowników</p>
                          <p>Wydarzenia specjalne są wysyłane do wszystkich użytkowników z włączonymi powiadomieniami push (nie tylko zainteresowanych tym typem zajęć).</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold mb-1">📢 Powiadomienie dla zainteresowanych</p>
                          <p>Powiadomienie zostanie wysłane tylko do użytkowników zainteresowanych tym typem zajęć (np. Taniec, Siatkówka).</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Powiadomienia email - tylko dla wydarzeń specjalnych (nie dla recurring) */}
              {formData.is_special_event && activityMode !== 'recurring' && (
                <div className="border-t-2 border-purple-200 pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="send_email_notification"
                      checked={formData.send_email_notification || false}
                      onChange={(e) => setFormData({ ...formData, send_email_notification: e.target.checked })}
                      className="h-5 w-5 text-purple-600 rounded"
                    />
                    <label htmlFor="send_email_notification" className="text-sm font-semibold text-gray-700">
                      📧 Wyślij email do wszystkich użytkowników
                    </label>
                  </div>

                  {formData.send_email_notification && (
                    <div className="space-y-4 mt-4">
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 mb-4">
                        <p className="font-semibold mb-1">📧 Email do wszystkich użytkowników</p>
                        <p>Email zostanie wysłany do wszystkich zarejestrowanych użytkowników z informacją o wydarzeniu specjalnym.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tytuł emaila *
                        </label>
                        <input
                          type="text"
                          value={formData.email_subject}
                          onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                          placeholder="np. 🎉 Nowe wydarzenie specjalne: Spływ kajakowy!"
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Treść emaila *
                        </label>
                        <textarea
                          value={formData.email_body}
                          onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                          placeholder="Opisz wydarzenie..."
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            email_subject: `🎉 Nowe wydarzenie: ${formData.name}`,
                            email_body: `Zapraszamy na ${formData.name}!\n\n📅 Data: ${formData.date_time ? new Date(formData.date_time).toLocaleString('pl-PL') : 'Do ustalenia'}\n📍 Miejsce: ${formData.location || 'Do ustalenia'}\n💰 Koszt: ${formData.cost} zł\n\n${formData.description || 'Szczegóły wkrótce!'}\n\nZapisz się przez aplikację Unicorns!`
                          })
                        }}
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-all"
                      >
                        📄 Załaduj szablon
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ustawienia płatności - tylko dla wydarzeń płatnych */}
              {formData.cost > 0 && (
                <div className="border-t-2 border-green-200 pt-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-4">💳 Ustawienia płatności</h3>

                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="requires_immediate_payment"
                    checked={formData.requires_immediate_payment || false}
                    onChange={(e) => setFormData({ ...formData, requires_immediate_payment: e.target.checked })}
                    className="h-5 w-5 text-green-600 rounded"
                  />
                  <label htmlFor="requires_immediate_payment" className="text-sm font-semibold text-gray-700">
                    ⚡ Wymagaj natychmiastowej płatności przy zapisie
                  </label>
                </div>

                {formData.requires_immediate_payment ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    <p className="font-semibold mb-2">✅ Płatność natychmiastowa aktywna</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Użytkownik MUSI zapłacić w momencie zapisu</li>
                      <li>Brak opcji "Opłać później"</li>
                      <li>Idealne dla zajęć z ograniczoną liczbą miejsc</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      <p className="font-semibold mb-2">⏰ Płatność z terminem</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Użytkownik może wybrać "Opłać teraz" lub "Opłać później"</li>
                        <li>System automatycznie wyśle przypomnienia push</li>
                        <li>Po przekroczeniu terminu status zmieni się na "Przeterminowane"</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Termin płatności (godziny przed zajęciami) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={formData.payment_deadline_hours}
                        onChange={(e) => setFormData({ ...formData, payment_deadline_hours: parseInt(e.target.value) || 48 })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Np. 24 = użytkownik musi zapłacić minimum 24h przed zajęciami
                        <br />
                        Domyślnie: 48 godzin
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                      <p className="font-semibold">📢 Automatyczne przypomnienia:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Jeśli termin &gt; 24h: przypomnienie co 24h</li>
                        <li>Jeśli termin ≤ 24h: przypomnienie co 6h</li>
                      </ul>
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Wydarzenia bezpłatne - opcja "Nie wymaga zapisu" */}
              {formData.cost === 0 && (
                <div className="border-t-2 border-blue-200 pt-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-4">🎟️ Wydarzenie bezpłatne</h3>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="requires_registration"
                      checked={formData.requires_registration}
                      onChange={(e) => setFormData({ ...formData, requires_registration: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="requires_registration" className="text-sm font-semibold text-gray-700">
                      📝 Wymaga zapisu (rejestracji)
                    </label>
                  </div>

                  {formData.requires_registration ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      <p className="font-semibold mb-2">✅ Rejestracja wymagana</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Użytkownicy muszą się zapisać</li>
                        <li>Widoczny przycisk "Zapisz się"</li>
                        <li>Można anulować zapis (wg. ustawionego terminu)</li>
                        <li>Liczba miejsc jest kontrolowana</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      <p className="font-semibold mb-2">🎉 Wstęp wolny - bez zapisu</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Wydarzenie widoczne na liście</li>
                        <li>BRAK przycisku "Zapisz się"</li>
                        <li>Info: "Wstęp wolny, nie wymaga rejestracji"</li>
                        <li>Idealne dla: dzień otwarty, pokazy, koncerty</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
                </div>
              </>
            )}

            {/* ETAP 3: Zajęcia cykliczne - tylko dla recurring w etapie 3 */}
              {!editingId && creationStep === 3 && activityMode === 'recurring' && (
                <div className="border-t-2 border-purple-200 pt-6">
                  <h3 className="text-lg font-bold text-purple-600 mb-4">
                    🔄 Reguła powtarzania
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Częstotliwość *
                      </label>
                      <select
                        value={formData.recurrence_pattern || 'weekly'}
                        onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      >
                        <option value="weekly">Co tydzień</option>
                        <option value="monthly">Co miesiąc</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dzień tygodnia *
                        </label>
                        <select
                          value={formData.recurrence_day_of_week || ''}
                          onChange={(e) => setFormData({ ...formData, recurrence_day_of_week: e.target.value })}
                          required={formData.is_recurring && activityMode === 'recurring'}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="">Wybierz dzień...</option>
                          <option value="Monday">Poniedziałek</option>
                          <option value="Tuesday">Wtorek</option>
                          <option value="Wednesday">Środa</option>
                          <option value="Thursday">Czwartek</option>
                          <option value="Friday">Piątek</option>
                          <option value="Saturday">Sobota</option>
                          <option value="Sunday">Niedziela</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Godzina *
                        </label>
                        <input
                          type="time"
                          value={formData.recurrence_time || ''}
                          onChange={(e) => setFormData({ ...formData, recurrence_time: e.target.value })}
                          required={formData.is_recurring && activityMode === 'recurring'}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Czas trwania (minuty) *
                        </label>
                        <input
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                          required
                          min="15"
                          step="15"
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Anulowanie (godz. przed) *
                        </label>
                        <input
                          type="number"
                          value={formData.cancellation_hours}
                          onChange={(e) => setFormData({ ...formData, cancellation_hours: parseInt(e.target.value) })}
                          required
                          min="0"
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-t-2 border-purple-200 pt-4 mt-4">
                      <h4 className="text-md font-bold text-purple-600 mb-3">⏰ Okna rejestracji (domyślne dla wszystkich instancji)</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Określ domyślne okna zapisów dla wszystkich wydarzeń wygenerowanych z tego szablonu.
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Zapisy otwarte (godzin przed)
                          </label>
                          <input
                            type="number"
                            value={formData.registration_opens_at || ''}
                            onChange={(e) => setFormData({ ...formData, registration_opens_at: e.target.value })}
                            placeholder="np. 168 (tydzień)"
                            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Pozostaw puste aby zapisy były otwarte od razu
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Zapisy zamknięte (godzin przed)
                          </label>
                          <input
                            type="number"
                            value={formData.registration_closes_at || ''}
                            onChange={(e) => setFormData({ ...formData, registration_closes_at: e.target.value })}
                            placeholder="np. 2"
                            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Pozostaw puste aby zapisy były otwarte do początku zajęć
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="infinite_recurrence"
                        checked={!formData.recurrence_end_date || formData.recurrence_end_date === ''}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, recurrence_end_date: '' })
                          } else {
                            // Ustaw domyślną datę końcową za 3 miesiące
                            const threeMonthsLater = new Date()
                            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
                            setFormData({
                              ...formData,
                              recurrence_end_date: threeMonthsLater.toISOString().slice(0, 16)
                            })
                          }
                        }}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor="infinite_recurrence" className="text-sm font-semibold text-gray-700">
                        ♾️ Nieskończone powtarzanie (bez daty końcowej)
                      </label>
                    </div>

                    {formData.recurrence_end_date && formData.recurrence_end_date !== '' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Powtarzaj do
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.recurrence_end_date || ''}
                          onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {(formData.recurrence_day_of_week || formData.date_time) && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ℹ️ Zostanie utworzonych <strong>{calculateInstanceCount()}</strong> zajęć.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Szablon będzie bez konkretnej daty - instancje będą generowane automatycznie.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ETAP 3: Powiadomienia - dla single/special */}
              {!editingId && creationStep === 3 && (activityMode === 'single' || activityMode === 'special') && (
                <div className="border-t-2 border-purple-200 pt-6">
                  <h3 className="text-lg font-bold text-purple-600 mb-4">
                    🔔 Powiadomienia
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="send_notification"
                        checked={formData.send_notification}
                        onChange={(e) => setFormData({ ...formData, send_notification: e.target.checked })}
                        className="h-5 w-5 text-purple-600 rounded"
                      />
                      <label htmlFor="send_notification" className="text-sm font-semibold text-gray-700">
                        📱 Wyślij powiadomienia push
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="send_email_notification"
                        checked={formData.send_email_notification}
                        onChange={(e) => setFormData({ ...formData, send_email_notification: e.target.checked })}
                        className="h-5 w-5 text-purple-600 rounded"
                      />
                      <label htmlFor="send_email_notification" className="text-sm font-semibold text-gray-700">
                        📧 Wyślij powiadomienia email
                      </label>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                      ℹ️ Powiadomienia zostaną wysłane do użytkowników z włączonymi preferencjami powiadomień.
                    </div>
                  </div>
                </div>
              )}

              {/* Stare checkbox dla recurring - TYLKO przy edycji */}
              {editingId && (
                <div className="border-t-2 border-purple-200 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      checked={formData.is_recurring || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_recurring: e.target.checked,
                        recurrence_pattern: e.target.checked ? 'weekly' : 'none'
                      })}
                      className="h-5 w-5 text-purple-600 rounded"
                      disabled={formData.is_special_event}
                    />
                    <label htmlFor="is_recurring" className={`text-sm font-semibold ${formData.is_special_event ? 'text-gray-400' : 'text-gray-700'}`}>
                      🔄 Zajęcia cykliczne (powtarzające się)
                      {formData.is_special_event && <span className="text-xs ml-2">(wyłączone dla wydarzeń specjalnych)</span>}
                    </label>
                  </div>

                  {formData.is_recurring && (
                    <div className="space-y-4 pl-8 border-l-4 border-purple-300">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Częstotliwość *
                        </label>
                        <select
                          value={formData.recurrence_pattern || 'weekly'}
                          onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="weekly">Co tydzień</option>
                          <option value="monthly">Co miesiąc</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Powtarzaj do *
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.recurrence_end_date || ''}
                          onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                          required={formData.is_recurring}
                          className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      {formData.date_time && formData.recurrence_end_date && (
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            ℹ️ Zostanie utworzonych <strong>{calculateInstanceCount()}</strong> zajęć.
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Pierwsze zajęcia będą rodzicielskie (szablon), pozostałe zostaną wygenerowane automatycznie.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Status - tylko przy edycji */}
              {editingId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="scheduled">Zaplanowane</option>
                    <option value="completed">Zakończone</option>
                    <option value="cancelled">Anulowane</option>
                  </select>
                </div>
              )}

            {/* Przyciski nawigacji */}
            <div className="flex gap-2">
              {/* Przycisk Wstecz - tylko w etapie 2 dla nowych */}
              {!editingId && creationStep === 2 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                >
                  ← Wstecz
                </button>
              )}

              {/* Przycisk Dalej - tylko w etapie 2 dla nowych */}
              {!editingId && creationStep === 2 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Dalej →
                </button>
              )}

              {/* Przycisk Submit - etap 3 lub edycja */}
              {(editingId || creationStep === 3) && (
                <>
                  {!editingId && creationStep === 3 && (
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                    >
                      ← Wstecz
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    {editingId ? 'Zapisz zmiany' : activityMode === 'recurring' ? 'Generuj serię i zapisz' : 'Utwórz zajęcia'}
                  </button>
                </>
              )}

              {/* Przycisk Anuluj - zawsze dostępny przy edycji */}
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                >
                  Anuluj
                </button>
              )}
            </div>
          </form>
          )}
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-purple-600">
          {(() => {
            if (statusFilter.length === 3) return `Wszystkie zajęcia (${activities.length})`
            if (statusFilter.includes('scheduled') && statusFilter.length === 1) return `Aktywne zajęcia (${activities.length})`
            if (statusFilter.includes('completed') && statusFilter.length === 1) return `Minione zajęcia (${activities.length})`
            if (statusFilter.includes('cancelled') && statusFilter.length === 1) return `Anulowane zajęcia (${activities.length})`
            return `Zajęcia (${activities.length})`
          })()}
        </h2>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-gray-600">Brak zajęć w systemie</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-purple-600">{activity.name}</h3>

                {activity.is_recurring && activity.parent_activity_id === null && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    🔄 Szablon
                  </span>
                )}

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                  activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {activity.status === 'scheduled' ? 'Zaplanowane' :
                   activity.status === 'completed' ? 'Zakończone' :
                   'Anulowane'}
                </span>
              </div>

              <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>

              <div className="grid md:grid-cols-3 gap-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    {activity.date_time
                      ? formatDate(activity.date_time)
                      : activity.recurrence_day_of_week
                        ? `${activity.recurrence_day_of_week} o ${activity.recurrence_time}`
                        : 'Brak daty'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{formatDuration(activity.duration_minutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>Max {activity.max_participants} osób</span>
                </div>
                {activity.is_online ? (
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <a
                      href={activity.meeting_link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      Spotkanie online
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{activity.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 font-bold text-purple-600">
                  <span>💰</span>
                  <span>{activity.cost.toFixed(2)} zł</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>⚠️</span>
                  <span>Anulowanie: {activity.cancellation_hours}h</span>
                </div>
              </div>

              {/* Przyciski na dole */}
              <div className="border-t-2 border-purple-100 pt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/admin/activities/${activity.id}/participants`)}
                  className="flex-1 min-w-[140px] px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all text-sm font-semibold"
                >
                  👥 Lista ({activity.registered_count || 0})
                </button>
                <button
                  onClick={() => handleEdit(activity)}
                  className="flex-1 min-w-[140px] px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-semibold"
                >
                  ✏️ Edytuj
                </button>
                {activity.status === 'scheduled' && (
                  <button
                    onClick={() => handleCancel(activity.id)}
                    className="flex-1 min-w-[140px] px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    ✗ Anuluj
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal powiadomień o edycji */}
      {showEditNotificationModal && (
        <EditEventNotificationModal
          participantCount={participantCount}
          onConfirm={handleConfirmNotifications}
          onSkip={handleSkipNotifications}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  )
}

export default AdminActivitiesPage
