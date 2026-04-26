# Strategia Automatyzacji Testów - Unicorns PWA

**Data:** 2026-04-26  
**Status:** Plan wdrożenia  
**Cel:** Automatyzacja 40-50% testów krytycznych (35-42 z 84 scenariuszy)

---

## Piramida Testów - Docelowy Stan

```
        /\
       /  \  E2E (10%)           ~ 8-10 testów Playwright
      /____\  
     /      \  Integration (30%)  ~ 25-30 testów API + DB
    /________\
   /          \ Unit (60%)        ~ 50-60 testów Vitest
  /__________\
```

**Obecny stan:** 0% automatyzacji  
**Cel końcowy:** 70% automatyzacji testów krytycznych

---

## 1. Testy E2E (Playwright) - Priorytet Najwyższy

### Dlaczego Playwright?

✅ **Zalety:**
- Obsługuje Chrome, Firefox, Safari (WebKit)
- Natywne API dla PWA i Service Workers
- Auto-waiting (czeka na elementy automatycznie)
- Snapshot testing (porównanie UI)
- Trace viewer (debugging)
- Integracja z CI/CD
- Typescript out-of-the-box

❌ **Alternatywy (odrzucone):**
- Cypress - problemy z iframe, słaba obsługa multi-tab
- Selenium - wolniejszy, wymaga więcej konfiguracji

### Scenariusze do Automatyzacji (20 testów E2E)

**Krytyczne (muszą działać zawsze) - 10 testów:**

1. **Auth Flow** (Scenariusz 1-2)
   - Rejestracja → Email link → Login
   - Wylogowanie
   
2. **Rezerwacja + Płatność** (Scenariusz 17-19)
   - Zapis na zajęcia bezpłatne
   - Zapis na płatne → BLIK → Success
   - Weryfikacja w "Moje Rezerwacje"

3. **Anulowanie** (Scenariusz 23)
   - Rezerwacja → Anulowanie przed deadline

4. **Admin - CRUD Zajęć** (Scenariusz 40-42)
   - Dodawanie zajęć
   - Edycja zajęć
   - Usuwanie (tylko puste)

5. **Filtrowanie Harmonogramu** (Scenariusz 11-12)
   - Filtr po sekcji
   - Reset filtrów

**Ważne (powinny działać) - 10 testów:**

6. **Profil - Edycja** (Scenariusz 30)
7. **Zmiana hasła** (Scenariusz 31)
8. **Powiadomienia - Toggle** (Scenariusz 60, 66)
9. **Strefa Członka - Dostęp** (Scenariusz 51)
10. **Zwroty - Zatwierdzanie** (Scenariusz 57)
11. **Security - Blokada /admin** (Scenariusz 79)
12. **Trener - Lista zajęć** (Scenariusz 71)
13. **Mobile - Responsywność** (Scenariusz 16)
14. **PWA - Instalacja** (Scenariusz 49)
15. **Offline Mode** (Scenariusz 50)

---

## 2. Testy API/Integracyjne - Priorytet Wysoki

### Dlaczego Postman/Newman + Vitest?

**Postman/Newman** dla Edge Functions:
- Kolekcje testów można eksportować
- Newman uruchamia w CI/CD
- Łatwe mockowanie webhooków

**Vitest** dla logiki biznesowej:
- Szybki (Vite-based)
- Typescript native
- Snapshot testing
- Coverage reporting

### Edge Functions do Przetestowania (15 testów API)

**Krytyczne:**

1. **payment-initiate**
   ```javascript
   // Test: Inicjalizacja płatności BLIK
   POST /functions/v1/payment-initiate
   Body: { registrationId, amount: 47, paymentMethod: 'blik', blikCode: '111112' }
   Expected: { redirectUrl, transactionId, status: 'pending' }
   ```

