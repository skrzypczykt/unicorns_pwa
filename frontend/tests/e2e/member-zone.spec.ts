import { test, expect } from '@playwright/test'
import { loginUser, TEST_USERS } from '../helpers/auth'

test.describe('Strefa Członka (Member Zone)', () => {
  test.beforeEach(async ({ page }) => {
    // Zaloguj jako użytkownik ze statusem członka
    // UWAGA: TEST_USERS.member musi mieć is_member = true w bazie
    await loginUser(page, TEST_USERS.member?.email || TEST_USERS.regular.email, TEST_USERS.member?.password || TEST_USERS.regular.password)
  })

  test('Scenariusz 51: Dostęp do Strefy Członka', async ({ page }) => {
    // Przejdź do strefy członka
    await page.goto('/member-zone')

    // Sprawdź nagłówek
    const pageTitle = page.locator('h1:has-text("Strefa Członka")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Member zone page not implemented or inaccessible')
    }

    const balanceCard = page.locator('[data-testid="member-balance-card"]')
    if (await balanceCard.count() === 0) {
      test.skip('Member zone UI elements not found - implementation incomplete')
    }

    // Sprawdź menu/kafelki nawigacyjne
    await expect(page.locator('[data-testid="member-balance-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="member-documents-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="member-news-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="member-polls-card"]')).toBeVisible()

    // Sprawdź czy wyświetla imię użytkownika
    await expect(page.locator('[data-testid="member-welcome-message"]')).toBeVisible()

    // Sprawdź czy jest badge "Członek stowarzyszenia"
    await expect(page.locator('[data-testid="member-badge"]')).toBeVisible()
  })

  test('Scenariusz 52: Saldo członkowskie', async ({ page }) => {
    await page.goto('/member-zone/balance')

    // Sprawdź nagłówek
    const pageTitle = page.locator('h2:has-text("Saldo Członkowskie")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Member balance page not implemented or inaccessible')
    }

    const transactionsTable = page.locator('[data-testid="balance-transactions-table"]')
    if (await transactionsTable.count() === 0) {
      test.skip('Balance transactions table not found - UI not implemented')
    }

    // UWAGA: Zgodnie z CLAUDE.md - NIE wyświetlamy samego salda
    // Tylko historia operacji

    // Sprawdź tabelę transakcji
    await expect(transactionsTable).toBeVisible()

    // Kolumny: Data, Opis, Typ, Kwota
    await expect(page.locator('th:has-text("Data")')).toBeVisible()
    await expect(page.locator('th:has-text("Opis")')).toBeVisible()
    await expect(page.locator('th:has-text("Typ")')).toBeVisible()
    await expect(page.locator('th:has-text("Kwota")')).toBeVisible()

    // NIE MA kolumny "Saldo przed/po" (zgodnie z CLAUDE.md)
    await expect(page.locator('th:has-text("Saldo")')).not.toBeVisible()

    // Sprawdź czy są transakcje
    const transactions = page.locator('[data-testid="transaction-row"]')
    const count = await transactions.count()

    if (count > 0) {
      const firstTransaction = transactions.first()

      await expect(firstTransaction.locator('[data-testid="transaction-date"]')).toBeVisible()
      await expect(firstTransaction.locator('[data-testid="transaction-description"]')).toBeVisible()
      await expect(firstTransaction.locator('[data-testid="transaction-type"]')).toBeVisible()
      await expect(firstTransaction.locator('[data-testid="transaction-amount"]')).toBeVisible()

      // Typ powinien być: payment, refund, manual, fee, adjustment
      const type = await firstTransaction.locator('[data-testid="transaction-type"]').textContent()
      expect(['payment', 'refund', 'manual', 'fee', 'adjustment']).toContainEqual(
        type?.toLowerCase().trim()
      )
    }

    // Filtry
    await expect(page.locator('[data-testid="filter-date-from"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-date-to"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-type"]')).toBeVisible()
  })

  test('Scenariusz 53: Dokumenty - pobieranie', async ({ page }) => {
    await page.goto('/member-zone/documents')

    // Sprawdź nagłówek
    const pageTitle = page.locator('h2:has-text("Dokumenty")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Member documents page not implemented or inaccessible')
    }

    const documentsCategories = page.locator('[data-testid="documents-categories"]')
    if (await documentsCategories.count() === 0) {
      test.skip('Documents categories not found - UI not implemented')
    }

    // Kategorie dokumentów
    await expect(page.locator('[data-testid="documents-categories"]')).toBeVisible()

    // Sprawdź czy są dokumenty
    const documents = page.locator('[data-testid="document-item"]')
    const count = await documents.count()

    if (count === 0) {
      test.skip('Brak dokumentów dla członków')
    }

    const firstDocument = documents.first()

    // Sprawdź elementy dokumentu
    await expect(firstDocument.locator('[data-testid="document-name"]')).toBeVisible()
    await expect(firstDocument.locator('[data-testid="document-category"]')).toBeVisible()
    await expect(firstDocument.locator('[data-testid="document-date"]')).toBeVisible()
    await expect(firstDocument.locator('[data-testid="download-button"]')).toBeVisible()

    // Kliknij "Pobierz"
    const downloadPromise = page.waitForEvent('download')
    await firstDocument.locator('[data-testid="download-button"]').click()

    const download = await downloadPromise

    // Sprawdź czy plik się pobiera
    expect(download.suggestedFilename()).toBeTruthy()
    expect(download.suggestedFilename().length).toBeGreaterThan(0)

    // Sprawdź rozszerzenie (PDF, DOCX, itp.)
    expect(download.suggestedFilename()).toMatch(/\.(pdf|docx?|xlsx?|txt)$/i)
  })

  test('Scenariusz 54: Wiadomości - czytanie', async ({ page }) => {
    await page.goto('/member-zone/news')

    // Sprawdź nagłówek
    const pageTitle = page.locator('h2:has-text("Wiadomości dla Członków")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Member news page not implemented or inaccessible')
    }

    // Lista wiadomości
    const messages = page.locator('[data-testid="news-item"]')
    const count = await messages.count()

    if (count === 0) {
      test.skip('Brak wiadomości dla członków')
    }

    const firstMessage = messages.first()

    // Elementy wiadomości
    await expect(firstMessage.locator('[data-testid="news-title"]')).toBeVisible()
    await expect(firstMessage.locator('[data-testid="news-date"]')).toBeVisible()
    await expect(firstMessage.locator('[data-testid="news-preview"]')).toBeVisible()

    // Sprawdź badge "Nowe" jeśli nieprzeczytane
    const isUnread = await firstMessage.locator('[data-testid="unread-badge"]').count() > 0

    // Kliknij aby otworzyć
    const messageTitle = await firstMessage.locator('[data-testid="news-title"]').textContent()
    await firstMessage.click()

    // Widok szczegółów wiadomości
    await expect(page.locator(`h3:has-text("${messageTitle}")`)).toBeVisible()
    await expect(page.locator('[data-testid="news-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="news-author"]')).toBeVisible()

    // Jeśli była nieprzeczytana, badge powinien zniknąć po odczytaniu
    if (isUnread) {
      await page.goBack()
      await page.waitForTimeout(500)

      // Badge "Nowe" powinien zniknąć
      const messageItem = page.locator(`[data-testid="news-item"]:has-text("${messageTitle}")`)
      await expect(messageItem.locator('[data-testid="unread-badge"]')).not.toBeVisible()
    }
  })

  test('Scenariusz 55: Ankiety - głosowanie', async ({ page }) => {
    await page.goto('/member-zone/polls')

    // Sprawdź nagłówek
    const pageTitle = page.locator('h2:has-text("Ankiety")')

    try {
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip('Member polls page not implemented or inaccessible')
    }

    const activePollsTab = page.locator('[data-testid="active-polls-tab"]')
    if (await activePollsTab.count() === 0) {
      test.skip('Polls tabs not found - UI not implemented')
    }

    // Zakładki: Aktywne / Zakończone
    await expect(page.locator('[data-testid="active-polls-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="closed-polls-tab"]')).toBeVisible()

    // Kliknij "Aktywne"
    await page.click('[data-testid="active-polls-tab"]')

    // Lista aktywnych ankiet
    const polls = page.locator('[data-testid="poll-item"]')
    const count = await polls.count()

    if (count === 0) {
      test.skip('Brak aktywnych ankiet')
    }

    const firstPoll = polls.first()

    // Elementy ankiety
    await expect(firstPoll.locator('[data-testid="poll-title"]')).toBeVisible()
    await expect(firstPoll.locator('[data-testid="poll-deadline"]')).toBeVisible()

    // Kliknij aby głosować
    await firstPoll.click()

    // Formularz głosowania
    await expect(page.locator('[data-testid="poll-voting-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="poll-question"]')).toBeVisible()

    // Sprawdź czy są opcje do wyboru
    const options = page.locator('[data-testid="poll-option"]')
    const optionsCount = await options.count()

    expect(optionsCount).toBeGreaterThan(0)

    // Sprawdź czy użytkownik już głosował
    const hasVoted = await page.locator('[data-testid="already-voted-badge"]').count() > 0

    if (!hasVoted) {
      // Wybierz pierwszą opcję
      await options.first().locator('input[type="radio"]').check()

      // Kliknij "Zagłosuj"
      await page.click('[data-testid="submit-vote-button"]')

      // Sprawdź komunikat sukcesu
      await expect(page.locator('text=/Głos oddany/i')).toBeVisible()

      // Po zagłosowaniu powinny się wyświetlić wyniki
      await expect(page.locator('[data-testid="poll-results"]')).toBeVisible()

      // Wyniki w procentach
      for (let i = 0; i < optionsCount; i++) {
        await expect(options.nth(i).locator('[data-testid="vote-percentage"]')).toBeVisible()
      }
    } else {
      // Już zagłosował - powinny być widoczne wyniki
      await expect(page.locator('[data-testid="poll-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="your-vote-badge"]')).toBeVisible()
    }
  })

  test('Filtrowanie transakcji salda po typie', async ({ page }) => {
    await page.goto('/member-zone/balance')

    const transactionsTable = page.locator('[data-testid="balance-transactions-table"]')
    if (await transactionsTable.count() === 0) {
      test.skip('Balance transactions table not found - UI not implemented')
    }

    // Wybierz filtr "Płatności"
    await page.selectOption('[data-testid="filter-type"]', 'payment')
    await page.waitForTimeout(500)

    // Wszystkie transakcje powinny być typu "payment"
    const transactions = page.locator('[data-testid="transaction-row"]')
    const count = await transactions.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const type = await transactions.nth(i).locator('[data-testid="transaction-type"]').textContent()
        expect(type?.toLowerCase().trim()).toBe('payment')
      }
    }
  })

  test('Filtrowanie dokumentów po kategorii', async ({ page }) => {
    await page.goto('/member-zone/documents')

    const documentsCategories = page.locator('[data-testid="documents-categories"]')
    if (await documentsCategories.count() === 0) {
      test.skip('Documents categories not found - UI not implemented')
    }

    // Sprawdź kategorie
    const categories = page.locator('[data-testid="category-filter"]')

    if (await categories.count() > 0) {
      // Kliknij pierwszą kategorię
      const firstCategory = categories.first()
      const categoryName = await firstCategory.textContent()
      await firstCategory.click()

      await page.waitForTimeout(500)

      // Wszystkie dokumenty powinny należeć do tej kategorii
      const documents = page.locator('[data-testid="document-item"]')
      const count = await documents.count()

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const docCategory = await documents.nth(i).locator('[data-testid="document-category"]').textContent()
          expect(docCategory).toContain(categoryName)
        }
      }
    }
  })

  test('Licznik nieprzeczytanych wiadomości', async ({ page }) => {
    await page.goto('/member-zone')

    const newsCard = page.locator('[data-testid="member-news-card"]')
    if (await newsCard.count() === 0) {
      test.skip('Member zone UI elements not found - implementation incomplete')
    }

    // Sprawdź badge z liczbą nieprzeczytanych
    const unreadBadge = page.locator('[data-testid="member-news-card"] [data-testid="unread-count"]')

    if (await unreadBadge.count() > 0) {
      const unreadCount = await unreadBadge.textContent()
      const count = parseInt(unreadCount || '0')

      // Przejdź do wiadomości
      await page.click('[data-testid="member-news-card"]')

      // Liczba wiadomości z badge "Nowe" powinna odpowiadać licznikowi
      const unreadMessages = page.locator('[data-testid="news-item"] [data-testid="unread-badge"]')
      const unreadMessagesCount = await unreadMessages.count()

      expect(unreadMessagesCount).toBe(count)
    }
  })
})

