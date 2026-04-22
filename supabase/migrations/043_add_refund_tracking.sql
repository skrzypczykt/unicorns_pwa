-- Migracja 043: Dodanie śledzenia zwrotów płatności
-- Data: 2026-04-22
-- Opis: Dodaje pola do śledzenia statusu zwrotów dla anulowanych rezerwacji

-- Dodaj pole refund_status do tabeli registrations
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none'
  CHECK (refund_status IN ('none', 'pending', 'processed', 'failed'));

-- Dodaj pole refund_date do przechowywania daty zwrotu
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMPTZ;

-- Dodaj pole refund_amount dla przypadków częściowych zwrotów
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);

-- Dodaj komentarze
COMMENT ON COLUMN registrations.refund_status IS
  'Status zwrotu płatności: none (brak zwrotu), pending (oczekuje), processed (wykonany), failed (błąd)';

COMMENT ON COLUMN registrations.refund_date IS
  'Data i czas wykonania zwrotu';

COMMENT ON COLUMN registrations.refund_amount IS
  'Kwota zwrotu (może być inna niż oryginalna w przypadku częściowych zwrotów)';

-- Dodaj indeks dla zapytań o oczekujące zwroty
CREATE INDEX IF NOT EXISTS idx_registrations_refund_pending
  ON registrations(refund_status)
  WHERE refund_status = 'pending';
