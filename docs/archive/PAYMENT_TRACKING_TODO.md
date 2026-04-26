# Payment Tracking - Plan Implementacji

## ✅ GOTOWE - WSZYSTKO ZAIMPLEMENTOWANE

### 1. **Migracja 020** - `supabase/migrations/020_payment_tracking.sql`
   - Kolumny w `registrations`: payment_status, payment_due_date, paid_at
   - Kolumny w `activities`: requires_immediate_payment, payment_deadline_hours
   - Funkcje: calculate_payment_due_date(), get_registrations_needing_payment_reminders()
   - TypeScript types zaktualizowane

### 2. **A) Admin UI - AdminActivitiesPage.tsx**
   - Checkboxy płatności w formularzu
   - "Wymagaj natychmiastowej płatności"
   - "Termin płatności (godziny przed zajęciami)"

### 3. **B) Modal płatności - PaymentChoiceModal.tsx**
   - Komponent modalu z wyborem płatności
   - Integracja w ActivitiesPage.tsx
   - Logika: requires_immediate = tylko "Opłać teraz"
   - Obliczanie payment_due_date przy "Opłać później"

### 4. **C) Status płatności - MyClassesPage.tsx**
   - Badgey: ✅ Opłacone / ⏳ Do zapłaty / ❗ Przeterminowane
   - Sekcja z deadline i przyciskiem "💳 Opłać teraz"
   - handlePayNow() (mock - czeka na BLIK)

### 5. **D) Push Reminders - Edge Function + Cron**
   - `supabase/functions/send-payment-reminders/index.ts`
   - FCM v1 API (Service Account)
   - Cron job: `payment-reminders-hourly` (co 1h)
   - pg_cron + pg_net extensions enabled
   - trigger_payment_reminders() SQL function

### 6. **Firebase Configuration**
   - Service Account utworzony
   - FIREBASE_SERVICE_ACCOUNT secret w Supabase
   - FCM Cloud Messaging API enabled

---

## 🔨 DO ZROBIENIA (OPCJONALNE)

### 1. Frontend - Modal płatności przy zapisie (ActivitiesPage.tsx)

Obecnie proces zapisu:
```typescript
const handleRegister = async (activityId: string) => {
  // Insert do registrations
  // Jeśli payment_processed === false, STOP
}
```

**NOWE:**
```typescript
const handleRegister = async (activityId: string) => {
  // 1. Sprawdź czy requires_immediate_payment
  const activity = activities.find(a => a.id === activityId)
  
  if (activity.requires_immediate_payment) {
    // Musi zapłacić teraz - pokaż BLIK modal
    setShowPaymentModal(true)
    // Po "opłaceniu" (BLIK disabled) -> dodaj rejestrację z payment_status='paid'
  } else {
    // Pokaż modal wyboru:
    // [Opłać teraz] [Opłać później]
    setShowPaymentChoiceModal(true)
  }
}
```

**Komponenty do utworzenia:**
- `PaymentChoiceModal.tsx` - pytanie "Opłać teraz?" lub "Później?"
- Modyfikacja `handleRegister` w ActivitiesPage.tsx

### 2. Frontend - Wyświetlanie statusu płatności (MyClassesPage.tsx)

**Obecnie:** Pokazuje status rejestracji (registered, cancelled)

**NOWE:** Dodać:
- Badge płatności: "✅ Opłacone" / "⏳ Do zapłaty" / "❗ Przeterminowane"
- Przycisk "💳 Opłać" przy payment_status='pending'
- Deadline: "Termin płatności: 18.04.2026 18:00"

**Kod:**
```tsx
{registration.payment_status === 'pending' && (
  <div className="mt-2">
    <p className="text-sm text-orange-600">
      ⏳ Termin płatności: {formatDate(registration.payment_due_date)}
    </p>
    <button
      onClick={() => handlePayNow(registration.id)}
      className="mt-2 px-3 py-1 bg-purple-500 text-white rounded-lg"
    >
      💳 Opłać teraz
    </button>
  </div>
)}
```

### 3. Admin - Dodać pola płatności do AdminActivitiesPage

W formularzu tworzenia zajęć dodać:
```tsx
<div>
  <label>
    <input type="checkbox" checked={requiresImmediatePayment} />
    Wymagaj natychmiastowej płatności
  </label>
</div>

{!requiresImmediatePayment && (
  <div>
    <label>Termin płatności (godziny przed zajęciami)</label>
    <input type="number" value={paymentDeadlineHours} />
  </div>
)}
```

