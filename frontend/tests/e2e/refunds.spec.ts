import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Zwroty i Refundy (Refunds)', () => {
  test.beforeEach(async ({ page }) => {
    // Zaloguj jako admin (tylko admin ma dostęp do zarządzania zwrotami)
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/refunds')
  })

  test('@payment Scenariusz 56: Lista zwrotów', async ({ page }) => {
    // Sprawdź nagłówek strony
    await expect(page.locator('h1:has-text("Zwroty i Refundy")')).toBeVisible()

    // Sprawdź tabelę zwrotów
    await expect(page.locator('[data-testid="refunds-table"]')).toBeVisible()

    // Sprawdź kolumny
    await expect(page.locator('th:has-text("Data wniosku")')).toBeVisible()
    await expect(page.locator('th:has-text("Użytkownik")')).toBeVisible()
    await expect(page.locator('th:has-text("Zajęcia")')).toBeVisible()
    await expect(page.locator('th:has-text("Kwota")')).toBeVisible()
    await expect(page.locator('th:has-text("Status")')).toBeVisible()
    await expect(page.locator('th:has-text("Akcje")')).toBeVisible()

    // Sprawdź filtry statusu
    await expect(page.locator('[data-testid="filter-status"]')).toBeVisible()

    // Sprawdź czy są zwroty (mogą być puste)
    const refunds = page.locator('[data-testid="refund-row"]')
    const count = await refunds.count()

    if (count > 0) {
      // Sprawdź czy pierwszy zwrot ma wszystkie dane
      const firstRefund = refunds.first()

      await expect(firstRefund.locator('[data-testid="refund-date"]')).toBeVisible()
      await expect(firstRefund.locator('[data-testid="refund-user"]')).toBeVisible()
      await expect(firstRefund.locator('[data-testid="refund-amount"]')).toBeVisible()
      await expect(firstRefund.locator('[data-testid="refund-status"]')).toBeVisible()

      // Status powinien być jednym z: pending, approved, rejected, processed, failed
      const status = await firstRefund.locator('[data-testid="refund-status"]').textContent()
      expect(['pending', 'approved', 'rejected', 'processed', 'failed']).toContainEqual(
        status?.toLowerCase().trim()
      )
    }
  })

  test('@payment Scenariusz 57: Zatwierdzanie zwrotu', async ({ page }) => {
    // Znajdź zwrot w statusie "pending"
    const pendingRefund = page.locator('[data-testid="refund-row"]')
      .filter({ has: page.locator('[data-testid="refund-status"]:has-text("pending")') })
      .first()

    if (await pendingRefund.count() === 0) {
      // Jeśli brak pending refundów, utwórz testowy (symulacja)
      // W rzeczywistej aplikacji użytkownik musi najpierw anulować opłaconą rezerwację
      test.skip('Brak zwrotów w statusie pending')
    }

    // Zapamiętaj ID zwrotu
    const refundId = await pendingRefund.getAttribute('data-refund-id')
    const refundAmount = await pendingRefund.locator('[data-testid="refund-amount"]').textContent()

    // Kliknij "Zatwierdź zwrot"
    await pendingRefund.locator('[data-testid="approve-refund-button"]').click()

    // Dialog potwierdzenia
    await expect(page.locator('[data-testid="approve-refund-dialog"]')).toBeVisible()

    // Sprawdź czy wyświetla szczegóły
    await expect(page.locator(`text=${refundAmount}`)).toBeVisible()

    // Potwierdź
    await page.click('[data-testid="confirm-approve"]')

    // Sprawdź komunikat sukcesu
    await expect(page.locator('text=/Zwrot zatwierdzony/i')).toBeVisible()

    // Status powinien się zmienić na "approved" lub "processing"
    await page.reload()
    const updatedRefund = page.locator(`[data-testid="refund-row"][data-refund-id="${refundId}"]`)
    const newStatus = await updatedRefund.locator('[data-testid="refund-status"]').textContent()

    expect(['approved', 'processing', 'processed']).toContain(newStatus?.toLowerCase().trim())
  })

  test('@payment Scenariusz 58: Odrzucanie zwrotu', async ({ page }) => {
    // Znajdź zwrot w statusie "pending"
    const pendingRefund = page.locator('[data-testid="refund-row"]')
      .filter({ has: page.locator('[data-testid="refund-status"]:has-text("pending")') })
      .first()

    if (await pendingRefund.count() === 0) {
      test.skip('Brak zwrotów w statusie pending')
    }

    const refundId = await pendingRefund.getAttribute('data-refund-id')

    // Kliknij "Odrzuć zwrot"
    await pendingRefund.locator('[data-testid="reject-refund-button"]').click()

    // Dialog odrzucenia (z powodem)
    await expect(page.locator('[data-testid="reject-refund-dialog"]')).toBeVisible()

    // Wpisz powód odrzucenia
    await page.fill('[data-testid="rejection-reason"]', 'Anulowanie po terminie określonym w regulaminie')

    // Potwierdź
    await page.click('[data-testid="confirm-reject"]')

    // Sprawdź komunikat
    await expect(page.locator('text=/Zwrot odrzucony/i')).toBeVisible()

    // Status powinien się zmienić na "rejected"
    await page.reload()
    const updatedRefund = page.locator(`[data-testid="refund-row"][data-refund-id="${refundId}"]`)
    const newStatus = await updatedRefund.locator('[data-testid="refund-status"]').textContent()

    expect(newStatus?.toLowerCase().trim()).toBe('rejected')

    // Sprawdź czy powód odrzucenia jest widoczny
    await updatedRefund.click()
    await expect(page.locator('text=Anulowanie po terminie')).toBeVisible()
  })

  test('@payment Scenariusz 59: Status przetwarzania zwrotu', async ({ page }) => {
    // Znajdź zwrot który został zatwierdzony i jest przetwarzany
    const processingRefund = page.locator('[data-testid="refund-row"]')
      .filter({
        has: page.locator('[data-testid="refund-status"]:has-text(/processing|approved/)')
      })
      .first()

    if (await processingRefund.count() === 0) {
      test.skip('Brak zwrotów w trakcie przetwarzania')
    }

    // Kliknij na zwrot aby zobaczyć szczegóły
    await processingRefund.click()

    // Panel szczegółów powinien być widoczny
    await expect(page.locator('[data-testid="refund-details-panel"]')).toBeVisible()

    // Sprawdź timeline zwrotu
    await expect(page.locator('[data-testid="refund-timeline"]')).toBeVisible()

    // Timeline powinien zawierać kroki:
    const timeline = page.locator('[data-testid="refund-timeline"]')

    await expect(timeline.locator('text=/Wniosek złożony/i')).toBeVisible()
    await expect(timeline.locator('text=/Zatwierdzony/i')).toBeVisible()

    // Jeśli status = processed, powinien być również krok "Wykonany"
    const status = await processingRefund.locator('[data-testid="refund-status"]').textContent()

    if (status?.toLowerCase().includes('processed')) {
      await expect(timeline.locator('text=/Wykonany/i')).toBeVisible()

      // Dla wykonanych zwrotów - sprawdź dane transakcji
      await expect(page.locator('[data-testid="refund-transaction-id"]')).toBeVisible()
      await expect(page.locator('[data-testid="refund-completion-date"]')).toBeVisible()
    }

    // Sprawdź szczegóły zwrotu
    await expect(page.locator('[data-testid="refund-user-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="refund-activity-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="refund-amount-detail"]')).toBeVisible()
    await expect(page.locator('[data-testid="refund-payment-method"]')).toBeVisible()
  })

  test('Filtrowanie zwrotów po statusie', async ({ page }) => {
    // Wybierz filtr "Oczekujące"
    await page.selectOption('[data-testid="filter-status"]', 'pending')

    // Poczekaj na odświeżenie
    await page.waitForTimeout(500)

    // Wszystkie widoczne zwroty powinny mieć status "pending"
    const refunds = page.locator('[data-testid="refund-row"]')
    const count = await refunds.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const status = await refunds.nth(i).locator('[data-testid="refund-status"]').textContent()
        expect(status?.toLowerCase().trim()).toBe('pending')
      }
    }

    // Zmień na "Zatwierdzone"
    await page.selectOption('[data-testid="filter-status"]', 'approved')
    await page.waitForTimeout(500)

    const approvedRefunds = page.locator('[data-testid="refund-row"]')
    const approvedCount = await approvedRefunds.count()

    if (approvedCount > 0) {
      for (let i = 0; i < approvedCount; i++) {
        const status = await approvedRefunds.nth(i).locator('[data-testid="refund-status"]').textContent()
        expect(['approved', 'processing']).toContain(status?.toLowerCase().trim())
      }
    }
  })

  test('Eksport listy zwrotów do CSV', async ({ page }) => {
    // Kliknij przycisk eksportu
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-refunds-csv"]')

    const download = await downloadPromise

    // Sprawdź nazwę pliku
    expect(download.suggestedFilename()).toMatch(/refunds.*\.csv/)

    // Sprawdź czy plik nie jest pusty
    const path = await download.path()
    if (path) {
      const fs = require('fs')
      const content = fs.readFileSync(path, 'utf-8')
      expect(content.length).toBeGreaterThan(0)

      // Sprawdź nagłówki CSV
      expect(content).toContain('date')
      expect(content).toContain('user')
      expect(content).toContain('amount')
      expect(content).toContain('status')
    }
  })

  test('@payment Ręczny zwrot przez admina', async ({ page }) => {
    // Kliknij "Nowy zwrot ręczny"
    await page.click('[data-testid="manual-refund-button"]')

    // Formularz zwrotu ręcznego
    await expect(page.locator('[data-testid="manual-refund-form"]')).toBeVisible()

    // Wybierz użytkownika
    await page.fill('[data-testid="search-user-input"]', 'test')
    await page.waitForTimeout(500)
    await page.click('[data-testid="user-result"]').first()

    // Wpisz kwotę
    await page.fill('[data-testid="refund-amount-input"]', '50')

    // Wpisz powód
    await page.fill('[data-testid="refund-reason"]', 'Kompensata za odwołane zajęcia')

    // Wybierz metodę zwrotu
    await page.selectOption('[data-testid="refund-method"]', 'manual')

    // Zapisz
    await page.click('[data-testid="submit-manual-refund"]')

    // Sprawdź komunikat
    await expect(page.locator('text=/Zwrot utworzony/i')).toBeVisible()

    // Nowy zwrot powinien pojawić się na liście ze statusem "manual" lub "pending"
    await expect(page.locator('text=Kompensata za odwołane zajęcia')).toBeVisible()
  })
})

