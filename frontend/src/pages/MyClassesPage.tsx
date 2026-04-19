import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'

interface Registration {
  id: string
  activity_id: string
  status: string
  can_cancel_until: string
  registered_at: string
  payment_processed: boolean
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

  useEffect(() => {
    fetchMyRegistrations()
  }, [])

  const fetchMyRegistrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          activity_id,
          status,
          can_cancel_until,
          registered_at,
          payment_processed,
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
        .in('status', ['registered', 'attended', 'cancelled'])
        .order('registered_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const transformed = data?.map(reg => ({
        ...reg,
        activity: Array.isArray(reg.activities) ? reg.activities[0] : reg.activities
      })) || []

      setRegistrations(transformed as any)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = async (registrationId: string, cost: number) => {
    alert('💳 Moduł płatności BLIK jest w wersji testowej i zostanie wkrótce aktywowany.\n\n' +
          'Po integracji z systemem płatności będziesz mógł opłacić zajęcia bezpośrednio tutaj.\n\n' +
          `Kwota do zapłaty: ${cost.toFixed(2)} zł`)

    // TODO: Po integracji BLIK:
    // 1. Pokaż BLIK modal z kodem
    // 2. Po udanej płatności wywołaj Edge Function process-payment
    // 3. Zaktualizuj payment_status na 'paid' i ustaw paid_at
    // 4. Odśwież listę rejestracji
  }

  const handleCancelClick = (registrationId: string, canCancelUntil: string, paymentProcessed: boolean) => {
    // Check if cancellation is allowed
    const now = new Date()
    const deadline = new Date(canCancelUntil)

    if (now > deadline) {
      alert('Termin anulowania upłynął!')
      return
    }

    if (paymentProcessed) {
      alert('Nie możesz anulować - zajęcia zostały już opłacone (oznaczono obecność).')
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

  const canCancel = (canCancelUntil: string, status: string, paymentProcessed: boolean) => {
    if (status !== 'registered') return false
    if (paymentProcessed) return false
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">🎯 Moje zajęcia</h1>
          <p className="text-gray-600">Zarządzaj swoimi rezerwacjami</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
        >
          ← Strefa użytkownika
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🦄</span>
          <p className="text-xl text-gray-600 mb-4">Nie masz jeszcze żadnych rezerwacji</p>
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
            const canCancelNow = canCancel(reg.can_cancel_until, reg.status, reg.payment_processed)
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
                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-bold text-purple-600">{reg.activity.name}</h3>
                          <div className="flex flex-wrap gap-2">
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

                            {/* Status płatności - tylko jeśli NIE jest payment_processed */}
                            {!reg.payment_processed && reg.payment_status === 'paid' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ✅ Opłacone
                              </span>
                            )}
                            {!reg.payment_processed && reg.payment_status === 'pending' && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ⏳ Do zapłaty
                              </span>
                            )}
                            {!reg.payment_processed && reg.payment_status === 'overdue' && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ❗ Przeterminowane
                              </span>
                            )}

                            {/* Payment processed badge - tylko jeśli attended */}
                            {reg.payment_processed && reg.status === 'attended' && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                ✓ Opłacone
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
                        <span>{reg.activity.duration_minutes} minut</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{reg.activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-purple-600">
                        <span>💰</span>
                        <span>{reg.activity.cost.toFixed(2)} zł</span>
                      </div>
                    </div>

                    {reg.status === 'registered' && !reg.payment_processed && (
                      <div className="mt-3 text-xs text-gray-500">
                        <span>⚠️ Możesz anulować do: {formatDate(reg.can_cancel_until)}</span>
                      </div>
                    )}

                    {/* Payment Section */}
                    {reg.status === 'registered' && reg.payment_status !== 'paid' && reg.payment_due_date && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800 mb-2">
                          ⏰ Termin płatności: {formatDate(reg.payment_due_date)}
                        </p>
                        <button
                          onClick={() => handlePayNow(reg.id, reg.activity.cost)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          💳 Opłać teraz
                        </button>
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

                      {canCancelNow && (
                        <button
                          onClick={() => handleCancelClick(reg.id, reg.can_cancel_until, reg.payment_processed)}
                          disabled={isProcessing}
                          className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anuluj rezerwację
                        </button>
                      )}
                    </div>
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
                      {/* Smutny jednorożec SVG */}
                      <div className="mb-4 animate-bounce">
                        <svg className="w-24 h-24 text-purple-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Głowa */}
                          <circle cx="50" cy="55" r="30" fill="currentColor" opacity="0.8"/>
                          {/* Róg */}
                          <path d="M50 25 L45 40 L50 38 L55 40 Z" fill="#FFD700" opacity="0.9"/>
                          {/* Oczy - smutne */}
                          <ellipse cx="42" cy="50" rx="3" ry="5" fill="#4A5568" transform="rotate(-20 42 50)"/>
                          <ellipse cx="58" cy="50" rx="3" ry="5" fill="#4A5568" transform="rotate(20 58 50)"/>
                          {/* Łzy */}
                          <circle cx="42" cy="58" r="2" fill="#60A5FA" opacity="0.6"/>
                          <circle cx="58" cy="58" r="2" fill="#60A5FA" opacity="0.6"/>
                          {/* Smutny uśmiech */}
                          <path d="M 40 65 Q 50 60 60 65" stroke="#4A5568" strokeWidth="2" fill="none"/>
                          {/* Grzywa */}
                          <path d="M 35 35 Q 30 40 32 45" stroke="#E879F9" strokeWidth="3" fill="none"/>
                          <path d="M 40 30 Q 35 35 37 40" stroke="#C084FC" strokeWidth="3" fill="none"/>
                          <path d="M 45 28 Q 40 33 42 38" stroke="#A855F7" strokeWidth="3" fill="none"/>
                        </svg>
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
    </div>
  )
}

export default MyClassesPage
