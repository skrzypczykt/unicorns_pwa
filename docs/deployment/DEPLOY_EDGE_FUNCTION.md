# 🚀 Deploy Edge Function - CORS Fix

**Data:** 2026-04-21  
**Funkcja:** `generate-recurring-activities`  
**Problem:** CORS blocked from unicorns-test.netlify.app

---

## ✅ Co zostało naprawione (kod)

### Zmiany w `supabase/functions/generate-recurring-activities/index.ts`:

1. **Import CORS helper:**
   ```typescript
   import { getCorsHeaders } from '../_shared/cors.ts'
   ```

2. **Obsługa preflight OPTIONS:**
   ```typescript
   if (req.method === 'OPTIONS') {
     return new Response(null, {
       status: 204,
       headers: corsHeaders
     })
   }
   ```

3. **CORS headers we wszystkich response:**
   ```typescript
   headers: { 'Content-Type': 'application/json', ...corsHeaders }
   ```

4. **Weryfikacja autoryzacji (FIX 401):**
   ```typescript
   // Check Authorization header
   const authHeader = req.headers.get('Authorization')
   const token = authHeader.replace('Bearer ', '')
   
   // Verify JWT token
   const { data: { user }, error: authError } = await supabase.auth.getUser(token)
   
   // Check admin role
   const { data: profile } = await supabase
     .from('users')
     .select('role')
     .eq('id', user.id)
     .single()
   
   if (profile.role !== 'admin') {
     return 403 Forbidden
   }
   ```

---

## 🚀 WYMAGANE: Deploy funkcji do Supabase

**UWAGA:** Bez deploy funkcja NIE zadziała! Lokalne zmiany w kodzie nie są automatycznie wdrażane do Supabase Cloud.

### Krok 1: Login do Supabase (jeśli nie zalogowany)

```bash
supabase login
```

### Krok 2: Link projekt (jeśli nie linkowany)

```bash
supabase link --project-ref tezpojcudbjlkcilwwjr
```

### Krok 3: Deploy funkcji ⚠️ KRYTYCZNE

```bash
supabase functions deploy generate-recurring-activities
```

**Dlaczego deploy jest wymagany:**
- Git push NIE deployuje Edge Functions
- Supabase Cloud używa starej wersji kodu dopóki nie uruchomisz `deploy`
- Błąd "Unsupported JWT algorithm ES256" = stara wersja bez fix

**Oczekiwany output:**
```
Deploying function generate-recurring-activities (project ref: tezpojcudbjlkcilwwjr)
✓ Deployed function generate-recurring-activities
Function URL: https://tezpojcudbjlkcilwwjr.supabase.co/functions/v1/generate-recurring-activities
```

---

## 🧪 Test po deploy

### Test 1: CORS preflight (OPTIONS)

```bash
curl -X OPTIONS https://tezpojcudbjlkcilwwjr.supabase.co/functions/v1/generate-recurring-activities \
  -H "Origin: https://unicorns-test.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Oczekiwane headers w response:**
```
< HTTP/2 204
< access-control-allow-origin: https://unicorns-test.netlify.app
< access-control-allow-headers: authorization, x-client-info, apikey, content-type
< access-control-allow-methods: POST, GET, OPTIONS, PUT, DELETE
```

### Test 2: Z aplikacji (frontend)

1. Otwórz https://unicorns-test.netlify.app
2. Zaloguj jako admin
3. Administracja → Zajęcia
4. Utwórz wydarzenie cykliczne
5. Kliknij "Generuj instancje"

**Oczekiwany rezultat:**
- ✅ Brak błędu CORS w konsoli
- ✅ Sukces: "Utworzono X instancji"
- ✅ Nowe wydarzenia widoczne w liście

**Przed fix (błąd):**
```
Access to fetch at 'https://...supabase.co/functions/v1/generate-recurring-activities' 
from origin 'https://unicorns-test.netlify.app' has been blocked by CORS policy
```

**Po fix (sukces):**
```
Success: Generated 8 instances
```

---

## 📋 Checklist deploy

- [ ] Kod wypchany do repo (git push) ✅ DONE
- [ ] Zalogowany do Supabase CLI (`supabase login`)
- [ ] Linkowany projekt (`supabase link`)
- [ ] Deploy funkcji (`supabase functions deploy generate-recurring-activities`)
- [ ] Test OPTIONS request (curl)
- [ ] Test z aplikacji (create recurring event)
- [ ] Brak błędów CORS w konsoli przeglądarki

---

## 🔍 Troubleshooting

### Problem: "supabase: command not found"

**Rozwiązanie:**
```bash
# macOS
brew install supabase/tap/supabase

# Linux/WSL
curl -fsSL https://cli.supabase.com/install.sh | sh
```

### Problem: "Not logged in"

**Rozwiązanie:**
```bash
supabase login
# Otwórz link w przeglądarce i zaloguj się
```

### Problem: "Project not linked"

**Rozwiązanie:**
```bash
supabase link --project-ref tezpojcudbjlkcilwwjr
# Wybierz projekt z listy
```

### Problem: Deploy failed - "Import error"

**Możliwa przyczyna:** Ścieżka do `_shared/cors.ts` niepoprawna

**Rozwiązanie:**
Sprawdź że:
```bash
ls -la supabase/functions/_shared/cors.ts
# Plik musi istnieć
```

### Problem: Nadal CORS error po deploy

**Możliwe przyczyny:**
1. Funkcja nie została zdeployowana (check logs)
2. Cache przeglądarki (hard refresh: Ctrl+Shift+R)
3. Service Worker cache (disable SW w DevTools)

**Debug:**
```bash
# Sprawdź logi funkcji
supabase functions logs generate-recurring-activities --tail

# Sprawdź czy deploy się powiódł
supabase functions list
```

---

## 📊 Inne funkcje do rozważenia (opcjonalne)

Te funkcje NIE potrzebują CORS (są tylko cron jobs):

- ❌ `send-email-notification` - cron only
- ❌ `generate-recurring-activities-cron` - cron only
- ❌ `send-activity-start-notifications` - cron only
- ❌ `send-payment-reminders` - cron only
- ❌ `update-past-activities-status` - cron only

Te funkcje JUŻ MAJĄ CORS (zaktualizowane wcześniej):

- ✅ `validate-registration`
- ✅ `process-attendance`
- ✅ `generate-accounting-report`
- ✅ `update-balance`
- ✅ `delete-user-account`
- ✅ `send-push-notifications`
- ✅ `payment-webhook` (wszystkie providery)

---

## ✅ Gotowe!

Po deploy funkcji `generate-recurring-activities` problem CORS powinien być rozwiązany.

**Kontakt w razie problemów:**
- Sprawdź logi: `supabase functions logs generate-recurring-activities`
- GitHub Issue: https://github.com/skrzypczykt/unicorns_pwa/issues

---

**Autor:** Claude Sonnet 4.5  
**Data:** 2026-04-21