2. **autopay-webhook**
   ```javascript
   // Test: Webhook ITN - Success
   POST /functions/v1/autopay-webhook
   Body: { OrderID, Hash, ... }
   Expected: Status 200, transaction.status = 'completed'
   
   // Test: Deduplication (ten sam OrderID 2x)
   Expected: Status 200, drugi request nie duplikuje
   ```

3. **validate-registration**
   ```javascript
   // Test: Limit miejsc
   // Given: Zajęcia z 1 wolnym miejscem (9/10)
   // When: Dwóch użytkowników próbuje się zapisać
   // Then: Tylko jeden dostaje sukces
   ```

4. **generate-recurring-activities**
   ```javascript
   // Test: Generowanie instancji z szablonu
   // Given: Template "Yoga Mondays 18:00"
   // When: Wywołanie funkcji
   // Then: Tworzy 8 instancji (8 tygodni)
   ```

5. **send-payment-reminders**
   ```javascript
   // Test: Wysyłanie przypomnień
   // Given: Rezerwacja z deadline jutro
   // When: Cron job
   // Then: Email wysłany
   ```

**Ważne:**

6. **delete-user-account** - czy usuwa wszystkie dane
7. **update-balance** - aktualizacja salda po płatności
8. **send-push-notifications** - wysyłanie push
9. **send-activity-start-notifications** - powiadomienie 15 min przed
10. **process-attendance** - przetwarzanie obecności

---

## 3. Testy Jednostkowe (Vitest) - Priorytet Średni

### Co testować?

**Utils (10 testów):**
- `formatDuration(90)` → "90 min"
- `formatDuration(150)` → "2h 30min"
- `formatDuration(1500)` → "1 dzień 1h"
- `calculateDeadline(activity)` → Date
- `isWithinCancellationWindow(registration)` → boolean

**Hooks (5 testów):**
- `usePushNotifications()` - subscribe/unsubscribe
- `useInstallPWA()` - detect installable
- `useAuth()` - login/logout state

**Payment Providers (8 testów):**
- `AutopayProvider.generateHash()` - poprawność SHA-256
- `AutopayProvider.validateHash()` - weryfikacja webhooka
- Edge cases: brak blikCode, złe gateway ID

---

## 4. Przykładowe Implementacje

### Przykład 1: Playwright E2E - Rejestracja i Login

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Autentykacja', () => {
  test('Scenariusz 1-2: Rejestracja i logowanie', async ({ page }) => {
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'TestPass123!'
    
    // REJESTRACJA
    await page.goto('https://unicorns-test.netlify.app')
    await page.click('text=Zaloguj się / Zarejestruj')
    await page.click('text=Nie masz konta? Zarejestruj się')
    
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.fill('[name="passwordConfirm"]', password)
    await page.fill('[name="fullName"]', 'Jan Kowalski')
    await page.check('[name="acceptTerms"]')
    
    await page.click('button:has-text("Zarejestruj się")')
    
    // Sprawdź komunikat
    await expect(page.locator('text=Sprawdź swoją skrzynkę email')).toBeVisible()
    
    // SYMULACJA: W prawdziwym teście trzeba kliknąć link z emaila
    // Tutaj możemy użyć backdoor API do aktywacji konta
    
    // LOGIN
    await page.goto('https://unicorns-test.netlify.app/login')
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.click('button:has-text("Zaloguj się")')
    
    // Weryfikacja
    await expect(page.locator('text=Jan Kowalski')).toBeVisible() // imię w menu
    await expect(page.locator('text=Harmonogram')).toBeVisible()
  })
  
  test('Scenariusz 4: Wylogowanie', async ({ page }) => {
    // Setup: najpierw zaloguj
    await loginAsUser(page, 'test@example.com', 'TestPass123!')
    
    // Wylogowanie
    await page.click('text=Jan Kowalski') // klik na imię w menu
    await page.click('text=Wyloguj')
    await page.click('button:has-text("Potwierdź")') // dialog
    
    // Weryfikacja
    await expect(page.locator('text=Zaloguj się / Zarejestruj')).toBeVisible()
    await expect(page.locator('text=Jan Kowalski')).not.toBeVisible()
  })
})

