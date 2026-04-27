-- Dodaj funkcję obliczającą liczbę zapisanych uczestników

-- Funkcja zwracająca liczbę zarejestrowanych uczestników dla danej aktywności
CREATE OR REPLACE FUNCTION get_registered_count(activity_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.registrations
  WHERE activity_id = activity_uuid
    AND status IN ('registered', 'attended');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Funkcja sprawdzająca czy są dostępne miejsca
CREATE OR REPLACE FUNCTION has_available_spots(activity_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT
    (SELECT max_participants FROM public.activities WHERE id = activity_uuid) >
    (SELECT COUNT(*) FROM public.registrations
     WHERE activity_id = activity_uuid
     AND status IN ('registered', 'attended'))
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Komentarze
COMMENT ON FUNCTION get_registered_count(UUID)
IS 'Zwraca liczbę zarejestrowanych uczestników (status: registered lub attended) dla danej aktywności';

COMMENT ON FUNCTION has_available_spots(UUID)
IS 'Sprawdza czy są dostępne miejsca na zajęciach (max_participants > liczba zarejestrowanych)';
