# 🧪 Plan Testów Lokalnych - Przed Push

Data: 2026-04-21  
**WYKONAJ TE TESTY PRZED `git push`**

---

## ✅ CHECKLIST TESTÓW

### 1. ŚRODOWISKO LOKALNE (10 min)

#### A) Frontend - Dev Server
```bash
cd frontend
npm install  # Upewnij się że wszystkie zależności są zainstalowane
npm run dev
```

**Sprawdź:**
- [ ] Serwer uruchomiony bez błędów
- [ ] Brak błędów TypeScript w konsoli
- [ ] Brak błędów ESLint

**Oczekiwany output:**
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### B) Supabase - Migracje (jeśli nie były wykonane)
```bash
# TYLKO jeśli robisz migrację 038 pierwszy raz
cd ..
supabase db push  # Wypchnie migrację 038_webhook_events_log.sql
```

**Sprawdź:**
- [ ] Migracja wykonana bez błędów
- [ ] Tabela `webhook_events` utworzona

---

### 2. TESTY BEZPIECZEŃSTWA (15 min)

#### A) Content Security Policy (CSP)
```bash
# Otwórz http://localhost:5173/ w przeglądarce
# Otwórz Developer Tools (F12) → Console
```

**Sprawdź:**
- [ ] BRAK błędów CSP (np. "Refused to load...")
- [ ] Brak błędów CORS

**Jeśli są błędy CSP:**
- Dodaj brakujące domeny do `netlify.toml` w `Content-Security-Policy`

#### B) CORS Headers (Edge Functions)
```bash
# Test validate-registration
curl -X OPTIONS http://localhost:54321/functions/v1/validate-registration \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Sprawdź response headers:**
- [ ] `Access-Control-Allow-Origin: http://localhost:5173` (NIE '*')
- [ ] `Access-Control-Allow-Methods` zawiera POST
- [ ] `Access-Control-Allow-Headers` zawiera authorization

#### C) Security Headers
```bash
# Po deployu na Netlify sprawdź (albo użyj https://securityheaders.com)
curl -I https://[twoj-site].netlify.app
```

**Sprawdź obecność:**
- [ ] `Strict-Transport-Security`
- [ ] `Content-Security-Policy`
- [ ] `X-Frame-Options`
- [ ] `X-Content-Type-Options`
- [ ] `Permissions-Policy`

---

### 3. TESTY FUNKCJONALNOŚCI (20 min)

#### A) Strony Płatności

**Test 1: Payment Success**
```
1. Otwórz: http://localhost:5173/payment-success?OrderID=reg_test-123
2. Sprawdź że:
   - [ ] Strona ładuje się bez błędów
   - [ ] Widoczny komunikat "Płatność w trakcie" (bo test-123 nie istnieje)
   - [ ] Przyciski działają
```

**Test 2: Payment Cancel**
```
1. Otwórz: http://localhost:5173/payment-cancel?OrderID=reg_test-123
2. Sprawdź że:
   - [ ] Strona ładuje się bez błędów
   - [ ] Widoczny komunikat "Płatność anulowana"
   - [ ] Przyciski działają
```

#### B) Admin Payment Dashboard

**Wymagane:** Zaloguj się jako admin

```
1. Otwórz menu hamburger
2. Kliknij Administracja → Płatności
3. Sprawdź że:
   - [ ] Strona ładuje się
   - [ ] Widoczne statystyki (mogą być puste)
   - [ ] Filtry działają
   - [ ] Brak błędów w konsoli
```

#### C) Payment Webhook (Lokalny test)

**Setup:**
```bash
# Terminal 1: Uruchom Supabase lokalnie
supabase start

# Terminal 2: Test webhook
curl -X POST http://localhost:54321/functions/v1/payment-webhook/autopay \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ServiceID=12345" \
  -d "OrderID=reg_test-456" \
  -d "Amount=3000" \
  -d "Currency=PLN" \
  -d "PaymentStatus=SUCCESS" \
  -d "Hash=test-hash-invalid"
```

**Oczekiwany rezultat:**
```json
{"error":"Invalid signature"}  // Status 401
```

**Dlaczego błąd?** To dobrze! Webhook odrzuca nieprawidłowy podpis.

**Sprawdź logi:**
```bash
supabase functions logs payment-webhook --tail
```

Powinno być:
```
=== Payment Webhook Received ===
Detected provider: autopay
❌ Signature verification failed
```

---

### 4. TESTY TYPESCRIPT (5 min)

```bash
cd frontend
npm run build:check  # TypeScript check + build
```

**Sprawdź:**
- [ ] ZERO błędów TypeScript
- [ ] Build kończy się sukcesem

**Najczęstsze błędy:**
- Missing imports
- Type mismatches
- Unused variables

---

### 5. TESTY BAZY DANYCH (10 min)

#### A) Sprawdź migrację

```sql
-- W Supabase Studio lub psql
SELECT * FROM webhook_events LIMIT 5;
```

**Sprawdź:**
- [ ] Tabela istnieje
- [ ] Kolumny: id, provider, order_id, amount, processed_status, created_at
- [ ] Indexes działają

#### B) Test funkcji

```sql
-- Test get_webhook_events_summary
SELECT * FROM get_webhook_events_summary(7);
```

**Oczekiwany rezultat:**
- Brak błędów (może być pusta tabela jeśli nie ma webhooków)

```sql
-- Test is_webhook_duplicate
SELECT is_webhook_duplicate('reg_test-123', 'autopay');
```

**Oczekiwany rezultat:**
```
false  (lub true jeśli taki webhook już istnieje)
```

#### C) RLS Policies

```sql
-- Test RLS dla admina
SET role authenticated;
SET request.jwt.claim.sub = '[admin-user-id]';

SELECT * FROM webhook_events;
```

