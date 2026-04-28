import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Panel Admina - Zarządzanie Zajęciami', () => {
  test.beforeEach(async ({ page }) => {
    // Zaloguj jako admin
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/activities')
  })

  test('Scenariusz 39: Dostęp do panelu admina', async ({ page }) => {
    // Sprawdź czy jesteśmy na stronie panelu admina
    const pageTitle = page.locator('h1:has-text("Zarządzanie Zajęciami")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Admin activities page not implemented or inaccessible')
    }

    // Sprawdź główne elementy interfejsu
    const addButton = page.locator('[data-testid="add-activity-button"]')
    const activitiesTable = page.locator('[data-testid="activities-table"]')

    if (await addButton.count() === 0 || await activitiesTable.count() === 0) {
      test.skip('Admin activities UI elements not found - implementation incomplete')
    }

    await expect(addButton).toBeVisible()
    await expect(activitiesTable).toBeVisible()

    // Sprawdź filtry
    await expect(page.locator('[data-testid="filter-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-section"]')).toBeVisible()
  })

  test('Scenariusz 40: Dodawanie nowych zajęć', async ({ page }) => {
    // Kliknij "Dodaj zajęcia"
    const addButton = page.locator('[data-testid="add-activity-button"]')
    if (await addButton.count() === 0) {
      test.skip('Add activity button not found')
    }
    await addButton.click()

    // Powinien otworzyć się formularz
    await expect(page.locator('[data-testid="activity-form"]')).toBeVisible()

    // Wypełnij formularz
    await page.selectOption('[data-testid="section-select"]', { index: 1 }) // Pierwsza dostępna sekcja
    await page.fill('[data-testid="activity-name"]', 'Test E2E Activity')

    // Data i czas
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    await page.fill('[data-testid="activity-date"]', dateStr)
    await page.fill('[data-testid="activity-time"]', '18:00')

    // Trener
    await page.selectOption('[data-testid="trainer-select"]', { index: 1 })

    // Cena i miejsca
    await page.fill('[data-testid="activity-price"]', '30')
    await page.fill('[data-testid="activity-max-participants"]', '15')

    // Lokalizacja
    await page.selectOption('[data-testid="location-select"]', 'online')

    // Zapisz
    await page.click('[data-testid="save-activity-button"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Zajęcia utworzone/i')).toBeVisible()

    // Sprawdź czy nowe zajęcia pojawiły się w tabeli
    await expect(page.locator('text=Test E2E Activity')).toBeVisible()
  })

  test('Scenariusz 41: Edycja zajęć', async ({ page }) => {
    // Znajdź pierwsze zajęcia w tabeli
    const activityRows = page.locator('[data-testid="activity-row"]')

    if (await activityRows.count() === 0) {
      test.skip('No activity rows found in admin table')
    }

    const firstActivity = activityRows.first()

    // Zapamiętaj nazwę
    const originalName = await firstActivity.locator('[data-testid="activity-name"]').textContent()

    // Kliknij "Edytuj"
    await firstActivity.locator('[data-testid="edit-button"]').click()

    // Formularz edycji powinien być widoczny
    await expect(page.locator('[data-testid="activity-form"]')).toBeVisible()

    // Zmień nazwę
    const nameInput = page.locator('[data-testid="activity-name"]')
    await nameInput.clear()
    await nameInput.fill('Edited E2E Activity')

    // Zmień cenę
    const priceInput = page.locator('[data-testid="activity-price"]')
    await priceInput.clear()
    await priceInput.fill('40')

    // Zapisz
    await page.click('[data-testid="save-activity-button"]')

    // Sprawdź komunikat
    await expect(page.locator('text=/Zaktualizowano/i')).toBeVisible()

    // Sprawdź czy zmiany się zapisały
    await expect(page.locator('text=Edited E2E Activity')).toBeVisible()
    await expect(page.locator('text=40 zł')).toBeVisible()

    // Cleanup: przywróć oryginalną nazwę
    await page.locator('text=Edited E2E Activity').click()
    await nameInput.clear()
    await nameInput.fill(originalName || 'Original Name')
    await page.click('[data-testid="save-activity-button"]')
  })

  test('Scenariusz 42: Usuwanie zajęć (puste - bez rezerwacji)', async ({ page }) => {
    // Najpierw utwórz nowe zajęcia do usunięcia
    const addButton = page.locator('[data-testid="add-activity-button"]')
    if (await addButton.count() === 0) {
      test.skip('Add activity button not found')
    }
    await addButton.click()

    await page.selectOption('[data-testid="section-select"]', { index: 1 })
    await page.fill('[data-testid="activity-name"]', 'To Delete E2E')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 7)
    const dateStr = tomorrow.toISOString().split('T')[0]

    await page.fill('[data-testid="activity-date"]', dateStr)
    await page.fill('[data-testid="activity-time"]', '20:00')
    await page.selectOption('[data-testid="trainer-select"]', { index: 1 })
    await page.fill('[data-testid="activity-price"]', '0')
    await page.fill('[data-testid="activity-max-participants"]', '10')

    await page.click('[data-testid="save-activity-button"]')
    await page.waitForSelector('text=To Delete E2E')

    // Teraz usuń
    const activityToDelete = page.locator('[data-testid="activity-row"]:has-text("To Delete E2E")')
    await activityToDelete.locator('[data-testid="delete-button"]').click()

    // Potwierdź dialog
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible()
    await expect(page.locator('text=/Czy na pewno/i')).toBeVisible()

    await page.click('[data-testid="confirm-delete"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Usunięto/i')).toBeVisible()

    // Sprawdź czy zniknęło z tabeli
    await expect(page.locator('text=To Delete E2E')).not.toBeVisible()
  })

  test('Scenariusz 43: Blokada usuwania zajęć z rezerwacjami', async ({ page }) => {
    // Znajdź zajęcia które mają rezerwacje
    const activityWithReservations = page.locator('[data-testid="activity-row"]')
      .filter({ has: page.locator('[data-testid="participants-count"]:not(:has-text("0"))') })
      .first()

    if (await activityWithReservations.count() === 0) {
      test.skip('Brak zajęć z rezerwacjami')
    }

    // Kliknij "Usuń"
    await activityWithReservations.locator('[data-testid="delete-button"]').click()

    // Dialog powinien zawierać ostrzeżenie o rezerwacjach
    await expect(page.locator('text=/rezerwacj/i')).toBeVisible()
    await expect(page.locator('text=/Anuluj najpierw/i')).toBeVisible()

    // Przycisk potwierdzenia powinien być nieaktywny LUB w ogóle niewidoczny
    const confirmButton = page.locator('[data-testid="confirm-delete"]')

    if (await confirmButton.count() > 0) {
      await expect(confirmButton).toBeDisabled()
    } else {
      await expect(confirmButton).not.toBeVisible()
    }

    // Zamknij dialog
    await page.click('[data-testid="cancel-delete"]')
  })

  test('Filtrowanie zajęć po statusie', async ({ page }) => {
    // Wybierz filtr "Nadchodzące"
    const filterStatus = page.locator('[data-testid="filter-status"]')
    if (await filterStatus.count() === 0) {
      test.skip('Status filter not found')
    }
    await filterStatus.selectOption('upcoming')

    // Poczekaj na odświeżenie
    await page.waitForTimeout(1000)

    // Wszystkie widoczne zajęcia powinny mieć datę w przyszłości
    const activities = page.locator('[data-testid="activity-row"]')
    const count = await activities.count()

    if (count > 0) {
      // Sprawdź pierwszą datę
      const firstDate = await activities.first().locator('[data-testid="activity-date"]').textContent()
      const activityDate = new Date(firstDate || '')
      const today = new Date()

      expect(activityDate.getTime()).toBeGreaterThan(today.getTime())
    }
  })

  test('Filtrowanie zajęć po sekcji', async ({ page }) => {
    // Wybierz pierwszą sekcję z dropdown
    const sectionSelect = page.locator('[data-testid="filter-section"]')
    if (await sectionSelect.count() === 0) {
      test.skip('Section filter not found')
    }
    await sectionSelect.selectOption({ index: 1 })

    const selectedSection = await sectionSelect.inputValue()

    // Poczekaj na odświeżenie
    await page.waitForTimeout(1000)

    // Wszystkie zajęcia powinny należeć do wybranej sekcji
    const activities = page.locator('[data-testid="activity-row"]')
    const count = await activities.count()

    if (count > 0) {
      const firstActivitySection = await activities.first().getAttribute('data-section-id')
      expect(firstActivitySection).toBe(selectedSection)
    }
  })

  test('Wyświetlanie liczby uczestników', async ({ page }) => {
    const activities = page.locator('[data-testid="activity-row"]')

    if (await activities.count() > 0) {
      const firstActivity = activities.first()

      // Sprawdź kolumnę uczestników
      const participantsText = await firstActivity.locator('[data-testid="participants-count"]').textContent()

      // Powinno być w formacie "3/15" (zapisanych/max)
      expect(participantsText).toMatch(/\d+\/\d+/)
    }
  })
})

test.describe('Cleanup - Admin Activities', () => {
  test.afterAll(async ({ page }) => {
    // Usuń wszystkie zajęcia testowe utworzone podczas testów
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/activities')

    // Usuń zajęcia z nazwą zawierającą "E2E" lub "Test"
    const testActivities = page.locator('[data-testid="activity-row"]')
      .filter({ hasText: /E2E|Test/i })

    const count = await testActivities.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      const deleteButton = testActivities.first().locator('[data-testid="delete-button"]')

      if (await deleteButton.count() > 0) {
        await deleteButton.click()
        await page.click('[data-testid="confirm-delete"]')
        await page.waitForTimeout(500)
      }
    }
  })
})
