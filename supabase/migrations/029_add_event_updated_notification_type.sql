-- Dodaj typ powiadomienia 'event_updated' do istniejącego CHECK constraint
-- Najpierw usuń stary constraint
ALTER TABLE public.push_notifications_log
DROP CONSTRAINT IF EXISTS push_notifications_log_type_check;

-- Dodaj nowy constraint z rozszerzonym enumem
ALTER TABLE public.push_notifications_log
ADD CONSTRAINT push_notifications_log_type_check
CHECK (type IN ('payment_reminder', 'new_activity', 'special_event', 'general', 'event_updated'));

-- Aktualizuj komentarz
COMMENT ON COLUMN public.push_notifications_log.type IS 'Typ powiadomienia: payment_reminder (przypomnienie o płatności), new_activity (nowe zajęcia), special_event (wydarzenie specjalne), general (ogólne), event_updated (edycja wydarzenia)';
