# Konfiguracja Email Verification w Supabase

## WAŻNE: Wymagana manualna konfiguracja w Supabase Dashboard

Kod frontendowy obsługuje weryfikację email, ale wymaga włączenia tej funkcji w panelu Supabase.

## Kroki konfiguracji:

### 1. Włącz Email Confirmation

1. Otwórz Supabase Dashboard: https://app.supabase.com
2. Wybierz projekt: `tezpojcudbjlkcilwwjr`
3. Przejdź do: **Authentication** → **Providers** → **Email**
4. Włącz opcję: **Confirm email** ✅
5. Kliknij **Save**

### 2. Skonfiguruj Redirect URL

1. W tym samym panelu (Authentication → Providers → Email)
2. W sekcji **"Redirect URLs"** dodaj:
   ```
   https://unicorns-test.netlify.app/auth/callback
   ```
3. Dla developmentu lokalnego dodaj także:
   ```
   http://localhost:5173/auth/callback
   ```
4. Kliknij **Save**

### 3. Dostosuj szablon emaila (opcjonalnie)

1. Przejdź do: **Authentication** → **Email Templates**
2. Wybierz szablon: **Confirm signup**
3. Zmień język na polski (przykład):

**Subject:**
```
Potwierdź swój adres email - Unicorns Łódź
```

**Body (HTML):**
```html
<h2>Witaj w Unicorns Łódź! 🦄</h2>

<p>Dziękujemy za rejestrację w naszej aplikacji.</p>

<p>Kliknij w poniższy link aby potwierdzić swój adres email:</p>

<p><a href="{{ .ConfirmationURL }}">Potwierdź email</a></p>

<p>Link jest ważny przez 24 godziny.</p>

<p>Jeśli nie rejestrowałeś się w naszej aplikacji, zignoruj tego emaila.</p>

<hr>
<p style="font-size: 12px; color: #666;">
  Unicorns Łódź - Sport | Kultura | Rozrywka<br>
  Stowarzyszenie sportowo-kulturalno-rozrywkowe
</p>
```

4. Kliknij **Save**

### 4. Testowanie

Po włączeniu weryfikacji email:

1. Zarejestruj nowe konto w aplikacji
2. Sprawdź skrzynkę email (także SPAM)
3. Kliknij link weryfikacyjny
4. Zostaniesz przekierowany na `/auth/callback`
5. Po weryfikacji przejdziesz automatycznie do `/login`

### 5. Weryfikacja konfiguracji

Sprawdź czy wszystko działa:

```bash
# Test flow:
1. Otwórz https://unicorns-test.netlify.app
2. Kliknij "Zarejestruj się"
3. Wypełnij formularz i wyślij
4. Powinien pojawić się modal: "Sprawdź swoją skrzynkę!"
5. Sprawdź email i kliknij link
6. Przekierowanie na /auth/callback → sukces → /login
7. Zaloguj się - powinno zadziałać
```

### 6. Rozwiązywanie problemów

**Problem**: Nie otrzymuję emaila weryfikacyjnego
- Sprawdź folder SPAM
- Sprawdź czy Confirm email jest włączone w Supabase
- Sprawdź logi w Supabase Dashboard → Logs

**Problem**: Link weryfikacyjny nie działa
- Sprawdź czy Redirect URL jest poprawnie ustawiony
- Sprawdź czy domena w Redirect URL zgadza się z deploymentem

**Problem**: "Email already registered" przy próbie ponownej rejestracji
- To normalne - email jest już w bazie
- Możesz usunąć użytkownika z: Authentication → Users (w Supabase Dashboard)

## Dodatkowe opcje (opcjonalne)

### Blokowanie logowania przed weryfikacją

Aktualnie: kod frontendowy sprawdza czy email jest zweryfikowany i pokazuje odpowiedni komunikat.

Jeśli chcesz całkowicie zablokować niezweryfikowane konta na poziomie bazy:
1. Przejdź do: Database → Tables → `auth.users`
2. Nie ma gotowej opcji - frontend już to obsługuje

### Czas ważności linku

Domyślnie: 24 godziny
Zmiana: Authentication → Settings → "Email confirmation validity" (jeśli dostępne)

## Status implementacji

✅ Frontend gotowy:
- AuthCallbackPage.tsx - obsługa przekierowania po kliknięciu linku
- RegisterPage.tsx - modal z informacją o weryfikacji email
- SimpleLoginPage.tsx - błąd dla niezweryfikowanych + przycisk resend
- App.tsx - route /auth/callback

⚠️ Wymaga konfiguracji:
- Włączenie "Confirm email" w Supabase Dashboard (MANUALNE)
- Dodanie Redirect URL (MANUALNE)
- Opcjonalnie: dostosowanie szablonu emaila (MANUALNE)

## Kontakt

W razie problemów sprawdź:
- Supabase Dashboard → Logs
- Konsola przeglądarki (F12)
- Network tab w DevTools
