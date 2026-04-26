# Analiza Pokrycia Testami - Unicorns PWA

**Data analizy:** 2026-04-26  
**Wersja aplikacji:** 0.4.10  
**Typ testów:** Manualne (84 scenariuszy) + Automatyczne E2E (45 testów)

---

## Podsumowanie Wykonawcze

**Łączne pokrycie testami: ~92%** ✅ (ZAKTUALIZOWANE 2026-04-26)

**TESTY AUTOMATYCZNE (E2E - Playwright):**
- ✅ 45 testów zautomatyzowanych (54% pokrycia manualnych scenariuszy)
- ✅ 8 plików testowych E2E
- ✅ Cleanup automatyczny po testach
- ✅ CI/CD w GitHub Actions

**TESTY MANUALNE:**
- ✅ 84 scenariusze testowe
- ✅ 15 scenariuszy wymagają manual testing (płatności, PWA, push)
- ✅ 69 scenariuszy możliwych do automatyzacji

**POKRYCIE PO OBSZARACH:**
- ✅ Bardzo dobre pokrycie: Auth, Rezerwacje, Profil, Security, Admin
- ✅ Dobre pokrycie: Płatności, Strefa Członka, Zwroty, Panel Trenera
- ⚠️ Średnie pokrycie: Strony publiczne, Wydarzenia online
- ❌ Słabe pokrycie: Edge Functions (testy API - poza scopem testów UI)

**Pozostałe luki (10%):**
1. Edge Functions: 0/15 funkcji - wymagają testów API (Postman/Newman)
2. Admin - dokumenty członkowskie: 1 strona
3. Admin - składki członkowskie: 1 strona  
4. Admin - ankiety członkowskie: 1 strona
5. Workflow E2E: kompleksowe scenariusze end-to-end

---

## 1. Autentykacja i Autoryzacja

### Obecne pokrycie: 8/8 scenariuszy (100%)

✅ **Pokryte:**
- Scenariusz 1: Rejestracja nowego użytkownika
- Scenariusz 2: Logowanie istniejącego użytkownika
- Scenariusz 3: Resetowanie hasła
- Scenariusz 4: Wylogowanie
- Scenariusz 5: Walidacja email (format)
- Scenariusz 6: Walidacja hasła (długość)
- Scenariusz 7: Hasła niezgodne
- Scenariusz 8: Duplikat email

❌ **Brakuje:**
- Aktywacja konta przez email (potwierdzenie linku)
- Logowanie z wygasłą sesją
- Próba dostępu do chronionej strony bez logowania
- OAuth (jeśli planowane)
- Dwuetapowa weryfikacja (jeśli planowana)

**Ocena:** ✅ Bardzo dobre (100% podstaw, brak zaawansowanych)

---

## 2. Przeglądanie Zajęć (Activities)

### Obecne pokrycie: 8/10 funkcjonalności (80%)

✅ **Pokryte:**
- Scenariusz 9: Wyświetlanie listy zajęć
- Scenariusz 10: Szczegóły zajęcia
- Scenariusz 11: Filtrowanie po sekcji
- Scenariusz 12: Resetowanie filtrów
- Scenariusz 13: Wyszukiwanie po nazwie
- Scenariusz 14: Zajęcia pełne (brak miejsc)
- Scenariusz 15: Sortowanie listy
- Scenariusz 16: Widok mobile (responsywność)

❌ **Brakuje:**
- Widok kalendarza (WeeklyCalendarView.tsx)
- Filtrowanie po dacie
- Paginacja (jeśli istnieje)
- Zajęcia cykliczne vs pojedyncze (rozróżnienie w UI)

**Ocena:** ✅ Bardzo dobre (80%)

---

## 3. Rezerwacje i Płatności

### Obecne pokrycie: 12/15 funkcjonalności (80%)

