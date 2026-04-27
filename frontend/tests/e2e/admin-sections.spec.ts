import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Panel Admina - Zarządzanie Sekcjami', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/sections')
  })

  test('Scenariusz 81: Tworzenie nowej sekcji', async ({ page }) => {
    // Kliknij "Dodaj sekcję"
    await page.click('[data-testid="add-section-button"]')

    // Formularz powinien być widoczny
    await expect(page.locator('[data-testid="section-form"]')).toBeVisible()

    // Wypełnij dane sekcji
    await page.fill('[data-testid="section-name"]', 'E2E Test Section')
    await page.fill('[data-testid="section-description"]', 'This is a test section created by E2E tests')

    // Wybierz kolor
    await page.fill('[data-testid="section-color"]', '#FF5733')

    // Dodaj WhatsApp link
    await page.fill('[data-testid="whatsapp-group-url"]', 'https://chat.whatsapp.com/test123')

    // Upload obrazu (opcjonalne - skip jeśli brak)
    const imageInput = page.locator('[data-testid="section-image-upload"]')
    if (await imageInput.count() > 0) {
      // Skip upload dla uproszczenia testu
    }

    // Zapisz
    await page.click('[data-testid="save-section-button"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Sekcja utworzona/i')).toBeVisible()

    // Sprawdź czy nowa sekcja pojawiła się na liście
    await expect(page.locator('text=E2E Test Section')).toBeVisible()
  })

  test('Scenariusz 82: Edycja sekcji', async ({ page }) => {
    // Znajdź sekcję do edycji
    const sectionCard = page.locator('[data-testid="section-card"]').first()

    // Zapamiętaj oryginalną nazwę
    const originalName = await sectionCard.locator('[data-testid="section-name"]').textContent()

    // Kliknij "Edytuj"
    await sectionCard.locator('[data-testid="edit-section-button"]').click()

    // Formularz edycji
    await expect(page.locator('[data-testid="section-form"]')).toBeVisible()

    // Zmień nazwę
    const nameInput = page.locator('[data-testid="section-name"]')
    await nameInput.clear()
    await nameInput.fill('Edited E2E Section')

    // Zmień opis
    const descInput = page.locator('[data-testid="section-description"]')
    await descInput.clear()
    await descInput.fill('Updated description by E2E test')

    // Zapisz
    await page.click('[data-testid="save-section-button"]')

    // Sprawdź komunikat
    await expect(page.locator('text=/Zaktualizowano/i')).toBeVisible()

    // Sprawdź czy zmiany się zapisały
    await expect(page.locator('text=Edited E2E Section')).toBeVisible()

    // Cleanup: przywróć oryginalną nazwę
    await page.locator('text=Edited E2E Section').click()
    await nameInput.clear()
    await nameInput.fill(originalName || 'Original Section')
    await page.click('[data-testid="save-section-button"]')
  })

  test('Scenariusz 83: Usuwanie pustej sekcji', async ({ page }) => {
    // Najpierw utwórz sekcję do usunięcia
    await page.click('[data-testid="add-section-button"]')
    await page.fill('[data-testid="section-name"]', 'To Delete E2E Section')
    await page.fill('[data-testid="section-description"]', 'Will be deleted')
    await page.fill('[data-testid="section-color"]', '#000000')
    await page.click('[data-testid="save-section-button"]')

    await page.waitForSelector('text=To Delete E2E Section')

    // Znajdź i usuń
    const sectionToDelete = page.locator('[data-testid="section-card"]:has-text("To Delete E2E Section")')
    await sectionToDelete.locator('[data-testid="delete-section-button"]').click()

    // Dialog potwierdzenia
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible()
    await expect(page.locator('text=/Czy na pewno/i')).toBeVisible()

    // Potwierdź
    await page.click('[data-testid="confirm-delete"]')

    // Sprawdź komunikat
    await expect(page.locator('text=/Usunięto/i')).toBeVisible()

    // Sekcja powinna zniknąć
    await expect(page.locator('text=To Delete E2E Section')).not.toBeVisible()
  })

  test('Scenariusz 84: Blokada usuwania sekcji z zajęciami', async ({ page }) => {
    // Znajdź sekcję która ma zajęcia
    const sectionWithActivities = page.locator('[data-testid="section-card"]')
      .filter({ has: page.locator('[data-testid="activities-count"]:not(:has-text("0"))') })
      .first()

    if (await sectionWithActivities.count() === 0) {
      test.skip('Brak sekcji z zajęciami')
    }

    // Kliknij "Usuń"
    await sectionWithActivities.locator('[data-testid="delete-section-button"]').click()

    // Dialog powinien zawierać ostrzeżenie
    await expect(page.locator('text=/zajęcia/i')).toBeVisible()
    await expect(page.locator('text=/Usuń najpierw wszystkie zajęcia/i')).toBeVisible()

    // Przycisk potwierdzenia nieaktywny lub niewidoczny
    const confirmButton = page.locator('[data-testid="confirm-delete"]')

    if (await confirmButton.count() > 0) {
      await expect(confirmButton).toBeDisabled()
    } else {
      await expect(confirmButton).not.toBeVisible()
    }

    // Zamknij dialog
    await page.click('[data-testid="cancel-delete"]')
  })

  test('Wyświetlanie liczby zajęć w sekcji', async ({ page }) => {
    const sections = page.locator('[data-testid="section-card"]')
    const count = await sections.count()

    if (count > 0) {
      const firstSection = sections.first()

      // Sprawdź licznik zajęć
      await expect(firstSection.locator('[data-testid="activities-count"]')).toBeVisible()

      const activitiesCountText = await firstSection.locator('[data-testid="activities-count"]').textContent()

      // Powinno być w formacie "5 zajęć" lub "1 zajęcia"
      expect(activitiesCountText).toMatch(/\d+/)
    }
  })

  test('Widok zajęć danej sekcji', async ({ page }) => {
    // Kliknij na kartę sekcji
    const firstSection = page.locator('[data-testid="section-card"]').first()
    const sectionName = await firstSection.locator('[data-testid="section-name"]').textContent()

    await firstSection.click()

    // Powinien otworzyć się widok szczegółów sekcji
    await expect(page.locator(`h2:has-text("${sectionName}")`)).toBeVisible()

    // Lista zajęć tej sekcji
    await expect(page.locator('[data-testid="section-activities-list"]')).toBeVisible()

    // Zajęcia powinny należeć do tej sekcji
    const activities = page.locator('[data-testid="activity-item"]')
    const activitiesCount = await activities.count()

    if (activitiesCount > 0) {
      // Sprawdź czy każde zajęcia ma nazwę sekcji
      for (let i = 0; i < Math.min(activitiesCount, 3); i++) {
        const activitySection = await activities.nth(i).getAttribute('data-section-name')
        expect(activitySection).toBe(sectionName)
      }
    }
  })

  test('Edycja WhatsApp group URL', async ({ page }) => {
    const section = page.locator('[data-testid="section-card"]').first()

    // Edytuj sekcję
    await section.locator('[data-testid="edit-section-button"]').click()

    // Zmień WhatsApp URL
    const whatsappInput = page.locator('[data-testid="whatsapp-group-url"]')
    await whatsappInput.clear()
    await whatsappInput.fill('https://chat.whatsapp.com/newlink123')

    // Zapisz
    await page.click('[data-testid="save-section-button"]')

    // Sprawdź sukces
    await expect(page.locator('text=/Zaktualizowano/i')).toBeVisible()

    // Sprawdź czy link się zmienił
    await section.locator('[data-testid="edit-section-button"]').click()
    await expect(whatsappInput).toHaveValue('https://chat.whatsapp.com/newlink123')

    // Zamknij
    await page.click('[data-testid="cancel-edit"]')
  })

  test('Sprawdzenie braku pola facebook_group_url', async ({ page }) => {
    // Otwórz formularz edycji
    const section = page.locator('[data-testid="section-card"]').first()
    await section.locator('[data-testid="edit-section-button"]').click()

    // NIE powinno być pola facebook_group_url (usunięte zgodnie z redesign)
    await expect(page.locator('[data-testid="facebook-group-url"]')).not.toBeVisible()

    // Powinno być tylko WhatsApp
    await expect(page.locator('[data-testid="whatsapp-group-url"]')).toBeVisible()
  })
})

test.describe('Cleanup - Admin Sections', () => {
  test.afterAll(async ({ page }) => {
    // Usuń sekcje testowe
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/sections')

    // Usuń sekcje z nazwą zawierającą "E2E" lub "Test"
    const testSections = page.locator('[data-testid="section-card"]')
      .filter({ hasText: /E2E|Test/i })

    const count = await testSections.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const deleteButton = testSections.first().locator('[data-testid="delete-section-button"]')

      if (await deleteButton.count() > 0) {
        await deleteButton.click()

        // Jeśli sekcja pusta, usuń
        const confirmButton = page.locator('[data-testid="confirm-delete"]')
        if (await confirmButton.isEnabled()) {
          await confirmButton.click()
          await page.waitForTimeout(500)
        } else {
          // Sekcja ma zajęcia, anuluj
          await page.click('[data-testid="cancel-delete"]')
        }
      }
    }
  })
})
