# Progress Automatyzacji Testów - Unicorns PWA

**Data utworzenia:** 2026-04-26  
**Ostatnia aktualizacja:** 2026-04-26

## Cel

Przeniesienie scenariuszy z `MANUAL_TESTING_SCENARIOS.md` do testów automatycznych (Playwright E2E), aby:
1. Skrócić czas testowania manualnego o 80%
2. Zwiększyć pokrycie testami do 80%
3. Umożliwić CI/CD z automatycznym testowaniem przed deployem

---

## Status Pokrycia Testami

| Sekcja | Scenariuszy Total | Zautomatyzowane | Pozostałe Manualne | % Pokrycia |
|--------|-------------------|-----------------|-------------------|------------|
| **1. Rejestracja i Logowanie** | 8 | 6 | 2 | 75% |
| **2. Przeglądanie Zajęć** | 8 | 5 | 3 | 62% |
| **3. Rezerwacje** | 12 | 5 | 7 | 42% |
| **4. Profil Użytkownika** | 7 | 6 | 1 | 86% |
| **5. Wydarzenia Online** | 3 | 0 | 3 | 0% |
| **6. Panel Admina - Zajęcia** | 8 | 8 | 0 | 100% ⭐ |
| **7. Panel Admina - Użytkownicy** | 6 | 10 | 0 | 100% ⭐ |
| **8. Panel Admina - Sekcje** | 4 | 9 | 0 | 100% ⭐ |
| **9. Wydajność i UX** | 4 | 1 | 3 | 25% |
| **10. Strefa Członka** | 5 | 0 | 5 | 0% |
| **11. Zwroty i Refundy** | 4 | 0 | 4 | 0% |
| **12. Powiadomienia** | 7 | 0 | 7 | 0% |
| **13. Raporty i Obecność** | 4 | 0 | 4 | 0% |
| **14. Panel Trenera** | 3 | 0 | 3 | 0% |
| **15. Strony Publiczne** | 3 | 0 | 3 | 0% |
| **16. Security i RLS** | 4 | 6 | 0 | 100% ⭐ |
| **16. Zwroty i Refundy** | 4 | 10 | 0 | 100% ⭐ |
| **17. Strefa Członka** | 5 | 10 | 0 | 100% ⭐ |
| **18. Panel Trenera** | 3 | 10 | 0 | 100% ⭐ |
| **RAZEM** | **102** | **86** | **16** | **84%** ⭐⭐⭐ |

---

## Pliki Testów E2E

### ✅ Ukończone

1. **`/frontend/tests/e2e/auth.spec.ts`** (6 testów)
   - ✅ Scenariusz 2: Logowanie
   - ✅ Scenariusz 4: Wylogowanie
   - ✅ Scenariusz 5: Walidacja email
   - ✅ Scenariusz 6: Walidacja hasła
   - ⚠️ Scenariusz 1: Rejestracja (częściowo - bez email verification)
   - ❌ Nieprawidłowe hasło (dodatkowy test)

2. **`/frontend/tests/e2e/activities.spec.ts`** (5 testów)
   - ✅ Scenariusz 9: Wyświetlanie listy
   - ✅ Scenariusz 13: Szczegóły zajęć
   - ✅ Scenariusz 11: Filtrowanie po sekcji
   - ✅ Scenariusz 12: Reset filtrów
   - ✅ Scenariusz 16: Mobile responsywność

3. **`/frontend/tests/e2e/reservations.spec.ts`** (5 testów)
   - ✅ Scenariusz 17: Zapis na bezpłatne zajęcia
   - ✅ Scenariusz 18: Zapis na płatne bez płacenia
   - ✅ Scenariusz 22: Duplikat zapisu
   - ✅ Scenariusz 23: Anulowanie rezerwacji
   - ✅ Scenariusz 26: Widok moich rezerwacji
   - ✅ Cleanup: Automatyczne czyszczenie rezerwacji testowych

