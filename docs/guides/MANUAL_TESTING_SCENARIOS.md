# Scenariusze Testów Manualnych - Unicorns PWA

## Informacje Ogólne

**Przeznaczenie:** Ten dokument zawiera szczegółowe scenariusze testów dla osób nietechnicznych (testerzy, członkowie zespołu, rodzice-wolontariusze).

**Wersja:** Beta Testing v1.0  
**Data:** 2026-04-26  
**Środowisko testowe:** https://unicorns-test.netlify.app

---

## Jak Korzystać z Tego Dokumentu

### Dla testera:

1. **Przygotuj środowisko:**
   - Komputer lub telefon
   - Przeglądarka: Chrome, Safari, Firefox lub Edge
   - Notatnik do zapisywania problemów

2. **Dla każdego scenariusza:**
   - Przeczytaj cały scenariusz przed rozpoczęciem
   - Wykonaj kroki dokładnie w podanej kolejności
   - Zaznacz ✅ jeśli przeszedł, ❌ jeśli błąd
   - Jeśli błąd: zapisz co się stało + screenshot

3. **Zgłaszanie problemów:**
   - Email: unicorns.lodz@gmail.com
   - Tytuł: "[TEST] Nazwa scenariusza - krótki opis problemu"
   - Treść: Kroki które wykonałeś, co się stało, screenshot

---

## SEKCJA 1: Rejestracja i Logowanie (Scenariusze 1-8)

### Scenariusz 1: Rejestracja Nowego Użytkownika

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

### Scenariusz 2: Logowanie Istniejącego Użytkownika

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

### Scenariusz 3: Resetowanie Hasła

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

### Scenariusz 4: Wylogowanie

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

### Scenariusz 5: Walidacja Formularza Rejestracji - Email

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

### Scenariusz 6: Walidacja Formularza - Hasło Za Krótkie

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

### Scenariusz 7: Walidacja - Hasła Nie Pasują

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

### Scenariusz 8: Duplikat Email - Nie Można Użyć Tego Samego Email Dwukrotnie

**Cel:** Sprawdzić że jeden email = jedno konto.

**Wymagania wstępne:**
- Istniejące konto z emailem test@example.com

**Kroki:**
1. Wejdź na formularz rejestracji
2. Wpisz email który JUŻ ISTNIEJE: test@example.com
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

### Scenariusz 9: Wyświetlanie Listy Zajęć

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

### Scenariusz 10: Filtrowanie Zajęć Po Dacie

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

### Scenariusz 11: Filtrowanie Po Sekcji

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

### Scenariusz 12: Resetowanie Filtrów

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

### Scenariusz 13: Szczegóły Zajęć

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

### Scenariusz 14: Zajęcia Pełne - Brak Miejsc

**Cel:** Sprawdzić komunikat gdy zajęcia wypełnione.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Zajęcia z limitem np. 10/10 (pełne)

**Kroki:**
1. Znajdź zajęcia które są pełne (10/10)
2. Kliknij na nie
3. Sprawdź przycisk zapisz się

**Oczekiwany rezultat:**
- ✅ Widzisz badge "Brak miejsc" LUB "Pełne"
- ✅ Przycisk "Zapisz się" jest nieaktywny (szary)
- ✅ Widzisz komunikat "Niestety wszystkie miejsca zajęte"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 15: Sortowanie Listy Zajęć

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

### Scenariusz 16: Mobile - Responsywność Harmonogramu

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

### Scenariusz 17: Zapis na Bezpłatne Zajęcia

**Cel:** Sprawdzić proces zapisu na darmowe zajęcia.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Zajęcia BEZPŁATNE (cena = 0 zł) z wolnymi miejscami

**Kroki:**
1. Wejdź na Harmonogram
2. Znajdź zajęcia bezpłatne (0 zł)
3. Kliknij na nie
4. Kliknij "Zapisz się"
5. Potwierdź zapis (jeśli jest dialog)

**Oczekiwany rezultat:**
- ✅ Widzisz komunikat "Zapisano na zajęcia!"
- ✅ Zajęcia pojawiają się w "Moje Rezerwacje"
- ✅ NIE było procesu płatności (bezpłatne)
- ✅ Liczba zapisanych +1 (np. było 5/10, teraz 6/10)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 18: Zapis na Płatne Zajęcia (Bez Płacenia)

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

### Scenariusz 19: Płatność BLIK - Sukces

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

