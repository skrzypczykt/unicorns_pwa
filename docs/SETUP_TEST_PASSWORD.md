# Instrukcja Ustawienia Nowego Hasła Testowego

**Nowe hasło:** `Uj7#mK9$nR2@pL5!qW8`

Stare hasła (`TestPass123!`) były scommitowane do repo i są publiczne. To nowe hasło musi być ustawione w 3 miejscach:

---

## 1. Supabase Vault (Środowisko Testowe)

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz projekt **testowy** (unicorns-test)
3. **Settings** → **Vault**
4. Jeśli secret `test_user_password` już istnieje:
   - Kliknij na niego → **Edit**
   - Zmień wartość na: `Uj7#mK9$nR2@pL5!qW8`
   - **Save**
5. Jeśli nie istnieje:
   - **New secret**
   - Name: `test_user_password`
   - Secret: `Uj7#mK9$nR2@pL5!qW8`
   - **Create secret**

---

## 2. Uruchom Skrypt Seedowania (Supabase SQL Editor)

1. W tym samym projekcie Supabase → **SQL Editor**
2. **New query**
3. Skopiuj zawartość pliku: `supabase/seed-test-env.sql`
4. Wklej do edytora
5. **Run** (Ctrl+Enter)

**Rezultat:** 
- Utworzy 4 użytkowników z nowym hasłem
- Doda przykładowe dane testowe
- Wyświetli podsumowanie

---

## 3. GitHub Actions Secret (CI/CD)

1. Przejdź do repozytorium GitHub: https://github.com/skrzypczykt/unicorns_pwa
2. **Settings** → **Secrets and variables** → **Actions**
3. Jeśli `TEST_USER_PASSWORD` już istnieje:
   - Kliknij **Update** obok niego
   - Zmień wartość na: `Uj7#mK9$nR2@pL5!qW8`
   - **Update secret**
4. Jeśli nie istnieje:
   - **New repository secret**
   - Name: `TEST_USER_PASSWORD`
   - Secret: `Uj7#mK9$nR2@pL5!qW8`
   - **Add secret**

---

## 4. Testy Lokalne (Twój Komputer)

1. Przejdź do katalogu frontend:
   ```bash
   cd frontend
   ```

2. Utwórz plik `.env.test` (skopiuj z przykładu):
   ```bash
   cp .env.test.example .env.test
   ```

3. Edytuj `.env.test`:
   ```bash
   TEST_USER_PASSWORD=Uj7#mK9$nR2@pL5!qW8
   BASE_URL=https://unicorns-test.netlify.app
   ```

4. **WAŻNE:** Plik `.env.test` jest w `.gitignore` - nie commituj go!

---

## Weryfikacja

### Test lokalny:
```bash
cd frontend
npm run test:e2e -- --project=chromium --grep="login"
```

Powinno zalogować się pomyślnie z nowym hasłem.

### Test GitHub Actions:
1. Push do branch `develop`
2. Sprawdź Actions → E2E Tests
3. Powinny przejść (używają secretu z GitHub)

---

## Konta Testowe

Po seedowaniu będą dostępne:

| Email | Hasło | Rola |
|-------|-------|------|
| test.user@unicorns-test.local | `Uj7#mK9$nR2@pL5!qW8` | user |
| admin@unicorns-test.local | `Uj7#mK9$nR2@pL5!qW8` | admin |
| trainer@unicorns-test.local | `Uj7#mK9$nR2@pL5!qW8` | trainer |
| member@unicorns-test.local | `Uj7#mK9$nR2@pL5!qW8` | member |

---

**Data utworzenia:** 2026-04-26
