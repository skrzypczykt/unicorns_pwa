-- ============================================================
-- CONSOLIDATED MIGRATIONS: 013, 014, 015
-- Run this in Supabase SQL Editor Dashboard
-- ============================================================
-- Execute all three new migrations in order
-- Date: 2026-04-17
-- ============================================================

-- ============================================================
-- MIGRATION 013: Association Member Status
-- ============================================================

-- Dodaj kolumnę statusu członka stowarzyszenia
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_association_member BOOLEAN DEFAULT false;

-- Dodaj kolumnę daty przyznania statusu (opcjonalnie)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS association_member_since TIMESTAMP WITH TIME ZONE;

-- Index dla szybszego filtrowania członków
CREATE INDEX IF NOT EXISTS idx_users_association_member
  ON users(is_association_member)
  WHERE is_association_member = true;

-- Komentarze
COMMENT ON COLUMN users.is_association_member IS
  'Status członka stowarzyszenia - może być true dla user, trainer, admin lub external_trainer';

COMMENT ON COLUMN users.association_member_since IS
  'Data przyznania statusu członka stowarzyszenia';

-- ============================================================
-- MIGRATION 014: Special Events
-- ============================================================

-- Dodaj kolumnę oznaczającą wydarzenie specjalne
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS is_special_event BOOLEAN DEFAULT false;

-- Index dla filtrowania wydarzeń specjalnych
CREATE INDEX IF NOT EXISTS idx_activities_special_event
  ON activities(is_special_event)
  WHERE is_special_event = true;

-- Dodaj typ "Wydarzenia specjalne" do activity_types (opcjonalnie)
INSERT INTO activity_types (name, description)
VALUES (
  'Wydarzenia specjalne',
  'Zawody, spływy kajakowe, wyjazdy i inne jednorazowe wydarzenia wymagające wcześniejszej rejestracji'
)
ON CONFLICT (name) DO NOTHING;

-- Komentarz
COMMENT ON COLUMN activities.is_special_event IS
  'True dla wydarzeń specjalnych (zawody, spływy, wyjazdy) które wymagają dłuższego okna widoczności i rejestracji (30-60 dni zamiast 7 dni)';

-- ============================================================
-- MIGRATION 015: GDPR Consent Fields
-- ============================================================

-- Data zgody RODO (polityka prywatności)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE;

-- Data akceptacji regulaminu zajęć sportowych
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sports_terms_accepted_date TIMESTAMP WITH TIME ZONE;

-- Komentarze
COMMENT ON COLUMN users.gdpr_consent_date IS
  'Data wyrażenia zgody RODO podczas rejestracji - wymagana przed utworzeniem konta';

COMMENT ON COLUMN users.sports_terms_accepted_date IS
  'Data pierwszej akceptacji regulaminu zajęć sportowych - aktualizowana przy każdym zapisie';

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Run these queries to verify the migrations were successful:

-- Check users table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN (
    'is_association_member',
    'association_member_since',
    'gdpr_consent_date',
    'sports_terms_accepted_date'
  )
ORDER BY column_name;

-- Check activities table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
  AND column_name = 'is_special_event';

-- Check if new activity type was created
SELECT id, name, description
FROM activity_types
WHERE name = 'Wydarzenia specjalne';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All migrations (013, 014, 015) executed successfully!';
  RAISE NOTICE 'New columns added:';
  RAISE NOTICE '  - users.is_association_member';
  RAISE NOTICE '  - users.association_member_since';
  RAISE NOTICE '  - users.gdpr_consent_date';
  RAISE NOTICE '  - users.sports_terms_accepted_date';
  RAISE NOTICE '  - activities.is_special_event';
  RAISE NOTICE 'New activity type: Wydarzenia specjalne';
END $$;
