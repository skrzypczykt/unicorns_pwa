-- Fix duplicate registration issue: allow re-registration after cancellation
-- Migration 016: Replace unique constraint with partial unique index

-- Drop old unique constraint
ALTER TABLE public.registrations
DROP CONSTRAINT IF EXISTS registrations_activity_id_user_id_key;

-- Create partial unique index - prevents duplicates only for active registrations
-- Users can re-register after cancellation
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_registration
  ON public.registrations(activity_id, user_id)
  WHERE status IN ('registered', 'attended');

COMMENT ON INDEX unique_active_registration IS
  'Prevents duplicate active registrations. Allows re-registration after cancellation (status=cancelled or no_show).';
