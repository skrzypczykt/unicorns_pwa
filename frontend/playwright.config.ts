import { defineConfig, devices } from '@playwright/test'

/**
 * Konfiguracja Playwright dla testów E2E
 * Dokumentacja: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Uruchom testy równolegle
  fullyParallel: true,

  // Fail build jeśli zostawiono test.only() w CI
  forbidOnly: !!process.env.CI,

  // Retry w CI, brak retry lokalnie
  retries: process.env.CI ? 2 : 0,

  // Limit workerów - w CI 1, lokalnie auto
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: process.env.CI
    ? [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['html'], ['list']],

  use: {
    // Base URL aplikacji (może być override przez env variable)
    baseURL: process.env.BASE_URL || 'https://unicorns-test.netlify.app',

    // Trace tylko przy retry (oszczędność miejsca)
    trace: 'on-first-retry',

    // Screenshot tylko przy błędzie
    screenshot: 'only-on-failure',

    // Video tylko przy błędzie
    video: 'retain-on-failure',

    // Timeout dla pojedynczej akcji (np. click, fill)
    actionTimeout: 10000,
  },

  // Timeout dla całego testu
  timeout: 60000,

  // Przeglądarki do testowania
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Opcjonalnie: uruchom dev server lokalnie
  // Odkomentuj jeśli chcesz testować lokalną wersję
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
})
