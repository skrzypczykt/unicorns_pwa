-- Migration 039: Redesign Recurring Activities
-- Purpose: Make parent activities true templates without specific dates
-- Support infinite recurrence and improve admin UX

-- Add new recurrence rule fields
ALTER TABLE activities
ADD COLUMN recurrence_day_of_week TEXT
  CHECK (recurrence_day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
ADD COLUMN recurrence_time TIME;

-- Make date_time nullable to support template activities
ALTER TABLE activities ALTER COLUMN date_time DROP NOT NULL;

-- Add constraint to ensure recurrence data consistency
ALTER TABLE activities ADD CONSTRAINT recurrence_rules_check
CHECK (
  -- Old style template: is_recurring with date_time (backward compatibility)
  (is_recurring = true AND date_time IS NOT NULL AND recurrence_day_of_week IS NULL AND recurrence_time IS NULL)
  OR
  -- New style template: is_recurring with day/time rules, no specific date
  (is_recurring = true AND date_time IS NULL AND recurrence_day_of_week IS NOT NULL AND recurrence_time IS NOT NULL)
  OR
  -- Instance or single activity: must have date_time
  (is_recurring = false AND date_time IS NOT NULL AND recurrence_day_of_week IS NULL AND recurrence_time IS NULL)
);

-- Add index for efficient template queries
CREATE INDEX idx_activities_recurrence_template
  ON activities(is_recurring, parent_activity_id)
  WHERE is_recurring = true AND parent_activity_id IS NULL;

-- Add documentation
COMMENT ON COLUMN activities.recurrence_day_of_week IS
  'Day of week for recurring template (Monday, Tuesday, etc.). NULL for non-recurring or old-style templates.';

COMMENT ON COLUMN activities.recurrence_time IS
  'Time of day for recurring template (HH:MM:SS). Used when date_time IS NULL for new-style template activities.';

-- Remove facebook_group_url from activity_types (replaced by whatsapp_group_url)
ALTER TABLE activity_types DROP COLUMN IF EXISTS facebook_group_url;
