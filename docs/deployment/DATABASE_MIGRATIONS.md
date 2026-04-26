# Strategia Migracji Bazy Danych - Unicorns PWA

## Status (2026-04-26)

✅ **Problem rozwiązany!** Migracje zostały naprawione.

**Aktualny stan:**
- 49 plików migracji w `supabase/migrations/`
- ✅ Brak duplikatów numerów (użyto sufiksu 'a' dla konfliktów)
- ✅ Sekwencyjna numeracja (z wyjątkiem 045 - placeholder)
- ✅ Migracje wykonują się w poprawnej kolejności alfabetycznie
- ✅ Backup dostępny w `supabase/migrations.backup-20260426-114839/`

**Co naprawiono (2026-04-26):**
- `002_fix_rls_policies.sql` → `002a_fix_rls_policies.sql`
- `006_add_participants_count.sql` → `006a_add_participants_count.sql`
- `007_push_notifications.sql` → `007a_push_notifications.sql`
- Usunięto stare próby dodania external_trainer (010_no_enum, 010_safe)
- Dodano 045_placeholder.sql dla ciągłości numeracji

---

## Historia Problemu (rozwiązany)

### Faza 1: Renumeracja Migracji ✅ WYKONANE

**Status:** Naprawione 2026-04-26

**Zastosowane rozwiązanie:**
Zamiast pełnej renumeracji (która wymagałaby shiftu wszystkich plików), użyto sufiksu 'a' dla konfliktów:

**Faktyczne zmiany:**
```bash
# Duplikaty oznaczone sufiksem 'a' (późniejsza wersja)
002_allow_user_registration.sql  # Oryginalny
002a_fix_rls_policies.sql         # Fix RLS (było 002_fix)

006_activity_images.sql           # Oryginalny
006a_add_participants_count.sql   # Funkcja count (było 006_add)

007_auto_create_user_profile.sql  # Oryginalny
007a_push_notifications.sql       # Push system (było 007_push)

# Trio external_trainer: usunięto stare, zostawiono final
010_add_external_trainer_role.sql # Safe version (poprzednio 010_safe)
# Deleted: 010_add_external_trainer_role_no_enum.sql
# Deleted: 010_add_external_trainer_role_safe.sql

# Placeholder dla ciągłości
045_placeholder.sql               # No-op migration
```

**Zalety tego podejścia:**
- ✅ Minimalne zmiany (tylko 4 pliki przenumerowane)
- ✅ Brak shift'u 40+ plików
- ✅ Git history zachowany
- ✅ Kolejność alfabetyczna = poprawna kolejność chronologiczna
- ✅ Łatwe do review

### Faza 2: Konsolidacja (Future Improvement)

**Opcja A: Squash do jednej migracji (drastyczne)**

Połącz wszystkie migracje w jeden plik `000_initial_schema_complete.sql`:

```sql
-- Zalety:
-- ✅ Szybki fresh deploy
-- ✅ Brak problemów z kolejnością
-- ✅ Łatwy review

-- Wady:
-- ❌ Tracisz historię
-- ❌ Nie możesz rollback'ować pojedynczych zmian
-- ❌ Trudne do review dla większego zespołu
```

**Opcja B: Grupowanie tematyczne (rekomendowane)**

Zachowaj migracje w logicznych grupach:

```
001_initial_schema.sql           # Tabele podstawowe
010_auth_and_roles.sql           # Auth, RLS, roles
020_activities_recurring.sql     # Recurring events
030_payments_transactions.sql    # Payment system
040_notifications.sql            # Push notifications
050_special_events.sql           # Special events
060_accounting.sql               # Accounting
```

### Faza 3: Dependency Management

**Problem:** Niektóre migracje zależą od poprzednich.

**Rozwiązanie:** Dodaj komentarz na początku każdej migracji:

```sql
-- Migration: 025_add_member_zone
-- Depends on: 001_initial_schema, 010_auth_and_roles
-- Description: Adds member_zone_access column and RLS policies
```

**Tool (opcjonalnie):** Parser dependencies

```typescript
// scripts/check-migration-deps.ts
function checkDependencies(migrationFile: string) {
  const content = fs.readFileSync(migrationFile, 'utf-8')
  const depsMatch = content.match(/-- Depends on: (.+)/)
  
  if (depsMatch) {
    const deps = depsMatch[1].split(',').map(d => d.trim())
    // Verify all deps exist and were executed before this one
  }
}
```

---