### 4. Edge Function - Przypomnienia push

**Plik:** `supabase/functions/send-payment-reminders/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Pobierz rejestracje wymagające przypomnienia
  const { data: registrations } = await supabaseAdmin
    .rpc('get_registrations_needing_payment_reminders')

  // 2. Dla każdej rejestracji:
  for (const reg of registrations) {
    // Pobierz FCM token użytkownika
    const { data: tokens } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', reg.user_id)

    // Wyślij push notification
    for (const { token } of tokens) {
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: '💳 Przypomnienie o płatności',
            body: `Zapłać za ${reg.activity_name} do ${formatDate(reg.payment_due_date)}`
          }
        })
      })
    }

    // 3. Zaktualizuj last_payment_reminder_sent_at
    await supabaseAdmin
      .from('registrations')
      .update({ last_payment_reminder_sent_at: new Date().toISOString() })
      .eq('id', reg.registration_id)
  }

  return new Response(JSON.stringify({ sent: registrations.length }))
})
```

**Cron setup (Supabase Dashboard):**
- Frequency: Co 1 godzinę
- Function: send-payment-reminders
- Region: auto

### 5. Edge Function - Obsługa płatności BLIK

**Plik:** `supabase/functions/process-payment/index.ts`

Gdy użytkownik kliknie "💳 Opłać" przy rejestracji:

```typescript
serve(async (req) => {
  const { registrationId, blikCode } = await req.json()
  
  // 1. Sprawdź payment_status
  const { data: registration } = await supabase
    .from('registrations')
    .select('*, activities(*)')
    .eq('id', registrationId)
    .single()

  if (registration.payment_status === 'paid') {
    return new Response('Already paid', { status: 400 })
  }

  // 2. Integracja z BLIK (TODO - na razie mock)
  const paymentSuccess = true // Mock

  if (paymentSuccess) {
    // 3. Oznacz jako opłacone
    await supabase.rpc('mark_registration_as_paid', {
      registration_id_param: registrationId
    })

    // 4. Dodaj wpłatę do balance_transactions
    // ... (jak w obecnym systemie)

    return new Response(JSON.stringify({ success: true }))
  }

  return new Response('Payment failed', { status: 400 })
})
```

## 📋 Kolejność implementacji (ZREALIZOWANE)

1. ✅ **[NAJPIERW]** Wykonaj migrację 020 w Supabase Dashboard
2. ✅ **[UI]** Dodaj checkboxy płatności w AdminActivitiesPage (requires_immediate_payment, payment_deadline_hours)
3. ✅ **[UI]** Dodaj PaymentChoiceModal.tsx (Opłać teraz / później)
4. ✅ **[UI]** Zmodyfikuj handleRegister w ActivitiesPage - użyj modalu
5. ✅ **[UI]** Dodaj wyświetlanie payment_status w MyClassesPage (badge + przycisk "Opłać")
6. ✅ **[Backend]** Utwórz Edge Function: send-payment-reminders (FCM v1 API)
7. ✅ **[Backend]** Skonfiguruj Cron w Supabase (co 1h, pg_cron)
8. ⏸️ **[Backend]** Utwórz Edge Function: process-payment (ODŁOŻONE - wymaga integracji BLIK)

## 🧪 Testowanie

1. Utwórz zajęcia z `requires_immediate_payment = true`
   - Spróbuj się zapisać → powinien wymusić płatność
2. Utwórz zajęcia z `requires_immediate_payment = false`, `payment_deadline_hours = 24`
   - Zapisz się → wybierz "Opłać później"
   - Sprawdź w bazie: `payment_status = 'pending'`, `payment_due_date` ustawione
3. Symuluj push reminders:
   - Uruchom `SELECT * FROM get_registrations_needing_payment_reminders()`
   - Powinien zwrócić nieopłacone rejestracje

## 📝 Notatki

- `payment_processed` (stara kolumna) vs `payment_status` (nowa) - rozważ migrację danych
- BLIK modal nadal jest disabled - to tylko UI, faktyczna integracja wymaga API BLIK
- Push notifications działają tylko jeśli użytkownik ma FCM token zapisany
