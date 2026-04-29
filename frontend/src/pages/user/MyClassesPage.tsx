import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from '../../utils/formatDuration'

interface Registration {
  id: string
  activity_id: string
  status: string
  can_cancel_until: string
  registered_at: string
  payment_status: 'paid' | 'pending' | 'overdue'
  payment_due_date: string | null
  paid_at: string | null
  activity: {
    name: string
    description: string
    date_time: string
    duration_minutes: number
    cost: number
    location: string
    status: string
    whatsapp_group_url?: string | null
    is_online?: boolean
    meeting_link?: string | null
    activity_types?: {
      whatsapp_group_url?: string | null
    }
  }
}

const MyClassesPage = () => {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [flippedCard, setFlippedCard] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string[]>(['registered', 'attended']) // Domyślnie aktywne i uczestniczone
  const [paymentMethod, setPaymentMethod] = useState<'pbl' | 'blik'>('pbl')
  const [blikCode, setBlikCode] = useState('')
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [pendingPayment, setPendingPayment] = useState<{
    registrationId: string
    cost: number
    activityName: string
  } | null>(null)

  // Helper: Pobierz link WhatsApp z fallback do activity_type
  const getWhatsAppLink = (activity: Registration['activity']): string | null => {
    if (activity.whatsapp_group_url) {
      return activity.whatsapp_group_url
    }
    if (activity.activity_types?.whatsapp_group_url) {
      return activity.activity_types.whatsapp_group_url
    }
    return null
  }

  // Odświeżaj dane przy montowaniu komponentu lub zmianie filtra
  useEffect(() => {
    fetchMyRegistrations()
  }, [statusFilter])

  // Odświeżaj dane gdy użytkownik wraca na stronę (zmiana zakładki)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMyRegistrations()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Odświeżaj dane gdy użytkownik wraca do okna (focus)
  useEffect(() => {
    const handleFocus = () => {
      fetchMyRegistrations()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchMyRegistrations = async () => {
    try {
      const userResult = await getCurrentUser()
      if (userResult.error || !userResult.authUser) return
      const user = userResult.authUser
      if (!user) return

      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          activity_id,
          status,
          can_cancel_until,
          registered_at,
          payment_status,
          payment_due_date,
          paid_at,
          activities (
            name,
            description,
            date_time,
            duration_minutes,
            cost,
            location,
            status,
            whatsapp_group_url,
            activity_types (
              whatsapp_group_url
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', statusFilter) // Użyj aktywnego filtra
        .limit(100) // Bezpieczeństwo - max 100 rezerwacji

      if (error) throw error

      // Transform the data to match our interface
      const transformed = data?.map(reg => ({
        ...reg,
        activity: Array.isArray(reg.activities) ? reg.activities[0] : reg.activities
      })) || []

      // Sortuj chronologicznie po dacie wydarzenia (od najbliższych do najdalszych)
      const sorted = transformed.sort((a, b) => {
        const dateA = new Date(a.activity.date_time).getTime()
        const dateB = new Date(b.activity.date_time).getTime()
        return dateA - dateB
      })

      setRegistrations(sorted as any)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayButtonClick = (registrationId: string, cost: number, activityName: string) => {
    setPendingPayment({ registrationId, cost, activityName })
    setShowPaymentMethodModal(true)
  }

  const handleConfirmPayment = async () => {
    if (!pendingPayment) return

    setShowPaymentMethodModal(false)

    try {
      // Pobierz sesję użytkownika
      const sessionResult = await getCurrentSession()
      const session = sessionResult.session

      if (!session?.access_token) {
        throw new Error('Brak sesji użytkownika - zaloguj się ponownie')
      }

      // Inicjuj płatność przez Edge Function
      const paymentPayload: any = {
        registrationId: pendingPayment.registrationId,
        amount: pendingPayment.cost,
        description: `Opłata za ${pendingPayment.activityName}`,
        paymentMethod
      }

      // Dla BLIK dodaj kod
      if (paymentMethod === 'blik') {
        if (!blikCode || blikCode.length !== 6) {
          throw new Error('Wprowadź 6-cyfrowy kod BLIK')
        }
        paymentPayload.blikCode = blikCode
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(paymentPayload)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed')
      }

      // Przekieruj do Autopay
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error('No redirect URL received')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(`❌ Błąd płatności: ${error instanceof Error ? error.message : 'Nieznany błąd'}`)
    } finally {
      setPendingPayment(null)
    }
  }

  const handleCancelClick = (registrationId: string, canCancelUntil: string, paymentStatus: string) => {
    // Check if cancellation is allowed
    const now = new Date()
    const deadline = new Date(canCancelUntil)

    if (now > deadline) {
      alert('Termin anulowania upłynął!')
      return
    }

    if (paymentStatus === 'paid') {
      alert('Nie możesz anulować - zajęcia zostały już opłacone.')
      return
    }

    // Flip the card instead of showing confirm
    setFlippedCard(registrationId)
  }

  const handleConfirmCancel = async (registrationId: string) => {
    setCancelling(registrationId)
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (error) throw error

      // Show success and fade out
      await fetchMyRegistrations()
      setFlippedCard(null)
      alert('✅ Zajęcia zostały anulowane')
    } catch (error) {
      console.error('Error cancelling:', error)
      alert('Wystąpił błąd podczas anulowania')
    } finally {
      setCancelling(null)
    }
  }

  const handleCancelBack = () => {
    setFlippedCard(null)
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

  const canCancel = (canCancelUntil: string, status: string, paymentStatus: string) => {
    if (status !== 'registered') return false
    if (paymentStatus === 'paid') return false
    const now = new Date()
    const deadline = new Date(canCancelUntil)
    return now < deadline
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">🎯 Moje Rezerwacje</h1>
        <p className="text-gray-600">Zarządzaj swoimi rezerwacjami</p>
      </div>

      {/* Filtry statusów */}
      <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(['registered', 'attended'])}
            className={`px-4 py-2 rounded-lg transition-all ${
              statusFilter.includes('registered') && statusFilter.includes('attended') && statusFilter.length === 2
                ? 'bg-green-500 text-white font-semibold'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ✅ Aktywne
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
            onClick={() => setStatusFilter(['registered', 'attended', 'cancelled'])}
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

      {/* Nagłówek z licznikiem */}
      <h2 className="text-xl font-bold text-purple-600 mb-4">
        {(() => {
          if (statusFilter.length === 3) return `Wszystkie rezerwacje (${registrations.length})`
          if (statusFilter.includes('registered') && statusFilter.includes('attended') && statusFilter.length === 2) return `Aktywne rezerwacje (${registrations.length})`
          if (statusFilter.includes('cancelled') && statusFilter.length === 1) return `Anulowane rezerwacje (${registrations.length})`
          return `Rezerwacje (${registrations.length})`
        })()}
      </h2>

      {registrations.length === 0 ? (
        <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200">
          <span className="text-6xl mb-4 block">🦄</span>
          <p className="text-xl text-gray-600 mb-4">Brak rezerwacji w tym filtrze</p>
          <button
            onClick={() => navigate('/activities')}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Przeglądaj zajęcia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const isProcessing = cancelling === reg.id
            const canCancelNow = canCancel(reg.can_cancel_until, reg.status, reg.payment_status)
            const isFlipped = flippedCard === reg.id

            return (
              <div
                key={reg.id}
                className="perspective-1000"
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`relative transition-transform duration-700 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* FRONT SIDE */}
                  <div
                    className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all backface-hidden flex flex-col ${
                      reg.status === 'cancelled' ? 'opacity-50 grayscale' : ''
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Główna treść */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-xl font-bold text-purple-600 flex-1">{reg.activity.name}</h3>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {/* Status rejestracji */}
                            {reg.status === 'registered' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                Aktywna rezerwacja
                              </span>
                            )}
                            {reg.status === 'attended' && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                Uczestniczyłeś
                              </span>
                            )}
                            {reg.status === 'cancelled' && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                Anulowano
                              </span>
                            )}

                            {/* Status płatności */}
                            {reg.payment_status === 'paid' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ✅ Opłacone
                              </span>
                            )}
                            {reg.payment_status === 'pending' && reg.status === 'registered' && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ⏳ Do zapłaty
                              </span>
                            )}
                            {reg.payment_status === 'overdue' && reg.status === 'registered' && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ❗ Przeterminowane
                              </span>
                            )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm">{reg.activity.description}</p>

                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(reg.activity.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{formatDuration(reg.activity.duration_minutes)}</span>
                      </div>
                      {reg.activity.is_online ? (
                        <div className="flex items-center gap-2">
                          <span>🌐</span>
                          <a
                            href={reg.activity.meeting_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline font-semibold"
                          >
                            Spotkanie online
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{reg.activity.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 font-bold text-purple-600">
                        <span>💰</span>
                        <span>{reg.activity.cost.toFixed(2)} zł</span>
                      </div>
                    </div>

                      {reg.status === 'registered' && reg.payment_status !== 'paid' && (
                        <div className="mt-3 text-xs text-gray-500">
                          <span>⚠️ Możesz anulować do: {formatDate(reg.can_cancel_until)}</span>
                        </div>
                      )}

                      {/* Komunikat dla opłaconych rezerwacji (tylko dla płatnych zajęć) */}
                      {reg.status === 'registered' && reg.payment_status === 'paid' && reg.activity.cost > 0 && (
                        <div className="mt-3 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                          <p className="text-sm text-orange-900 font-semibold">
                            💳 Rezerwacja opłacona z góry
                          </p>
                          <p className="text-xs text-orange-800 mt-1">
                            Aby anulować, skontaktuj się z obsługą:
                            <a
                              href="mailto:unicorns.lodz@gmail.com"
                              className="underline ml-1 hover:text-orange-600"
                            >
                              unicorns.lodz@gmail.com
                            </a>
                          </p>
                        </div>
                      )}

                      {/* WhatsApp Group Link z fallbackiem */}
                      {(() => {
                        const whatsappLink = getWhatsAppLink(reg.activity)
                        return reg.status === 'registered' && whatsappLink ? (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            <img src="/whatsapp-icon.svg" alt="" className="h-4 w-4" />
                            Dołącz do grupy WhatsApp
                          </a>
                        ) : null
                      })()}
                    </div>

                    {/* Przyciski na dole - Payment i Cancel */}
                    {(reg.status === 'registered' && (reg.payment_status !== 'paid' && reg.payment_due_date || canCancelNow || (() => {
                      // Sprawdź czy spóźnione anulowanie
                      if (reg.status !== 'registered') return false
                      if (reg.payment_status === 'paid') return false
                      const now = new Date()
                      const deadline = new Date(reg.can_cancel_until)
                      return now >= deadline
                    })())) && (
                      <div className="border-t-2 border-purple-100 p-4 bg-purple-50/50">
                        <div className="flex flex-wrap gap-2">
                          {/* Payment button */}
                          {reg.payment_status !== 'paid' && reg.payment_due_date && (
                            <button
                              onClick={() => handlePayButtonClick(reg.id, reg.activity.cost, reg.activity.name)}
                              className="flex-1 min-w-[150px] px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                            >
                              💳 Opłać teraz ({reg.activity.cost.toFixed(2)} zł)
                            </button>
                          )}

                          {/* Cancel button LUB komunikat "Klamka zapadła" */}
                          {(() => {
                            // Sprawdź czy spóźnione anulowanie (po deadline, nie-opłacone)
                            const isTooLateToCancel = (() => {
                              if (reg.status !== 'registered') return false
                              if (reg.payment_status === 'paid' && reg.activity.cost > 0) return false // Tylko płatne zajęcia blokują anulowanie
                              const now = new Date()
                              const deadline = new Date(reg.can_cancel_until)
                              return now >= deadline
                            })()

                            // Przycisk anulowania - ukryj tylko dla PŁATNYCH opłaconych rezerwacji
                            const canShowCancelButton = canCancelNow && !(reg.payment_status === 'paid' && reg.activity.cost > 0)

                            if (canShowCancelButton) {
                              return (
                                <button
                                  onClick={() => handleCancelClick(reg.id, reg.can_cancel_until, reg.payment_status)}
                                  disabled={isProcessing}
                                  className="flex-1 min-w-[150px] px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  ❌ Anuluj rezerwację
                                </button>
                              )
                            } else if (isTooLateToCancel) {
                              return (
                                <div className="flex-1 min-w-[150px] px-4 py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold rounded-lg text-center cursor-not-allowed shadow-md">
                                  🔥 Klamka zapadła! Szykuj się na świetny czas. 💪
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>

                        {/* Payment deadline info */}
                        {reg.payment_status !== 'paid' && reg.payment_due_date && (
                          <p className="text-xs text-orange-700 mt-2">
                            ⏰ Termin płatności: {formatDate(reg.payment_due_date)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BACK SIDE - Potwierdzenie anulowania */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg border-2 border-red-300 p-6 backface-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      {/* Smutny jednorożec emoji/icon */}
                      <div className="mb-4 text-8xl animate-bounce">
                        🦄💔
                      </div>

                      <h3 className="text-2xl font-bold text-red-600 mb-3">
                        Ojej! 😢
                      </h3>
                      <p className="text-gray-700 mb-6 max-w-sm">
                        Na pewno chcesz anulować rezerwację<br/>
                        <strong className="text-purple-600">{reg.activity.name}</strong>?
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConfirmCancel(reg.id)}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isProcessing ? '⏳ Anulowanie...' : 'Tak, anuluj'}
                        </button>
                        <button
                          onClick={handleCancelBack}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg"
                        >
                          Nie, powrót
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentMethodModal && pendingPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">
                Wybierz metodę płatności
              </h3>
              <p className="text-gray-600 mb-1">{pendingPayment.activityName}</p>
              <p className="text-2xl font-bold text-purple-600">{pendingPayment.cost.toFixed(2)} zł</p>
            </div>

            {/* Wybór metody płatności */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Metoda płatności:
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setPaymentMethod('pbl')}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'pbl'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-xl">🏦</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">Szybki Przelew Online</div>
                    <div className="text-xs text-gray-600">(rekomendowane)</div>
                  </div>
                  {paymentMethod === 'pbl' && <div className="text-purple-500">✓</div>}
                </button>

                <button
                  onClick={() => setPaymentMethod('blik')}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'blik'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-xl">📱</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">BLIK</div>
                    <div className="text-xs text-gray-600">Szybka płatność kodem</div>
                  </div>
                  {paymentMethod === 'blik' && <div className="text-purple-500">✓</div>}
                </button>
              </div>
            </div>

            {/* Kod BLIK jeśli wybrano BLIK */}
            {paymentMethod === 'blik' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kod BLIK (6 cyfr):
                </label>
                <input
                  type="text"
                  value={blikCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setBlikCode(value)
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 Wygeneruj kod w aplikacji bankowej
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleConfirmPayment}
                disabled={paymentMethod === 'blik' && blikCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💳 Opłać teraz
              </button>

              <button
                onClick={() => {
                  setShowPaymentMethodModal(false)
                  setPendingPayment(null)
                }}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyClassesPage
