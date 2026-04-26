# Strategia Testów - Unicorns PWA

## Przegląd

Kompleksowa strategia testowania aplikacji Unicorns PWA na różnych poziomach: jednostkowym, integracyjnym i E2E.

**Cel:** Zapewnić stabilność, bezpieczeństwo i poprawność działania przed wdrożeniem na produkcję.

---

## Piramida Testów

```
         /\
        /E2\      ← Mało (critical flows)
       /----\
      / INT  \    ← Średnio (API, DB, Auth)
     /--------\
    /   UNIT   \  ← Dużo (utils, helpers, logic)
   /____________\
```

### Proporcje (docelowe):
- **Unit:** 60% (szybkie, izolowane)
- **Integration:** 30% (API + DB)
- **E2E:** 10% (critical user journeys)

---

## 1. Testy Jednostkowe (Unit Tests)

### Co testujemy:
- **Utils** (`frontend/src/utils/`)
  - `formatDuration.ts`
  - `formatDate.ts`
  - `generateSlug.ts`
  - `validateEmail.ts`
  
- **Helper functions**
  - Payment hash calculation
  - Slug generation
  - Price formatting

- **React hooks** (custom)
  - `useAuth.ts`
  - `useRegistration.ts`

### Framework: Vitest + React Testing Library

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Config:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
})
```

### Przykład: Test Utils

```typescript
// src/utils/formatDuration.test.ts
import { describe, it, expect } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats minutes <= 120 as minutes', () => {
    expect(formatDuration(60)).toBe('60 min')
    expect(formatDuration(90)).toBe('90 min')
  })

  it('formats > 120 minutes as hours', () => {
    expect(formatDuration(180)).toBe('3h')
    expect(formatDuration(150)).toBe('2h 30min')
  })

  it('formats >= 24h as days', () => {
    expect(formatDuration(1440)).toBe('1 dzień')
    expect(formatDuration(2880)).toBe('2 dni')
    expect(formatDuration(1500)).toBe('1 dzień 1h')
  })
})
```

**Uruchom:**
```bash
npm run test:unit
```

---

## 2. Testy Integracyjne (Integration Tests)

### Co testujemy:
- **Supabase Edge Functions**
  - `payment-initiate` (hash generation, transaction creation)
  - `autopay-webhook` (hash verification, deduplication)
  - `generate-recurring-activities` (instance generation)

- **Database operations**
  - RLS policies
  - Triggers (updated_at, auto_create_user)
  - Constraints (unique, check)

- **Auth flow**
  - Signup → email verification → login
  - Password reset
  - Session management

### Framework: Deno Test (dla Edge Functions)

**Przykład: Test Edge Function**

```typescript
// supabase/functions/payment-initiate/payment-initiate.test.ts
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.test('payment-initiate: generates correct hash', async () => {
  const serviceId = '1013900'
  const orderId = 'test123'
  const amount = '50.00'
  const customerEmail = 'test@example.com'
  const sharedKey = 'test-key'

  const hashInput = `${serviceId}|${orderId}|${amount}|${customerEmail}|${sharedKey}`
  
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(hashInput)
  )
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  assertEquals(hash.length, 64) // SHA-256 = 64 hex chars
})

Deno.test('autopay-webhook: verifies hash correctly', async () => {
  // Test hash verification logic
  const data = {
    serviceId: '1013900',
    orderId: 'abc123',
    // ...
  }
  
  const isValid = await verifyHash(data, 'shared-key')
  assertEquals(isValid, true)
})
```

**Uruchom:**
```bash
deno test --allow-net --allow-env supabase/functions/
```

### Database Integration Tests

**Framework:** pgTAP (PostgreSQL testing)

```sql
-- supabase/tests/rls_policies.test.sql
BEGIN;
SELECT plan(3);

-- Test: Public can read published activities
SELECT ok(
  EXISTS(
    SELECT 1 FROM activities 
    WHERE status = 'published' 
    AND is_recurring = false
  ),
  'Public can read published activities'
);

-- Test: User can only see own registrations
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '123-user-id';

SELECT is(
  (SELECT COUNT(*) FROM registrations WHERE user_id != '123-user-id'),
  0::bigint,
  'User cannot see other users registrations'
);

SELECT * FROM finish();
ROLLBACK;
```

**Uruchom:**
```bash
psql -h localhost -U postgres -d postgres -f supabase/tests/rls_policies.test.sql
```

---

## 3. Testy End-to-End (E2E)

### Co testujemy:
- **Critical User Journeys:**
  - Rejestracja użytkownika
  - Zapis na zajęcia
  - Płatność za zajęcia (BLIK, PayByLink)
  - Odwołanie rezerwacji
  - Admin dodaje nowe zajęcia

### Framework: Playwright

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Config:** `playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
})
```

### Przykład: E2E Test

```typescript
// e2e/registration-flow.spec.ts
import { test, expect } from '@playwright/test'