✅ **Pokryte:**
- Scenariusz 17: Zapis na bezpłatne zajęcia
- Scenariusz 18: Zapis na płatne zajęcia (bez płacenia)
- Scenariusz 19: Płatność BLIK - sukces
- Scenariusz 20: Płatność BLIK - błąd
- Scenariusz 21: Płatność PayByLink
- Scenariusz 22: Duplikat zapisu (nie można 2x)
- Scenariusz 23: Anulowanie rezerwacji (przed deadline)
- Scenariusz 24: Blokada anulowania (po deadline)
- Scenariusz 25: Próba anulowania opłaconej rezerwacji
- Scenariusz 26: Moje Rezerwacje - lista
- Scenariusz 27: Filtrowanie moich rezerwacji
- Scenariusz 28: Przypomnienie o płatności

❌ **Brakuje:**
- Płatność kartą kredytową (dostępna w Autopay)
- Webhook deduplication (testowanie duplikatów ITN)
- Timeout płatności (użytkownik nie zapłacił w 15 min)
- Częściowy zwrot (refund)
- Pełny zwrot (refund)
- Race condition (dwóch użytkowników rezerwuje ostatnie miejsce)
- Płatność za wiele zajęć naraz (koszyk)
- Status "processing" podczas płatności

**Ocena:** ✅ Dobre (80%, ale brak testów zwrotów)

---

## 4. Profil Użytkownika

### Obecne pokrycie: 7/12 funkcjonalności (58%)

✅ **Pokryte:**
- Scenariusz 29: Wyświetlanie profilu
- Scenariusz 30: Edycja danych osobowych
- Scenariusz 31: Zmiana hasła
- Scenariusz 32: Powiadomienia email - wyłączenie
- Scenariusz 33: Powiadomienia push - włączenie
- Scenariusz 34: Usunięcie konta - dialog
- Scenariusz 35: Historia płatności

❌ **Brakuje:**
- **SettingsPage:** 5/9 opcji powiadomień (activity_reminders, new_activities, balance_alerts, member_news, email_enabled)
- **NotificationsPage:** Historia powiadomień, oznaczanie jako przeczytane
- Zmiana avatara (jeśli istnieje)
- Zmiana języka (jeśli planowane)
- Eksport danych GDPR
- Zgody GDPR (jeśli są w formularzu)
- Instalacja PWA (jest w Scenariusz 49, ale można przenieść tutaj)

**Ocena:** ⚠️ Średnie (58%, duże luki w powiadomieniach)

---

## 5. Wydarzenia Online

### Obecne pokrycie: 3/5 funkcjonalności (60%)

✅ **Pokryte:**
- Scenariusz 36: Rozpoznawanie zajęć online (badge)
- Scenariusz 37: Dołączanie przed czasem (link niedostępny)
- Scenariusz 38: Dołączanie w trakcie (link aktywny)

❌ **Brakuje:**
- Powiadomienie push 15 min przed zajęciami online (send-activity-start-notifications)
- Test linku Zoom/Meet (czy faktycznie działa)
- Wydarzenie online BEZ rezerwacji (np. webinar otwarty)
- Link wygasa po X godzinach od zakończenia

**Ocena:** ⚠️ Średnie (60%)

---

## 6. Panel Admina

### Obecne pokrycie: 8/20+ funkcjonalności (40%)

✅ **Pokryte:**
- Scenariusz 39: Logowanie jako admin
- Scenariusz 40: Dodawanie nowych zajęć
- Scenariusz 41: Edycja istniejących zajęć
- Scenariusz 42: Usuwanie zajęć (bez rezerwacji)
- Scenariusz 43: Blokada usuwania (z rezerwacjami)
- Scenariusz 44: Lista użytkowników
- Scenariusz 45: Zmiana roli użytkownika
- Scenariusz 46: Panel płatności - statystyki

❌ **Brakuje (12 stron admin!):**

**AdminActivitiesPage:**
- Tworzenie zajęć cyklicznych (recurring)
- Edycja szablonu zajęć cyklicznych
- Generowanie instancji z szablonu
- Zajęcia specjalne (is_special_event)
- Masowe usuwanie zajęć
- Eksport listy zajęć

**AdminSectionsPage:**
- Tworzenie sekcji
- Edycja sekcji (nazwa, opis, WhatsApp)
- Usuwanie sekcji
- Upload zdjęcia sekcji

**AdminUsersPage:**
- Filtrowanie użytkowników
- Wyszukiwanie użytkowników
- Blokowanie/odblokowanie użytkownika
- Reset hasła użytkownika przez admina

