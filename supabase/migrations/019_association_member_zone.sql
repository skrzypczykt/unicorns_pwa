-- Migration 019: Association Member Zone
-- Adds infrastructure for member-only area with news, documents, polls, and membership fees

-- ============================================================================
-- 1. Add "Członkostwo" Activity Type for Membership Fees
-- ============================================================================

INSERT INTO public.activity_types (name, description)
VALUES ('Członkostwo', 'Składki członkowskie stowarzyszenia')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. Association News Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.association_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,  -- NULL = never expires
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_association_news_published ON association_news(published_at DESC);
CREATE INDEX idx_association_news_expires ON association_news(expires_at);
CREATE INDEX idx_association_news_pinned ON association_news(is_pinned);

ALTER TABLE association_news ENABLE ROW LEVEL SECURITY;

-- Only association members can read news
CREATE POLICY "Association members can view news"
  ON association_news FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_association_member = true
    )
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Only admins can manage news
CREATE POLICY "Admins can manage news"
  ON association_news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_association_news_updated_at
  BEFORE UPDATE ON association_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE association_news IS 'News and announcements visible only to association members';

-- ============================================================================
-- 3. Association Documents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.association_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  document_url TEXT NOT NULL,  -- External URL (Google Drive, Dropbox, etc.)
  category TEXT NOT NULL CHECK (category IN ('statute', 'resolution', 'report', 'other')),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_size_kb INTEGER,  -- Optional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_association_documents_category ON association_documents(category);
CREATE INDEX idx_association_documents_upload_date ON association_documents(upload_date DESC);

ALTER TABLE association_documents ENABLE ROW LEVEL SECURITY;

-- Only association members can view documents
CREATE POLICY "Association members can view documents"
  ON association_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_association_member = true
    )
  );

-- Only admins can manage documents
CREATE POLICY "Admins can manage documents"
  ON association_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

COMMENT ON TABLE association_documents IS 'Documents (statutes, resolutions) for association members only';
COMMENT ON COLUMN association_documents.document_url IS 'External URL - no Supabase Storage (consistent with activity images)';

-- ============================================================================
-- 4. Association Polls System (3 tables)
-- ============================================================================

-- 4.1 Polls Table
CREATE TABLE IF NOT EXISTS public.association_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  poll_type TEXT NOT NULL CHECK (poll_type IN ('resolution', 'survey', 'other')) DEFAULT 'resolution',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.2 Poll Options Table
CREATE TABLE IF NOT EXISTS public.association_poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES association_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.3 Poll Votes Table (one vote per member per poll)
CREATE TABLE IF NOT EXISTS public.association_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES association_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES association_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Prevent duplicate votes
  UNIQUE(poll_id, user_id)
);

-- Indexes
CREATE INDEX idx_polls_active ON association_polls(is_active, end_date);
CREATE INDEX idx_poll_options_poll ON association_poll_options(poll_id, display_order);
CREATE INDEX idx_poll_votes_poll ON association_poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON association_poll_votes(user_id);

-- RLS for Polls
ALTER TABLE association_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Association members can view active polls"
  ON association_polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_association_member = true
    )
    AND is_active = true
    AND end_date > now()
  );

CREATE POLICY "Admins can manage polls"
  ON association_polls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS for Poll Options
ALTER TABLE association_poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Association members can view poll options"
  ON association_poll_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_association_member = true
    )
  );

CREATE POLICY "Admins can manage poll options"
  ON association_poll_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS for Votes
ALTER TABLE association_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can vote on polls"
  ON association_poll_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_association_member = true
    )
    AND EXISTS (
      SELECT 1 FROM association_polls
      WHERE id = poll_id
      AND is_active = true
      AND end_date > now()
    )
  );

CREATE POLICY "Members can view their own votes"
  ON association_poll_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all votes"
  ON association_poll_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to get poll results (only after poll ends or for admins)
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE(option_id UUID, option_text TEXT, vote_count BIGINT) AS $$
BEGIN
  -- Check if user is admin OR poll has ended
  IF NOT (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM association_polls
      WHERE id = poll_uuid
      AND end_date < now()
    )
  ) THEN
    RAISE EXCEPTION 'Poll results are only available to admins or after poll ends';
  END IF;

  RETURN QUERY
  SELECT
    po.id as option_id,
    po.option_text,
    COUNT(pv.id) as vote_count
  FROM association_poll_options po
  LEFT JOIN association_poll_votes pv ON po.id = pv.option_id
  WHERE po.poll_id = poll_uuid
  GROUP BY po.id, po.option_text, po.display_order
  ORDER BY po.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE association_polls IS 'Polls and votes for association members (uchwały)';
COMMENT ON TABLE association_poll_votes IS 'One vote per member per poll enforced by UNIQUE constraint';

-- ============================================================================
-- 5. Membership Fee Tracking - Extend Existing Tables
-- ============================================================================

-- Add new transaction types for membership fees
ALTER TABLE balance_transactions
  DROP CONSTRAINT IF EXISTS balance_transactions_type_check;

ALTER TABLE balance_transactions
  ADD CONSTRAINT balance_transactions_type_check
  CHECK (type IN (
    'manual_credit',
    'manual_debit',
    'class_payment',
    'cancellation_refund',
    'membership_fee_payment',     -- New: Member pays membership fee
    'membership_fee_charge'        -- New: System charges membership fee
  ));

-- Add membership fee metadata to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership_fee_plan TEXT
    CHECK (membership_fee_plan IN ('monthly', 'yearly')) DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS last_membership_charge TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_users_membership_charge ON users(last_membership_charge)
  WHERE is_association_member = true;

COMMENT ON COLUMN users.membership_fee_plan IS 'Monthly (15 zł/month) or Yearly (160 zł/year)';
COMMENT ON COLUMN users.last_membership_charge IS 'Last time membership fee was charged';