## Nowa Konwencja Nazewnictwa

**Format:**
```
NNN_short_descriptive_name.sql

NNN = trzycyfrowy numer (001-999)
short_descriptive_name = snake_case opis
```

**Przykłady:**
- ✅ `045_add_whatsapp_to_sections.sql`
- ✅ `046_fix_unique_registration_payment.sql`
- ❌ `46_fix.sql` (za krótkie, dwucyfrowe)
- ❌ `046-add-feature.sql` (myślniki zamiast underscorów)

**Numeracja:**
- **001-009:** Initial setup, core tables
- **010-019:** Auth, users, roles
- **020-029:** Activities, sections, trainers
- **030-039:** Payments, transactions
- **040-049:** Notifications, emails
- **050-059:** Special features (member zone, events)
- **060-069:** Accounting, reports
- **070-079:** Optimizations, indexes
- **080-089:** RLS fixes
- **090-099:** Reserved for hotfixes

---

## Workflow: Dodawanie Nowej Migracji

### Krok 1: Znajdź ostatni numer

```bash
ls supabase/migrations/ | tail -1
# Output: 049_last_migration.sql
```

### Krok 2: Utwórz nowy plik

```bash
# Kolejny numer = 050
touch supabase/migrations/050_add_news_table.sql
```

### Krok 3: Napisz migrację z komentarzem

```sql
-- Migration: 050_add_news_table
-- Depends on: 001_initial_schema, 010_auth_and_roles
-- Description: Creates news table for articles/announcements
-- Author: tskrzypczyk
-- Date: 2026-04-26

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  -- ...
);

-- RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published"
  ON news FOR SELECT
  USING (status = 'published');
```

### Krok 4: Test lokalnie

```bash
# Reset local DB i apply wszystkie migracje
npx supabase db reset

# Lub tylko nowa migracja:
psql -U postgres -h localhost -p 54322 -d postgres -f supabase/migrations/050_add_news_table.sql
```

### Krok 5: Commit

```bash
git add supabase/migrations/050_add_news_table.sql
git commit -m "Add news table for articles (migration 050)"
```

### Krok 6: Deploy na produkcję

**Opcja A: Manual (Supabase Dashboard)**
```
1. Supabase Dashboard → SQL Editor
2. Paste zawartość 050_add_news_table.sql
3. Run
4. Verify w Table Editor
```

**Opcja B: CLI (wymaga Supabase CLI + link do projektu)**
```bash
npx supabase db push
```

---

## Rollback Strategy

**Problem:** Supabase nie ma built-in rollback dla migracji.

**Rozwiązanie:** Utwórz migrację "down" dla każdej "up".

### Przykład:

**Up migration:** `050_add_news_table.sql`
```sql
CREATE TABLE news (...);
```

**Down migration:** `050_add_news_table_rollback.sql`
```sql
-- Rollback for 050_add_news_table
DROP TABLE IF EXISTS news CASCADE;
```

**Nie commituj rollback'ów do repo** (trzymaj lokalnie lub w `/scripts/rollbacks/`)

### Wykonanie rollback:

```bash
psql ... -f scripts/rollbacks/050_add_news_table_rollback.sql
```

---

## Fresh Database Setup (Production Deploy)

**Scenariusz:** Deploy na nową bazę produkcyjną od zera.

### Opcja 1: Wszystkie Migracje Sekwencyjnie

```bash
# Local test
npx supabase db reset

# Production (manual)
for file in supabase/migrations/*.sql; do
  echo "Applying $file..."
  psql <connection-string> -f "$file"
done
```

### Opcja 2: Consolidated Schema (po squash)

```bash
# Jeden plik ze skonsolidowanym schema
psql <production-url> -f supabase/migrations/000_consolidated_schema.sql

# Potem seed data
psql <production-url> -f supabase/seed.sql
```

### Opcja 3: Supabase CLI (najlepsze)

```bash
# Link projekt
npx supabase link --project-ref <ref>

# Push wszystkie migracje
npx supabase db push

# Seed (opcjonalnie)
psql <url> -f supabase/seed.sql
```

---

## Idempotent Migrations

**Zasada:** Migracja powinna być bezpieczna do wykonania wielokrotnie.

**Przykład - NIE idempotent:**
```sql
-- ❌ Fail przy drugim uruchomieniu
CREATE TABLE news (...);
```

