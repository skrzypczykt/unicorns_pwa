-- Migration 041: Role Change Tracking
-- Purpose: Wykrywanie zmiany roli użytkownika i wymuszanie ponownego logowania

-- 1. Dodaj kolumnę śledzącą ostatnią zmianę roli
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role_changed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION track_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Jeśli rola się zmieniła
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Zapisz timestamp zmiany
    NEW.role_changed_at = NOW();

    -- Log change for debugging
    RAISE NOTICE 'Role changed for user %: % -> %', NEW.id, OLD.role, NEW.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
DROP TRIGGER IF EXISTS on_user_role_change ON public.users;
CREATE TRIGGER on_user_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION track_role_change();

-- 4. Add comment
COMMENT ON COLUMN users.role_changed_at IS
  'Timestamp ostatniej zmiany roli. Używany do wymuszania ponownego logowania przy zmianie uprawnień.';

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role_changed_at ON users(role_changed_at);
