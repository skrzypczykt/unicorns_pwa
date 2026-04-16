-- Rainbow Unicorn NGO Sports PWA - Seed Data
-- Sample data for testing and development

-- Note: This assumes you have created test users in Supabase Auth with the following emails:
-- admin@unicorn.test (role: admin)
-- trener1@unicorn.test (role: trainer)
-- trener2@unicorn.test (role: trainer)
-- user1@unicorn.test (role: user)
-- user2@unicorn.test (role: user)
-- user3@unicorn.test (role: user)

-- You'll need to replace these UUIDs with actual auth.users IDs from your Supabase project

-- ============================================================================
-- 1. Sample Users (profiles)
-- ============================================================================

-- Admin user
INSERT INTO public.users (id, email, display_name, role, balance, balance_updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001'::UUID, 'admin@unicorn.test', 'Admin Jednorożec', 'admin', 1000.00, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  balance = EXCLUDED.balance;

-- Trainer 1
INSERT INTO public.users (id, email, display_name, role, balance, balance_updated_at) VALUES
  ('00000000-0000-0000-0000-000000000002'::UUID, 'trener1@unicorn.test', 'Anna Kowalska', 'trainer', 500.00, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  balance = EXCLUDED.balance;

-- Trainer 2
INSERT INTO public.users (id, email, display_name, role, balance, balance_updated_at) VALUES
  ('00000000-0000-0000-0000-000000000003'::UUID, 'trener2@unicorn.test', 'Piotr Nowak', 'trainer', 300.00, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  balance = EXCLUDED.balance;

-- Regular users
INSERT INTO public.users (id, email, display_name, role, balance, balance_updated_at) VALUES
  ('00000000-0000-0000-0000-000000000004'::UUID, 'user1@unicorn.test', 'Jan Wiśniewski', 'user', 150.00, NOW()),
  ('00000000-0000-0000-0000-000000000005'::UUID, 'user2@unicorn.test', 'Maria Lewandowska', 'user', 200.00, NOW()),
  ('00000000-0000-0000-0000-000000000006'::UUID, 'user3@unicorn.test', 'Tomasz Dąbrowski', 'user', 50.00, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  balance = EXCLUDED.balance;

-- ============================================================================
-- 2. Sample Activities
-- ============================================================================

-- Get activity type IDs
DO $$
DECLARE
  yoga_id UUID;
  football_id UUID;
  gym_id UUID;
  running_id UUID;
  dance_id UUID;
BEGIN
  SELECT id INTO yoga_id FROM public.activity_types WHERE name = 'Joga' LIMIT 1;
  SELECT id INTO football_id FROM public.activity_types WHERE name = 'Piłka Nożna' LIMIT 1;
  SELECT id INTO gym_id FROM public.activity_types WHERE name = 'Siłownia' LIMIT 1;
  SELECT id INTO running_id FROM public.activity_types WHERE name = 'Bieganie' LIMIT 1;
  SELECT id INTO dance_id FROM public.activity_types WHERE name = 'Taniec' LIMIT 1;

  -- Upcoming activities
  INSERT INTO public.activities (id, name, description, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, cancellation_hours, location, status) VALUES
    (
      '10000000-0000-0000-0000-000000000001'::UUID,
      'Poranna Joga dla Początkujących',
      'Relaksujące zajęcia jogi dla osób rozpoczynających swoją przygodę z jogą. Skupimy się na podstawowych pozycjach i oddechu.',
      yoga_id,
      '00000000-0000-0000-0000-000000000002'::UUID, -- Anna Kowalska
      (CURRENT_DATE + INTERVAL '2 days' + TIME '08:00:00')::TIMESTAMP WITH TIME ZONE,
      60,
      15,
      30.00,
      24,
      'Sala gimnastyczna nr 1, ul. Sportowa 10',
      'scheduled'
    ),
    (
      '10000000-0000-0000-0000-000000000002'::UUID,
      'Trening Piłki Nożnej - Dzieci',
      'Zajęcia piłki nożnej dla dzieci w wieku 8-12 lat. Rozwijamy umiejętności techniczne i pracę zespołową.',
      football_id,
      '00000000-0000-0000-0000-000000000003'::UUID, -- Piotr Nowak
      (CURRENT_DATE + INTERVAL '3 days' + TIME '16:00:00')::TIMESTAMP WITH TIME ZONE,
      90,
      20,
      25.00,
      12,
      'Boisko Orlik, Park Miejski',
      'scheduled'
    ),
    (
      '10000000-0000-0000-0000-000000000003'::UUID,
      'Trening Siłowy dla Średnio Zaawansowanych',
      'Intensywny trening siłowy z wykorzystaniem wolnych ciężarów i maszyn. Wymagane doświadczenie.',
      gym_id,
      '00000000-0000-0000-0000-000000000003'::UUID, -- Piotr Nowak
      (CURRENT_DATE + INTERVAL '4 days' + TIME '18:00:00')::TIMESTAMP WITH TIME ZONE,
      75,
      10,
      40.00,
      24,
      'Siłownia FitZone, ul. Zdrowa 5',
      'scheduled'
    ),
    (
      '10000000-0000-0000-0000-000000000004'::UUID,
      'Bieganie - Technika i Wytrzymałość',
      'Grupowy trening biegowy z naciskiem na technikę biegu i budowanie wytrzymałości.',
      running_id,
      '00000000-0000-0000-0000-000000000002'::UUID, -- Anna Kowalska
      (CURRENT_DATE + INTERVAL '5 days' + TIME '07:00:00')::TIMESTAMP WITH TIME ZONE,
      60,
      25,
      20.00,
      6,
      'Start: Parking przy Parku Centralnym',
      'scheduled'
    ),
    (
      '10000000-0000-0000-0000-000000000005'::UUID,
      'Wieczorna Joga Relaksacyjna',
      'Łagodna joga wieczorna, idealna na zakończenie dnia. Ćwiczenia rozciągające i oddechowe.',
      yoga_id,
      '00000000-0000-0000-0000-000000000002'::UUID, -- Anna Kowalska
      (CURRENT_DATE + INTERVAL '6 days' + TIME '19:00:00')::TIMESTAMP WITH TIME ZONE,
      60,
      12,
      30.00,
      24,
      'Sala gimnastyczna nr 1, ul. Sportowa 10',
      'scheduled'
    ),
    (
      '10000000-0000-0000-0000-000000000006'::UUID,
      'Taniec Współczesny - Warsztat',
      'Kreatywny warsztat tańca współczesnego. Dla wszystkich poziomów zaawansowania.',
      dance_id,
      '00000000-0000-0000-0000-000000000002'::UUID, -- Anna Kowalska
      (CURRENT_DATE + INTERVAL '7 days' + TIME '17:00:00')::TIMESTAMP WITH TIME ZONE,
      90,
      15,
      35.00,
      48,
      'Studio Tańca, ul. Artystyczna 3',
      'scheduled'
    );

  -- Past activity (completed)
  INSERT INTO public.activities (id, name, description, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, cancellation_hours, location, status) VALUES
    (
      '10000000-0000-0000-0000-000000000007'::UUID,
      'Poranna Joga - Sesja Miniona',
      'Zajęcia jogi które już się odbyły.',
      yoga_id,
      '00000000-0000-0000-0000-000000000002'::UUID,
      (CURRENT_DATE - INTERVAL '2 days' + TIME '08:00:00')::TIMESTAMP WITH TIME ZONE,
      60,
      15,
      30.00,
      24,
      'Sala gimnastyczna nr 1, ul. Sportowa 10',
      'completed'
    );

END $$;

-- ============================================================================
-- 3. Sample Registrations
-- ============================================================================

-- User1 registered for upcoming yoga class
INSERT INTO public.registrations (id, activity_id, user_id, status, can_cancel_until, payment_processed) VALUES
  (
    '20000000-0000-0000-0000-000000000001'::UUID,
    '10000000-0000-0000-0000-000000000001'::UUID, -- Poranna Joga
    '00000000-0000-0000-0000-000000000004'::UUID, -- Jan Wiśniewski
    'registered',
    (SELECT calculate_cancellation_deadline('10000000-0000-0000-0000-000000000001'::UUID)),
    FALSE
  );

-- User2 registered for football
INSERT INTO public.registrations (id, activity_id, user_id, status, can_cancel_until, payment_processed) VALUES
  (
    '20000000-0000-0000-0000-000000000002'::UUID,
    '10000000-0000-0000-0000-000000000002'::UUID, -- Piłka Nożna
    '00000000-0000-0000-0000-000000000005'::UUID, -- Maria Lewandowska
    'registered',
    (SELECT calculate_cancellation_deadline('10000000-0000-0000-0000-000000000002'::UUID)),
    FALSE
  );

-- User3 registered for gym
INSERT INTO public.registrations (id, activity_id, user_id, status, can_cancel_until, payment_processed) VALUES
  (
    '20000000-0000-0000-0000-000000000003'::UUID,
    '10000000-0000-0000-0000-000000000003'::UUID, -- Siłownia
    '00000000-0000-0000-0000-000000000006'::UUID, -- Tomasz Dąbrowski
    'registered',
    (SELECT calculate_cancellation_deadline('10000000-0000-0000-0000-000000000003'::UUID)),
    FALSE
  );

-- Past attendance example (User1 attended past yoga class and was charged)
INSERT INTO public.registrations (id, activity_id, user_id, status, can_cancel_until, payment_processed) VALUES
  (
    '20000000-0000-0000-0000-000000000004'::UUID,
    '10000000-0000-0000-0000-000000000007'::UUID, -- Past yoga
    '00000000-0000-0000-0000-000000000004'::UUID, -- Jan Wiśniewski
    'attended',
    (SELECT calculate_cancellation_deadline('10000000-0000-0000-0000-000000000007'::UUID)),
    TRUE
  );

-- ============================================================================
-- 4. Sample Attendance Records
-- ============================================================================

-- User1 attended past yoga class
INSERT INTO public.attendance (id, activity_id, user_id, registration_id, marked_by, status, notes) VALUES
  (
    '30000000-0000-0000-0000-000000000001'::UUID,
    '10000000-0000-0000-0000-000000000007'::UUID, -- Past yoga
    '00000000-0000-0000-0000-000000000004'::UUID, -- Jan Wiśniewski
    '20000000-0000-0000-0000-000000000004'::UUID, -- His registration
    '00000000-0000-0000-0000-000000000002'::UUID, -- Marked by Anna Kowalska (trainer)
    'present',
    'Bardzo dobra postawa podczas ćwiczeń'
  );

-- ============================================================================
-- 5. Sample Balance Transactions
-- ============================================================================

-- Admin added balance to all users at the beginning of the month
INSERT INTO public.balance_transactions (id, user_id, amount, balance_before, balance_after, type, description, created_by, created_at) VALUES
  (
    '40000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID, -- Jan Wiśniewski
    200.00,
    0.00,
    200.00,
    'manual_credit',
    'Wpłata za styczeń 2026',
    '00000000-0000-0000-0000-000000000001'::UUID, -- Admin
    NOW() - INTERVAL '10 days'
  ),
  (
    '40000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000005'::UUID, -- Maria Lewandowska
    200.00,
    0.00,
    200.00,
    'manual_credit',
    'Wpłata za styczeń 2026',
    '00000000-0000-0000-0000-000000000001'::UUID, -- Admin
    NOW() - INTERVAL '10 days'
  ),
  (
    '40000000-0000-0000-0000-000000000003'::UUID,
    '00000000-0000-0000-0000-000000000006'::UUID, -- Tomasz Dąbrowski
    100.00,
    0.00,
    100.00,
    'manual_credit',
    'Wpłata za styczeń 2026',
    '00000000-0000-0000-0000-000000000001'::UUID, -- Admin
    NOW() - INTERVAL '10 days'
  );

-- Payment for User1's past yoga class (when attendance was marked)
INSERT INTO public.balance_transactions (id, user_id, amount, balance_before, balance_after, type, reference_id, description, created_by, created_at) VALUES
  (
    '40000000-0000-0000-0000-000000000004'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID, -- Jan Wiśniewski
    -30.00,
    200.00,
    170.00,
    'class_payment',
    '10000000-0000-0000-0000-000000000007'::UUID, -- Past yoga activity
    'Płatność za zajęcia: Poranna Joga - Sesja Miniona',
    '00000000-0000-0000-0000-000000000002'::UUID, -- Trainer (system processed)
    NOW() - INTERVAL '2 days'
  );

-- Another manual credit for User1
INSERT INTO public.balance_transactions (id, user_id, amount, balance_before, balance_after, type, description, created_by, created_at) VALUES
  (
    '40000000-0000-0000-0000-000000000005'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID, -- Jan Wiśniewski
    10.00,
    170.00,
    180.00,
    'manual_credit',
    'Korekta salda - bonus za polecenie',
    '00000000-0000-0000-0000-000000000001'::UUID, -- Admin
    NOW() - INTERVAL '1 day'
  );

-- Adjust final User1 balance to match current state (after -30 from class)
UPDATE public.users SET balance = 150.00 WHERE id = '00000000-0000-0000-0000-000000000004'::UUID;

-- ============================================================================
-- 6. Sample Audit Log Entries
-- ============================================================================

INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values, created_at) VALUES
  (
    '00000000-0000-0000-0000-000000000001'::UUID, -- Admin
    'create_activity',
    'activities',
    '10000000-0000-0000-0000-000000000001'::UUID,
    jsonb_build_object('name', 'Poranna Joga dla Początkujących', 'cost', 30.00),
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::UUID, -- Admin
    'update_balance',
    'users',
    '00000000-0000-0000-0000-000000000004'::UUID,
    jsonb_build_object('balance_before', 0.00, 'balance_after', 200.00, 'amount', 200.00),
    NOW() - INTERVAL '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000002'::UUID, -- Trainer
    'mark_attendance',
    'attendance',
    '30000000-0000-0000-0000-000000000001'::UUID,
    jsonb_build_object('user_id', '00000000-0000-0000-0000-000000000004'::UUID, 'status', 'present'),
    NOW() - INTERVAL '2 days'
  );

-- ============================================================================
-- Summary
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Seed data loaded successfully!';
  RAISE NOTICE '  - 6 users created (1 admin, 2 trainers, 3 regular users)';
  RAISE NOTICE '  - 7 activities created (6 upcoming, 1 completed)';
  RAISE NOTICE '  - 4 registrations created';
  RAISE NOTICE '  - 1 attendance record created';
  RAISE NOTICE '  - 5 balance transactions created';
  RAISE NOTICE '  - 3 audit log entries created';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Accounts:';
  RAISE NOTICE '  Admin: admin@unicorn.test';
  RAISE NOTICE '  Trainer: trener1@unicorn.test, trener2@unicorn.test';
  RAISE NOTICE '  Users: user1@unicorn.test, user2@unicorn.test, user3@unicorn.test';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Remember to create these users in Supabase Auth with matching UUIDs!';
END $$;