// Helper function
async function loginAsUser(page, email, password) {
  await page.goto('https://unicorns-test.netlify.app/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('button:has-text("Zaloguj się")')
  await page.waitForURL('**/') // poczekaj na redirect
}
```

### Przykład 2: Playwright E2E - Rezerwacja i Płatność

```typescript
// tests/e2e/booking-payment.spec.ts
import { test, expect } from '@playwright/test'

test('Scenariusz 17-19: Zapis i płatność BLIK', async ({ page }) => {
  // Setup: zaloguj użytkownika
  await loginAsUser(page, 'test@example.com', 'TestPass123!')
  
  // 1. Wejdź na harmonogram
  await page.click('text=Harmonogram')
  await expect(page.locator('h1:has-text("Harmonogram")')).toBeVisible()
  
  // 2. Znajdź zajęcia płatne z wolnymi miejscami
  const activity = page.locator('[data-testid="activity-card"]')
    .filter({ hasText: 'zł' }) // ma cenę
    .filter({ hasNot: page.locator('text=Brak miejsc') }) // ma miejsca
    .first()
  
  const activityName = await activity.locator('[data-testid="activity-name"]').textContent()
  await activity.click()
  
  // 3. Zapisz się
  await page.click('button:has-text("Zapisz się")')
  await expect(page.locator('text=Zapisano na zajęcia!')).toBeVisible({ timeout: 5000 })
  
  // 4. Sprawdź Moje Rezerwacje
  await page.click('text=Moje Rezerwacje')
  await expect(page.locator(`text=${activityName}`)).toBeVisible()
  await expect(page.locator('text=Nieopłacone').or(page.locator('text=Oczekuje na płatność'))).toBeVisible()
  
  // 5. Kliknij Opłać
  await page.locator('button:has-text("Opłać")').first().click()
  
  // 6. Wybierz BLIK
  await page.click('text=BLIK')
  await page.fill('[name="blikCode"]', '111112') // testowy kod sukcesu
  await page.click('button:has-text("Zapłać")')
  
  // 7. Redirect do Autopay (testowa bramka)
  await page.waitForURL('**/testpay.autopay.eu/**', { timeout: 10000 })
  
  // Na bramce testowej Autopay - symulujemy kliknięcie "Zapłać"
  await page.click('button:has-text("Zapłać")') // przycisk na bramce testowej
  
  // 8. Redirect powrotny do /payment-success
  await page.waitForURL('**/payment-success**', { timeout: 15000 })
  
  // 9. Weryfikacja sukcesu
  await expect(page.locator('text=Płatność zakończona sukcesem').or(
    page.locator('text=Płatność przetworzona')
  )).toBeVisible({ timeout: 10000 }) // webhook może zająć chwilę
  
  // 10. Wróć do Moje Rezerwacje i sprawdź status
  await page.click('text=Moje Rezerwacje')
  await expect(page.locator(`text=${activityName}`)).toBeVisible()
  await expect(page.locator('text=Opłacone')).toBeVisible()
})
```

### Przykład 3: Postman/Newman - Edge Function API

```javascript
// tests/api/payment-initiate.postman_collection.json
{
  "info": {
    "name": "Unicorns PWA - Payment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Payment Initiate - BLIK Success",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "  pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Response has redirectUrl', function () {",
              "  const json = pm.response.json();",
              "  pm.expect(json).to.have.property('redirectUrl');",
              "  pm.expect(json.redirectUrl).to.include('autopay.eu');",
              "});",
              "",
              "pm.test('Transaction created with pending status', function () {",
              "  const json = pm.response.json();",
              "  pm.expect(json.transaction.status).to.equal('pending');",
              "});",
              "",
              "// Zapisz transactionId do kolejnych testów",
              "pm.environment.set('transactionId', pm.response.json().transaction.id);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"registrationId\": \"{{testRegistrationId}}\",\n  \"amount\": 47,\n  \"paymentMethod\": \"blik\",\n  \"blikCode\": \"111112\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/functions/v1/payment-initiate",
          "host": ["{{baseUrl}}"],
          "path": ["functions", "v1", "payment-initiate"]
        }
      }
    },
    {
      "name": "Autopay Webhook - ITN Success",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "  pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Response is OK', function () {",
              "  pm.expect(pm.response.text()).to.equal('OK');",
              "});",
              "",
              "// Delay dla race condition",
              "setTimeout(function(){}, 1000);",
              "",
              "// Sprawdź czy transaction został zaktualizowany",
              "pm.sendRequest({",
              "  url: pm.environment.get('baseUrl') + '/rest/v1/transactions?id=eq.' + pm.environment.get('transactionId'),",
              "  method: 'GET',",
              "  header: {",
              "    'apikey': pm.environment.get('supabaseAnonKey'),",
              "    'Authorization': 'Bearer ' + pm.environment.get('authToken')",
              "  }",
              "}, function (err, res) {",
              "  pm.test('Transaction status updated to completed', function () {",
              "    const transaction = res.json()[0];",
              "    pm.expect(transaction.status).to.equal('completed');",
              "  });",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "OrderID={{testOrderId}}&ServiceID={{autopayServiceId}}&OrderDescription=Test&CustomerEmail=test@example.com&Amount=4700&Hash={{calculatedHash}}"
        },
        "url": {
          "raw": "{{baseUrl}}/functions/v1/autopay-webhook",
          "host": ["{{baseUrl}}"],
          "path": ["functions", "v1", "autopay-webhook"]
        }
      }
    },
    {
      "name": "Autopay Webhook - Deduplication Test",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Second webhook also returns OK (duplicate handled gracefully)', function () {",
              "  pm.response.to.have.status(200);",
              "  pm.expect(pm.response.text()).to.equal('OK');",
              "});",
              "",
              "// Sprawdź że NIE utworzono duplikatu",
              "pm.sendRequest({",
              "  url: pm.environment.get('baseUrl') + '/rest/v1/transactions?provider_transaction_id=eq.' + pm.environment.get('testOrderId'),",
              "  method: 'GET',",
              "  header: {",
              "    'apikey': pm.environment.get('supabaseAnonKey')",
              "  }",
              "}, function (err, res) {",
              "  pm.test('Only one transaction exists (no duplicate)', function () {",
              "    pm.expect(res.json()).to.have.lengthOf(1);",
              "  });",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "body": {
          "mode": "raw",
          "raw": "OrderID={{testOrderId}}&ServiceID={{autopayServiceId}}&OrderDescription=Test&CustomerEmail=test@example.com&Amount=4700&Hash={{calculatedHash}}"
        },
        "url": "{{baseUrl}}/functions/v1/autopay-webhook"
      }
    }
  ]
}
```

### Przykład 4: Vitest - Unit Test dla Utils

```typescript
// frontend/src/utils/__tests__/formatDuration.test.ts
import { describe, it, expect } from 'vitest'
import { formatDuration } from '../formatDuration'

