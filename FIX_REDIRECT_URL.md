# 🚨 NAPRAW: "requested path is invalid"

## Problem

Link w emailu weryfikacyjnym pokazuje błąd:
```
requested path is invalid
```

## Przyczyna

Supabase **nie ma skonfigurowanych** redirect URLs dla Twojej domeny produkcyjnej.
Gdy użytkownik klika link w emailu, Supabase próbuje przekierować na Twoją stronę,
ale blokuje to bo URL nie jest na liście dozwolonych.

## ✅ Rozwiązanie (2 minuty)

### Krok 1: Otwórz URL Configuration

👉 **KLIKNIJ TUTAJ:**
https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/url-configuration

### Krok 2: Ustaw Site URL

W polu **"Site URL"** wpisz:
```
https://unicorns-test.netlify.app
```

### Krok 3: Dodaj Redirect URLs

Kliknij **"Add URL"** i dodaj WSZYSTKIE te adresy (jeden po drugim):

```
https://unicorns-test.netlify.app/*
```

```
https://unicorns-test.netlify.app/login
```

```
https://unicorns-test.netlify.app/auth/callback
```

```
http://localhost:5173/*
```

```
http://localhost:5173/login
```

**WAŻNE:** 
- Musi być `/*` (jeden slash), NIE `/**` (dwa slashe)
- Każdy URL w osobnej linii
- Nie zapomnij o `http://` i `https://`

### Krok 4: Zapisz

Kliknij **"Save"** na dole strony.

## 🧪 Test

Po zapisaniu:

1. **Nowy użytkownik** zarejestruje się
2. Dostanie **email z linkiem**
3. Kliknie w link
4. ✅ Zostanie **przekierowany** na `/login`
5. Zaloguje się i wejdzie do aplikacji

**Stary link** (z poprzedniego emailu) **nadal nie będzie działał** bo wygasł.
Trzeba zarejestrować się ponownie żeby dostać nowy link.

## 📋 Checklist

Po ustawieniu verify że:

- [ ] Site URL = `https://unicorns-test.netlify.app`
- [ ] Redirect URLs zawiera 5 adresów (3 production, 2 localhost)
- [ ] Zapisałeś zmiany
- [ ] Email confirmation jest włączone (Auth → Providers → Email)
- [ ] Przetestowałeś rejestrację z nowym emailem

## 🔍 Jak sprawdzić czy działa?

Po ustawieniu redirect URLs:

```bash
# 1. Zarejestruj nowe konto
# Email: test-$(date +%s)@example.com  # Unikalny email
# Hasło: Test123!

# 2. Sprawdź email (może być w SPAM)

# 3. Skopiuj link z emailu - powinien wyglądać:
# https://tezpojcudbjlkcilwwjr.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://unicorns-test.netlify.app/login

# 4. Kliknij link → powinno przekierować do:
# https://unicorns-test.netlify.app/login

# 5. Zaloguj się → powinno działać ✅
```

## ❓ Co jeśli nadal nie działa?

**Sprawdź w Supabase Dashboard:**
- Auth → URL Configuration → czy zapisało się?
- Auth → Providers → Email → czy "Enable email confirmations" jest ON?

**Sprawdź w Console przeglądarki** (F12):
- Czy są jakieś błędy CORS?
- Jaki jest dokładny URL przekierowania?

**Wyczyść cache:**
```bash
# Przeglądarka
Ctrl+Shift+Delete → Wyczyść cache

# Supabase może cachować konfigurację
# Poczekaj 1-2 minuty po zapisaniu
```

## 🎯 Dlaczego trigger działa ale widzisz błąd?

**TRIGGER DZIAŁA!** ✅
Sprawdziłem bazę - profil użytkownika `skrzypczykt@gmail.com` został utworzony:
```json
{
  "id": "1631a17e-8a4b-4b0a-8497-a51bb321865e",
  "email": "skrzypczykt@gmail.com",
  "display_name": "Tomasz Skrzypczyk",
  "role": "user",
  "balance": "0.00"
}
```

Błąd "Nie udało się utworzyć profilu użytkownika" był w **starej wersji** kodu.
Nowa wersja (po commit `2e7eb99`) już **nie pokazuje** tego błędu.

Jeśli widzisz ten błąd, oznacza to że:
1. Przeglądarka używa **starego JavaScript** (cache)
2. Netlify nie wdrożył jeszcze najnowszej wersji

**Rozwiązanie:**
- Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
- Przeładuj stronę (Ctrl+F5)
- Lub otwórz w trybie incognito

## 📊 Status

| Co | Status |
|----|--------|
| Trigger `handle_new_user()` | ✅ Działa |
| Profil w bazie | ✅ Utworzony |
| Email wysłany | ✅ Działa |
| Template polski | ✅ Wygląda dobrze |
| Link weryfikacyjny | ❌ Redirect URLs nie ustawione |
| Kod bez błędów | ✅ Zaktualizowany |

**Pozostało:** Ustawić Redirect URLs w Dashboard (5 minut)
