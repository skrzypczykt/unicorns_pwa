-- Dodaj kolumnę image_url do tabeli activities
ALTER TABLE public.activities
ADD COLUMN image_url TEXT;

-- Index dla szybszego fetchu
CREATE INDEX idx_activities_image_url ON public.activities(image_url);

-- Komentarz
COMMENT ON COLUMN public.activities.image_url IS 'URL do zdjęcia aktywności (Unsplash/Cloudinary/etc)';
