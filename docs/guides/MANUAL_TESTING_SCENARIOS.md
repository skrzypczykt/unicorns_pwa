# Scenariusze Testów Manualnych - Unicorns PWA

## Informacje Ogólne

**Przeznaczenie:** Ten dokument zawiera szczegółowe scenariusze testów dla osób nietechnicznych (testerzy, członkowie zespołu, rodzice-wolontariusze).

**Wersja:** Beta Testing v2.0  
**Data:** 2026-04-26  
**Środowisko testowe:** https://unicorns-test.netlify.app  
**Liczba scenariuszy:** 84 (rozszerzone pokrycie ~90%)

**Sekcje testowe:**
1. Rejestracja i Logowanie (8 scenariuszy)
2. Przeglądanie Zajęć (8 scenariuszy)
3. Rezerwacja Zajęć (12 scenariuszy)
4. Profil Użytkownika (7 scenariuszy)
5. Wydarzenia Online (3 scenariusze)
6. Panel Admina (8 scenariuszy)
7. Wydajność i UX (4 scenariusze)
8. **NOWE:** Strefa Członka (5 scenariuszy)
9. **NOWE:** Zwroty i Refundy (4 scenariusze)
10. **NOWE:** Powiadomienia - Rozszerzone (7 scenariuszy)
11. **NOWE:** Panel Admina - Raporty i Obecność (4 scenariusze)
12. **NOWE:** Panel Trenera (3 scenariusze)
13. **NOWE:** Strony Publiczne (3 scenariusze)
14. **NOWE:** Security i RLS (4 scenariusze)
15. **NOWE:** Admin - Zarządzanie Sekcjami (4 scenariusze)

---

## Oznaczenia Platform

Każdy scenariusz ma ikonkę oznaczającą wymagane urządzenie:

- **💻 Dowolne urządzenie** - Komputer, laptop, tablet lub telefon (Android/iOS)
- **📱 Telefon** - Wymaga telefonu (Android lub iOS)
- **🤖 Tylko Android** - Wymaga telefonu z systemem Android
- **🍎 Tylko iOS** - Wymaga iPhone'a lub iPada z iOS

## Jak Korzystać z Tego Dokumentu

### Dla testera:

1. **Przygotuj środowisko:**
   - Komputer, tablet lub telefon (sprawdź ikonkę przy scenariuszu)
   - Przeglądarka: Chrome, Safari, Firefox lub Edge
   - Notatnik do zapisywania problemów

2. **Dla każdego scenariusza:**
   - Sprawdź ikonkę urządzenia (💻/📱/🤖/🍎)
   - Przeczytaj cały scenariusz przed rozpoczęciem
   - Wykonaj kroki dokładnie w podanej kolejności
   - Zaznacz ✅ jeśli przeszedł, ❌ jeśli błąd
   - Jeśli błąd: zapisz co się stało + screenshot

3. **Zgłaszanie problemów:**
   - Email: skrzypczykt@gmail.com
   - Tytuł: "[TEST] Nazwa scenariusza - krótki opis problemu"
   - Treść: Kroki które wykonałeś, urządzenie, co się stało, screenshot

---

## SEKCJA 1: Rejestracja i Logowanie (Scenariusze 1-8)

### Scenariusz 1: Rejestracja Nowego Użytkownika 💻

**Urządzenie:** Dowolne (komputer, tablet, telefon)  
**Cel:** Sprawdzić czy nowy użytkownik może się zarejestrować.

**Wymagania wstępne:**
- Adres email który NIE był jeszcze używany w systemie

**Kroki:**
1. Wejdź na https://unicorns-test.netlify.app
2. Kliknij przycisk "Zaloguj się / Zarejestruj"
3. Kliknij "Nie masz konta? Zarejestruj się"
4. Wpisz email: twoj.email@gmail.com
5. Wpisz hasło: TestPassword123!
6. Wpisz jeszcze raz to samo hasło
7. Wpisz imię i nazwisko: Jan Kowalski
8. Zaznacz checkbox "Akceptuję regulamin"
9. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Widzisz komunikat "Sprawdź swoją skrzynkę email"
- ✅ Otrzymujesz email z linkiem aktywacyjnym (sprawdź spam!)
- ✅ Po kliknięciu w link w emailu jesteś przekierowany na stronę logowania
- ✅ Możesz się zalogować używając emaila i hasła

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 2: Logowanie Istniejącego Użytkownika 💻

**Urządzenie:** Dowolne (komputer, tablet, telefon)  
**Cel:** Sprawdzić czy zarejestrowany użytkownik może się zalogować.

**Wymagania wstępne:**
- Zarejestrowane konto (użyj Scenariusz 1)
- Email aktywowany przez link

**Kroki:**
1. Wejdź na stronę główną
2. Kliknij "Zaloguj się / Zarejestruj"
3. Wpisz swój email
4. Wpisz swoje hasło
5. Kliknij "Zaloguj się"

**Oczekiwany rezultat:**
- ✅ Widzisz stronę główną zalogowanego użytkownika
- ✅ W prawym górnym rogu widzisz swoje imię
- ✅ Menu ma opcje: Harmonogram, Moje Rezerwacje, Profil, Wyloguj

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 3: Resetowanie Hasła 💻

**Cel:** Sprawdzić czy użytkownik może zresetować zapomniane hasło.

**Wymagania wstępne:**
- Zarejestrowane konto

**Kroki:**
1. Na stronie logowania kliknij "Zapomniałeś hasła?"
2. Wpisz swój email
3. Kliknij "Wyślij link resetujący"
4. Sprawdź swoją skrzynkę email
5. Kliknij w link z emaila
6. Wpisz nowe hasło: NoweHaslo123!
7. Wpisz jeszcze raz to samo hasło
8. Kliknij "Zmień hasło"
9. Spróbuj się zalogować STARYM hasłem → powinno NIE działać
10. Zaloguj się NOWYM hasłem

**Oczekiwany rezultat:**
- ✅ Otrzymałeś email z linkiem resetującym
- ✅ Stare hasło NIE działa
- ✅ Nowe hasło działa poprawnie
- ✅ Jesteś zalogowany

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 4: Wylogowanie 💻

**Cel:** Sprawdzić czy użytkownik może się wylogować.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Będąc zalogowanym, kliknij swoje imię w prawym górnym rogu
2. Kliknij "Wyloguj"
3. Potwierdź wylogowanie

**Oczekiwany rezultat:**
- ✅ Widzisz stronę główną (niezalogowaną wersję)
- ✅ Przycisk "Zaloguj się" jest widoczny
- ✅ Twoje imię zniknęło z menu
- ✅ Próba wejścia na /my-classes przekierowuje na login

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 5: Walidacja Formularza Rejestracji - Email 💻

**Cel:** Sprawdzić czy system blokuje niepoprawne emaile.

**Wymagania wstępne:** Brak

**Kroki:**
1. Wejdź na formularz rejestracji
2. Wpisz niepoprawny email: "to-nie-jest-email"
3. Wpisz hasło: Test123!
4. Wpisz imię: Jan
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Widzisz błąd "Niepoprawny format email" LUB przycisk jest nieaktywny
- ✅ NIE możesz się zarejestrować

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 6: Walidacja Formularza - Hasło Za Krótkie 💻

**Cel:** Sprawdzić czy system wymaga minimum długości hasła.

**Wymagania wstępne:** Brak

**Kroki:**
1. Wejdź na formularz rejestracji
2. Wpisz email: test@test.com
3. Wpisz hasło: 123 (za krótkie)
4. Wpisz imię: Jan
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Widzisz błąd "Hasło musi mieć minimum 6 znaków"
- ✅ NIE możesz się zarejestrować

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 7: Walidacja - Hasła Nie Pasują 💻

**Cel:** Sprawdzić czy system wykrywa różne hasła.

**Wymagania wstępne:** Brak

**Kroki:**
1. Wejdź na formularz rejestracji
2. Wpisz email: test@test.com
3. Wpisz hasło: Test123!
4. Powtórz hasło: Test456! (inne!)
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Widzisz błąd "Hasła muszą być identyczne"
- ✅ NIE możesz się zarejestrować

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 8: Duplikat Email - Nie Można Użyć Tego Samego Email Dwukrotnie 💻

**Cel:** Sprawdzić że jeden email = jedno konto.

**Wymagania wstępne:**
- Istniejące konto (użyj tego samego emaila co w Scenariuszu 1)

**Kroki:**
1. Wejdź na formularz rejestracji
2. Wpisz email który JUŻ ISTNIEJE (ten sam co użyłeś w Scenariuszu 1)
3. Wpisz hasło: Test123!
4. Wpisz imię: Anna
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Widzisz błąd "Ten email jest już zarejestrowany"
- ✅ NIE możesz utworzyć drugiego konta

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 2: Przeglądanie Zajęć (Scenariusze 9-16)

### Scenariusz 9: Wyświetlanie Listy Zajęć 💻

**Cel:** Sprawdzić czy lista zajęć się ładuje.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Zaloguj się
2. Kliknij "Harmonogram" w menu
3. Poczekaj na załadowanie listy

**Oczekiwany rezultat:**
- ✅ Widzisz listę zajęć (minimum 5)
- ✅ Każde zajęcia mają: nazwę, datę, godzinę, cenę
- ✅ Widzisz zdjęcie dla każdej sekcji (Fitness, Dance, etc.)
- ✅ Strona ładuje się szybko (< 3 sekundy)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 10: Filtrowanie Zajęć Po Dacie 💻

**Cel:** Sprawdzić czy filtry działają.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Strona Harmonogram

**Kroki:**
1. Wejdź na Harmonogram
2. Kliknij filtr daty (kalendarz)
3. Wybierz jutrzejszą datę
4. Sprawdź czy lista się odświeżyła

**Oczekiwany rezultat:**
- ✅ Widzisz TYLKO zajęcia z wybranego dnia
- ✅ Jeśli brak zajęć: widzisz "Brak zajęć w tym dniu"
- ✅ Data w filtrze pokazuje wybrany dzień

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 11: Filtrowanie Po Sekcji 💻

**Cel:** Sprawdzić filtrowanie po typie zajęć.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Strona Harmonogram

**Kroki:**
1. Wejdź na Harmonogram
2. Kliknij filtr "Sekcja/Typ"
3. Wybierz "Fitness"
4. Sprawdź listę zajęć

**Oczekiwany rezultat:**
- ✅ Widzisz TYLKO zajęcia Fitness
- ✅ Inne typy (Dance, Yoga) NIE są widoczne
- ✅ Filtr pokazuje "Fitness" jako wybrany

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 12: Resetowanie Filtrów 💻

**Cel:** Sprawdzić przycisk "Wyczyść filtry".

**Wymagania wstępne:**
- Zalogowany użytkownik
- Harmonogram z aktywnymi filtrami

**Kroki:**
1. Ustaw filtr daty na jutro
2. Ustaw filtr sekcji na "Dance"
3. Kliknij "Wyczyść filtry" LUB "Pokaż wszystkie"
4. Sprawdź listę

**Oczekiwany rezultat:**
- ✅ Widzisz WSZYSTKIE zajęcia (bez filtrów)
- ✅ Filtr daty = "Wszystkie daty"
- ✅ Filtr sekcji = "Wszystkie sekcje"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 13: Szczegóły Zajęć 💻

**Cel:** Sprawdzić czy można zobaczyć więcej informacji o zajęciach.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Harmonogram

**Kroki:**
1. Wejdź na Harmonogram
2. Kliknij na kartę zajęć (dowolne)
3. Sprawdź wyświetlone informacje

