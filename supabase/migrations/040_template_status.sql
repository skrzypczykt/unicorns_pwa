-- Migration 040: Add 'template' status for parent activities
-- Purpose: Szablony nie powinny być aktywne zajęcia

-- 1. Add 'template' to status CHECK constraint
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_status_check;
ALTER TABLE activities ADD CONSTRAINT activities_status_check
  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'template'));

-- 2. Update existing parent activities to 'template' status
UPDATE activities
SET status = 'template'
WHERE is_recurring = true
  AND parent_activity_id IS NULL
  AND status = 'scheduled';

-- 3. Add comment
COMMENT ON COLUMN activities.status IS
  'Status zajęć: scheduled (zaplanowane), completed (zakończone), cancelled (anulowane), template (szablon cykliczny)';

-- 4. Update recurrence_rules_check to handle template status
ALTER TABLE activities DROP CONSTRAINT IF EXISTS recurrence_rules_check;
ALTER TABLE activities ADD CONSTRAINT recurrence_rules_check
CHECK (
  -- Old style template: is_recurring with date_time
  (is_recurring = true AND date_time IS NOT NULL AND recurrence_day_of_week IS NULL AND recurrence_time IS NULL AND status = 'template')
  OR
  -- New style template: is_recurring with day/time rules, no specific date
  (is_recurring = true AND date_time IS NULL AND recurrence_day_of_week IS NOT NULL AND recurrence_time IS NOT NULL AND status = 'template')
  OR
  -- Instance or single activity: must have date_time and status NOT template
  (is_recurring = false AND date_time IS NOT NULL AND recurrence_day_of_week IS NULL AND recurrence_time IS NULL AND status IN ('scheduled', 'completed', 'cancelled'))
);
