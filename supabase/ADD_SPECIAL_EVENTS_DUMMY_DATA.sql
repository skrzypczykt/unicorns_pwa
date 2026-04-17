-- Dummy data: Special Events (Wydarzenia specjalne)
-- Run this after migration 014 to add sample special events

-- Get the activity type ID for "Wydarzenia specjalne"
DO $$
DECLARE
  special_events_type_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get the activity type ID
  SELECT id INTO special_events_type_id
  FROM activity_types
  WHERE name = 'Wydarzenia specjalne';

  -- Get an admin user as trainer (fallback to first user if no admin)
  SELECT id INTO admin_user_id
  FROM users
  WHERE role = 'admin'
  LIMIT 1;

  -- If no admin, use first user
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM users
    LIMIT 1;
  END IF;

  -- Verify we have the necessary data
  IF special_events_type_id IS NULL THEN
    RAISE EXCEPTION 'Activity type "Wydarzenia specjalne" not found. Run migration 014 first!';
  END IF;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in database. Create at least one user first!';
  END IF;

  -- 1. Spływ kajakowy - 3-dniowe wydarzenie (czerwiec 2026)
  INSERT INTO activities (
    name,
    description,
    activity_type_id,
    trainer_id,
    date_time,
    duration_minutes,
    max_participants,
    cost,
    location,
    status,
    cancellation_hours,
    is_special_event,
    registration_opens_at,
    registration_closes_at
  ) VALUES (
    'Spływ kajakowy - Krutynia 2026',
    E'🛶 3-dniowy spływ kajakowy rzeką Krutynia!\n\n' ||
    E'📅 Termin: 12-14 czerwca 2026\n' ||
    E'🏕️ W pakiecie: kajaki, nocleg w namiotach, ognisko, wspólne posiłki\n' ||
    E'🌲 Trasa: ~40 km po najpiękniejszej rzece Mazur\n' ||
    E'💪 Poziom: dla każdego (początkujący mile widziani!)\n\n' ||
    E'Zapisz się szybko - ograniczona liczba miejsc!',
    special_events_type_id,
    admin_user_id,
    '2026-06-12 09:00:00+02',  -- Start: 12 czerwca 2026, 9:00
    4320,  -- 3 dni = 72 godziny = 4320 minut
    30,    -- Max 30 uczestników
    450.00, -- 450 zł (kajaki, nocleg, wyżywienie)
    'Krutynia, Mazury',
    'scheduled',
    168,   -- Można anulować do 7 dni przed (168 godzin)
    true,  -- is_special_event
    '2026-04-17 00:00:00+02',  -- Zapisy otwarte od teraz
    '2026-06-05 23:59:59+02'   -- Zapisy do 5 czerwca
  )
  ON CONFLICT DO NOTHING;

  -- 2. Wycieczka do Amsterdamu (sierpień 2026)
  INSERT INTO activities (
    name,
    description,
    activity_type_id,
    trainer_id,
    date_time,
    duration_minutes,
    max_participants,
    cost,
    location,
    status,
    cancellation_hours,
    is_special_event,
    registration_opens_at,
    registration_closes_at
  ) VALUES (
    'Amsterdam Pride & City Trip 2026',
    E'🏳️‍🌈 Wycieczka do Amsterdamu podczas Amsterdam Pride!\n\n' ||
    E'📅 Termin: 1-4 sierpnia 2026 (4 dni/3 noce)\n' ||
    E'✈️ Transport: autokar komfortowy\n' ||
    E'🏨 Nocleg: hotel 3* w centrum\n' ||
    E'🎉 W programie:\n' ||
    E'  • Canal Parade (parada łodzi po kanałach)\n' ||
    E'  • Zwiedzanie miasta z przewodnikiem\n' ||
    E'  • Wolny czas na zakupy i zwiedzanie\n' ||
    E'  • Muzea: Van Gogh, Anne Frank (opcjonalnie)\n' ||
    E'  • Wspólne wyjścia wieczorne\n\n' ||
    E'💰 Cena: 1200 zł (transport, nocleg, śniadania, ubezpieczenie)\n' ||
    E'Wpłata zaliczki 400 zł do 15 maja!',
    special_events_type_id,
    admin_user_id,
    '2026-08-01 06:00:00+02',  -- Wyjazd: 1 sierpnia 2026, 6:00 rano
    5760,  -- 4 dni = 96 godzin = 5760 minut
    40,    -- Max 40 uczestników (pełny autokar)
    1200.00, -- 1200 zł
    'Amsterdam, Holandia',
    'scheduled',
    720,   -- Można anulować do 30 dni przed (720 godzin)
    true,  -- is_special_event
    '2026-04-17 00:00:00+02',  -- Zapisy otwarte od teraz
    '2026-07-15 23:59:59+02'   -- Zapisy do 15 lipca
  )
  ON CONFLICT DO NOTHING;

  -- 3. Impreza świąteczna Unicorns (grudzień 2026)
  INSERT INTO activities (
    name,
    description,
    activity_type_id,
    trainer_id,
    date_time,
    duration_minutes,
    max_participants,
    cost,
    location,
    status,
    cancellation_hours,
    is_special_event,
    registration_opens_at,
    registration_closes_at
  ) VALUES (
    '🎄 Wigilia Unicorns 2026',
    E'🎅 Coroczna impreza świąteczna Unicorns!\n\n' ||
    E'📅 Termin: 19 grudnia 2026, godz. 18:00\n' ||
    E'🍽️ Kolacja wigilijna (12 potraw!)\n' ||
    E'🎁 Wymiana prezentów (do 30 zł)\n' ||
    E'🎤 Karaoke świąteczne\n' ||
    E'💃 Tańce przy DJ-u\n' ||
    E'🎮 Gry i zabawy integracyjne\n' ||
    E'🌈 Spotkanie całej społeczności Unicorns!\n\n' ||
    E'To najważniejsze wydarzenie roku - nie przegap!\n' ||
    E'Dress code: elegancki lub świąteczny (swetry z reniferami mile widziane! 🦌)',
    special_events_type_id,
    admin_user_id,
    '2026-12-19 18:00:00+01',  -- 19 grudnia 2026, 18:00
    360,   -- 6 godzin (18:00 - 00:00)
    100,   -- Max 100 uczestników
    80.00, -- 80 zł (kolacja + impreza)
    'Restauracja Unicorn Garden, Łódź',
    'scheduled',
    72,    -- Można anulować do 3 dni przed (72 godziny)
    true,  -- is_special_event
    '2026-11-01 00:00:00+01',  -- Zapisy od 1 listopada
    '2026-12-15 23:59:59+01'   -- Zapisy do 15 grudnia
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Successfully added 3 special events:';
  RAISE NOTICE '  1. Spływ kajakowy - Krutynia (12-14 czerwca 2026)';
  RAISE NOTICE '  2. Amsterdam Pride & City Trip (1-4 sierpnia 2026)';
  RAISE NOTICE '  3. Wigilia Unicorns 2026 (19 grudnia 2026)';

END $$;