**Oczekiwany rezultat:**
- ✅ Widzisz: nazwę, datę, godzinę, czas trwania
- ✅ Widzisz: cenę, limit miejsc, liczbę zapisanych
- ✅ Widzisz: opis zajęć (jeśli jest)
- ✅ Widzisz: przycisk "Zapisz się" (jeśli są miejsca)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 14: Zajęcia Pełne - Brak Miejsc 💻

**Cel:** Sprawdzić komunikat gdy zajęcia wypełnione.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się i znajdź lub stwórz zajęcia które są całkowicie wypełnione. Aby to sprawdzić:
1. Wejdź w "Harmonogram"
2. Przeglądaj listę zajęć i szukaj takiego, które ma licznik pokazujący "X/X" gdzie obie liczby są równe (np. "10/10", "12/12" - oznacza to że wszystkie miejsca są zajęte)
3. Jeśli NIE widzisz żadnych pełnych zajęć:
   - Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
   - Poproś o utworzenie testowych zajęć z małym limitem (np. 2 miejsca) i wypełnienie ich rezerwacjami
   - LUB jeśli masz uprawnienia admin, stwórz zajęcia z limitem 1 osoba i zapisz się na nie z drugiego konta
4. Zapamiętaj nazwę pełnych zajęć

**Kroki testowe:**
1. W zakładce "Harmonogram" znajdź zajęcia które są pełne (licznik "X/X", np. "10/10")
2. Kliknij na te zajęcia aby zobaczyć szczegóły
3. Sprawdź przycisk "Zapisz się" i komunikaty

**Oczekiwany rezultat:**
- ✅ Widzisz badge "Brak miejsc" LUB "Pełne"
- ✅ Przycisk "Zapisz się" jest nieaktywny (szary)
- ✅ Widzisz komunikat "Niestety wszystkie miejsca zajęte"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 15: Sortowanie Listy Zajęć 💻

**Cel:** Sprawdzić czy sortowanie działa.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Harmonogram

**Kroki:**
1. Wejdź na Harmonogram
2. Kliknij "Sortuj: Data" (lub podobny przycisk)
3. Zmień na "Sortuj: Nazwa" (jeśli dostępne)
4. Sprawdź listę

**Oczekiwany rezultat:**
- ✅ Lista sortuje się według daty (chronologicznie)
- ✅ Zmiana sortowania odświeża listę
- ✅ Zajęcia są w poprawnej kolejności

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 16: Mobile - Responsywność Harmonogramu 📱

**Urządzenie:** Telefon (Android lub iOS)  
**Cel:** Sprawdzić czy harmonogram działa na telefonie.

**Wymagania wstępne:**
- Telefon lub tablet
- Zalogowany użytkownik

**Kroki:**
1. Otwórz stronę na telefonie
2. Zaloguj się
3. Wejdź na Harmonogram
4. Przewiń listę w dół
5. Kliknij na zajęcia

**Oczekiwany rezultat:**
- ✅ Lista zajęć jest czytelna (nie wychodzi poza ekran)
- ✅ Karty zajęć są jedna pod drugą (nie obok siebie)
- ✅ Tekst jest dostatecznie duży do przeczytania
- ✅ Przyciski są łatwe do kliknięcia (nie za małe)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 3: Rezerwacja Zajęć (Scenariusze 17-28)

### Scenariusz 17: Zapis na Bezpłatne Zajęcia 💻

**Cel:** Sprawdzić proces zapisu na darmowe zajęcia.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się i znajdź lub stwórz bezpłatne zajęcia. Aby to sprawdzić:
1. Wejdź w "Harmonogram"
2. Poszukaj zajęć które mają cenę "0 zł" lub "Bezpłatne"
3. Upewnij się że te zajęcia mają wolne miejsca (licznik np. "3/10" - nie "10/10")
4. Jeśli NIE widzisz żadnych bezpłatnych zajęć z wolnymi miejscami:
   - Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
   - Poproś o utworzenie testowych bezpłatnych zajęć (cena 0 zł)
   - LUB jeśli masz uprawnienia admin, stwórz takie zajęcia w Panelu Admina (ustaw cenę na 0 zł)
5. Upewnij się że NIE jesteś jeszcze zapisany na te bezpłatne zajęcia (sprawdź w "Moje Rezerwacje")

**Kroki testowe:**
1. Wejdź na "Harmonogram"
2. Znajdź zajęcia bezpłatne (cena = 0 zł) z wolnymi miejscami
3. Kliknij na te zajęcia aby zobaczyć szczegóły
4. Kliknij przycisk "Zapisz się"
5. Jeśli pojawia się dialog potwierdzenia, zatwierdź zapis

**Oczekiwany rezultat:**
- ✅ Widzisz komunikat "Zapisano na zajęcia!"
- ✅ Zajęcia pojawiają się w "Moje Rezerwacje"
- ✅ NIE było procesu płatności (bezpłatne)
- ✅ Liczba zapisanych +1 (np. było 5/10, teraz 6/10)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 18: Zapis na Płatne Zajęcia (Bez Płacenia) 💻

**Cel:** Sprawdzić czy można się zapisać bez natychmiastowej płatności.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Zajęcia PŁATNE (np. 47 zł) z wolnymi miejscami

**Kroki:**
1. Wejdź na Harmonogram
2. Znajdź zajęcia płatne (47 zł)
3. Kliknij "Zapisz się"
4. Potwierdź zapis
5. NIE PŁAĆ (zamknij modal płatności jeśli się pojawi)
6. Wejdź w "Moje Rezerwacje"

**Oczekiwany rezultat:**
- ✅ Zapisałeś się na zajęcia
- ✅ W "Moje Rezerwacje" widzisz te zajęcia
- ✅ Status płatności: "Nieopłacone" LUB "Oczekuje na płatność"
- ✅ Przycisk "Opłać" jest widoczny

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 19: Płatność BLIK - Sukces 💻

**Cel:** Sprawdzić płatność BLIK (kod testowy 111112).

**Wymagania wstępne:**
- Zalogowany użytkownik
- Nieopłacona rezerwacja (Scenariusz 18)

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Znajdź nieopłacone zajęcia
3. Kliknij "Opłać"
4. Wybierz metodę: "BLIK"
5. Wpisz kod: 111112 (testowy kod sukcesu)
6. Kliknij "Zapłać"
7. Poczekaj na przekierowanie (może pojawić się strona Autopay)
8. Poczekaj na powrót do aplikacji

**Oczekiwany rezultat:**
- ✅ Widzisz stronę "Płatność potwierdzona!" z zielonym ✅
- ✅ Szczegóły płatności: nazwa zajęć, kwota, data
- ✅ W "Moje Rezerwacje" status = "Opłacone" ✅
- ✅ Przycisk "Opłać" zniknął

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 20: Płatność BLIK - Błędny Kod 💻

**Cel:** Sprawdzić obsługę błędnego kodu BLIK.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Nieopłacona rezerwacja

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Kliknij "Opłać"
3. Wybierz "BLIK"
4. Wpisz kod: 111121 (testowy kod błędu)
5. Kliknij "Zapłać"
6. Poczekaj

**Oczekiwany rezultat:**
- ✅ Po ~30-60 sekundach widzisz stronę "Problem z płatnością" ❌
- ✅ Komunikat: "Nieprawidłowy kod BLIK" LUB podobny
- ✅ Przycisk "Spróbuj ponownie"
- ✅ Rezerwacja nadal nieopłacona

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 21: Płatność PayByLink (Przelew) 💻

**Cel:** Sprawdzić płatność przelewem online.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Nieopłacona rezerwacja

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Kliknij "Opłać"
3. Wybierz "Szybki przelew online" (PayByLink)
4. Kliknij "Zapłać"
5. Na stronie Autopay wybierz "TEST 106" (bank testowy)
6. Kliknij "Zapłać" na stronie banku
7. Poczekaj na powrót

**Oczekiwany rezultat:**
- ✅ Zostałeś przekierowany do Autopay
- ✅ Wybór banku działa
- ✅ Po kliknięciu "Zapłać" → powrót do aplikacji
- ✅ Widzisz "Płatność potwierdzona!" ✅
- ✅ Status zmienił się na "Opłacone"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 22: Duplikat Zapisu - Nie Można Zapisać Się Dwukrotnie 💻

**Cel:** Sprawdzić że nie można się zapisać 2x na te same zajęcia.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na swoje konto użytkownika i upewnij się, że jesteś zapisany na przynajmniej jedne nadchodzące zajęcia. Aby to sprawdzić:
1. Wejdź w menu "Moje Rezerwacje"
2. Sprawdź czy widzisz jakąkolwiek rezerwację na przyszłe zajęcia
3. Jeśli NIE widzisz żadnych rezerwacji:
   - Wejdź w "Harmonogram"
   - Znajdź dowolne zajęcia w przyszłości (jutro lub później)
   - Kliknij "Zapisz się" i potwierdź
   - Wróć do "Moje Rezerwacje" i zapamiętaj nazwę i datę tych zajęć

**Kroki testowe:**
1. Wejdź na "Harmonogram"
2. Znajdź zajęcia na które JUŻ JESTEŚ ZAPISANY (te same co w Moich Rezerwacjach)
3. Kliknij na nie aby zobaczyć szczegóły
4. Sprawdź co widać przy przycisku zapisu

**Oczekiwany rezultat:**
- ✅ Przycisk "Zapisz się" jest nieaktywny LUB nie istnieje
- ✅ Widzisz badge "Już zapisany" LUB podobny komunikat
- ✅ NIE możesz się zapisać drugi raz

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 23: Anulowanie Rezerwacji (Przed Deadline) 💻

**Cel:** Sprawdzić anulowanie rezerwacji w terminie.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na swoje konto użytkownika i upewnij się, że masz nieopłaconą rezerwację na zajęcia w przyszłości. Aby to sprawdzić:
1. Wejdź w menu "Moje Rezerwacje"
2. Sprawdź czy widzisz jakąkolwiek rezerwację ze statusem "Nieopłacone" na zajęcia jutro lub później
3. Jeśli NIE widzisz takiej rezerwacji:
   - Wejdź w "Harmonogram"
   - Znajdź zajęcia jutro lub za kilka dni
   - Kliknij "Zapisz się" i potwierdź
   - NIE płać za te zajęcia
   - Wróć do "Moje Rezerwacje" - powinieneś zobaczyć nową rezerwację ze statusem "Nieopłacone"
4. Upewnij się, że deadline anulowania NIE minął (np. jeśli zajęcia są jutro o 18:00, deadline to zwykle dzisiaj do 18:00)

**Kroki testowe:**
1. W zakładce "Moje Rezerwacje" znajdź nieopłaconą rezerwację
2. Sprawdź czy widzisz informację o deadline (np. "Możesz anulować do: 26.04 17:00")
3. Upewnij się że deadline NIE minął (obecny czas < deadline)
4. Kliknij "Anuluj rezerwację"
5. Potwierdź anulowanie w dialogu

**Oczekiwany rezultat:**
- ✅ Widzisz pytanie "Czy na pewno chcesz anulować?"
- ✅ Po potwierdzeniu: "Rezerwacja anulowana"
- ✅ Rezerwacja znika z "Moje Rezerwacje" LUB status = "Anulowane"
- ✅ Miejsce na zajęciach zwolniło się (było 6/10, teraz 5/10)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 24: Anulowanie Po Deadline - Blokada 💻

**Cel:** Sprawdzić że nie można anulować po deadline.

