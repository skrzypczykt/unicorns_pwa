-- Clean up orphaned registrations (registrations for deleted users)
-- and add foreign key constraint to prevent this in the future

-- Step 1: Find orphaned registrations
SELECT
  r.id,
  r.user_id,
  r.status,
  r.created_at,
  a.name as activity_name
FROM registrations r
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN activities a ON r.activity_id = a.id
WHERE u.id IS NULL;

-- Step 2: Count them
SELECT COUNT(*) as orphaned_registrations_count
FROM registrations r
LEFT JOIN users u ON r.user_id = u.id
WHERE u.id IS NULL;

-- Step 3: Delete orphaned registrations
-- UNCOMMENT THE FOLLOWING LINE TO ACTUALLY DELETE:
-- DELETE FROM registrations WHERE user_id NOT IN (SELECT id FROM users);

-- Alternative safer approach - delete specific ones by ID:
-- DELETE FROM registrations WHERE id IN (
--   'b26d32c9-2d1f-484b-99e0-da12e48dfd50',
--   'dc960b19-b323-4c4d-b564-186362d569c0'
-- );

-- Step 4: Check if foreign key constraint exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
  AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'registrations'
  AND kcu.column_name = 'user_id';

-- Step 5: Add/update foreign key constraint with CASCADE delete
-- First, drop existing constraint if it exists and doesn't have CASCADE
DO $$
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Get the constraint name
  SELECT constraint_name INTO constraint_name_var
  FROM information_schema.table_constraints
  WHERE table_name = 'registrations'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%user_id%';

  -- Check if it has CASCADE delete
  IF constraint_name_var IS NOT NULL THEN
    -- Check delete rule
    IF EXISTS (
      SELECT 1
      FROM information_schema.referential_constraints
      WHERE constraint_name = constraint_name_var
        AND delete_rule != 'CASCADE'
    ) THEN
      -- Drop and recreate with CASCADE
      RAISE NOTICE 'Dropping constraint % to recreate with CASCADE', constraint_name_var;
      EXECUTE format('ALTER TABLE registrations DROP CONSTRAINT %I', constraint_name_var);

      ALTER TABLE registrations
        ADD CONSTRAINT registrations_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;

      RAISE NOTICE '✅ Foreign key constraint recreated with ON DELETE CASCADE';
    ELSE
      RAISE NOTICE '✅ Foreign key constraint already has ON DELETE CASCADE';
    END IF;
  ELSE
    -- No constraint exists, create it
    ALTER TABLE registrations
      ADD CONSTRAINT registrations_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;

    RAISE NOTICE '✅ Foreign key constraint created with ON DELETE CASCADE';
  END IF;
END $$;

-- Step 6: Verify the constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
  AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'registrations'
  AND kcu.column_name = 'user_id';

-- Summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'CLEANUP SUMMARY';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Review the orphaned registrations above';
  RAISE NOTICE '2. Uncomment DELETE statement to remove them';
  RAISE NOTICE '3. Foreign key constraint is now enforced with CASCADE';
  RAISE NOTICE '4. Future user deletions will auto-delete their registrations';
  RAISE NOTICE '';
END $$;
