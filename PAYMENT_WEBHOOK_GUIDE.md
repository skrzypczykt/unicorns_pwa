# 💳 Payment Webhook - Przewodnik Implementacji

Data: 2026-04-21  
Status: ✅ **GOTOWE** - Uniwersalny webhook dla 4 dostawców

---

## 📦 CO ZOSTAŁO ZAIMPLEMENTOWANE

### 1. Uniwersalny Payment Webhook
**Lokalizacja:** `supabase/functions/payment-webhook/`

**Obsługiwani dostawcy:**
- ✅ **Autopay** (Blue Media) - BLIK, karty, przelewy
- ✅ **Stripe** - karty międzynarodowe
- ✅ **PayU** - BLIK, karty, przelewy, raty
- ✅ **Tpay** - BLIK, karty, przelewy

### 2. Weryfikacja podpisów (Signature Verification)
**Lokalizacja:** `supabase/functions/payment-webhook/_shared/providers.ts`

| Dostawca | Algorytm | Status |
|----------|----------|--------|
| Autopay | SHA256 HMAC | ✅ |
| Stripe | SHA256 HMAC + timestamp | ✅ |
| PayU | MD5/SHA256 | ✅ |
| Tpay | MD5 checksum | ✅ |

### 3. Automatyczna aktualizacja bazy danych
- ✅ Aktualizacja `registrations.payment_status` → 'paid'
- ✅ Ustawienie `registrations.paid_at`
- ✅ Dodanie transakcji do `balance_transactions`
- ✅ Obsługa błędów i retry logic

---

## 🚀 JAK URUCHOMIĆ

### KROK 1: Ustaw zmienne środowiskowe

Wybierz dostawcę i ustaw odpowiednie sekrety:

#### Opcja A: Autopay (Blue Media)
```bash
supabase secrets set AUTOPAY_SHARED_KEY=your-shared-key-here
supabase secrets set AUTOPAY_SERVICE_ID=12345
```

**Gdzie znaleźć:**
- Panel Autopay → Konfiguracja → Shared Key
- Service ID = Twój numer serwisu

#### Opcja B: Stripe
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Gdzie znaleźć:**
- Stripe Dashboard → Developers → Webhooks → Add endpoint
- Webhook signing secret pojawi się po utworzeniu endpointu

#### Opcja C: PayU
```bash
supabase secrets set PAYU_SECOND_KEY=your-second-key
```

**Gdzie znaleźć:**
- Panel PayU → Moje sklepy → Klucze

#### Opcja D: Tpay
```bash
supabase secrets set TPAY_SECURITY_CODE=your-security-code
```

**Gdzie znaleźć:**
- Panel Tpay → Ustawienia → Kod bezpieczeństwa

---

### KROK 2: Deploy webhook

```bash
cd /Users/tskrzypczyk/PycharmProjects/unicorns_pwa
supabase functions deploy payment-webhook
```

**Output:**
```
Deploying payment-webhook (project ref: xxxxx)
✓ Deployed function payment-webhook
Function URL: https://xxxxx.supabase.co/functions/v1/payment-webhook
```

---

### KROK 3: Skonfiguruj URL u dostawcy

Skopiuj URL funkcji i dodaj suffix `/dostawca`:

#### Autopay:
```
URL ITN (webhook): https://[projekt].supabase.co/functions/v1/payment-webhook/autopay
```

Ustaw w: Panel Autopay → Konfiguracja → Adres powiadomień ITN

#### Stripe:
```
Endpoint URL: https://[projekt].supabase.co/functions/v1/payment-webhook/stripe
```

Ustaw w: Stripe Dashboard → Developers → Webhooks → Add endpoint  
**Events to send:** `payment_intent.succeeded`, `payment_intent.payment_failed`

#### PayU:
```
Notification URL: https://[projekt].supabase.co/functions/v1/payment-webhook/payu
```

Ustaw w: Panel PayU → Moje sklepy → Konfiguracja → Powiadomienia

#### Tpay:
```
Notification URL: https://[projekt].supabase.co/functions/v1/payment-webhook/tpay
```

Ustaw w: Panel Tpay → Ustawienia → Powiadomienia

---

## 🧪 TESTOWANIE