describe('formatDuration', () => {
  it('formatuje minuty poniżej 120 jako "X min"', () => {
    expect(formatDuration(30)).toBe('30 min')
    expect(formatDuration(60)).toBe('60 min')
    expect(formatDuration(90)).toBe('90 min')
    expect(formatDuration(120)).toBe('120 min')
  })
  
  it('formatuje godziny powyżej 120 min jako "Xh"', () => {
    expect(formatDuration(180)).toBe('3h')
    expect(formatDuration(240)).toBe('4h')
  })
  
  it('formatuje godziny + minuty jako "Xh Ymin"', () => {
    expect(formatDuration(150)).toBe('2h 30min')
    expect(formatDuration(195)).toBe('3h 15min')
  })
  
  it('formatuje dni jako "X dzień/dni"', () => {
    expect(formatDuration(1440)).toBe('1 dzień') // 24h
    expect(formatDuration(2880)).toBe('2 dni') // 48h
  })
  
  it('formatuje dni + godziny', () => {
    expect(formatDuration(1500)).toBe('1 dzień 1h') // 25h
    expect(formatDuration(2970)).toBe('2 dni 1h 30min') // 49.5h
  })
  
  it('obsługuje edge cases', () => {
    expect(formatDuration(0)).toBe('0 min')
    expect(formatDuration(1)).toBe('1 min')
    expect(formatDuration(null)).toBe('0 min')
    expect(formatDuration(undefined)).toBe('0 min')
  })
})
```

### Przykład 5: Vitest - Unit Test dla Payment Provider

```typescript
// frontend/src/payment/providers/__tests__/AutopayProvider.test.ts
import { describe, it, expect } from 'vitest'
import { AutopayProvider } from '../AutopayProvider'

