-- Migration 008: Section-based balance architecture
-- Enables separate balance tracking per activity section (Badminton, Taniec, Siatkówka, etc.)

-- Add missing activity types
INSERT INTO public.activity_types (name, description)
VALUES
  ('Badminton', 'Zajęcia badmintona - gra rakietowa dla wszystkich poziomów'),
  ('Siatkówka', 'Treningi siatkówki i mini ligi'),
  ('Squash', 'Squash - gra rakietowa w zamkniętym korcie')
ON CONFLICT (name) DO NOTHING;

-- Create user_section_balances table
CREATE TABLE IF NOT EXISTS public.user_section_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, activity_type_id)
);

CREATE INDEX idx_user_section_balances_user ON user_section_balances(user_id);
CREATE INDEX idx_user_section_balances_type ON user_section_balances(activity_type_id);
CREATE INDEX idx_user_section_balances_user_type ON user_section_balances(user_id, activity_type_id);

-- Add activity_type_id column to balance_transactions
ALTER TABLE balance_transactions
ADD COLUMN IF NOT EXISTS activity_type_id UUID REFERENCES activity_types(id);

CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(activity_type_id);

-- Function: Backfill activity_type_id for existing transactions
CREATE OR REPLACE FUNCTION backfill_transaction_activity_type()
RETURNS void AS $$
BEGIN
  UPDATE balance_transactions bt
  SET activity_type_id = a.activity_type_id
  FROM activities a
  WHERE bt.reference_id = a.id
    AND bt.activity_type_id IS NULL
    AND bt.type = 'class_payment';
END;
$$ LANGUAGE plpgsql;

-- Execute backfill
SELECT backfill_transaction_activity_type();

-- Function: Initialize section balances for existing users
CREATE OR REPLACE FUNCTION initialize_section_balances()
RETURNS void AS $$
BEGIN
  -- For each user and each section where they have transactions
  INSERT INTO user_section_balances (user_id, activity_type_id, balance)
  SELECT DISTINCT
    bt.user_id,
    bt.activity_type_id,
    0.00  -- Starting balance 0, will be recalculated by next function
  FROM balance_transactions bt
  WHERE bt.activity_type_id IS NOT NULL
  ON CONFLICT (user_id, activity_type_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute initialization
SELECT initialize_section_balances();

-- Function: Recalculate section balances based on transaction history
CREATE OR REPLACE FUNCTION recalculate_section_balances()
RETURNS void AS $$
BEGIN
  -- For each user and section, sum all transactions
  UPDATE user_section_balances usb
  SET balance = COALESCE(
    (
      SELECT SUM(amount)
      FROM balance_transactions bt
      WHERE bt.user_id = usb.user_id
        AND bt.activity_type_id = usb.activity_type_id
    ),
    0.00
  ),
  updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Execute recalculation
SELECT recalculate_section_balances();

-- Enable RLS for user_section_balances
ALTER TABLE user_section_balances ENABLE ROW LEVEL SECURITY;

-- Admin can view all section balances
CREATE POLICY "Admins can view all section balances"
  ON user_section_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own section balances
CREATE POLICY "Users can view own section balances"
  ON user_section_balances FOR SELECT
  USING (auth.uid() = user_id);

-- Only system/admin can modify (through functions)
CREATE POLICY "Only system can modify section balances"
  ON user_section_balances FOR ALL
  USING (false);

-- Add comments for documentation
COMMENT ON TABLE user_section_balances IS 'Salda użytkowników per sekcja (activity_type)';
COMMENT ON COLUMN balance_transactions.activity_type_id IS 'Sekcja do której należy transakcja (NULL = ogólna wpłata)';