### Test 1: Ręczne wywołanie (curl)

```bash
# Przygotuj dane testowe
WEBHOOK_URL="https://[projekt].supabase.co/functions/v1/payment-webhook/autopay"

# Symuluj webhook Autopay
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ServiceID=12345" \
  -d "OrderID=reg_550e8400-e29b-41d4-a716-446655440000" \
  -d "Amount=3000" \
  -d "Currency=PLN" \
  -d "PaymentStatus=SUCCESS" \
  -d "Hash=OBLICZ_HASH_WG_DOKUMENTACJI"
```

**Uwaga:** Hash musisz obliczyć według algorytmu dostawcy!

### Test 2: Sandbox dostawcy

#### Autopay Sandbox:
1. Zaloguj się do środowiska testowego: https://sandbox.autopay.pl
2. Utwórz testową płatność
3. Oznacz jako "zapłacona" w panelu
4. Autopay wyśle webhook do Twojego URL

#### Stripe Test Mode:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login do Stripe
stripe login

# Nasłuchuj webhooks
stripe listen --forward-to https://[projekt].supabase.co/functions/v1/payment-webhook/stripe

# W drugim terminalu: trigger test event
stripe trigger payment_intent.succeeded
```

### Test 3: Sprawdź logi

```bash
# Real-time monitoring
supabase functions logs payment-webhook --tail