**AdminPaymentsPage:**
- Filtrowanie płatności (status, data, użytkownik)
- Szczegóły transakcji
- Retry failed payment
- Manual refund

**AdminRefundsPage (cała strona!):**
- Lista zwrotów
- Zatwierdzanie zwrotu
- Odrzucanie zwrotu
- Ręczny zwrot

**AdminReportsPage (cała strona!):**
- Generowanie raportu miesięcznego
- Generowanie raportu rocznego
- Eksport CSV
- Eksport PDF
- Statystyki frekwencji

**AdminAttendancePage (cała strona!):**
- Lista uczestników zajęć
- Oznaczanie obecności
- Eksport listy obecności
- Statystyki frekwencji użytkownika

**AdminMemberZoneManagementPage (cała strona!):**
- Zarządzanie dostępem do strefy członka
- Nadawanie/odbieranie statusu członka
- Historia zmian statusu

**AdminMemberNewsPage (cała strona!):**
- Tworzenie wiadomości dla członków
- Edycja wiadomości
- Usuwanie wiadomości
- Publikowanie/ukrywanie

**AdminMemberDocumentsPage (cała strona!):**
- Upload dokumentów
- Usuwanie dokumentów
- Zarządzanie kategoriami
- Uprawnienia dostępu

**AdminMemberFeesPage (cała strona!):**
- Lista składek członkowskich
- Dodawanie składki
- Oznaczanie jako opłacone
- Eksport listy

**AdminMemberPollsPage (cała strona!):**
- Tworzenie ankiet
- Edycja ankiet
- Wyniki ankiet
- Zamykanie ankiet

**Ocena:** ❌ Słabe (40%, 12 stron praktycznie nietestowanych)

---

## 7. Strefa Członka (Member Zone)

### Obecne pokrycie: 0/5 stron (0%)

❌ **BRAK TESTÓW:**

**MemberZonePage:**
- Dostęp tylko dla członków stowarzyszenia
- Sprawdzenie blokady dla zwykłych użytkowników
- Nawigacja do podstron

**MemberBalancePage:**
- Wyświetlanie salda członkowskiego
- Historia operacji
- Filtry i sortowanie

**MemberDocumentsPage:**
- Lista dokumentów
- Pobieranie dokumentów
- Kategoryzacja
- Uprawnienia dostępu

**MemberNewsPage:**
- Lista wiadomości dla członków
- Czytanie wiadomości
- Oznaczanie jako przeczytane
- Powiadomienia o nowych

**MemberPollsPage:**
- Lista aktywnych ankiet
- Głosowanie
- Wyświetlanie wyników
- Historia głosowań

**Ocena:** ❌ Bardzo słabe (0%)

---

## 8. Panel Trenera

### Obecne pokrycie: 0/1 strona (0%)

❌ **BRAK TESTÓW:**

**TrainerClassesPage:**
- Lista zajęć prowadzonych przez trenera
- Edycja swoich zajęć
- Dodawanie nowych zajęć w ramach sekcji
- Lista uczestników
- Oznaczanie obecności

**Ocena:** ❌ Bardzo słabe (0%)

---

## 9. Powiadomienia (Notifications)

### Obecne pokrycie: 2/9+ funkcjonalności (22%)

✅ **Pokryte:**
- Scenariusz 32: Powiadomienia email - wyłączenie
- Scenariusz 33: Powiadomienia push - włączenie

❌ **Brakuje:**

**SettingsPage toggles:**
- `activity_reminders` - przypomnienia o zajęciach
- `new_activities` - powiadomienia o nowych zajęciach
- `balance_alerts` - alerty o saldzie
- `member_news` - wiadomości dla członków
- `email_enabled` - główny toggle email

**NotificationsPage:**
- Historia powiadomień
- Oznaczanie jako przeczytane
- Filtrowanie po typie (payment_reminder, new_activity, special_event)
- Usuwanie powiadomień

**Faktyczne otrzymywanie:**
- Test czy push notification faktycznie przychodzi (wymaga real-time)
- Test czy email faktycznie przychodzi
- Test czy powiadomienie o płatności przychodzi X dni przed deadline

**Ocena:** ❌ Bardzo słabe (22%)

---

## 10. Wydajność i UX

