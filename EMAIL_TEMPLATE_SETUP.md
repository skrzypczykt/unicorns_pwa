# Email Template Configuration - Instrukcja

## ✅ Co zostało przygotowane:

1. **config.toml** - Zaktualizowany z:
   - `enable_confirmations = true`
   - `site_url = "https://unicorns-test.netlify.app"`
   - `additional_redirect_urls` z production i localhost
   - Template configuration dla confirmation email

2. **supabase/templates/confirmation.html** - Polski szablon HTML z:
   - Logo Unicorns 🦄
   - Gradient button (pink→purple→blue)
   - Instrukcje krok po kroku
   - Backup link (gdyby button nie działał)
   - Footer z social media links

## ⚠️ Jak wgrać konfigurację do Supabase Cloud:

Niestety **Supabase CLI nie wspiera** automatycznego wgrywania konfiguracji auth do zdalnego projektu.
Musisz to zrobić **ręcznie w Dashboard**.

### Opcja 1: Dashboard (Zalecane)

**1. Włącz Email Confirmation:**
👉 https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/providers

- Email → **"Enable email confirmations"** → **ON** ✅
- Zapisz

**2. Skonfiguruj URL:**
👉 https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/url-configuration

- **Site URL**: `https://unicorns-test.netlify.app`
- **Redirect URLs**:
  ```
  https://unicorns-test.netlify.app/**
  https://unicorns-test.netlify.app/login
  http://localhost:5173/**
  ```

**3. Zaktualizuj Email Template:**
👉 https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr/auth/templates

- Kliknij **"Confirm signup"**
- Skopiuj zawartość z `supabase/templates/confirmation.html`
- Wklej do edytora
- **Ważne**: Subject zmień na: `Potwierdź swoją rejestrację w Unicorns Łódź`
- Kliknij **Save**

### Opcja 2: Supabase Management API (Zaawansowane)

Możesz użyć Management API, ale wymaga to Personal Access Token:

```bash
# 1. Wygeneruj token: https://supabase.com/dashboard/account/tokens
# 2. Export token
export SUPABASE_ACCESS_TOKEN="sbp_..."

# 3. Update auth config (przykład)
curl -X PATCH \
  "https://api.supabase.com/v1/projects/tezpojcudbjlkcilwwjr/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "SITE_URL": "https://unicorns-test.netlify.app",
    "SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION": false
  }'
```

Ale **email templates nie można** zaktualizować przez API - tylko przez Dashboard.

## 🧪 Test lokalny (opcjonalnie):

Jeśli chcesz przetestować template lokalnie przed wgraniem:

```bash
# 1. Start local Supabase
supabase start

# 2. Otwórz Inbucket (local email testing)
# http://localhost:54324

# 3. Otwórz Studio
# http://localhost:54323

# 4. Zarejestruj testowe konto przez localhost:5173/register

# 5. Email pojawi się w Inbucket z twoim templatem!
```

## 📝 Verification Checklist:

Po wgraniu konfiguracji do Dashboard, zweryfikuj:

- [ ] Email confirmation włączone
- [ ] Site URL: `https://unicorns-test.netlify.app`
- [ ] Redirect URLs zawierają production i localhost
- [ ] Email template zaktualizowany (subject + HTML)
- [ ] Przetestuj rejestrację z prawdziwym emailem
- [ ] Sprawdź czy email przychodzi (może być w SPAM)
- [ ] Sprawdź czy link przekierowuje do `/login`
- [ ] Zaloguj się po kliknięciu linku

## 🎨 Wygląd emaila:

Template zawiera:
- **Header**: 🦄 logo + "Unicorns Łódź" + "Sport | Kultura | Rozrywka"
- **Gradient button**: Różowy→Fioletowy→Niebieski (jak w aplikacji)
- **Info box**: Krok po kroku co zrobić
- **Backup link**: Gdyby przycisk nie działał
- **Footer**: Social media + website links
- **Responsive**: Działa na mobile i desktop

## 📌 Ważne:

- Template używa `{{ .ConfirmationURL }}` - to zmienna Supabase z linkiem weryfikacyjnym
- Link jest ważny 24h (można zmienić w config: `otp_expiry`)
- Po kliknięciu użytkownik trafia na `site_url + redirect_uri`

## 🔄 Future: Automatyzacja

W przyszłości możesz rozważyć:
- Terraform dla Supabase infrastructure as code
- CI/CD pipeline z Supabase CLI + Management API
- Ale email templates zawsze trzeba ręcznie przez Dashboard
