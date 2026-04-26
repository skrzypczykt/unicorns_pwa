# Wersjonowanie Unicorns PWA

## Schemat wersji

Używamy semantic versioning w formacie: `MAJOR.MINOR.PATCH`

Przykład: `0.1.24`

- **MAJOR** (0) - Główne zmiany, breaking changes
- **MINOR** (1) - Nowe funkcjonalności, backward-compatible
- **PATCH** (24) - Poprawki błędów, drobne zmiany

## Jak zaktualizować wersję

### Krok 1: Edytuj plik wersji

Otwórz `frontend/src/version.ts` i zaktualizuj numer wersji:

```typescript
export const APP_VERSION = '0.1.25' // Zmień tutaj
export const BUILD_DATE = new Date().toISOString().split('T')[0]
```

### Krok 2: Commituj i pushuj

```bash
git add frontend/src/version.ts
git commit -m "Bump version to 0.1.25"
git push
```

### Kiedy podbijać wersję?

- **PATCH (0.1.24 → 0.1.25)**: Poprawki błędów, drobne zmiany UI, optymalizacje
- **MINOR (0.1.24 → 0.2.0)**: Nowe funkcjonalności (np. nowa strona, nowy moduł)
- **MAJOR (0.1.24 → 1.0.0)**: Duże zmiany, przeprojektowanie, breaking changes

### Przykłady

- Poprawka błędu w formularzu → `0.1.24` → `0.1.25` (PATCH)
- Dodanie nowej strony "Ustawienia" → `0.1.24` → `0.2.0` (MINOR)
- Przeprojektowanie całej aplikacji → `0.1.24` → `1.0.0` (MAJOR)

## Changelog

Trzymaj changelog w `CHANGELOG.md` dla każdej wersji:

### [0.1.24] - 2026-04-18

**Dodano:**
- Strona "Moje Konto" z saldem i transakcjami
- Strona "Ustawienia" z zaawansowanymi powiadomieniami
- Wersjonowanie aplikacji (widoczne w stopce)

**Zmieniono:**
- Usunięto stronę Dashboard (przekierowanie na stronę główną)
- Ukryto przyciski "Powrót" (hamburger menu je zastępuje)
- Anulowane zajęcia są wyszarzone w "Moje zajęcia"

**Naprawiono:**
- Data aktualizacji salda dla nowych użytkowników (1970 bug)
- Duplicate badges "Opłacone" w liście rezerwacji

---

## WAŻNE

**Nie podbijaj wersji po każdym commicie!**

Podbijaj wersję tylko gdy:
- Wypychasz kod na produkcję
- Dodajesz znaczącą nową funkcjonalność
- Naprawiasz ważny bug i chcesz go oznaczyć

Drobne commity (refactoring, komentarze, itp.) nie wymagają zmiany wersji.