describe('AutopayProvider', () => {
  const provider = new AutopayProvider({
    serviceId: 'TEST123',
    sharedKey: 'secret-key-123'
  })
  
  describe('generateHash', () => {
    it('generuje poprawny SHA-256 hash dla płatności', () => {
      const params = {
        ServiceID: 'TEST123',
        OrderID: 'order-uuid-123',
        Amount: '4700', // 47.00 zł w groszach
        Description: 'Zajęcia Fitness',
        CustomerEmail: 'test@example.com'
      }
      
      const hash = provider.generateHash(params)
      
      // Hash powinien być 64-znakowy hex string (SHA-256)
      expect(hash).toMatch(/^[a-f0-9]{64}$/i)
      
      // Ten sam input = ten sam hash (deterministyczny)
      const hash2 = provider.generateHash(params)
      expect(hash).toBe(hash2)
    })
    
    it('różne OrderID = różne hashe', () => {
      const params1 = { ServiceID: 'TEST', OrderID: 'order1', Amount: '100' }
      const params2 = { ServiceID: 'TEST', OrderID: 'order2', Amount: '100' }
      
      expect(provider.generateHash(params1)).not.toBe(provider.generateHash(params2))
    })
  })
  
  describe('validateHash', () => {
    it('zwraca true dla poprawnego hasha z webhooka', () => {
      const webhookParams = {
        ServiceID: 'TEST123',
        OrderID: 'order-uuid-123',
        Amount: '4700',
        // ... inne pola
      }
      
      const validHash = provider.generateHash(webhookParams)
      const isValid = provider.validateHash(webhookParams, validHash)
      
      expect(isValid).toBe(true)
    })
    
    it('zwraca false dla niepoprawnego hasha', () => {
      const webhookParams = {
        ServiceID: 'TEST123',
        OrderID: 'order-uuid-123',
        Amount: '4700'
      }
      
      const isValid = provider.validateHash(webhookParams, 'fake-hash-123')
      
      expect(isValid).toBe(false)
    })
    
    it('zwraca false gdy ktoś zmienił Amount w webhooku', () => {
      const originalParams = {
        ServiceID: 'TEST123',
        OrderID: 'order-uuid-123',
        Amount: '4700'
      }
      
      const validHash = provider.generateHash(originalParams)
      
      // Attacker zmienia kwotę
      const tamperedParams = { ...originalParams, Amount: '100' }
      const isValid = provider.validateHash(tamperedParams, validHash)
      
      expect(isValid).toBe(false)
    })
  })
  
  describe('buildPaymentForm', () => {
    it('zwraca poprawną strukturę formularza dla BLIK', () => {
      const form = provider.buildPaymentForm({
        orderId: 'order-123',
        amount: 47,
        paymentMethod: 'blik',
        blikCode: '111112',
        customerEmail: 'test@example.com',
        description: 'Test payment'
      })
      
      expect(form).toHaveProperty('action', 'https://testpay.autopay.eu/payment')
      expect(form).toHaveProperty('method', 'POST')
      expect(form.fields).toHaveProperty('ServiceID')
      expect(form.fields).toHaveProperty('OrderID', 'order-123')
      expect(form.fields).toHaveProperty('Amount', '4700') // w groszach
      expect(form.fields).toHaveProperty('GatewayID', '509') // BLIK WhiteLabel
      expect(form.fields).toHaveProperty('BlikCode', '111112')
      expect(form.fields).toHaveProperty('Hash')
    })
  })
})
```

---

## 5. Struktura Projektu Testowego

```
unicorns_pwa/
├── tests/
│   ├── e2e/                        # Playwright E2E
│   │   ├── auth.spec.ts
│   │   ├── booking-payment.spec.ts
│   │   ├── admin-crud.spec.ts
│   │   ├── member-zone.spec.ts
│   │   ├── mobile.spec.ts
│   │   └── helpers/
│   │       ├── login.ts
│   │       ├── fixtures.ts
│   │       └── test-data.ts
│   │
│   ├── api/                        # Postman Collections
│   │   ├── payment.postman_collection.json
│   │   ├── webhooks.postman_collection.json
│   │   ├── recurring-activities.postman_collection.json
│   │   └── environments/
│   │       ├── test.postman_environment.json
│   │       └── prod.postman_environment.json
│   │
│   └── integration/                # Vitest Integration
│       ├── database/
│       │   ├── rls-policies.test.ts
│       │   └── constraints.test.ts
│       └── edge-functions/
│           └── local-invoke.test.ts
│
├── frontend/src/
│   ├── utils/__tests__/           # Vitest Unit
│   ├── hooks/__tests__/
│   ├── payment/providers/__tests__/
│   └── components/__tests__/
│
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

