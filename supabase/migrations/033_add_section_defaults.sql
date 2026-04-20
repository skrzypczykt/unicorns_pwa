-- Migration 033: Add default trainer and Facebook group to sections
-- Każda sekcja może mieć domyślnego trenera/organizatora oraz link do grupy FB

ALTER TABLE activity_types
ADD COLUMN IF NOT EXISTS default_trainer_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS facebook_group_url TEXT;

-- Indeks dla wydajności
CREATE INDEX IF NOT EXISTS idx_activity_types_trainer
  ON activity_types(default_trainer_id)
  WHERE default_trainer_id IS NOT NULL;

-- Komentarze
COMMENT ON COLUMN activity_types.default_trainer_id IS
  'Domyślny trener/organizator dla tej sekcji. Pole trainer_id w nowych zajęciach będzie auto-wypełniane tą wartością.';

COMMENT ON COLUMN activity_types.facebook_group_url IS
  'Link do grupy Facebook związanej z tą sekcją (opcjonalne). Pokazywany w UI dla uczestników.';