**Wymagania wstępne:**
- Rezerwacja z minionym deadline (np. deadline był wczoraj)

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Znajdź rezerwację gdzie deadline minął
3. Sprawdź czy przycisk "Anuluj" jest dostępny

**Oczekiwany rezultat:**
- ✅ Przycisk "Anuluj" NIE istnieje LUB jest nieaktywny (szary)
- ✅ Widzisz komunikat "Termin anulowania minął" LUB "Klamka zapadła"
- ✅ NIE możesz anulować

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 25: Anulowanie Opłaconych Zajęć - Blokada 💻

**Cel:** Sprawdzić że nie można anulować zajęć które są opłacone.

**Wymagania wstępne:**
- Opłacona rezerwacja (status = "Opłacone")

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Znajdź opłacone zajęcia
3. Sprawdź przyciski

**Oczekiwany rezultat:**
- ✅ Przycisk "Anuluj" NIE istnieje
- ✅ Widzisz komunikat "Rezerwacja opłacona - skontaktuj się aby anulować"
- ✅ NIE możesz samodzielnie anulować

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 26: Widok Moich Rezerwacji - Chronologia 💻

**Cel:** Sprawdzić sortowanie w "Moje Rezerwacje".

**Wymagania wstępne:**
- Zalogowany użytkownik z minimum 3 rezerwacjami (różne daty)

**Kroki:**
1. Zaloguj się
2. Kliknij "Moje Rezerwacje" w menu
3. Sprawdź kolejność listy

**Oczekiwany rezultat:**
- ✅ Rezerwacje są posortowane od NAJBLIŻSZYCH do najdalszych
- ✅ Zajęcia dzisiaj/jutro są na górze
- ✅ Zajęcia za tydzień są niżej
- ✅ Przeszłe zajęcia są na końcu LUB w osobnej sekcji

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 27: Termin Płatności - Przypomnienie 💻

**Cel:** Sprawdzić komunikat o zbliżającym się deadline płatności.

**Wymagania wstępne:**
- Nieopłacona rezerwacja z deadline płatności jutro

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Znajdź nieopłaconą rezerwację
3. Sprawdź czy widzisz termin płatności

**Oczekiwany rezultat:**
- ✅ Widzisz "⏰ Termin płatności: [data]"
- ✅ Jeśli blisko: wyróżnienie (pomarańczowy/czerwony)
- ✅ Przycisk "Opłać" jest dobrze widoczny

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 28: Wydarzenia Specjalne - Zapis 💻

**Cel:** Sprawdzić zapis na wydarzenia specjalne (bez trenera).

**Wymagania wstępne:**
- Zalogowany użytkownik
- Wydarzenie specjalne w harmonogramie (np. "Pokaz taneczny")

**Kroki:**
1. Wejdź na Harmonogram
2. Znajdź wydarzenie specjalne (badge "🎉 Wydarzenie")
3. Kliknij na nie
4. Kliknij "Zapisz się"

**Oczekiwany rezultat:**
- ✅ Zapis działa tak samo jak zwykłe zajęcia
- ✅ Badge "🎉 Wydarzenie specjalne" jest widoczny
- ✅ Rezerwacja pojawia się w "Moje Rezerwacje"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 4: Profil Użytkownika (Scenariusze 29-35)

### Scenariusz 29: Edycja Profilu - Imię i Nazwisko 💻

**Cel:** Sprawdzić edycję danych profilu.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Kliknij swoje imię → "Profil"
2. Znajdź sekcję "Dane osobowe"
3. Zmień imię z "Jan" na "Janusz"
4. Zmień nazwisko z "Kowalski" na "Nowak"
5. Kliknij "Zapisz zmiany"
6. Wyloguj się
7. Zaloguj się ponownie
8. Sprawdź menu

**Oczekiwany rezultat:**
- ✅ Widzisz komunikat "Profil zaktualizowany"
- ✅ Po ponownym zalogowaniu widzisz "Janusz Nowak"
- ✅ Zmiany zostały zapisane

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 30: Edycja Profilu - Telefon 💻

**Cel:** Sprawdzić dodawanie numeru telefonu.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Wejdź w Profil
2. Znajdź pole "Telefon"
3. Wpisz: +48 123 456 789
4. Kliknij "Zapisz"
5. Odśwież stronę (F5)

**Oczekiwany rezultat:**
- ✅ Numer telefonu został zapisany
- ✅ Po odświeżeniu nadal widoczny
- ✅ Format jest poprawny (+48 xxx xxx xxx)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 31: Zmiana Hasła 💻

**Cel:** Sprawdzić zmianę hasła z poziomu profilu.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Wejdź w Profil
2. Kliknij "Zmień hasło"
3. Wpisz stare hasło
4. Wpisz nowe hasło: NoweHaslo456!
5. Powtórz nowe hasło
6. Kliknij "Zmień"
7. Wyloguj się
8. Zaloguj nowym hasłem

**Oczekiwany rezultat:**
- ✅ Widzisz "Hasło zmienione pomyślnie"
- ✅ Stare hasło NIE działa
- ✅ Nowe hasło działa

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 32: Powiadomienia Email - Wyłączenie 💻

**Cel:** Sprawdzić ustawienia powiadomień email.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Wejdź w Profil → Ustawienia powiadomień
2. Znajdź checkbox "Powiadomienia email o nowych zajęciach"
3. Odznacz (wyłącz)
4. Kliknij "Zapisz"
5. Odśwież stronę

**Oczekiwany rezultat:**
- ✅ Ustawienie zostało zapisane
- ✅ Checkbox nadal odznaczony po odświeżeniu
- ✅ Nie będziesz otrzymywać emaili o nowych zajęciach

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 33: Powiadomienia Push - Włączenie 💻

**Cel:** Sprawdzić włączanie powiadomień push.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Przeglądarka wspierająca push (Chrome/Firefox)

**Kroki:**
1. Wejdź w Profil → Powiadomienia
2. Kliknij "Włącz powiadomienia push"
3. Zaakceptuj w oknie przeglądarki
4. Sprawdź status

**Oczekiwany rezultat:**
- ✅ Przeglądarka pyta o pozwolenie
- ✅ Po zaakceptowaniu: "Powiadomienia push włączone" ✅
- ✅ Widzisz "Status: Aktywne"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 34: Usunięcie Konta - Dialog Potwierdzenia 💻

**Cel:** Sprawdzić czy jest zabezpieczenie przed przypadkowym usunięciem konta.

**Wymagania wstępne:**
- Zalogowany użytkownik

**Kroki:**
1. Wejdź w Profil
2. Przewiń na dół do sekcji "Strefa niebezpieczna"
3. Kliknij "Usuń konto"
4. **NIE POTWIERDZAJ** - kliknij "Anuluj"

**Oczekiwany rezultat:**
- ✅ Widzisz dialog "Czy na pewno chcesz usunąć konto?"
- ✅ Ostrzeżenie: "Ta operacja jest nieodwracalna"
- ✅ Po kliknięciu "Anuluj" konto NIE zostało usunięte
- ✅ Nadal jesteś zalogowany

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 35: Historia Płatności 💻

**Cel:** Sprawdzić widok historii transakcji.

**Wymagania wstępne:**
- Zalogowany użytkownik z minimum 1 opłaconą rezerwacją

**Kroki:**
1. Wejdź w Profil
2. Kliknij zakładkę "Historia płatności" LUB "Transakcje"
3. Sprawdź listę

**Oczekiwany rezultat:**
- ✅ Widzisz listę transakcji
- ✅ Każda transakcja ma: datę, opis, kwotę, status
- ✅ Status "Opłacone" ✅ jest zielony
- ✅ Status "Oczekuje" ⏳ jest pomarańczowy

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 5: Wydarzenia Online (Scenariusze 36-38)

### Scenariusz 36: Zapis na Wydarzenie Online 💻

**Cel:** Sprawdzić zapis na zajęcia online (Zoom/Meet).

**Wymagania wstępne:**
- Zalogowany użytkownik
- Wydarzenie online w harmonogramie (badge "🌐 Online")

**Kroki:**
1. Znajdź zajęcia z badge "🌐 Online"
2. Kliknij "Zapisz się"
3. Potwierdź zapis

**Oczekiwany rezultat:**
- ✅ Zapis przebiegł pomyślnie
- ✅ W "Moje Rezerwacje" widzisz badge "🌐 Online"
- ✅ Widzisz przycisk "Dołącz do spotkania" (jeśli zajęcia już trwają)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 37: Dołączanie do Zajęć Online - Przed Czasem 💻

**Cel:** Sprawdzić że link jest niedostępny przed rozpoczęciem.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na swoje konto i upewnij się, że jesteś zapisany na zajęcia online które odbędą się JUTRO lub później. Aby to sprawdzić:
1. Wejdź w "Harmonogram"
2. Poszukaj zajęć z ikoną 💻 (oznacza zajęcia online) na jutro lub późniejszy dzień
3. Jeśli NIE widzisz żadnych zajęć online w przyszłości:
   - Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
   - Poproś o utworzenie testowych zajęć online na odpowiedni termin (np. jutro o 10:00)
4. Gdy zajęcia online już istnieją, zapisz się na nie:
   - Kliknij na zajęcia
   - Kliknij "Zapisz się"
   - Potwierdź (możesz, ale nie musisz płacić)
5. Wejdź w "Moje Rezerwacje" i upewnij się że widzisz te zajęcia online z ikoną 💻

**Kroki testowe:**
1. W zakładce "Moje Rezerwacje" znajdź zajęcia online jutro
2. Sprawdź czy widzisz przycisk "Dołącz do spotkania"

**Oczekiwany rezultat:**
- ✅ Przycisk "Dołącz" NIE jest widoczny LUB jest nieaktywny
- ✅ Widzisz komunikat "Link będzie dostępny 15 min przed zajęciami"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 38: Dołączanie do Zajęć Online - W Trakcie 💻

**Cel:** Sprawdzić link do zajęć podczas trwania.

**Przygotowanie:**
⚠️ UWAGA: Ten test wymaga zajęć online które odbywają się TERAZ (w ciągu 15 minut). Musisz to zaplanować z wyprzedzeniem:

1. **Dzień wcześniej:** Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com):
   - Poproś o utworzenie testowych zajęć online na określoną godzinę (np. jutro o 14:00)
   - Podaj dokładną godzinę kiedy będziesz mógł przeprowadzić test
   
2. **W dniu testu, PRZED godziną zajęć:**
   - Zaloguj się i wejdź w "Harmonogram"
   - Znajdź zajęcia online z ikoną 💻 o umówionej godzinie
   - Kliknij "Zapisz się" i potwierdź
   - Sprawdź w "Moje Rezerwacje" że masz rezerwację
   
3. **WAŻNE:** Rozpocznij ten test gdy zajęcia są za 10-15 minut LUB już się zaczęły (ale nie później niż 30 min od startu)

**Kroki testowe:**
1. Upewnij się że jest odpowiednia godzina (15 min przed zajęciami do 30 min po rozpoczęciu)
2. Wejdź w "Moje Rezerwacje"
3. Znajdź zajęcia online które właśnie trwają
4. Kliknij przycisk "Dołącz do spotkania"

**Oczekiwany rezultat:**
- ✅ Przycisk "Dołącz" jest widoczny i aktywny
- ✅ Kliknięcie otwiera link Zoom/Meet w nowej karcie
- ✅ Link działa (przekierowuje do Zoom/Meet)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 6: Panel Admina (Scenariusze 39-46)

