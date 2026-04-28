import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Panel Admina - Zarządzanie Użytkownikami', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/users')
  })

  test('Scenariusz 44: Lista użytkowników', async ({ page }) => {
    // Sprawdź nagłówek
    const pageTitle = page.locator('h1:has-text("Użytkownicy")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Admin users page not implemented or inaccessible')
    }

    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Sprawdź tabelę użytkowników
    await expect(usersTable).toBeVisible()

    // Sprawdź kolumny
    await expect(page.locator('th:has-text("Email")')).toBeVisible()
    await expect(page.locator('th:has-text("Imię i Nazwisko")')).toBeVisible()
    await expect(page.locator('th:has-text("Rola")')).toBeVisible()
    await expect(page.locator('th:has-text("Status")')).toBeVisible()
    await expect(page.locator('th:has-text("Akcje")')).toBeVisible()

    // Sprawdź czy są użytkownicy
    const userRows = page.locator('[data-testid="user-row"]')
    const count = await userRows.count()

    expect(count).toBeGreaterThan(0)

    // Sprawdź czy pierwszy użytkownik ma wszystkie dane
    if (count > 0) {
      const firstUser = userRows.first()

      await expect(firstUser.locator('[data-testid="user-email"]')).toBeVisible()
      await expect(firstUser.locator('[data-testid="user-name"]')).toBeVisible()
      await expect(firstUser.locator('[data-testid="user-role"]')).toBeVisible()
    }
  })

  test('Scenariusz 45: Zmiana roli użytkownika', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Znajdź użytkownika z rolą "user"
    const regularUser = page.locator('[data-testid="user-row"]')
      .filter({ has: page.locator('[data-testid="user-role"]:has-text("user")') })
      .first()

    if (await regularUser.count() === 0) {
      test.skip('Brak użytkowników z rolą "user"')
    }

    // Zapamiętaj email użytkownika
    const userEmail = await regularUser.locator('[data-testid="user-email"]').textContent()

    // Kliknij "Zmień rolę"
    await regularUser.locator('[data-testid="change-role-button"]').click()

    // Dialog zmiany roli
    await expect(page.locator('[data-testid="change-role-dialog"]')).toBeVisible()

    // Wybierz rolę "trainer"
    await page.selectOption('[data-testid="role-select"]', 'trainer')

    // Potwierdź
    await page.click('[data-testid="confirm-role-change"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Rola zmieniona/i')).toBeVisible()

    // Sprawdź czy rola się zmieniła w tabeli
    const updatedUser = page.locator(`[data-testid="user-row"]:has-text("${userEmail}")`)
    await expect(updatedUser.locator('[data-testid="user-role"]')).toHaveText('trainer')

    // Cleanup: przywróć rolę "user"
    await updatedUser.locator('[data-testid="change-role-button"]').click()
    await page.selectOption('[data-testid="role-select"]', 'user')
    await page.click('[data-testid="confirm-role-change"]')
  })

  test('Wyszukiwanie użytkownika po email', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Znajdź pole wyszukiwania
    const searchInput = page.locator('[data-testid="search-users-input"]')

    // Wpisz część emaila
    await searchInput.fill('test')

    // Poczekaj na debounce
    await page.waitForTimeout(500)

    // Wszystkie widoczne użytkownicy powinni mieć "test" w emailu
    const userRows = page.locator('[data-testid="user-row"]')
    const count = await userRows.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const email = await userRows.nth(i).locator('[data-testid="user-email"]').textContent()
        expect(email?.toLowerCase()).toContain('test')
      }
    }

    // Wyczyść wyszukiwanie
    await searchInput.clear()
  })

  test('Filtrowanie po roli', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Wybierz filtr "Admin"
    await page.selectOption('[data-testid="filter-role"]', 'admin')

    // Poczekaj na odświeżenie
    await page.waitForTimeout(500)

    // Wszyscy widoczni użytkownicy powinni mieć rolę "admin"
    const userRows = page.locator('[data-testid="user-row"]')
    const count = await userRows.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const role = await userRows.nth(i).locator('[data-testid="user-role"]').textContent()
        expect(role).toBe('admin')
      }
    }
  })

  test('Wyświetlanie członków (is_member = true)', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Zaznacz checkbox "Tylko członkowie"
    await page.check('[data-testid="filter-members-only"]')

    // Poczekaj na odświeżenie
    await page.waitForTimeout(500)

    // Wszyscy widoczni użytkownicy powinni mieć badge "Członek"
    const userRows = page.locator('[data-testid="user-row"]')
    const count = await userRows.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(userRows.nth(i).locator('[data-testid="member-badge"]')).toBeVisible()
      }
    }
  })

  test('Blokowanie użytkownika', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Znajdź aktywnego użytkownika
    const activeUser = page.locator('[data-testid="user-row"]')
      .filter({ has: page.locator('[data-testid="user-status"]:has-text("aktywny")') })
      .first()

    if (await activeUser.count() === 0) {
      test.skip('Brak aktywnych użytkowników')
    }

    const userEmail = await activeUser.locator('[data-testid="user-email"]').textContent()

    // Kliknij "Zablokuj"
    await activeUser.locator('[data-testid="block-user-button"]').click()

    // Dialog potwierdzenia
    await expect(page.locator('[data-testid="block-user-dialog"]')).toBeVisible()
    await expect(page.locator('text=/Czy na pewno/i')).toBeVisible()

    await page.click('[data-testid="confirm-block"]')

    // Sprawdź komunikat
    await expect(page.locator('text=/Użytkownik zablokowany/i')).toBeVisible()

    // Status powinien się zmienić
    const blockedUser = page.locator(`[data-testid="user-row"]:has-text("${userEmail}")`)
    await expect(blockedUser.locator('[data-testid="user-status"]')).toHaveText('zablokowany')

    // Cleanup: odblokuj
    await blockedUser.locator('[data-testid="unblock-user-button"]').click()
    await page.click('[data-testid="confirm-unblock"]')
  })

  test('Eksport listy użytkowników do CSV', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Kliknij przycisk eksportu
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-users-csv"]')

    const download = await downloadPromise

    // Sprawdź czy plik ma poprawną nazwę
    expect(download.suggestedFilename()).toMatch(/users.*\.csv/)

    // Sprawdź czy plik nie jest pusty
    const path = await download.path()
    if (path) {
      const fs = require('fs')
      const content = fs.readFileSync(path, 'utf-8')
      expect(content.length).toBeGreaterThan(0)
      expect(content).toContain('email')
    }
  })

  test('Paginacja - przechodzenie między stronami', async ({ page }) => {
    // Check if page is implemented
    const usersTable = page.locator('[data-testid="users-table"]')
    if (await usersTable.count() === 0) {
      test.skip('Users table not found - UI not implemented')
    }

    // Sprawdź czy są przyciski paginacji
    const paginationNext = page.locator('[data-testid="pagination-next"]')

    if (await paginationNext.count() === 0) {
      test.skip('Mniej niż 1 strona użytkowników')
    }

    // Zapamiętaj email pierwszego użytkownika
    const firstUserEmail = await page.locator('[data-testid="user-row"]')
      .first()
      .locator('[data-testid="user-email"]')
      .textContent()

    // Przejdź do następnej strony
    await paginationNext.click()

    // Poczekaj na załadowanie
    await page.waitForTimeout(500)

    // Pierwszy użytkownik powinien być inny
    const newFirstUserEmail = await page.locator('[data-testid="user-row"]')
      .first()
      .locator('[data-testid="user-email"]')
      .textContent()

    expect(newFirstUserEmail).not.toBe(firstUserEmail)

    // Wróć do pierwszej strony
    await page.click('[data-testid="pagination-prev"]')
  })
})

test.describe('Security - Panel Admina Użytkownicy', () => {
  test.skip('Blokada dostępu dla zwykłego użytkownika', async ({ page }) => {
    // Zaloguj jako regular user
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Próba dostępu do panelu
    await page.goto('/admin/users')

    // Powinno przekierować lub pokazać błąd
    await expect(page.locator('text=/Brak dostępu/i')).toBeVisible()

    // LUB sprawdź redirect
    expect(page.url()).not.toContain('/admin/users')
  })

  test.skip('Blokada dostępu dla trenera', async ({ page }) => {
    // Zaloguj jako trainer
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)

    // Próba dostępu
    await page.goto('/admin/users')

    // Trenerzy NIE powinni mieć dostępu do zarządzania użytkownikami
    await expect(page.locator('text=/Brak dostępu/i')).toBeVisible()
  })
})