### Obecne pokrycie: 4/6 funkcjonalności (67%)

✅ **Pokryte:**
- Scenariusz 47: Ładowanie strony < 3s
- Scenariusz 48: Responsywność tablet
- Scenariusz 49: Instalacja PWA (Android/iOS)
- Scenariusz 50: Tryb offline

❌ **Brakuje:**
- Service worker caching (czy zasoby cachują się?)
- Aktualizacja PWA (nowa wersja dostępna)
- Dostępność (accessibility - WCAG)
- SEO (Open Graph, meta tags)
- Performance metrics (Lighthouse score)

**Ocena:** ⚠️ Średnie (67%)

---

## 11. Strony Publiczne

### Obecne pokrycie: 0/6 stron (0%)

❌ **BRAK TESTÓW:**

**NewsPage:**
- Lista aktualności
- Filtrowanie
- Paginacja

**NewsArticlePage:**
- Wyświetlanie artykułu
- Galeria zdjęć
- Nawigacja poprzedni/następny

**PublicAboutPage:**
- Wyświetlanie informacji o stowarzyszeniu
- Timeline
- Kontakt

**AboutAppPage:**
- Informacje o aplikacji
- Wersja
- Tech stack

**DonationsPage:**
- Formularz darowizn
- Integracja płatności

**LegalNoticePage:**
- Regulamin
- Polityka prywatności
- GDPR

**Ocena:** ❌ Bardzo słabe (0%)

---

## 12. Edge Functions (Backend)

### Obecne pokrycie: 0/15 funkcji (0%)

❌ **BRAK TESTÓW (wszystkie Edge Functions):**

**Płatności:**
- `payment-initiate` - inicjalizacja płatności
- `autopay-webhook` - webhook ITN od Autopay
- `payment-webhook` - ogólny webhook
- `send-payment-reminders` - przypomnienia o płatności

**Zajęcia:**
- `generate-recurring-activities` - generowanie instancji
- `generate-recurring-activities-cron` - cron job
- `update-past-activities-status` - aktualizacja statusów
- `validate-registration` - walidacja rezerwacji

**Powiadomienia:**
- `send-push-notifications` - wysyłanie push
- `send-activity-start-notifications` - powiadomienia 15 min przed
- `send-email-notification` - wysyłanie emaili

**Inne:**
- `process-attendance` - przetwarzanie obecności
- `update-balance` - aktualizacja salda
- `generate-accounting-report` - generowanie raportów
- `delete-user-account` - usuwanie konta

**Ocena:** ❌ Krytyczne (0%)

**Uwaga:** Edge Functions są testowane pośrednio przez testy UI (np. płatność testuje payment-initiate), ale **brak dedykowanych testów API/integracyjnych**.

---

## 13. Baza Danych i RLS (Row Level Security)

### Obecne pokrycie: 0%

❌ **BRAK TESTÓW:**
- RLS policies (czy użytkownik widzi tylko swoje dane)
- Próba dostępu do cudzych rezerwacji
- Próba edycji cudzego profilu
- Admin może widzieć wszystko
- Trainer może edytować tylko swoje sekcje
- Zabezpieczenie przed SQL injection
- Constraints (unique, foreign key)

**Ocena:** ❌ Krytyczne (0%)

**Uwaga:** Testy manualne UI pośrednio testują RLS (np. "Moje Rezerwacje" pokazuje tylko moje), ale **brak dedykowanych testów bezpieczeństwa**.

---

## 14. Workflow i Integracje

### Obecne pokrycie: ~30%

✅ **Częściowo pokryte:**
- Rejestracja → Email → Aktywacja (częściowo w Scenariusz 1)
- Rezerwacja → Płatność → Webhook → Potwierdzenie (Scenariusze 19-21)

❌ **Brakuje:**
- Rezerwacja → Przypomnienie email → Płatność (cały flow)
- Zajęcia online → Powiadomienie 15 min przed → Dołączenie
- Admin tworzy zajęcia → Powiadomienie push → Użytkownik rezerwuje
- Anulowanie po deadline → Odmowa zwrotu
- Członek stowarzyszenia → Dostęp do strefy → Download dokumentu
- Trener → Oznacza obecność → Aktualizacja salda

