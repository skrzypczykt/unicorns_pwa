-- Migration 009: Accounting report function
-- Generates monthly financial reports per user/section

CREATE OR REPLACE FUNCTION public.get_accounting_report(
  report_month DATE,
  activity_type_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  email TEXT,
  section_name TEXT,
  opening_balance DECIMAL(10, 2),
  closing_balance DECIMAL(10, 2),
  total_credits DECIMAL(10, 2),
  total_debits DECIMAL(10, 2),
  classes_attended BIGINT,
  classes_total BIGINT,
  debt DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH month_bounds AS (
    -- Month boundaries (e.g., 2026-04-01 00:00 - 2026-04-30 23:59)
    SELECT
      date_trunc('month', report_month) AS month_start,
      (date_trunc('month', report_month) + interval '1 month' - interval '1 second')::timestamp WITH TIME ZONE AS month_end
  ),
  user_opening_balances AS (
    -- Opening balance per section
    -- Sum all transactions before month_start for each section
    SELECT
      bt.user_id,
      bt.activity_type_id,
      SUM(bt.amount) AS opening_balance
    FROM balance_transactions bt
    CROSS JOIN month_bounds mb
    WHERE bt.created_at < mb.month_start
      AND bt.activity_type_id IS NOT NULL
    GROUP BY bt.user_id, bt.activity_type_id
  ),
  monthly_transactions AS (
    -- Transactions within the month per user + section
    SELECT
      bt.user_id,
      bt.activity_type_id,
      SUM(CASE WHEN bt.amount > 0 THEN bt.amount ELSE 0 END) AS total_credits,
      SUM(CASE WHEN bt.amount < 0 THEN ABS(bt.amount) ELSE 0 END) AS total_debits
    FROM balance_transactions bt
    CROSS JOIN month_bounds mb
    WHERE bt.created_at BETWEEN mb.month_start AND mb.month_end
      AND bt.activity_type_id IS NOT NULL
      AND (activity_type_filter IS NULL OR bt.activity_type_id = activity_type_filter)
    GROUP BY bt.user_id, bt.activity_type_id
  ),
  attendance_stats AS (
    -- Attendance statistics per user per section
    SELECT
      r.user_id,
      a.activity_type_id,
      COUNT(*) FILTER (WHERE r.status = 'attended') AS classes_attended,
      COUNT(*) AS classes_total
    FROM registrations r
    JOIN activities a ON r.activity_id = a.id
    CROSS JOIN month_bounds mb
    WHERE a.date_time BETWEEN mb.month_start AND mb.month_end
      AND (activity_type_filter IS NULL OR a.activity_type_id = activity_type_filter)
    GROUP BY r.user_id, a.activity_type_id
  )
  SELECT
    u.id AS user_id,
    u.display_name AS user_name,
    u.email,
    at.name AS section_name,

    COALESCE(uob.opening_balance, 0) AS opening_balance,
    COALESCE(usb.balance, 0) AS closing_balance,

    COALESCE(mt.total_credits, 0) AS total_credits,
    COALESCE(mt.total_debits, 0) AS total_debits,

    COALESCE(ast.classes_attended, 0) AS classes_attended,
    COALESCE(ast.classes_total, 0) AS classes_total,

    CASE WHEN COALESCE(usb.balance, 0) < 0 THEN ABS(usb.balance) ELSE 0 END AS debt

  FROM users u
  CROSS JOIN activity_types at
  LEFT JOIN user_section_balances usb ON u.id = usb.user_id AND at.id = usb.activity_type_id
  LEFT JOIN user_opening_balances uob ON u.id = uob.user_id AND at.id = uob.activity_type_id
  LEFT JOIN monthly_transactions mt ON u.id = mt.user_id AND at.id = mt.activity_type_id
  LEFT JOIN attendance_stats ast ON u.id = ast.user_id AND at.id = ast.activity_type_id
  WHERE
    (activity_type_filter IS NULL OR at.id = activity_type_filter)
    AND (
      -- Show only users who have transactions in this section
      -- or have non-zero balance
      mt.user_id IS NOT NULL
      OR ast.user_id IS NOT NULL
      OR COALESCE(usb.balance, 0) != 0
    )
  ORDER BY at.name, u.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_accounting_report IS 'Generuje raport księgowy per użytkownik/sekcja/miesiąc';
