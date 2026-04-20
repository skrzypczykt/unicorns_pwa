-- Migration 032: Add image_url to activity_types
-- Pozwala na przechowywanie URL obrazka dla każdej sekcji

ALTER TABLE activity_types
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN activity_types.image_url IS
  'URL obrazka/ikony dla sekcji (opcjonalne). Używane w UI do wyświetlania kafelków zajęć.';

-- Ustaw domyślne ikony dla istniejących typów (bazując na ACTIVITY_TYPE_IMAGES)
UPDATE activity_types SET image_url = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea' WHERE name = 'Badminton';
UPDATE activity_types SET image_url = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1' WHERE name = 'Siatkówka';
UPDATE activity_types SET image_url = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8' WHERE name = 'Squash';
UPDATE activity_types SET image_url = 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea' WHERE name = 'Taniec';
UPDATE activity_types SET image_url = 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5' WHERE name = 'Gry planszowe';
UPDATE activity_types SET image_url = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4' WHERE name = 'Inne';
