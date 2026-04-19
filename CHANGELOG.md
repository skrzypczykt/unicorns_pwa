# Changelog

Wszystkie ważne zmiany w projekcie Unicorns PWA.

Format bazuje na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).

## [0.2.2] - 2026-04-19

### Zmieniono

- **Model płatności POST-PAID** - oznaczenie obecności przez trenera nie tworzy już transakcji księgowych
- Trener tylko rejestruje fakt obecności (status `attended`), płatność to osobny proces
- Cofnięcie obecności nie zmienia salda użytkownika (tylko status)

### Naprawiono

- Usunięto błędną logikę pobierania środków z `user_section_balances` przy oznaczaniu obecności
- Usunięto mylące alerty o pobraniu/zwrocie środków

### Dodano

- Plik `CLAUDE.md` z instrukcjami dla AI (workflow git, zasady wersjonowania)

## [0.2.1] - 2026-04-19

### Zmieniono

- **Widok trenera** - wyświetlanie statusu płatności zamiast salda sekcji
- **AdminUsersPage** - zamiana formularza zarządzania saldem na widok historii transakcji
- **Formatowanie czasu trwania** - inteligentne wyświetlanie (>120 min → godziny, ≥24h → dni)
- **Naprawiono** obliczanie liczby instancji dla wydarzeń cyklicznych (auto-ustawienie `recurrence_pattern`)
- **Naprawiono** overflow przycisku "Zaloguj się" w menu publicznym
- **Naprawiono** pozycjonowanie przycisków akcji w kartach wydarzeń (admin)

### Usunięto

- Wyświetlanie salda użytkownika w całej aplikacji (karty salda, kolumny "Saldo przed/po")
- Przyciski "Opłać" z historii transakcji (nieużywane)
- Nieużywane komponenty: Navigation.tsx, App.css, pusty katalog services/

### Bezpieczeństwo

- Blokada wielokrotnej płatności za to samo wydarzenie (status `payment_status === 'paid'`)

## [0.2.0] - 2026-04-19

### Dodano

- **Edycja profilu użytkownika**
  - Nowa strona `/edit-profile` z formularzem edycji
  - Pola: imię, nazwisko, telefon, wyświetlana nazwa
  - Migracja bazy: dodano kolumny `first_name`, `last_name`, `phone`
  - Auto-generowanie `display_name` z imienia i nazwiska

- **Panel powiadomień**
  - Nowa strona `/notifications` z historią powiadomień
  - Typy powiadomień: przypomnienie o płatności, nowe zajęcia, wydarzenie specjalne
  - Oznaczanie jako przeczytane, badge "Nowe"
  - Link w hamburger menu
  - Migracja bazy: kolumny `type`, `read_at` w `push_notifications_log`

- **Przycisk Wstecz dla iOS**
  - Dedykowany przycisk "← Wstecz" dla urządzeń iOS
  - Warunkowe renderowanie (tylko iOS)
  - Detekcja przez user agent

- **Filtry w panelu admina**
  - Zakładki: Aktywne, Minione, Anulowane, Wszystkie
  - Dynamiczny nagłówek z licznikiem
  - Filtrowanie po statusie wydarzenia

- **Filtry w "Moje Rezerwacje"**
  - Zakładki: Aktywne, Anulowane, Wszystkie
  - Domyślnie pokazuje aktywne rezerwacje
  - Dynamiczny nagłówek z licznikiem

- **Automatyzacja wydarzeń cyklicznych**
  - GitHub Actions workflow (codziennie o 2:00 UTC)
  - Edge Function `generate-recurring-activities-cron`
  - Limit generowania: 8 tygodni do przodu

### Zmieniono

- **Unifikacja nazewnictwa** - "Moje zajęcia" → "Moje Rezerwacje" w całej aplikacji
- **Komunikaty rezerwacji**
  - "Klamka zapadła! Szykuj się na świetny czas. 💪" dla spóźnionych anulowań (nie-płatne)
  - Komunikat kontaktowy dla opłaconych rezerwacji (tylko płatne zajęcia > 0 zł)
  - Ukrycie przycisku "Anuluj" tylko dla płatnych opłaconych rezerwacji

### Usunięto

- **Przycisk "Strefa użytkownika"** z PublicAboutPage (duplikat funkcjonalności)

### Naprawiono

- **Przycisk "Zaloguj się"** w PublicHamburgerMenu - teraz mieści się w menu
- **Komunikat opłaconej rezerwacji** - nie pokazuje się dla darmowych zajęć (0.00 zł)
- **Limit rezerwacji** - dodano limit 100 dla bezpieczeństwa

---

## [0.1.25] - 2026-04-19

### Dodano

- **Zdjęcia w sekcji Aktualności**
  - Każdy artykuł na stronie `/news` ma teraz przypisane zdjęcie
  - Layout kafelków zmieniony na responsywny z obrazkiem po lewej stronie (desktop) lub na górze (mobile)
  - 3 najnowsze aktualności na stronie głównej również z miniaturami zdjęć
  - Zdjęcia z unicorns.org.pl oraz Unsplash dla artykułów ogólnych

### Zmieniono

- **Ikona użytkownika w headerze** - zmieniono z 👤 na 🤵 (mężczyzna w smokingu)
- **Terminologia** - zamieniono "Członkowie" na "Użytkownicy" w opisie aplikacji PWA w Timeline
  - "Członek" pozostaje dla członków stowarzyszenia (membership)
  - "Użytkownik" dla wszystkich użytkowników aplikacji

---

## [0.1.24] - 2026-04-18

### Dodano

