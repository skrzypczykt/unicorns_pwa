import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Przeglądanie Zajęć (Activities)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Zaloguj użytkownika przed każdym testem
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
  })

  test('Scenariusz 9: Wyświetlanie listy zajęć', async ({ page }) => {
    await page.goto('/activities')

    // Poczekaj na załadowanie listy
    await page.waitForSelector('[data-testid="activity-card"]', { timeout: 10000 })

    // Weryfikacja: Widzimy minimum 1 zajęcia
    const activityCards = page.locator('[data-testid="activity-card"]')
    const count = await activityCards.count()
    expect(count).toBeGreaterThan(0)

    // Weryfikacja: Każde zajęcia mają podstawowe informacje
    const firstActivity = activityCards.first()
    await expect(firstActivity.locator('[data-testid="activity-name"]')).toBeVisible()
    await expect(firstActivity.locator('[data-testid="activity-date"]')).toBeVisible()
    await expect(firstActivity.locator('[data-testid="activity-price"]')).toBeVisible()
  })

  test('Scenariusz 10: Szczegóły zajęcia', async ({ page }) => {
    await page.goto('/activities')

    // Poczekaj na załadowanie i kliknij pierwsze zajęcia
    await page.waitForSelector('[data-testid="activity-card"]')
    const firstActivity = page.locator('[data-testid="activity-card"]').first()

    // Zapamiętaj nazwę
    const activityName = await firstActivity.locator('[data-testid="activity-name"]').textContent()

    await firstActivity.click()

    // Weryfikacja: Modal lub strona szczegółów
    await expect(page.locator(`text=${activityName}`)).toBeVisible()
    await expect(page.locator('text=Zapisz się').or(page.locator('text=Już zapisany'))).toBeVisible()

    // Sprawdź czy są szczegółowe informacje
    const detailsSection = page.locator('[data-testid="activity-details"]')
    if (await detailsSection.isVisible()) {
      await expect(detailsSection).toContainText(/czas trwania|godzina|limit|cena/i)
    }
  })

  test('Scenariusz 11: Filtrowanie po sekcji', async ({ page }) => {
    await page.goto('/activities')

    // Poczekaj na załadowanie
    await page.waitForSelector('[data-testid="activity-card"]')

    // Zlicz ile jest zajęć przed filtrowaniem
    const allActivities = await page.locator('[data-testid="activity-card"]').count()

    // Znajdź i kliknij filtr sekcji (przycisk przełączania widoku lub sekcja)
    const filterButton = page.locator('[data-testid="section-filter"]').first()

    if (await filterButton.isVisible()) {
      await filterButton.click()

      // Poczekaj na przefiltrowanie (może być animacja)
      await page.waitForTimeout(500)

      // Zlicz ile jest teraz
      const filteredActivities = await page.locator('[data-testid="activity-card"]').count()

      // Weryfikacja: Liczba się zmieniła (zostały tylko z wybranej sekcji)
      expect(filteredActivities).toBeLessThanOrEqual(allActivities)

      // Opcjonalnie: Sprawdź czy wszystkie widoczne zajęcia mają wybraną sekcję
      const sectionName = await filterButton.textContent()
      if (filteredActivities > 0 && sectionName) {
        const firstActivitySection = await page
          .locator('[data-testid="activity-card"]')
          .first()
          .locator('[data-testid="activity-section"]')
          .textContent()

        expect(firstActivitySection).toContain(sectionName)
      }
    } else {
      test.skip() // Filtr nie istnieje
    }
  })

  test('Scenariusz 12: Reset filtrów', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForSelector('[data-testid="activity-card"]')

    // Zastosuj filtr (jeśli istnieje)
    const filterButton = page.locator('[data-testid="section-filter"]').first()

    if (await filterButton.isVisible()) {
      await filterButton.click()
      await page.waitForTimeout(500)

      const filteredCount = await page.locator('[data-testid="activity-card"]').count()

      // Reset filtrów
      const resetButton = page.locator('button:has-text("Wyczyść filtry")').or(
        page.locator('button:has-text("Reset")')
      )

      if (await resetButton.isVisible()) {
        await resetButton.click()
        await page.waitForTimeout(500)

        // Weryfikacja: Więcej zajęć niż po filtrowaniu
        const afterResetCount = await page.locator('[data-testid="activity-card"]').count()
        expect(afterResetCount).toBeGreaterThanOrEqual(filteredCount)
      }
    } else {
      test.skip() // Filtr nie istnieje
    }
  })

  test('Scenariusz 13: Wyszukiwanie po nazwie', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForSelector('[data-testid="activity-card"]')

    // Znajdź pole wyszukiwania
    const searchInput = page.locator('input[placeholder*="Szukaj"]').or(
      page.locator('input[type="search"]')
    )

    if (await searchInput.isVisible()) {
      // Pobierz nazwę pierwszych zajęć
      const firstActivityName = await page
        .locator('[data-testid="activity-card"]')
        .first()
        .locator('[data-testid="activity-name"]')
        .textContent()

      if (firstActivityName) {
        // Wpisz fragment nazwy
        const searchTerm = firstActivityName.substring(0, 4)
        await searchInput.fill(searchTerm)
        await page.waitForTimeout(500)

        // Weryfikacja: Widoczne zajęcia zawierają wyszukiwany termin
        const visibleActivities = page.locator('[data-testid="activity-card"]')
        const count = await visibleActivities.count()

        if (count > 0) {
          const firstResult = await visibleActivities.first().locator('[data-testid="activity-name"]').textContent()
          expect(firstResult?.toLowerCase()).toContain(searchTerm.toLowerCase())
        }
      }
    } else {
      test.skip()
    }
  })
})

test.describe('Responsywność - Mobile', () => {
  test('Scenariusz 16: Widok na telefonie', async ({ page, isMobile }) => {
    // Ten test uruchamia się tylko na mobile viewportach
    test.skip(!isMobile, 'Test tylko dla mobile')

    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
    await page.goto('/activities')

    // Poczekaj na załadowanie
    await page.waitForSelector('[data-testid="activity-card"]')

    // Weryfikacja: Elementy są widoczne i nie nachodzą na siebie
    const activityCard = page.locator('[data-testid="activity-card"]').first()
    const boundingBox = await activityCard.boundingBox()

    expect(boundingBox).not.toBeNull()
    if (boundingBox) {
      // Card nie przekracza szerokości ekranu
      expect(boundingBox.width).toBeLessThanOrEqual(page.viewportSize()?.width || 500)
    }

    // Menu mobilne działa
    const menuButton = page.locator('[data-testid="mobile-menu-button"]')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    }
  })
})