**UWAGA:** Te scenariusze wymagają konta z rolą "admin". Jeśli nie masz uprawnień administratora, skontaktuj się z **Tomasz Skrzypczyk** aby je otrzymać.

### Scenariusz 39: Logowanie jako Admin 💻

**Cel:** Sprawdzić dostęp do panelu admina.

**Wymagania wstępne:**
- Konto z uprawnieniami admin (skontaktuj się z Tomasz Skrzypczyk jeśli nie masz)

**Kroki:**
1. Zaloguj się swoim kontem (które ma uprawnienia admin)
2. Sprawdź menu
3. Kliknij "Panel Admina"

**Oczekiwany rezultat:**
- ✅ W menu widzisz opcję "Panel Admina"
- ✅ Możesz wejść w Panel Admina
- ✅ Widzisz sekcje: Zajęcia, Użytkownicy, Płatności

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 40: Dodawanie Nowych Zajęć (Admin) 💻

**Cel:** Sprawdzić tworzenie zajęć przez admina.

**Wymagania wstępne:**
- Zalogowany admin

**Kroki:**
1. Panel Admina → Zajęcia
2. Kliknij "Dodaj zajęcia"
3. Wpisz nazwę: "Test Yoga"
4. Wybierz sekcję: "Yoga"
5. Wybierz datę: jutro
6. Wybierz godzinę: 18:00
7. Czas trwania: 90 min
8. Cena: 50 zł
9. Limit miejsc: 12
10. Kliknij "Zapisz"

**Oczekiwany rezultat:**
- ✅ Widzisz komunikat "Zajęcia utworzone"
- ✅ Zajęcia pojawiają się na liście w panelu
- ✅ Zajęcia są widoczne w Harmonogramie (dla użytkowników)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 41: Edycja Istniejących Zajęć (Admin) 💻

**Cel:** Sprawdzić edycję zajęć.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto z uprawnieniami administratora i upewnij się, że w systemie istnieje przynajmniej jedno wydarzenie które możesz edytować. Aby to sprawdzić:
1. Wejdź w menu "Panel Admina" → zakładka "Zajęcia"
2. Sprawdź czy widzisz listę zajęć (minimum 1 pozycja)
3. Jeśli NIE widzisz żadnych zajęć:
   - W zakładce "Zajęcia" kliknij "Dodaj zajęcia"
   - Wypełnij formularz:
     - Nazwa: "Test Yoga"
     - Sekcja: wybierz dowolną (np. "Yoga")
     - Data: jutro o 18:00
     - Czas trwania: 60 min
     - Cena: 50 zł
     - Limit: 12 osób
   - Kliknij "Utwórz zajęcia"
4. Zapamiętaj nazwę zajęć które będziesz edytować (np. "Test Yoga")

**Kroki testowe:**
1. Panel Admina → Zajęcia
2. Znajdź zajęcia które chcesz edytować (np. "Test Yoga")
3. Kliknij ikonę "Edytuj" ✏️ przy tych zajęciach
4. Zmień cenę (np. z 50 zł na 45 zł)
5. Zmień limit miejsc (np. z 12 na 15)
6. Kliknij "Zapisz zmiany"

**Oczekiwany rezultat:**
- ✅ Widzisz "Zmiany zapisane"
- ✅ Cena = 45 zł
- ✅ Limit = 15 miejsc
- ✅ Zmiany widoczne w Harmonogramie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 42: Usuwanie Zajęć (Admin) 💻

**Cel:** Sprawdzić usuwanie zajęć.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto z uprawnieniami administratora i upewnij się, że w systemie istnieje przynajmniej jedno wydarzenie na które **NIKT NIE JEST ZAPISANY**. Aby to sprawdzić:
1. Wejdź w menu "Panel Admina" → zakładka "Zajęcia"
2. Przeglądaj listę zajęć i szukaj takiego, które ma licznik rezerwacji "0/X" (np. "0/12" oznacza 0 zapisanych osób z limitu 12)
3. Jeśli NIE widzisz żadnych zajęć bez rezerwacji:
   - Kliknij "Dodaj zajęcia"
   - Wypełnij formularz:
     - Nazwa: "Test Do Usunięcia"
     - Sekcja: wybierz dowolną
     - Data: za 7 dni (ważne: wybierz datę w przyszłości, żeby nikt się nie zapisał)
     - Czas trwania: 60 min
     - Cena: 1 zł
     - Limit: 10 osób
   - Kliknij "Utwórz zajęcia"
   - Upewnij się że nikt się nie zapisał (licznik powinien pokazywać "0/10")
4. Zapamiętaj nazwę zajęć bez rezerwacji (te które będziesz usuwać)

**Kroki testowe:**
1. Panel Admina → Zajęcia
2. Znajdź zajęcia bez rezerwacji (licznik pokazuje "0/X")
3. Kliknij ikonę "Usuń" 🗑️
4. Przeczytaj pytanie w dialogu i potwierdź usunięcie

**Oczekiwany rezultat:**
- ✅ Widzisz dialog "Czy na pewno usunąć?"
- ✅ Po potwierdzeniu: "Zajęcia usunięte"
- ✅ Zajęcia znikają z listy
- ✅ NIE są widoczne w Harmonogramie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 43: Blokada Usuwania Zajęć z Rezerwacjami 💻

**Cel:** Sprawdzić że nie można usunąć zajęć gdy są rezerwacje.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto z uprawnieniami administratora i upewnij się, że w systemie istnieje przynajmniej jedno wydarzenie na które **KTOŚ JUŻ JEST ZAPISANY**. Aby to sprawdzić:
1. Wejdź w menu "Panel Admina" → zakładka "Zajęcia"
2. Przeglądaj listę zajęć i szukaj takiego, które ma licznik rezerwacji większy niż 0 (np. "3/12" oznacza 3 zapisane osoby z limitu 12)
3. Jeśli NIE widzisz żadnych zajęć z rezerwacjami:
   - **Opcja A - szybka:** Otwórz drugą przeglądarkę/okno incognito
     - Zaloguj się tam swoim zwykłym kontem użytkownika (NIE admin)
     - Wejdź w "Harmonogram" i zapisz się na dowolne zajęcia w przyszłości
     - Wróć do okna z kontem admin i odśwież listę zajęć
   - **Opcja B - poproś kogoś:** Poproś inną osobę aby zapisała się na jakieś zajęcia
   - **Opcja C - stwórz nowe konto:** Utwórz testowe konto użytkownika i zapisz się na zajęcia
4. Upewnij się że widzisz zajęcia z licznikiem większym niż 0 (np. "1/12", "3/15" itp.)
5. Zapamiętaj nazwę tych zajęć

**Kroki testowe:**
1. Panel Admina → Zajęcia
2. Znajdź zajęcia Z rezerwacjami (licznik pokazuje np. "3/12" - coś więcej niż "0/X")
3. Kliknij ikonę "Usuń" 🗑️
4. Przeczytaj komunikat błędu

**Oczekiwany rezultat:**
- ✅ Widzisz błąd "Nie można usunąć - są rezerwacje"
- ✅ Zajęcia NIE zostały usunięte
- ✅ Przycisk "Usuń" może być nieaktywny

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 44: Lista Użytkowników (Admin) 💻

**Cel:** Sprawdzić widok użytkowników.

**Wymagania wstępne:**
- Zalogowany admin

**Kroki:**
1. Panel Admina → Użytkownicy
2. Sprawdź listę

**Oczekiwany rezultat:**
- ✅ Widzisz listę użytkowników (minimum 5)
- ✅ Każdy user: email, imię, rola
- ✅ Możesz filtrować po roli (admin/trainer/user)
- ✅ Jest wyszukiwarka (po email/imieniu)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 45: Zmiana Roli Użytkownika (Admin) 💻

**Cel:** Sprawdzić nadawanie uprawnień.

**Wymagania wstępne:**
- Zalogowany admin
- Użytkownik z rolą "user"

**Kroki:**
1. Panel Admina → Użytkownicy
2. Znajdź użytkownika z rolą "user"
3. Kliknij "Edytuj" LUB dropdown "Zmień rolę"
4. Zmień na "trainer"
5. Zapisz

**Oczekiwany rezultat:**
- ✅ Widzisz "Rola zmieniona"
- ✅ Użytkownik ma teraz rolę "trainer"
- ✅ Po zalogowaniu TYM użytkownikiem: widzi opcje trenera

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 46: Panel Płatności - Statystyki (Admin) 💻

**Cel:** Sprawdzić panel płatności.

**Wymagania wstępne:**
- Zalogowany admin
- Minimum 3 płatności w systemie

**Kroki:**
1. Panel Admina → Płatności
2. Sprawdź statystyki
3. Przejrzyj listę webhooków

**Oczekiwany rezultat:**
- ✅ Widzisz statystyki: Wszystkie płatności, Sukces, Błędy, Łącznie (kwota)
- ✅ Lista webhooków ITN (od Autopay)
- ✅ Każdy webhook: data, status, kwota
- ✅ Możesz filtrować (ostatnie 7/14/30 dni)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 7: Wydajność i UX (Scenariusze 47-50)

### Scenariusz 47: Szybkość Ładowania Strony Głównej 💻

**Cel:** Sprawdzić czy strona ładuje się szybko.

**Wymagania wstępne:**
- Przeglądarka
- Stabilne połączenie internetowe

**Kroki:**
1. Zamknij wszystkie karty z aplikacją
2. Otwórz nową kartę
3. Wpisz adres: https://unicorns-test.netlify.app
4. Zmierz czas (policz do...) lub użyj stopera

**Oczekiwany rezultat:**
- ✅ Strona główna załadowała się < 3 sekundy
- ✅ Zdjęcia pojawiły się < 5 sekund
- ✅ Brak "białego ekranu" > 1 sekunda
- ✅ Animacje są płynne

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 48: Responsywność - Tablet 📱

**Urządzenie:** Tablet (Android lub iOS)  
**Cel:** Sprawdzić działanie na tablecie.

**Wymagania wstępne:**
- Tablet (iPad, Samsung Tab, etc.)

**Kroki:**
1. Otwórz stronę na tablecie
2. Zaloguj się
3. Przejdź przez: Harmonogram, Moje Rezerwacje, Profil
4. Spróbuj się zapisać na zajęcia

**Oczekiwany rezultat:**
- ✅ Wszystkie elementy są czytelne
- ✅ Przyciski są łatwe do kliknięcia
- ✅ Zdjęcia dobrze wyglądają (nie rozciągnięte)
- ✅ Menu działa poprawnie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 49: PWA - Dodanie do Ekranu Głównego 📱

**Urządzenie:** Telefon - RÓŻNE KROKI dla Android i iOS  
**Cel:** Sprawdzić instalację jako PWA.

**Wymagania wstępne:**
- Telefon (Android/iOS)
- Przeglądarka Chrome (Android) lub Safari (iOS)

**Kroki (🤖 Android - Chrome):**
1. Otwórz stronę w Chrome
2. Kliknij menu (3 kropki w górnym rogu) → "Dodaj do ekranu głównego"
3. Potwierdź nazwę aplikacji
4. Kliknij "Dodaj"
5. Znajdź ikonę "Unicorns PWA" na ekranie głównym i kliknij

**Kroki (🍎 iOS - Safari):**
1. Otwórz stronę w Safari
2. Kliknij przycisk "Udostępnij" (kwadrat ze strzałką w górę, na dole)
3. Przewiń w dół i wybierz "Dodaj do ekranu początkowego"
4. Potwierdź nazwę aplikacji
5. Kliknij "Dodaj"
6. Znajdź ikonę "Unicorns PWA" na ekranie głównym i kliknij

