-- Migration 020: Payment Tracking for Registrations
-- Adds payment status tracking and payment deadlines

-- ============================================================================
-- 1. Extend activities table with payment requirements
-- ============================================================================

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS requires_immediate_payment BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_deadline_hours INTEGER DEFAULT 48;

COMMENT ON COLUMN activities.requires_immediate_payment IS 'Czy zajęcia wymagają natychmiastowej płatności przy zapisie';
COMMENT ON COLUMN activities.payment_deadline_hours IS 'Ile godzin przed zajęciami trzeba zapłacić (jeśli nie immediate)';

-- ============================================================================
-- 2. Extend registrations table with payment tracking
-- ============================================================================

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  ADD COLUMN IF NOT EXISTS payment_due_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_payment_reminder_sent_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN registrations.payment_status IS 'Status płatności: paid (opłacone), pending (oczekujące), overdue (przeterminowane)';
COMMENT ON COLUMN registrations.payment_due_date IS 'Termin płatności (deadline)';
COMMENT ON COLUMN registrations.paid_at IS 'Kiedy użytkownik zapłacił';
COMMENT ON COLUMN registrations.last_payment_reminder_sent_at IS 'Kiedy wysłano ostatnie przypomnienie o płatności';

-- Create indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_due_date ON registrations(payment_due_date) WHERE payment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_registrations_payment_reminders ON registrations(payment_due_date, last_payment_reminder_sent_at) WHERE payment_status = 'pending';

-- ============================================================================
-- 3. Function: Calculate payment due date
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_payment_due_date(
  activity_id_param UUID
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  activity_record RECORD;
  due_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get activity details
  SELECT
    date_time,
    registration_closes_at,
    requires_immediate_payment,
    payment_deadline_hours
  INTO activity_record
  FROM activities
  WHERE id = activity_id_param;

  -- If requires immediate payment, return null (must pay now)
  IF activity_record.requires_immediate_payment THEN
    RETURN NULL;
  END IF;

  -- Calculate due date based on payment_deadline_hours before the activity
  -- If registration_closes_at is set and earlier, use that instead
  due_date := activity_record.date_time - (activity_record.payment_deadline_hours || ' hours')::INTERVAL;

  IF activity_record.registration_closes_at IS NOT NULL
     AND activity_record.registration_closes_at < due_date THEN
    due_date := activity_record.registration_closes_at;
  END IF;

  RETURN due_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Trigger: Auto-update overdue status
-- ============================================================================

CREATE OR REPLACE FUNCTION update_overdue_registrations()
RETURNS void AS $$
BEGIN
  UPDATE registrations
  SET payment_status = 'overdue'
  WHERE payment_status = 'pending'
    AND payment_due_date IS NOT NULL
    AND payment_due_date < now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Function: Get unpaid registrations needing reminders
-- ============================================================================

CREATE OR REPLACE FUNCTION get_registrations_needing_payment_reminders()
RETURNS TABLE(
  registration_id UUID,
  user_id UUID,
  activity_id UUID,
  activity_name TEXT,
  activity_date TIMESTAMP WITH TIME ZONE,
  payment_due_date TIMESTAMP WITH TIME ZONE,
  hours_until_due NUMERIC,
  last_reminder_sent TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS registration_id,
    r.user_id,
    r.activity_id,
    a.name AS activity_name,
    a.date_time AS activity_date,
    r.payment_due_date,
    EXTRACT(EPOCH FROM (r.payment_due_date - now())) / 3600 AS hours_until_due,
    r.last_payment_reminder_sent_at AS last_reminder_sent
  FROM registrations r
  JOIN activities a ON r.activity_id = a.id
  WHERE r.payment_status = 'pending'
    AND r.payment_due_date IS NOT NULL
    AND r.payment_due_date > now()  -- Not yet overdue
    AND (
      -- Case 1: More than 24h until due - send every 24h
      (
        EXTRACT(EPOCH FROM (r.payment_due_date - now())) / 3600 > 24
        AND (
          r.last_payment_reminder_sent_at IS NULL
          OR r.last_payment_reminder_sent_at < now() - INTERVAL '24 hours'
        )
      )
      OR
      -- Case 2: Less than 24h until due - send every 6h
      (
        EXTRACT(EPOCH FROM (r.payment_due_date - now())) / 3600 <= 24
        AND (
          r.last_payment_reminder_sent_at IS NULL
          OR r.last_payment_reminder_sent_at < now() - INTERVAL '6 hours'
        )
      )
    )
  ORDER BY r.payment_due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Function: Mark payment as paid
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_registration_as_paid(
  registration_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE registrations
  SET
    payment_status = 'paid',
    paid_at = now()
  WHERE id = registration_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Update existing registrations
-- ============================================================================

-- Set existing registrations as paid (retroactive)
UPDATE registrations
SET
  payment_status = 'paid',
  paid_at = registered_at,
  payment_due_date = NULL
WHERE payment_status IS NULL OR payment_status = 'pending';

-- ============================================================================
-- 8. Add RLS policies for payment functions
-- ============================================================================

-- Users can view their own registration payment status
-- Already covered by existing registrations RLS

-- Users can mark their own registrations as paid (through UI/Edge Function)
-- This will be handled via Edge Function with elevated privileges

COMMENT ON FUNCTION calculate_payment_due_date IS 'Oblicza termin płatności dla zajęć na podstawie payment_deadline_hours';
COMMENT ON FUNCTION update_overdue_registrations IS 'Aktualizuje status rejestracji których termin płatności minął';
COMMENT ON FUNCTION get_registrations_needing_payment_reminders IS 'Zwraca listę rejestracji wymagających przypomnienia o płatności';
COMMENT ON FUNCTION mark_registration_as_paid IS 'Oznacza rejestrację jako opłaconą';
