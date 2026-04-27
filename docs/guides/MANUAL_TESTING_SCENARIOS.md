# Scenariusze Testów Manualnych - Unicorns PWA

## ⚠️ UWAGA: Większość Testów Jest Zautomatyzowana!

**84% testów** jest teraz wykonywanych automatycznie przez Playwright E2E.  
Ten dokument zawiera **TYLKO scenariusze wymagające manualnego testowania**.

**Pełna lista testów automatycznych:** `docs/guides/TEST_AUTOMATION_PROGRESS.md`

---

## Informacje Ogólne

**Przeznaczenie:** Scenariusze wymagające fizycznych urządzeń lub zewnętrznych systemów.

**Wersja:** v3.0 (Po Automatyzacji)  
**Data:** 2026-04-26  
**Środowisko testowe:** https://unicorns-test.netlify.app  
**Liczba scenariuszy manualnych:** 19 (16% - reszta zautomatyzowana)

---

## 📊 Co Jest Zautomatyzowane?

✅ **86 testów E2E** pokrywa:
- Rejestracja i logowanie (6 testów)
- Przeglądanie zajęć (5 testów)
- Rezerwacje (5 testów)
- Profil użytkownika (6 testów)
- Panel admina - zajęcia (8 testów)
- Panel admina - użytkownicy (10 testów)
- Panel admina - sekcje (9 testów)
- Zwroty i refundy (10 testów)
- Strefa członka (10 testów)
- Panel trenera (10 testów)
- Security i RLS (6 testów)

**Zobacz:** `frontend/tests/e2e/` - pełna lista testów

---

## 🧪 Scenariusze Manualne

### SEKCJA 1: Płatności (4 scenariusze)

**Wymagają:** Dostęp do Autopay Test Sandbox

#### Scenariusz M1: Płatność BLIK - Sukces 💻

**Przygotowanie:**
- Zalogowane konto
- Opłacone zajęcia w "Moje Rezerwacje"

**Kroki:**
1. Wejdź na "Moje Rezerwacje"
2. Znajdź nieopłacone zajęcia
3. Kliknij "Opłać"
4. Wybierz metodę: BLIK
5. Wpisz kod: **111112** (test code)
6. Kliknij "Zapłać"

**Oczekiwany rezultat:**
- ✅ Przekierowanie na stronę Autopay
- ✅ Komunikat "Płatność zaakceptowana"
- ✅ Powrót do aplikacji
- ✅ Status zmieniony na "Opłacone"

---

#### Scenariusz M2: Płatność BLIK - Błędny Kod 💻

**Kroki:**
1-4. (jak w M1)
5. Wpisz kod: **111121** (invalid code)
6. Kliknij "Zapłać"

**Oczekiwany rezultat:**
- ✅ Komunikat błędu "Nieprawidłowy kod BLIK"
- ✅ Status pozostaje "Nieopłacone"

---

#### Scenariusz M3: Płatność PayByLink 💻

**Kroki:**
1-3. (jak w M1)
4. Wybierz metodę: PayByLink (PBL)
5. Wybierz bank testowy
6. Na stronie banku kliknij "Zapłać"

**Oczekiwany rezultat:**
- ✅ Symulacja płatności bankiem
- ✅ Powrót do aplikacji
- ✅ Status "Opłacone"

---

#### Scenariusz M4: Zwrot Po Płatności 💻

**Przygotowanie:**
- Opłacone zajęcia (użyj M1)

**Kroki:**
1. Anuluj opłacone zajęcia
2. Poczekaj na zatwierdzenie zwrotu przez admina
3. Sprawdź status zwrotu w Profil → Zwroty

**Oczekiwany rezultat:**
- ✅ Wniosek o zwrot złożony
- ✅ Po zatwierdzeniu: status "Processed"
- ✅ Kwota zwrócona (sprawdź w historii)

---

### SEKCJA 2: PWA i Offline (3 scenariusze)

#### Scenariusz M5: Instalacja PWA - Android 🤖

