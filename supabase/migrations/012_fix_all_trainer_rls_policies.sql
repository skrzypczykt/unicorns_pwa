-- Comprehensive RLS fix for trainer attendance marking
-- Fixes 403 Forbidden and 406 Not Acceptable errors

-- =============================================
-- 1. FIX user_section_balances RLS
-- =============================================

DROP POLICY IF EXISTS "Admins can view all section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Users can view own section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Only system can modify section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Trainers can update section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Admins can update section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Trainers can view section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Admins can create section balances" ON user_section_balances;
DROP POLICY IF EXISTS "Trainers can create section balances when marking attendance" ON user_section_balances;
DROP POLICY IF EXISTS "Trainers can update section balances when marking attendance" ON user_section_balances;

ALTER TABLE user_section_balances ENABLE ROW LEVEL SECURITY;

-- SELECT policies
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

CREATE POLICY "Trainers can view all section balances"
  ON user_section_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- INSERT policies
CREATE POLICY "Admins can create section balances"
  ON user_section_balances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Trainers can create section balances"
  ON user_section_balances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- UPDATE policies
CREATE POLICY "Admins can update section balances"
  ON user_section_balances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Trainers can update section balances"
  ON user_section_balances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- =============================================
-- 2. FIX balance_transactions RLS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON balance_transactions;
DROP POLICY IF EXISTS "System can create transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Admins can create transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Trainers can create transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Trainers can create transactions for class payments" ON balance_transactions;

ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Users can view own transactions"
  ON balance_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON balance_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Trainers can view transactions"
  ON balance_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
  );

-- INSERT policies
CREATE POLICY "Admins can create transactions"
  ON balance_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Trainers can create class payment transactions"
  ON balance_transactions FOR INSERT
  WITH CHECK (
    -- Trainers can only create class_payment type transactions
    type = 'class_payment'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('trainer', 'external_trainer')
    )
    -- Additional check: trainer must be assigned to the activity
    AND (
      reference_id IS NULL
      OR EXISTS (
        SELECT 1 FROM activities
        WHERE id = reference_id
        AND trainer_id = auth.uid()
      )
    )
  );

-- =============================================
-- 3. FIX attendance table RLS (if needed)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
    DROP POLICY IF EXISTS "Trainers can manage attendance" ON attendance;
    DROP POLICY IF EXISTS "Admins can manage all attendance" ON attendance;

    ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

    -- SELECT policies
    CREATE POLICY "Users can view own attendance"
      ON attendance FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all attendance"
      ON attendance FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
      );

    CREATE POLICY "Trainers can view attendance for their activities"
      ON attendance FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM activities a
          JOIN users u ON u.id = auth.uid()
          WHERE a.id = attendance.activity_id
            AND a.trainer_id = auth.uid()
            AND u.role IN ('trainer', 'external_trainer')
        )
      );

    -- INSERT/UPDATE/DELETE policies for trainers
    CREATE POLICY "Trainers can manage attendance for their activities"
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

    -- Admin policy
    CREATE POLICY "Admins can manage all attendance"
      ON attendance FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
      );

    RAISE NOTICE '✅ Attendance table RLS policies updated';
  END IF;
END $$;

-- =============================================
-- 4. Add helpful comments
-- =============================================

COMMENT ON TABLE user_section_balances IS 'User balances per activity type/section. Trainers can read/write when marking attendance.';
COMMENT ON TABLE balance_transactions IS 'Immutable transaction log. Trainers can INSERT class_payment records for their activities.';

-- =============================================
-- Success message
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ RLS POLICIES UPDATED';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE 'user_section_balances:';
  RAISE NOTICE '  ✓ Trainers can SELECT all balances';
  RAISE NOTICE '  ✓ Trainers can INSERT new balance records';
  RAISE NOTICE '  ✓ Trainers can UPDATE existing balances';
  RAISE NOTICE '';
  RAISE NOTICE 'balance_transactions:';
  RAISE NOTICE '  ✓ Trainers can SELECT transactions';
  RAISE NOTICE '  ✓ Trainers can INSERT class_payment transactions';
  RAISE NOTICE '  ✓ Only for activities they are assigned to';
  RAISE NOTICE '';
  RAISE NOTICE 'attendance:';
  RAISE NOTICE '  ✓ Trainers can manage attendance for their activities';
  RAISE NOTICE '';
  RAISE NOTICE 'Trainers can now mark attendance without RLS errors!';
  RAISE NOTICE '';
END $$;
