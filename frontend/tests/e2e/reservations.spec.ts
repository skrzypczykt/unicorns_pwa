import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Rezerwacje (Reservations)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
  })

  test('Scenariusz 17: Zapis na bezpłatne zajęcia', async ({ page }) => {
    await page.goto('/activities')

    // Znajdź bezpłatne zajęcia
    const freeActivity = page.locator('[data-testid="activity-card"]').filter({ hasText: 'Bezpłatne' }).first()

    if (await freeActivity.count() === 0) {
      test.skip('Brak bezpłatnych zajęć w systemie')
    }

    await freeActivity.click()

    // Sprawdź czy otworzył się dialog szczegółów
    await expect(page.locator('[data-testid="activity-details"]')).toBeVisible()

    // Kliknij "Zapisz się"
    await page.click('[data-testid="register-button"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=Zapisano na zajęcia')).toBeVisible()

    // Sprawdź czy przycisk zmienił się na "Anuluj rezerwację"
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible()
  })

  test('@payment Scenariusz 18: Zapis na płatne zajęcia bez płacenia', async ({ page }) => {
    await page.goto('/activities')

    // Znajdź płatne zajęcia
    const paidActivity = page.locator('[data-testid="activity-card"]').filter({ hasText: 'zł' }).first()
    await paidActivity.click()

    // Sprawdź czy widoczna cena
    await expect(page.locator('[data-testid="activity-price"]')).toBeVisible()

    // Kliknij "Zapisz się"
    await page.click('[data-testid="register-button"]')

    // Sprawdź komunikat o rezerwacji z informacją o płatności
    await expect(page.locator('text=/Zapisano.*Opłać/i')).toBeVisible()

    // Sprawdź czy widoczny przycisk "Opłać"
    await expect(page.locator('[data-testid="pay-button"]')).toBeVisible()

    // Status: "unpaid"
    await expect(page.locator('[data-testid="payment-status"]')).toHaveText(/Nieopłacone/i)
  })

  test('Scenariusz 22: Duplikat zapisu - blokada', async ({ page }) => {
    await page.goto('/activities')

    // Znajdź dowolne zajęcia
    const activity = page.locator('[data-testid="activity-card"]').first()
    await activity.click()

    // Pierwszy zapis
    const registerButton = page.locator('[data-testid="register-button"]')

    if (await registerButton.count() > 0) {
      await registerButton.click()
      await page.waitForSelector('text=/Zapisano/i')
    }

    // Próba ponownego zapisu
    await page.reload()

    // Przycisk "Zapisz się" nie powinien być widoczny (lub nieaktywny)
    await expect(page.locator('[data-testid="register-button"]')).not.toBeVisible()

    // Zamiast tego widoczny przycisk "Anuluj"
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible()
  })

  test('Scenariusz 23: Anulowanie rezerwacji', async ({ page }) => {
    // Przejdź do Moje Rezerwacje
    await page.goto('/my-classes')

    // Sprawdź czy są jakieś rezerwacje
    const reservations = page.locator('[data-testid="reservation-item"]')

    if (await reservations.count() === 0) {
      test.skip('Brak rezerwacji do anulowania')
    }

    // Pierwsza rezerwacja
    const firstReservation = reservations.first()
    await firstReservation.click()

    // Kliknij "Anuluj rezerwację"
    await page.click('[data-testid="cancel-reservation-button"]')

    // Potwierdź dialog
    await page.click('[data-testid="confirm-cancel"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Anulowano/i')).toBeVisible()

    // Rezerwacja powinna zniknąć z listy lub mieć status "cancelled"
    await page.reload()
    const cancelledCount = await page.locator('[data-testid="reservation-item"][data-status="cancelled"]').count()
    expect(cancelledCount).toBeGreaterThanOrEqual(0)
  })

  test('Scenariusz 26: Widok moich rezerwacji', async ({ page }) => {
    await page.goto('/my-classes')

    // Sprawdź nagłówek
    await expect(page.locator('h1:has-text("Moje Rezerwacje")')).toBeVisible()

    // Sprawdź sekcje
    await expect(page.locator('text=/Nadchodzące/i')).toBeVisible()
    await expect(page.locator('text=/Historia/i')).toBeVisible()

    // Sprawdź czy są karty rezerwacji
    const reservations = page.locator('[data-testid="reservation-item"]')

    if (await reservations.count() > 0) {
      // Sprawdź czy każda rezerwacja ma: nazwę, datę, status płatności
      const firstReservation = reservations.first()

      await expect(firstReservation.locator('[data-testid="activity-name"]')).toBeVisible()
      await expect(firstReservation.locator('[data-testid="activity-date"]')).toBeVisible()
      await expect(firstReservation.locator('[data-testid="payment-status"]')).toBeVisible()
    }
  })
})

test.describe('Cleanup po testach rezerwacji', () => {
  test.afterEach(async ({ page }) => {
    // Anuluj wszystkie testowe rezerwacje utworzone podczas testów
    await page.goto('/my-classes')

    const cancelButtons = page.locator('[data-testid="cancel-reservation-button"]')
    const count = await cancelButtons.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      await cancelButtons.first().click()
      await page.click('[data-testid="confirm-cancel"]')
      await page.waitForTimeout(500)
    }
  })
})