**Wymagania:** Telefon Android + Chrome

**Kroki:**
1. Otwórz https://unicorns-test.netlify.app w Chrome
2. Menu (⋮) → "Dodaj do ekranu głównego"
3. Potwierdź "Dodaj"
4. Wyjdź z przeglądarki
5. Otwórz aplikację z ekranu głównego

**Oczekiwany rezultat:**
- ✅ Ikona aplikacji na ekranie
- ✅ Otwiera się w trybie standalone (bez paska Chrome)
- ✅ Wszystko działa jak normalna aplikacja

---

#### Scenariusz M6: Instalacja PWA - iOS 🍎

**Wymagania:** iPhone/iPad + Safari

**Kroki:**
1. Otwórz aplikację w Safari
2. Kliknij "Udostępnij" (kwadrat ze strzałką)
3. Przewiń w dół → "Dodaj do ekranu początkowego"
4. Potwierdź "Dodaj"
5. Otwórz z ekranu głównego

**Oczekiwany rezultat:**
- ✅ Ikona na ekranie
- ✅ Tryb standalone
- ✅ Działa offline (podstawowe funkcje)

---

#### Scenariusz M7: Tryb Offline 📱

**Wymagania:** Zainstalowana PWA (M5 lub M6)

**Kroki:**
1. Otwórz aplikację
2. Włącz tryb samolotowy / wyłącz WiFi
3. Odśwież aplikację
4. Spróbuj przeglądać harmonogram

**Oczekiwany rezultat:**
- ✅ Komunikat "Offline - dane z cache"
- ✅ Ostatnio przeglądane dane widoczne
- ✅ Płynne działanie (bez crashowania)

---

### SEKCJA 3: Powiadomienia Push (5 scenariuszy)

**Wymagają:** Fizyczne urządzenie z uprawnieniami push

#### Scenariusz M8: Włączenie Push - Desktop 💻

**Wymagania:** Chrome/Firefox Desktop

**Kroki:**
1. Zaloguj się
2. Profil → Ustawienia → Powiadomienia
3. Kliknij "Włącz powiadomienia push"
4. W dialogu przeglądarki: "Zezwól"

**Oczekiwany rezultat:**
- ✅ Dialog "Zezwól na powiadomienia"
- ✅ Po zatwierdzeniu: "Powiadomienia włączone"
- ✅ Ikonka dzwonka aktywna

---

#### Scenariusz M9: Powiadomienie - Nowe Zajęcia 📱

**Przygotowanie:**
- Push włączone (M8)
- Admin dodaje nowe zajęcia

**Kroki:**
1. Włącz push notifications
2. Poproś admina o dodanie nowych zajęć
3. Poczekaj do 1 minuty

**Oczekiwany rezultat:**
- ✅ Powiadomienie push: "Nowe zajęcia: [nazwa]"
- ✅ Kliknięcie → przekierowanie na harmonogram

---

#### Scenariusz M10: Powiadomienie - Przypomnienie 📱

**Przygotowanie:**
- Zapisane zajęcia za 24h
- Push włączone

**Kroki:**
1. Zapisz się na zajęcia za 24h
2. Poczekaj (lub zmień czas systemowy)

**Oczekiwany rezultat:**
- ✅ Push 24h przed: "Przypomnienie: zajęcia jutro"
- ✅ Push 1h przed: "Zajęcia za godzinę"

---

#### Scenariusz M11: Wyłączenie Push 📱

**Kroki:**
1. Profil → Ustawienia
2. Wyłącz "Powiadomienia push"
3. Potwierdź

**Oczekiwany rezultat:**
- ✅ Toggle wyłączony
- ✅ Brak dalszych powiadomień

---

#### Scenariusz M12: Push - Alert o Saldzie 📱

**Przygotowanie:**
- Push włączone
- Saldo ujemne (nieopłacone zajęcia)

**Kroki:**
1. Zapisz się na płatne zajęcia
2. Nie płać przez 48h

**Oczekiwany rezultat:**
- ✅ Push: "Zaległa płatność: [kwota] zł"

