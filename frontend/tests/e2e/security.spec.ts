import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Security i RLS (Row Level Security)', () => {
  test('Scenariusz 77: Próba dostępu do cudzych rezerwacji', async ({ page }) => {
    // Zaloguj jako user1
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Przejdź do swoich rezerwacji i zapamiętaj URL
    await page.goto('/my-classes')

    const myReservations = page.locator('[data-testid="reservation-item"]')

    if (await myReservations.count() > 0) {
      // Zapamiętaj ID pierwszej rezerwacji z URL lub data-id
      const reservationId = await myReservations.first().getAttribute('data-reservation-id')

      // Wyloguj
      await page.click('[data-testid="logout-button"]')

      // Zaloguj jako inny użytkownik
      await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)

      // Próba bezpośredniego dostępu do rezerwacji innego użytkownika przez API
      const response = await page.request.get(`/api/reservations/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('supabase.auth.token'))}`
        }
      })

      // RLS powinno zablokować dostęp (403 lub 404)
      expect([403, 404]).toContain(response.status())
    }
  })

  test('Scenariusz 78: Próba edycji cudzego profilu', async ({ page }) => {
    // Zaloguj jako regular user
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Spróbuj edytować profil admina przez API
    const response = await page.request.patch('/api/users/admin-user-id', {
      data: {
        name: 'Hacked Name'
      },
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('supabase.auth.token'))}`
      }
    })

    // RLS powinno zablokować (403)
    expect(response.status()).toBe(403)
  })

  test('Scenariusz 79: Blokada panelu admina dla zwykłego użytkownika', async ({ page }) => {
    // Zaloguj jako regular user
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Próba dostępu do panelu admina
    await page.goto('/admin/activities')

    // Powinno przekierować do strony głównej lub pokazać komunikat o braku dostępu
    await expect(page.locator('text=/Brak dostępu/i')).toBeVisible()

    // LUB sprawdź czy URL zmienił się (redirect)
    expect(page.url()).not.toContain('/admin/')
  })

  test('Scenariusz 80: Race condition - ostatnie miejsce', async ({ page, context }) => {
    // Ten test wymaga dwóch równoczesnych sesji

    // Sesja 1: User1
    const page1 = page
    await loginUser(page1, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Sesja 2: User2 (nowa karta)
    const page2 = await context.newPage()
    await loginUser(page2, TEST_USERS.admin.email, TEST_USERS.admin.password)

    // Znajdź zajęcia z 1 wolnym miejscem
    await page1.goto('/activities')
    await page2.goto('/activities')

    const activity1 = page1.locator('[data-testid="activity-card"]').filter({ hasText: '1 wolne miejsce' }).first()
    const activity2 = page2.locator('[data-testid="activity-card"]').filter({ hasText: '1 wolne miejsce' }).first()

    if (await activity1.count() === 0) {
      test.skip('Brak zajęć z 1 wolnym miejscem')
    }

    // Obaj klikają "Zapisz się" jednocześnie
    await Promise.all([
      activity1.click().then(() => page1.click('[data-testid="register-button"]')),
      activity2.click().then(() => page2.click('[data-testid="register-button"]'))
    ])

    // Poczekaj na odpowiedzi
    await page1.waitForTimeout(2000)
    await page2.waitForTimeout(2000)

    // Tylko jeden powinien się zapisać, drugi powinien zobaczyć "Zajęcia pełne"
    const page1Success = await page1.locator('text=/Zapisano/i').count() > 0
    const page2Success = await page2.locator('text=/Zapisano/i').count() > 0

    const page1Full = await page1.locator('text=/Zajęcia pełne/i').count() > 0
    const page2Full = await page2.locator('text=/Zajęcia pełne/i').count() > 0

    // XOR: dokładnie jeden sukces, jeden błąd
    expect(page1Success !== page2Success).toBe(true)
    expect(page1Full !== page2Full).toBe(true)

    await page2.close()
  })
})

test.describe('Security - Walidacja Inputów', () => {
  test('XSS - Script injection w nazwie użytkownika', async ({ page }) => {
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)
    await page.goto('/profile')

    const maliciousInput = '<script>alert("XSS")</script>'
    const nameInput = page.locator('[data-testid="name-input"]')

    await nameInput.clear()
    await nameInput.fill(maliciousInput)
    await page.click('[data-testid="save-profile-button"]')

    // Odśwież i sprawdź czy script NIE został wykonany
    await page.reload()

    // Input powinien być zescapeowany (wyświetlany jako tekst)
    const displayedName = await page.locator('[data-testid="user-display-name"]').textContent()
    expect(displayedName).toContain('<script>')

    // Alert NIE powinien się pojawić
    page.on('dialog', async dialog => {
      test.fail() // Jeśli alert się pojawi, test failuje
      await dialog.dismiss()
    })
  })

  test('SQL Injection - Email search', async ({ page }) => {
    await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/admin/users')

    const searchInput = page.locator('[data-testid="search-users-input"]')
    const sqlInjection = "'; DROP TABLE users; --"

    await searchInput.fill(sqlInjection)
    await page.click('[data-testid="search-button"]')

    // Aplikacja powinna działać normalnie (parametrized queries)
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible()

    // NIE powinno być błędu SQL
    await expect(page.locator('text=/SQL error/i')).not.toBeVisible()
  })
})
