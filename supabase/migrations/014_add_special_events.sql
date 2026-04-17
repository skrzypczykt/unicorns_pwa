-- Migration 014: Add special events category
-- Allows marking activities as special events (competitions, kayaking trips, etc.)
-- Special events have longer registration windows (30-60 days vs 7 days)

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
