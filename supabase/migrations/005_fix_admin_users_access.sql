-- Fix admin access to users table to prevent infinite recursion
-- Problem: Admin policy sprawdza users.role, co powoduje nieskończoną pętlę w RLS

-- Usuń problematyczną policy
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Utwórz funkcję pomocniczą, która sprawdza czy użytkownik jest adminem
-- Funkcja SECURITY DEFINER omija RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Nowa policy używająca funkcji (unika rekursji)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (public.is_admin());

-- Taka sama poprawka dla UPDATE
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE
  USING (public.is_admin());

-- Komentarz
COMMENT ON FUNCTION public.is_admin()
IS 'Sprawdza czy zalogowany użytkownik jest adminem. SECURITY DEFINER omija RLS aby uniknąć nieskończonej rekursji.';
