# Test End-to-End - Strefa Członka

## Status: ✅ GOTOWE DO TESTOWANIA

## Checklist przed testami

### 1. Migracja bazy danych
- [ ] Migracja 019 została wykonana w Supabase Dashboard
- [ ] Wszystkie tabele zostały utworzone
- [ ] RLS policies są aktywne

### 2. Aplikacja uruchomiona
- [ ] `npm run dev` w katalogu frontend
- [ ] Aplikacja dostępna na localhost

---

## Test Flow 1: Admin tworzy ogłoszenie ✅

**Kroki:**
1. Zaloguj się jako admin
2. Wejdź na Dashboard → "📰 Ogłoszenia" (sekcja Strefa Członka - Admin)
3. Wypełnij formularz:
   - Tytuł: "Zebranie Zarządu - 25 kwietnia"
   - Treść: "Zapraszamy wszystkich członków na zebranie zarządu. Tematyka: budżet 2026, nowe zajęcia."
   - Data wygaśnięcia: 25.04.2026 18:00
   - Przypnij: TAK
4. Kliknij "➕ Dodaj ogłoszenie"

**Oczekiwany rezultat:**
- ✅ Alert "✅ Ogłoszenie dodane"
- ✅ Ogłoszenie pojawia się na liście z żółtym tłem (przypięte)
- ✅ Ma badge "📌 PRZYPIĘTE"

**Weryfikacja jako członek:**
5. Wyloguj się
6. Zaloguj jako użytkownik z `is_association_member = true`
7. Wejdź na Dashboard → "🏛️ Strefa Członka"
8. Sprawdź sekcję "Najnowsze ogłoszenia"

**Oczekiwany rezultat:**
- ✅ Ogłoszenie jest widoczne na pierwszym miejscu
- ✅ Ma ikonkę 📌 (przypięte)

---

## Test Flow 2: Członek głosuje ✅

**Kroki - Admin tworzy głosowanie:**
1. Zaloguj się jako admin
2. Wejdź na `/admin/member-polls`
3. Wypełnij formularz:
   - Tytuł: "Uchwała w sprawie budżetu na 2026"
   - Opis: "Czy zatwierdzasz budżet w wysokości 50 000 zł?"
   - Typ: Uchwała
   - Data zakończenia: 30.04.2026 23:59
   - Aktywne: TAK
   - Opcje:
     - "Za" (opcja 1)
     - "Przeciw" (opcja 2)
     - "Wstrzymuję się" (opcja 3)
4. Kliknij "➕ Utwórz głosowanie"

**Oczekiwany rezultat:**
- ✅ Alert "✅ Głosowanie utworzone"
- ✅ Głosowanie pojawia się na liście z zielonym tłem (aktywne)

**Kroki - Członek głosuje:**
5. Wyloguj się, zaloguj jako członek
6. Wejdź na `/member-zone/polls`
7. Znajdź głosowanie "Uchwała w sprawie budżetu na 2026"
8. Wybierz opcję "Za"
9. Kliknij "Głosuj"

**Oczekiwany rezultat:**
- ✅ Alert "✅ Głos został zapisany!"
- ✅ Formularz zamienia się w "Oddano głos na: Za"
- ✅ Pojawia się wykres słupkowy z wynikami
- ✅ Opcja "Za" jest podświetlona

**Weryfikacja duplikatów:**
10. Odśwież stronę
11. Spróbuj zagłosować ponownie

**Oczekiwany rezultat:**
- ✅ Przycisk "Głosuj" jest nieaktywny LUB
- ✅ Alert "⚠️ Już oddałeś głos w tym głosowaniu"

**Weryfikacja jako admin:**
12. Wyloguj się, zaloguj jako admin
13. Wejdź na `/admin/member-polls`
14. Kliknij "📊 Zobacz wyniki" przy tym głosowaniu