**Oczekiwany rezultat (oba systemy):**
- ✅ Ikona pojawia się na ekranie głównym
- ✅ Otwiera się jak natywna aplikacja (bez paska przeglądarki/adresu)
- ✅ Działa tak samo jak w przeglądarce
- ✅ Ma własną ikonę (logo Unicorns)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 50: Offline - Brak Internetu 📱

**Cel:** Sprawdzić jak aplikacja zachowuje się bez internetu.

**Wymagania wstępne:**
- Telefon lub laptop
- Zainstalowana PWA (Scenariusz 49)

**Kroki:**
1. Otwórz aplikację (zalogowany)
2. Włącz tryb samolotowy LUB wyłącz WiFi
3. Spróbuj odświeżyć stronę (F5)
4. Spróbuj przejść do Harmonogramu

**Oczekiwany rezultat:**
- ✅ Strona pokazuje komunikat "Brak połączenia z internetem"
- ✅ Ostatnio załadowane dane są nadal widoczne (cache)
- ✅ NIE widzisz białego ekranu
- ✅ Po przywróceniu internetu: automatyczne odświeżenie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 8: Strefa Członka Stowarzyszenia (Scenariusze 51-55)

**UWAGA:** Te scenariusze wymagają konta ze statusem "członek stowarzyszenia". Jeśli nie masz tego statusu, skontaktuj się z **Tomasz Skrzypczyk** aby go otrzymać.

### Scenariusz 51: Dostęp do Strefy Członka 💻

**Cel:** Sprawdzić kontrolę dostępu do strefy członka.

**Przygotowanie:**
Przed rozpoczęciem tego testu potrzebujesz dwóch kont:
1. **Konto ze statusem członka** - skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com) aby otrzymać status
2. **Zwykłe konto użytkownika** (bez statusu członka) - użyj własnego konta testowego

**Kroki testowe - Część A (zwykły użytkownik):**
1. Zaloguj się swoim zwykłym kontem (bez statusu członka)
2. Spróbuj wejść bezpośrednio na URL `/member-zone`
3. Sprawdź co się dzieje

**Oczekiwany rezultat A:**
- ✅ Widzisz komunikat "Dostęp tylko dla członków stowarzyszenia"
- ✅ Zostałeś przekierowany na stronę główną LUB stronę informacyjną
- ✅ Menu NIE pokazuje opcji "Strefa Członka"

**Kroki testowe - Część B (członek stowarzyszenia):**
1. Wyloguj się i zaloguj kontem ze statusem członka
2. Sprawdź menu nawigacji
3. Kliknij "Strefa Członka"

**Oczekiwany rezultat B:**
- ✅ W menu widzisz opcję "Strefa Członka" 🎖️
- ✅ Możesz wejść na `/member-zone`
- ✅ Widzisz dashboard z kafelkami: Saldo, Dokumenty, Wiadomości, Ankiety

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 52: Saldo Członkowskie - Wyświetlanie 💻

**Cel:** Sprawdzić widok salda członkowskiego i historii operacji.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto ze statusem członka stowarzyszenia (zobacz Scenariusz 51). Jeśli nie masz historii operacji na saldzie:
1. Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
2. Poproś o dodanie testowych operacji na saldzie (składka, korekta itp.)
3. LUB jeśli masz uprawnienia admin, dodaj operacje przez panel admina

**Kroki testowe:**
1. Wejdź w "Strefa Członka" → "Saldo Członkowskie"
2. Sprawdź aktualny stan salda na górze strony
3. Przewiń w dół do historii operacji
4. Sprawdź szczegóły poszczególnych operacji (data, typ, kwota, opis)
5. Jeśli jest filtr/sortowanie - przetestuj

**Oczekiwany rezultat:**
- ✅ Widzisz aktualny stan salda (może być dodatni, ujemny lub 0)
- ✅ Historia operacji jest posortowana chronologicznie (najnowsze na górze)
- ✅ Każda operacja pokazuje:
  - Data (np. "26.04.2026")
  - Typ (np. "Składka", "Korekta", "Wpłata")
  - Kwota (np. "+50 zł", "-30 zł")
  - Opis/notatka (jeśli jest)
- ✅ Możesz filtrować po dacie LUB typie operacji (jeśli funkcja istnieje)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 53: Dokumenty Członkowskie - Pobieranie 💻

**Cel:** Sprawdzić dostęp do dokumentów dla członków.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto ze statusem członka i upewnij się, że istnieją dokumenty do pobrania:
1. Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
2. Poproś o upload testowego dokumentu (np. regulamin, protokół zebrania)
3. LUB jeśli masz uprawnienia admin, wgraj dokument przez AdminMemberDocumentsPage

**Kroki testowe:**
1. Wejdź w "Strefa Członka" → "Dokumenty"
2. Sprawdź listę dostępnych dokumentów
3. Znajdź dokument z kategorią np. "Protokoły" lub "Regulaminy"
4. Kliknij "Pobierz" LUB nazwę dokumentu
5. Sprawdź czy plik się pobrał

**Oczekiwany rezultat:**
- ✅ Widzisz listę dokumentów (minimum 1)
- ✅ Każdy dokument ma:
  - Nazwę (np. "Protokół zebrania 03.2026")
  - Kategorię (np. "Protokoły", "Regulaminy", "Finanse")
  - Datę dodania
  - Rozmiar pliku (np. "245 KB")
  - Przycisk "Pobierz" 📥
- ✅ Kliknięcie pobiera plik (PDF, DOC, itp.)
- ✅ Plik otwiera się poprawnie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 54: Wiadomości dla Członków - Czytanie 💻

**Cel:** Sprawdzić wyświetlanie wiadomości/ogłoszeń dla członków.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto ze statusem członka i upewnij się, że istnieją wiadomości:
1. Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
2. Poproś o dodanie testowej wiadomości dla członków
3. LUB jeśli masz uprawnienia admin, dodaj wiadomość przez AdminMemberNewsPage

**Kroki testowe:**
1. Wejdź w "Strefa Członka" → "Wiadomości"
2. Sprawdź listę wiadomości
3. Kliknij na nieprzeczytaną wiadomość (jeśli jest)
4. Przeczytaj treść
5. Wróć do listy i sprawdź czy status się zmienił

**Oczekiwany rezultat:**
- ✅ Widzisz listę wiadomości (posortowane chronologicznie)
- ✅ Każda wiadomość ma:
  - Tytuł (np. "Zaproszenie na zebranie")
  - Data publikacji (np. "20.04.2026")
  - Badge "NOWE" dla nieprzeczytanych
  - Krótki wstęp/skrót treści
- ✅ Po kliknięciu widzisz pełną treść wiadomości
- ✅ Po przeczytaniu, wiadomość zostaje oznaczona jako przeczytana (znika badge "NOWE")

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 55: Ankiety dla Członków - Głosowanie 💻

**Cel:** Sprawdzić możliwość głosowania w ankietach.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto ze statusem członka i upewnij się, że istnieje aktywna ankieta:
1. Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
2. Poproś o utworzenie testowej ankiety (np. "Preferowana godzina zebrań")
3. LUB jeśli masz uprawnienia admin, stwórz ankietę przez AdminMemberPollsPage
4. Upewnij się że NIE głosowałeś jeszcze w tej ankiecie

**Kroki testowe:**
1. Wejdź w "Strefa Członka" → "Ankiety"
2. Znajdź aktywną ankietę (status: "Otwarta")
3. Kliknij na ankietę aby zobaczyć szczegóły
4. Wybierz jedną z opcji (np. radio button lub checkbox)
5. Kliknij "Zagłosuj"
6. Sprawdź wyniki ankiety

**Oczekiwany rezultat:**
- ✅ Widzisz listę ankiet (aktywne na górze)
- ✅ Każda ankieta ma:
  - Pytanie/tytuł
  - Status ("Otwarta" / "Zamknięta")
  - Termin zakończenia (jeśli dotyczy)
  - Badge "Już głosowałeś" (jeśli dotyczy)
- ✅ Możesz zagłosować w aktywnej ankiecie
- ✅ Po oddaniu głosu widzisz wyniki (procenty/liczby głosów)
- ✅ NIE możesz zagłosować drugi raz w tej samej ankiecie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 9: Zwroty i Refundy (Scenariusze 56-59)

**UWAGA:** Te scenariusze wymagają konta z uprawnieniami admin.

### Scenariusz 56: Lista Zwrotów (Admin) 💻

**Cel:** Sprawdzić panel zarządzania zwrotami.

**Przygotowanie:**
Przed rozpoczęciem tego testu, zaloguj się na konto z uprawnieniami administratora i upewnij się, że istnieje przynajmniej jeden wniosek o zwrot:
1. Otwórz drugą przeglądarkę/okno incognito
2. Zaloguj się tam swoim zwykłym kontem użytkownika
3. Zapisz się na płatne zajęcia i opłać (Scenariusz 18-19)
4. Następnie anuluj te zajęcia przed deadline (Scenariusz 23)
5. Jeśli system automatycznie tworzy wniosek o zwrot - poczekaj chwilę
6. LUB skontaktuj się z Tomasz Skrzypczyk o utworzenie testowego wniosku o zwrot
7. Wróć do okna z kontem admin

**Kroki testowe:**
1. Panel Admina → zakładka "Zwroty" (lub "Refunds")
2. Sprawdź listę wniosków o zwrot
3. Zwróć uwagę na statusy (pending, approved, rejected, processed)
4. Kliknij na jeden wniosek aby zobaczyć szczegóły

**Oczekiwany rezultat:**
- ✅ Widzisz listę wniosków o zwrot
- ✅ Każdy wniosek ma:
  - Użytkownik (imię, email)
  - Zajęcia (nazwa, data)
  - Kwota do zwrotu (np. "47 zł")
  - Status ("Oczekuje", "Zatwierdzony", "Odrzucony", "Przetworzony")
  - Data wniosku
  - Przycisk "Szczegóły" lub automatyczne rozwinięcie
- ✅ Możesz filtrować po statusie
- ✅ Możesz sortować (po dacie, kwocie)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 57: Zatwierdzanie Zwrotu (Admin) 💻

**Cel:** Sprawdzić proces zatwierdzania zwrotu.

**Przygotowanie:**
Kontynuacja Scenariusza 56 - upewnij się że masz wniosek o zwrot ze statusem "Oczekuje" (pending).

**Kroki testowe:**
1. Panel Admina → Zwroty
2. Znajdź wniosek o zwrot ze statusem "Oczekuje"
3. Kliknij "Szczegóły" lub rozwiń wniosek
4. Sprawdź informacje: użytkownik, zajęcia, kwota, powód (jeśli jest)
5. Kliknij "Zatwierdź zwrot"
6. Potwierdź w dialogu (jeśli jest)
7. Sprawdź nowy status

**Oczekiwany rezultat:**
- ✅ Widzisz wszystkie szczegóły wniosku
- ✅ Przycisk "Zatwierdź" jest aktywny dla statusu "Oczekuje"
- ✅ Po kliknięciu "Zatwierdź" pojawia się pytanie "Czy na pewno?"
- ✅ Po potwierdzeniu:
  - Status zmienia się na "Zatwierdzony"
  - Wniosek przenosi się do sekcji zatwierdzonych
  - System wysyła email do użytkownika (opcjonalnie)
  - Transakcja typu "refund" zostaje utworzona w systemie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 58: Odrzucanie Zwrotu (Admin) 💻

