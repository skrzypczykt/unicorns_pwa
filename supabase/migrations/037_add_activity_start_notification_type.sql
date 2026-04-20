-- Migration 037: Dodaj typ powiadomienia 'activity_start' (przypomnienie o rozpoczęciu wydarzenia)

-- Usuń stary constraint
ALTER TABLE public.push_notifications_log
DROP CONSTRAINT IF EXISTS push_notifications_log_type_check;

-- Dodaj nowy constraint z activity_start
ALTER TABLE public.push_notifications_log
ADD CONSTRAINT push_notifications_log_type_check
CHECK (type IN ('payment_reminder', 'new_activity', 'special_event', 'general', 'activity_start'));

-- Zaktualizuj komentarz
COMMENT ON COLUMN public.push_notifications_log.type IS 'Typ powiadomienia: payment_reminder (przypomnienie o płatności), new_activity (nowe zajęcia), special_event (wydarzenie specjalne), activity_start (przypomnienie o rozpoczęciu wydarzenia), general (ogólne)';
