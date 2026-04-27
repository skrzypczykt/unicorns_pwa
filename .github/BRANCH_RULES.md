# Git Branch Strategy - Unicorns PWA

## Struktura Branchy

```
main (produkcja)
  ↑
  └── develop (staging)
        ↑
        ├── feature/nazwa-funkcji
        ├── bugfix/nazwa-buga
        ├── hotfix/pilna-naprawa
        └── test/nazwa-testu
```

## Zasady

### 🚫 ZABRONIONE

- ❌ Bezpośredni push do `main`
- ❌ Bezpośredni push do `develop`
- ❌ Force push (`git push -f`) do `main` lub `develop`
- ❌ Commit bez podbicia wersji (sprawdza pre-commit hook)

### ✅ DOZWOLONE

1. **Feature development:**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nazwa-funkcji
   # ... praca ...
   git push origin feature/nazwa-funkcji
   # Utwórz PR: feature/nazwa -> develop
   ```

2. **Bugfix:**
   ```bash
   git checkout develop
   git checkout -b bugfix/opis-buga
   # ... naprawa ...
   git push origin bugfix/opis-buga
   # PR: bugfix/* -> develop
   ```

3. **Hotfix (pilne na produkcji):**
   ```bash
   git checkout main
   git checkout -b hotfix/krytyczny-bug
   # ... naprawa ...
   git push origin hotfix/krytyczny-bug
   # PR: hotfix/* -> main (wymaga 2 approvals)
   # Potem merge hotfix -> develop też
   ```

## Workflow Krok po Kroku

### 1. Nowa funkcjonalność

```bash
# 1. Synchronizuj develop
git checkout develop
git pull origin develop

# 2. Utwórz branch
git checkout -b feature/dodaj-kalendarz

# 3. Pracuj (commituj często)
git add .
git commit -m "Wersja 0.3.0: Dodano widok kalendarza"
# ⚠️ Pre-commit hook sprawdzi czy podbita wersja w frontend/src/version.ts

# 4. Push
git push origin feature/dodaj-kalendarz

# 5. Utwórz Pull Request na GitHub
# feature/dodaj-kalendarz -> develop
# Tytuł: "Dodaj widok kalendarza"
# Opisz co zmieniłeś, załącz screenshots

# 6. Poczekaj na:
# - ✅ Testy (GitHub Actions auto-run)
# - ✅ Review (jeśli pracujesz w zespole)
# - ✅ Netlify preview deploy (branch preview)

# 7. Merge (przez GitHub UI, przycisk "Merge")
# Branch zostanie auto-usunięty po merge
```

### 2. Deploy na staging (develop)

```bash
# Po merge do develop:
# - ✅ Automatyczne testy (GitHub Actions)
# - ✅ Automatyczny deploy na https://develop--unicorns.netlify.app
# - ⏳ Ręczne testy przez zespół

# Jeśli OK, przejdź do kroku 3
# Jeśli błąd, napraw w nowym feature/* branchu
```

### 3. Deploy na produkcję (main)

```bash
# 1. Utwórz Pull Request: develop -> main
# 2. W opisie PR:
#    - Lista zmian (z CHANGELOG.md)
#    - Numer wersji (np. v0.3.0)
#    - Link do testów na staging
# 3. Poczekaj na approval (jeśli pracujesz w zespole)
# 4. Merge
# 5. ✅ Automatyczny deploy na produkcję

