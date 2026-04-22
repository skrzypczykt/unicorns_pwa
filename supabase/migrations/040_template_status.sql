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
  AND parent_activity_id IS NULL;

-- 3. Add comment
COMMENT ON COLUMN activities.status IS
  'Status zajęć: scheduled (zaplanowane), completed (zakończone), cancelled (anulowane), template (szablon cykliczny)';

-- 4. Update recurrence_rules_check to handle template status (relaxed version)
-- Note: We relax the constraint to allow existing data while still enforcing key rules
ALTER TABLE activities DROP CONSTRAINT IF EXISTS recurrence_rules_check;
ALTER TABLE activities ADD CONSTRAINT recurrence_rules_check
CHECK (
  -- Template: must be is_recurring=true and status='template'
  (is_recurring = true AND status = 'template')
  OR
  -- Non-recurring: must be is_recurring=false and status NOT template
  (is_recurring = false AND status IN ('scheduled', 'completed', 'cancelled'))
);