**Sprawdź:**
- [ ] Admin widzi wszystkie webhook events
- [ ] User widzi tylko swoje (test z user_id)

---

### 6. TESTY PRZEGLĄDARKI (10 min)

#### A) Chrome DevTools

```
1. Otwórz http://localhost:5173
2. F12 → Network tab
3. Odśwież stronę
```

**Sprawdź:**
- [ ] Wszystkie requesty zwracają 200 OK
- [ ] Brak 404 Not Found (missing files)
- [ ] Brak 401/403 Unauthorized

#### B) Console Errors

```
F12 → Console tab
```

**Sprawdź:**
- [ ] ZERO błędów czerwonych (errors)
- [ ] Brak warnningów CSP
- [ ] Brak CORS errors

#### C) Responsywność

**Testuj na różnych rozmiarach:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Strony do przetestowania:**
- /payment-success
- /payment-cancel
- /admin/payments

---

### 7. TESTY WYDAJNOŚCI (5 min)

#### A) Lighthouse

```
Chrome DevTools → Lighthouse tab
Opcje: Performance, Accessibility, Best Practices
```

**Target scores:**
- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 95

#### B) Bundle Size

```bash
cd frontend
npm run build
ls -lh dist/assets/*.js
```

**Sprawdź:**
- [ ] Główny bundle < 500 KB
- [ ] Brak ogromnych chunków (> 1 MB)

---

### 8. GIT PRE-COMMIT CHECKS (5 min)

#### A) Sprawdź zmiany

```bash
git status
git diff
```

**Upewnij się:**
- [ ] Wszystkie pliki zamierzone są w stage
- [ ] Brak przypadkowych plików (.env, node_modules, .DS_Store)
- [ ] Brak console.log() w produkcyjnym kodzie

#### B) Lint

```bash
cd frontend
npm run lint
```

**Sprawdź:**
- [ ] ZERO błędów lintowania
- [ ] ZERO warnningów (lub tylko akceptowalne)

---

## 🚨 CZERWONE FLAGI - NIE PUSHUJ JEŚLI:

1. **TypeScript errors** - napraw wszystkie błędy TS
2. **CSP errors w konsoli** - dodaj brakujące domeny
3. **Webhook zwraca 500** - debuguj logikę
4. **RLS nie działa** - sprawdź policies
5. **Bundle > 1 MB** - zbyt duży, optymalizuj
6. **Lighthouse < 60** - optymalizuj performance

---

## ✅ GOTOWY DO PUSH - FINAL CHECKLIST

Przed wykonaniem `git push`:

- [ ] ✅ Frontend buduje się bez błędów (`npm run build:check`)
- [ ] ✅ TypeScript 0 errors
- [ ] ✅ ESLint 0 errors
- [ ] ✅ Migracja 038 działa
- [ ] ✅ Payment Success/Cancel pages działają
- [ ] ✅ Admin Payments Dashboard działa
- [ ] ✅ Webhook zwraca 401 dla invalid signature (to jest dobre!)
- [ ] ✅ CSP headers dodane w netlify.toml
- [ ] ✅ CORS ograniczony w Edge Functions
- [ ] ✅ Brak console.log() w kodzie produkcyjnym
- [ ] ✅ Brak secrets/credentials w kodzie
- [ ] ✅ CHANGELOG.md zaktualizowany
- [ ] ✅ Wersja w version.ts zaktualizowana (jeśli robisz release)

---

## 🎬 OSTATECZNA KOMENDA

Jeśli wszystkie testy przeszły:

```bash
# 1. Commit
git add .
git status  # Sprawdź ostatni raz co commitujesz
git commit -m "feat: Add payment webhook system and admin dashboard

- Universal webhook for 4 payment providers (Autopay, Stripe, PayU, Tpay)
- Payment success/cancel pages
- Admin payment dashboard with stats
- Webhook events logging to database
- Security improvements (CSP, HSTS, CORS restrictions)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 2. Push
git push origin main
```

---

## 📊 PO PUSH - TESTY PRODUKCYJNE

Po deploy na Netlify:

### 1. Sprawdź build

```
Netlify Dashboard → Deploys → Latest deploy
```

**Sprawdź:**
- [ ] Build succeeded
- [ ] Deploy time < 5 min
- [ ] Brak errors w logu

### 2. Test live site

```
https://[twoj-site].netlify.app
```

**Sprawdź:**
- [ ] Strona ładuje się
- [ ] Security headers obecne (curl -I)
- [ ] CSP działa (F12 console)

### 3. Test Supabase Edge Functions

```bash
# Deploy webhook (jeśli jeszcze nie)
supabase functions deploy payment-webhook

# Test
curl -X POST https://[projekt].supabase.co/functions/v1/payment-webhook/autopay \
  -d "ServiceID=test&OrderID=reg_test&Hash=invalid"
```

**Oczekiwany rezultat:**
```json
{"error":"Invalid signature"}
```

---

## 🐛 ROLLBACK PLAN

Jeśli coś pójdzie nie tak:

```bash
# 1. Natychmiastowy rollback
git revert HEAD
git push

# 2. Albo rollback do poprzedniego commita
git reset --hard HEAD~1
git push --force  # ⚠️ Tylko jeśli jesteś sam na branchu!

# 3. Albo rollback deploy w Netlify
Netlify Dashboard → Deploys → Previous deploy → Publish
```

---

**Powodzenia!** 🚀

Jeśli wszystkie testy przeszły - **śmiało pushuj!**

---

**Autor:** Claude Sonnet 4.5  
**Data:** 2026-04-21  
**Czas wykonania testów:** ~80 minut (pełny plan)  
**Czas wykonania (minimum):** ~30 minut (tylko krytyczne testy)