---

## 6. Konfiguracja

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.BASE_URL || 'https://unicorns-test.netlify.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60
      }
    }
  },
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:api": "newman run tests/api/payment.postman_collection.json -e tests/api/environments/test.postman_environment.json",
    "test:all": "npm run test:unit && npm run test:e2e && npm run test:api",
    "test:ci": "npm run test:coverage && npm run test:e2e -- --reporter=junit && npm run test:api"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.0",
    "vitest": "^1.4.0",
    "@vitest/ui": "^1.4.0",
    "newman": "^6.1.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^24.0.0"
  }
}
```

---

## 7. CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests with coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: ${{ secrets.TEST_BASE_URL }}
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run API tests
        run: |
          newman run tests/api/payment.postman_collection.json \
            -e tests/api/environments/test.postman_environment.json \
            --reporters cli,json \
            --reporter-json-export newman-results.json
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
```

---

## 8. Plan Wdrożenia (90 dni)

### Faza 1: Fundamenty (Tydzień 1-2)

**Cel:** Setup infrastruktury testowej

- [ ] Dodaj Playwright do projektu (`npm install -D @playwright/test`)
- [ ] Dodaj Vitest (`npm install -D vitest @vitest/ui`)
- [ ] Utwórz strukturę folderów `tests/`
- [ ] Skonfiguruj `playwright.config.ts` i `vitest.config.ts`
- [ ] Dodaj scripts do `package.json`
- [ ] Stwórz pierwszy test E2E (login)
- [ ] Stwórz pierwszy test unit (formatDuration)
- [ ] **Deliverable:** CI/CD green (2 testy przechodzą)

### Faza 2: Testy Krytyczne (Tydzień 3-4)

**Cel:** Pokrycie critical path (10 testów E2E)

- [ ] E2E: Auth flow (rejestracja, login, logout)
- [ ] E2E: Booking + Payment BLIK
- [ ] E2E: Anulowanie rezerwacji
- [ ] E2E: Admin CRUD zajęć
- [ ] E2E: Filtrowanie harmonogramu
- [ ] Unit: Payment providers (hash, validation)
- [ ] Unit: Utils (formatDuration, dates)
- [ ] **Deliverable:** 10 testów E2E + 15 unit = 25 testów

