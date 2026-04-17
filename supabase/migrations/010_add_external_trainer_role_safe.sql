-- Safe migration: Add external_trainer role
-- This version can be run multiple times safely

-- First, check if external_trainer already exists in the enum
DO $$
BEGIN
  -- Try to add the value, ignore if it already exists
  BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'external_trainer';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'external_trainer role already exists, skipping';
  END;
END $$;

-- Update RLS policies to prevent external_trainers from registering for activities

-- Drop and recreate policy for registering
DROP POLICY IF EXISTS "Users can register for activities" ON registrations;

CREATE POLICY "Users can register for activities"
  ON registrations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('user', 'trainer')  -- external_trainer cannot register
    )
  );

-- External trainers can view their own activities
DROP POLICY IF EXISTS "Trainers can view their activities" ON activities;

CREATE POLICY "Trainers can view their activities"
  ON activities FOR SELECT
  USING (
    trainer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- External trainers can mark attendance (same as regular trainers)
DROP POLICY IF EXISTS "Trainers can manage attendance" ON attendance;

CREATE POLICY "Trainers can manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN users u ON u.id = auth.uid()
      WHERE a.id = attendance.activity_id
        AND a.trainer_id = auth.uid()
        AND u.role IN ('trainer', 'external_trainer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN users u ON u.id = auth.uid()
      WHERE a.id = attendance.activity_id
        AND a.trainer_id = auth.uid()
        AND u.role IN ('trainer', 'external_trainer')
    )
  );

-- Create or replace function to prevent external_trainers from having balances
CREATE OR REPLACE FUNCTION prevent_external_trainer_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = NEW.user_id
    AND role = 'external_trainer'
  ) THEN
    RAISE EXCEPTION 'External trainers cannot have balance transactions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to balance_transactions (drop first if exists)
DROP TRIGGER IF EXISTS check_external_trainer_balance ON balance_transactions;
CREATE TRIGGER check_external_trainer_balance
  BEFORE INSERT ON balance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_external_trainer_balance();

-- Add trigger to user_section_balances (drop first if exists)
DROP TRIGGER IF EXISTS check_external_trainer_section_balance ON user_section_balances;
CREATE TRIGGER check_external_trainer_section_balance
  BEFORE INSERT OR UPDATE ON user_section_balances
  FOR EACH ROW
  EXECUTE FUNCTION prevent_external_trainer_balance();

-- Update policy for viewing registrations
DROP POLICY IF EXISTS "Users can view their registrations" ON registrations;

CREATE POLICY "Users can view their registrations"
  ON registrations FOR SELECT
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('user', 'trainer')  -- external_trainer won't have registrations
    )
  );

-- Update comments
COMMENT ON TYPE user_role IS 'User roles: admin (full access), trainer (can lead classes and register), external_trainer (can only lead classes), user (can only register)';
COMMENT ON COLUMN users.role IS 'User role: admin, trainer, external_trainer, or user';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'external_trainer role is now available';
  RAISE NOTICE 'External trainers can lead activities but cannot register or have balances';
END $$;
