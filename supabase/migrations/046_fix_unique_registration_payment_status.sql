-- Fix unique_active_registration constraint to exclude pending payments
-- Migration 046: Update partial unique index to consider payment_status

-- Drop old index
DROP INDEX IF EXISTS unique_active_registration;

-- Create new partial unique index - prevents duplicates only for CONFIRMED registrations
-- Excludes payment_status='pending' so users can retry payment
CREATE UNIQUE INDEX unique_active_registration
  ON public.registrations(activity_id, user_id)
  WHERE status IN ('registered', 'attended')
    AND payment_status != 'pending';

COMMENT ON INDEX unique_active_registration IS
  'Prevents duplicate active registrations with confirmed payment. Allows re-registration after cancellation and excludes pending payments.';
