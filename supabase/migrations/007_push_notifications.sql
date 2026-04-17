-- Push Notifications System
-- Przechowuje tokeny push i wysyła powiadomienia o nowych zajęciach

-- Tabela przechowująca subskrypcje push użytkowników
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- Tabela historii wysłanych powiadomień (opcjonalnie - do debugowania)
CREATE TABLE IF NOT EXISTS public.push_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed')) DEFAULT 'sent',
  error_message TEXT
);

CREATE INDEX idx_push_log_user ON public.push_notifications_log(user_id);
CREATE INDEX idx_push_log_activity ON public.push_notifications_log(activity_id);

-- RLS Policies dla push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (public.is_admin());

-- RLS Policies dla push_notifications_log
ALTER TABLE public.push_notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push logs"
  ON public.push_notifications_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all push logs"
  ON public.push_notifications_log
  FOR SELECT
  USING (public.is_admin());

-- Funkcja znajdująca użytkowników którzy zapisywali się na dany typ zajęć
CREATE OR REPLACE FUNCTION get_users_interested_in_activity_type(activity_name_param TEXT)
RETURNS TABLE(user_id UUID, display_name TEXT, email TEXT) AS $$
  SELECT DISTINCT u.id, u.display_name, u.email
  FROM public.users u
  INNER JOIN public.registrations r ON r.user_id = u.id
  INNER JOIN public.activities a ON a.id = r.activity_id
  WHERE a.name ILIKE activity_name_param || '%'
    AND u.role = 'user'
  ORDER BY u.display_name;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Komentarze
COMMENT ON TABLE public.push_subscriptions
IS 'Przechowuje tokeny Web Push dla powiadomień mobilnych';

COMMENT ON TABLE public.push_notifications_log
IS 'Log wysłanych powiadomień push (do debugowania i statystyk)';

COMMENT ON FUNCTION get_users_interested_in_activity_type(TEXT)
IS 'Zwraca użytkowników którzy kiedykolwiek zapisywali się na zajęcia o podanej nazwie (używa ILIKE dla częściowego dopasowania)';