### Scenariusz 20: Płatność BLIK - Błędny Kod

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

### Scenariusz 21: Płatność PayByLink (Przelew)

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

### Scenariusz 22: Duplikat Zapisu - Nie Można Zapisać Się Dwukrotnie

**Cel:** Sprawdzić że nie można się zapisać 2x na te same zajęcia.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Już zapisany na zajęcia "Fitness 27.04 18:00"

**Kroki:**
1. Wejdź na Harmonogram
2. Znajdź zajęcia na które JUŻ JESTEŚ ZAPISANY
3. Kliknij na nie
4. Spróbuj kliknąć "Zapisz się"

**Oczekiwany rezultat:**
- ✅ Przycisk "Zapisz się" jest nieaktywny LUB nie istnieje
- ✅ Widzisz badge "Już zapisany" LUB podobny komunikat
- ✅ NIE możesz się zapisać drugi raz

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 23: Anulowanie Rezerwacji (Przed Deadline)

**Cel:** Sprawdzić anulowanie rezerwacji w terminie.

**Wymagania wstępne:**
- Zalogowany użytkownik
- Nieopłacona rezerwacja na zajęcia jutro (deadline NIE minął)

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Znajdź rezerwację którą chcesz anulować
3. Sprawdź deadline (np. "Możesz anulować do: 26.04 17:00")
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

### Scenariusz 24: Anulowanie Po Deadline - Blokada

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

### Scenariusz 25: Anulowanie Opłaconych Zajęć - Blokada

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

### Scenariusz 26: Widok Moich Rezerwacji - Chronologia

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

### Scenariusz 27: Termin Płatności - Przypomnienie

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

### Scenariusz 28: Wydarzenia Specjalne - Zapis

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

### Scenariusz 29: Edycja Profilu - Imię i Nazwisko

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

### Scenariusz 30: Edycja Profilu - Telefon

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

### Scenariusz 31: Zmiana Hasła

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

### Scenariusz 32: Powiadomienia Email - Wyłączenie

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

### Scenariusz 33: Powiadomienia Push - Włączenie

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

### Scenariusz 34: Usunięcie Konta - Dialog Potwierdzenia

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

### Scenariusz 35: Historia Płatności

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

### Scenariusz 36: Zapis na Wydarzenie Online

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

### Scenariusz 37: Dołączanie do Zajęć Online - Przed Czasem

**Cel:** Sprawdzić że link jest niedostępny przed rozpoczęciem.

**Wymagania wstępne:**
- Zapisany na zajęcia online JUTRO

**Kroki:**
1. Wejdź w "Moje Rezerwacje"
2. Znajdź zajęcia online jutro
3. Sprawdź czy widzisz przycisk "Dołącz"

**Oczekiwany rezultat:**
- ✅ Przycisk "Dołącz" NIE jest widoczny LUB jest nieaktywny
- ✅ Widzisz komunikat "Link będzie dostępny 15 min przed zajęciami"

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 38: Dołączanie do Zajęć Online - W Trakcie

**Cel:** Sprawdzić link do zajęć podczas trwania.

**Wymagania wstępne:**
- Zapisany na zajęcia online TERAZ (symulacja: zmień czas systemowy LUB poproś admina)

**Kroki:**
1. Gdy zajęcia już się zaczęły (0-15 min przed lub w trakcie)
2. Wejdź w "Moje Rezerwacje"
3. Kliknij "Dołącz do spotkania"

**Oczekiwany rezultat:**
- ✅ Przycisk "Dołącz" jest widoczny i aktywny
- ✅ Kliknięcie otwiera link Zoom/Meet w nowej karcie
- ✅ Link działa (przekierowuje do Zoom/Meet)

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

## SEKCJA 6: Panel Admina (Scenariusze 39-46)

**UWAGA:** Te scenariusze wymagają konta z rolą "admin". Skontaktuj się z zespołem aby otrzymać konto testowe.

### Scenariusz 39: Logowanie jako Admin

**Cel:** Sprawdzić dostęp do panelu admina.

**Wymagania wstępne:**
- Konto admin (email: admin@unicorns.test, hasło: AdminTest123!)

**Kroki:**
1. Zaloguj się kontem admin
2. Sprawdź menu
3. Kliknij "Panel Admina"

**Oczekiwany rezultat:**
- ✅ W menu widzisz opcję "Panel Admina"
- ✅ Możesz wejść w Panel Admina
- ✅ Widzisz sekcje: Zajęcia, Użytkownicy, Płatności

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 40: Dodawanie Nowych Zajęć (Admin)

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

