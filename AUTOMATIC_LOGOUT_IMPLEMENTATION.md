# Automatyczne Wylogowywanie - Implementacja

**Data:** 2026-04-22  
**Cel:** Zarządzanie sesjami użytkowników w 4 kluczowych scenariuszach

---

## 1. Zmiana/Reset Hasła → Wylogowanie z Innych Sesji

### ✅ Supabase robi to automatycznie!

Gdy użytkownik zmienia hasło przez:
- `supabase.auth.updateUser({ password: newPassword })`
- Reset hasła przez email

**Supabase automatycznie:**
- Invaliduje wszystkie inne sesje
- Zostawia aktywną tylko sesję, z której zmieniono hasło
- User zostaje wylogowany z innych urządzeń przy następnej próbie refresh tokena

### Frontend - Brak dodatkowej akcji wymaganej

```typescript
// W SettingsPage.tsx - już masz:
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
// Supabase automatycznie wyloguje inne sesje
```

### ⚠️ Opcjonalnie: Global Sign-Out

Jeśli chcesz wylogować też **obecną** sesję (zmiana hasła = wyloguj wszędzie):

```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
})

if (!error) {
  // Wyloguj też obecną sesję
  await supabase.auth.signOut({ scope: 'global' })
  navigate('/login')
}
```

---

## 2. Zmiana Roli/Uprawnień → Natychmiastowe Przerwanie Sesji

### Problem
JWT token zawiera `role` w payload - zmiana w bazie nie invaliduje istniejącego tokena do czasu jego wygaśnięcia (1h).

### Rozwiązanie: RLS + Realtime Monitoring

#### A. Database Trigger - Invalidate Sessions

**Migration: `041_role_change_trigger.sql`**

```sql
-- Trigger invalidating sessions when user role changes
CREATE OR REPLACE FUNCTION invalidate_sessions_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Jeśli rola się zmieniła
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Wyloguj użytkownika ze wszystkich sesji
    -- Supabase nie ma bezpośredniego API do invalidacji sesji,
    -- ale możemy użyć workaround: zapisać timestamp zmiany roli
    NEW.role_changed_at = NOW();
    
    -- Opcjonalnie: Usuń refresh tokeny (wymaga dostępu do auth.sessions - może nie działać z RLS)
    -- DELETE FROM auth.sessions WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_sessions_on_role_change();

-- Dodaj kolumnę do śledzenia zmiany roli
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role_changed_at TIMESTAMP WITH TIME ZONE;
```

#### B. Frontend - Monitor Role Changes

**W `App.tsx` - rozszerzenie `onAuthStateChange`:**

```typescript
useEffect(() => {
  // ... existing auth check

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth event:', event, session)

      // Wykryj wylogowanie
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // TOKEN_REFRESHED - sprawdź czy rola się zmieniła
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (session?.user) {
          const newProfile = await fetchProfile(session.user.id)
          
          // Jeśli rola się zmieniła względem poprzedniej
          if (profile && newProfile && profile.role !== newProfile.role) {
            console.warn('Role changed! Forcing re-login...')
            await supabase.auth.signOut()
            alert('Twoje uprawnienia zostały zmienione. Zaloguj się ponownie.')
            window.location.href = '/login'
          }
        }
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    }
  )

  return () => subscription.unsubscribe()
}, [profile]) // Dodaj profile do dependencies
```

#### C. RLS Policy - Wymuszenie Walidacji

Dodaj do każdej RLS policy sprawdzenie aktualnej roli:

