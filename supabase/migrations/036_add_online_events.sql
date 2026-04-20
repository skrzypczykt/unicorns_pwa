-- Migration 036: Dodanie obsługi wydarzeń online
-- Wydarzenia mogą być online (z linkiem do spotkania) lub stacjonarne (z lokalizacją)

ALTER TABLE public.activities
ADD COLUMN is_online BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN meeting_link TEXT;

-- Dodaj constraint: jeśli online, to meeting_link jest wymagany
ALTER TABLE public.activities
ADD CONSTRAINT check_online_event_has_link
CHECK (
  (is_online = FALSE) OR
  (is_online = TRUE AND meeting_link IS NOT NULL AND meeting_link != '')
);

-- Dodaj constraint: jeśli stacjonarne, to location jest wymagany
ALTER TABLE public.activities
ADD CONSTRAINT check_offline_event_has_location
CHECK (
  (is_online = TRUE) OR
  (is_online = FALSE AND location IS NOT NULL AND location != '')
);

-- Indeks dla filtrowania wydarzeń online
CREATE INDEX idx_activities_is_online ON public.activities(is_online);

-- Komentarze
COMMENT ON COLUMN public.activities.is_online IS 'Czy wydarzenie odbywa się online (TRUE) czy stacjonarnie (FALSE)';
COMMENT ON COLUMN public.activities.meeting_link IS 'Link do spotkania online (wymagany gdy is_online = TRUE)';
