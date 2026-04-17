-- Quick fix: Delete orphaned registrations and add CASCADE constraint

-- 1. Delete the 2 orphaned registrations we found in logs
DELETE FROM registrations
WHERE id IN (
  'b26d32c9-2d1f-484b-99e0-da12e48dfd50',
  'dc960b19-b323-4c4d-b564-186362d569c0'
);

-- 2. Delete any other orphaned registrations
DELETE FROM registrations
WHERE user_id NOT IN (SELECT id FROM users);

-- 3. Update foreign key constraint to CASCADE on delete
DO $$
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- Get the constraint name
  SELECT constraint_name INTO constraint_name_var
  FROM information_schema.table_constraints
  WHERE table_name = 'registrations'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%user_id%'
  LIMIT 1;

  IF constraint_name_var IS NOT NULL THEN
    -- Drop existing constraint
    EXECUTE format('ALTER TABLE registrations DROP CONSTRAINT %I', constraint_name_var);
    RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
  END IF;

  -- Create new constraint with CASCADE
  ALTER TABLE registrations
    ADD CONSTRAINT registrations_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

  RAISE NOTICE '✅ Foreign key constraint created with ON DELETE CASCADE';
  RAISE NOTICE 'Future user deletions will automatically remove their registrations';
END $$;

-- Verify no orphans remain
SELECT COUNT(*) as remaining_orphaned_registrations
FROM registrations r
LEFT JOIN users u ON r.user_id = u.id
WHERE u.id IS NULL;
