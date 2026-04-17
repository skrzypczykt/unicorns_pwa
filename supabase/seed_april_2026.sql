-- Seed data for April 2026 - Past activities with payments for accounting reports
-- Run this to populate the database with realistic historical data

-- ============================================================================
-- Get activity type IDs for reference
-- ============================================================================

DO $$
DECLARE
  badminton_id UUID;
  yoga_id UUID;
  taniec_id UUID;
  siatkowka_id UUID;
  admin_id UUID;
  user1_id UUID;
  user2_id UUID;
  trainer_id UUID;
  activity1_id UUID;
  activity2_id UUID;
  activity3_id UUID;
  activity4_id UUID;
  activity5_id UUID;
  activity6_id UUID;
  activity7_id UUID;
  activity8_id UUID;
BEGIN
  -- Get activity type IDs
  SELECT id INTO badminton_id FROM activity_types WHERE name = 'Badminton' LIMIT 1;
  SELECT id INTO yoga_id FROM activity_types WHERE name = 'Joga' LIMIT 1;
  SELECT id INTO taniec_id FROM activity_types WHERE name = 'Taniec' LIMIT 1;
  SELECT id INTO siatkowka_id FROM activity_types WHERE name = 'Siatkówka' LIMIT 1;

  -- Get user IDs
  SELECT id INTO admin_id FROM users WHERE email = 'admin@unicorn.test' LIMIT 1;
  SELECT id INTO user1_id FROM users WHERE email = 'user1@unicorn.test' LIMIT 1;
  SELECT id INTO user2_id FROM users WHERE email = 'user2@unicorn.test' LIMIT 1;

  -- Fallback: try to find any regular user for user2
  IF user2_id IS NULL THEN
    SELECT id INTO user2_id FROM users WHERE role = 'user' AND id != COALESCE(user1_id, '00000000-0000-0000-0000-000000000000'::uuid) LIMIT 1;
  END IF;

  SELECT id INTO trainer_id FROM users WHERE role = 'trainer' LIMIT 1;

  -- If required users don't exist, exit
  IF admin_id IS NULL OR user1_id IS NULL OR user2_id IS NULL OR trainer_id IS NULL THEN
    RAISE NOTICE 'Required users not found:';
    RAISE NOTICE 'admin_id: %, user1_id: %, user2_id: %, trainer_id: %', admin_id, user1_id, user2_id, trainer_id;
    RAISE NOTICE 'Please run seed.sql first to create test users.';
    RETURN;
  END IF;

  -- ============================================================================
  -- CREATE PAST ACTIVITIES (April 2026)
  -- ============================================================================

  -- Week 1 (April 1-7, 2026)
  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Badminton dla średniozaawansowanych', badminton_id, trainer_id, '2026-04-02 18:00:00+00', 90, 12, 30.00, 'Hala Sportowa OSiR', 'Badminton dla średniozaawansowanych', 'completed')
  RETURNING id INTO activity1_id;

  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Joga wieczorna - relaks', yoga_id, trainer_id, '2026-04-03 19:00:00+00', 60, 15, 25.00, 'Studio Jogi Zen', 'Joga wieczorna - relaks', 'completed')
  RETURNING id INTO activity2_id;

  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Salsa - poziom podstawowy', taniec_id, trainer_id, '2026-04-04 20:00:00+00', 90, 20, 40.00, 'Sala taneczna Ritmo', 'Salsa - poziom podstawowy', 'completed')
  RETURNING id INTO activity3_id;

  -- Week 2 (April 8-14, 2026)
  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Badminton dla średniozaawansowanych', badminton_id, trainer_id, '2026-04-09 18:00:00+00', 90, 12, 30.00, 'Hala Sportowa OSiR', 'Badminton dla średniozaawansowanych', 'completed')
  RETURNING id INTO activity4_id;

  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Siatkówka rekreacyjna', siatkowka_id, trainer_id, '2026-04-10 19:00:00+00', 120, 16, 35.00, 'Hala OSiR', 'Siatkówka rekreacyjna', 'completed')
  RETURNING id INTO activity5_id;

  -- Week 3 (April 15-21, 2026)
  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Badminton dla średniozaawansowanych', badminton_id, trainer_id, '2026-04-16 18:00:00+00', 90, 12, 30.00, 'Hala Sportowa OSiR', 'Badminton dla średniozaawansowanych', 'completed')
  RETURNING id INTO activity6_id;

  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Salsa - poziom średniozaawansowany', taniec_id, trainer_id, '2026-04-18 20:00:00+00', 90, 20, 40.00, 'Sala taneczna Ritmo', 'Salsa - poziom średniozaawansowany', 'completed')
  RETURNING id INTO activity7_id;

  -- Week 4 (April 22-28, 2026)
  INSERT INTO activities (name, activity_type_id, trainer_id, date_time, duration_minutes, max_participants, cost, location, description, status)
  VALUES
    ('Joga wieczorna - power yoga', yoga_id, trainer_id, '2026-04-24 19:00:00+00', 60, 15, 25.00, 'Studio Jogi Zen', 'Joga wieczorna - power yoga', 'completed')
  RETURNING id INTO activity8_id;

  -- ============================================================================
  -- CREATE REGISTRATIONS
  -- ============================================================================

  -- Activity 1 (Badminton, April 2) - user1 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES (user1_id, activity1_id, 'attended', true, '2026-04-02 06:00:00+00', '2026-04-01 10:00:00+00');

  -- Activity 2 (Yoga, April 3) - user1 attended, user2 no-show
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES
    (user1_id, activity2_id, 'attended', true, '2026-04-03 07:00:00+00', '2026-04-02 10:00:00+00'),
    (user2_id, activity2_id, 'no_show', false, '2026-04-03 07:00:00+00', '2026-04-02 11:00:00+00');

  -- Activity 3 (Taniec, April 4) - user2 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES (user2_id, activity3_id, 'attended', true, '2026-04-04 08:00:00+00', '2026-04-03 10:00:00+00');

  -- Activity 4 (Badminton, April 9) - user1 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES (user1_id, activity4_id, 'attended', true, '2026-04-09 06:00:00+00', '2026-04-08 10:00:00+00');

  -- Activity 5 (Siatkówka, April 10) - user1 and user2 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES
    (user1_id, activity5_id, 'attended', true, '2026-04-10 07:00:00+00', '2026-04-09 10:00:00+00'),
    (user2_id, activity5_id, 'attended', true, '2026-04-10 07:00:00+00', '2026-04-09 11:00:00+00');

  -- Activity 6 (Badminton, April 16) - user1 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES (user1_id, activity6_id, 'attended', true, '2026-04-16 06:00:00+00', '2026-04-15 10:00:00+00');

  -- Activity 7 (Taniec, April 18) - user2 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES (user2_id, activity7_id, 'attended', true, '2026-04-18 08:00:00+00', '2026-04-17 10:00:00+00');

  -- Activity 8 (Yoga, April 24) - user1 no-show, user2 attended
  INSERT INTO registrations (user_id, activity_id, status, payment_processed, can_cancel_until, created_at)
  VALUES
    (user1_id, activity8_id, 'no_show', false, '2026-04-24 07:00:00+00', '2026-04-23 10:00:00+00'),
    (user2_id, activity8_id, 'attended', true, '2026-04-24 07:00:00+00', '2026-04-23 11:00:00+00');

  -- ============================================================================
  -- CREATE BALANCE TRANSACTIONS
  -- ============================================================================

  -- MARCH 31 - Starting balances (top-ups before April)

  -- user1 tops up 200 zł for Badminton
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, activity_type_id, created_at, created_by)
  VALUES (user1_id, 200.00, 'manual_credit', 'Doładowanie konta - Badminton', 0.00, 200.00, badminton_id, '2026-03-31 10:00:00+00', admin_id);

  -- user1 tops up 100 zł for Yoga
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, activity_type_id, created_at, created_by)
  VALUES (user1_id, 100.00, 'manual_credit', 'Doładowanie konta - Joga', 0.00, 100.00, yoga_id, '2026-03-31 10:05:00+00', admin_id);

  -- user1 tops up 150 zł for Siatkówka
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, activity_type_id, created_at, created_by)
  VALUES (user1_id, 150.00, 'manual_credit', 'Doładowanie konta - Siatkówka', 0.00, 150.00, siatkowka_id, '2026-03-31 10:10:00+00', admin_id);

  -- user2 tops up 150 zł for Taniec
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, activity_type_id, created_at, created_by)
  VALUES (user2_id, 150.00, 'manual_credit', 'Doładowanie konta - Taniec', 0.00, 150.00, taniec_id, '2026-03-31 11:00:00+00', admin_id);

  -- user2 tops up 80 zł for Siatkówka
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, activity_type_id, created_at, created_by)
  VALUES (user2_id, 80.00, 'manual_credit', 'Doładowanie konta - Siatkówka', 0.00, 80.00, siatkowka_id, '2026-03-31 11:05:00+00', admin_id);

  -- APRIL - Class payments (debits)

  -- April 2 - user1 pays for Badminton (30 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user1_id, -30.00, 'class_payment', 'Opłata za zajęcia: Badminton dla średniozaawansowanych', 200.00, 170.00, activity1_id, badminton_id, '2026-04-02 18:00:00+00', trainer_id);

  -- April 3 - user1 pays for Yoga (25 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user1_id, -25.00, 'class_payment', 'Opłata za zajęcia: Joga wieczorna - relaks', 100.00, 75.00, activity2_id, yoga_id, '2026-04-03 19:00:00+00', trainer_id);

  -- April 4 - user2 pays for Taniec (40 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user2_id, -40.00, 'class_payment', 'Opłata za zajęcia: Salsa - poziom podstawowy', 150.00, 110.00, activity3_id, taniec_id, '2026-04-04 20:00:00+00', trainer_id);

  -- April 9 - user1 pays for Badminton (30 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user1_id, -30.00, 'class_payment', 'Opłata za zajęcia: Badminton dla średniozaawansowanych', 170.00, 140.00, activity4_id, badminton_id, '2026-04-09 18:00:00+00', trainer_id);

  -- April 10 - user1 pays for Siatkówka (35 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user1_id, -35.00, 'class_payment', 'Opłata za zajęcia: Siatkówka rekreacyjna', 150.00, 115.00, activity5_id, siatkowka_id, '2026-04-10 19:00:00+00', trainer_id);

  -- April 10 - user2 pays for Siatkówka (35 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user2_id, -35.00, 'class_payment', 'Opłata za zajęcia: Siatkówka rekreacyjna', 80.00, 45.00, activity5_id, siatkowka_id, '2026-04-10 19:00:00+00', trainer_id);

  -- April 16 - user1 pays for Badminton (30 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user1_id, -30.00, 'class_payment', 'Opłata za zajęcia: Badminton dla średniozaawansowanych', 140.00, 110.00, activity6_id, badminton_id, '2026-04-16 18:00:00+00', trainer_id);

  -- April 18 - user2 pays for Taniec (40 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user2_id, -40.00, 'class_payment', 'Opłata za zajęcia: Salsa - poziom średniozaawansowany', 110.00, 70.00, activity7_id, taniec_id, '2026-04-18 20:00:00+00', trainer_id);

  -- April 24 - user2 pays for Yoga (25 zł)
  INSERT INTO balance_transactions (user_id, amount, type, description, balance_before, balance_after, reference_id, activity_type_id, created_at, created_by)
  VALUES (user2_id, -25.00, 'class_payment', 'Opłata za zajęcia: Joga wieczorna - power yoga', 0.00, -25.00, activity8_id, yoga_id, '2026-04-24 19:00:00+00', trainer_id);
  -- Note: user2 has 0 balance for Yoga but attended, creating debt

  -- ============================================================================
  -- UPDATE user_section_balances
  -- ============================================================================

  -- Initialize balances if they don't exist
  INSERT INTO user_section_balances (user_id, activity_type_id, balance)
  VALUES
    (user1_id, badminton_id, 110.00),
    (user1_id, yoga_id, 75.00),
    (user1_id, siatkowka_id, 115.00),
    (user2_id, taniec_id, 70.00),
    (user2_id, siatkowka_id, 45.00),
    (user2_id, yoga_id, -25.00)
  ON CONFLICT (user_id, activity_type_id)
  DO UPDATE SET
    balance = EXCLUDED.balance,
    updated_at = now();

  RAISE NOTICE 'Seed data for April 2026 created successfully!';
  RAISE NOTICE 'Activities created: 8';
  RAISE NOTICE 'Registrations created: 11';
  RAISE NOTICE 'Balance transactions created: 13';
  RAISE NOTICE 'User1 final balances: Badminton=110 zł, Yoga=75 zł, Siatkówka=115 zł';
  RAISE NOTICE 'User2 final balances: Taniec=70 zł, Siatkówka=45 zł, Yoga=-25 zł (debt)';

END $$;
