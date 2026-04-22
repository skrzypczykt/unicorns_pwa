-- Migration 042: Add WhatsApp group URL to sections
-- Purpose: Każda sekcja może mieć link do grupy WhatsApp

-- 1. Add whatsapp_group_url column to activity_types
ALTER TABLE activity_types
ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;

-- 2. Add comment
COMMENT ON COLUMN activity_types.whatsapp_group_url IS
  'Link do grupy WhatsApp sekcji (opcjonalny)';
