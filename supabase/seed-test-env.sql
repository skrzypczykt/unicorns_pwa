-- Seed Data for Test Environment (unicorns-test.netlify.app)
-- Dane testowe dla E2E testów Playwright
--
-- INSTRUKCJA UŻYCIA:
-- 1. Zaloguj się do Supabase Dashboard (projekt testowy)
-- 2. Ustaw secrets w Vault (Settings → Vault):
--    - test_user_password (np. "TestPass123!")
-- 3. Przejdź do SQL Editor
-- 4. Skopiuj i uruchom ten skrypt
-- 5. Skrypt utworzy 4 użytkowników testowych w auth.users + dane w public.users
-- 6. Doda przykładowe sekcje, zajęcia, rezerwacje
--
-- BEZPIECZEŃSTWO: Hasła przechowywane w Supabase Vault, nie w repo!

-- ============================================================================
-- KROK 1: Pobranie hasła z Supabase Vault
-- ============================================================================

-- Pobierz hasło z vault
DO $$
DECLARE
  test_password TEXT;
BEGIN
  -- Pobierz hasło z Supabase Vault
  SELECT decrypted_secret INTO test_password
  FROM vault.decrypted_secrets
  WHERE name = 'test_user_password';

  -- Sprawdź czy hasło istnieje
  IF test_password IS NULL THEN
    RAISE EXCEPTION 'BŁĄD: Secret "test_user_password" nie istnieje w Vault!

Ustaw go w Supabase Dashboard:
1. Settings → Vault
2. Kliknij "New secret"
3. Name: test_user_password
4. Secret: TestPass123! (lub inne hasło)
5. Zapisz i uruchom ten skrypt ponownie';
  END IF;

  -- Zapisz hasło w temporary table dla użycia w kolejnych krokach
  CREATE TEMP TABLE IF NOT EXISTS test_secrets (password TEXT);
  DELETE FROM test_secrets;
  INSERT INTO test_secrets VALUES (test_password);

  RAISE NOTICE '✓ Password loaded from Vault';
END $$;

-- ============================================================================
-- KROK 2: Utworzenie użytkowników testowych w auth.users
-- ============================================================================

-- Funkcja pomocnicza do tworzenia użytkowników
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_id UUID
) RETURNS UUID AS $$
DECLARE
  encrypted_password TEXT;
BEGIN
  -- Usuń użytkownika jeśli istnieje (cleanup)
  DELETE FROM auth.users WHERE email = user_email;

  -- Hash hasła (bcrypt)
  encrypted_password := crypt(user_password, gen_salt('bf'));

  -- Wstaw użytkownika do auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    encrypted_password,
    NOW(), -- Email od razu potwierdzony
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW();

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utwórz 4 użytkowników testowych
DO $$
DECLARE
  regular_user_id UUID := 'a1111111-1111-1111-1111-111111111111'::UUID;
  admin_user_id UUID := 'a2222222-2222-2222-2222-222222222222'::UUID;
  trainer_user_id UUID := 'a3333333-3333-3333-3333-333333333333'::UUID;
  member_user_id UUID := 'a4444444-4444-4444-4444-444444444444'::UUID;
  test_password TEXT;
BEGIN
  -- Pobierz hasło z temporary table
  SELECT password INTO test_password FROM test_secrets LIMIT 1;

  RAISE NOTICE 'Creating test users in auth.users...';

  -- Regular user
  PERFORM create_test_user(
    'test.user@unicorns-test.local',
    test_password,
    regular_user_id
  );

  -- Admin user
  PERFORM create_test_user(
    'admin@unicorns-test.local',
    test_password,
    admin_user_id
  );

  -- Trainer user
  PERFORM create_test_user(
    'trainer@unicorns-test.local',
    test_password,
    trainer_user_id
  );

  -- Member user (association member)
  PERFORM create_test_user(
    'member@unicorns-test.local',
    test_password,
    member_user_id
  );

  RAISE NOTICE '✓ Created 4 test users in auth.users';
END $$;

-- Cleanup
DROP FUNCTION IF EXISTS create_test_user;
DROP TABLE IF EXISTS test_secrets;

-- ============================================================================
-- KROK 3: Utworzenie profili użytkowników w public.users
-- ============================================================================

-- Cleanup - usuń istniejące profile testowe
DELETE FROM public.users WHERE email LIKE '%@unicorns-test.local';

-- Regular user
INSERT INTO public.users (
  id, email, display_name, first_name, last_name,
  role, is_association_member, balance, balance_updated_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111'::UUID,
  'test.user@unicorns-test.local',
  'Test User',
  'Test',
  'User',
  'user',
  false,
  100.00,
  NOW()
);

