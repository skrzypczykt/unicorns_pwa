# Instrukcje dla Claude Code

## Workflow Git

### ⚠️ NIGDY nie wykonuj `git push` automatycznie

**ZAWSZE** pytaj użytkownika przed wypchnięciem kodu do repozytorium.

### Przed każdym `git push` WYMAGANE jest podbicie wersji

1. **Zaktualizuj `frontend/src/version.ts`**
   - Zwiększ numer wersji zgodnie z [Semantic Versioning](https://semver.org/):
     - `MAJOR.MINOR.PATCH` (np. 0.2.1 → 0.2.2)
     - MAJOR: breaking changes
     - MINOR: nowe funkcjonalności (backward-compatible)
     - PATCH: bug fixes

2. **Zaktualizuj `CHANGELOG.md`**
   - Dodaj nową sekcję z numerem wersji i datą
   - Wymień wszystkie zmiany w kategoriach: Dodano, Zmieniono, Naprawiono, Usunięto, Bezpieczeństwo

3. **Commit wersji**
   ```bash
   git add frontend/src/version.ts CHANGELOG.md
   git commit -m "Wersja X.Y.Z"
   ```

4. **Dopiero wtedy `git push`** (po uzyskaniu zgody użytkownika)

## Model Płatności (POST-PAID)

Aplikacja działa w modelu **post-paid** (płatność po zajęciach):

- Trener **oznacza obecność** → tylko zmiana statusu `registrations.status = 'attended'`
- Obecność **NIE jest zdarzeniem księgowym** (nie tworzy transakcji, nie zmienia salda)
- **Płatność** to **osobny proces** (użytkownik płaci później przez BLIK/transfer)
- Cofnięcie obecności → tylko zmiana statusu (bez zwrotów)

## Wyświetlanie Salda

**NIE wyświetlaj salda użytkownika** nigdzie w aplikacji:
- Brak kart salda (ProfilePage, AccountPage)
- Brak kolumn "Saldo przed/po" w tabelach transakcji
- Historia transakcji pokazuje tylko: data, opis, typ, kwota

## Formatowanie Czasu Trwania

Użyj `utils/formatDuration.ts`:
- ≤ 120 min → "90 min"
- \> 120 min → "3h", "2h 30min"
- ≥ 24h → "2 dni", "1 dzień 5h"

## Blokada Wielokrotnej Płatności

- Jedna rezerwacja (activity_id + user_id) = jedna płatność
- Przycisk "Opłać" ukryty gdy `payment_status === 'paid'`
- Wydarzenia cykliczne: każda instancja (inne activity_id) to osobne wydarzenie