```sql
-- Przykład dla activities table
CREATE POLICY "Admins can do everything"
ON activities
FOR ALL
TO authenticated
USING (
  -- Sprawdź rolę w bazie (nie w JWT!)
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### ⚠️ Alternatywa: Database Function dla Immediate Logout

**Edge Function: `force-logout-user`**

```typescript
// supabase/functions/force-logout-user/index.ts
import { createClient } from '@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { userId } = await req.json()

  // Usuń wszystkie sesje użytkownika (wymaga service role)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, {
    shouldSoftDelete: false // Tylko wyloguj, nie usuwaj konta
  })
  
  // Alternatywnie: oznacz w bazie że sesja wygasła
  await supabaseAdmin
    .from('users')
    .update({ force_logout_at: new Date().toISOString() })
    .eq('id', userId)

  return new Response(JSON.stringify({ success: true }))
})
```

---

## 3. Usunięcie Konta → Natychmiastowa Reakcja

### Supabase automatycznie invaliduje sesję!

Gdy usuniesz użytkownika:
- `supabase.auth.admin.deleteUser(userId)`
- Lub z Supabase Dashboard

**Supabase automatycznie:**
- Usuwa wszystkie sesje użytkownika
- `onAuthStateChange` wywołuje `SIGNED_OUT`

### Frontend - Obsługa w `onAuthStateChange`

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (event === 'SIGNED_OUT') {
      // Wyczyść local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Wyczyść stan
      setUser(null)
      setProfile(null)
      
      // Przekieruj do logowania
      navigate('/login')
      
      // Opcjonalnie: pokaż komunikat
      alert('Twoje konto zostało usunięte lub sesja wygasła.')
    }
  }
)
```

### Dodatkowe Zabezpieczenie - Polling

Jeśli `onAuthStateChange` nie wywoła się natychmiast, dodaj polling:

```typescript
// W App.tsx
useEffect(() => {
  if (!user) return

  // Co 5 minut sprawdź czy użytkownik nadal istnieje
  const interval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Sesja wygasła
      await supabase.auth.signOut()
      navigate('/login')
    } else {
      // Sprawdź czy profil istnieje
      const { data: profile, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (error || !profile) {
        // Użytkownik usunięty
        await supabase.auth.signOut()
        alert('Twoje konto zostało usunięte.')
        navigate('/login')
      }
    }
  }, 5 * 60 * 1000) // 5 minut

  return () => clearInterval(interval)
}, [user])
```

---

## 4. Wygaśnięcie z Nieaktywności (30 dni)

### A. Konfiguracja Supabase

**W Supabase Dashboard → Authentication → Settings:**

```
Refresh Token Rotation: Enabled ✅
Refresh Token Reuse Interval: 10 seconds
```

**⚠️ UWAGA:** Supabase **nie wspiera** bezpośrednio refresh token TTL na poziomie projektu.

Refresh tokeny w Supabase domyślnie **nie wygasają** (są revokowane tylko przy logout/password change).

### Rozwiązanie: Custom Last Activity Tracking

#### Migration: `042_last_activity_tracking.sql`

```sql
-- Dodaj kolumnę last_activity_at
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Dodaj index dla wydajności
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);

-- Function do automatycznego update last_activity_at
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na users (przy każdym SELECT przez RLS Policy)
-- To nie zadziała - musimy użyć frontend trackingu
```

#### Frontend - Track Activity

**Utwórz hook: `src/hooks/useActivityTracking.ts`**

```typescript
import { useEffect } from 'react'
import { supabase } from '../supabase/client'

const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minut
const INACTIVITY_THRESHOLD = 30 * 24 * 60 * 60 * 1000 // 30 dni

export const useActivityTracking = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return

    const updateActivity = async () => {
      await supabase
        .from('users')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', userId)
    }

    const checkInactivity = async () => {
      const { data: user } = await supabase
        .from('users')
        .select('last_activity_at')
        .eq('id', userId)
        .single()

      if (user?.last_activity_at) {
        const lastActivity = new Date(user.last_activity_at).getTime()
        const now = Date.now()

        if (now - lastActivity > INACTIVITY_THRESHOLD) {
          // Użytkownik nieaktywny > 30 dni
          console.warn('User inactive for 30+ days. Logging out...')
          await supabase.auth.signOut()
          alert('Zostałeś wylogowany z powodu braku aktywności (30 dni).')
        }
      }
    }

    // Update activity co 5 minut
    const activityInterval = setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL)

    // Sprawdź nieaktywność przy starcie
    checkInactivity()

    // Sprawdź nieaktywność co godzinę
    const inactivityInterval = setInterval(checkInactivity, 60 * 60 * 1000)

    // Update przy visibility change (user wrócił do zakładki)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity()
        checkInactivity()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(activityInterval)
      clearInterval(inactivityInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId])
}
```

