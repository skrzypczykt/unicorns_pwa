# Unicorns PWA - Dokumentacja

Centralne miejsce dla całej dokumentacji projektu Unicorns PWA.

---

## 📚 Spis Treści

### 🚀 Start
- [README (główny)](../README.md) - Przegląd projektu, instalacja, quick start
- [CHANGELOG](../CHANGELOG.md) - Historia zmian i wersji

### 📖 Przewodniki (Guides)

#### Testowanie
- [**50 Scenariuszy Testów Manualnych**](guides/MANUAL_TESTING_SCENARIOS.md)  
  Szczegółowe scenariusze testów dla osób nietechnicznych (testerzy beta, wolontariusze)
  - Rejestracja i logowanie (8 scenariuszy)
  - Przeglądanie zajęć (8 scenariuszy)
  - Rezerwacje i płatności (12 scenariuszy)
  - Profil użytkownika (7 scenariuszy)
  - Wydarzenia online (3 scenariusze)
  - Panel admina (8 scenariuszy)
  - Wydajność i UX (4 scenariusze)

- [**Testing Strategy**](guides/TESTING_STRATEGY.md)  
  Strategia testów automatycznych (unit, integration, E2E) dla developerów

#### Zarządzanie Treścią
- [**Strategia Przechowywania Zdjęć**](guides/IMAGE_STORAGE_STRATEGY.md)  
  Hybrydowe podejście: GitHub repo (statyczne) + Cloudinary (dynamiczne)
  
- [**Workflow Dodawania Aktualności**](guides/NEWS_CONTENT_WORKFLOW.md)  
  Procedura dla osób nietechnicznych i tech-savvy, panel admina vs GitHub

#### Płatności
- [**Payment Testing Guide**](guides/PAYMENT_TESTING.md)  
  Testowanie płatności Autopay (BLIK, PayByLink, karty) w środowisku testowym
  
- [**Payment Webhook Guide**](guides/PAYMENT_WEBHOOK_GUIDE.md)  
  Konfiguracja i debugowanie webhooków płatności (ITN)

#### Funkcjonalności
- [**Push Notifications Setup**](guides/PUSH_NOTIFICATIONS_SETUP.md)  
  Konfiguracja powiadomień push dla wydarzeń online

- [**Versioning Strategy**](guides/VERSIONING.md)  
  Konwencje wersjonowania (semver) i workflow release'ów

### 🚀 Deployment

- [**Supabase Secrets**](deployment/SUPABASE_SECRETS.md)  
  Zmienne środowiskowe i sekrety (Autopay, Cloudinary, SMTP)
  
- [**Supabase Auth Config**](deployment/SUPABASE_AUTH_CONFIG.md)  
  Konfiguracja autentykacji (email, OAuth, redirect URLs)
  
- [**Supabase Email Config**](deployment/SUPABASE_EMAIL_CONFIG.md)  
  Konfiguracja email templates i SMTP

- [**Deploy Edge Functions**](deployment/DEPLOY_EDGE_FUNCTION.md)  
  Jak deployować Supabase Edge Functions (payment-initiate, autopay-webhook, itp.)

- [**Deploy External Trainer**](deployment/DEPLOY_EXTERNAL_TRAINER.md)  
  Instrukcje deploymentu dla funkcji trenerów zewnętrznych

- [**Email Template Setup**](deployment/EMAIL_TEMPLATE_SETUP.md)  
  Konfiguracja szablonów emaili w Supabase

### 📦 Archiwum (Archive)

Starsze dokumenty, case studies i plany implementacji. Treści mogą być nieaktualne.

- [Automatic Logout Implementation](archive/AUTOMATIC_LOGOUT_IMPLEMENTATION.md)
- [Case Study: Reregistration](archive/CASE_STUDY_REREGISTRATION.md)
- [CSP Improvements](archive/CSP_IMPROVEMENTS.md)
- [Fix Redirect URL](archive/FIX_REDIRECT_URL.md)
- [Local Testing Plan](archive/LOCAL_TESTING_PLAN.md)
- [Payment Tracking TODO](archive/PAYMENT_TRACKING_TODO.md)
- [Registration Ready](archive/REGISTRATION_READY.md)
- [Security Improvements](archive/SECURITY_IMPROVEMENTS.md)
- [Test Member Zone](archive/test-member-zone.md)
- [Update Seed UUIDs](archive/update_seed_uuids.md)

---

## 🏗️ Architektura Projektu

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Supabase Client

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Edge Functions (Deno runtime)
- Autopay Payment Gateway

**Deployment:**
- Frontend: Netlify
- Backend: Supabase Cloud

### Struktura Folderów

```
unicorns_pwa/
├── frontend/              # React PWA
│   ├── src/
│   │   ├── components/   # Komponenty React
│   │   ├── pages/        # Strony (routes)
│   │   ├── utils/        # Helpery
│   │   └── supabase/     # Klient Supabase
│   └── public/
│       └── images/       # Statyczne obrazy (strategia GitHub repo)
├── supabase/
│   ├── functions/        # Edge Functions
│   ├── migrations/       # Migracje SQL
│   └── seed.sql         # Dane testowe
├── docs/                 # 👈 Dokumentacja (ten folder)
│   ├── guides/          # Przewodniki użytkownika
│   ├── deployment/      # Deployment & konfiguracja
│   └── archive/         # Starsze dokumenty
├── CHANGELOG.md         # Historia wersji
├── CLAUDE.md           # Instrukcje dla Claude Code
└── README.md           # Start tutaj!
```

---

## 🔑 Kluczowe Koncepty

### Activities (Zajęcia)

