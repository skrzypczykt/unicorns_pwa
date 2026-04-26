# Konfiguracja Środowiska Testowego Supabase

Instrukcja seedowania danych testowych dla E2E testów Playwright.

## Krok 1: Ustaw Secret w Supabase Vault

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz projekt testowy
3. Przejdź do **Settings** → **Vault**
4. Kliknij **New secret**
5. Wypełnij formularz:
   - **Name**: `test_user_password`
   - **Secret**: `TestPass123!` (lub inne bezpieczne hasło)
6. Kliknij **Create secret**

### Bezpieczeństwo

- ✅ Hasło przechowywane w zaszyfrowanej bazie Vault
- ✅ Nie ma w plain text w repozytorium
- ✅ Dostęp tylko przez `vault.decrypted_secrets` w SQL
- ✅ Nie jest widoczne w logach GitHub Actions

## Krok 2: Uruchom Skrypt Seedowania

1. W Supabase Dashboard przejdź do **SQL Editor**
2. Kliknij **New query**
3. Skopiuj zawartość pliku `supabase/seed-test-env.sql`
4. Wklej do edytora
5. Kliknij **Run** (lub Ctrl+Enter)

### Co zostanie utworzone?

**Użytkownicy testowi (wszyscy z tym samym hasłem z Vault):**

| Email | Rola | Typ |
|-------|------|-----|
| `test.user@unicorns-test.local` | `user` | Zwykły użytkownik |
| `admin@unicorns-test.local` | `admin` | Administrator |
| `trainer@unicorns-test.local` | `trainer` | Trener |
| `member@unicorns-test.local` | `user` | Członek stowarzyszenia |

**Dane testowe:**
- 3 sekcje (Badminton, Joga, Inne)
- 5 zajęć (różne typy)
- 3 rezerwacje
- Transakcje salda

## Krok 3: Konfiguracja Haseł dla Testów

### Testy Lokalne

1. Skopiuj plik przykładowy:
   ```bash
   cd frontend
   cp .env.test.example .env.test
   ```

2. Edytuj `.env.test` i ustaw hasło (to samo co w Supabase Vault):
   ```bash
   TEST_USER_PASSWORD=Uj7#mK9$nR2@pL5!qW8
   ```

3. **NIE COMMITUJ** pliku `.env.test` - jest w `.gitignore`

### GitHub Actions (CI)

1. Przejdź do repozytorium GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Kliknij **New repository secret**
4. Wypełnij:
   - **Name**: `TEST_USER_PASSWORD`
   - **Secret**: `Uj7#mK9$nR2@pL5!qW8` (to samo co w Vault)
5. Kliknij **Add secret**

GitHub Actions automatycznie użyje tego secretu w testach E2E.

## Krok 4: Uruchom Testy E2E

```bash
cd frontend
npm run test:e2e
```

## Troubleshooting

### Błąd: "Secret test_user_password nie istnieje w Vault"

**Rozwiązanie:** Upewnij się że stworzyłeś secret dokładnie z nazwą `test_user_password` (bez spacji, wielkość liter ma znaczenie).

### Błąd: "auth.users permission denied"

**Rozwiązanie:** Uruchom skrypt jako użytkownik z uprawnieniami `postgres` (w SQL Editor Supabase to jest domyślne).

### Testy E2E failują z "Invalid login credentials"

**Przyczyny:**
1. Secret `test_user_password` ma inne hasło niż w testach
2. Użytkownicy nie zostali utworzeni w `auth.users`

**Rozwiązanie:** 
1. Sprawdź wartość secretu w Vault
2. Uruchom ponownie `seed-test-env.sql`
3. Sprawdź czy hasło w `frontend/tests/helpers/auth.ts` (`TEST_USERS`) pasuje do secretu

## Rotacja Haseł

Aby zmienić hasło użytkowników testowych:

1. Zaktualizuj secret w Vault (Settings → Vault → `test_user_password` → Edit)
2. Uruchom ponownie `seed-test-env.sql` (nadpisze istniejących użytkowników)
3. Zaktualizuj hasło lokalnie w `.env.test`

## Production vs Test

**⚠️ NIGDY nie używaj tych samych haseł w produkcji!**

- Test: `test_user_password` w Vault projektu testowego
- Produkcja: Osobny projekt Supabase, osobne hasła, osobne secrets

---

**Ostatnia aktualizacja:** 2026-04-26
