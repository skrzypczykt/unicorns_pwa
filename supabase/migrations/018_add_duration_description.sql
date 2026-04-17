-- Dodaj opcjonalne pole tekstowe dla opisu czasu trwania wydarzeń specjalnych
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS duration_description TEXT;

COMMENT ON COLUMN public.activities.duration_description IS
  'Tekstowy opis czasu trwania dla wydarzeń specjalnych (np. "3 dni", "weekend", "do ustalenia"). Używany zamiast duration_minutes dla wydarzeń specjalnych.';

-- Przykładowe wypełnienie dla istniejących wydarzeń specjalnych
-- UPDATE public.activities
-- SET duration_description = '3 dni'
-- WHERE is_special_event = true AND name LIKE '%spływ%';
