-- Migracja 044: Utworzenie tabeli transactions
-- Data: 2026-04-23
-- Opis: Tabela do śledzenia wszystkich transakcji finansowych (płatności, zwroty, korekty)

-- Utwórz tabelę transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,

  -- Podstawowe dane transakcji
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'manual', 'correction')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'PLN',
  description TEXT,

  -- Status transakcji
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),

  -- Provider płatności
  provider TEXT DEFAULT 'manual',
  provider_transaction_id TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_registration_id ON transactions(registration_id)
  WHERE registration_id IS NOT NULL;
CREATE INDEX idx_transactions_provider_tx_id ON transactions(provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Komentarze
COMMENT ON TABLE transactions IS
  'Wszystkie transakcje finansowe: płatności, zwroty, korekty manualne';

COMMENT ON COLUMN transactions.type IS
  'Typ transakcji: payment (wpłata), refund (zwrot), manual (ręczna), correction (korekta)';

COMMENT ON COLUMN transactions.status IS
  'Status: pending (oczekuje), completed (zakończona), failed (błąd), cancelled (anulowana)';

COMMENT ON COLUMN transactions.provider IS
  'Dostawca płatności: manual (ręczna), autopay, stripe, paypal, etc.';

COMMENT ON COLUMN transactions.provider_transaction_id IS
  'ID transakcji u dostawcy płatności (np. OrderID w Autopay, PaymentIntent w Stripe)';

COMMENT ON COLUMN transactions.registration_id IS
  'ID rezerwacji, której dotyczy płatność (opcjonalne, dla płatności za zajęcia)';

COMMENT ON COLUMN transactions.metadata IS
  'Dodatkowe dane JSON (np. szczegóły bramki, webhook payload)';

-- RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: użytkownicy widzą tylko swoje transakcje
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: admini widzą wszystkie transakcje
CREATE POLICY "Admins can view all transactions"
  ON transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: tylko system może tworzyć/aktualizować transakcje (przez Edge Functions)
-- Użytkownicy NIE mogą bezpośrednio tworzyć transakcji
CREATE POLICY "Only service role can insert transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (false); -- Block all direct inserts from users

CREATE POLICY "Only service role can update transactions"
  ON transactions
  FOR UPDATE
  USING (false); -- Block all direct updates from users

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();
