-- Migration 021: Dodaj pole requires_registration dla wydarzeń bez zapisu
-- Data: 2026-04-18

-- Dodaj kolumnę requires_registration (domyślnie true - większość wydarzeń wymaga zapisu)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS requires_registration BOOLEAN DEFAULT true;

-- Aktualizuj istniejące bezpłatne wydarzenia specjalne (mogą nie wymagać zapisu)
-- Admin może to zmienić ręcznie w UI
COMMENT ON COLUMN activities.requires_registration IS 'Czy wydarzenie wymaga rejestracji. False = wstęp wolny bez zapisu (np. dzień otwarty, pokaz)';

-- Index dla szybkich zapytań po events bez zapisu
CREATE INDEX IF NOT EXISTS idx_activities_requires_registration
  ON activities(requires_registration)
  WHERE requires_registration = false;
