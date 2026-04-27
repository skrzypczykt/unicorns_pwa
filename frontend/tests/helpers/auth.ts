import { Page } from '@playwright/test'

/**
 * Helper functions dla autentykacji w testach E2E
 */

export interface TestUser {
  email: string
  password: string
  fullName: string
}

/**
 * Generuje unikalnego użytkownika testowego
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now()
  return {
    email: `test${timestamp}@unicorns-test.local`,
    password: 'TestPass123!',
    fullName: 'Test User',
  }
}

/**
 * Rejestruje nowego użytkownika
 * UWAGA: Wymaga ręcznego kliknięcia linku aktywacyjnego z emaila
 * W prawdziwym scenariuszu trzeba użyć backdoor API lub email testing service
 */
export async function registerUser(page: Page, user: TestUser) {
  await page.goto('/')
  await page.click('text=Zaloguj się / Zarejestruj')
  await page.click('text=Nie masz konta? Zarejestruj się')

  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="passwordConfirm"]', user.password)
  await page.fill('input[name="fullName"]', user.fullName)
  await page.check('input[name="acceptTerms"]')

  await page.click('button:has-text("Zarejestruj się")')

  // Poczekaj na komunikat sukcesu
  await page.waitForSelector('text=Sprawdź swoją skrzynkę email', { timeout: 10000 })
}

/**
 * Loguje użytkownika
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button:has-text("Zaloguj się")')

  // Poczekaj na przekierowanie (może być na / lub /harmonogram)
  await page.waitForURL(/\/(harmonogram|activities)?$/, { timeout: 10000 })
}

/**
 * Wylogowuje użytkownika
 */
export async function logoutUser(page: Page) {
  // Kliknij na menu użytkownika (imię w prawym górnym rogu)
  await page.locator('[data-testid="user-menu"]').click()
  await page.click('text=Wyloguj')

  // Jeśli jest dialog potwierdzenia
  const confirmButton = page.locator('button:has-text("Potwierdź")')
  if (await confirmButton.isVisible()) {
    await confirmButton.click()
  }

  // Poczekaj na przekierowanie do strony głównej
  await page.waitForURL('/', { timeout: 5000 })
}

/**
 * Sprawdza czy użytkownik jest zalogowany
 */
export async function isUserLoggedIn(page: Page): Promise<boolean> {
  const userMenu = page.locator('[data-testid="user-menu"]')
  const loginButton = page.locator('text=Zaloguj się')

  return (await userMenu.isVisible()) && !(await loginButton.isVisible())
}

/**
 * Pobierz hasło z zmiennej środowiskowej
 * UWAGA: Hasło musi być ustawione w .env.test (lokalnie) lub w GitHub Secrets (CI)
 */
const getTestPassword = (): string => {
  const password = process.env.TEST_USER_PASSWORD
  if (!password) {
    throw new Error(
      'TEST_USER_PASSWORD not set. Create .env.test file with TEST_USER_PASSWORD=your_password'
    )
  }
  return password
}

/**
 * Użytkownicy testowi
 * UWAGA: Te konta muszą istnieć w bazie testowej (utworzone przez seed-test-env.sql)
 */
export const TEST_USERS = {
  regular: {
    email: 'test.user@unicorns-test.local',
    password: getTestPassword(),
    id: 'a1111111-1111-1111-1111-111111111111',
  },
  admin: {
    email: 'admin@unicorns-test.local',
    password: getTestPassword(),
    id: 'a2222222-2222-2222-2222-222222222222',
  },
  trainer: {
    email: 'trainer@unicorns-test.local',
    password: getTestPassword(),
    id: 'a3333333-3333-3333-3333-333333333333',
  },
  member: {
    email: 'member@unicorns-test.local',
    password: getTestPassword(),
    id: 'a4444444-4444-4444-4444-444444444444',
  },
}
