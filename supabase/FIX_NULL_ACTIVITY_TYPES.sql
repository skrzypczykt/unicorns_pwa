-- Fix activities with NULL activity_type_id

-- Step 1: Check how many activities have NULL activity_type_id
SELECT COUNT(*) as activities_without_type
FROM activities
WHERE activity_type_id IS NULL;

-- Step 2: Show these activities
SELECT
  id,
  name,
  activity_type_id,
  date_time,
  trainer_id
FROM activities
WHERE activity_type_id IS NULL
ORDER BY date_time DESC
LIMIT 20;

-- Step 3: Get available activity types to choose from
SELECT id, name
FROM activity_types
ORDER BY name;

-- Step 4: UPDATE - Set a default activity_type_id for activities without one
-- OPTION A: Set all to a specific type (e.g., first available type)
-- UNCOMMENT to apply:
/*
UPDATE activities
SET activity_type_id = (SELECT id FROM activity_types LIMIT 1)
WHERE activity_type_id IS NULL;
*/

-- OPTION B: Delete activities without type (if they're test data)
-- UNCOMMENT to apply:
/*
DELETE FROM activities
WHERE activity_type_id IS NULL;
*/

-- Step 5: Add NOT NULL constraint to prevent future NULLs
-- Check if constraint already exists
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'activities'
  AND column_name = 'activity_type_id';

-- Add NOT NULL constraint
-- UNCOMMENT after fixing NULL values:
/*
ALTER TABLE activities
ALTER COLUMN activity_type_id SET NOT NULL;
*/

-- Verify no NULLs remain
SELECT COUNT(*) as remaining_nulls
FROM activities
WHERE activity_type_id IS NULL;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'ACTIVITY_TYPE_ID CLEANUP';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Steps:';
  RAISE NOTICE '1. Review activities with NULL activity_type_id above';
  RAISE NOTICE '2. Choose option A (update) or B (delete)';
  RAISE NOTICE '3. Uncomment and run the UPDATE or DELETE';
  RAISE NOTICE '4. Uncomment ALTER TABLE to add NOT NULL constraint';
  RAISE NOTICE '';
END $$;