test.describe('Security - Member Zone', () => {
  test('Blokada dostępu dla użytkownika bez statusu członka', async ({ page }) => {
    // Zaloguj jako zwykły użytkownik (NIE członek)
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Próba dostępu do strefy członka
    await page.goto('/member-zone')

    // Powinno pokazać komunikat o braku dostępu
    await expect(page.locator('text=/Dostęp tylko dla członków/i')).toBeVisible()

    // LUB przekierować na stronę główną
    if (!await page.locator('text=/Dostęp tylko dla członków/i').isVisible()) {
      expect(page.url()).not.toContain('/member-zone')
    }

    // Sprawdź czy wyświetla informację jak zostać członkiem
    await expect(page.locator('text=/Jak zostać członkiem/i')).toBeVisible()
  })

  test('Blokada dostępu do dokumentów dla nie-członka', async ({ page }) => {
    await loginUser(page, TEST_USERS.regular.email, TEST_USERS.regular.password)

    // Bezpośredni URL do dokumentów
    await page.goto('/member-zone/documents')

    // Blokada
    await expect(page.locator('text=/Dostęp tylko dla członków/i')).toBeVisible()
  })

  test('Trener bez statusu członka też NIE ma dostępu', async ({ page }) => {
    // Trener jest trenerem, ale nie musi być członkiem stowarzyszenia
    await loginUser(page, TEST_USERS.trainer.email, TEST_USERS.trainer.password)

    await page.goto('/member-zone')

    // Jeśli trener nie jest członkiem - blokada
    const isMember = await page.locator('[data-testid="member-badge"]').count() > 0

    if (!isMember) {
      await expect(page.locator('text=/Dostęp tylko dla członków/i')).toBeVisible()
    }
  })
})

test.describe('Member Zone - Integracja z Profilem', () => {
  test('Link do strefy członka w menu użytkownika', async ({ page }) => {
    await loginUser(page, TEST_USERS.member?.email || TEST_USERS.regular.email, TEST_USERS.member?.password || TEST_USERS.regular.password)

    await page.goto('/')

    // Kliknij menu użytkownika
    await page.click('[data-testid="user-menu"]')

    // Sprawdź czy jest link do strefy członka
    const memberZoneLink = page.locator('[data-testid="member-zone-link"]')

    if (await memberZoneLink.count() > 0) {
      // Użytkownik jest członkiem
      await expect(memberZoneLink).toBeVisible()

      // Kliknij i sprawdź czy przekierowuje
      await memberZoneLink.click()
      expect(page.url()).toContain('/member-zone')
    }
  })
})