**Oczekiwany rezultat:**
- ✅ Widoczne wyniki w czasie rzeczywistym
- ✅ Za: 1 głos (100%)
- ✅ Przeciw: 0 głosów (0%)
- ✅ Wstrzymuję się: 0 głosów (0%)

---

## Test Flow 3: Admin nalicza składkę ✅

**Przygotowanie - Sprawdź czy jest activity_type "Członkostwo":**
1. Zaloguj się do Supabase Dashboard
2. Otwórz Table Editor → `activity_types`
3. Sprawdź czy istnieje wiersz z `name = 'Członkostwo'`
   - Jeśli nie, dodaj: `INSERT INTO activity_types (name, description) VALUES ('Członkostwo', 'Składki członkowskie stowarzyszenia');`

**Kroki - Admin nalicza składkę:**
1. Zaloguj się jako admin w aplikacji
2. Wejdź na `/admin/member-fees`
3. Znajdź członka na liście
4. Sprawdź jego aktualne saldo (powinno być 0.00 zł dla nowego członka)
5. Kliknij "⚡ Nalicz" przy tym członku
6. Potwierdź w oknie dialogowym

**Oczekiwany rezultat:**
- ✅ Alert "✅ Składka naliczona"
- ✅ Saldo członka zmienia się na -15.00 zł (plan miesięczny) lub -160.00 zł (plan roczny)
- ✅ Tekst salda jest czerwony
- ✅ W kolumnie "Ostatnie naliczenie" pojawia się dzisiejsza data

**Weryfikacja jako członek:**
7. Wyloguj się, zaloguj jako ten członek
8. Wejdź na `/member-zone`
9. Sprawdź widget "Twoja składka" w prawej kolumnie

**Oczekiwany rezultat:**
- ✅ Saldo: -15.00 zł lub -160.00 zł
- ✅ Status: "⚠️ Zaległość w składce" (czerwony)
- ✅ Data ostatniego naliczenia: dzisiejsza data

10. Kliknij "💰 Zarządzaj składką"
11. Sprawdź sekcję "Historia transakcji"

**Oczekiwany rezultat:**
- ✅ Widoczna transakcja typu "Naliczenie składki"
- ✅ Kwota: -15.00 zł lub -160.00 zł (czerwona)
- ✅ Data: dzisiejsza
- ✅ Saldo po operacji: -15.00 zł lub -160.00 zł

---

## Test Flow 4: Nie-członek próbuje wejść ✅

**Przygotowanie:**
1. Zaloguj się do Supabase Dashboard
2. Otwórz Table Editor → `users`
3. Znajdź użytkownika z `is_association_member = false`
   - Jeśli wszyscy są członkami, zmień jednego na `false`

**Kroki:**
1. Zaloguj się jako użytkownik z `is_association_member = false`
2. Wejdź na Dashboard (`/`)

**Oczekiwany rezultat:**
- ✅ NIE MA kafelka "🏛️ Strefa Członka"
- ✅ Widoczne tylko: Nadchodzące zajęcia, Moje rezerwacje, Profil

**Próba bezpośredniego wejścia:**
3. W przeglądarce wpisz URL: `http://localhost:5173/member-zone`

**Oczekiwany rezultat:**
- ✅ Przekierowanie na `/` LUB
- ✅ Biały ekran / 403 / 404

**Próba pobrania danych (DevTools):**
4. Otwórz DevTools → Console
5. Wykonaj:
```javascript
const { createClient } = supabase
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_ANON_KEY'
const client = createClient(supabaseUrl, supabaseKey)

const { data, error } = await client
  .from('association_news')
  .select('*')

console.log('Data:', data, 'Error:', error)
```

**Oczekiwany rezultat:**
- ✅ `data` jest pusta tablica `[]` LUB
- ✅ `error` zawiera komunikat o braku uprawnień
- ✅ Żadne dane nie są widoczne

---

## Test Flow 5: Admin dodaje dokument ✅

