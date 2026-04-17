# 🦄 Unicorns Łódź - System Zarządzania Aktywnościami

> Progressive Web App dla Stowarzyszenia Unicorns Łódź  
> **Sport | Kultura | Rozrywka**

Kompleksowy system zarządzania zajęciami sportowo-kulturalnymi dla organizacji non-profit, umożliwiający rezerwacje, płatności per-sekcja oraz pełną księgowość.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://unicorns-test.netlify.app)
[![Built with Supabase](https://img.shields.io/badge/built%20with-Supabase-3ECF8E)](https://supabase.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)

---

## ✨ Funkcjonalności

### 👥 Panel Użytkownika
- 📅 **Przeglądanie zajęć** - kalendarz z wszystkimi dostępnymi aktywnościami (Badminton, Siatkówka, Taniec, etc.)
- ✅ **Rezerwacje** - zapisywanie się na zajęcia z widokiem dostępnych miejsc
- 🔄 **Anulowanie** - możliwość odwołania rezerwacji przed terminem
- 💰 **Saldo per sekcja** - dedykowane salda dla każdej aktywności
- 📊 **Historia transakcji** - pełna przejrzystość operacji finansowych
- 📱 **PWA** - instalacja na urządzeniach mobilnych, tryb offline

### 🏋️ Panel Trenera
- 📋 **Lista zajęć** - widok zajęć przypisanych do trenera
- ✔️ **Obecności** - szybkie oznaczanie uczestników (present/absent)
- 💵 **Auto-płatności** - automatyczne pobieranie kosztów zajęć przy obecności
- 📝 **Notatki** - dodawanie komentarzy do zajęć

### ⚙️ Panel Administratora
- 🎯 **Zarządzanie zajęciami** - tworzenie, edycja, usuwanie aktywności
- 👤 **Zarządzanie użytkownikami** - role (admin/trainer/user), edycja profili
- 💳 **Aktualizacja sald** - ręczne doładowania per użytkownik per sekcja
- 📊 **Raporty księgowe** - eksport do CSV z rozliczeniem per sekcja
  - Saldo otwarcia/zamknięcia miesiąca
  - Wpłaty i obciążenia
  - Zadłużenie z podziałem na uczestnika
  - Filtrowanie po sekcji (Badminton, Taniec, Siatkówka, etc.)
  - Raporty frekwencji w UI
- 📈 **Statystyki** - przegląd aktywności stowarzyszenia

---

## 🏗️ Stack Technologiczny

### Frontend
- **Framework**: React 19.2 + TypeScript 5.6
- **Build Tool**: Vite 7.3
- **Styling**: Tailwind CSS 4.2 (nowy silnik)
- **Routing**: React Router 7.14
- **State Management**: Zustand 5.0
- **Internationalization**: i18next 26.0
- **PWA**: Vite PWA Plugin + Workbox 7.4

### Backend
- **BaaS**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Database**: PostgreSQL 17
- **Auth**: Supabase Auth (email/password, magic links)
- **Edge Functions**: Deno (TypeScript)
- **Storage**: Supabase Storage (zdjęcia aktywności)

### Deployment
- **Frontend**: Netlify (CI/CD z GitHub)
- **Backend**: Supabase Cloud
- **Database Migrations**: Supabase CLI

### DevOps
- **Version Control**: Git + GitHub
- **Package Manager**: npm (z .npmrc dla public registry)
- **Linting**: ESLint 9
- **Code Quality**: TypeScript strict mode

---

## 🎨 Kluczowe Funkcje Techniczne

### 🔐 Bezpieczeństwo
- **Row Level Security (RLS)** - polityki dostępu na poziomie bazy danych
- **Role-based access** - admin/trainer/user z różnymi uprawnieniami
- **JWT tokens** - bezpieczna autoryzacja z Supabase Auth
- **Email verification** - potwierdzenie rejestracji przed dostępem

### 💸 System Płatności Per-Sekcja
Każda sekcja aktywności (Badminton, Taniec, Siatkówka) ma **osobne saldo**:
- Użytkownik może mieć +100 zł na Badmintona, -50 zł na Tańcu
- Architektura: `user_section_balances` + `balance_transactions` z `activity_type_id`
- Immutable audit log wszystkich operacji finansowych
- Automatyczne obciążanie przy obecności (Edge Function: `process-attendance`)

**Proces płatności:**
1. Użytkownik zapisuje się na zajęcia (bez płatności z góry)
2. Admin doładowuje saldo dla danej sekcji
3. Trener oznacza obecność → Edge Function odejmuje koszt z salda sekcji
4. Wszystko logowane w `balance_transactions`

### 📊 Raporty Księgowe
- **Funkcja bazodanowa**: `get_accounting_report(month, activity_type_filter)`
- **Complex SQL** z CTEs (month_bounds, opening_balances, monthly_transactions, attendance_stats)
- **Edge Function**: `generate-accounting-report` (REST API)
- **Frontend**: AdminReportsPage z filtrowaniem i eksportem CSV
- **CSV export**: UTF-8 z BOM (poprawne polskie znaki w Excel)

### 🗄️ Baza Danych - Kluczowe Tabele
```sql
users                    -- Użytkownicy (auth.users sync)
├── id (uuid)
├── email
├── display_name
├── role (admin/trainer/user)
└── balance (deprecated - suma z user_section_balances)

user_section_balances    -- Salda per sekcja (NOWE)
├── user_id
├── activity_type_id
└── balance

balance_transactions     -- Immutable audit log
├── user_id
├── amount
├── type (manual_credit/debit, class_payment)
├── activity_type_id     -- Przypisanie do sekcji
├── reference_id
└── balance_before/after

activities               -- Zajęcia
├── activity_type_id     -- Sekcja (Badminton, etc.)
├── trainer_id
├── date_time
├── cost
├── capacity
└── image_url

activity_types           -- Kategorie sekcji
├── name (Badminton, Taniec, Siatkówka, Squash)
└── description

registrations            -- Rezerwacje
├── user_id
├── activity_id
├── status (registered/attended/no_show/cancelled)
└── payment_processed
```

### 🔄 Database Triggers
- **`handle_new_user()`** - automatyczne tworzenie profilu w `users` po rejestracji
- **`on_auth_user_created`** - trigger na `auth.users` wywołujący `handle_new_user()`

---

## 🚀 Rozpoczęcie Pracy

### Wymagania
- **Node.js** 20.x (LTS)
- **npm** 10.x
- **Supabase CLI** (opcjonalnie, do lokalnego developmentu)
- **Git**

### 1️⃣ Sklonuj repozytorium
```bash
git clone https://github.com/skrzypczykt/unicorns_pwa.git
cd unicorns_pwa
```

### 2️⃣ Konfiguracja Supabase

#### Opcja A: Użyj istniejącego projektu Supabase
```bash
# Zainstaluj Supabase CLI
npm install -g supabase

# Zaloguj się
supabase login

# Połącz z projektem
supabase link --project-ref tezpojcudbjlkcilwwjr

# Zastosuj migracje
supabase db push
```

#### Opcja B: Stwórz nowy projekt
1. Idź do [supabase.com](https://supabase.com) i stwórz projekt
2. Skopiuj **URL** i **anon key** z Settings → API
3. Połącz CLI: `supabase link --project-ref <twoj-project-ref>`
4. Zastosuj migracje: `supabase db push`

#### Skonfiguruj Auth w Supabase Dashboard:
👉 https://supabase.com/dashboard/project/YOUR_PROJECT/auth/url-configuration

**Site URL:**
```
https://unicorns-test.netlify.app
```

**Redirect URLs:**
```
https://unicorns-test.netlify.app/*
https://unicorns-test.netlify.app/login
https://unicorns-test.netlify.app/auth/callback
http://localhost:5173/*
http://localhost:5173/login
```

**Email Template** (opcjonalnie):
👉 Auth → Templates → Confirm signup  
Użyj szablonu z `supabase/templates/confirmation.html`

### 3️⃣ Frontend Setup
```bash
cd frontend

# Zainstaluj zależności
npm install

# Skopiuj przykładowy plik .env
cp .env.example .env.local

# Edytuj .env.local i dodaj swoje klucze:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Uruchom Development Server
```bash
npm run dev
```

Aplikacja dostępna pod: **http://localhost:5173** 🎉

### 5️⃣ Deploy Edge Functions (opcjonalnie)
```bash
# Deploy wszystkich funkcji
supabase functions deploy process-attendance
supabase functions deploy update-balance
supabase functions deploy generate-accounting-report
```

### 6️⃣ Seed Database (testowe dane)
```bash
# Z poziomu głównego katalogu projektu
supabase db query --linked -f supabase/seed.sql
```

To stworzy:
- Kilku użytkowników testowych
- Activity types (Badminton, Taniec, etc.)
- Przykładowe zajęcia
- Przykładowe rezerwacje

---

## 📦 Deployment

### Frontend → Netlify

**Konfiguracja w Netlify Dashboard:**
- **Build command**: `npm ci && npm run build`
- **Publish directory**: `dist`
- **Base directory**: `frontend`

**Environment Variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Automatyczny deploy:**
Push do branch `main` automatycznie triggeruje deploy na Netlify.

### Backend → Supabase

Supabase jest fully managed - wystarczy:
1. Push migrations: `supabase db push`
2. Deploy Edge Functions: `supabase functions deploy <function-name>`

---

## 🧪 Testing

### Testowe konta
Po załadowaniu seed data:

**Admin:**
- Email: `admin@unicorns.org.pl`
- Password: `admin123`

**Trener:**
- Email: `trainer@unicorns.org.pl`
- Password: `trainer123`

**User:**
- Email: `user@unicorns.org.pl`
- Password: `user123`

### Manual Testing Flow
1. **Rejestracja nowego użytkownika** → `/register`
2. **Przeglądaj zajęcia** → `/activities`
3. **Zapisz się na zajęcia** → kliknij "Zapisz się"
4. **Sprawdź swoje rezerwacje** → `/my-classes`
5. **[Jako trener] Oznacz obecność** → `/trainer/classes`
6. **[Jako admin] Zobacz raport księgowy** → `/admin/reports`

---

## 🗂️ Struktura Projektu

```
unicorns_pwa/
├── frontend/                      # React PWA
│   ├── src/
│   │   ├── pages/                 # Komponenty stron
│   │   │   ├── AdminReportsPage.tsx      # Raporty księgowe
│   │   │   ├── AdminUsersPage.tsx        # Zarządzanie użytkownikami
│   │   │   ├── AdminActivitiesPage.tsx   # Zarządzanie zajęciami
│   │   │   ├── TrainerClassesPage.tsx    # Panel trenera
│   │   │   ├── ActivitiesPage.tsx        # Lista zajęć
│   │   │   ├── MyClassesPage.tsx         # Moje rezerwacje
│   │   │   ├── ProfilePage.tsx           # Profil użytkownika
│   │   │   ├── RegisterPage.tsx          # Rejestracja
│   │   │   └── SimpleLoginPage.tsx       # Logowanie
│   │   ├── supabase/              # Konfiguracja Supabase
│   │   │   └── client.ts
│   │   ├── utils/                 # Utilities
│   │   │   └── csvExport.ts       # Eksport CSV
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .npmrc                     # npm registry override
│
├── supabase/
│   ├── migrations/                # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_activity_types.sql
│   │   ├── 003_create_activities.sql
│   │   ├── 004_registrations.sql
│   │   ├── 005_balance_system.sql
│   │   ├── 006_activity_images.sql
│   │   ├── 007_auto_create_user_profile.sql
│   │   ├── 008_section_based_balances.sql     # Per-section balances
│   │   └── 009_accounting_report_function.sql # Report SQL
│   ├── functions/                 # Edge Functions (Deno/TypeScript)
│   │   ├── process-attendance/
│   │   ├── update-balance/
│   │   └── generate-accounting-report/
│   ├── templates/                 # Email templates
│   │   └── confirmation.html
│   ├── seed.sql                   # Testowe dane
│   └── config.toml                # Supabase local config
│
├── docs/                          # Documentation (legacy)
├── netlify.toml                   # Netlify configuration
├── README.md
├── FIX_REDIRECT_URL.md           # Setup guide (email redirects)
├── EMAIL_TEMPLATE_SETUP.md        # Email template docs
└── REGISTRATION_READY.md          # Registration system docs
```

---

## 🔧 Troubleshooting

### Problem: Email verification link shows "requested path is invalid"
**Rozwiązanie:** Skonfiguruj Redirect URLs w Supabase Dashboard  
📄 Zobacz: `FIX_REDIRECT_URL.md`

### Problem: Build fails on Netlify with "ENOTFOUND artifactory.corp.ebay.com"
**Rozwiązanie:** Używamy `.npmrc` z `registry=https://registry.npmjs.org/`  
Package-lock.json jest w `.gitignore` żeby Netlify generował czysty lock file.

### Problem: "Nie udało się utworzyć profilu użytkownika"
**Rozwiązanie:** To był błąd w starym kodzie, trigger działa poprawnie.  
Wyczyść cache przeglądarki (Ctrl+Shift+Delete) lub otwórz incognito.

### Problem: Typ użytkownika nie zmienia się po edycji
**Rozwiązanie:** Przeładuj stronę - stan profilu jest cachowany.

---

## 📚 Dokumentacja Dodatkowa

- **FIX_REDIRECT_URL.md** - Konfiguracja redirect URLs w Supabase
- **EMAIL_TEMPLATE_SETUP.md** - Jak wgrać polski szablon emaili
- **REGISTRATION_READY.md** - Status systemu rejestracji
- **Plan architektury raportów** - `.claude/plans/glittery-jumping-abelson.md`

---

## 🤝 Contributing

Projekt open-source dla organizacji non-profit. Pull requesty mile widziane!

### Development Workflow
1. Fork repozytorium
2. Stwórz branch: `git checkout -b feature/nazwa-funkcji`
3. Commit zmiany: `git commit -m 'Add feature: opis'`
4. Push: `git push origin feature/nazwa-funkcji`
5. Otwórz Pull Request

### Coding Standards
- TypeScript strict mode
- ESLint rules (sprawdź z `npm run lint`)
- Polskie nazwy w UI, angielskie w kodzie
- Commit messages w języku angielskim

---

## 📊 Features Roadmap

### ✅ Zrealizowane
- [x] System rejestracji i logowania
- [x] Zarządzanie zajęciami (admin)
- [x] Rezerwacje użytkowników
- [x] Panel trenera z obecnościami
- [x] Płatności per-sekcja
- [x] Raporty księgowe z eksportem CSV
- [x] PWA z trybem offline
- [x] Email verification
- [x] Historia transakcji

### 🔜 Planowane
- [ ] Płatności online (Stripe/PayU integration)
- [ ] Powiadomienia push (PWA notifications)
- [ ] Kalendarz Google/iCal export
- [ ] Multi-language support (EN/PL)
- [ ] Mobile app (React Native)
- [ ] Statystyki i wykresy (Chart.js)
- [ ] Automatyczne maile o zadłużeniu
- [ ] Raporty PDF dla księgowości
- [ ] System kar za no-show

---

## 📄 Licencja

MIT License

Copyright (c) 2026 Stowarzyszenie Unicorns Łódź

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🦄 O Stowarzyszeniu Unicorns Łódź

Jesteśmy społecznością pasjonatów sportu, kultury i rozrywki w Łodzi!

**Aktywności:**
- 🏸 Badminton
- 🏐 Siatkówka
- 🎾 Squash
- 💃 Taniec
- 🎲 Gry planszowe
- ⚽ Piłka nożna
- 🧘 Joga

**Kontakt:**
- 📧 Email: unicorns.lodz@gmail.com
- 🌐 Website: [www.unicorns.org.pl](https://www.unicorns.org.pl)
- 📘 Facebook: [Unicorns Łódź](https://www.facebook.com/groups/604562728465563)
- 📷 Instagram: [@unicorns_lodz](https://www.instagram.com/unicorns_lodz)

---

## 💡 Wsparcie

Dla pytań, problemów lub feature requests:
1. Otwórz [Issue na GitHub](https://github.com/skrzypczykt/unicorns_pwa/issues)
2. Napisz na unicorns.lodz@gmail.com

---

**Zbudowane z magią jednorożców** 🦄✨🌈

*Made with ❤️ in Łódź, Poland*
