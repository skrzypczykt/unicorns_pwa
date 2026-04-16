# 🦄🌈 Unicorn Sports - NGO Sports Activity PWA

Aplikacja Progressive Web App dla organizacji non-profit zajmującej się organizacją zajęć sportowych.

## Funkcjonalności

### Dla użytkowników
- Przeglądanie dostępnych zajęć sportowych
- Zapisywanie się na zajęcia
- Anulowanie rezerwacji (przed terminem)
- Sprawdzanie salda konta
- Historia transakcji

### Dla trenerów
- Przeglądanie przypisanych zajęć
- Oznaczanie obecności uczestników
- Dodawanie notatek do zajęć

### Dla administratorów
- Tworzenie i zarządzanie zajęciami
- Ręczna aktualizacja salda użytkowników
- Przeglądanie statusów płatności
- Eksport raportów finansowych

## Stack technologiczny

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Database**: PostgreSQL
- **Deployment**: Netlify (frontend) + Supabase (backend)
- **PWA**: Vite PWA Plugin + Workbox

## Architektura płatności

**System płatności za zajęcia** (pay-per-class):
1. Użytkownik rezerwuje miejsce na zajęciach (bez płatności)
2. Administrator ręcznie doładowuje salda użytkowników co miesiąc
3. Gdy trener oznacza obecność jako "present" → saldo jest automatycznie pomniejszane
4. Anulowanie przed terminem nie wymaga zwrotu (płatność nie została pobrana)

## Struktura projektu

```
unicorns_pwa/
├── frontend/           # React PWA
├── supabase/          # Database migrations & Edge Functions
│   ├── migrations/    # PostgreSQL schema
│   └── functions/     # Python Edge Functions
├── docs/              # Dokumentacja
└── scripts/           # Utility scripts
```

## Rozpoczęcie pracy

### Wymagania
- Node.js 18+
- npm lub yarn
- Konto Supabase (darmowy tier wystarczy)

### Instalacja

1. Sklonuj repozytorium
```bash
git clone https://github.com/skrzypczykt/unicorns_pwa.git
cd unicorns_pwa
```

2. Skonfiguruj Supabase
```bash
# Zainstaluj Supabase CLI
npm install -g supabase

# Zaloguj się do Supabase
supabase login

# Połącz się z projektem
supabase link --project-ref <your-project-ref>

# Zastosuj migracje
supabase db push

# Wgraj dane testowe
supabase db seed
```

3. Skonfiguruj frontend
```bash
cd frontend
npm install

# Skopiuj i uzupełnij zmienne środowiskowe
cp ../.env.example .env.local
# Edytuj .env.local i dodaj swoje klucze Supabase
```

4. Uruchom środowisko deweloperskie
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:5173

## Deployment

### Frontend (Netlify)
```bash
cd frontend
npm run build
# Deploy przez Netlify CLI lub połącz repozytorium GitHub
```

### Backend (Supabase)
Supabase jest w pełni zarządzanym serwisem - deploy Edge Functions:
```bash
supabase functions deploy process-attendance
supabase functions deploy update-balance
supabase functions deploy validate-registration
```

## Testowanie

```bash
cd frontend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

## Licencja

MIT License - projekt open-source dla organizacji non-profit

## Wsparcie

Dla pytań i problemów, otwórz issue w repozytorium GitHub.