**Cel:** Sprawdzić możliwość odrzucenia wniosku o zwrot.

**Przygotowanie:**
Podobnie jak Scenariusz 56-57, potrzebujesz wniosek o zwrot ze statusem "Oczekuje".

**Kroki testowe:**
1. Panel Admina → Zwroty
2. Znajdź wniosek o zwrot ze statusem "Oczekuje"
3. Kliknij "Odrzuć" LUB ikonę ❌
4. Wpisz powód odrzucenia (np. "Anulowanie po deadline")
5. Potwierdź odrzucenie
6. Sprawdź nowy status

**Oczekiwany rezultat:**
- ✅ Przycisk "Odrzuć" jest widoczny
- ✅ Po kliknięciu pojawia się formularz z polem "Powód odrzucenia"
- ✅ Powód jest wymagany (nie można odrzucić bez podania przyczyny)
- ✅ Po potwierdzeniu:
  - Status zmienia się na "Odrzucony"
  - Powód jest zapisany i widoczny w szczegółach
  - Użytkownik otrzymuje email z informacją o odrzuceniu i powodem
  - NIE następuje zwrot pieniędzy

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 59: Status Przetwarzania Zwrotu 💻

**Cel:** Sprawdzić śledzenie statusu zwrotu po zatwierdzeniu.

**Przygotowanie:**
Kontynuacja Scenariusza 57 - potrzebujesz zatwierdzonego zwrotu.

**Kroki testowe:**
1. Panel Admina → Zwroty
2. Znajdź zwrot ze statusem "Zatwierdzony"
3. Kliknij "Oznacz jako przetworzony" (gdy faktycznie przelewasz pieniądze)
4. Opcjonalnie: dodaj numer transakcji bankowej
5. Potwierdź
6. Sprawdź zmianę statusu

**Oczekiwany rezultat:**
- ✅ Zwrot "Zatwierdzony" czeka na fizyczne przelanie pieniędzy
- ✅ Admin może oznaczyć jako "Przetworzony" po wykonaniu przelewu
- ✅ Opcjonalnie: pole na numer transakcji/potwierdzenia
- ✅ Po oznaczeniu jako "Przetworzony":
  - Status finalny, nie można już zmieniać
  - Data przetworzenia jest zapisana
  - Użytkownik otrzymuje email "Zwrot został zrealizowany"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 10: Powiadomienia - Rozszerzone (Scenariusze 60-66)

### Scenariusz 60: Powiadomienia - Przypomnienia o Zajęciach 💻

**Cel:** Sprawdzić włączanie/wyłączanie przypomnień o zajęciach.

**Przygotowanie:**
Zaloguj się na swoje konto użytkownika.

**Kroki testowe:**
1. Wejdź w Profil → Ustawienia → sekcja "Powiadomienia"
2. Znajdź przełącznik "Przypomnienia o zajęciach" (activity_reminders)
3. Sprawdź aktualny stan (włączone/wyłączone)
4. Kliknij przełącznik aby zmienić stan
5. Odśwież stronę
6. Sprawdź czy ustawienie zostało zapisane

**Oczekiwany rezultat:**
- ✅ Widzisz toggle "Przypomnienia o zajęciach" 🔔
- ✅ Opis: "Powiadom mnie X godzin przed rozpoczęciem zajęć"
- ✅ Możesz włączyć/wyłączyć
- ✅ Ustawienie zapisuje się w localStorage LUB bazie
- ✅ Po odświeżeniu stan się utrzymuje
- ✅ Gdy wyłączone - NIE będziesz otrzymywać przypomnień przed zajęciami

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 61: Powiadomienia - Nowe Zajęcia 💻

**Cel:** Sprawdzić powiadomienia o nowych zajęciach dodanych do harmonogramu.

**Przygotowanie:**
Zaloguj się na swoje konto użytkownika.

**Kroki testowe:**
1. Wejdź w Profil → Ustawienia → "Powiadomienia"
2. Znajdź przełącznik "Nowe zajęcia" (new_activities)
3. Upewnij się że jest WŁĄCZONY
4. Zapisz ustawienia

**Test opcjonalny (wymaga admina):**
5. Poproś Tomasz Skrzypczyk o dodanie nowych zajęć
6. LUB jeśli masz uprawnienia admin, dodaj nowe zajęcia w drugiej przeglądarce
7. Sprawdź czy otrzymałeś powiadomienie push/email

**Oczekiwany rezultat:**
- ✅ Widzisz toggle "Powiadomienia o nowych zajęciach" 🆕
- ✅ Opis: "Powiadom gdy dodano nowe zajęcia do harmonogramu"
- ✅ Możesz włączyć/wyłączyć niezależnie od innych
- ✅ Gdy włączone + admin doda zajęcia:
  - Otrzymujesz powiadomienie push (jeśli włączone)
  - LUB email (jeśli włączone)
  - Powiadomienie zawiera: nazwę zajęć, datę, link

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 62: Powiadomienia - Alerty o Saldzie 💻

**Cel:** Sprawdzić alerty gdy saldo jest niskie lub ujemne.

**Przygotowanie:**
Zaloguj się na swoje konto użytkownika.

**Kroki testowe:**
1. Wejdź w Profil → Ustawienia → "Powiadomienia"
2. Znajdź przełącznik "Alerty o saldzie" (balance_alerts)
3. Włącz ten toggle
4. Zapisz ustawienia

**Oczekiwany rezultat:**
- ✅ Widzisz toggle "Alerty o saldzie" 💰
- ✅ Opis: "Powiadom gdy saldo jest niskie lub ujemne"
- ✅ Możesz włączyć/wyłączyć
- ✅ Gdy włączone + saldo < 0 lub < progu:
  - Otrzymujesz powiadomienie
  - Powiadomienie zawiera: aktualny stan salda, link do doładowania

**UWAGA:** Faktyczne otrzymanie alertu wymaga że saldo faktycznie spadnie poniżej progu - trudne do przetestowania bez zmian w bazie.

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 63: Powiadomienia - Wiadomości dla Członków 💻

**Cel:** Sprawdzić powiadomienia o nowych wiadomościach w strefie członka.

**Przygotowanie:**
Zaloguj się na konto ze statusem członka stowarzyszenia.

**Kroki testowe:**
1. Wejdź w Profil → Ustawienia → "Powiadomienia"
2. Znajdź przełącznik "Wiadomości dla członków" (member_news)
3. Upewnij się że jest WŁĄCZONY
4. Zapisz ustawienia

**Oczekiwany rezultat:**
- ✅ Widzisz toggle "Wiadomości dla członków" 🎖️
- ✅ Opis: "Powiadom o nowych wiadomościach w strefie członka"
- ✅ Dostępny tylko dla użytkowników ze statusem członka
- ✅ Gdy włączone + admin doda wiadomość:
  - Otrzymujesz powiadomienie push/email
  - Powiadomienie zawiera: tytuł wiadomości, link do strefy członka

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 64: Historia Powiadomień - Przeglądanie 💻

**Cel:** Sprawdzić stronę z historią otrzymanych powiadomień.

**Przygotowanie:**
Zaloguj się na swoje konto. Najlepiej jeśli masz już jakieś powiadomienia w historii (np. z wcześniejszych testów).

**Kroki testowe:**
1. Wejdź w menu "Powiadomienia" (ikona 🔔)
2. Sprawdź listę powiadomień
3. Zwróć uwagę na nieprzeczytane (pogrubione lub z kropką)
4. Przewiń listę w dół

**Oczekiwany rezultat:**
- ✅ Widzisz listę powiadomień (chronologicznie, najnowsze na górze)
- ✅ Każde powiadomienie ma:
  - Ikonę typu (💳 płatność, 🆕 nowe zajęcia, 🎉 wydarzenie)
  - Tytuł
  - Treść/krótki opis
  - Data/czas (np. "2 godziny temu", "26.04.2026 14:30")
  - Badge "NOWE" dla nieprzeczytanych
- ✅ Paginacja lub "Załaduj więcej" jeśli > 10 powiadomień
- ✅ Jeśli brak powiadomień: "Nie masz jeszcze żadnych powiadomień"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 65: Historia Powiadomień - Oznaczanie jako Przeczytane 💻

**Cel:** Sprawdzić oznaczanie powiadomień jako przeczytane.

**Przygotowanie:**
Kontynuacja Scenariusza 64 - potrzebujesz nieprzeczytane powiadomienie w historii.

**Kroki testowe:**
1. Wejdź w "Powiadomienia"
2. Znajdź nieprzeczytane powiadomienie (badge "NOWE")
3. Kliknij na to powiadomienie
4. Sprawdź szczegóły (jeśli są)
5. Wróć do listy powiadomień
6. Sprawdź czy status się zmienił

**Oczekiwany rezultat:**
- ✅ Kliknięcie na powiadomienie oznacza je jako przeczytane
- ✅ Badge "NOWE" znika
- ✅ Czcionka zmienia się z pogrubionej na normalną
- ✅ Stan zapisuje się (po odświeżeniu nadal przeczytane)
- ✅ Licznik nieprzeczytanych w ikonie 🔔 maleje (np. z "3" na "2")

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 66: Wyłączenie Wszystkich Powiadomień Push 💻

**Cel:** Sprawdzić główny przełącznik push notifications.

**Przygotowanie:**
Zaloguj się na swoje konto. Upewnij się że masz włączone powiadomienia push (Scenariusz 33).

**Kroki testowe:**
1. Wejdź w Profil → Ustawienia → "Powiadomienia"
2. Znajdź główny przełącznik "Powiadomienia Push" na górze sekcji
3. Sprawdź że jest WŁĄCZONY (wszystkie pod-opcje też włączone)
4. Kliknij główny toggle aby WYŁĄCZYĆ
5. Sprawdź co się stało z pod-opcjami (activity_reminders, new_activities itd.)

**Oczekiwany rezultat:**
- ✅ Główny toggle "Powiadomienia Push" kontroluje wszystkie pod-opcje
- ✅ Gdy główny toggle = OFF:
  - Wszystkie pod-opcje push automatycznie wyłączają się
  - Pod-opcje stają się nieaktywne (szare, disabled)
  - NIE można włączyć pojedynczej opcji dopóki główny toggle = OFF
- ✅ Gdy główny toggle = ON:
  - Pod-opcje stają się aktywne
  - Możesz kontrolować każdą z osobna

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 11: Panel Admina - Raporty i Obecność (Scenariusze 67-70)

**UWAGA:** Te scenariusze wymagają konta z uprawnieniami admin.

### Scenariusz 67: Generowanie Raportu Miesięcznego 💻

**Cel:** Sprawdzić generowanie raportów finansowych.

**Przygotowanie:**
Zaloguj się na konto z uprawnieniami administratora. System powinien mieć jakieś dane finansowe (płatności) z ostatniego miesiąca.

**Kroki testowe:**
1. Panel Admina → zakładka "Raporty"
2. Wybierz typ raportu: "Raport miesięczny"
3. Wybierz miesiąc (np. "Kwiecień 2026")
4. Kliknij "Generuj raport"
5. Poczekaj na wygenerowanie (może potrwać kilka sekund)
6. Sprawdź wyświetlony raport

**Oczekiwany rezultat:**
- ✅ Formularz ma pola: typ raportu, miesiąc, rok
- ✅ Po kliknięciu "Generuj" widzisz loader/spinner
- ✅ Raport wyświetla się na stronie LUB otwiera w nowej karcie
- ✅ Raport zawiera:
  - Podsumowanie finansowe (przychody, zwroty)
  - Liczba rezerwacji
  - Liczba uczestników
  - Podział po sekcjach (Fitness, Dance, Yoga...)
  - Frekwencja (% obecności)
