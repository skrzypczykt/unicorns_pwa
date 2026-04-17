-- Fix RLS policies for user_section_balances
-- Allow trainers and admins to update balances when marking attendance

-- Drop all existing policies for user_section_balances
DROP POLICY IF EXISTS "Admins can view all section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Users can view own section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Only system can modify section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Trainers can update section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Admins can update section balances" ON user_section_balances;

-- Enable RLS
ALTER TABLE user_section_balances ENABLE ROW LEVEL SECURITY;

-- 1. SELECT policies - who can view balances
CREATE POLICY "Admins can view all section balances"
  ON user_section_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own section balances"
  ON user_section_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Trainers can view section balances"
  ON user_section_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- 2. INSERT policies - who can create new balance records
CREATE POLICY "Admins can create section balances"
  ON user_section_balances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Trainers can create section balances when marking attendance"
  ON user_section_balances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- 3. UPDATE policies - who can modify existing balances
CREATE POLICY "Admins can update section balances"
  ON user_section_balances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Trainers can update section balances when marking attendance"
  ON user_section_balances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- Add comments
COMMENT ON TABLE user_section_balances IS 'User balances per activity type/section. Trainers can update when marking attendance.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for user_section_balances';
  RAISE NOTICE 'Trainers can now update balances when marking attendance';
  RAISE NOTICE 'Admins have full access';
  RAISE NOTICE 'Users can view their own balances';
END $$;
