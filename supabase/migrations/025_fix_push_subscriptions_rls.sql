-- Fix push_subscriptions RLS - dodaj politykę UPDATE
-- Problem: upsert wymaga zarówno INSERT jak i UPDATE policy

-- Dodaj brakującą politykę UPDATE dla użytkowników
CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update own push subscriptions" ON public.push_subscriptions
IS 'Pozwala użytkownikom aktualizować własne subskrypcje push (potrzebne dla upsert)';