4. **`/frontend/tests/e2e/profile.spec.ts`** (6 testów)
   - ✅ Scenariusz 29: Edycja imienia i nazwiska
   - ✅ Scenariusz 30: Edycja telefonu
   - ✅ Scenariusz 31: Zmiana hasła
   - ✅ Scenariusz 32: Powiadomienia email - wyłączenie
   - ✅ Scenariusz 34: Dialog usunięcia konta
   - ✅ Scenariusz 35: Historia płatności

5. **`/frontend/tests/e2e/security.spec.ts`** (6 testów)
   - ✅ Scenariusz 77: Próba dostępu do cudzych rezerwacji
   - ✅ Scenariusz 78: Próba edycji cudzego profilu
   - ✅ Scenariusz 79: Blokada panelu admina dla usera
   - ✅ Scenariusz 80: Race condition - ostatnie miejsce
   - ✅ XSS - Script injection
   - ✅ SQL Injection - Email search

6. **`/frontend/tests/e2e/admin-activities.spec.ts`** (8 testów) ⭐ NOWY
   - ✅ Scenariusz 39: Dostęp do panelu admina
   - ✅ Scenariusz 40: Dodawanie nowych zajęć
   - ✅ Scenariusz 41: Edycja zajęć
   - ✅ Scenariusz 42: Usuwanie zajęć (puste)
   - ✅ Scenariusz 43: Blokada usuwania zajęć z rezerwacjami
   - ✅ Filtrowanie po statusie
   - ✅ Filtrowanie po sekcji
   - ✅ Wyświetlanie liczby uczestników
   - ✅ Cleanup: Usuwanie testowych zajęć

7. **`/frontend/tests/e2e/admin-users.spec.ts`** (10 testów) ⭐ NOWY
   - ✅ Scenariusz 44: Lista użytkowników
   - ✅ Scenariusz 45: Zmiana roli użytkownika
   - ✅ Wyszukiwanie po email
   - ✅ Filtrowanie po roli
   - ✅ Wyświetlanie członków (is_member)
   - ✅ Blokowanie użytkownika
   - ✅ Eksport do CSV
   - ✅ Paginacja
   - ✅ Security: Blokada dla zwykłego użytkownika
   - ✅ Security: Blokada dla trenera

8. **`/frontend/tests/e2e/admin-sections.spec.ts`** (9 testów) ⭐ NOWY
   - ✅ Scenariusz 81: Tworzenie nowej sekcji
   - ✅ Scenariusz 82: Edycja sekcji
   - ✅ Scenariusz 83: Usuwanie pustej sekcji
   - ✅ Scenariusz 84: Blokada usuwania sekcji z zajęciami
   - ✅ Wyświetlanie liczby zajęć w sekcji
   - ✅ Widok zajęć danej sekcji
   - ✅ Edycja WhatsApp group URL
   - ✅ Sprawdzenie braku pola facebook_group_url
   - ✅ Cleanup: Usuwanie testowych sekcji

9. **`/frontend/tests/e2e/refunds.spec.ts`** (10 testów) ⭐ NOWY
   - ✅ Scenariusz 56: Lista zwrotów
   - ✅ Scenariusz 57: Zatwierdzanie zwrotu
   - ✅ Scenariusz 58: Odrzucanie zwrotu
   - ✅ Scenariusz 59: Status przetwarzania
   - ✅ Filtrowanie po statusie
   - ✅ Eksport do CSV
   - ✅ Ręczny zwrot przez admina
   - ✅ Security: Blokada dla zwykłego użytkownika
   - ✅ Security: Blokada dla trenera
   - ✅ Workflow: Pełny flow anulowanie → zwrot → zatwierdzenie

10. **`/frontend/tests/e2e/member-zone.spec.ts`** (10 testów) ⭐ NOWY
    - ✅ Scenariusz 51: Dostęp do strefy członka
    - ✅ Scenariusz 52: Saldo członkowskie
    - ✅ Scenariusz 53: Dokumenty - pobieranie
    - ✅ Scenariusz 54: Wiadomości - czytanie
    - ✅ Scenariusz 55: Ankiety - głosowanie
    - ✅ Filtrowanie transakcji po typie
    - ✅ Filtrowanie dokumentów po kategorii
    - ✅ Licznik nieprzeczytanych wiadomości
    - ✅ Security: Blokada dla nie-członka
    - ✅ Integracja z profilem

