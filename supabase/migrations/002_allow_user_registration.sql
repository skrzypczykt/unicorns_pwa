-- Fix: Allow users to insert their own profile during registration
-- Problem: Rejestracja kończyła się błędem bo nie było polityki INSERT

-- Dodaj politykę INSERT dla nowych użytkowników
CREATE POLICY "Users can insert own profile during registration"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Komentarz
COMMENT ON POLICY "Users can insert own profile during registration" ON public.users
IS 'Allows users to create their profile in users table during registration (RegisterPage.tsx)';