test('User can register for activity and pay', async ({ page }) => {
  // 1. Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@unicorns.test')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/activities')

  // 2. Find and click activity
  await page.click('text=Fitness dla dzieci')
  await page.click('button:has-text("Zapisz się")')
  
  await expect(page.locator('text=Zapisano na zajęcia')).toBeVisible()

  // 3. Go to My Classes
  await page.goto('/my-classes')
  
  // 4. Pay for activity
  await page.click('button:has-text("Opłać")')
  
  // 5. Select BLIK
  await page.click('text=BLIK')
  await page.fill('[name="blikCode"]', '111112') // Test success code
  await page.click('button:has-text("Zapłać")')
  
  // 6. Redirect to Autopay (mocked in test env)
  // Wait for redirect back
  await page.waitForURL(/payment-success/, { timeout: 10000 })
  
  // 7. Verify success
  await expect(page.locator('text=Płatność potwierdzona')).toBeVisible()
})

test('Admin can create recurring activity', async ({ page }) => {
  // Login as admin
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@unicorns.test')
  await page.fill('[name="password"]', 'admin123')
  await page.click('button[type="submit"]')
  
  // Navigate to admin panel
  await page.goto('/admin/activities')
  await page.click('button:has-text("Dodaj zajęcia")')
  
  // Fill form
  await page.fill('[name="name"]', 'Test Dance Class')
  await page.selectOption('[name="activity_type_id"]', { label: 'Dance' })
  await page.click('[name="is_recurring"]')
  
  // Set recurrence
  await page.selectOption('[name="recurrence_day_of_week"]', 'Monday')
  await page.fill('[name="recurrence_time"]', '18:00')
  
  await page.click('button:has-text("Zapisz")')
  
  await expect(page.locator('text=Zajęcia utworzone')).toBeVisible()
})
```

**Uruchom:**
```bash
npx playwright test
npx playwright test --ui  # Interactive mode
```

---

## 4. Testy Manualne (Pre-Production Checklist)

### 4.1 Funkcjonalności Podstawowe

- [ ] **Rejestracja użytkownika**
  - Formularz działa
  - Email verification wysłany
  - Link aktywacyjny działa
  - Po aktywacji można się zalogować

- [ ] **Logowanie**
  - Email + password
  - Remember me
  - Logout
  - Session persistence

- [ ] **Przeglądanie zajęć**
  - Lista zajęć ładuje się
  - Filtry działają (data, sekcja)
  - Zdjęcia się wyświetlają
  - Responsywność (mobile/desktop)

- [ ] **Zapis na zajęcia**
  - Button "Zapisz się" działa
  - Walidacja limitu miejsc
  - Confirmation toast
  - Pojawia się w "Moje Rezerwacje"

### 4.2 Płatności (Test Environment)

- [ ] **BLIK Payment**
  - Modal wyboru metody otwiera się
  - Input kodu BLIK działa
  - Kod testowy `111112` → Success
  - Kod `111121` → Failure message
  - Redirect do Autopay
  - Redirect z powrotem do /payment-success
  - Status "Płatność potwierdzona"

- [ ] **PayByLink**
  - Wybór PayByLink
  - Redirect do Autopay
  - Wybór banku TEST 106
  - Klik "Zapłać" → Success
  - Webhook ITN przychodzi (check DB)
  - payment_status = 'paid'

- [ ] **Deduplication**
  - Próba ponownej płatności za tą samą rezerwację
  - Button "Opłać" ukryty gdy paid
  - Brak duplikatów w transactions

### 4.3 Admin Panel

- [ ] **Zarządzanie zajęciami**
  - Dodawanie nowych zajęć
  - Edycja istniejących
  - Usuwanie (soft delete?)
  - Upload zdjęcia

- [ ] **Recurring Activities**
  - Tworzenie template
  - Generowanie instancji (manual trigger)
  - Cron działa (check logs)

- [ ] **Users Management**
  - Lista użytkowników
  - Zmiana roli (user → trainer)
  - Member zone access

### 4.4 Performance

- [ ] **Lighthouse Score**
  - Performance > 90
  - Accessibility > 95
  - Best Practices > 90
  - SEO > 90

- [ ] **Load Time**
  - FCP < 1.5s
  - LCP < 2.5s
  - TTI < 3.5s

- [ ] **Network**
  - Images optimized (WebP)
  - Lazy loading works
  - CDN caching (check headers)

### 4.5 Security

- [ ] **RLS Policies**
  - User can't see other users' data
  - Admin can see all
  - Trainer can manage assigned sections

- [ ] **Auth**
  - No JWT in localStorage (httpOnly cookie?)
  - Session timeout (30 min)
  - Password requirements enforced

- [ ] **Payment Security**
  - Hash verification works
  - Webhook signature valid
  - No sensitive data in frontend

---

## 5. Automated Testing Pipeline (CI/CD)

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - name: Apply migrations
        run: |
          for file in supabase/migrations/*.sql; do
            psql postgresql://postgres:postgres@localhost:5432/postgres -f "$file"
          done
      - name: Run integration tests
        run: npm run test:integration

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6. Test Data Management

### Seed Data dla Testów

```sql
-- supabase/test-seed.sql
-- Dodaj testowych użytkowników
INSERT INTO users (id, email, role) VALUES
  ('test-user-id', 'test@unicorns.test', 'user'),
  ('admin-user-id', 'admin@unicorns.test', 'admin'),
  ('trainer-user-id', 'trainer@unicorns.test', 'trainer');

