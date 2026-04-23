# Testowanie płatności Autopay

## Konfiguracja środowiska testowego

### 1. Zmienne środowiskowe

Dodaj do `.env`:

```bash
# Autopay (Blue Media) - środowisko testowe
VITE_AUTOPAY_SERVICE_ID=your_test_service_id
VITE_AUTOPAY_SHARED_KEY=your_test_shared_key
VITE_AUTOPAY_GATEWAY_URL=https://pay-accept.bm.pl/payment

# Frontend URL (dla Return URL)
VITE_FRONTEND_URL=http://localhost:5173
```

W Supabase Edge Functions (dashboard → Edge Functions → Secrets):
```
AUTOPAY_SERVICE_ID=your_test_service_id
AUTOPAY_SHARED_KEY=your_test_shared_key
AUTOPAY_GATEWAY_URL=https://pay-accept.bm.pl/payment
FRONTEND_URL=http://localhost:5173
```

### 2. Konfiguracja ITN URL w panelu Autopay

W panelu administracyjnym Autopay skonfiguruj:
- **ITN URL**: `https://your-supabase-project.supabase.co/functions/v1/autopay-webhook`
- **Return URL**: `https://your-frontend-url.com/payment/success` (opcjonalnie)

## Testowanie różnych scenariuszy

### 🏦 Test PayByLink (PBL) - "TEST 106"

**Metoda:** PBL (Pay By Link)
**Kanał testowy:** TEST 106

**Request:**
```json
{
  "registrationId": "uuid",
  "amount": 10.00,
  "description": "Test PBL",
  "paymentMethod": "pbl"
}
```

**Oczekiwany flow:**
1. System dodaje `GatewayID=106` do parametrów
2. Użytkownik przekierowany na stronę logowania do "banku testowego"
3. Kliknięcie "Zapłać" potwierdza płatność
4. Autopay wysyła webhook ITN z `paymentStatus=SUCCESS`
5. System aktualizuje `transactions.status = 'completed'`

**Uwaga:** Na produkcji wyświetlą się ikony prawdziwych banków.

### 📱 Test BLIK (WhiteLabel mode)

**BLIK działa tylko w trybie WhiteLabel:** `GatewayID=509`

**Kody testowe:**
- `111112` → ✅ Pozytywna płatność
- `111121` → ❌ Błędny kod
- `111122` → ⏱️ Kod wygasł
- `111123` → 🔄 Kod został już wykorzystany

**Request (sukces):**
```json
{
  "registrationId": "uuid",
  "amount": 10.00,
  "description": "Test BLIK",
  "paymentMethod": "blik",
  "blikCode": "111112"
}
```

**Request (błąd - kod wygasły):**
```json
{
  "registrationId": "uuid",
  "amount": 10.00,
  "description": "Test BLIK expired",
  "paymentMethod": "blik",
  "blikCode": "111122"
}
```

**Oczekiwany flow (sukces):**
1. System dodaje `GatewayID=509` i `AuthorizationCode=111112`
2. Autopay przetwarza płatność BLIK
3. Webhook ITN z `paymentStatus=SUCCESS`
4. System aktualizuje status na 'completed'

**Oczekiwany flow (błąd):**
1. System dodaje `GatewayID=509` i `AuthorizationCode=111121` (błędny)
2. Autopay odrzuca płatność
3. Webhook ITN z `paymentStatus=FAILURE`
4. System aktualizuje status na 'failed'

### 💳 Test karty płatniczej (default)

**Karty testowe:**
- **Visa sukces:** `4111111111111111`
- **Mastercard sukces:** `5500000000000004`
- **Visa odrzucenie:** `4000000000000002`
- **Mastercard odrzucenie:** `5555555555554444`
- **CVV:** dowolny 3-cyfrowy (np. `123`)
- **Data ważności:** dowolna przyszła (np. `12/25`)

**Request:**
```json
{
  "registrationId": "uuid",
  "amount": 10.00,
  "description": "Test card payment",
  "paymentMethod": "default"
}
```

**Oczekiwany flow (sukces):**
1. Użytkownik wybiera płatność kartą
2. Wpisuje dane karty `4111111111111111`
3. Autopay przetwarza płatność
4. Webhook ITN z `paymentStatus=SUCCESS`

**Oczekiwany flow (odrzucenie):**
1. Użytkownik wybiera płatność kartą
2. Wpisuje dane karty `4000000000000002`
3. Autopay odrzuca płatność
4. Webhook ITN z `paymentStatus=FAILURE`

### ⏱️ Test płatności oczekującej

**Scenariusz:**
- Użytkownik inicjuje płatność
- Zamyka okno przeglądarki przed ukończeniem
- Lub wybiera metodę płatności (np. przelew), ale nie kończy płatności

**Oczekiwany stan:**
- `transactions.status = 'pending'`
- `registrations.payment_status = 'unpaid'`
- Po pewnym czasie (timeout w Autopay) webhook ITN z `paymentStatus=CANCELLED`

### 🔄 Test anulowania płatności

**Scenariusz:**
- Użytkownik kliknie "Anuluj" na stronie Autopay

