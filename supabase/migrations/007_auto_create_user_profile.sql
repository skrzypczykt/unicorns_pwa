-- Funkcja do automatycznego tworzenia profilu użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role, balance)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email),
    'user',
    0.00
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger wywoływany po utworzeniu użytkownika w auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Zaktualizuj RLS policy dla INSERT - pozwól tylko przez trigger
-- Usuń starą policy jeśli istnieje
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Dodaj policy pozwalającą na UPDATE własnego profilu
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Dodaj policy pozwalającą na SELECT własnego profilu
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Komentarz
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatycznie tworzy profil w tabeli users po rejestracji użytkownika';