- **Strona "Aktualności"** (`/news`)
  - Dostępna bez logowania
  - Lista wszystkich najnowszych wpisów ze strony unicorns.org.pl
  - Sekcja z 3 najnowszymi aktualnościami na stronie głównej
  - Link w hamburger menu i stopce
  - Pełne artykuły w aplikacji z obrazkami (np. `/news/turniej-badmintona-2025`)
  - Pierwszy pełny artykuł: "Turniej badmintona za nami!" z 3 zdjęciami medalistów

- **Zaktualizowana sekcja "Nasza Historia"**
  - Timeline z prawdziwymi datami i wydarzeniami Stowarzyszenia
  - Zdjęcia ze strony unicorns.org.pl (logo, urodziny, turnieje)
  - 7 kluczowych momentów: od założenia (2023) do aplikacji PWA (2026)
  - Wydarzenia: Bal Rogacza, BadCup, Mini Ligi, Championship 2025

- **Rozbudowana strona "Wsparcie/Darowizny"**
  - Pełne dane do przelewu bankowego (odbiorca, numer konta, SWIFT)
  - Przycisk kopiowania numeru konta
  - Szczegółowe informacje o odliczeniu podatkowym (do 6% dochodu)
  - Różnica między darowizną a 1,5% podatku
  - Informacja o przeznaczeniu środków
  - Ochrona danych osobowych

- **Welcome Modal z powiadomieniami**
  - Wyskakujące okienko przy pierwszym uruchomieniu aplikacji
  - Zachęta do włączenia powiadomień push
  - Pokazuje się tylko raz (zapisywane w localStorage)
  - Lista korzyści z włączenia powiadomień

- **Nowa strona "Moje Konto"** (`/account`)
  - Przegląd informacji o koncie
  - Wyświetlanie salda i historii transakcji
  - Doładowanie BLIK (placeholder - w przygotowaniu)
  - Szybkie akcje: przejście do ustawień, edycji profilu

- **Nowa strona "Ustawienia"** (`/settings`)
  - Zaawansowane ustawienia powiadomień (push, email, SMS)
  - Przypomnienia o zajęciach
  - Alerty nowych aktywności i salda
  - Aktualności stowarzyszenia
  - Instalacja PWA
  - Zmiana hasła
  - Eksport danych (JSON)
  - Usunięcie konta (placeholder - kontakt z admin)

- **Wersjonowanie aplikacji**
  - Numer wersji widoczny w stopce wszystkich stron
  - Plik `frontend/src/version.ts` z aktualną wersją
  - Dokumentacja wersjonowania w `VERSIONING.md`

- **3D Flip Card Animation**
  - Animacja obracania karty przy anulowaniu rezerwacji (Moje zajęcia)
  - Animacja obracania karty przy zapisywaniu na zajęcia (Harmonogram)
  - Ikony emoji: smutny jednorożec 🦄💔 (anulowanie), szczęśliwy 🦄✨ (zapis)

- **Hamburger Menu**
  - Kompletne menu nawigacyjne w prawym górnym rogu
  - Sekcje: Strona główna, Harmonogram, Moje rezerwacje, Strefa Członka, Moje Konto, Ustawienia, Darowizny
  - Panel trenera (dla trenerów i adminów)
  - Panel admina (tylko dla adminów)
  - Wylogowanie

### Zmieniono

- **Ciemny header (czarny gradient)** - lepiej komponuje się z logo na czarnym tle
- **Usunięto wszystkie przyciski "Powrót"** - hamburger menu je zastępuje
- **Ikonka użytkownika w headerze** - zamiast nazwy roli pokazuje się 👤 + imię i nazwisko
- **Usunięto kafelek "Powiadomienia o nowych zajęciach"** - zastąpiony szczegółowymi ustawieniami w zakładce Ustawienia
- **Przeprojektowano ustawienia powiadomień** - teraz jako lista toggle'i w Settings zamiast osobnego kafelka
- **Usunięto stronę Dashboard** - wszystkie nawigacje `/dashboard` przekierowują na `/` (stronę główną)
- **Usunięto "Profil (stary)"** z hamburger menu
- **Ujednolicono header** - ten sam header dla zalogowanych użytkowników na wszystkich stronach
- **Ukryto przyciski "Powrót"** - hamburger menu je zastępuje, nie są już potrzebne
- **Anulowane zajęcia są wyszarzone** - w "Moje zajęcia" anulowane rezerwacje mają obniżoną przezroczystość i grayscale
- **Zmieniono "Strefa użytkownika" na "Strona główna"** w hamburger menu

### Naprawiono

- **Strona Aktualności pokazuje header z hamburger menu** - dla zalogowanych użytkowników
- **Data aktualizacji salda dla nowych użytkowników** - dla nowych kont nie wyświetla się data z 1970 roku
- **Duplikaty badge "Opłacone"** - naprawiono logikę wyświetlania statusu płatności w liście rezerwacji
- **Badge overflow** - poprawiono responsywność i zawijanie badge'ów na małych ekranach
- **Polskie znaki w CSV** - eksporty raportów finansowych używają UTF-8 BOM i polskiego formatu (średnik, przecinek dziesiętny)
- **Z-index hamburger menu** - menu zawsze jest na wierzchu (z-index 9999)

---

## [0.1.0] - 2026-04-01

### Dodano

- Podstawowa aplikacja PWA
- System logowania i rejestracji
- Harmonogram zajęć i wydarzeń
- System rezerwacji
- Panel administratora
- Panel trenera
- Strefa Członka Stowarzyszenia
- System powiadomień push
- Instalacja PWA na iOS i Android
