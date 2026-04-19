-- Migration 024: Cleanup nieważnych tokenów push
-- Data: 2026-04-19

-- Usuń subskrypcje z nieważnymi endpointami (permanently-removed.invalid)
DELETE FROM push_subscriptions
WHERE endpoint LIKE '%permanently-removed.invalid%';

-- Komentarz
COMMENT ON TABLE push_subscriptions IS 'Push notification subscriptions. Invalid endpoints (permanently-removed.invalid) are automatically cleaned up.';