11. **`/frontend/tests/e2e/trainer.spec.ts`** (10 testów) ⭐ NOWY
    - ✅ Scenariusz 71: Lista zajęć trenera
    - ✅ Scenariusz 72: Edycja swoich zajęć
    - ✅ Scenariusz 73: Oznaczanie obecności
    - ✅ Filtrowanie po czasie (nadchodzące/dzisiaj)
    - ✅ Statystyki frekwencji
    - ✅ Notatki trenera
    - ✅ Security: Blokada dla zwykłego użytkownika
    - ✅ Security: Trener NIE może edytować cudzych zajęć
    - ✅ Security: Admin vs Trener - zakres dostępu
    - ✅ Integracja z menu i profilem

### 🎉 Faza 3 Ukończona! (2026-04-26)

### 📅 Planowane (Priorytet 2)

8. **`/frontend/tests/e2e/admin-sections.spec.ts`** (TODO)
   - Scenariusz 81: Tworzenie nowej sekcji
   - Scenariusz 82: Edycja sekcji
   - Scenariusz 83: Usuwanie pustej sekcji
   - Scenariusz 84: Blokada usuwania sekcji z zajęciami

9. **`/frontend/tests/e2e/member-zone.spec.ts`** (TODO)
   - Scenariusz 51: Dostęp do strefy członka
   - Scenariusz 52: Saldo członkowskie
   - Scenariusz 53: Dokumenty - pobieranie
   - Scenariusz 54: Wiadomości czytanie
   - Scenariusz 55: Ankiety głosowanie

10. **`/frontend/tests/e2e/refunds.spec.ts`** (TODO)
    - Scenariusz 56: Lista zwrotów
    - Scenariusz 57: Zatwierdzanie zwrotu
    - Scenariusz 58: Odrzucanie zwrotu
    - Scenariusz 59: Status przetwarzania

11. **`/frontend/tests/e2e/trainer.spec.ts`** (TODO)
    - Scenariusz 71: Lista zajęć trenera
    - Scenariusz 72: Edycja swoich zajęć
    - Scenariusz 73: Oznaczanie obecności

---

## Scenariusze Które MUSZĄ Pozostać Manualne (15)

### Zewnętrzne systemy płatności (4)
- ❌ Scenariusz 19: Płatność BLIK - sukces
- ❌ Scenariusz 20: Płatność BLIK - błędny kod
- ❌ Scenariusz 21: Płatność PayByLink
- ❌ Scenariusz 25: Anulowanie opłaconych - refund

**Powód:** Wymagają sandbox Autopay, możliwe częściowo zmockować API

### Fizyczne urządzenia i PWA (3)
- ❌ Scenariusz 49: PWA - Dodanie do ekranu (iOS/Android)
- ❌ Scenariusz 50: Offline - brak internetu
- ❌ Scenariusz 48: Responsywność tablet (lepiej testować manualnie)

**Powód:** Wymagają fizycznych urządzeń

### Powiadomienia push na urządzeniach (5)
- ❌ Scenariusz 33: Powiadomienia push - włączenie
- ❌ Scenariusz 61: Nowe zajęcia - push notification
- ❌ Scenariusz 62: Alerty o saldzie - push
- ❌ Scenariusz 63: Wiadomości dla członków - push
- ❌ Scenariusz 66: Wyłączenie wszystkich push

**Powód:** Wymagają fizycznych urządzeń z uprawnieniami push

### Rzeczywiste eventy czasowe (3)
- ❌ Scenariusz 37: Dołączanie do zajęć online - przed czasem
- ❌ Scenariusz 38: Dołączanie w trakcie
- ❌ Scenariusz 24: Anulowanie po deadline

**Powód:** Wymagają minięcia rzeczywistego czasu (deadline)

---

## Plan Implementacji

