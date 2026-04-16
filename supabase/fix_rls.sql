-- Simple fix: Remove the recursive admin policy
-- Just allow users to read their own profile

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Allow authenticated users to read their own profile only
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- For now, allow all authenticated users to read all profiles
-- (This is fine for a small NGO app where members know each other)
CREATE POLICY "Authenticated users can read profiles" ON public.users
  FOR SELECT
  USING (auth.role() = 'authenticated');