-- Admin user
INSERT INTO public.users (
  id, email, display_name, first_name, last_name,
  role, is_association_member, balance, balance_updated_at
) VALUES (
  'a2222222-2222-2222-2222-222222222222'::UUID,
  'admin@unicorns-test.local',
  'Admin Testowy',
  'Admin',
  'Testowy',
  'admin',
  true,
  500.00,
  NOW()
);

-- Trainer user
INSERT INTO public.users (
  id, email, display_name, first_name, last_name,
  role, is_association_member, balance, balance_updated_at
) VALUES (
  'a3333333-3333-3333-3333-333333333333'::UUID,
  'trainer@unicorns-test.local',
  'Trener Testowy',
  'Trener',
  'Testowy',
  'trainer',
  false,
  200.00,
  NOW()
);

-- Member user (association member)
INSERT INTO public.users (
  id, email, display_name, first_name, last_name,
  role, is_association_member, association_member_since, balance, balance_updated_at
) VALUES (
  'a4444444-4444-4444-4444-444444444444'::UUID,
  'member@unicorns-test.local',
  'Członek Testowy',
  'Członek',
  'Testowy',
  'user',
  true,
  '2025-01-01'::TIMESTAMP WITH TIME ZONE,
  150.00,
  NOW()
);

-- ============================================================================
-- KROK 4: Dodanie przykładowych sekcji (activity_types)
-- ============================================================================

-- Pobierz ID sekcji "Inne" (zawsze istnieje)
DO $$
DECLARE
  other_section_id UUID;
  badminton_id UUID;
  yoga_id UUID;