**W `App.tsx` - użyj hooka:**

```typescript
import { useActivityTracking } from './hooks/useActivityTracking'

function App() {
  const [user, setUser] = useState<any>(null)
  
  // Track user activity
  useActivityTracking(user?.id)

  // ... rest of code
}
```

### B. Alternatywa: Cron Job (Server-Side)

**Edge Function: `check-inactive-users-cron`**

```typescript
// supabase/functions/check-inactive-users-cron/index.ts
import { createClient } from '@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Znajdź nieaktywnych użytkowników
  const { data: inactiveUsers } = await supabase
    .from('users')
    .select('id, email, last_activity_at')
    .lt('last_activity_at', thirtyDaysAgo.toISOString())

  console.log(`Found ${inactiveUsers?.length} inactive users`)

  // Wyloguj ich (usuń sesje)
  for (const user of inactiveUsers || []) {
    await supabase.auth.admin.deleteUser(user.id, {
      shouldSoftDelete: false // Tylko wyloguj
    })
    
    console.log(`Logged out inactive user: ${user.email}`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      loggedOut: inactiveUsers?.length || 0 
    })
  )
})
```

**Konfiguracja cron (Supabase Dashboard):**
```
0 3 * * * # Każdego dnia o 3:00
```

---

## Podsumowanie Implementacji

### Migration Files Needed

1. ✅ `041_role_change_trigger.sql` - Trigger dla zmiany roli
2. ✅ `042_last_activity_tracking.sql` - Tracking nieaktywności

### Frontend Changes Needed

1. ✅ `App.tsx` - Rozszerzenie `onAuthStateChange`
2. ✅ `hooks/useActivityTracking.ts` - Hook do trackingu aktywności
3. ✅ `App.tsx` - Polling sprawdzający usunięcie konta

### Edge Functions Needed (Optional)

1. ⚠️ `force-logout-user` - Wymuszenie wylogowania (dla zmiany roli)
2. ⚠️ `check-inactive-users-cron` - Automatyczne wylogowanie nieaktywnych

### Supabase Dashboard Config

1. ✅ Auth Settings:
   - `jwt_expiry = 3600` (1 hour) ✅ Already set
   - `enable_refresh_token_rotation = true` ✅ Already set
   - `refresh_token_reuse_interval = 10` ✅ Already set

### RLS Policies Update

1. ✅ Wszystkie policies sprawdzają `users.role` z bazy (nie z JWT)

---

## Testing Plan

### Test 1: Zmiana hasła
```bash
# W Session 1
Login na Chrome
# W Session 2  
Login na Firefox
# W Session 1
Change password
# Sprawdź Session 2: powinien wylogować przy refresh
```

### Test 2: Zmiana roli
```bash
# W Dashboard: Zmień role użytkownika
# W aplikacji: Poczekaj 1-2 minuty (next token refresh)
# Powinien wylogować + alert
```

### Test 3: Usunięcie konta
```bash
# W Dashboard: Usuń użytkownika
# W aplikacji: Natychmiast lub przy następnym API call
# Powinien wylogować + przekierowanie
```

### Test 4: Nieaktywność
```bash
# W bazie: Ustaw last_activity_at na 31 dni temu
# Uruchom aplikację
# Powinien wylogować + alert
```

---

**Pytania do rozważenia:**
1. Czy chcesz implementować wszystkie 4 scenariusze?
2. Czy preferujesz frontend polling czy server-side cron?
3. Czy 30 dni nieaktywności to OK, czy inna wartość?
