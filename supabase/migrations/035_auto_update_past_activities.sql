-- Migration 035: Auto-update past activities status from 'scheduled' to 'completed'
-- Funkcja automatycznie zmienia status wydarzeń, które już się odbyły

CREATE OR REPLACE FUNCTION update_past_activities_status()
RETURNS TABLE(updated_count INTEGER) AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  -- Update activities that have passed and are still marked as 'scheduled'
  UPDATE activities
  SET status = 'completed'
  WHERE status = 'scheduled'
    AND date_time < NOW()
    AND status != 'cancelled'; -- Don't change cancelled events

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  RETURN QUERY SELECT rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_past_activities_status IS
  'Automatycznie zmienia status wydarzeń z "scheduled" na "completed" gdy data_time < NOW()';

-- Wykonaj funkcję raz przy migracji, żeby zaktualizować istniejące wydarzenia
SELECT update_past_activities_status();
