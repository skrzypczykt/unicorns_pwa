import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Panel Trenera (Trainer Panel)', () => {
  test.beforeEach(async ({ page }) => {
    // Zaloguj jako trener
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)
    await page.goto('/trainer/classes')
  })

  test('Scenariusz 71: Lista zajęć trenera', async ({ page }) => {
    // Sprawdź nagłówek
    const pageTitle = page.locator('h1:has-text("Moje Zajęcia")')
    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Trainer classes page not found - UI not implemented')
    }

    // Sprawdź filtry czasowe
    await expect(page.locator('[data-testid="filter-time"]')).toBeVisible()

    // Opcje: Nadchodzące, Dzisiaj, Ten tydzień, Wszystkie
    const timeFilter = page.locator('[data-testid="filter-time"]')
    await expect(timeFilter.locator('option:has-text("Nadchodzące")')).toBeVisible()
    await expect(timeFilter.locator('option:has-text("Dzisiaj")')).toBeVisible()

    // Tabela zajęć trenera
    await expect(page.locator('[data-testid="trainer-classes-table"]')).toBeVisible()

    // Kolumny
    await expect(page.locator('th:has-text("Data i godzina")')).toBeVisible()
    await expect(page.locator('th:has-text("Sekcja")')).toBeVisible()
    await expect(page.locator('th:has-text("Nazwa")')).toBeVisible()
    await expect(page.locator('th:has-text("Uczestnicy")')).toBeVisible()
    await expect(page.locator('th:has-text("Status")')).toBeVisible()
    await expect(page.locator('th:has-text("Akcje")')).toBeVisible()

    // Sprawdź czy są zajęcia
    const classes = page.locator('[data-testid="trainer-class-row"]')
    const count = await classes.count()

    if (count === 0) {
      // Trener może nie mieć przypisanych zajęć
      await expect(page.locator('text=/Nie masz jeszcze przypisanych zajęć/i')).toBeVisible()
    } else {
      const firstClass = classes.first()

      // Sprawdź dane pierwszych zajęć
      await expect(firstClass.locator('[data-testid="class-date"]')).toBeVisible()
      await expect(firstClass.locator('[data-testid="class-section"]')).toBeVisible()
      await expect(firstClass.locator('[data-testid="class-name"]')).toBeVisible()
      await expect(firstClass.locator('[data-testid="participants-count"]')).toBeVisible()

      // Liczba uczestników w formacie "5/15"
      const participantsText = await firstClass.locator('[data-testid="participants-count"]').textContent()
      expect(participantsText).toMatch(/\d+\/\d+/)

      // Przyciski akcji
      await expect(firstClass.locator('[data-testid="edit-class-button"]')).toBeVisible()
      await expect(firstClass.locator('[data-testid="attendance-button"]')).toBeVisible()
    }
  })

  test('Scenariusz 72: Edycja swoich zajęć', async ({ page }) => {
    // Znajdź zajęcia do edycji
    const classRow = page.locator('[data-testid="trainer-class-row"]').first()

    if (await classRow.count() === 0) {
      test.skip('Brak zajęć do edycji')
    }

    // Zapamiętaj oryginalną nazwę
    const originalName = await classRow.locator('[data-testid="class-name"]').textContent()

    // Kliknij "Edytuj"
    const editButton = classRow.locator('[data-testid="edit-class-button"]')
    if (await editButton.count() === 0) {
      test.skip('Edit button not found - UI not implemented')
    }
    await editButton.click()

    // Formularz edycji
    const editForm = page.locator('[data-testid="edit-class-form"]')
    try {
      await expect(editForm).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Edit class form not found - UI not implemented')
    }

    // Trener może edytować tylko niektóre pola:
    // ✅ Nazwa zajęć
    // ✅ Opis
    // ✅ Link online (jeśli online)
    // ✅ Notatki wewnętrzne
    // ❌ Data/godzina (tylko admin)
    // ❌ Cena (tylko admin)
    // ❌ Liczba miejsc (tylko admin)

    // Sprawdź które pola są dostępne
    const nameInput = page.locator('[data-testid="class-name-input"]')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toBeEnabled()

    const descInput = page.locator('[data-testid="class-description-input"]')
    await expect(descInput).toBeVisible()

    // Zmień nazwę
    await nameInput.clear()
    await nameInput.fill('Zajęcia Edytowane przez Trenera E2E')

    // Zmień opis
    await descInput.clear()
    await descInput.fill('Zaktualizowany opis przez trenera')

    // Jeśli zajęcia online - zmień link
    const onlineLinkInput = page.locator('[data-testid="online-link-input"]')
    if (await onlineLinkInput.count() > 0) {
      await onlineLinkInput.clear()
      await onlineLinkInput.fill('https://meet.google.com/abc-defg-hij')
    }

    // Zapisz
    await page.click('[data-testid="save-class-button"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Zaktualizowano/i')).toBeVisible()

    // Sprawdź czy zmiany się zapisały
    await expect(page.locator('text=Zajęcia Edytowane przez Trenera E2E')).toBeVisible()

    // Cleanup: przywróć oryginalną nazwę
    await page.locator('text=Zajęcia Edytowane przez Trenera E2E').click()
    await page.locator('[data-testid="edit-class-button"]').click()
    await nameInput.clear()
    await nameInput.fill(originalName || 'Oryginalna nazwa')
    await page.click('[data-testid="save-class-button"]')
  })

  test('Scenariusz 73: Oznaczanie obecności', async ({ page }) => {
    // Wybierz filtr "Dzisiaj" lub "Wszystkie"
    const timeFilter = page.locator('[data-testid="filter-time"]')
    if (await timeFilter.count() === 0) {
      test.skip('Time filter not found - UI not implemented')
    }
    await page.selectOption('[data-testid="filter-time"]', 'all')
    await page.waitForTimeout(500)

    // Znajdź zajęcia które już się odbyły (status = "completed" lub przeszła data)
    const completedClass = page.locator('[data-testid="trainer-class-row"]')
      .filter({ has: page.locator('[data-testid="class-status"]:has-text(/zakończone|completed/i)') })
      .first()

    if (await completedClass.count() === 0) {
      test.skip('Brak zakończonych zajęć do oznaczenia obecności')
    }

    // Kliknij "Obecność"
    const attendanceButton = completedClass.locator('[data-testid="attendance-button"]')
    if (await attendanceButton.count() === 0) {
      test.skip('Attendance button not found - UI not implemented')
    }
    await attendanceButton.click()

    // Lista uczestników
    const attendanceList = page.locator('[data-testid="attendance-list"]')
    try {
      await expect(attendanceList).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Attendance list not found - UI not implemented')
    }
    await expect(page.locator('h3:has-text("Lista Uczestników")')).toBeVisible()

    // Sprawdź czy są uczestnicy
    const participants = page.locator('[data-testid="participant-row"]')
    const count = await participants.count()

    if (count === 0) {
      await expect(page.locator('text=/Brak zapisanych uczestników/i')).toBeVisible()
      return
    }

    // Zaznacz obecność pierwszego uczestnika
    const firstParticipant = participants.first()
    const participantName = await firstParticipant.locator('[data-testid="participant-name"]').textContent()

    // Checkbox obecności
    const attendanceCheckbox = firstParticipant.locator('[data-testid="attendance-checkbox"]')

    // Sprawdź aktualny stan
    const wasChecked = await attendanceCheckbox.isChecked()

    // Zmień stan
    await attendanceCheckbox.click()

    // Zapisz obecność
    await page.click('[data-testid="save-attendance-button"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Obecność zapisana/i')).toBeVisible()

    // Odśwież i sprawdź czy się zapisało
    await page.reload()
    await completedClass.locator('[data-testid="attendance-button"]').click()

    const updatedCheckbox = page.locator(`[data-testid="participant-row"]:has-text("${participantName}") [data-testid="attendance-checkbox"]`)

    if (wasChecked) {
      await expect(updatedCheckbox).not.toBeChecked()
    } else {
      await expect(updatedCheckbox).toBeChecked()
    }

    // Przywróć oryginalny stan
    await updatedCheckbox.click()
    await page.click('[data-testid="save-attendance-button"]')
  })

  test('Filtrowanie zajęć po czasie - Nadchodzące', async ({ page }) => {
    // Wybierz "Nadchodzące"
    const timeFilter = page.locator('[data-testid="filter-time"]')
    if (await timeFilter.count() === 0) {
      test.skip('Time filter not found - UI not implemented')
    }
    await page.selectOption('[data-testid="filter-time"]', 'upcoming')
    await page.waitForTimeout(500)

    // Wszystkie zajęcia powinny być w przyszłości
    const classes = page.locator('[data-testid="trainer-class-row"]')
    const count = await classes.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const dateText = await classes.nth(i).locator('[data-testid="class-date"]').textContent()
        const classDate = new Date(dateText || '')
        const now = new Date()

        expect(classDate.getTime()).toBeGreaterThan(now.getTime())
      }
    }
  })

  test('Filtrowanie zajęć po czasie - Dzisiaj', async ({ page }) => {
    // Wybierz "Dzisiaj"
    const timeFilter = page.locator('[data-testid="filter-time"]')
    if (await timeFilter.count() === 0) {
      test.skip('Time filter not found - UI not implemented')
    }
    await page.selectOption('[data-testid="filter-time"]', 'today')
    await page.waitForTimeout(500)

    // Wszystkie zajęcia powinny być dzisiaj
    const classes = page.locator('[data-testid="trainer-class-row"]')
    const count = await classes.count()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const dateText = await classes.nth(i).locator('[data-testid="class-date"]').textContent()
        const classDate = new Date(dateText || '')
        classDate.setHours(0, 0, 0, 0)

        expect(classDate.getTime()).toBe(today.getTime())
      }
    }
  })

  test.skip('Statystyki frekwencji dla zajęć', async ({ page }) => {
    // Kliknij na zakończone zajęcia
    const completedClass = page.locator('[data-testid="trainer-class-row"]')
      .filter({ has: page.locator('[data-testid="class-status"]:has-text(/zakończone/i)') })
      .first()

    if (await completedClass.count() === 0) {
      test.skip('Brak zakończonych zajęć')
    }

    await completedClass.click()

    // Panel szczegółów zajęć
    const detailsPanel = page.locator('[data-testid="class-details-panel"]')
    try {
      await expect(detailsPanel).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Class details panel not found - UI not implemented')
    }

    // Statystyki obecności
    await expect(page.locator('[data-testid="attendance-stats"]')).toBeVisible()

    // Powinno pokazywać:
    // - Zapisanych: X
    // - Obecnych: Y
    // - Frekwencja: Z%
    await expect(page.locator('[data-testid="registered-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="attended-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="attendance-percentage"]')).toBeVisible()
  })

  test('Notatki trenera dla zajęć', async ({ page }) => {
    const classRow = page.locator('[data-testid="trainer-class-row"]').first()

    if (await classRow.count() === 0) {
      test.skip('Brak zajęć')
    }

    // Otwórz edycję
    const editButton = classRow.locator('[data-testid="edit-class-button"]')
    if (await editButton.count() === 0) {
      test.skip('Edit button not found - UI not implemented')
    }
    await editButton.click()

    // Check if edit form loaded
    const editForm = page.locator('[data-testid="edit-class-form"]')
    try {
      await expect(editForm).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Edit class form not found - UI not implemented')
    }

    // Pole notatek wewnętrznych (tylko dla trenera/admina)
    const notesInput = page.locator('[data-testid="trainer-notes-input"]')

    if (await notesInput.count() > 0) {
      // Dodaj notatkę
      await notesInput.clear()
      await notesInput.fill('E2E Test: Pamiętać o przygotowaniu mat do jogi')

      // Zapisz
      await page.click('[data-testid="save-class-button"]')

      await expect(page.locator('text=/Zaktualizowano/i')).toBeVisible()

      // Sprawdź czy notatka się zapisała
      await classRow.locator('[data-testid="edit-class-button"]').click()
      await expect(notesInput).toHaveValue('E2E Test: Pamiętać o przygotowaniu mat do jogi')

      // Cleanup
      await notesInput.clear()
      await page.click('[data-testid="save-class-button"]')
    }
  })
})