### Scenariusz 41: Edycja Istniejących Zajęć (Admin)

**Cel:** Sprawdzić edycję zajęć.

**Wymagania wstępne:**
- Zalogowany admin
- Istniejące zajęcia "Test Yoga"

**Kroki:**
1. Panel Admina → Zajęcia
2. Znajdź "Test Yoga"
3. Kliknij "Edytuj" ✏️
4. Zmień cenę z 50 zł na 45 zł
5. Zmień limit z 12 na 15
6. Kliknij "Zapisz zmiany"

**Oczekiwany rezultat:**
- ✅ Widzisz "Zmiany zapisane"
- ✅ Cena = 45 zł
- ✅ Limit = 15 miejsc
- ✅ Zmiany widoczne w Harmonogramie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 42: Usuwanie Zajęć (Admin)

**Cel:** Sprawdzić usuwanie zajęć.

**Wymagania wstępne:**
- Zalogowany admin
- Zajęcia bez żadnych rezerwacji

**Kroki:**
1. Panel Admina → Zajęcia
2. Znajdź zajęcia bez rezerwacji (0/12)
3. Kliknij "Usuń" 🗑️
4. Potwierdź usunięcie

**Oczekiwany rezultat:**
- ✅ Widzisz dialog "Czy na pewno usunąć?"
- ✅ Po potwierdzeniu: "Zajęcia usunięte"
- ✅ Zajęcia znikają z listy
- ✅ NIE są widoczne w Harmonogramie

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 43: Blokada Usuwania Zajęć z Rezerwacjami

**Cel:** Sprawdzić że nie można usunąć zajęć gdy są rezerwacje.

**Wymagania wstępne:**
- Zalogowany admin
- Zajęcia z minimum 1 rezerwacją (np. 3/12)

**Kroki:**
1. Panel Admina → Zajęcia
2. Znajdź zajęcia Z rezerwacjami (3/12)
3. Kliknij "Usuń"
4. Sprawdź komunikat

**Oczekiwany rezultat:**
- ✅ Widzisz błąd "Nie można usunąć - są rezerwacje"
- ✅ Zajęcia NIE zostały usunięte
- ✅ Przycisk "Usuń" może być nieaktywny

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 44: Lista Użytkowników (Admin)

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

### Scenariusz 45: Zmiana Roli Użytkownika (Admin)

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

### Scenariusz 46: Panel Płatności - Statystyki (Admin)

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

### Scenariusz 47: Szybkość Ładowania Strony Głównej

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

### Scenariusz 48: Responsywność - Tablet

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

### Scenariusz 49: PWA - Dodanie do Ekranu Głównego (Mobile)

**Cel:** Sprawdzić instalację jako PWA.

**Wymagania wstępne:**
- Telefon (Android/iOS)
- Przeglądarka Chrome lub Safari

**Kroki:**
1. Otwórz stronę na telefonie
2. **Android:** Menu przeglądarki → "Dodaj do ekranu głównego"
3. **iOS:** Przycisk "Udostępnij" → "Dodaj do ekranu"
4. Kliknij ikonę na ekranie głównym

**Oczekiwany rezultat:**
- ✅ Pojawia się prompt "Dodaj Unicorns PWA do ekranu"
- ✅ Ikona pojawia się na ekranie głównym
- ✅ Otwiera się jak natywna aplikacja (bez paska przeglądarki)
- ✅ Działa tak samo jak w przeglądarce

**Status:** [ ] Przeszedł ✅  [ ] Błąd ❌  
**Notatki:**

---

### Scenariusz 50: Offline - Brak Internetu

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

## Podsumowanie Testów

**Data testów:** _______________  
**Tester:** _______________  
**Wersja aplikacji:** _______________

**Wyniki:**
- ✅ Przeszły: ___ / 50
- ❌ Błędy: ___ / 50
- ⏭️ Pominięte: ___ / 50

**Top 3 problemy:**
1. 
2. 
3. 

**Uwagi ogólne:**


---

## Załącznik A: Konta Testowe

**User (zwykły użytkownik):**
- Email: user@unicorns.test
- Hasło: UserTest123!

**Trainer:**
- Email: trainer@unicorns.test
- Hasło: TrainerTest123!

**Admin:**
- Email: admin@unicorns.test
- Hasło: AdminTest123!

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
