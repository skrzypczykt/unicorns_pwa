# Universal Payment Webhook

Obsługuje webhooks od różnych dostawców płatności:
- **Autopay** (Blue Media)
- **Stripe**
- **PayU**
- **Tpay**

## 🔧 Konfiguracja

### 1. Zmienne środowiskowe (Supabase Secrets)

Ustaw w Supabase Dashboard → Edge Functions → Secrets:

```bash
# Autopay (Blue Media)
AUTOPAY_SHARED_KEY=twoj-shared-key
AUTOPAY_SERVICE_ID=12345

# Stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# PayU
PAYU_SECOND_KEY=twoj-second-key

# Tpay
TPAY_SECURITY_CODE=twoj-security-code
```

**Komendy CLI:**
```bash
supabase secrets set AUTOPAY_SHARED_KEY=your-key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set PAYU_SECOND_KEY=your-key
supabase secrets set TPAY_SECURITY_CODE=your-code
```

### 2. Deploy funkcji

```bash
supabase functions deploy payment-webhook
```

### 3. URL webhook do podania u dostawcy

**Autopay:**
```
https://[projekt].supabase.co/functions/v1/payment-webhook/autopay
```

**Stripe:**
```
https://[projekt].supabase.co/functions/v1/payment-webhook/stripe
```

**PayU:**
```
https://[projekt].supabase.co/functions/v1/payment-webhook/payu
```

**Tpay:**
```
https://[projekt].supabase.co/functions/v1/payment-webhook/tpay
```

---

## 🔒 Bezpieczeństwo

### Weryfikacja podpisu (Signature Verification)

Każdy dostawca używa innego algorytmu:

| Dostawca | Algorytm | Header/Param |
|----------|----------|--------------|
| **Autopay** | SHA256 HMAC | `Hash` (body param) |
| **Stripe** | SHA256 HMAC + timestamp | `stripe-signature` (header) |
| **PayU** | MD5 lub SHA256 | `openpayu-signature` (header) |
| **Tpay** | MD5 checksum | `md5sum` (body param) |

**Webhook NIE zaakceptuje requestu bez prawidłowego podpisu!**

---

## 📊 Przepływ płatności

### 1. Użytkownik inicjuje płatność (frontend)

```typescript
// Przykład: Rejestracja na zajęcia z płatnością
const registration = await supabase
  .from('registrations')
  .insert({
    activity_id,
    user_id,
    payment_status: 'pending',
    payment_due_date: calculateDueDate()
  })
  .select()
  .single()

// Przekierowanie do bramki
const orderId = `reg_${registration.id}` // Format: reg_{uuid}
window.location.href = `https://autopay.pl/payment?orderId=${orderId}&amount=3000`
```

### 2. Użytkownik płaci w bramce

Dostawca przetwarza płatność (BLIK, karta, przelew).

### 3. Dostawca wysyła webhook (server-to-server)

```http
POST /functions/v1/payment-webhook/autopay
Content-Type: application/x-www-form-urlencoded

ServiceID=12345&OrderID=reg_abc-123&Amount=3000&PaymentStatus=SUCCESS&Hash=abc123...
```

### 4. Webhook weryfikuje podpis

```typescript
const isValid = verifyAutopaySignature(payload, hash, sharedKey)
if (!isValid) {
  return 401 // Unauthorized
}
```

### 5. Webhook aktualizuje bazę

```sql
-- Update registration
UPDATE registrations 
SET payment_status = 'paid', paid_at = NOW() 
WHERE id = 'abc-123';

-- Add transaction
INSERT INTO balance_transactions (user_id, amount, type, ...)
VALUES (...);
```

### 6. Dostawca otrzymuje potwierdzenie

```
200 OK
OK  (Autopay wymaga "OK")
```

---

## 🧪 Testowanie

### Test z Autopay Sandbox

```bash
# Symuluj webhook Autopay
curl -X POST https://[projekt].supabase.co/functions/v1/payment-webhook/autopay \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ServiceID=12345&OrderID=reg_test-123&Amount=3000&Currency=PLN&PaymentStatus=SUCCESS&Hash=COMPUTED_HASH"
```

**Obliczanie Hash:**
```typescript
const hashString = [
  '12345',              // ServiceID
  'reg_test-123',       // OrderID
  'remote-123',         // RemoteID
  '3000',               // Amount
  'PLN',                // Currency
  '1',                  // GatewayID
  '2026-04-21 10:00',   // PaymentDate
  'SUCCESS',            // PaymentStatus
  '',                   // PaymentStatusDetails
  'YOUR_SHARED_KEY'     // SharedKey
].join('|')

const hash = crypto.createHmac('sha256', 'YOUR_SHARED_KEY')
  .update(hashString)
  .digest('hex')
```

### Test z Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to https://[projekt].supabase.co/functions/v1/payment-webhook/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## 📝 Format danych

### OrderID Convention

Używamy prefiksu dla różnych typów płatności:

```
reg_{uuid}   - Płatność za rejestrację na zajęcia
fee_{uuid}   - Składka członkowska
don_{uuid}   - Darowizna
```

**Przykład:**
```
reg_550e8400-e29b-41d4-a716-446655440000
```

### Custom Data (opcjonalne)

Możesz przekazać dodatkowe dane w formacie JSON:

```json
{
  "customData": {
    "userId": "uuid",
    "activityName": "Joga",
    "sessionDate": "2026-04-25"
  }
}
```

---

## 🔄 Status płatności

| Status | Opis | Akcja |
|--------|------|-------|
| `pending` | Czeka na płatność | Brak akcji |
| `success` | Płatność udana | Aktualizuj `payment_status='paid'`, dodaj transakcję |
| `failed` | Płatność nieudana | Aktualizuj `payment_status='failed'` |
| `refunded` | Zwrot pieniędzy | Dodaj transakcję zwrotu |

---

## 🚨 Error Handling

### Co się dzieje gdy:

**1. Nieprawidłowy podpis**
```
401 Unauthorized
{ "error": "Invalid signature" }
```

**2. Rejestracja nie istnieje**
```
500 Internal Server Error
{ "error": "Registration not found" }
```

**3. Nieznany dostawca**
```
400 Bad Request
{ "error": "Unknown payment provider" }
```

### Retry Logic

Większość dostawców retryuje webhook 3-5 razy z exponential backoff:
- 1. próba: natychmiast
- 2. próba: +5 minut
- 3. próba: +15 minut
- 4. próba: +1 godzina
- 5. próba: +6 godzin

**Webhook musi zwrócić 200 OK, aby zatrzymać retry!**

---

## 📊 Monitoring i Logi

### Sprawdź logi w Supabase

```bash
# Real-time logs
supabase functions logs payment-webhook --tail

# Ostatnie 100 wywołań
supabase functions logs payment-webhook --limit 100
```

### Log format

```
=== Payment Webhook Received ===
Method: POST
URL: /functions/v1/payment-webhook/autopay
Detected provider: autopay
✅ Signature verified
Payment data: { orderId: 'reg_123', amount: 30, status: 'success' }
Found registration for user: Jan Kowalski
✅ Payment recorded successfully
```

---

## 🔗 Przydatne linki

### Dokumentacja dostawców:

- **Autopay:** https://developers.autopay.pl/
- **Stripe:** https://stripe.com/docs/webhooks
- **PayU:** https://developers.payu.com/pl/restapi.html
- **Tpay:** https://docs.tpay.com/

---

**Autor:** Claude Sonnet 4.5  
**Data:** 2026-04-21  
**Status:** ✅ Gotowe do produkcji