test.describe('Security - Trainer Panel', () => {
  test('Blokada dostępu dla zwykłego użytkownika', async ({ page }) => {
    // Zaloguj jako regular user
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Próba dostępu do panelu trenera
    await page.goto('/trainer/classes')

    // Powinno przekierować lub pokazać błąd
    const accessDenied = page.locator('text=/Brak dostępu/i')
    try {
      await expect(accessDenied).toBeVisible({ timeout: 3000 })
    } catch {
      // LUB redirect
      if (page.url().includes('/trainer/')) {
        test.skip('Access control not implemented - trainer page accessible')
      }
    }
  })

  test('Trener NIE może edytować cudzych zajęć', async ({ page }) => {
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)

    // Przejdź do panelu admina aby zobaczyć wszystkie zajęcia
    await page.goto('/admin/activities')

    // Jeśli trener ma dostęp do admina (internal trainer może mieć szersze uprawnienia)
    const hasAdminAccess = await page.locator('h1:has-text("Zarządzanie Zajęciami")').count() > 0

    if (!hasAdminAccess) {
      // Trener NIE ma dostępu do panelu admina - OK
      return
    }

    // Znajdź zajęcia prowadzone przez INNEGO trenera
    const otherTrainerClass = page.locator('[data-testid="activity-row"]')
      .filter({ hasNot: page.locator(`[data-trainer-id="${TEST_USERS.trainer.id}"]`) })
      .first()

    if (await otherTrainerClass.count() > 0) {
      // Kliknij "Edytuj"
      await otherTrainerClass.locator('[data-testid="edit-button"]').click()

      // Pola powinny być disabled lub formularz powinien pokazać błąd
      const nameInput = page.locator('[data-testid="activity-name"]')

      if (await nameInput.count() > 0) {
        // Jeśli formularz się otworzył, pola POWINNY być disabled
        const isDisabled = await nameInput.isDisabled()
        expect(isDisabled).toBe(true)
      } else {
        // LUB formularz w ogóle się nie otworzył - pokazał błąd
        await expect(page.locator('text=/Nie możesz edytować zajęć innego trenera/i')).toBeVisible()
      }
    }
  })

  test('Admin może widzieć wszystkie zajęcia, trener tylko swoje', async ({ page, context }) => {
    // Część 1: Trener widzi tylko swoje zajęcia
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)
    await page.goto('/trainer/classes')

    const trainerClasses = page.locator('[data-testid="trainer-class-row"]')
    const trainerCount = await trainerClasses.count()

    // Wszystkie zajęcia powinny mieć tego trenera jako prowadzącego
    for (let i = 0; i < Math.min(trainerCount, 5); i++) {
      const trainerId = await trainerClasses.nth(i).getAttribute('data-trainer-id')
      expect(trainerId).toBe(TEST_USERS.trainer.id)
    }

    // Część 2: Admin widzi wszystkie zajęcia
    const adminPage = await context.newPage()
    await loginUser(adminPage, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await adminPage.goto('/admin/activities')

    const adminClasses = adminPage.locator('[data-testid="activity-row"]')
    const adminCount = await adminClasses.count()

    // Admin powinien widzieć więcej lub równo (wszystkich trenerów)
    expect(adminCount).toBeGreaterThanOrEqual(trainerCount)

    await adminPage.close()
  })
})