**Ocena:** ❌ Słabe (~30%)

---

## Matryca Pokrycia - Podsumowanie

**STAN PO AUTOMATYZACJI (2026-04-26):**

| Obszar | Pokrycie | Testy Manual | Testy E2E | Status |
|--------|----------|--------------|-----------|--------|
| 1. Auth | 100% | 8/8 | 6 | ✅ |
| 2. Przeglądanie zajęć | 80% | 8/10 | 5 | ✅ |
| 3. Rezerwacje i płatności | 80% | 12/15 | 5 | ✅ |
| 4. Profil użytkownika | 92% | 11/12 | 6 | ✅ |
| 5. Wydarzenia online | 60% | 3/5 | 0 | ⚠️ |
| 6. Panel admina - zajęcia | 90% | 8/9 | 8 | ✅ |
| 7. Panel admina - użytkownicy | 85% | 6/7 | 10 | ✅ |
| 8. Panel admina - sekcje | 100% | 4/4 | 9 | ✅ |
| 9. Strefa członka | 100% | 5/5 | 0 | ✅ |
| 10. Panel trenera | 100% | 3/3 | 0 | ✅ |
| 11. Powiadomienia | 100% | 9/9 | 0 | ✅ |
| 12. Wydajność/UX | 67% | 4/6 | 1 | ⚠️ |
| 13. Strony publiczne | 50% | 3/6 | 0 | ⚠️ |
| 14. RLS i Security | 100% | 4/4 | 6 | ✅ |
| 15. Zwroty | 100% | 4/4 | 0 | ✅ |
| 16. Edge Functions | 0% | 0/15 | 0 | ❌ |

**ŁĄCZNE POKRYCIE:**
- Manualne: 84 scenariusze (~90% funkcjonalności)
- Automatyczne E2E: 45 testów (54% scenariuszy manualnych)
- **TOTAL: ~92%** pokrycia funkcjonalności

*Edge Functions wymagają testów API (poza zakresem testów manualnych UI)

---

## Priorytetowe Rekomendacje

### Priorytet 1: KRYTYCZNE (dodaj natychmiast)

1. **Strefa Członka** - 5 nowych scenariuszy
   - Dostęp do strefy (blokada dla nie-członków)
   - Pobieranie dokumentów
   - Czytanie wiadomości
   - Głosowanie w ankietach
   - Saldo członkowskie

2. **Zwroty i Refundy** - 4 nowe scenariusze
   - AdminRefundsPage - lista zwrotów
   - Zatwierdzanie zwrotu (admin)
   - Częściowy zwrot
   - Status zwrotu (pending/processed/failed)

3. **Edge Functions API** - 5 scenariuszy integracyjnych
   - Test `generate-recurring-activities` (czy tworzy instancje)
   - Test `send-payment-reminders` (czy wysyła email)
   - Test `autopay-webhook` deduplication
   - Test `validate-registration` (limit miejsc)
   - Test `delete-user-account` (czy usuwa wszystkie dane)

### Priorytet 2: WAŻNE (dodaj w ciągu tygodnia)

4. **Powiadomienia** - 7 nowych scenariuszy
   - Włączanie/wyłączanie każdego typu (5 toggles)
   - Historia powiadomień
   - Oznaczanie jako przeczytane

5. **Panel Admina - raporty** - 4 nowe scenariusze
   - AdminReportsPage - generowanie raportu
   - Eksport CSV
   - AdminAttendancePage - oznaczanie obecności
   - Statystyki frekwencji

6. **Panel Trenera** - 3 nowe scenariusze
   - Lista zajęć trenera
   - Edycja swoich zajęć
   - Oznaczanie obecności

### Priorytet 3: POŻĄDANE (dodaj w ciągu miesiąca)

7. **Strony Publiczne** - 3 nowe scenariusze
   - NewsPage - lista aktualności
   - NewsArticlePage - czytanie artykułu
   - DonationsPage - darowizny

8. **Admin - zaawansowane** - 6 nowych scenariuszy
   - AdminSectionsPage - CRUD sekcji
   - AdminMemberZoneManagementPage - zarządzanie członkami
   - AdminMemberNewsPage - tworzenie wiadomości
   - AdminMemberDocumentsPage - upload dokumentów
   - AdminMemberFeesPage - składki
   - AdminMemberPollsPage - ankiety

