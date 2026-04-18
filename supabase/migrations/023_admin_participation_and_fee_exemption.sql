-- Migration 023: Admin Participation & Membership Fee Exemption
-- 1. Umożliwia adminowi zapisywanie się na zajęcia (blacklist tylko external_trainer)
-- 2. Dodaje system zwolnień ze składki członkowskiej

-- ============================================================================
-- CZĘŚĆ 1: Odblokowanie admina - RLS Policy
-- ============================================================================

-- Usuń starą policy która blokowała admina
DROP POLICY IF EXISTS "Users can register for activities" ON registrations;

-- Nowa policy - blacklist tylko external_trainer
-- Admin, trainer, user mogą się zapisywać; tylko external_trainer nie może
CREATE POLICY "Users can register for activities"
  ON registrations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'external_trainer'
    )
  );

COMMENT ON POLICY "Users can register for activities" ON registrations IS
  'Wszyscy użytkownicy mogą się zapisywać na zajęcia, oprócz external_trainer (który nie ma balance i jest tylko do prowadzenia zajęć)';

-- ============================================================================
-- CZĘŚĆ 2: Membership Fee Exemption Fields
-- ============================================================================

-- Dodaj pola zwolnienia ze składki do tabeli users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership_fee_exempt BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS exemption_reason TEXT,
  ADD COLUMN IF NOT EXISTS exemption_granted_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS exemption_granted_at TIMESTAMP WITH TIME ZONE;

-- Index dla szybkiego filtrowania exempt members
CREATE INDEX IF NOT EXISTS idx_users_membership_exempt
  ON users(membership_fee_exempt)
  WHERE is_association_member = true AND membership_fee_exempt = true;

-- Komentarze wyjaśniające pola
COMMENT ON COLUMN users.membership_fee_exempt IS
  'Czy członek jest zwolniony ze składki członkowskiej (true = nie naliczaj automatycznie)';
COMMENT ON COLUMN users.exemption_reason IS
  'Powód zwolnienia ze składki (np. "Zarząd", "Wolontariat", "Sytuacja finansowa")';
COMMENT ON COLUMN users.exemption_granted_by IS
  'ID admina który udzielił zwolnienia';
COMMENT ON COLUMN users.exemption_granted_at IS
  'Data i czas udzielenia zwolnienia';

-- ============================================================================
-- CZĘŚĆ 3: Audit Trail - Historia zmian zwolnień (opcjonalne)
-- ============================================================================

-- Tabela historii zmian zwolnień dla audytu
CREATE TABLE IF NOT EXISTS public.membership_exemption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'updated')),
  reason TEXT,
  granted_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exemption_history_user
  ON membership_exemption_history(user_id, created_at DESC);

-- Włącz RLS
ALTER TABLE membership_exemption_history ENABLE ROW LEVEL SECURITY;

-- Tylko admini mogą przeglądać historię zwolnień
CREATE POLICY "Admins can view exemption history"
  ON membership_exemption_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Tylko admini mogą zapisywać historię (wywoływane przez aplikację)
CREATE POLICY "Admins can insert exemption history"
  ON membership_exemption_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

COMMENT ON TABLE membership_exemption_history IS
  'Historia zmian zwolnień ze składki członkowskiej (audit trail)';