---

### SEKCJA 4: Wydarzenia Czasowe (3 scenariusze)

#### Scenariusz M13: Zajęcia Online - Przed Czasem 💻

**Przygotowanie:**
- Zajęcia online za 10 minut

**Kroki:**
1. Wejdź na szczegóły zajęć online
2. Spróbuj kliknąć link dołączenia

**Oczekiwany rezultat:**
- ✅ Link nieaktywny (szary)
- ✅ Komunikat: "Link będzie dostępny 15 min przed"

---

#### Scenariusz M14: Zajęcia Online - W Trakcie 💻

**Przygotowanie:**
- Zajęcia online trwają teraz

**Kroki:**
1. Wejdź na szczegóły zajęć
2. Kliknij link dołączenia

**Oczekiwany rezultat:**
- ✅ Link aktywny (niebieski)
- ✅ Otwiera spotkanie Zoom/Google Meet

---

#### Scenariusz M15: Anulowanie Po Deadline 💻

**Przygotowanie:**
- Zajęcia za mniej niż 24h

**Kroki:**
1. Spróbuj anulować rezerwację

**Oczekiwany rezultat:**
- ✅ Przycisk "Anuluj" nieaktywny
- ✅ Komunikat: "Nie można anulować - mniej niż 24h przed"

---

### SEKCJA 5: UX i Wydajność (4 scenariusze)

#### Scenariusz M16: Responsywność Tablet 📱

**Wymagania:** Tablet (iPad/Android)

**Kroki:**
1. Otwórz aplikację na tablecie
2. Przejdź przez: Harmonogram, Profil, Admin

**Oczekiwany rezultat:**
- ✅ Layout dopasowany (2 kolumny)
- ✅ Menu nawigacyjne czytelne
- ✅ Przyciski nie nakładają się

---

#### Scenariusz M17: Szybkość Ładowania 💻

**Kroki:**
1. Wyczyść cache przeglądarki
2. Otwórz aplikację
3. Zmierz czas do Interactive

**Oczekiwany rezultat:**
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.5s
- ✅ Lighthouse Score > 90

---

#### Scenariusz M18: Scroll Długiej Listy 💻

**Przygotowanie:**
- Harmonogram z 50+ zajęciami

**Kroki:**
1. Wejdź na Harmonogram
2. Przewiń do końca listy
3. Filtruj, sortuj, wyszukuj

**Oczekiwany rezultat:**
- ✅ Płynne scrollowanie (60 FPS)
- ✅ Brak lagów przy filtrowaniu
- ✅ Virtual scrolling działa

---

#### Scenariusz M19: Multi-tab Sync 💻

**Wymagania:** 2 karty przeglądarki

**Kroki:**
1. Otwórz aplikację w 2 kartach
2. W karcie 1: zapisz się na zajęcia
3. W karcie 2: odśwież

**Oczekiwany rezultat:**
- ✅ Karta 2 pokazuje aktualne dane
- ✅ Realtime sync (lub refresh prompt)

---

## 📋 Jak Zgłaszać Błędy

**Email:** skrzypczykt@gmail.com

**Tytuł:** `[MANUAL TEST] Scenariusz MX - Krótki opis`

**Treść:**
```
Scenariusz: MX
Urządzenie: [np. iPhone 14, Chrome Desktop]
OS: [np. iOS 17, macOS Sequoia]

Kroki:
1. ...
2. ...

Co się stało:
[opis + screenshot]

Oczekiwane:
[co powinno się stać]
```

---

## 🎯 Podsumowanie

**Manualne:** 19 scenariuszy (16%)  
**Automatyczne:** 86 testów E2E (84%)

**Czas testowania manualnego:** ~1 godzina (było 6h)

**Automatyczne testy uruchamiaj się:**
- Przy każdym PR do develop/main
- Lokalnie: `cd frontend && npm run test:e2e`

---

**Ostatnia aktualizacja:** 2026-04-26  
**Wersja:** 3.0 (Po Automatyzacji)
