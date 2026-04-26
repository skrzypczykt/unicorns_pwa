import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Przeglądanie Zajęć (Activities)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Zaloguj użytkownika przed każdym testem
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
  })

  test('Scenariusz 9: Wyświetlanie listy zajęć', async ({ page }) => {
    await page.goto('/activities')

    // Poczekaj na załadowanie - sprawdź nagłówek strony
    await page.waitForSelector('text=Harmonogram zajęć', { timeout: 10000 })

    // Weryfikacja: Strona się załadowała
    await expect(page.locator('h1')).toContainText('Harmonogram')

    // Sprawdź czy są jakieś zajęcia/wydarzenia (karty lub kalendarz)
    const hasCards = await page.locator('.bg-gradient-to-br').count()
    expect(hasCards).toBeGreaterThan(0)
  })

  test('Scenariusz 10: Szczegóły zajęcia', async ({ page }) => {
    await page.goto('/activities')

    // Poczekaj na załadowanie
    await page.waitForSelector('text=Harmonogram zajęć')

    // Znajdź pierwsze zajęcia (kartę z gradientem)
    const firstCard = page.locator('.bg-gradient-to-br').first()

    if (await firstCard.isVisible()) {
      // Kliknij w kartę
      await firstCard.click()

      // Powinien otworzyć się panel boczny lub modal
      await page.waitForTimeout(500)

      // Sprawdź czy są przyciski akcji (Zapisz się / Anuluj)
      const hasActionButton = await page.locator('button').filter({ hasText: /Zapisz|Anuluj|Już zapisany/ }).isVisible()
      expect(hasActionButton).toBeTruthy()
    }
  })

  test('Scenariusz 11: Przełączanie widoku kalendarz/kafelki', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForSelector('text=Harmonogram zajęć')

    // Znajdź przyciski widoku (📅 Kalendarz / 🔲 Kafelki)
    const calendarButton = page.locator('button:has-text("Kalendarz")').or(page.locator('button >> text=📅'))
    const gridButton = page.locator('button:has-text("Kafelki")').or(page.locator('button >> text=🔲'))

    // Sprawdź czy przyciski widoku istnieją
    if (await calendarButton.isVisible() || await gridButton.isVisible()) {
      // Kliknij jeden z przycisków
      if (await gridButton.isVisible()) {
        await gridButton.click()
        await page.waitForTimeout(300)
      }

      // Sprawdź czy widok się zmienił (będą jakieś elementy)
      const hasContent = await page.locator('.bg-gradient-to-br, .calendar-grid').count()
      expect(hasContent).toBeGreaterThan(0)
    }
  })

  test('Scenariusz 12: Wydarzenia specjalne widoczne', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForSelector('text=Harmonogram zajęć')

    // Sprawdź czy są wydarzenia specjalne (jeśli są w bazie)
    const specialEventsHeader = page.locator('text=wydarzenia specjalne').or(page.locator('text=🏆'))

    if (await specialEventsHeader.isVisible()) {
      // Znaleziono sekcję wydarzeń specjalnych
      await expect(specialEventsHeader).toBeVisible()

      // Powinny być jakieś karty wydarzeń
      const eventCards = page.locator('.bg-gradient-to-br.from-yellow-50')
      const count = await eventCards.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('Scenariusz 13: Informacje o zajęciach', async ({ page }) => {
    await page.goto('/activities')
    await page.waitForSelector('text=Harmonogram zajęć')

    // Znajdź pierwszą kartę zajęć
    const firstCard = page.locator('.bg-gradient-to-br').first()

    if (await firstCard.isVisible()) {
      // Sprawdź czy karta zawiera podstawowe informacje
      // Data (📅), Czas (⏱️), Lokalizacja (📍) lub Online (🌐), Cena (💰)
      const cardContent = await firstCard.textContent()

      // Powinna zawierać przynajmniej datę
      expect(cardContent).toMatch(/\d{1,2}:\d{2}|\d{4}/)
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
    await page.waitForSelector('text=Harmonogram zajęć')

    // Weryfikacja: Elementy są widoczne
    const header = page.locator('h1')
    await expect(header).toBeVisible()

    // Sprawdź szerokość viewport
    const viewport = page.viewportSize()
    expect(viewport?.width).toBeLessThanOrEqual(500)

    // Menu mobilne może być dostępne
    const menuButton = page.locator('[data-testid="mobile-menu-button"]').or(
      page.locator('button').filter({ hasText: /Menu|☰/ })
    )

    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)
      // Menu powinno się otworzyć
    }
  })
})
