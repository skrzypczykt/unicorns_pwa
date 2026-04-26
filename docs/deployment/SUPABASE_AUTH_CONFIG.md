# Supabase Auth Configuration - Napraw Rejestracją

## Problem
Użytkownicy dostają:
1. Komunikat o konieczności kontaktu z administratorem
2. Email z uszkodzonym linkiem weryfikacyjnym

## Rozwiązanie - Konfiguracja URL w Supabase

### Krok 1: URL Configuration
Przejdź do: https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/url-configuration

**Site URL:**
```
https://unicorns-test.netlify.app
```

**Redirect URLs** (dodaj wszystkie):
```
https://unicorns-test.netlify.app/**
https://unicorns-test.netlify.app/login
http://localhost:5173/**
http://localhost:5173/login
```

### Krok 2: Email Templates (opcjonalnie)
Przejdź do: https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/templates

**Confirm signup** template - upewnij się, że zawiera poprawny link:
```
{{ .ConfirmationURL }}
```

Jeśli chcesz zmienić template na polski:
```html
<h2>Potwierdź swoją rejestrację</h2>
<p>Witaj w Unicorns Łódź!</p>
<p>Kliknij w poniższy link, aby aktywować swoje konto:</p>
<p><a href="{{ .ConfirmationURL }}">Potwierdź email</a></p>
<p>Lub skopiuj ten link do przeglądarki:</p>
<p>{{ .ConfirmationURL }}</p>
```

### Krok 3: Email Provider (sprawdź konfigurację)
Przejdź do: https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/providers

**Email** → Configuration:
- ✅ **Enable email confirmations**: TAK (zalecane dla bezpieczeństwa)
- ✅ **Secure email change**: TAK
- ⏱️ **Email confirmation expiry**: 86400 (24h)

### Alternatywa: Wyłącz Email Confirmation (NIE ZALECANE)
Jeśli chcesz wyłączyć weryfikację email (mniej bezpieczne):
1. https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/providers
2. Email → Configuration
3. **Enable email confirmations** → wyłącz
4. Zapisz

**UWAGA:** To ułatwi rejestrację, ale pozwoli na tworzenie kont z fałszywymi emailami.

## Testowanie

### 1. Zarejestruj testowe konto:
- Email: test@example.com
- Hasło: Test123!
- Imię: Test User

### 2. Sprawdź email:
- Link powinien wyglądać: `https://unicorns-test.netlify.app/login?token=...`
- Po kliknięciu powinno przekierować do `/login`
- Zaloguj się swoimi danymi

### 3. Sprawdź w konsoli:
```sql
-- W Supabase SQL Editor:
SELECT id, email, display_name, role, balance 
FROM users 
WHERE email = 'test@example.com';
```

## Troubleshooting

### Błąd: "Nie udało się utworzyć profilu użytkownika"
**Przyczyna:** Użytkownik został utworzony w `auth.users`, ale nie w `public.users`

**Rozwiązanie:**
1. Sprawdź RLS policies dla tabeli `users`
2. Sprawdź czy trigger tworzy automatycznie profil
3. Ręcznie dodaj użytkownika jeśli potrzeba:
```sql
INSERT INTO public.users (id, email, display_name, role, balance)
VALUES (
  'user-id-from-auth',
  'email@example.com',
  'Display Name',
  'user',
  0.00
);
```

### Błąd: Duplikat klucza (23505)
**Przyczyna:** Użytkownik już istnieje w bazie

**Rozwiązanie:** Użytkownik powinien się zalogować, nie rejestrować ponownie

### Link weryfikacyjny przekierowuje na localhost
**Przyczyna:** Site URL ustawiony na localhost zamiast production URL

**Rozwiązanie:** Zmień Site URL na `https://unicorns-test.netlify.app`

## Zmienione pliki w kodzie

- `frontend/src/pages/RegisterPage.tsx`:
  - Dodano `emailRedirectTo` w options
  - Dodano obsługę duplikatu (23505)
  - Poprawiono wiadomości błędów
  - Zaktualizowano modal z instrukcjami

## Po deploymencie

1. ✅ Kod zmieniony - zawiera poprawny `emailRedirectTo`
2. ⚠️ **WAŻNE:** Musisz zaktualizować konfigurację Supabase (kroki 1-3 powyżej)
3. ✅ Commit i push do GitHub (automatyczny deploy Netlify)
4. 🧪 Przetestuj rejestrację
