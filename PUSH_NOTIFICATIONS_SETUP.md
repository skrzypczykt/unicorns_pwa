# Konfiguracja Push Notifications

Instrukcja konfiguracji powiadomień push dla aplikacji Unicorns PWA.

## 1. Wygeneruj VAPID Keys

VAPID keys są wymagane do wysyłania powiadomień push. Wygeneruj je używając:

```bash
# Zainstaluj web-push globalnie (jednorazowo)
npm install -g web-push

# Wygeneruj klucze
web-push generate-vapid-keys
```

Otrzymasz output podobny do:
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa...

Private Key:
bdSiGcHkkZ6pfvMYrWk3j9mhCp...

=======================================
```

## 2. Dodaj VAPID Keys do Frontend

Utwórz plik `frontend/.env` (skopiuj z `.env.example`):

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa...
```

⚠️ **UWAGA**: Dodaj `frontend/.env` do `.gitignore` aby nie commitować kluczy!

## 3. Dodaj VAPID Keys do Supabase Edge Functions

1. Otwórz Supabase Dashboard → Edge Functions → Settings
2. Dodaj zmienne środowiskowe:
   - `VAPID_PUBLIC_KEY` = Twój public key
   - `VAPID_PRIVATE_KEY` = Twój private key

LUB użyj Supabase CLI:

```bash
supabase secrets set VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv69yViEuiBIa..."
supabase secrets set VAPID_PRIVATE_KEY="bdSiGcHkkZ6pfvMYrWk3j9mhCp..."
```

## 4. Zastosuj Migrację Bazy Danych

Uruchom w Supabase SQL Editor:

```sql
-- Zawartość z supabase/migrations/007_push_notifications.sql
```

To utworzy:
- Tabelę `push_subscriptions` - tokeny push użytkowników
- Tabelę `push_notifications_log` - historia wysłanych powiadomień
- Funkcję `get_users_interested_in_activity_type()` - znajduje zainteresowanych użytkowników

## 5. Wdróż Edge Function

```bash
supabase functions deploy send-push-notifications
```

## 6. Aktualizuj Netlify Environment Variables

W Netlify Dashboard → Site settings → Environment variables dodaj:

```
VITE_VAPID_PUBLIC_KEY = BEl62iUYgUivxIkv69yViEuiBIa...
```

## 7. Testowanie

1. **Włącz powiadomienia jako użytkownik:**
   - Zaloguj się jako użytkownik
   - Przejdź do Profil → sekcja "Powiadomienia o nowych zajęciach"
   - Kliknij "Włącz" i wyrażaj zgodę

2. **Zapisz się na zajęcia:**
   - Przejdź do Zajęcia
   - Zapisz się na dowolne zajęcia (np. "Badminton")

3. **Utwórz nowe zajęcia jako admin:**
   - Zaloguj jako admin
   - Utwórz nowe zajęcia "Badminton" z inną datą
   - Użytkownik który zapisywał się na "Badminton" dostanie push!

## Jak To Działa

1. **Użytkownik włącza powiadomienia:**
   - Przeglądarka prosi o zgodę
   - Generowany jest token push
   - Token zapisywany w `push_subscriptions`

2. **Admin tworzy nowe zajęcia:**
   - System wywołuje Edge Function `send-push-notifications`
   - Funkcja znajduje użytkowników którzy zapisywali się na podobne zajęcia
   - Wysyła powiadomienia push do ich urządzeń

3. **Użytkownik otrzymuje powiadomienie:**
   - Service Worker przechwytuje push event
   - Wyświetla native notification
   - Kliknięcie otwiera aplikację na stronie zajęć

## Wspierane Przeglądarki

✅ **Chrome/Edge (Android)**
✅ **Firefox (Android)**
✅ **Samsung Internet**
❌ **Safari (iOS)** - iOS nie wspiera Web Push (dopiero iOS 16.4+, częściowo)
✅ **Safari (macOS)**

## Troubleshooting

### Powiadomienia nie działają

1. Sprawdź konsolę przeglądarki (`[PWA]` logi)
2. Sprawdź czy VAPID keys są poprawnie ustawione
3. Sprawdź czy aplikacja jest HTTPS (wymagane dla PWA)
4. Sprawdź czy service worker jest zarejestrowany

### Edge Function zwraca błąd

Sprawdź logi w Supabase Dashboard → Edge Functions → Logs

### Użytkownik nie dostaje powiadomień

1. Sprawdź czy użytkownik ma token w `push_subscriptions`
2. Sprawdź czy użytkownik zapisywał się na podobne zajęcia
3. Sprawdź `push_notifications_log` - czy wysłano?

## Rozwój Funkcjonalności

### Możliwe usprawnienia:

1. **Filtrowanie po activity_type_id** zamiast nazwy
2. **Scheduler** - powiadomienia przypominające (dzień przed zajęciami)
3. **Personalizacja** - użytkownik wybiera o jakich zajęciach chce wiedzieć
4. **Batching** - grupowanie powiadomień
5. **Rich notifications** - obrazki, przyciski akcji

## Bezpieczeństwo

- ✅ VAPID private key NIGDY nie trafia do frontendu
- ✅ Tokeny push przechowywane bezpiecznie w Supabase
- ✅ RLS policies chronią dostęp do tokenów
- ✅ Edge Function działa z SECURITY DEFINER
- ⚠️ Nie commituj `.env` do gita!
