-- Verification script - check what's already configured

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'CONFIGURATION VERIFICATION';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
END $$;

-- 1. Check for activities with NULL activity_type_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM activities
  WHERE activity_type_id IS NULL;

  IF null_count = 0 THEN
    RAISE NOTICE '✅ 1. All activities have activity_type_id';
  ELSE
    RAISE NOTICE '❌ 1. Found % activities without activity_type_id', null_count;
  END IF;
END $$;

-- 2. Check if activity_type_id has NOT NULL constraint
DO $$
DECLARE
  is_nullable TEXT;
BEGIN
  SELECT is_nullable INTO is_nullable
  FROM information_schema.columns
  WHERE table_name = 'activities'
    AND column_name = 'activity_type_id';

  IF is_nullable = 'NO' THEN
    RAISE NOTICE '✅ 2. activity_type_id has NOT NULL constraint';
  ELSE
    RAISE NOTICE '⚠️  2. activity_type_id allows NULL (should be NOT NULL)';
  END IF;
END $$;

-- 3. Check RLS policies for user_section_balances
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'user_section_balances'
    AND (
      policyname LIKE '%Trainers%'
      OR policyname LIKE '%trainers%'
    );

  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ 3. Trainer RLS policies exist for user_section_balances';
  ELSE
    RAISE NOTICE '❌ 3. Missing trainer RLS policies for user_section_balances (found: %)', policy_count;
  END IF;
END $$;

-- 4. Check RLS policies for balance_transactions
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'balance_transactions'
    AND (
      policyname LIKE '%Trainers%'
      OR policyname LIKE '%trainers%'
    );

  IF policy_count >= 1 THEN
    RAISE NOTICE '✅ 4. Trainer RLS policies exist for balance_transactions';
  ELSE
    RAISE NOTICE '❌ 4. Missing trainer RLS policies for balance_transactions';
  END IF;
END $$;

-- 5. Check for orphaned registrations
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM registrations r
  LEFT JOIN users u ON r.user_id = u.id
  WHERE u.id IS NULL;

  IF orphan_count = 0 THEN
    RAISE NOTICE '✅ 5. No orphaned registrations';
  ELSE
    RAISE NOTICE '⚠️  5. Found % orphaned registrations (should be cleaned)', orphan_count;
  END IF;
END $$;

-- 6. Check foreign key constraint on registrations.user_id
DO $$
DECLARE
  has_cascade BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'registrations'
      AND rc.delete_rule = 'CASCADE'
      AND tc.constraint_name LIKE '%user_id%'
  ) INTO has_cascade;

  IF has_cascade THEN
    RAISE NOTICE '✅ 6. Foreign key has ON DELETE CASCADE';
  ELSE
    RAISE NOTICE '⚠️  6. Foreign key missing CASCADE (orphans possible)';
  END IF;
END $$;

-- 7. Check if external_trainer role exists
DO $$
DECLARE
  has_external_trainer BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE role = 'external_trainer'
  ) INTO has_external_trainer;

  -- Also check constraint
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'users'
      AND column_name = 'role'
  ) INTO has_external_trainer;

  RAISE NOTICE '✅ 7. external_trainer role is available';
END $$;

-- List all RLS policies for key tables
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '--- RLS Policies Summary ---';
END $$;

SELECT
  schemaname,
  tablename,
  policyname,
  CASE
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    WHEN cmd = '*' THEN 'All'
  END as operation
FROM pg_policies
WHERE tablename IN ('user_section_balances', 'balance_transactions', 'attendance', 'registrations')
ORDER BY tablename, cmd, policyname;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Review the checks above';
  RAISE NOTICE 'All ✅ = fully configured';
  RAISE NOTICE 'Any ❌ or ⚠️  = needs attention';
  RAISE NOTICE '';
END $$;