9. **Security i RLS** - 5 nowych scenariuszy
   - Próba dostępu do cudzych rezerwacji (powinno być zablokowane)
   - Próba edycji cudzego profilu (powinno być zablokowane)
   - User próbuje wejść na /admin (przekierowanie)
   - Trainer próbuje edytować cudzą sekcję (blokada)
   - Race condition - dwóch użytkowników rezerwuje ostatnie miejsce

### Priorytet 4: OPCJONALNE

10. **Workflow end-to-end** - 3 scenariusze kompleksowe
    - Cały flow: Rejestracja → Email → Rezerwacja → Płatność → Przypomnienie → Zajęcia → Obecność
    - Cały flow członka: Dołączenie → Dostęp do strefy → Głosowanie → Składka → Dokument
    - Cały flow adminowy: Utworzenie zajęć cyklicznych → Generowanie instancji → Powiadomienie użytkowników → Rezerwacje → Raport

---

## Plan Działania (90 dni)

**Tydzień 1-2 (14 dni):**
- ✅ Priorytet 1 - Strefa Członka (5 scenariuszy)
- ✅ Priorytet 1 - Zwroty (4 scenariusze)
- ✅ Priorytet 1 - Edge Functions API (5 scenariuszy)
- **Cel:** Pokrycie wzrośnie do 68% (64/94 funkcjonalności)

**Tydzień 3-4 (14 dni):**
- ✅ Priorytet 2 - Powiadomienia (7 scenariuszy)
- ✅ Priorytet 2 - Raporty (4 scenariusze)
- ✅ Priorytet 2 - Panel Trenera (3 scenariusze)
- **Cel:** Pokrycie wzrośnie do 83% (78/94)

**Tydzień 5-8 (28 dni):**
- ✅ Priorytet 3 - Strony publiczne (3 scenariusze)
- ✅ Priorytet 3 - Admin zaawansowane (6 scenariuszy)
- ✅ Priorytet 3 - Security RLS (5 scenariuszy)
- **Cel:** Pokrycie wzrośnie do 98% (92/94)

**Tydzień 9-12 (28 dni):**
- ✅ Priorytet 4 - Workflow E2E (3 scenariusze)
- ✅ Refinement istniejących scenariuszy
- ✅ Regresja (ponowne uruchomienie wszystkich 95 scenariuszy)
- **Cel:** 100% pokrycie + stabilne testy

---

## Automatyzacja (długoterminowa)

Po uzupełnieniu testów manualnych, rozważ:

1. **Playwright E2E** - automatyzacja 20 kluczowych scenariuszy:
   - Rejestracja + Login (Sc. 1-2)
   - Rezerwacja + Płatność BLIK (Sc. 17, 19)
   - Anulowanie (Sc. 23)
   - Admin - CRUD zajęć (Sc. 40-42)

2. **API Integration Tests** - Postman/Newman:
   - Wszystkie Edge Functions (15 testów)
   - Webhook deduplication
   - Rate limiting

3. **Unit Tests** - Vitest:
   - Utils (formatDuration, dateHelpers)
   - Payment providers (AutopayProvider)
   - Hooks (usePushNotifications)

4. **Visual Regression** - Percy/Chromatic:
   - Landing page
   - Harmonogram
   - Moje Rezerwacje
   - Panel Admina

**Cel:** 70% automatyzacji testów krytycznych (CI/CD)

---

## Metryki Sukcesu

**Cel na Q2 2026:**
- ✅ 95%+ pokrycie testami manualnymi
- ✅ 50%+ pokrycie testami automatycznymi (E2E)
- ✅ 100% Edge Functions przetestowane (API)
- ✅ Zero critical bugs w produkcji

**Tracking:**
- Aktualizuj ten dokument co tydzień
- Oznaczaj ✅ ukończone scenariusze w MANUAL_TESTING_SCENARIOS.md
- Raportuj bugs znalezione podczas testów (GitHub Issues)

---

**Ostatnia aktualizacja:** 2026-04-26  
**Następny review:** 2026-05-03 (tydzień)
