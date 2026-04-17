-- Update WhatsApp group links
-- Execute this in Supabase SQL Editor

-- Grupa Taniec
UPDATE activity_types
SET whatsapp_group_url = 'https://chat.whatsapp.com/Halybql01R89BSMIzkjc2Y'
WHERE name = 'Taniec';

-- Główny kanał Unicorns (do uzupełnienia)
UPDATE app_settings
SET value = 'https://chat.whatsapp.com/TWÓJ_GŁÓWNY_KANAŁ'
WHERE key = 'whatsapp_main_channel_url';

-- Sprawdź czy się zaktualizowało
SELECT name, whatsapp_group_url FROM activity_types WHERE whatsapp_group_url IS NOT NULL;
SELECT key, value FROM app_settings WHERE key = 'whatsapp_main_channel_url';
