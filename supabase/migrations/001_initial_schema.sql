-- Rainbow Unicorn NGO Sports PWA - Initial Database Schema
-- PostgreSQL Migration 001

-- ============================================================================
-- 1. Users Table (extends Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'trainer', 'admin')) DEFAULT 'user',
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  balance_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- 2. Activity Types Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Everyone can read activity types
CREATE POLICY "Anyone can view activity types"
  ON public.activity_types
  FOR SELECT
  USING (true);

-- Only admins can create/update/delete activity types
CREATE POLICY "Admins can manage activity types"
  ON public.activity_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. Activities Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  activity_type_id UUID REFERENCES public.activity_types(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES public.users(id) NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
  cancellation_hours INTEGER NOT NULL DEFAULT 24 CHECK (cancellation_hours >= 0),
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_activities_date ON public.activities(date_time);
CREATE INDEX idx_activities_trainer ON public.activities(trainer_id);
CREATE INDEX idx_activities_status ON public.activities(status);
CREATE INDEX idx_activities_datetime_status ON public.activities(date_time, status);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Everyone can view scheduled activities
CREATE POLICY "Anyone can view activities"
  ON public.activities
  FOR SELECT
  USING (true);

-- Admins can create activities
CREATE POLICY "Admins can create activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins and trainers can update their own activities
CREATE POLICY "Admins and trainers can update activities"
  ON public.activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'trainer' AND id = trainer_id))
    )
  );

-- Only admins can delete activities
CREATE POLICY "Admins can delete activities"
  ON public.activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. Registrations Table (RESERVATION, payment happens at attendance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('registered', 'cancelled', 'attended', 'no_show')) DEFAULT 'registered',
  can_cancel_until TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  payment_processed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Prevent duplicate registrations
  UNIQUE(activity_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_registrations_activity ON public.registrations(activity_id);
CREATE INDEX idx_registrations_user ON public.registrations(user_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_user_status ON public.registrations(user_id, status);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON public.registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins and trainers can view all registrations
CREATE POLICY "Admins and trainers can view registrations"
  ON public.registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- Users can create their own registrations
CREATE POLICY "Users can create registrations"
  ON public.registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own registrations
CREATE POLICY "Users can update own registrations"
  ON public.registrations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. Attendance Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  marked_by UUID REFERENCES public.users(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,

  -- Ensure one attendance record per user per activity
  UNIQUE(activity_id, user_id)
);

-- Indexes
CREATE INDEX idx_attendance_activity ON public.attendance(activity_id);
CREATE INDEX idx_attendance_user ON public.attendance(user_id);
CREATE INDEX idx_attendance_marked_by ON public.attendance(marked_by);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON public.attendance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Trainers and admins can view attendance
CREATE POLICY "Trainers and admins can view attendance"
  ON public.attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );

-- Only trainers can mark attendance for their activities
CREATE POLICY "Trainers can mark attendance"
  ON public.attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities a
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = activity_id
      AND (u.role = 'admin' OR (u.role = 'trainer' AND a.trainer_id = u.id))
    )
  );

-- Trainers and admins can update attendance
CREATE POLICY "Trainers can update attendance"
  ON public.attendance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.activities a
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = activity_id
      AND (u.role = 'admin' OR (u.role = 'trainer' AND a.trainer_id = u.id))
    )
  );

-- ============================================================================
-- 6. Balance Transactions Table (Immutable audit log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manual_credit', 'manual_debit', 'class_payment', 'cancellation_refund')),
  reference_id UUID,
  description TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_balance_transactions_user ON public.balance_transactions(user_id, created_at DESC);
CREATE INDEX idx_balance_transactions_type ON public.balance_transactions(type);
CREATE INDEX idx_balance_transactions_created_at ON public.balance_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.balance_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.balance_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only system (Edge Functions with service role) can create transactions
-- No UPDATE or DELETE policies - transactions are immutable

-- ============================================================================
-- 7. Audit Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PostgreSQL Functions
-- ============================================================================

-- Function to get current participant count for an activity
CREATE OR REPLACE FUNCTION get_participant_count(activity_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.registrations
  WHERE activity_id = activity_uuid
  AND status = 'registered';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if activity is full
CREATE OR REPLACE FUNCTION is_activity_full(activity_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT get_participant_count(activity_uuid) >=
         (SELECT max_participants FROM public.activities WHERE id = activity_uuid);
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to calculate cancellation deadline
CREATE OR REPLACE FUNCTION calculate_cancellation_deadline(activity_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
  SELECT date_time - (cancellation_hours || ' hours')::INTERVAL
  FROM public.activities
  WHERE id = activity_uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Seed initial activity types
-- ============================================================================

INSERT INTO public.activity_types (name, description) VALUES
  ('Joga', 'Zajęcia jogi dla wszystkich poziomów zaawansowania'),
  ('Piłka Nożna', 'Treningi piłki nożnej'),
  ('Siłownia', 'Trening siłowy z trenerem'),
  ('Bieganie', 'Grupowe treningi biegowe'),
  ('Taniec', 'Zajęcia taneczne'),
  ('Pływanie', 'Nauka pływania i doskonalenie techniki')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON public.activity_types TO anon, authenticated;
GRANT SELECT ON public.activities TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.attendance TO authenticated;
GRANT SELECT ON public.balance_transactions TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_participant_count TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_activity_full TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_cancellation_deadline TO anon, authenticated;
