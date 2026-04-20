-- Migration 031: Refactor special events - separate type from is_special_event flag
-- Checkbox "Wydarzenie specjalne" powinien być niezależny od typu zajęć
-- Typ "Wydarzenia specjalne" → "Inne"

-- 1. Dodaj typ "Inne" jeśli nie istnieje
INSERT INTO activity_types (name, description)
VALUES (
  'Inne',
  'Inne wydarzenia i aktywności niesklasyfikowane'
)
ON CONFLICT (name) DO NOTHING;

-- 2. Zaktualizuj istniejące wydarzenia typu "Wydarzenia specjalne" na "Inne"
UPDATE activities
SET activity_type_id = (SELECT id FROM activity_types WHERE name = 'Inne')
WHERE activity_type_id = (SELECT id FROM activity_types WHERE name = 'Wydarzenia specjalne');

-- 3. Usuń typ "Wydarzenia specjalne" (już nie potrzebny)
DELETE FROM activity_types
WHERE name = 'Wydarzenia specjalne';

-- Komentarz
COMMENT ON COLUMN activities.is_special_event IS
  'True dla wydarzeń specjalnych (zawody, spływy, wyjazdy) - niezależnie od typu zajęć. Checkbox decyduje o specjalności, nie typ z listy.';