**Oczekiwany flow:**
1. Autopay wysyła webhook ITN z `paymentStatus=CANCELLED`
2. System aktualizuje `transactions.status = 'cancelled'`
3. Użytkownik może spróbować ponownie

## Testowanie webhooka ręcznie

Możesz symulować webhook wysyłając POST z XML do endpointa:

```bash
curl -X POST https://your-supabase-project.supabase.co/functions/v1/autopay-webhook \
  -H "Content-Type: application/xml" \
  -d '<transactions>
    <transaction>
      <serviceID>123456</serviceID>
      <orderID>REG-uuid-123</orderID>
      <remoteID>BM-789</remoteID>
      <amount>1000</amount>
      <currency>PLN</currency>
      <gatewayID>1</gatewayID>
      <paymentDate>2024-01-01 12:00:00</paymentDate>
      <paymentStatus>SUCCESS</paymentStatus>
      <paymentStatusDetails>OK</paymentStatusDetails>
      <hash>your_calculated_hash</hash>
    </transaction>
  </transactions>'
```

**Uwaga:** Hash musi być prawidłowy. Oblicz go według formuły:
```
SHA256(ServiceID|OrderID|RemoteID|Amount|Currency|GatewayID|PaymentDate|PaymentStatus|PaymentStatusDetails|SharedKey)
```

## Debugowanie

### Sprawdź logi Edge Function:

```bash
npx supabase functions serve autopay-webhook --env-file .env
```

Lub w dashboard Supabase:
- Edge Functions → `autopay-webhook` → Logs

### Sprawdź status transakcji w bazie:

```sql
SELECT 
  id, 
  provider_transaction_id, 
  amount, 
  status, 
  provider,
  created_at,
  updated_at
FROM transactions
WHERE provider = 'autopay'
ORDER BY created_at DESC
LIMIT 10;
```

### Sprawdź payment_status rezerwacji:

```sql
SELECT 
  r.id,
  r.user_id,
  r.activity_id,
  r.payment_status,
  t.status as transaction_status,
  t.amount
FROM registrations r
LEFT JOIN transactions t ON t.registration_id = r.id
WHERE t.provider = 'autopay'
ORDER BY r.created_at DESC
LIMIT 10;
```

## Przykłady użycia w aplikacji

### Frontend - inicjacja płatności BLIK

```typescript
// W komponencie płatności
const handleBlikPayment = async (blikCode: string) => {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-initiate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        registrationId: 'uuid-registration',
        amount: 30.00,
        description: 'Opłata za zajęcia jogi',
        paymentMethod: 'blik',
        blikCode: blikCode // np. "111112" dla testu sukcesu
      })
    }
  )

  const data = await response.json()

  if (data.redirectUrl) {
    // Dla BLIK może nie być przekierowania - płatność od razu
    // Autopay zwróci status przez webhook
    console.log('BLIK payment initiated:', data.orderId)
  }
}
```

### Frontend - inicjacja płatności PBL

```typescript
const handlePblPayment = async () => {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-initiate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        registrationId: 'uuid-registration',
        amount: 30.00,
        description: 'Opłata za zajęcia jogi',
        paymentMethod: 'pbl' // TEST 106
      })
    }
  )

  const data = await response.json()

  if (data.redirectUrl) {
    // Przekieruj użytkownika do banku testowego
    window.location.href = data.redirectUrl
  }
}
```

### Frontend - domyślna płatność (wybór na bramce)

```typescript
const handleDefaultPayment = async () => {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-initiate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        registrationId: 'uuid-registration',
        amount: 30.00,
        description: 'Opłata za zajęcia jogi'
        // paymentMethod domyślnie 'default' - użytkownik wybierze na bramce
      })
    }
  )

  const data = await response.json()

  if (data.redirectUrl) {
    // Przekieruj użytkownika do wyboru metody płatności
    window.location.href = data.redirectUrl
  }
}
```

## FAQ

**Q: Webhook nie przychodzi**
- Sprawdź czy URL jest poprawnie skonfigurowany w panelu Autopay
- Sprawdź czy Edge Function jest wdrożona (`supabase functions deploy autopay-webhook`)
- Sprawdź logi w Supabase Dashboard

**Q: Hash verification failed**
- Sprawdź czy `AUTOPAY_SHARED_KEY` w Edge Function jest identyczny jak w panelu Autopay
- Sprawdź format hash (lowercase hex)
- Sprawdź kolejność pól w hashowaniu

**Q: Transakcja pozostaje "pending" mimo sukcesu**
- Sprawdź czy webhook ITN przychodzi (logi)
- Sprawdź czy `provider_transaction_id` w bazie zgadza się z `OrderID` w webhooku
- Sprawdź mapowanie statusu w `mapAutopayStatus()`

**Q: Jak przetestować w środowisku produkcyjnym?**
- Zmień `AUTOPAY_GATEWAY_URL` na `https://pay.bm.pl/payment` (bez `-accept`)
- Użyj production `ServiceID` i `SharedKey`
- Użyj prawdziwych kart/przelewów (będą pobrane pieniądze!)