### Faza 3: API i Integration (Tydzień 5-6)

**Cel:** Testy Edge Functions

- [ ] Postman: Payment-initiate
- [ ] Postman: Autopay webhook + deduplication
- [ ] Postman: Validate-registration (race condition)
- [ ] Postman: Generate-recurring-activities
- [ ] Postman: Send-payment-reminders
- [ ] Newman: Automatyzacja w CI/CD
- [ ] **Deliverable:** 15 testów API

### Faza 4: Rozszerzenie (Tydzień 7-10)

**Cel:** Dodatkowe testy E2E i unit

- [ ] E2E: Profil (edycja, zmiana hasła)
- [ ] E2E: Powiadomienia toggles
- [ ] E2E: Strefa członka
- [ ] E2E: Panel trenera
- [ ] E2E: Security (blokady dostępu)
- [ ] E2E: Mobile + PWA
- [ ] Unit: Hooks (usePushNotifications, useAuth)
- [ ] **Deliverable:** +10 E2E, +10 unit = 20 testów

### Faza 5: Stabilizacja (Tydzień 11-12)

**Cel:** Flaky tests fix, dokumentacja

- [ ] Fix niestabilnych testów (retry, waitFor)
- [ ] Dodaj Page Object Model dla lepszej maintainability
- [ ] Dokumentacja: README dla testów
- [ ] Code review wszystkich testów
- [ ] Baseline performance (Lighthouse CI)
- [ ] **Deliverable:** 60+ stabilnych testów, dokumentacja

---

## 9. Metryki Sukcesu

**Po 90 dniach:**

- ✅ **60+ testów automatycznych** (20 E2E, 25 unit, 15 API)
- ✅ **40-50% pokrycia** testami automatycznymi
- ✅ **CI/CD green** na każdym PR
- ✅ **< 5 min** czas wykonania testów w CI
- ✅ **0 flaky tests** (stabilność 95%+)
- ✅ **Dokumentacja** testów dla zespołu

**KPI:**
- Code coverage unit tests: **60%+**
- E2E critical path: **100%** (wszystkie krytyczne scenariusze)
- API endpoints: **80%+** (12/15 Edge Functions)
- Regression detection: **Catch 80%+ bugów** przed produkcją

---

## 10. Koszt i ROI

### Koszt (czas programisty)

- **Setup (Faza 1):** 16h (2 dni)
- **Implementacja (Faza 2-4):** 120h (15 dni)
- **Maintenance:** 8h/miesiąc

**Łącznie:** ~160h (20 dni roboczych)

### ROI

**Oszczędności:**
- Manualny testing 84 scenariuszy: **~8h każda iteracja**
- Automatyczne testy: **5 min każda iteracja**
- **Oszczędność:** 7h 55min na każdą regresję

**Przy 2 regresach/miesiąc:**
- Oszczędność: **16h/miesiąc**
- Zwrot inwestycji: **10 miesięcy**

**Dodatkowe korzyści:**
- Szybsze wykrywanie bugów (immediate feedback)
- Pewność przy refactoring
- Dokumentacja "żywa" (testy = spec)
- Onboarding nowych devs (testy pokazują jak działa system)

---

## 11. Narzędzia i Zasoby

**Dokumentacja:**
- Playwright: https://playwright.dev/
- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/
- Newman: https://learning.postman.com/docs/running-collections/using-newman-cli/

**Kursy (opcjonalnie):**
- Playwright Udemy: "Playwright: Web Automation Testing From Zero to Hero"
- Kent C. Dodds: "Testing JavaScript" (testingjavascript.com)

**CI/CD:**
- GitHub Actions Marketplace: Playwright actions
- Codecov: Coverage reporting

---

**Ostatnia aktualizacja:** 2026-04-26  
**Autor:** Claude Code (AI) + Tomasz Skrzypczyk  
**Następny review:** Co 2 tygodnie (sprint review)
