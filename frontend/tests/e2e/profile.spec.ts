import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Profil Użytkownika (User Profile)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
    await page.goto('/profile')
  })

  test('Scenariusz 29: Edycja imienia i nazwiska', async ({ page }) => {
    // Sprawdź czy jesteśmy na stronie profilu
    await expect(page.locator('h1:has-text("Profil")')).toBeVisible()

    // Znajdź pole "Imię i nazwisko"
    const nameInput = page.locator('[data-testid="name-input"]')
    await nameInput.clear()
    await nameInput.fill('Jan Testowy')

    // Zapisz zmiany
    await page.click('[data-testid="save-profile-button"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Zapisano/i')).toBeVisible()

    // Odśwież i sprawdź czy się zachowało
    await page.reload()
    await expect(nameInput).toHaveValue('Jan Testowy')
  })

  test('Scenariusz 30: Edycja numeru telefonu', async ({ page }) => {
    const phoneInput = page.locator('[data-testid="phone-input"]')
    await phoneInput.clear()
    await phoneInput.fill('+48 123 456 789')

    await page.click('[data-testid="save-profile-button"]')

    await expect(page.locator('text=/Zapisano/i')).toBeVisible()

    await page.reload()
    await expect(phoneInput).toHaveValue('+48 123 456 789')
  })

  test('Scenariusz 31: Zmiana hasła', async ({ page }) => {
    // Kliknij "Zmień hasło"
    await page.click('[data-testid="change-password-button"]')

    // Wypełnij formularz
    await page.fill('[data-testid="current-password"]', TEST_USERS.regular.password)
    await page.fill('[data-testid="new-password"]', 'NewPassword123!')
    await page.fill('[data-testid="confirm-password"]', 'NewPassword123!')

    // Zapisz
    await page.click('[data-testid="submit-password-change"]')

    // Sprawdź sukces
    await expect(page.locator('text=/Hasło zmienione/i')).toBeVisible()

    // Wyloguj i zaloguj nowym hasłem
    await page.click('[data-testid="logout-button"]')
    await loginUser(page, TEST_USERS.regular.email, 'NewPassword123!')

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

    // Przywróć stare hasło (cleanup)
    await page.goto('/profile')
    await page.click('[data-testid="change-password-button"]')
    await page.fill('[data-testid="current-password"]', 'NewPassword123!')
    await page.fill('[data-testid="new-password"]', TEST_USERS.regular.password)
    await page.fill('[data-testid="confirm-password"]', TEST_USERS.regular.password)
    await page.click('[data-testid="submit-password-change"]')
  })

  test('Scenariusz 32: Powiadomienia email - wyłączenie', async ({ page }) => {
    // Znajdź checkbox powiadomień email
    const emailNotifications = page.locator('[data-testid="email-notifications-toggle"]')

    // Zapamiętaj stan początkowy
    const wasChecked = await emailNotifications.isChecked()

    // Zmień stan
    await emailNotifications.click()

    // Zapisz
    await page.click('[data-testid="save-profile-button"]')

    await expect(page.locator('text=/Zapisano/i')).toBeVisible()

    // Odśwież i sprawdź
    await page.reload()

    if (wasChecked) {
      await expect(emailNotifications).not.toBeChecked()
    } else {
      await expect(emailNotifications).toBeChecked()
    }

    // Przywróć stan początkowy
    await emailNotifications.click()
    await page.click('[data-testid="save-profile-button"]')
  })

  test('Scenariusz 34: Dialog usunięcia konta', async ({ page }) => {
    // Przewiń do przycisku usunięcia konta
    await page.locator('[data-testid="delete-account-button"]').scrollIntoViewIfNeeded()

    // Kliknij
    await page.click('[data-testid="delete-account-button"]')

    // Sprawdź czy pojawił się dialog ostrzegawczy
    await expect(page.locator('[data-testid="delete-account-dialog"]')).toBeVisible()

    // Sprawdź tekst ostrzeżenia
    await expect(page.locator('text=/nieodwracalne/i')).toBeVisible()

    // Anuluj (NIE usuwamy konta w teście!)
    await page.click('[data-testid="cancel-delete"]')

    // Dialog powinien zniknąć
    await expect(page.locator('[data-testid="delete-account-dialog"]')).not.toBeVisible()
  })

  test('Scenariusz 35: Historia płatności', async ({ page }) => {
    // Przejdź do zakładki "Historia płatności"
    await page.click('[data-testid="payment-history-tab"]')

    // Sprawdź nagłówek
    await expect(page.locator('h2:has-text("Historia Płatności")')).toBeVisible()

    // Sprawdź kolumny tabeli
    await expect(page.locator('text=/Data/i')).toBeVisible()
    await expect(page.locator('text=/Opis/i')).toBeVisible()
    await expect(page.locator('text=/Kwota/i')).toBeVisible()
    await expect(page.locator('text=/Status/i')).toBeVisible()

    // Jeśli są transakcje, sprawdź pierwszą
    const transactions = page.locator('[data-testid="transaction-item"]')

    if (await transactions.count() > 0) {
      const firstTransaction = transactions.first()

      await expect(firstTransaction.locator('[data-testid="transaction-date"]')).toBeVisible()
      await expect(firstTransaction.locator('[data-testid="transaction-amount"]')).toBeVisible()

      // WAŻNE: NIE sprawdzamy salda (zgodnie z CLAUDE.md)
      await expect(page.locator('[data-testid="balance-display"]')).not.toBeVisible()
    }
  })
})
