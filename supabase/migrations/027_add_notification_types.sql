-- Dodaj kolumnę type do push_notifications_log
ALTER TABLE public.push_notifications_log
ADD COLUMN type TEXT CHECK (type IN ('payment_reminder', 'new_activity', 'special_event', 'general')) DEFAULT 'general';

-- Dodaj kolumnę read_at dla oznaczania przeczytanych
ALTER TABLE public.push_notifications_log
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Indeksy dla wydajności
CREATE INDEX idx_push_log_type ON public.push_notifications_log(type);
CREATE INDEX idx_push_log_unread ON public.push_notifications_log(user_id, read_at) WHERE read_at IS NULL;

-- Komentarze
COMMENT ON COLUMN public.push_notifications_log.type IS 'Typ powiadomienia: payment_reminder (przypomnienie o płatności), new_activity (nowe zajęcia), special_event (wydarzenie specjalne), general (ogólne)';
COMMENT ON COLUMN public.push_notifications_log.read_at IS 'Data przeczytania powiadomienia (NULL = nieprzeczytane)';
