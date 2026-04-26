import { test, expect } from '@playwright/test'
import { loginUser, logoutUser, generateTestUser, registerUser, TEST_USERS } from '../helpers/auth'

test.describe('Autentykacja (Authentication)', () => {
  test('Scenariusz 2: Logowanie istniejącego użytkownika', async ({ page }) => {
    // Test używa użytkownika z seedowanych danych
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Weryfikacja: Użytkownik zalogowany
    await expect(page.locator('text=Harmonogram')).toBeVisible()
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('Scenariusz 4: Wylogowanie', async ({ page }) => {
    // Setup: Najpierw zaloguj
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Wyloguj
    await logoutUser(page)

    // Weryfikacja: Użytkownik wylogowany
    await expect(page.locator('text=Zaloguj się')).toBeVisible()
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible()
  })

  test('Scenariusz 5: Walidacja - nieprawidłowy email', async ({ page }) => {
    await page.goto('/login')

    // Wpisz nieprawidłowy email
    await page.fill('input[name="email"]', 'nieprawidlowy-email')
    await page.fill('input[name="password"]', TEST_USERS.regular.password)
    await page.click('button:has-text("Zaloguj się")')

    // Weryfikacja: Błąd walidacji
    await expect(page.locator('text=/.*nieprawidłowy.*email.*/i')).toBeVisible({ timeout: 5000 })
  })

  test('Scenariusz 6: Walidacja - za krótkie hasło', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', '123') // za krótkie

    // Sprawdź czy przycisk jest disabled lub pojawia się błąd
    const submitButton = page.locator('button:has-text("Zaloguj się")')
    const isDisabled = await submitButton.isDisabled()

    if (!isDisabled) {
      await submitButton.click()
      // Powinien pokazać błąd walidacji
      await expect(page.locator('text=/.*hasło.*krótkie.*/i')).toBeVisible({ timeout: 5000 })
    }
  })

  // Ten test możesz odkomentować jeśli masz backend email testing
  test.skip('Scenariusz 1: Rejestracja nowego użytkownika (wymaga email verification)', async ({ page }) => {
    const user = generateTestUser()

    await registerUser(page, user)

    // Weryfikacja: Komunikat o wysłaniu emaila
    await expect(page.locator('text=Sprawdź swoją skrzynkę email')).toBeVisible()

    // TODO: W pełnej implementacji:
    // 1. Pobierz link aktywacyjny z email testing service (np. MailHog)
    // 2. Otwórz link
    // 3. Zaloguj się nowymi credentials
  })
})

test.describe('Błędy autentykacji', () => {
  test('Nieprawidłowe hasło - komunikat błędu', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', TEST_USERS.regular.email)
    await page.fill('input[name="password"]', 'ZłeHasło123!')
    await page.click('button:has-text("Zaloguj się")')

    // Weryfikacja: Błąd logowania
    await expect(page.locator('text=/.*nieprawidłowe.*hasło.*/i').or(
      page.locator('text=/.*błąd.*logowania.*/i')
    )).toBeVisible({ timeout: 5000 })
  })

  test('Nieistniejące konto', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'nieistniejacy@example.com')
    await page.fill('input[name="password"]', 'TestPass123!')
    await page.click('button:has-text("Zaloguj się")')

    // Weryfikacja: Błąd
    await expect(page.locator('text=/.*nie.*znaleziono.*/i').or(
      page.locator('text=/.*błąd.*/i')
    )).toBeVisible({ timeout: 5000 })
  })
})