-- Dodaj testowe sekcje
INSERT INTO activity_types (id, name, slug) VALUES
  ('fitness-id', 'Fitness', 'fitness'),
  ('dance-id', 'Dance', 'dance');

-- Dodaj testowe zajęcia
INSERT INTO activities (id, name, activity_type_id, date_time, status) VALUES
  ('activity-1', 'Test Fitness', 'fitness-id', NOW() + INTERVAL '1 day', 'published');
```

**Uruchom przed testami:**
```bash
psql <test-db-url> -f supabase/test-seed.sql
```

### Cleanup po testach

```sql
-- Clean up test data
DELETE FROM users WHERE email LIKE '%@unicorns.test';
DELETE FROM activities WHERE name LIKE 'Test %';
```

---

## 7. Monitoring i Debugging Testów

### Playwright Trace Viewer

```bash
# Record trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Debug Mode

```typescript
// Pause test at breakpoint
await page.pause()

// Step-by-step
await page.screenshot({ path: 'screenshot.png' })
console.log(await page.content())
```

### Supabase Logs

```bash
# Edge Function logs
npx supabase functions logs autopay-webhook

# Database logs
psql <url> -c "SELECT * FROM pg_stat_activity"
```

---

## 8. Coverage Goals

### Unit Tests: 80%+
```bash
npm run test:unit -- --coverage
```

**Priorytet:**
- Utils: 100%
- Helpers: 90%+
- Hooks: 80%+

### Integration Tests: 60%+
- Critical Edge Functions: 100%
- DB operations: 70%+
- Auth flows: 80%+

### E2E Tests: Critical Paths
- User registration → payment: ✅
- Admin CRUD: ✅
- Recurring activities: ✅

---

## 9. Test Environment Setup

### Local Test DB

```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db reset

# Seed test data
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/test-seed.sql
```

### Environment Variables

```bash
# .env.test
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key>
VITE_AUTOPAY_SERVICE_ID=test-service-id
VITE_AUTOPAY_GATEWAY_URL=https://testpay.autopay.eu/payment
```

---

## 10. Pre-Production Checklist

Przed każdym wdrożeniem na produkcję:

- [ ] Wszystkie testy jednostkowe przechodzą (green)
- [ ] Testy integracyjne przechodzą
- [ ] E2E testy critical paths przechodzą
- [ ] Manual testing checklist wypełniony
- [ ] Lighthouse score > 90 we wszystkich kategoriach
- [ ] Security audit (RLS, auth, payment)
- [ ] Load testing (opcjonalnie, dla dużych zmian)
- [ ] Rollback plan gotowy
- [ ] Monitoring alerts skonfigurowane

**Approval:** Minimum 2 osoby muszą zatwierdzić (code review + QA)

---

## Scripts Package.json

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:integration": "deno test --allow-net --allow-env supabase/functions/",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

**Next Steps:**
1. Setup Vitest + first unit tests (utils)
2. Write integration tests for Edge Functions
3. Setup Playwright + critical E2E flows
4. CI/CD pipeline (GitHub Actions)
5. Pre-production manual checklist automation

---

**Related:**
- [PRODUCTION_DEPLOYMENT.md](../deployment/PRODUCTION_DEPLOYMENT.md)
- [DATABASE_MIGRATIONS.md](../deployment/DATABASE_MIGRATIONS.md)