**Kroki:**
1. Zaloguj się jako admin
2. Wejdź na `/admin/member-documents`
3. Wypełnij formularz:
   - Tytuł: "Statut Stowarzyszenia Unicorns 2026"
   - Opis: "Obowiązujący od 1 stycznia 2026"
   - URL: https://drive.google.com/file/d/EXAMPLE
   - Kategoria: Statut
   - Rozmiar: 512 (KB)
4. Kliknij "➕ Dodaj dokument"

**Oczekiwany rezultat:**
- ✅ Alert "✅ Dokument dodany"
- ✅ Dokument pojawia się na liście w grid layout
- ✅ Ma fioletowy badge "Statut"
- ✅ Rozmiar "512 KB" jest widoczny

**Weryfikacja jako członek:**
5. Wyloguj się, zaloguj jako członek
6. Wejdź na `/member-zone/documents`
7. Sprawdź czy dokument jest widoczny

**Oczekiwany rezultat:**
- ✅ Dokument jest widoczny
- ✅ Badge "Statut" jest fioletowy
- ✅ Data dodania: dzisiejsza

8. Kliknij "Otwórz dokument"

**Oczekiwany rezultat:**
- ✅ Otwiera się nowa karta z linkiem (Google Drive)
- ✅ LUB pokazuje się alert o niepoprawnym linku (jeśli testowy URL)

---

## Test Flow 6: Zmiana planu składki ✅

**Kroki:**
1. Zaloguj się jako członek
2. Wejdź na `/member-zone/fees`
3. Sprawdź aktualny plan w sekcji "Plan składki"
4. Kliknij na drugi plan (np. jeśli masz Miesięczny, kliknij Roczny)

**Oczekiwany rezultat:**
- ✅ Alert "✅ Plan zmieniony na roczny" (lub miesięczny)
- ✅ Plan z checkmarkiem zmienia się
- ✅ Informacja "💡 Zmiana planu będzie uwzględniona przy następnym naliczeniu składki"

**Weryfikacja jako admin:**
5. Wyloguj się, zaloguj jako admin
6. Wejdź na `/admin/member-fees`
7. Znajdź tego członka

**Oczekiwany rezultat:**
- ✅ W kolumnie "Plan" widoczny jest nowy plan
- ✅ Select box pokazuje poprawny plan

---

## Test Flow 7: Bulk charge (Nalicz wszystkim) ✅

**Uwaga: Ten test zmienia saldo WSZYSTKICH członków!**

**Kroki:**
1. Zaloguj się jako admin
2. Wejdź na `/admin/member-fees`
3. Sprawdź liczbę członków (np. 5 członków)
4. Kliknij "⚡ Nalicz wszystkim"
5. Potwierdź w oknie dialogowym

**Oczekiwany rezultat:**
- ✅ Alert "✅ Naliczono składki: X udanych, 0 błędów"
- ✅ Wszyscy członkowie mają zaktualizowane saldo
- ✅ Miesięczni: saldo obniżone o 15 zł
- ✅ Roczni: saldo obniżone o 160 zł
- ✅ Wszystkie daty "Ostatnie naliczenie" są dzisiejsze

---

## Test Flow 8: Filtrowanie dokumentów ✅

**Kroki:**
1. Zaloguj się jako admin
2. Dodaj kilka dokumentów różnych kategorii:
   - Statut: "Statut 2026"
   - Uchwała: "Uchwała nr 1/2026"
   - Raport: "Sprawozdanie finansowe 2025"
   - Inne: "Prezentacja Unicorns"

**Jako członek:**
3. Zaloguj się jako członek
4. Wejdź na `/member-zone/documents`
5. Kliknij filtry w kolejności:
   - "Statut"
   - "Uchwały"
   - "Raporty"
   - "Inne"
   - "Wszystkie"

**Oczekiwany rezultat:**
- ✅ Każdy filtr pokazuje tylko dokumenty z tej kategorii
- ✅ Licznik w nawiasie jest poprawny (np. "Statut (1)")
- ✅ "Wszystkie" pokazuje wszystkie 4 dokumenty

