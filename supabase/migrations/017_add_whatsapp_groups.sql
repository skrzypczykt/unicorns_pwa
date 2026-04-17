-- Migration 017: WhatsApp Groups for Activities and Activity Types
-- Add WhatsApp group links to promote community engagement

-- Add WhatsApp group URL to activities (specific event groups)
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;

COMMENT ON COLUMN public.activities.whatsapp_group_url IS
  'Link do grupy WhatsApp dla tego wydarzenia (opcjonalny). Zachęca uczestników do aktywności w grupie - ankiety, pytania, integracja.';

-- Add WhatsApp group URL to activity_types (general type groups like "Taniec", "Siatkówka")
ALTER TABLE public.activity_types
ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;

COMMENT ON COLUMN public.activity_types.whatsapp_group_url IS
  'Link do grupy WhatsApp dla tego typu aktywności (np. grupa "Taniec", "Siatkówka"). Używany jako fallback jeśli konkretne wydarzenie nie ma własnej grupy.';

-- Add main WhatsApp channel URL to a settings table (for general association channel)
-- We'll store it as a config value that can be updated
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default WhatsApp channel link (will be updated by admin)
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'whatsapp_main_channel_url',
  'https://chat.whatsapp.com/EXAMPLE',
  'Główny kanał WhatsApp Stowarzyszenia Unicorns - aktualności, ogłoszenia, integracja'
)
ON CONFLICT (key) DO NOTHING;

-- RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update app settings"
  ON public.app_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

GRANT SELECT ON public.app_settings TO authenticated;
GRANT SELECT ON public.app_settings TO anon;

COMMENT ON TABLE public.app_settings IS
  'Ustawienia aplikacji (klucz-wartość). Zawiera główny link do kanału WhatsApp i inne globalne ustawienia.';
