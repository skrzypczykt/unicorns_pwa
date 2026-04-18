-- Migration 022: Opcjonalne limity miejsc i czasu trwania
-- Data: 2026-04-18

-- 1. Zmień max_participants na NULLABLE (NULL = brak limitu miejsc)
ALTER TABLE activities
  ALTER COLUMN max_participants DROP NOT NULL;

COMMENT ON COLUMN activities.max_participants IS 'Maksymalna liczba uczestników. NULL = brak limitu (nielimitowane miejsca)';

-- 2. duration_minutes już może być 0 (używa się wtedy duration_description)
-- Dodaj komentarz dla jasności
COMMENT ON COLUMN activities.duration_minutes IS 'Czas trwania w minutach. 0 = używaj duration_description zamiast';
COMMENT ON COLUMN activities.duration_description IS 'Opcjonalny opis czasu trwania (np. "Cały dzień", "2-3h"). Używane gdy duration_minutes = 0 lub NULL';

-- 3. Update istniejących zajęć bez zapisu - usuń limit miejsc (opcjonalne)
-- Można uruchomić ręcznie jeśli potrzebne:
-- UPDATE activities
-- SET max_participants = NULL
-- WHERE requires_registration = false;