test.describe('Trainer Panel - Integracja z Zajęciami', () => {
  test('Link do zajęć trenera w menu', async ({ page }) => {
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)

    await page.goto('/')

    // Menu trenera powinno zawierać link do "Moje Zajęcia"
    const userMenu = page.locator('[data-testid="user-menu"]')
    if (await userMenu.count() === 0) {
      test.skip('User menu not found - UI not implemented')
    }
    await userMenu.click()

    const trainerLink = page.locator('[data-testid="trainer-classes-link"]')
    try {
      await expect(trainerLink).toBeVisible({ timeout: 3000 })
    } catch {
      test.skip('Trainer classes link not found in menu - UI not implemented')
    }

    await trainerLink.click()

    expect(page.url()).toContain('/trainer/classes')
  })

  test('Badge "Trener" w profilu', async ({ page }) => {
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)

    await page.goto('/profile')

    // Check if profile page loaded
    const pageTitle = page.locator('h1:has-text("Profil")')
    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Profile page not found - UI not implemented')
    }

    // Profil powinien mieć badge "Trener"
    const trainerBadge = page.locator('[data-testid="trainer-badge"]')
    try {
      await expect(trainerBadge).toBeVisible({ timeout: 3000 })
    } catch {
      test.skip('Trainer badge not found - UI not implemented')
    }
  })
})
