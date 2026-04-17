-- Quick fix for NULL activity_type_id in activities table

-- Show which activities have NULL activity_type_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM activities
  WHERE activity_type_id IS NULL;

  IF null_count > 0 THEN
    RAISE NOTICE '⚠️  Found % activities without activity_type_id', null_count;
    RAISE NOTICE 'Listing them:';
  ELSE
    RAISE NOTICE '✅ All activities have activity_type_id set';
  END IF;
END $$;

-- Show activities with NULL type
SELECT
  id,
  name,
  date_time,
  status,
  trainer_id
FROM activities
WHERE activity_type_id IS NULL
ORDER BY date_time DESC;

-- DECISION: What to do with NULL activity_type_id activities?

-- OPTION 1: Assign them to a default type (e.g., "Inne" or first available)
-- First, create "Inne" category if it doesn't exist
INSERT INTO activity_types (name, description)
VALUES ('Inne', 'Kategoria domyślna dla nieprzypisanych zajęć')
ON CONFLICT (name) DO NOTHING;

-- Then assign all NULL activities to "Inne"
UPDATE activities
SET activity_type_id = (
  SELECT id FROM activity_types WHERE name = 'Inne' LIMIT 1
)
WHERE activity_type_id IS NULL;

-- OPTION 2: If these are test/junk data, delete them
-- UNCOMMENT if you want to delete instead:
-- DELETE FROM activities WHERE activity_type_id IS NULL;

-- Verify fix
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ All activities now have activity_type_id'
    ELSE '⚠️  Still ' || COUNT(*) || ' activities without type'
  END as status
FROM activities
WHERE activity_type_id IS NULL;

-- Add NOT NULL constraint to prevent future issues
ALTER TABLE activities
ALTER COLUMN activity_type_id SET NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ FIX COMPLETED';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'All activities now have activity_type_id';
  RAISE NOTICE 'NOT NULL constraint added to prevent future NULLs';
  RAISE NOTICE '';
END $$;