BEGIN
  -- Znajdź lub utwórz sekcję "Inne"
  SELECT id INTO other_section_id FROM public.activity_types WHERE name = 'Inne' LIMIT 1;

  IF other_section_id IS NULL THEN
    INSERT INTO public.activity_types (name, description, image_url)
    VALUES ('Inne', 'Wydarzenia specjalne', 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e')
    RETURNING id INTO other_section_id;
  END IF;

  -- Badminton (jeśli nie istnieje)
  SELECT id INTO badminton_id FROM public.activity_types WHERE name = 'Badminton' LIMIT 1;

  IF badminton_id IS NULL THEN
    INSERT INTO public.activity_types (
      name, description, image_url, default_trainer_id, whatsapp_group_url
    ) VALUES (
      'Badminton',
      'Sekcja badmintona - treningi i turnieje',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
      'a3333333-3333-3333-3333-333333333333'::UUID, -- Trainer
      'https://chat.whatsapp.com/test-badminton'
    )
    RETURNING id INTO badminton_id;
  END IF;

  -- Joga (jeśli nie istnieje)
  SELECT id INTO yoga_id FROM public.activity_types WHERE name = 'Joga' LIMIT 1;

  IF yoga_id IS NULL THEN
    INSERT INTO public.activity_types (
      name, description, image_url, default_trainer_id
    ) VALUES (
      'Joga',
      'Zajęcia jogi dla wszystkich poziomów',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
      'a3333333-3333-3333-3333-333333333333'::UUID -- Trainer
    )
    RETURNING id INTO yoga_id;
  END IF;

  RAISE NOTICE '✓ Sections ready (Badminton, Joga, Inne)';
END $$;

-- ============================================================================
-- KROK 5: Dodanie przykładowych zajęć
-- ============================================================================

DO $$
DECLARE
  badminton_id UUID;
  yoga_id UUID;
  other_id UUID;
BEGIN
  -- Pobierz ID sekcji
  SELECT id INTO badminton_id FROM public.activity_types WHERE name = 'Badminton' LIMIT 1;
  SELECT id INTO yoga_id FROM public.activity_types WHERE name = 'Joga' LIMIT 1;
  SELECT id INTO other_id FROM public.activity_types WHERE name = 'Inne' LIMIT 1;

  -- Cleanup - usuń stare testowe zajęcia
  DELETE FROM public.activities WHERE id IN (
    'b0000001-0000-0000-0000-000000000001'::UUID,
    'b0000002-0000-0000-0000-000000000002'::UUID,
    'b0000003-0000-0000-0000-000000000003'::UUID,
    'b0000004-0000-0000-0000-000000000004'::UUID,
    'b0000005-0000-0000-0000-000000000005'::UUID
  );

  -- 1. Nadchodzące zajęcia badmintona (za 3 dni, płatne)
  INSERT INTO public.activities (
    id, name, description, activity_type_id, trainer_id,
    date_time, duration_minutes, max_participants, cost,
    cancellation_hours, location, status, is_special_event,
    is_online, requires_immediate_payment
  ) VALUES (
    'b0000001-0000-0000-0000-000000000001'::UUID,
    'Trening Badmintona - Średniozaawansowani',
    'Intensywny trening dla osób znających podstawy gry.',
    badminton_id,
    'a3333333-3333-3333-3333-333333333333'::UUID, -- Trainer
    (CURRENT_DATE + INTERVAL '3 days' + TIME '18:00:00')::TIMESTAMP WITH TIME ZONE,
    90,
    12,
    25.00,
    24,
    'Hala sportowa, ul. Sportowa 10',
    'scheduled',
    false,
    false,
    true
  );

  -- 2. Nadchodzące zajęcia jogi (za 2 dni, darmowe)
  INSERT INTO public.activities (
    id, name, description, activity_type_id, trainer_id,
    date_time, duration_minutes, max_participants, cost,
    cancellation_hours, location, status, is_special_event,
    is_online, requires_immediate_payment
  ) VALUES (
    'b0000002-0000-0000-0000-000000000002'::UUID,
    'Poranna Joga dla Początkujących',
    'Relaksujące zajęcia jogi. Przynieś własną matę.',
    yoga_id,
    'a3333333-3333-3333-3333-333333333333'::UUID, -- Trainer
    (CURRENT_DATE + INTERVAL '2 days' + TIME '08:00:00')::TIMESTAMP WITH TIME ZONE,
    60,
    15,
    0.00,
    12,
    'Park Miejski (przy fontannie)',
    'scheduled',
    false,
    false,
    false
  );

  -- 3. Wydarzenie online (za 4 dni, płatne)
  INSERT INTO public.activities (
    id, name, description, activity_type_id, trainer_id,
    date_time, duration_minutes, max_participants, cost,
    cancellation_hours, location, meeting_link, status, is_special_event,
    is_online, requires_immediate_payment
  ) VALUES (
    'b0000003-0000-0000-0000-000000000003'::UUID,
    'Webinar: Technika Smecza w Badmintonie',
    'Online webinar z demonstracjami i Q&A.',
    badminton_id,
    'a3333333-3333-3333-3333-333333333333'::UUID, -- Trainer
    (CURRENT_DATE + INTERVAL '4 days' + TIME '19:00:00')::TIMESTAMP WITH TIME ZONE,
    90,
    50,
    15.00,
    6,
    'Online', -- Placeholder dla wydarzeń online (kolumna wymaga NOT NULL)
    'https://meet.google.com/test-badminton-smash',
    'scheduled',
    false,
    true,
    true
  );

  -- 4. Wydarzenie specjalne (za 7 dni, płatne)
  INSERT INTO public.activities (
    id, name, description, activity_type_id, trainer_id,
    date_time, duration_minutes, max_participants, cost,
    cancellation_hours, location, status, is_special_event,
    is_online, requires_immediate_payment
  ) VALUES (
    'b0000004-0000-0000-0000-000000000004'::UUID,
    'Turniej Badmintona - BadCup 2026',
    'Coroczny turniej dla członków stowarzyszenia. Kategorie: singiel i debel.',
    other_id,
    NULL, -- Brak trenera (wydarzenie specjalne)
    (CURRENT_DATE + INTERVAL '7 days' + TIME '10:00:00')::TIMESTAMP WITH TIME ZONE,
    360, -- 6 godzin
    32,
    50.00,
    168, -- 7 dni
    'Hala MOSiR, ul. Olimpijska 1',
    'scheduled',
    true,
    false,
    true
  );

  -- 5. Zakończone zajęcia (2 dni temu)
  INSERT INTO public.activities (
    id, name, description, activity_type_id, trainer_id,
    date_time, duration_minutes, max_participants, cost,
    cancellation_hours, location, status, is_special_event,
    is_online, requires_immediate_payment
  ) VALUES (
    'b0000005-0000-0000-0000-000000000005'::UUID,
    'Trening Badmintona - Zakończony',
    'Zajęcia które już się odbyły.',
    badminton_id,
    'a3333333-3333-3333-3333-333333333333'::UUID, -- Trainer
    (CURRENT_DATE - INTERVAL '2 days' + TIME '18:00:00')::TIMESTAMP WITH TIME ZONE,
    90,
    12,
    25.00,
    24,
    'Hala sportowa, ul. Sportowa 10',
    'completed',
    false,
    false,
    true
  );

  RAISE NOTICE '✓ Created 5 test activities';
END $$;

-- ============================================================================
-- KROK 6: Dodanie przykładowych rezerwacji
-- ============================================================================

DO $$
BEGIN
  -- Cleanup
  DELETE FROM public.registrations WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111'::UUID,
    'a4444444-4444-4444-4444-444444444444'::UUID
  );

  -- Regular user zapisany na płatne zajęcia badmintona (nieopłacone - pending)
  INSERT INTO public.registrations (
    id, activity_id, user_id, status, payment_status,
    can_cancel_until
  ) VALUES (
    'c0000001-0000-0000-0000-000000000001'::UUID,
    'b0000001-0000-0000-0000-000000000001'::UUID, -- Badminton
    'a1111111-1111-1111-1111-111111111111'::UUID, -- Regular user
    'registered',
    'pending',
    (SELECT calculate_cancellation_deadline('b0000001-0000-0000-0000-000000000001'::UUID))
  );

  -- Member user zapisany na darmowe zajęcia jogi
  INSERT INTO public.registrations (
    id, activity_id, user_id, status, payment_status,
    can_cancel_until
  ) VALUES (
    'c0000002-0000-0000-0000-000000000002'::UUID,
    'b0000002-0000-0000-0000-000000000002'::UUID, -- Joga
    'a4444444-4444-4444-4444-444444444444'::UUID, -- Member user
    'registered',
    'paid', -- Darmowe = od razu "opłacone"
    (SELECT calculate_cancellation_deadline('b0000002-0000-0000-0000-000000000002'::UUID))
  );

  -- Regular user uczestniczył w zakończonych zajęciach
  INSERT INTO public.registrations (
    id, activity_id, user_id, status, payment_status,
    can_cancel_until
  ) VALUES (
    'c0000003-0000-0000-0000-000000000003'::UUID,
    'b0000005-0000-0000-0000-000000000005'::UUID, -- Zakończone badminton
    'a1111111-1111-1111-1111-111111111111'::UUID, -- Regular user
    'attended',
    'paid',
    (SELECT calculate_cancellation_deadline('b0000005-0000-0000-0000-000000000005'::UUID))
  );

  RAISE NOTICE '✓ Created 3 test registrations';