- ✅ Jest opcja "Eksportuj PDF" LUB "Eksportuj CSV"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 68: Eksport Raportu do CSV 💻

**Cel:** Sprawdzić eksport danych do pliku CSV.

**Przygotowanie:**
Kontynuacja Scenariusza 67 - masz wygenerowany raport.

**Kroki testowe:**
1. Na stronie z raportem znajdź przycisk "Eksportuj CSV" LUB "Pobierz CSV"
2. Kliknij przycisk
3. Sprawdź pobrany plik
4. Otwórz plik w Excel/Google Sheets

**Oczekiwany rezultat:**
- ✅ Plik CSV pobiera się automatycznie
- ✅ Nazwa pliku jest czytelna (np. "raport_2026-04.csv")
- ✅ Plik otwiera się w Excel/Sheets
- ✅ Dane są poprawnie sformatowane (kolumny: Data, Użytkownik, Zajęcia, Kwota, Status)
- ✅ Polskie znaki wyświetlają się poprawnie (UTF-8)
- ✅ Możesz filtrować i sortować dane w Excelu

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 69: Lista Obecności na Zajęciach 💻

**Cel:** Sprawdzić panel zarządzania obecnością.

**Przygotowanie:**
Zaloguj się na konto z uprawnieniami administratora. Potrzebujesz zajęcia które już się odbyły i miały uczestników:
1. Sprawdź w "Panel Admina → Zajęcia" czy są zajęcia z przeszłości (wczoraj lub wcześniej)
2. Upewnij się że te zajęcia miały rezerwacje (licznik np. "5/10")
3. Jeśli nie ma takich zajęć, poproś Tomasz Skrzypczyk o przygotowanie danych testowych

**Kroki testowe:**
1. Panel Admina → zakładka "Obecność" (lub "Frekwencja")
2. Wybierz datę (np. wczoraj)
3. Wybierz zajęcia z listy
4. Sprawdź listę uczestników
5. Znajdź uczestnika i kliknij checkbox "Obecny"
6. Kliknij "Zapisz obecność"

**Oczekiwany rezultat:**
- ✅ Widzisz listę zajęć z przeszłości
- ✅ Po wybraniu zajęć widzisz listę zarejestrowanych uczestników:
  - Imię i nazwisko
  - Email (opcjonalnie)
  - Status rezerwacji ("Zarejestrowany", "Opłacony")
  - Checkbox "Obecny" ☑️
- ✅ Możesz zaznaczyć/odznaczyć obecność dla każdego uczestnika
- ✅ Przycisk "Zapisz" zapisuje obecność
- ✅ Po zapisaniu: status uczestnika zmienia się na "Attended" (obecny)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 70: Statystyki Frekwencji Użytkownika 💻

**Cel:** Sprawdzić widok statystyk frekwencji konkretnego użytkownika.

**Przygotowanie:**
Kontynuacja Scenariusza 69 - potrzebujesz użytkownika z zapisaną obecnością na przynajmniej 1 zajęciach.

**Kroki testowe:**
1. Panel Admina → "Użytkownicy"
2. Znajdź użytkownika który był obecny na zajęciach
3. Kliknij jego imię/email aby zobaczyć profil
4. Przewiń do sekcji "Statystyki frekwencji"

**Oczekiwany rezultat:**
- ✅ W profilu użytkownika widzisz sekcję "Frekwencja"
- ✅ Statystyki pokazują:
  - Liczba rezerwacji ogółem (np. "15")
  - Liczba obecności (np. "12")
  - % frekwencji (np. "80%")
  - Lista ostatnich zajęć z obecnością (np. "Fitness 25.04 ✅", "Yoga 20.04 ❌")
- ✅ Możesz filtrować po dacie (np. "Ostatni miesiąc", "Ostatnie 3 miesiące")
- ✅ Opcjonalnie: wykres frekwencji w czasie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 12: Panel Trenera (Scenariusze 71-73)

**UWAGA:** Te scenariusze wymagają konta z uprawnieniami trainer lub external_trainer.

### Scenariusz 71: Lista Zajęć Trenera 💻

**Cel:** Sprawdzić widok zajęć prowadzonych przez trenera.

**Przygotowanie:**
Zaloguj się na konto z uprawnieniami trenera. Jeśli nie masz:
1. Skontaktuj się z Tomasz Skrzypczyk (skrzypczykt@gmail.com)
2. Poproś o nadanie roli "trainer" lub "external_trainer"
3. Poproś też o przypisanie Ci sekcji (np. "Fitness") i zajęć

**Kroki testowe:**
1. Zaloguj się kontem trenera
2. Sprawdź menu - powinieneś widzieć opcję "Moje Zajęcia" LUB "Panel Trenera"
3. Kliknij "Moje Zajęcia"
4. Sprawdź listę zajęć

**Oczekiwany rezultat:**
- ✅ W menu widzisz opcję dla trenera (np. "Moje Zajęcia" 🏋️)
- ✅ Widzisz TYLKO zajęcia które prowadzisz (przypisane do Twoich sekcji)
- ✅ Każde zajęcia ma:
  - Nazwa
  - Data i godzina
  - Sekcja
  - Liczba zapisanych (np. "7/10")
  - Przyciski: "Edytuj", "Lista uczestników", "Oznacz obecność"
- ✅ NIE widzisz zajęć innych trenerów
- ✅ Możesz filtrować po dacie (przyszłe/przeszłe)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 72: Edycja Swoich Zajęć (Trener) 💻

**Cel:** Sprawdzić że trener może edytować tylko swoje zajęcia.

**Przygotowanie:**
Kontynuacja Scenariusza 71 - zalogowany trener z przypisanymi zajęciami.

**Kroki testowe:**
1. "Moje Zajęcia" → znajdź swoje zajęcia w przyszłości
2. Kliknij "Edytuj" ✏️
3. Zmień opis zajęć (np. dodaj "UWAGA: Przynieś matę")
4. Zmień maksymalną liczbę uczestników (np. z 10 na 12)
5. Kliknij "Zapisz"
6. Sprawdź czy zmiany są widoczne

**Oczekiwany rezultat:**
- ✅ Trener może edytować swoje zajęcia
- ✅ Formularz edycji ma pola:
  - Nazwa (może edytować)
  - Data/godzina (może edytować)
  - Opis (może edytować)
  - Limit miejsc (może edytować)
  - Cena (może NIE móc edytować - tylko admin)
- ✅ Po zapisaniu zmiany są widoczne w harmonogramie
- ✅ Trener NIE może edytować zajęć innych trenerów (brak przycisku "Edytuj")

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 73: Oznaczanie Obecności przez Trenera 💻

**Cel:** Sprawdzić że trener może oznaczać obecność na swoich zajęciach.

**Przygotowanie:**
Kontynuacja Scenariusza 71-72. Potrzebujesz zajęcia które już się odbyły (wczoraj lub wcześniej) i miały uczestników.

**Kroki testowe:**
1. "Moje Zajęcia" → zmień filtr na "Przeszłe"
2. Znajdź zajęcia które się odbyły (np. wczoraj)
3. Kliknij "Oznacz obecność" LUB "Lista uczestników"
4. Widzisz listę zapisanych osób
5. Zaznacz checkbox "Obecny" przy uczestnikach którzy przyszli
6. Kliknij "Zapisz obecność"

**Oczekiwany rezultat:**
- ✅ Trener widzi listę uczestników swoich zajęć
- ✅ Może oznaczać obecność (checkbox ✅)
- ✅ Po zapisaniu status uczestnika zmienia się na "Attended"
- ✅ Trener NIE może oznaczać obecności na zajęciach innych trenerów
- ✅ System może wysłać powiadomienie do użytkownika o obecności (opcjonalnie)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 13: Strony Publiczne (Scenariusze 74-76)

### Scenariusz 74: Lista Aktualności (NewsPage) 💻

**Cel:** Sprawdzić stronę z aktualnościami/artykułami.

**Przygotowanie:**
NIE musisz być zalogowany - to strona publiczna. Upewnij się że istnieją jakieś aktualności:
- Skontaktuj się z Tomasz Skrzypczyk jeśli nie ma żadnych artykułów
- LUB sprawdź czy admin dodał jakieś newsy

**Kroki testowe:**
1. Wejdź na stronę główną (niezalogowany)
2. Kliknij "Aktualności" LUB "News" w menu
3. Przeglądaj listę artykułów
4. Zwróć uwagę na layout (kafelki, lista)
5. Sprawdź paginację (jeśli > 6 artykułów)

**Oczekiwany rezultat:**
- ✅ Strona ładuje się szybko (< 3 sekundy)
- ✅ Widzisz listę artykułów (kafelki lub lista)
- ✅ Każdy artykuł ma:
  - Tytuł
  - Zdjęcie główne (thumbnail)
  - Data publikacji (np. "20.04.2026")
  - Krótki wstęp/skrót treści
  - Przycisk "Czytaj więcej" →
- ✅ Artykuły posortowane chronologicznie (najnowsze na górze)
- ✅ Paginacja działa (jeśli jest)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 75: Czytanie Artykułu (NewsArticlePage) 💻

**Cel:** Sprawdzić wyświetlanie pełnego artykułu.

**Przygotowanie:**
Kontynuacja Scenariusza 74 - masz listę aktualności.

**Kroki testowe:**
1. Na stronie "Aktualności" kliknij "Czytaj więcej" przy dowolnym artykule
2. Poczekaj na załadowanie artykułu
3. Przewiń stronę w dół
4. Sprawdź czy są zdjęcia/galeria
5. Znajdź przyciski "Poprzedni artykuł" / "Następny artykuł" (jeśli są)

**Oczekiwany rezultat:**
- ✅ Artykuł wyświetla się w pełnej wersji
- ✅ Widoczne elementy:
  - Tytuł (duża czcionka)
  - Data i autor (jeśli jest)
  - Zdjęcie główne (hero image)
  - Pełna treść artykułu (formatowana, paragrafy)
  - Galeria zdjęć (jeśli artykuł ma więcej zdjęć)
- ✅ Nawigacja:
  - Przycisk "Wróć do listy" ←
  - "Poprzedni artykuł" / "Następny artykuł" (jeśli dostępne)
- ✅ Responsywność: dobrze wygląda na telefonie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 76: Strona "O Nas" (PublicAboutPage) 💻

**Cel:** Sprawdzić stronę z informacjami o stowarzyszeniu.

**Przygotowanie:**
NIE musisz być zalogowany - to strona publiczna.

**Kroki testowe:**
1. Wejdź na stronę główną (niezalogowany)
2. Kliknij "O nas" w menu (górne menu lub stopka)
3. Przewiń stronę w dół
4. Sprawdź sekcje: historia, misja, zespół, kontakt

**Oczekiwany rezultat:**
- ✅ Strona zawiera informacje o Unicorns Łódź
- ✅ Sekcje:
  - Historia stowarzyszenia (timeline jeśli jest)
  - Misja i wartości
  - Zespół (zdjęcia, imiona, role - jeśli publiczne)
  - Kontakt (email, telefon, social media)
- ✅ Design spójny z resztą aplikacji
- ✅ Zdjęcia ładują się poprawnie
- ✅ Responsywność: dobrze wygląda na wszystkich urządzeniach

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 14: Security i RLS (Scenariusze 77-80)

