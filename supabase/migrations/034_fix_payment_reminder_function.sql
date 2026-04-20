-- Migration 034: Fix get_registrations_needing_payment_reminders to include activity_cost
-- Edge Function send-payment-reminders potrzebuje activity_cost do wyświetlenia w powiadomieniu

DROP FUNCTION IF EXISTS get_registrations_needing_payment_reminders();

CREATE OR REPLACE FUNCTION get_registrations_needing_payment_reminders()
RETURNS TABLE(
  registration_id UUID,
  user_id UUID,
  activity_id UUID,
  activity_name TEXT,
  activity_cost NUMERIC,
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
    a.cost AS activity_cost,
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
      -- Case 2: Less than 24h until due - send every 6h (more frequent)
      (
        EXTRACT(EPOCH FROM (r.payment_due_date - now())) / 3600 <= 24
        AND (
          r.last_payment_reminder_sent_at IS NULL
          OR r.last_payment_reminder_sent_at < now() - INTERVAL '6 hours'
        )
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_registrations_needing_payment_reminders IS
  'Zwraca listę rejestracji wymagających przypomnienia o płatności (z activity_cost)';