END $$;

-- ============================================================================
-- KROK 7: Dodanie przykładowych transakcji
-- ============================================================================

DO $$
BEGIN
  -- Cleanup
  DELETE FROM public.balance_transactions WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111'::UUID,
    'a4444444-4444-4444-4444-444444444444'::UUID
  );

  -- Doładowanie salda dla regular user (wpłata manualna przez admina)
  INSERT INTO public.balance_transactions (
    id, user_id, amount, balance_before, balance_after,
    type, description, created_by
  ) VALUES (
    'd0000001-0000-0000-0000-000000000001'::UUID,
    'a1111111-1111-1111-1111-111111111111'::UUID, -- Regular user
    100.00,
    0.00,
    100.00,
    'manual_credit',
    'Wpłata testowa - doładowanie konta',
    'a2222222-2222-2222-2222-222222222222'::UUID -- Admin
  );

  RAISE NOTICE '✓ Created test transactions';
END $$;

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✓ Seedowanie zakończone pomyślnie!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Utworzone konta testowe:';
  RAISE NOTICE '  1. Regular User:';
  RAISE NOTICE '     Email: test.user@unicorns-test.local';
  RAISE NOTICE '     Hasło: (z Vault: test_user_password)';
  RAISE NOTICE '     Rola: user';
  RAISE NOTICE '';
  RAISE NOTICE '  2. Admin:';
  RAISE NOTICE '     Email: admin@unicorns-test.local';
  RAISE NOTICE '     Hasło: (z Vault: test_user_password)';
  RAISE NOTICE '     Rola: admin';
  RAISE NOTICE '';
  RAISE NOTICE '  3. Trainer:';
  RAISE NOTICE '     Email: trainer@unicorns-test.local';
  RAISE NOTICE '     Hasło: (z Vault: test_user_password)';
  RAISE NOTICE '     Rola: trainer';
  RAISE NOTICE '';
  RAISE NOTICE '  4. Member (członek stowarzyszenia):';
  RAISE NOTICE '     Email: member@unicorns-test.local';
  RAISE NOTICE '     Hasło: (z Vault: test_user_password)';
  RAISE NOTICE '     Rola: user (is_association_member=true)';
  RAISE NOTICE '';
  RAISE NOTICE 'Dane testowe:';
  RAISE NOTICE '  - 3 sekcje (Badminton, Joga, Inne)';
  RAISE NOTICE '  - 5 zajęć (3 nadchodzące, 1 online, 1 zakończone)';
  RAISE NOTICE '  - 3 rezerwacje';
  RAISE NOTICE '  - 1 transakcja';
  RAISE NOTICE '';
  RAISE NOTICE 'Następny krok:';
  RAISE NOTICE '  Uruchom testy E2E: cd frontend && npm run test:e2e';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