### Scenariusz 77: Próba Dostępu do Cudzych Rezerwacji 💻

**Cel:** Sprawdzić zabezpieczenie Row Level Security - użytkownik nie może widzieć cudzych rezerwacji.

**Przygotowanie:**
Potrzebujesz dwóch kont użytkowników:
1. Twoje główne konto testowe
2. Drugie konto (poproś kogoś LUB stwórz drugie)
Upewnij się że oba konta mają jakieś rezerwacje.

**Kroki testowe:**
1. Zaloguj się na pierwsze konto
2. Wejdź w "Moje Rezerwacje"
3. Zapamiętaj swoje rezerwacje (np. "Fitness 27.04")
4. Otwórz konsolę przeglądarki (F12 → Console)
5. Sprawdź zapytanie Supabase w Network (zakładka Network → filtr "registrations")
6. Spróbuj ręcznie zmienić parametr `user_id` w zapytaniu (wymaga wiedzy technicznej)

**Test uproszczony (bez konsoli):**
1. Wyloguj się
2. Zaloguj na drugie konto
3. Wejdź w "Moje Rezerwacje"
4. Sprawdź czy widzisz TYLKO swoje rezerwacje (NIE rezerwacje z pierwszego konta)

**Oczekiwany rezultat:**
- ✅ Każdy użytkownik widzi TYLKO swoje rezerwacje
- ✅ NIE ma możliwości zobaczenia cudzych rezerwacji
- ✅ Próba obejścia przez API zwraca błąd "403 Forbidden" lub puste dane
- ✅ RLS policy działa poprawnie (security)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 78: Próba Edycji Cudzego Profilu 💻

**Cel:** Sprawdzić że użytkownik nie może edytować profilu innej osoby.

**Przygotowanie:**
Potrzebujesz konta użytkownika (nie admin).

**Kroki testowe:**
1. Zaloguj się swoim kontem
2. Wejdź na swój profil: `/profile`
3. Sprawdź że możesz edytować (przycisk "Edytuj profil")
4. Spróbuj wejść na URL: `/profile/edit?userId=<inny-uuid>` (zmień UUID na inny)
5. LUB spróbuj bezpośrednio: `/users/<inny-uuid>/edit`

**Oczekiwany rezultat:**
- ✅ Użytkownik może edytować TYLKO swój profil
- ✅ Próba wejścia na `/profile/edit` innego użytkownika:
  - Przekierowanie na swój profil
  - LUB komunikat "Brak uprawnień"
  - LUB błąd 403
- ✅ RLS policy blokuje edycję cudzych danych
- ✅ Tylko admin może edytować profile wszystkich

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 79: Blokada Dostępu do Panel Admina (User) 💻

**Cel:** Sprawdzić że zwykły użytkownik nie ma dostępu do panelu admina.

**Przygotowanie:**
Zaloguj się swoim zwykłym kontem użytkownika (NIE admin, NIE trainer).

**Kroki testowe:**
1. Zalogowany jako zwykły user, sprawdź menu
2. Sprawdź czy widzisz opcję "Panel Admina"
3. Spróbuj wejść bezpośrednio na URL: `/admin`
4. Spróbuj też: `/admin/activities`, `/admin/users`, `/admin/payments`

**Oczekiwany rezultat:**
- ✅ Zwykły użytkownik NIE widzi opcji "Panel Admina" w menu
- ✅ Próba wejścia na `/admin`:
  - Przekierowanie na stronę główną
  - LUB komunikat "Brak uprawnień - wymagana rola admin"
  - LUB błąd 403
- ✅ Wszystkie podstrony `/admin/*` są zablokowane
- ✅ Tylko użytkownicy z rolą `admin` mają dostęp

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 80: Race Condition - Ostatnie Miejsce 💻

**Cel:** Sprawdzić co się dzieje gdy dwóch użytkowników próbuje zarezerwować ostatnie miejsce.

**Przygotowanie:**
⚠️ **TRUDNY TEST** - wymaga koordynacji dwóch osób i synchronizacji:
1. Potrzebujesz dwóch urządzeń/przeglądarek z dwoma różnymi kontami
2. Potrzebujesz zajęcia które mają DOKŁADNIE 1 wolne miejsce (np. "9/10")
3. Jeśli nie ma takich zajęć:
   - Poproś Tomasz Skrzypczyk o stworzenie zajęć z limitem 2 osoby
   - Zapisz się na nie z jednego konta
   - Teraz masz "1/2" - ostatnie miejsce

**Kroki testowe:**
1. **Urządzenie 1:** Zaloguj użytkownik A, wejdź na zajęcia z ostatnim miejscem
2. **Urządzenie 2:** Zaloguj użytkownik B, wejdź na te same zajęcia
3. **Oba jednocześnie:** Kliknijcie "Zapisz się" w tym samym momencie
4. Sprawdźcie wyniki na obu urządzeniach

**Oczekiwany rezultat:**
- ✅ TYLKO JEDEN użytkownik dostaje potwierdzenie "Zapisano!"
- ✅ Drugi użytkownik dostaje błąd "Brak wolnych miejsc" LUB "Ktoś Cię wyprzedził"
- ✅ Licznik pokazuje "10/10" (pełne)
- ✅ NIE ma podwójnego bookingu (11/10)
- ✅ System obsługuje race condition poprawnie (database constraints + validation)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 15: Admin - Zarządzanie Sekcjami (Scenariusze 81-84)

**UWAGA:** Te scenariusze wymagają konta z uprawnieniami admin.

### Scenariusz 81: Tworzenie Nowej Sekcji 💻

**Cel:** Sprawdzić dodawanie nowej sekcji zajęć przez admina.

**Przygotowanie:**
Zaloguj się na konto z uprawnieniami administratora.

**Kroki testowe:**
1. Panel Admina → zakładka "Sekcje"
2. Kliknij "Dodaj sekcję"
3. Wypełnij formularz:
   - Nazwa: "Pilates"
   - Opis: "Zajęcia wzmacniające mięśnie głębokie"
   - Kolor: wybierz kolor (np. zielony)
   - WhatsApp grupa: opcjonalny link
4. Upload zdjęcia sekcji (jeśli jest opcja)
5. Kliknij "Utwórz sekcję"

**Oczekiwany rezultat:**
- ✅ Formularz ma wszystkie potrzebne pola
- ✅ Walidacja:
  - Nazwa wymagana (nie może być pusta)
  - Nazwa unikalna (nie może być duplikat)
- ✅ Po zapisaniu:
  - Widzisz komunikat "Sekcja utworzona"
  - Nowa sekcja pojawia się na liście
  - Sekcja jest dostępna w harmonogramie (filtr)
  - Możesz tworzyć zajęcia w tej sekcji

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 82: Edycja Istniejącej Sekcji 💻

**Cel:** Sprawdzić edycję sekcji.

**Przygotowanie:**
Kontynuacja Scenariusza 81 LUB użyj istniejącej sekcji (np. "Fitness").

**Kroki testowe:**
1. Panel Admina → "Sekcje"
2. Znajdź sekcję "Pilates" (lub inną)
3. Kliknij "Edytuj" ✏️
4. Zmień opis: "Zajęcia wzmacniające core i poprawiające postawę"
5. Zmień link WhatsApp
6. Kliknij "Zapisz zmiany"

**Oczekiwany rezultat:**
- ✅ Możesz edytować wszystkie pola
- ✅ Zmiana nazwy aktualizuje się wszędzie (harmonogram, zajęcia)
- ✅ Po zapisaniu zmiany są widoczne natychmiast
- ✅ Historia zmian jest logowana (opcjonalnie)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 83: Usuwanie Sekcji (Pusta) 💻

**Cel:** Sprawdzić usuwanie sekcji bez zajęć.

**Przygotowanie:**
Potrzebujesz sekcji która NIE ma żadnych zajęć (ani aktywnych, ani archiwalnych).

**Kroki testowe:**
1. Panel Admina → "Sekcje"
2. Znajdź sekcję bez zajęć (licznik "0 zajęć")
3. Kliknij "Usuń" 🗑️
4. Potwierdź usunięcie

**Oczekiwany rezultat:**
- ✅ Sekcja bez zajęć może być usunięta
- ✅ Dialog pytający "Czy na pewno?"
- ✅ Po potwierdzeniu sekcja znika z listy
- ✅ Sekcja znika z filtrów w harmonogramie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 84: Blokada Usuwania Sekcji (Z Zajęciami) 💻

**Cel:** Sprawdzić że nie można usunąć sekcji która ma zajęcia.

**Przygotowanie:**
Potrzebujesz sekcji która MA jakieś zajęcia (np. "Fitness" - zazwyczaj ma dużo zajęć).

**Kroki testowe:**
1. Panel Admina → "Sekcje"
2. Znajdź sekcję z zajęciami (licznik "15 zajęć" lub więcej)
3. Sprawdź przycisk "Usuń"
4. Jeśli jest aktywny - kliknij
5. Sprawdź komunikat

**Oczekiwany rezultat:**
- ✅ Przycisk "Usuń" jest nieaktywny (szary, disabled)
- ✅ LUB po kliknięciu widzisz błąd:
  - "Nie można usunąć sekcji która ma zajęcia"
  - "Najpierw usuń wszystkie zajęcia z tej sekcji"
- ✅ Sekcja NIE została usunięta
- ✅ Zabezpieczenie przed przypadkowym usunięciem

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## Podsumowanie Testów

**Data testów:** _______________  
**Tester:** _______________  
**Wersja aplikacji:** _______________

**Wyniki:**
- ✅ Przeszły: ___ / 84
- ❌ Błędy: ___ / 84
- ⏭️ Pominięte: ___ / 84

**Top 3 problemy:**
1. 
2. 
3. 

**Uwagi ogólne:**


---

## Załącznik A: Jak Uzyskać Dostęp

**Konto użytkownika (user):**
- Użyj własnego konta utworzonego podczas rejestracji (Scenariusz 1)
- Każdy tester powinien stworzyć własne konto na własny email

**Uprawnienia trainera:**
- Jeśli potrzebujesz uprawnień trenera do testowania scenariuszy związanych z zarządzaniem zajęciami, skontaktuj się z **Tomasz Skrzypczyk** (skrzypczykt@gmail.com)

**Uprawnienia admina:**
- Jeśli potrzebujesz uprawnień administratora do testowania scenariuszy z SEKCJI 6 (Panel Admina), skontaktuj się z **Tomasz Skrzypczyk** (skrzypczykt@gmail.com)

**Kontakt w sprawie uprawnień:**
- Email: skrzypczykt@gmail.com
- W wiadomości napisz: który scenariusz testujesz i jakich uprawnień potrzebujesz

---

## Załącznik B: Kody Testowe BLIK (Autopay Sandbox)

- `111112` → Płatność sukces ✅
- `111121` → Nieprawidłowy kod ❌
- `111122` → Kod wygasł ⏰
- `111123` → Kod już użyty 🔁

---

## Załącznik C: Zgłaszanie Błędów - Template

```
Temat: [TEST] Scenariusz X - Krótki opis problemu

Scenariusz: #X - Nazwa scenariusza
Krok: X (który krok nie zadziałał)

Co się stało:
[Opisz co zobaczyłeś]

Co powinno się stać:
[Z oczekiwanego rezultatu]

Screenshot:
[Załącz jeśli możliwe]

Przeglądarka: Chrome / Safari / Firefox / Edge
Urządzenie: Desktop / Telefon (model) / Tablet (model)
```

---

**Dziękujemy za pomoc w testowaniu! 🦄**
