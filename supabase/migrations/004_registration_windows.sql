-- Funkcja 3c: Okna rejestracji (registration windows)
-- Dodaje pola określające kiedy zapisy są otwarte/zamknięte

-- Dodaj kolumny dla okien rejestracji
ALTER TABLE public.activities
ADD COLUMN registration_opens_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN registration_closes_at TIMESTAMP WITH TIME ZONE;

-- Indeks dla wydajności zapytań
CREATE INDEX idx_activities_registration_window
ON public.activities(registration_opens_at, registration_closes_at);

-- Constraint: zamknięcie przed rozpoczęciem zajęć
ALTER TABLE public.activities
ADD CONSTRAINT check_registration_closes_before_activity
CHECK (registration_closes_at IS NULL OR registration_closes_at <= date_time);

-- Constraint: otwarcie przed zamknięciem
ALTER TABLE public.activities
ADD CONSTRAINT check_registration_window_valid
CHECK (
  registration_opens_at IS NULL
  OR registration_closes_at IS NULL
  OR registration_opens_at < registration_closes_at
);

-- Funkcja sprawdzająca czy zapisy są otwarte
CREATE OR REPLACE FUNCTION is_registration_open(activity_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT (
    (registration_opens_at IS NULL OR registration_opens_at <= NOW()) AND
    (registration_closes_at IS NULL OR registration_closes_at > NOW())
  )
  FROM public.activities
  WHERE id = activity_uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Komentarze
COMMENT ON COLUMN public.activities.registration_opens_at
IS 'Opcjonalnie: data/czas otwarcia zapisów. NULL = otwarte od razu';

COMMENT ON COLUMN public.activities.registration_closes_at
IS 'Opcjonalnie: data/czas zamknięcia zapisów. NULL = otwarte do rozpoczęcia zajęć';

COMMENT ON FUNCTION is_registration_open(UUID)
IS 'Sprawdza czy zapisy na dane zajęcia są obecnie otwarte (uwzględnia registration_opens_at i registration_closes_at)';
