import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { getActivityImage } from '../data/activityImages'
import PaymentChoiceModal from '../components/PaymentChoiceModal'

interface Activity {
  id: string
  name: string
  description: string
  date_time: string
  duration_minutes: number
  duration_description?: string | null
  max_participants: number | null
  cost: number
  location: string
  trainer_id: string
  status: string
  cancellation_hours: number
  registration_opens_at?: string | null
  registration_closes_at?: string | null
  registered_count?: number
  image_url?: string | null
  whatsapp_group_url?: string | null
  requires_immediate_payment?: boolean
  payment_deadline_hours?: number
  requires_registration?: boolean
  activity_types?: {
    whatsapp_group_url?: string | null
  }
}

const ActivitiesPage = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [specialEvents, setSpecialEvents] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set())
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<{
    activityId: string
    activityName: string
    cost: number
    cancellationHours: number
    requiresImmediate: boolean
  } | null>(null)

  useEffect(() => {
    fetchActivities()
    fetchSpecialEvents()
    fetchUserRegistrations()
    fetchParticipantCounts()
  }, [])

  // Helper: Pobierz link WhatsApp z fallback do activity_type
  const getWhatsAppLink = (activity: Activity): string | null => {
    // Priorytet 1: Link bezpośrednio z aktywności
    if (activity.whatsapp_group_url) {
      return activity.whatsapp_group_url
    }
    // Priorytet 2: Link z typu aktywności (np. wszystkie "Taniec" mają wspólną grupę)
    if (activity.activity_types?.whatsapp_group_url) {
      return activity.activity_types.whatsapp_group_url
    }
    // Brak linku
    return null
  }

  const fetchActivities = async () => {
    try {
      // Filtruj regularne zajęcia do najbliższych 7 dni
      const now = new Date()
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types (
            whatsapp_group_url
          )
        `)
        .eq('status', 'scheduled')
        .eq('is_special_event', false)
        .gte('date_time', now.toISOString())
        .lte('date_time', sevenDaysLater.toISOString())
        .order('date_time', { ascending: true })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialEvents = async () => {
    try {
      // Wydarzenia specjalne - 60 dni do przodu
      const now = new Date()
      const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types (
            whatsapp_group_url
          )
        `)
        .eq('status', 'scheduled')
        .eq('is_special_event', true)
        .gte('date_time', now.toISOString())
        .lte('date_time', sixtyDaysLater.toISOString())
        .order('date_time', { ascending: true })

      if (error) throw error
      setSpecialEvents(data || [])
    } catch (error) {
      console.error('Error fetching special events:', error)
    }
  }

  const fetchUserRegistrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('registrations')
        .select('activity_id')
        .eq('user_id', user.id)
        .in('status', ['registered', 'attended'])  // Include attended status

      if (error) throw error

      const registeredIds = new Set(data?.map(r => r.activity_id) || [])
      setUserRegistrations(registeredIds)
    } catch (error) {
      console.error('Error fetching user registrations:', error)
    }
  }

  const fetchParticipantCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('activity_id')
        .in('status', ['registered', 'attended'])

      if (error) throw error

      // Policz rejestracje dla każdej aktywności
      const counts: Record<string, number> = {}
      data?.forEach(reg => {
        counts[reg.activity_id] = (counts[reg.activity_id] || 0) + 1
      })

      setParticipantCounts(counts)
    } catch (error) {
      console.error('Error fetching participant counts:', error)
    }
  }

  const handleRegister = async (activityId: string, cost: number, cancellationHours: number) => {
    setRegistering(activityId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setShowLoginModal(true)
        setRegistering(null)
        return
      }

      // Get activity details to calculate cancellation deadline
      const allActivities = [...activities, ...specialEvents]
      const activity = allActivities.find(a => a.id === activityId)
      if (!activity) return

      // Jeśli zajęcia wymagają płatności (cost > 0), pokaż modal wyboru
      if (cost > 0) {
        setPendingRegistration({
          activityId,
          activityName: activity.name,
          cost,
          cancellationHours,
          requiresImmediate: activity.requires_immediate_payment || false
        })
        setShowPaymentModal(true)
        setRegistering(null)
        return
      }

      // Bezpłatne zajęcia - zapisz od razu
      await performRegistration(activityId, cost, cancellationHours, 'paid')
    } catch (error) {
      console.error('Error starting registration:', error)
      alert('Wystąpił błąd podczas zapisu')
    } finally {
      setRegistering(null)
    }
  }

  const performRegistration = async (
    activityId: string,
    cost: number,
    cancellationHours: number,
    paymentStatus: 'paid' | 'pending'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const allActivities = [...activities, ...specialEvents]
      const activity = allActivities.find(a => a.id === activityId)
      if (!activity) return

      const activityDate = new Date(activity.date_time)
      const cancellationDeadline = new Date(activityDate.getTime() - (cancellationHours * 60 * 60 * 1000))

      // Calculate payment_due_date
      let paymentDueDate: string | null = null
      if (paymentStatus === 'pending' && activity.payment_deadline_hours) {
        const dueDate = new Date(activityDate.getTime() - (activity.payment_deadline_hours * 60 * 60 * 1000))
        paymentDueDate = dueDate.toISOString()
      }

      // Check if user already has a registration (including cancelled ones)
      const { data: existingReg, error: checkError } = await supabase
        .from('registrations')
        .select('id, status')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingReg) {
        if (existingReg.status === 'registered' || existingReg.status === 'attended') {
          alert('Już jesteś zapisany na te zajęcia!')
          return
        }

        // Reaktywuj anulowany zapis
        if (existingReg.status === 'cancelled' || existingReg.status === 'no_show') {
          const { error: updateError } = await supabase
            .from('registrations')
            .update({
              status: 'registered',
              can_cancel_until: cancellationDeadline.toISOString(),
              payment_processed: paymentStatus === 'paid',
              payment_status: paymentStatus,
              payment_due_date: paymentDueDate,
              paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
              cancelled_at: null
            })
            .eq('id', existingReg.id)

          if (updateError) throw updateError
        }
      } else {
        // Create new registration
        const { error: insertError } = await supabase
          .from('registrations')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            status: 'registered',
            can_cancel_until: cancellationDeadline.toISOString(),
            payment_processed: paymentStatus === 'paid',
            payment_status: paymentStatus,
            payment_due_date: paymentDueDate,
            paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null
          })

        if (insertError) throw insertError
      }

      // Różne komunikaty w zależności od typu wydarzenia i kosztu
      const isSpecialEvent = specialEvents.some(e => e.id === activityId)

      // Buduj komunikat
      let message = ''
      if (cost > 0) {
        if (isSpecialEvent) {
          message = `✅ Zapisano na wydarzenie!\n\nKoszt ${cost.toFixed(2)} zł zostanie pobrany po uczestnictwie. Masz 40 dni na uzupełnienie salda.`
        } else {
          message = `✅ Zapisano na zajęcia!\n\nKoszt ${cost.toFixed(2)} zł zostanie pobrany po oznaczeniu obecności przez trenera. Masz 40 dni na uzupełnienie salda.`
        }
      } else {
        if (isSpecialEvent) {
          message = '✅ Zapisano na wydarzenie!\n\nUdział jest bezpłatny.'
        } else {
          message = '✅ Zapisano na zajęcia!\n\nUdział jest bezpłatny.'
        }
      }

      // Dodaj info o WhatsApp jeśli istnieje (z fallbackiem do activity_type)
      const whatsappLink = getWhatsAppLink(activity)
      if (whatsappLink) {
        message += '\n\n💬 Dołącz do grupy WhatsApp! Poznaj innych uczestników, zadawaj pytania i bądź na bieżąco.'
      }

      alert(message)

      // Refresh registrations and participant counts
      await fetchUserRegistrations()
      await fetchParticipantCounts()
    } catch (error) {
      console.error('Error registering:', error)
      alert('Wystąpił błąd podczas zapisu')
    } finally {
      setRegistering(null)
    }
  }

  const handlePayNow = async () => {
    if (!pendingRegistration) return

    setShowPaymentModal(false)
    setRegistering(pendingRegistration.activityId)

    // Symulacja płatności BLIK (na razie disabled)
    alert('💳 Moduł płatności BLIK jest w wersji testowej.\n\nW pełnej wersji aplikacji tutaj pojawi się formularz płatności.\n\nTeraz zapiszemy Cię z statusem "opłacone".')

    await performRegistration(
      pendingRegistration.activityId,
      pendingRegistration.cost,
      pendingRegistration.cancellationHours,
      'paid'
    )

    setPendingRegistration(null)
  }

  const handlePayLater = async () => {
    if (!pendingRegistration) return

    setShowPaymentModal(false)
    setRegistering(pendingRegistration.activityId)

    await performRegistration(
      pendingRegistration.activityId,
      pendingRegistration.cost,
      pendingRegistration.cancellationHours,
      'pending'
    )

    setPendingRegistration(null)
  }

  const handleCancelPayment = () => {
    setShowPaymentModal(false)
    setPendingRegistration(null)
    setRegistering(null)
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

  const formatTimeUntil = (targetDate: Date) => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 1440) {
      // >= 24h = pokaż dni
      const days = Math.floor(minutes / 1440)
      const remainingHours = Math.floor((minutes % 1440) / 60)
      if (remainingHours > 0) {
        return `${days} ${days === 1 ? 'dzień' : 'dni'} ${remainingHours}h`
      }
      return `${days} ${days === 1 ? 'dzień' : 'dni'}`
    } else if (minutes >= 60) {
      // >= 1h = pokaż godziny
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}min`
      }
      return `${hours}h`
    } else {
      // < 1h = pokaż minuty
      return `${minutes} min`
    }
  }

  const checkRegistrationWindow = (activity: Activity) => {
    const now = new Date()
    const opensAt = activity.registration_opens_at ? new Date(activity.registration_opens_at) : null
    const closesAt = activity.registration_closes_at ? new Date(activity.registration_closes_at) : null

    const isBeforeOpen = opensAt && now < opensAt
    const isAfterClose = closesAt && now > closesAt
    const isOpen = !isBeforeOpen && !isAfterClose

    return { isOpen, isBeforeOpen, isAfterClose, opensAt, closesAt }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-white to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦄</div>
          <p className="text-purple-600">Ładowanie zajęć...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">📅 Harmonogram zajęć i wydarzeń</h1>
          <p className="text-gray-600">Wybierz zajęcia i zapisz się!</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Powrót
        </button>
      </div>

      {/* SEKCJA 1: Wydarzenia specjalne */}
      {specialEvents.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-yellow-600">🏆 Nadchodzące wydarzenia specjalne</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-semibold">
              Zawody • Spływy • Wyjazdy
            </span>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>⭐ Wydarzenia specjalne:</strong> Jednorazowe wydarzenia wymagające wcześniejszej rejestracji. Zapisy otwarte nawet 30-60 dni przed wydarzeniem!
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {specialEvents.map((activity) => {
              const isRegistered = userRegistrations.has(activity.id)
              const isProcessing = registering === activity.id
              const { isOpen, isBeforeOpen, isAfterClose, opensAt } = checkRegistrationWindow(activity)
              const registered = participantCounts[activity.id] || 0
              const isFull = activity.max_participants !== null && registered >= activity.max_participants
              const hasLimit = activity.max_participants !== null && activity.requires_registration !== false

              return (
                <div
                  key={activity.id}
                  className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-xl border-4 border-yellow-400 overflow-hidden hover:shadow-2xl transition-all ${!isOpen && !isRegistered ? 'opacity-60' : ''}`}
                >
                  {/* Obrazek nagłówkowy */}
                  <div className="relative h-40 sm:h-48 lg:h-56 w-full overflow-hidden">
                    <img
                      src={getActivityImage(activity.name, activity.image_url)}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Badge "Wydarzenie specjalne" */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                        🏆 WYDARZENIE SPECJALNE
                      </span>
                    </div>

                    {/* Tytuł na obrazku */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{activity.name}</h3>
                    </div>
                  </div>

                  {/* Zawartość karty */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span>📅</span>
                        <span>{formatDate(activity.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>⏱️</span>
                        <span>{activity.duration_description || formatDuration(activity.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>📍</span>
                        <span>{activity.location}</span>
                      </div>
                      {/* Dla wydarzeń bezpłatnych pokaż tylko "Wstęp wolny" */}
                      {activity.cost === 0 ? (
                        <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                          <span>🎉</span>
                          <span>Wstęp wolny</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <span>👥</span>
                            <span>
                              {hasLimit ? (() => {
                                const registered = participantCounts[activity.id] || 0
                                const available = activity.max_participants! - registered
                                const isFull = available <= 0
                                const isAlmostFull = available <= 3 && available > 0

                                return (
                                  <span className={isFull ? 'text-red-600 font-bold' : isAlmostFull ? 'text-orange-600 font-semibold' : ''}>
                                    {registered}/{activity.max_participants} zapisanych
                                    {isFull ? ' - PEŁNE' : ` (${available} ${available === 1 ? 'wolne miejsce' : 'wolnych miejsc'})`}
                                  </span>
                                )
                              })() : (
                                <span className="text-green-600 font-semibold">♾️ Nielimitowane miejsca</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
                            <span>💰</span>
                            <span>{activity.cost.toFixed(2)} zł</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>⚠️</span>
                        <span>Anulowanie: {activity.cancellation_hours}h przed zajęciami</span>
                      </div>
                    </div>

                    {/* Status okna rejestracji */}
                    {isBeforeOpen && opensAt && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <strong>⏰ Zapisy otwarte za:</strong> {formatTimeUntil(opensAt)}
                      </div>
                    )}

                    {isAfterClose && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        <strong>🔒 Zapisy zamknięte</strong>
                      </div>
                    )}

                    {/* Sprawdź czy wydarzenie wymaga rejestracji */}
                    {activity.requires_registration === false ? (
                      <div className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold py-4 px-6 rounded-lg text-center shadow-lg">
                        <div className="text-xl mb-1">🎉 Wstęp wolny</div>
                        <div className="text-sm opacity-90">Nie wymaga rejestracji - wpadaj!</div>
                      </div>
                    ) : (
                      <>
                        {isFull && !isRegistered && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            <strong>🚫 Brak wolnych miejsc</strong>
                          </div>
                        )}

                        {isRegistered ? (
                          <div className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg text-center">
                            ✓ Zapisany/a
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(activity.id, activity.cost, activity.cancellation_hours)}
                            disabled={isProcessing || !isOpen || isFull}
                            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? 'Zapisywanie...' :
                             isFull ? 'Brak miejsc' :
                             isBeforeOpen ? `Zapisy otwarte za ${opensAt && formatTimeUntil(opensAt)}` :
                             isAfterClose ? 'Zapisy zamknięte' :
                             'Zapisz się'}
                          </button>
                        )}
                      </>
                    )}

                    {/* WhatsApp Group Link z fallbackiem */}
                    {(() => {
                      const whatsappLink = getWhatsAppLink(activity)
                      return whatsappLink ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          <img src="/whatsapp-icon.svg" alt="" className="h-5 w-5" />
                          Dołącz do grupy WhatsApp
                        </a>
                      ) : null
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SEKCJA 2: Regularne zajęcia */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-purple-600">📅 Nadchodzące zajęcia</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-semibold">
            Najbliższe 7 dni
          </span>
        </div>

        {/* Info banner o filtrowaniu */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>ℹ️ Informacja:</strong> Wyświetlamy regularne zajęcia sportowe i kulturalne z najbliższych 7 dni. Więcej zajęć pojawi się automatycznie w kolejnych tygodniach.
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🦄</span>
            <p className="text-xl text-gray-600">Brak nadchodzących zajęć w najbliższych 7 dniach</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activities.map((activity) => {
            const isRegistered = userRegistrations.has(activity.id)
            const isProcessing = registering === activity.id
            const { isOpen, isBeforeOpen, isAfterClose, opensAt } = checkRegistrationWindow(activity)
            const registered = participantCounts[activity.id] || 0
            const isFull = activity.max_participants !== null && registered >= activity.max_participants
            const hasLimit = activity.max_participants !== null && activity.requires_registration !== false

            return (
              <div
                key={activity.id}
                className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-all ${!isOpen && !isRegistered ? 'opacity-60' : ''}`}
              >
                {/* Obrazek nagłówkowy */}
                <div className="relative h-40 sm:h-48 lg:h-56 w-full overflow-hidden">
                  <img
                    src={getActivityImage(activity.name, activity.image_url)}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Gradient overlay dla lepszej czytelności */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                  {/* Tytuł na obrazku */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">{activity.name}</h3>
                  </div>
                </div>

                {/* Zawartość karty */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>

                  <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>📅</span>
                    <span>{formatDate(activity.date_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>⏱️</span>
                    <span>{activity.duration_description || formatDuration(activity.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span>{activity.location}</span>
                  </div>
                  {/* Dla wydarzeń bezpłatnych pokaż tylko "Wstęp wolny" */}
                  {activity.cost === 0 ? (
                    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                      <span>🎉</span>
                      <span>Wstęp wolny</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <span>👥</span>
                        <span>
                          {hasLimit ? (() => {
                            const registered = participantCounts[activity.id] || 0
                            const available = activity.max_participants! - registered
                            const isFull = available <= 0
                            const isAlmostFull = available <= 3 && available > 0

                            return (
                              <span className={isFull ? 'text-red-600 font-bold' : isAlmostFull ? 'text-orange-600 font-semibold' : ''}>
                                {registered}/{activity.max_participants} zapisanych
                                {isFull ? ' - PEŁNE' : ` (${available} ${available === 1 ? 'wolne miejsce' : 'wolnych miejsc'})`}
                              </span>
                            )
                          })() : (
                            <span className="text-green-600 font-semibold">♾️ Nielimitowane miejsca</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
                        <span>💰</span>
                        <span>{activity.cost.toFixed(2)} zł</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>⚠️</span>
                    <span>Anulowanie: {activity.cancellation_hours}h przed zajęciami</span>
                  </div>
                </div>

                {/* Status okna rejestracji */}
                {isBeforeOpen && opensAt && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <strong>⏰ Zapisy otwarte za:</strong> {formatTimeUntil(opensAt)}
                  </div>
                )}

                {isAfterClose && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <strong>🔒 Zapisy zamknięte</strong>
                  </div>
                )}

                {/* Sprawdź czy wydarzenie wymaga rejestracji */}
                {activity.requires_registration === false ? (
                  <div className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold py-4 px-6 rounded-lg text-center shadow-lg">
                    <div className="text-xl mb-1">🎉 Wstęp wolny</div>
                    <div className="text-sm opacity-90">Nie wymaga rejestracji - wpadaj!</div>
                  </div>
                ) : (
                  <>
                    {isFull && !isRegistered && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        <strong>🚫 Brak wolnych miejsc</strong>
                      </div>
                    )}

                    {isRegistered ? (
                      <div className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg text-center">
                        ✓ Zapisany/a
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(activity.id, activity.cost, activity.cancellation_hours)}
                        disabled={isProcessing || !isOpen || isFull}
                        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Zapisywanie...' :
                         isFull ? 'Brak miejsc' :
                         isBeforeOpen ? `Zapisy otwarte za ${opensAt && formatTimeUntil(opensAt)}` :
                         isAfterClose ? 'Zapisy zamknięte' :
                         'Zapisz się'}
                      </button>
                    )}
                  </>
                )}

                  {/* WhatsApp Group Link z fallbackiem */}
                  {(() => {
                    const whatsappLink = getWhatsAppLink(activity)
                    return whatsappLink ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                      >
                        <img src="/whatsapp-icon.svg" alt="" className="h-5 w-5" />
                        Dołącz do grupy WhatsApp
                      </a>
                    ) : null
                  })()}
                </div>
              </div>
            )
          })}
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">Zaloguj się aby zapisać</h3>
              <p className="text-gray-600">
                Aby zapisać się na zajęcia, musisz się zalogować lub założyć konto.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Zaloguj się
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Anuluj
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Na stronie logowania znajdziesz link do rejestracji nowego konta
            </p>
          </div>
        </div>
      )}

      {/* Payment Choice Modal */}
      {showPaymentModal && pendingRegistration && (
        <PaymentChoiceModal
          activityName={pendingRegistration.activityName}
          activityCost={pendingRegistration.cost}
          requiresImmediate={pendingRegistration.requiresImmediate}
          onPayNow={handlePayNow}
          onPayLater={handlePayLater}
          onCancel={handleCancelPayment}
        />
      )}
    </div>
  )
}

export default ActivitiesPage