- **Template** (`is_recurring=true, parent_activity_id=NULL, status='template'`)  
  Szablon zajęć cyklicznych (bez konkretnej daty)
  
- **Single event** (`is_recurring=false, parent_activity_id=NULL`)  
  Pojedyncze wydarzenie
  
- **Instance** (`parent_activity_id != NULL`)  
  Instancja zajęć cyklicznych (konkretny termin)
  
- **Special event** (`is_special_event=true`)  
  Wydarzenie specjalne (nie wymaga trenera)

### Registrations (Rezerwacje)

- `status`: 'registered', 'attended', 'cancelled'
- `payment_status`: 'unpaid', 'paid'
- `refund_status`: 'none', 'pending', 'processed', 'failed'

### Transactions (Płatności)

- `type`: 'payment', 'refund', 'manual'
- `provider`: 'manual', 'autopay', 'stripe'
- `status`: 'pending', 'completed', 'failed', 'cancelled'

### Roles (Role użytkowników)

- **user** - zwykły użytkownik
- **trainer** - trener wewnętrzny (zarządza zajęciami/sekcjami)
- **external_trainer** - trener zewnętrzny (może zarządzać zajęciami/sekcjami)
- **admin** - pełen dostęp

---

## 🔄 Payment Flow (Autopay)

```
1. User kliknie "Opłać"
   ↓
2. Frontend → POST /functions/v1/payment-initiate
   Body: { registrationId, amount, paymentMethod, blikCode? }
   ↓
3. Edge Function:
   - Tworzy transaction (status='pending')
   - Generuje OrderID (UUID bez myślników)
   - Oblicza hash SHA-256
   - Zwraca redirectUrl
   ↓
4. Frontend → AutopayRedirectPage
   - Auto-submit POST do https://testpay.autopay.eu/payment
   ↓
5. User płaci na bramce Autopay
   ↓
6. Autopay → Webhook ITN do /functions/v1/autopay-webhook
   - Weryfikacja hash
   - Update transaction.status = 'completed'
   - Update registration.payment_status = 'paid'
   - Return 'OK' natychmiast (< 50ms)
   ↓
7. Autopay → Redirect user do /payment-success?OrderID=xxx
   ↓
8. Frontend PaymentSuccessPage:
   - Query transaction by provider_transaction_id
   - Auto-refresh co 3s jeśli pending (race condition)
   - Display success/pending/failed
```

---

## 🧪 Testing

### Autopay Test Credentials

**BLIK (GatewayID=509):**
- Success: `111112`
- Invalid: `111121`
- Expired: `111122`
- Already used: `111123`

**PayByLink (GatewayID=106):**
- Wybierz TEST 106
- Kliknij "Zapłać" → Success

**Karty:**
- Success: `4111111111111111`, CVV: `123`, Exp: `12/25`
- Failure: `4000000000000002`

### Local Development

```bash
# Frontend
cd frontend
npm run dev
# http://localhost:5173

# Supabase (local)
npx supabase start
# Dashboard: http://localhost:54323

# Deploy Edge Function
npx supabase functions deploy <function-name>
```

---

## 📊 Koszty i Limity

### Supabase Free Tier
- Database: 500 MB
- File Storage: 1 GB
- Bandwidth: 5 GB/m
- ⚠️ Projekt pauzuje po tygodniu braku aktywności

### Cloudinary Free Tier
- Storage: 25 GB
- Bandwidth: 25 GB/m
- Transformations: 25,000/m
- ✅ Bez limitu czasowego

### Netlify Free Tier
- Bandwidth: 100 GB/m
- Build minutes: 300/m
- ✅ Darmowe HTTPS + CDN

**Strategia oszczędności:**  
Statyczne zdjęcia w GitHub repo (0 zł) + Cloudinary tylko dla dynamicznych (avatary, galerie).

---

## 🛠️ Narzędzia i Linki

**Production:**
- Frontend: https://unicorns-test.netlify.app
- Supabase Dashboard: https://supabase.com/dashboard/project/tezpojcudbjlkcilwwjr
- Autopay Panel: https://autopay.pl (sandbox)

**Dokumentacja zewnętrzna:**
- [Supabase Docs](https://supabase.com/docs)
- [Autopay API](https://developer.autopay.pl/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

**Repozytoria:**
- GitHub: https://github.com/skrzypczykt/unicorns_pwa

---

## 🤝 Contributing

### Workflow przed każdym pushem (CLAUDE.md):

1. **Bump version** w `frontend/src/version.ts` (semver)
2. **Update CHANGELOG.md** (Added, Changed, Fixed, Removed)
3. **Commit version**: `git commit -m "Wersja X.Y.Z"`
4. **Ask user permission** przed `git push`

### Code Style

- TypeScript strict mode
- Functional components + hooks
- Tailwind dla stylów (no custom CSS)
- Komponenty < 300 linii (split jeśli większe)
- Komentarze tylko WHY, nie WHAT

### Security

- Edge Functions weryfikują JWT tokens
- Admin-only functions sprawdzają `users.role = 'admin'`
- Payment webhooks weryfikują signature/hash
- CSP headers w `netlify.toml`

---

## 📞 Support

**Issues:**  
https://github.com/skrzypczykt/unicorns_pwa/issues

**Email:**  
unicorns.lodz@gmail.com

---

## 📝 Changelog Dokumentacji

**2026-04-26:**
- Reorganizacja dokumentacji do `/docs`
- Utworzono README dla docs
- Podzielono na: guides, deployment, archive
- Dodano strategię przechowywania zdjęć
- Dodano workflow aktualności

---

**Tip:** Rozpocznij od [README.md](../README.md) w głównym katalogu, potem przejdź do odpowiedniego przewodnika z tego folderu.
