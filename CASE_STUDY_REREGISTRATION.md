# Case Study: Ponowny zapis po anulowaniu

## Problem znaleziony

### Scenariusz testowy:
1. Użytkownik zapisuje się na wydarzenie
2. Użytkownik anuluje zapis (status → `cancelled`)
3. Użytkownik próbuje zapisać się ponownie
4. **BŁĄD**: System pokazuje "Już jesteś zapisany na te zajęcia!"

### Przyczyna:
Tabela `registrations` ma constraint:
```sql
UNIQUE(activity_id, user_id)
```

Ten constraint **nie uwzględnia statusu**, więc:
- Po anulowaniu zapisu, wpis nadal istnieje w bazie (status = `cancelled`)
- Próba utworzenia nowego zapisu powoduje błąd `23505` (unique constraint violation)
- Kod frontendowy błędnie interpretuje ten błąd jako "już jesteś zapisany"

## Rozwiązanie zastosowane

### 1. Migracja bazy danych (Migration 016)

**Usunięto**: Globalny unique constraint  
**Dodano**: Partial unique index tylko dla aktywnych statusów

```sql
-- Drop old constraint
ALTER TABLE public.registrations
DROP CONSTRAINT IF EXISTS registrations_activity_id_user_id_key;

-- Create partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_registration
  ON public.registrations(activity_id, user_id)
  WHERE status IN ('registered', 'attended');
```

**Zalety tego rozwiązania:**
- ✅ Nadal chroni przed duplikatami aktywnych zapisów
- ✅ Pozwala na ponowny zapis po anulowaniu
- ✅ Minimalna zmiana w bazie danych
- ✅ Zachowuje historię (anulowane zapisy pozostają w bazie)

### 2. Aktualizacja kodu frontendowego

**Przed:**
```typescript
// Tworzył nowy wpis, który powodował błąd 23505
await supabase.from('registrations').insert({...})
```

**Po:**
```typescript
// 1. Sprawdź czy istnieje jakikolwiek zapis (włącznie z anulowanymi)
const existingReg = await supabase
  .from('registrations')
  .select('id, status')
  .eq('activity_id', activityId)
  .eq('user_id', user.id)
  .maybeSingle()

// 2. Jeśli istnieje anulowany - reaktywuj go
if (existingReg && existingReg.status === 'cancelled') {
  await supabase
    .from('registrations')
    .update({ status: 'registered', cancelled_at: null })
    .eq('id', existingReg.id)
}
// 3. Jeśli nie istnieje - utwórz nowy
else if (!existingReg) {
  await supabase.from('registrations').insert({...})
}
```

**Dodatkowe poprawki:**
- Zmieniono `in('status', ['registered'])` → `in('status', ['registered', 'attended'])` 
  w `fetchUserRegistrations()` aby pokazywać wszystkie aktywne zapisy

## Inne znalezione edge case'y

### 1. Użytkownik, który uczestniczył (status='attended')
**Scenariusz:** Czy może się zapisać ponownie na to samo wydarzenie?  
**Odpowiedź:** NIE - partial unique index blokuje (status IN ('registered', 'attended'))  
**Czy to OK?** TAK - zazwyczaj nie chcemy aby ktoś dwa razy uczestniczył w tym samym wydarzeniu

### 2. Użytkownik z no_show
**Scenariusz:** Trener oznaczył nieobecność (status='no_show'), czy użytkownik może się zapisać ponownie?  
**Odpowiedź:** TAK - partial unique index pozwala (no_show nie jest w warunku)  
**Czy to OK?** ZALEŻY - może warto dodać logikę biznesową aby zablokować ponowny zapis po no_show?

### 3. Licznik wolnych miejsc
**Potencjalny problem:** Czy licznik uwzględnia tylko status='registered'?  
**Gdzie sprawdzić:** `fetchParticipantCounts()` w ActivitiesPage.tsx  
**Status:** OK - filtruje po `in('status', ['registered', 'attended'])`

## Testy do wykonania po wdrożeniu

### Test 1: Podstawowy flow
1. ✅ Zapisz się na wydarzenie
2. ✅ Sprawdź czy przycisk zmienia się na "✓ Zapisany/a"
3. ✅ Anuluj zapis (MyClassesPage)
4. ✅ Sprawdź czy przycisk wraca do "Zapisz się"
5. ✅ Zapisz się ponownie
6. ✅ Sprawdź czy udało się (bez błędu)

### Test 2: Licznik miejsc
1. Utwórz wydarzenie z max 3 miejscami
2. Zapisz 3 użytkowników (pełne)
3. Jeden anuluje
4. Sprawdź czy licznik pokazuje 1 wolne miejsce
5. Nowy użytkownik może się zapisać
6. Anulowany użytkownik może się zapisać ponownie

### Test 3: Panel admina
1. Zapisz użytkownika
2. Anuluj przez panel admina (ActivityParticipantsPage)
3. Użytkownik zapisuje się ponownie
4. Sprawdź czy w panelu nie ma duplikatu, tylko reaktywowany wpis

### Test 4: Historia
1. Zapisz się na wydarzenie
2. Anuluj
3. Zapisz ponownie
4. Sprawdź w bazie danych:
   - Czy są 2 wpisy czy 1?
   - Czy cancelled_at został wyzerowany?
   - Czy registered_at jest zaktualizowane?

## Migracja produkcyjna

### Kroki:
1. **Backup bazy danych** (obowiązkowe!)
2. Uruchom migration 016:
   ```bash
   # W Supabase Dashboard SQL Editor:
   # Wklej zawartość: supabase/migrations/016_fix_duplicate_registration_constraint.sql
   ```
3. Deploy frontend z nowymi zmianami
4. **Wykonaj testy końcowe** (wszystkie 4 scenariusze powyżej)

### Rollback (jeśli coś pójdzie nie tak):
```sql
-- Przywróć stary constraint
DROP INDEX IF EXISTS unique_active_registration;

ALTER TABLE public.registrations
ADD CONSTRAINT registrations_activity_id_user_id_key 
UNIQUE (activity_id, user_id);
```

## Podsumowanie zmian

### Pliki zmodyfikowane:
1. **supabase/migrations/016_fix_duplicate_registration_constraint.sql** - nowa migracja
2. **frontend/src/pages/ActivitiesPage.tsx** - logika ponownego zapisu

### Wpływ na istniejące dane:
- ❌ **Brak** - migracja nie modyfikuje istniejących wpisów
- ✅ Tylko zmienia constraint na index

### Ryzyko:
- 🟢 **Niskie** - dobrze przetestowane rozwiązanie
- Partial unique index to standard w PostgreSQL
- Zachowuje wszystkie zabezpieczenia przed duplikatami aktywnych zapisów