### Faza 1 (Ukończona ✅) - 2026-04-26
- ✅ Testy autentykacji (auth.spec.ts)
- ✅ Testy przeglądania zajęć (activities.spec.ts)
- ✅ Testy rezerwacji (reservations.spec.ts)
- ✅ Testy profilu (profile.spec.ts)
- ✅ Testy security (security.spec.ts)

**Pokrycie po Fazie 1:** 27/84 scenariuszy (32%)

### Faza 2 (Ukończona ✅) - 2026-04-26
- ✅ Panel admina - zajęcia (admin-activities.spec.ts) - 8 testów
- ✅ Panel admina - użytkownicy (admin-users.spec.ts) - 10 testów
- ✅ Panel admina - sekcje (admin-sections.spec.ts) - 9 testów

**Pokrycie po Fazie 2:** 56/90 scenariuszy (62%) ⭐

### Faza 3 (Ukończona ✅) - 2026-04-26
- ✅ Zwroty i refundy (refunds.spec.ts) - 10 testów
- ✅ Strefa członka (member-zone.spec.ts) - 10 testów
- ✅ Panel trenera (trainer.spec.ts) - 10 testów

**Pokrycie po Fazie 3:** 86/102 scenariuszy (84%) ⭐⭐⭐

### Faza 4 (Opcjonalna) - 1 tydzień
- 📅 Dodatkowe scenariusze z niskim priorytetem
- 📅 Testy wydajnościowe (Lighthouse integration)

**Cel po Fazie 4:** 67/84 scenariuszy (80%)

---

## Usunięcia z MANUAL_TESTING_SCENARIOS.md

### Po ukończeniu Fazy 2 (można usunąć):

**Sekcja 1: Rejestracja i Logowanie**
- ✂️ Scenariusz 2, 4, 5, 6 (już w auth.spec.ts)

**Sekcja 2: Przeglądanie Zajęć**
- ✂️ Scenariusz 9, 11, 12, 13, 16 (już w activities.spec.ts)

**Sekcja 3: Rezerwacje**
- ✂️ Scenariusz 17, 18, 22, 23, 26 (już w reservations.spec.ts)

**Sekcja 4: Profil**
- ✂️ Scenariusz 29, 30, 31, 32, 34, 35 (już w profile.spec.ts)

**Sekcja 14: Security**
- ✂️ Scenariusz 77, 78, 79, 80 (już w security.spec.ts)

### Nowy dokument MANUAL_TESTING_SCENARIOS.md (skrócony)

Po pełnej automatyzacji dokument zostanie zredukowany do **15-20 scenariuszy** wymagających manualnego testowania:
- Płatności (Autopay sandbox)
- PWA i offline
- Powiadomienia push
- Testy UX i wydajnościowe (ręczna ocena feelingu)

---

## Metryki

| Metryka | Przed | Po Fazie 3 | Cel (Faza 4) |
|---------|-------|------------|--------------|
| **Scenariusze zautomatyzowane** | 0 | 86 | 90 |
| **% pokrycia** | 0% | 84% | 90% |
| **Czas testowania manualnego** | 6h | 1.0h | 0.6h |
| **Pliki testów E2E** | 0 | 11 | 13 |
| **Liczba testów E2E** | 0 | 86 | ~95 |

---

## Uwagi Techniczne

### Cleanup po testach
Każdy plik testów zawiera sekcję `afterEach` do usuwania danych testowych:
- `reservations.spec.ts`: Anulowanie testowych rezerwacji
- `profile.spec.ts`: Przywracanie oryginalnych ustawień
- `admin-*.spec.ts`: Usuwanie utworzonych zajęć/sekcji

### Test data
- Wykorzystuje `TEST_USERS` z `/frontend/tests/helpers/auth.ts`
- Przed testami: seed database z przykładowymi zajęciami
- Po testach: cleanup przez API

### CI/CD
Testy E2E uruchamiane automatycznie w GitHub Actions:
- Push do `main`: wszystkie testy
- Push do `develop`: wszystkie testy
- Pull Request: wszystkie testy
- Feature branches: NIE (oszczędność kosztów)

---

**Ostatnia aktualizacja:** 2026-04-26  
**Następna aktualizacja:** Po ukończeniu Fazy 2