---

## Test Flow 9: Zakładki Active/Archived w głosowaniach ✅

**Przygotowanie:**
1. Jako admin utwórz 2 głosowania:
   - Aktywne: data zakończenia za tydzień
   - Zakończone: data zakończenia wczoraj

**Kroki:**
1. Zaloguj się jako członek
2. Wejdź na `/member-zone/polls`
3. Sprawdź zakładkę "Aktywne"

**Oczekiwany rezultat:**
- ✅ Widoczne tylko aktywne głosowanie
- ✅ Licznik "Aktywne (1)"
- ✅ Można głosować

4. Kliknij zakładkę "Archiwalne"

**Oczekiwany rezultat:**
- ✅ Widoczne tylko zakończone głosowanie
- ✅ Licznik "Archiwalne (1)"
- ✅ NIE MOŻNA głosować (przycisk disabled lub brak formularza)
- ✅ Widoczne wyniki

---

## Test Flow 10: RLS - Członek nie widzi admin endpointów ✅

**Kroki:**
1. Zaloguj się jako członek (nie admin)
2. Spróbuj wejść na:
   - `/admin/member-news`
   - `/admin/member-polls`
   - `/admin/member-fees`

**Oczekiwany rezultat:**
- ✅ Przekierowanie na `/` LUB
- ✅ 403 / 404 / Access Denied

---

## Podsumowanie Testów

### Tabele do sprawdzenia:
- [ ] `activity_types` - wiersz "Członkostwo" istnieje
- [ ] `association_news` - utworzona, RLS aktywne
- [ ] `association_documents` - utworzona, RLS aktywne
- [ ] `association_polls` - utworzona, RLS aktywne
- [ ] `association_poll_options` - utworzona, RLS aktywne
- [ ] `association_poll_votes` - utworzona, RLS aktywne, UNIQUE constraint działa
- [ ] `user_section_balances` - balance dla Członkostwo działa
- [ ] `balance_transactions` - nowe typy (membership_fee_*) działają

### Funkcjonalności do przetestowania:
- [ ] Admin CRUD: News
- [ ] Admin CRUD: Documents
- [ ] Admin CRUD: Polls
- [ ] Admin: Naliczanie składek (pojedynczo)
- [ ] Admin: Naliczanie składek (bulk)
- [ ] Admin: Zmiana planu składki
- [ ] Członek: Przeglądanie aktualności
- [ ] Członek: Przeglądanie dokumentów
- [ ] Członek: Głosowanie (insert vote)
- [ ] Członek: Duplikat głosu (UNIQUE constraint)
- [ ] Członek: Widok wyników po głosowaniu
- [ ] Członek: Widok balance składki
- [ ] Członek: Zmiana planu składki
- [ ] Członek: Historia transakcji
- [ ] RLS: Nie-członek NIE widzi danych
- [ ] RLS: Członek NIE ma dostępu do admin stron
- [ ] Nawigacja: Kafelek "Strefa Członka" tylko dla członków
- [ ] Nawigacja: Admin menu "Strefa Członka - Admin"

---

## Krytyczne błędy do sprawdzenia:

1. **UNIQUE constraint na votes:**
   - Spróbuj zagłosować 2 razy → powinien być błąd
   
2. **RLS policies:**
   - Nie-członek nie widzi żadnych danych
   - Członek nie może edytować (tylko read)
   - Admin ma pełny dostęp
   
3. **Balance transactions immutable:**
   - Nie można usuwać/edytować transakcji
   - Tylko INSERT

4. **get_poll_results() function:**
   - Wyniki widoczne tylko dla:
     - Adminów (zawsze)
     - Członków którzy głosowali
     - Wszystkich po zakończeniu głosowania

---

## Status implementacji

✅ Database schema (019)
✅ TypeScript types
✅ Komponenty (4)
✅ Strony członków (5)
✅ Strony admin (4)
✅ Routing i nawigacja

⏳ Testy end-to-end (w trakcie)
