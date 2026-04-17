-- Funkcja 3b: Wydarzenia cykliczne (recurring events)
-- Dodaje wsparcie dla tworzenia serii powtarzających się zajęć

-- Dodaj kolumny dla cykliczności
ALTER TABLE public.activities
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN recurrence_pattern TEXT CHECK (recurrence_pattern IN ('none', 'weekly', 'monthly')) DEFAULT 'none',
ADD COLUMN recurrence_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN parent_activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE;

-- Indeksy dla wydajności
CREATE INDEX idx_activities_parent ON public.activities(parent_activity_id);
CREATE INDEX idx_activities_recurring ON public.activities(is_recurring);

-- Komentarze
COMMENT ON COLUMN public.activities.is_recurring
IS 'TRUE dla wydarzenia macierzystego generującego serie, FALSE dla instancji';

COMMENT ON COLUMN public.activities.recurrence_pattern
IS 'Wzorzec powtarzania: none (brak), weekly (co tydzień), monthly (co miesiąc)';

COMMENT ON COLUMN public.activities.recurrence_end_date
IS 'Data końca generowania powtórzeń (tylko dla is_recurring=true)';

COMMENT ON COLUMN public.activities.parent_activity_id
IS 'NULL dla wydarzenia macierzystego, ID rodzica dla wygenerowanych instancji';
