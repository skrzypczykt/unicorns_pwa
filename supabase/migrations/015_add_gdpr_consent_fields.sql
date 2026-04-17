-- Migration 015: Add GDPR consent fields
-- Stores dates when users accepted privacy policy and terms

-- Data zgody RODO (polityka prywatności)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE;

-- Data akceptacji regulaminu zajęć sportowych
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sports_terms_accepted_date TIMESTAMP WITH TIME ZONE;

-- Komentarze
COMMENT ON COLUMN users.gdpr_consent_date IS
  'Data wyrażenia zgody RODO podczas rejestracji - wymagana przed utworzeniem konta';

COMMENT ON COLUMN users.sports_terms_accepted_date IS
  'Data pierwszej akceptacji regulaminu zajęć sportowych - aktualizowana przy każdym zapisie';
