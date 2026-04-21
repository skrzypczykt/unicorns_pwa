-- Migration 038: Webhook Events Log
-- Przechowuje historię wszystkich webhooków płatności dla audytu i debugowania

-- ============================================================================
-- 1. Webhook Events Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider info
  provider TEXT NOT NULL CHECK (provider IN ('autopay', 'stripe', 'payu', 'tpay')),
  event_type TEXT, -- np. 'payment.succeeded', 'payment.failed'

  -- Request data
  raw_payload JSONB NOT NULL,
  headers JSONB,

  -- Parsed data
  order_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'PLN',
  payment_status TEXT CHECK (payment_status IN ('success', 'failed', 'pending', 'refunded')),

  -- Processing status
  processed_status TEXT NOT NULL CHECK (processed_status IN ('pending', 'processing', 'success', 'failed', 'duplicate')) DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Relations
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Signature verification
  signature_valid BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Indexes
  CONSTRAINT webhook_events_order_id_provider_unique UNIQUE(order_id, provider, created_at)
);

-- Indexes for performance
CREATE INDEX idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX idx_webhook_events_order_id ON public.webhook_events(order_id);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(processed_status);
CREATE INDEX idx_webhook_events_created_at ON public.webhook_events(created_at DESC);
CREATE INDEX idx_webhook_events_registration_id ON public.webhook_events(registration_id);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all webhook events"
  ON public.webhook_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own webhook events
CREATE POLICY "Users can view own webhook events"
  ON public.webhook_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. Helper Functions
-- ============================================================================

-- Get recent webhook events with details
CREATE OR REPLACE FUNCTION get_webhook_events_summary(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  provider TEXT,
  total_count BIGINT,
  success_count BIGINT,
  failed_count BIGINT,
  pending_count BIGINT,
  total_amount DECIMAL(10, 2),
  success_rate DECIMAL(5, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    we.provider,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE we.processed_status = 'success') AS success_count,
    COUNT(*) FILTER (WHERE we.processed_status = 'failed') AS failed_count,
    COUNT(*) FILTER (WHERE we.processed_status = 'pending') AS pending_count,
    COALESCE(SUM(we.amount) FILTER (WHERE we.processed_status = 'success'), 0) AS total_amount,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE we.processed_status = 'success')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END AS success_rate
  FROM webhook_events we
  WHERE we.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY we.provider
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check for duplicate webhook (idempotency)
CREATE OR REPLACE FUNCTION is_webhook_duplicate(
  order_id_param TEXT,
  provider_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM webhook_events
    WHERE order_id = order_id_param
      AND provider = provider_param
      AND processed_status IN ('success', 'processing')
      AND created_at > NOW() - INTERVAL '1 hour'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. Cleanup old webhook events (optional - run manually or via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(
  days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND processed_status != 'failed'; -- Keep failed events longer for debugging

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_webhook_events IS
  'Usuwa stare webhook events starsze niż X dni (zachowuje failed dla debugowania)';

-- ============================================================================
-- 4. Grant permissions
-- ============================================================================

GRANT SELECT ON public.webhook_events TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_events_summary TO authenticated;
GRANT EXECUTE ON FUNCTION is_webhook_duplicate TO service_role;

COMMENT ON TABLE public.webhook_events IS 'Historia wszystkich webhooków płatności dla audytu i debugowania';
