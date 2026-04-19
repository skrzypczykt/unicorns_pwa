-- Dodaj pola profilu użytkownika
ALTER TABLE public.users
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN phone TEXT;

-- Migracja danych: zachowaj obecne display_name jako first_name
UPDATE public.users
SET first_name = display_name
WHERE first_name IS NULL;

-- Indeksy dla wyszukiwania
CREATE INDEX idx_users_first_name ON public.users(first_name);
CREATE INDEX idx_users_last_name ON public.users(last_name);

-- Komentarze
COMMENT ON COLUMN public.users.first_name IS 'Imię użytkownika (wymagane)';
COMMENT ON COLUMN public.users.last_name IS 'Nazwisko użytkownika (opcjonalne, może być NULL)';
COMMENT ON COLUMN public.users.phone IS 'Numer telefonu (opcjonalny, może być NULL)';
COMMENT ON COLUMN public.users.display_name IS 'Wyświetlana nazwa - może być auto-generowana z first_name + last_name';