# UWAGA: main = tylko stabilne, przetestowane wersje!
```

## Konwencja Nazewnictwa Branchy

| Typ | Prefix | Przykład |
|-----|--------|----------|
| Nowa funkcjonalność | `feature/` | `feature/platnosci-blik` |
| Naprawa błędu | `bugfix/` | `bugfix/fix-payment-webhook` |
| Pilna naprawa produkcji | `hotfix/` | `hotfix/critical-security-fix` |
| Testy/eksperymenty | `test/` | `test/new-ui-library` |
| Release candidate | `release/` | `release/v1.0.0` |

**Dobre nazwy:**
- ✅ `feature/member-zone-dashboard`
- ✅ `bugfix/fix-duplicate-booking`
- ✅ `hotfix/payment-webhook-validation`

**Złe nazwy:**
- ❌ `tymczasowy`
- ❌ `test`
- ❌ `poprawki`
- ❌ `wip` (work in progress - zamiast tego draft PR)

## Versioning (Semver)

Każdy merge do `main` = nowa wersja w `frontend/src/version.ts`

**Zasada:**
- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes (API, struktura danych)
- **MINOR** (0.1.0 -> 0.2.0): Nowe funkcjonalności (backward compatible)
- **PATCH** (0.1.0 -> 0.1.1): Bug fixy, małe poprawki

**Przykłady:**
- Dodano strefę członka → `0.2.0` -> `0.3.0` (MINOR)
- Naprawiono duplikat webhook → `0.3.0` -> `0.3.1` (PATCH)
- Zmieniono API płatności → `0.3.1` -> `1.0.0` (MAJOR)

**Pre-commit hook** wymusza podbicie wersji przy każdym commicie.

## GitHub Branch Protection Rules

### Main Branch

**Settings → Branches → Add rule:**
- Branch name pattern: `main`
- ✅ Require pull request before merging
- ✅ Require approvals: 1 (jeśli zespół > 1 osoby)
- ✅ Require status checks to pass
  - ✅ `unit-tests`
  - ✅ `e2e-tests`
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing (nawet admins)
- ✅ Restrict pushes (only via PR)

### Develop Branch

**Settings → Branches → Add rule:**
- Branch name pattern: `develop`
- ✅ Require pull request before merging
- ✅ Require status checks to pass
  - ✅ `unit-tests`
  - ✅ `e2e-tests`
- ✅ Require branches to be up to date
- ⏹️ Allow force pushes (tylko dla maintainers)

## Netlify Deploy Strategy

**Aby ograniczyć koszty:**

```toml
# netlify.toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/dist"

# Deploy TYLKO z develop i main
[context.production]
  branch = "main"

[context.develop]
  branch = "develop"

# Inne branche: NIE auto-deploy
# Branch previews tylko na żądanie (manual)
```

**Oszczędność:**
- Feature branches → NIE deployują automatycznie
- Tylko develop + main → auto-deploy
- Mniej buildów = mniej kosztów

## Checklist przed Merge do Main

- [ ] Wersja podbita w `frontend/src/version.ts`
- [ ] CHANGELOG.md zaktualizowany
- [ ] Wszystkie testy przechodzą (✅ green)
- [ ] Przetestowane na staging (develop)
- [ ] Brak konfliktów z main
- [ ] PR ma approval (jeśli zespół)
- [ ] Breaking changes udokumentowane

## FAQ

**Q: Zapomniałem podbić wersji, commit już zrobiony**
```bash
# Amend ostatniego commita (jeśli nie wypushowany)
# 1. Podbij wersję w frontend/src/version.ts
# 2. git add frontend/src/version.ts
# 3. git commit --amend --no-edit
# 4. git push (lub git push -f jeśli już wypushowany do feature/*)
```

**Q: Chcę przetestować zmianę przed merge do develop**
```bash
# 1. Push do feature/* brancha
git push origin feature/moj-branch

# 2. Na Netlify - ręcznie trigger deploy preview
# LUB użyj lokalnego preview:
npm run build && npm run preview
```

**Q: Pilny bugfix na produkcji, co robić?**
```bash
# 1. Hotfix branch z main
git checkout main
git pull
git checkout -b hotfix/nazwa

# 2. Fix + commit + push
git push origin hotfix/nazwa

# 3. PR: hotfix/* -> main (URGENT label)
# 4. Po merge do main, KONIECZNIE merge też do develop:
git checkout develop
git merge main
git push
```

**Q: Jak wycofać zmiany z produkcji?**
```bash
# Opcja A: Revert commit (BEZPIECZNE)
git checkout main
git revert <commit-hash>
git push origin main

# Opcja B: Rollback do poprzedniej wersji (Netlify UI)
# Settings → Deploys → Production deploys → "Publish deploy" na starszą

# NIE używaj: git reset --hard (niebezpieczne!)
```

---

**Ostatnia aktualizacja:** 2026-04-26  
**Właściciel:** Tomasz Skrzypczyk  
**Pytania?** Otwórz Issue z tagiem `question`
