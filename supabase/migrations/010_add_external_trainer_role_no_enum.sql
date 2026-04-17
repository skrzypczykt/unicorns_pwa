-- Safe migration: Add external_trainer role support
-- Works with VARCHAR/TEXT role column (no enum)

-- First, add a check constraint to validate role values
-- Drop existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add constraint allowing the new role
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'trainer', 'admin', 'external_trainer'));

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
-- First check if attendance table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Trainers can manage attendance" ON attendance;

    -- Create new policy
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
  ELSE
    RAISE NOTICE 'attendance table does not exist, skipping policy creation';
  END IF;
END $$;

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

-- Add trigger to user_section_balances if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_section_balances') THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS check_external_trainer_section_balance ON user_section_balances;

    -- Create new trigger
    CREATE TRIGGER check_external_trainer_section_balance
      BEFORE INSERT OR UPDATE ON user_section_balances
      FOR EACH ROW
      EXECUTE FUNCTION prevent_external_trainer_balance();
  ELSE
    RAISE NOTICE 'user_section_balances table does not exist, skipping trigger creation';
  END IF;
END $$;

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

-- Add comments to role column
COMMENT ON COLUMN users.role IS 'User role: admin, trainer, external_trainer, or user. External trainers can lead activities but cannot register or have balances.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'external_trainer role is now available';
  RAISE NOTICE 'External trainers can lead activities but cannot register or have balances';
  RAISE NOTICE '';
  RAISE NOTICE 'To create an external trainer:';
  RAISE NOTICE 'UPDATE users SET role = ''external_trainer'' WHERE email = ''trainer@example.com'';';
END $$;