test.describe('Security - Refunds', () => {
  test('Blokada dostępu dla zwykłego użytkownika', async ({ page }) => {
    // Zaloguj jako regular user
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Próba dostępu do panelu zwrotów
    await page.goto('/admin/refunds')

    // Powinno przekierować lub pokazać błąd
    await expect(page.locator('text=/Brak dostępu/i')).toBeVisible()

    // LUB sprawdź redirect
    expect(page.url()).not.toContain('/admin/refunds')
  })

  test('Blokada dostępu dla trenera', async ({ page }) => {
    // Trenerzy NIE powinni mieć dostępu do zarządzania zwrotami
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)

    await page.goto('/admin/refunds')

    await expect(page.locator('text=/Brak dostępu/i')).toBeVisible()
  })
})

test.describe('Refunds - Workflow Integration', () => {
  test('@payment Pełny flow: Anulowanie opłaconej rezerwacji -> Wniosek o zwrot -> Zatwierdzenie', async ({ page, context }) => {
    // Część 1: Użytkownik anuluje opłaconą rezerwację
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
    await page.goto('/my-classes')

    // Znajdź opłaconą rezerwację
    const paidReservation = page.locator('[data-testid="reservation-item"]')
      .filter({ has: page.locator('[data-testid="payment-status"]:has-text("paid")') })
      .first()

    if (await paidReservation.count() === 0) {
      test.skip('Brak opłaconych rezerwacji do anulowania')
    }

    // Anuluj
    await paidReservation.locator('[data-testid="cancel-reservation-button"]').click()

    // Dialog powinien informować o zwrocie
    await expect(page.locator('text=/zwrot/i')).toBeVisible()
    await page.click('[data-testid="confirm-cancel-with-refund"]')

    // Komunikat o wniosku o zwrot
    await expect(page.locator('text=/Wniosek o zwrot został złożony/i')).toBeVisible()

    // Część 2: Admin zatwierdza zwrot
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/refunds')

    // Znajdź najnowszy zwrot (ostatni dodany)
    const latestRefund = page.locator('[data-testid="refund-row"]').first()
    await latestRefund.locator('[data-testid="approve-refund-button"]').click()
    await page.click('[data-testid="confirm-approve"]')

    await expect(page.locator('text=/Zwrot zatwierdzony/i')).toBeVisible()

    // Część 3: Użytkownik widzi status zwrotu
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
    await page.goto('/profile')
    await page.click('[data-testid="refunds-tab"]')

    // Ostatni zwrot powinien mieć status "approved" lub "processing"
    const userRefund = page.locator('[data-testid="refund-item"]').first()
    const status = await userRefund.locator('[data-testid="refund-status"]').textContent()

    expect(['approved', 'processing', 'processed']).toContain(status?.toLowerCase().trim())
  })
})
