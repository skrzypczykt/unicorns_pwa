import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // 1. Utwórz klienta Supabase ze Service Role Key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 2. Weryfikuj autoryzację - pobierz token z headera
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Weryfikuj token używając getUser z jawnym tokenem
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // 2. Parsuj request body
    const {
      registrationId,
      amount,
      description,
      paymentMethod = 'default', // 'default', 'blik', 'pbl'
      blikCode // Dla BLIK (6 cyfr)
    } = await req.json()

    console.log('[Payment Initiate] Request:', { paymentMethod, blikCode: blikCode ? `${blikCode.length} chars` : 'none' })

    if (!registrationId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: registrationId, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Walidacja BLIK
    if (paymentMethod === 'blik') {
      if (!blikCode || !/^\d{6}$/.test(blikCode)) {
        return new Response(
          JSON.stringify({ error: 'Invalid BLIK code (must be 6 digits)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 3. Sprawdź czy registration istnieje i należy do użytkownika
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*, activities(name, cost)')
      .eq('id', registrationId)
      .eq('user_id', userId)
      .single()

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: 'Registration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sprawdź czy już nie opłacone
    if (registration.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Already paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Utwórz rekord transakcji w bazie
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'payment',
        amount: amount,
        description: description || `Opłata za ${registration.activities.name}`,
        status: 'pending',
        provider: 'autopay',
        registration_id: registrationId
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction creation error:', txError)
      throw txError
    }

    // 6. Wygeneruj OrderID dla Autopay (max 32 znaki alfanumeryczne)
    // Użyj tylko transaction.id (UUID bez kresek = 32 znaki)
    const orderId = transaction.id.replace(/-/g, '')

    // 7. Przygotuj parametry płatności Autopay
    const serviceId = Deno.env.get('AUTOPAY_SERVICE_ID') ?? ''
    const sharedKey = Deno.env.get('AUTOPAY_SHARED_KEY') ?? ''
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'

    // Gateway URL - środowisko testowe Autopay
    const gatewayUrl = 'https://testpay.autopay.eu/payment'

    // Format kwoty: 1.50 (nie grosze!)
    const amountFormatted = amount.toFixed(2)

    // 8. Zaktualizuj transakcję o provider_transaction_id
    await supabase
      .from('transactions')
      .update({ provider_transaction_id: orderId })
      .eq('id', transaction.id)

    // 9. Pobierz email użytkownika - WYMAGANE przez Autopay
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const customerEmail = userData?.email || user.email || ''

    // Autopay wymaga email - jeśli nie ma, błąd
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Customer email is required for payment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currency = 'PLN'

    // 10. Generuj hash - kolejność według dokumentacji: ServiceID|OrderID|Amount|CustomerEmail|SharedKey
    const hashInput = `${serviceId}|${orderId}|${amountFormatted}|${customerEmail}|${sharedKey}`

    console.log('Payment params:', {
      serviceId,
      orderId,
      amount: amountFormatted,
      currency,
      customerEmail,
      hashInput: `${serviceId}|${orderId}|${amountFormatted}|${customerEmail}|***`
    })

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(hashInput)
    )
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // 11. Zbuduj parametry - dokumentacja wymaga CustomerEmail jako OBOWIĄZKOWE
    const params: Record<string, string> = {
      ServiceID: serviceId,
      OrderID: orderId,
      Amount: amountFormatted,
      CustomerEmail: customerEmail,  // OBOWIĄZKOWE
      Hash: hash
      // NIE dodajemy GatewayID domyślnie - Autopay pokaże wybór metody
    }

    // BLIK - wymaga WhiteLabel mode (GatewayID=509)
    if (paymentMethod === 'blik' && blikCode) {
      console.log('[Payment Initiate] BLIK selected, setting GatewayID=509 and AuthorizationCode')
      params.GatewayID = '509'
      params.AuthorizationCode = blikCode
    } else if (paymentMethod === 'blik' && !blikCode) {
      console.warn('[Payment Initiate] BLIK selected but no blikCode provided!')
    }

    // PBL - tylko jeśli explicite wybrane
    if (paymentMethod === 'pbl') {
      console.log('[Payment Initiate] PBL selected, setting GatewayID=106')
      params.GatewayID = '106'
    }

    // Zbuduj URL do React route która wykona POST do Autopay
    params.gatewayUrl = gatewayUrl
    const redirectUrl = `${frontendUrl}/autopay-redirect?${new URLSearchParams(params).toString()}`

    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl,
        transactionId: transaction.id,
        orderId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Payment initiation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
