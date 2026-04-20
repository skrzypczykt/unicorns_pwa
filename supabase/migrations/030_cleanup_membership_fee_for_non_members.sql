-- Migration 030: Cleanup membership_fee_exempt and membership_fee_plan for non-members
-- Dla osób, które nie są członkami stowarzyszenia, wartości związane ze składką
-- powinny być NULL (nie dotyczy), a nie false/monthly

-- Usuń wartości membership_fee_exempt i membership_fee_plan dla osób, które nie są członkami
UPDATE users
SET
  membership_fee_exempt = NULL,
  membership_fee_plan = NULL,
  exemption_reason = NULL,
  exemption_granted_by = NULL,
  exemption_granted_at = NULL
WHERE is_association_member = false OR is_association_member IS NULL;

-- Zaktualizuj komentarze
COMMENT ON COLUMN users.membership_fee_exempt IS
  'Czy członek jest zwolniony ze składki członkowskiej (true = zwolniony, false = płaci, NULL = nie dotyczy / nie jest członkiem)';

COMMENT ON COLUMN users.membership_fee_plan IS
  'Plan składki członkowskiej: monthly (15 zł/m-c) lub yearly (160 zł/rok). NULL = nie dotyczy / nie jest członkiem';