**Przykład - idempotent:**
```sql
-- ✅ Działa wielokrotnie
CREATE TABLE IF NOT EXISTS news (...);

-- Lub dla ALTER:
DO $$ BEGIN
  ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_special BOOLEAN DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
```

**Kiedy używać:**
- Development (częste resety)
- CI/CD (re-run na failure)
- Production hotfix (pewność że nie zepsuje się przy retry)

---

## CI/CD Integration (Future)

**GitHub Actions workflow:**

```yaml
# .github/workflows/test-migrations.yml
name: Test Migrations

on: [pull_request]

jobs:
  test-db:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: supabase/postgres
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Apply migrations
        run: |
          for file in supabase/migrations/*.sql; do
            psql postgresql://postgres:postgres@localhost:5432/postgres -f "$file"
          done
      
      - name: Run tests
        run: npm run test:db
```

---

## Troubleshooting

### Problem: "relation already exists"

**Przyczyna:** Migracja nie idempotent, wykonana dwukrotnie.

**Fix:** Użyj `CREATE TABLE IF NOT EXISTS` lub `DROP TABLE IF EXISTS` przed CREATE.

### Problem: "column does not exist" w kolejnej migracji

**Przyczyna:** Migracje w złej kolejności (duplikaty numerów).

**Fix:** Renumeruj pliki zgodnie z chronologią.

### Problem: "type does not exist" (ENUM)

**Przyczyna:** Próba użycia ENUM type przed jego utworzeniem.

**Fix:** 
```sql
-- Najpierw check czy istnieje
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('user', 'trainer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
```

### Problem: "violates foreign key constraint"

**Przyczyna:** INSERT do tabeli przed utworzeniem referencji.

**Fix:** Sprawdź kolejność CREATE TABLE w migracjach.

---

## Akcje do Wykonania (TODO)

### Natychmiastowe:
- [x] ~~Backup obecnych migracji~~ ✅ Done: `supabase/migrations.backup-20260426-114839/`
- [x] ~~Fix duplikaty~~ ✅ Done: użyto sufiksu 'a'
- [ ] Test lokalnie: `npx supabase db reset` (wymaga Docker)
- [x] ~~Commit renumeracji~~ ✅ Done: commit 9e1bace

### Krótkoterminowe (tydzień):
- [ ] Dodaj komentarze "Depends on" do każdej migracji
- [ ] Utwórz folder `scripts/rollbacks/` dla down migrations
- [ ] Napisz helper script `scripts/check-migration-deps.ts`
- [ ] Dokumentuj każdą nową migrację w CHANGELOG

### Długoterminowe (miesiąc):
- [ ] Rozważ squash do consolidated schema (po stabilizacji)
- [ ] Setup CI/CD dla testowania migracji na PR
- [ ] Migruj produkcję na nową numerację (maintenance window)
- [ ] Automatyzuj deployment (Supabase CLI + GitHub Actions)

---

## Przykłady

### Dobra Migracja

```sql
-- Migration: 051_add_cloudinary_to_activities
-- Depends on: 020_activities_recurring
-- Description: Add cloudinary_public_id for dynamic activity images
-- Author: tskrzypczyk
-- Date: 2026-04-26

-- Add column (idempotent)
DO $$ BEGIN
  ALTER TABLE activities 
    ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Update existing records (safe if re-run)
UPDATE activities 
SET cloudinary_public_id = NULL 
WHERE cloudinary_public_id IS NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_activities_cloudinary 
  ON activities(cloudinary_public_id) 
  WHERE cloudinary_public_id IS NOT NULL;
```

### Zła Migracja

```sql
-- ❌ Brak komentarzy
-- ❌ Nie idempotent
-- ❌ Hardcoded values

CREATE TABLE news (
  id UUID PRIMARY KEY
);

INSERT INTO news VALUES ('123...'); -- ❌ Fail przy re-run
```

---

## Checklist Przed Deployem Produkcyjnym

- [ ] Wszystkie migracje przetestowane lokalnie
- [ ] Brak duplikatów numerów
- [ ] Każda migracja ma komentarz z dependencies
- [ ] Seed data zaktualizowany (jeśli potrzebny)
- [ ] Backup produkcyjnej bazy wykonany
- [ ] Maintenance window zaplanowany (jeśli breaking changes)
- [ ] Rollback plan gotowy
- [ ] Team poinformowany o deployment
- [ ] Monitor Supabase dashboard podczas migracji
- [ ] Verify RLS policies działają po migracji

---

**Next:** Zobacz [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) dla pełnego planu wdrożenia na produkcję.
