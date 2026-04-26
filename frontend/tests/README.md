# Testy Automatyczne - Unicorns PWA

## Quick Start

```bash
# Zainstaluj zależności (jednorazowo)
cd frontend
npm install

# Zainstaluj przeglądarki Playwright (jednorazowo)
npm run playwright:install

# Uruchom testy jednostkowe
npm run test:unit

# Uruchom testy E2E
npm run test:e2e

# Uruchom wszystkie testy
npm run test:all
```

## Struktura Testów

```
tests/
├── e2e/                    # Testy End-to-End (Playwright)
│   ├── auth.spec.ts       # Testy autentykacji
│   └── activities.spec.ts # Testy harmonogramu
├── helpers/               # Funkcje pomocnicze
│   └── auth.ts           # Auth helpers (login, logout, etc.)
└── setup.ts              # Konfiguracja Vitest

src/
└── utils/__tests__/      # Testy jednostkowe
    └── formatDuration.test.ts
```

## Komendy

### Testy Jednostkowe (Vitest)

```bash
# Uruchom raz
npm run test:unit

# Watch mode (auto-rerun przy zmianach)
npm run test:unit:watch

# UI interaktywne
npm run test:ui

# Coverage report
npm run test:coverage
```

### Testy E2E (Playwright)

```bash
# Uruchom wszystkie testy E2E (headless)
npm run test:e2e

# Uruchom w trybie UI (debug)
npm run test:e2e:ui

# Uruchom z widoczną przeglądarką
npm run test:e2e:headed

# Debug mode (step-by-step)
npm run test:e2e:debug

# Zobacz raport HTML z ostatniego uruchomienia
npm run test:e2e:report

# Uruchom tylko jeden plik
npx playwright test tests/e2e/auth.spec.ts

# Uruchom tylko jeden test po nazwie
npx playwright test -g "Logowanie istniejącego użytkownika"

# Uruchom tylko na Chrome (bez Firefox/Safari)
npx playwright test --project=chromium
```

## Pisanie Nowych Testów

### Test E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test'
import { loginUser } from '../helpers/auth'

test('Nazwa testu', async ({ page }) => {
  // Setup
  await loginUser(page, 'test@unicorns-test.local', 'TestPass123!')
  
  // Action
  await page.goto('/activities')
  await page.click('[data-testid="activity-card"]')
  
  // Assert
  await expect(page.locator('text=Zapisz się')).toBeVisible()
})
```

### Test Unit (Vitest)

```typescript
import { describe, it, expect } from 'vitest'
import { formatDuration } from '../formatDuration'

describe('formatDuration', () => {
  it('formatuje 90 minut', () => {
    expect(formatDuration(90)).toBe('90 min')
  })
})
```

## Data Test IDs

Aby testy były stabilne, używaj `data-testid` zamiast selektorów CSS/text:

```tsx
// ✅ Dobre
<div data-testid="activity-card">
  <h3 data-testid="activity-name">Fitness</h3>
</div>

// ❌ Unikaj
<div className="card-123">
  <h3>Fitness</h3>
</div>
```

W testach:

```typescript
// ✅ Stabilny
await page.locator('[data-testid="activity-card"]').click()

// ❌ Kruchy (zmiana klasy/tekstu zepsuje test)
await page.locator('.card-123').click()
await page.click('text=Fitness') // co jeśli tekst się zmieni?
```

## Troubleshooting

### Playwright: "Browser not found"

```bash
npm run playwright:install
```

### Vitest: "Cannot find module"

```bash
npm install
```

### E2E Test timeout

Zwiększ timeout w `playwright.config.ts`:

```typescript
timeout: 60000, // 60 sekund
```

### Test przechodzi lokalnie, failuje w CI

Prawdopodobnie race condition. Dodaj explicit waits:

```typescript
// ❌ Może failować
await page.click('button')
expect(page.locator('.result')).toBeVisible()

// ✅ Lepiej
await page.click('button')
await page.waitForSelector('.result', { timeout: 5000 })
expect(page.locator('.result')).toBeVisible()
```

## CI/CD

Testy uruchamiają się automatycznie na każdym:
- Push do `main`
- Push do `develop`  
- Pull Request

Zobacz status: [GitHub Actions](./.github/workflows/tests.yml)

## Coverage

Po uruchomieniu `npm run test:coverage` raport znajduje się w:
- `coverage/index.html` - otwórz w przeglądarce

Minimalne thresholdy (definiowane w `vitest.config.ts`):
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

## Dobre Praktyki

1. **Każdy test jest niezależny** - nie polegaj na kolejności wykonania
2. **Setup w beforeEach** - nie duplikuj kodu logowania
3. **Używaj helpers** - wydziel powtarzalne akcje (login, logout)
4. **Testuj happy path + błędy** - nie tylko "działa", ale też "nie działa gdy błąd"
5. **Data-testid** - stabilne selektory
6. **Screenshot on failure** - automatyczne (Playwright)
7. **Retry w CI** - Playwright automatycznie retry 2x w CI

## Mapowanie na Scenariusze Manualne

| Test E2E | Scenariusz Manualny |
|----------|-------------------|
| `auth.spec.ts` | Scenariusze 1-8 |
| `activities.spec.ts` | Scenariusze 9-16 |

Pełna lista: `docs/guides/MANUAL_TESTING_SCENARIOS.md`

## Pomoc

- Playwright Docs: https://playwright.dev
- Vitest Docs: https://vitest.dev
- Testing Library: https://testing-library.com

**Pytania?** Otwórz Issue na GitHub lub napisz do Tomasz Skrzypczyk.
