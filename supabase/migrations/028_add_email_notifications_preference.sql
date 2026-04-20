-- Dodaj kolumnę email_notifications_enabled do users
ALTER TABLE public.users
ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true NOT NULL;

-- Indeks dla wydajności query
CREATE INDEX idx_users_email_notifications ON public.users(email_notifications_enabled) WHERE email_notifications_enabled = true;

-- Komentarz
COMMENT ON COLUMN public.users.email_notifications_enabled IS 'Czy użytkownik chce otrzymywać powiadomienia email (domyślnie: true)';
