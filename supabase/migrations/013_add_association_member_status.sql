-- Migration 013: Add association member status
-- Allows users to be marked as official association members
-- This is an additional attribute, not a separate role

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