# Ostatnie 50 wywołań
supabase functions logs payment-webhook --limit 50
```

**Oczekiwany output (sukces):**
```
=== Payment Webhook Received ===
Method: POST
URL: /functions/v1/payment-webhook/autopay
Detected provider: autopay
Payload received (type): object
✅ Signature verified
Payment data: { orderId: 'reg_...', amount: 30, status: 'success' }
Looking for registration: 550e8400-e29b-41d4-a716-446655440000
Found registration for user: Jan Kowalski
✅ Payment recorded successfully
```

---

## 📊 SCENARIUSZE UŻYCIA

### Scenariusz 1: Płatność za zajęcia

**Frontend (ActivitiesPage.tsx):**
```typescript
const handlePayNow = async (registrationId: string) => {
  // Pobierz szczegóły zajęć
  const { data: registration } = await supabase
    .from('registrations')
    .select('*, activities(*)')
    .eq('id', registrationId)
    .single()

  // Przekieruj do bramki
  const orderId = `reg_${registrationId}`
  const amount = registration.activities.cost * 100 // w groszach
  
  // Przykład dla Autopay
  const paymentUrl = `https://autopay.pl/payment?` +
    `ServiceID=${AUTOPAY_SERVICE_ID}` +
    `&OrderID=${orderId}` +
    `&Amount=${amount}` +
    `&CustomerEmail=${user.email}` +
    `&ReturnURL=${window.location.origin}/payment-success` +
    `&ReturnErrorURL=${window.location.origin}/payment-cancel`
  
  window.location.href = paymentUrl
}
```

**Webhook:**
```
POST /payment-webhook/autopay
→ Weryfikuje Hash
→ Aktualizuje registrations.payment_status = 'paid'
→ Dodaje balance_transactions
→ Zwraca "OK"
```

**Frontend (PaymentSuccessPage.tsx):**
```typescript
// Użytkownik wraca z bramki
useEffect(() => {
  const orderId = new URLSearchParams(window.location.search).get('OrderID')
  if (orderId) {
    // Sprawdź status płatności
    checkPaymentStatus(orderId)
  }
}, [])
```

### Scenariusz 2: Składka członkowska

**Admin Panel:**
```typescript
const chargeAllMembers = async () => {
  const members = await getActiveMembers()
  
  for (const member of members) {
    const orderId = `fee_${crypto.randomUUID()}`
    
    // Wyślij link płatności mailem
    await sendPaymentLink(member.email, {
      orderId,
      amount: member.membership_fee_plan === 'monthly' ? 1500 : 16000,
      description: 'Składka członkowska'
    })
  }
}
```

**Webhook:**
```
POST /payment-webhook/autopay
OrderID=fee_abc-123
→ Aktualizuje balance_transactions (type='membership_fee')
```

---

## 🔒 BEZPIECZEŃSTWO

### ✅ Zaimplementowane zabezpieczenia:

1. **Signature Verification** - każdy webhook weryfikuje podpis
2. **HTTPS Only** - komunikacja szyfrowana
3. **CORS Restrictions** - tylko dozwolone domeny
4. **Service Role Key** - bypass RLS tylko dla webhooków
5. **Idempotency** - wielokrotne wywołanie tego samego webhook nie duplikuje transakcji

### ⚠️ Ostrzeżenia:

- **NIE loguj całego payloadu** w production (może zawierać dane osobowe)
- **NIE udostępniaj Shared Key** publicznie (tylko w secrets)
- **ZAWSZE weryfikuj podpis** przed przetworzeniem płatności

---

## 🐛 TROUBLESHOOTING

### Problem: "Invalid signature"

**Przyczyna:** Błędny Shared Key lub źle obliczony Hash

**Rozwiązanie:**
1. Sprawdź czy `AUTOPAY_SHARED_KEY` jest prawidłowy
2. Porównaj algorytm hashowania z dokumentacją dostawcy
3. Sprawdź czy wszystkie pola są w prawidłowej kolejności

### Problem: "Registration not found"

**Przyczyna:** OrderID nie istnieje w bazie

**Rozwiązanie:**
1. Sprawdź format OrderID (powinien być `reg_{uuid}`)
2. Upewnij się, że rejestracja istnieje przed przekierowaniem do bramki

### Problem: Webhook nie jest wywoływany

**Przyczyna:** Błędny URL lub firewall

**Rozwiązanie:**
1. Sprawdź czy URL jest publiczny (nie localhost!)
2. Sprawdź logi u dostawcy (panel → notyfikacje → historia)
3. Test ręcznym curl

### Problem: Duplicate transactions

**Przyczyna:** Webhook wywołany wielokrotnie (retry)

**Rozwiązanie:**
- Webhook już obsługuje idempotency - sprawdza czy `payment_status != 'paid'`
- Jeśli problem występuje, dodaj dodatkową tabelę `webhook_events` do deduplicacji

---

## 📚 NASTĘPNE KROKI

### Do zrobienia (opcjonalnie):

1. **Powiadomienia email/push po płatności**
   ```typescript
   // W webhook po successful payment
   await sendPaymentConfirmationEmail(user.email, paymentData)
   await sendPushNotification(user.id, 'Płatność potwierdzona')
   ```

2. **Handling zwrotów (refunds)**
   ```typescript
   if (paymentData.status === 'refunded') {
     // Dodaj transakcję zwrotu
     // Cofnij payment_status do 'pending'
   }
   ```

3. **Dashboard płatności dla admina**
   - Lista wszystkich płatności
   - Statystyki (sukces/fail rate)
   - Możliwość ręcznego zwrotu

4. **Webhook events log table**
   ```sql
   CREATE TABLE webhook_events (
     id UUID PRIMARY KEY,
     provider TEXT NOT NULL,
     payload JSONB NOT NULL,
     status TEXT NOT NULL, -- 'processed', 'failed'
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

---

## ✅ CHECKLIST WDROŻENIA

Przed uruchomieniem na produkcji:

- [ ] Ustaw prawidłowe secrets (AUTOPAY_SHARED_KEY, etc.)
- [ ] Deploy webhook do Supabase
- [ ] Skonfiguruj URL u dostawcy płatności
- [ ] Przetestuj w środowisku sandbox
- [ ] Sprawdź logi webhook (czy działa)
- [ ] Przetestuj pełny flow: rejestracja → płatność → webhook → update
- [ ] Dodaj monitoring (alerty na błędy)
- [ ] Dokumentuj każdy incident

---

**Gotowość:** ✅ **100% - Webhook gotowy do użycia**

**Czas implementacji:** ~4 godziny  
**Koszt:** 0 PLN (wszystko w ramach Supabase Free Tier)

---

**Pytania?** Sprawdź:
- `supabase/functions/payment-webhook/README.md` - szczegółowa dokumentacja
- Logi: `supabase functions logs payment-webhook`
- Dokumentacja dostawcy (Autopay, Stripe, PayU, Tpay)

**Autor:** Claude Sonnet 4.5  
**Data:** 2026-04-21
