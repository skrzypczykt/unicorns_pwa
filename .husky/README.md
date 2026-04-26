# Git Hooks - Unicorns PWA

## Pre-commit Hook

**Plik:** `.husky/pre-commit`

### Co robi?

Wymusza podbicie wersji w `frontend/src/version.ts` przed każdym commitem.

### Jak działa?

1. Sprawdza czy w staged files znajduje się `frontend/src/version.ts`
2. Jeśli **TAK** → commit przechodzi ✅
3. Jeśli **NIE** → commit jest blokowany ❌

### Przykładowy workflow

```bash
# 1. Zmieniasz kod
vim frontend/src/pages/HomePage.tsx

# 2. Próbujesz commitować
git add .
git commit -m "Dodano nową funkcję"

# ❌ BŁĄD: Musisz podbić wersję!

# 3. Podbijasz wersję
vim frontend/src/version.ts
# Zmień: export const VERSION = '0.2.9'
# Na:    export const VERSION = '0.3.0'

# 4. Dodaj plik wersji do stage
git add frontend/src/version.ts

# 5. Teraz commit przejdzie
git commit -m "Wersja 0.3.0: Dodano nową funkcję"

# ✅ Sukces!
```

### Semantic Versioning

Jak podbijać wersję?

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes (API, struktura danych)
- **MINOR** (0.2.0 -> 0.3.0): Nowe funkcjonalności (backward compatible)
- **PATCH** (0.2.0 -> 0.2.1): Bug fixy, małe poprawki

### Kiedy hook NIE sprawdza?

- Pierwszy commit w repozytorium (nie ma jeszcze HEAD)
- Merge commits (automatyczne)
- Revert commits

### Wyłączenie hooka (tylko w wyjątkowych sytuacjach!)

```bash
# NIE ZALECANE, ale możliwe:
HUSKY=0 git commit -m "Commit bez hooka"

# LUB:
git commit --no-verify -m "Commit bez hooka"
```

**UWAGA:** Używaj tylko gdy absolutnie konieczne (np. fix w dokumentacji README.md).

---

## Instalacja (dla nowych deweloperów)

```bash
# 1. Sklonuj repo
git clone https://github.com/tskrzypczyk/unicorns_pwa.git
cd unicorns_pwa

# 2. Zainstaluj zależności (root)
npm install

# 3. Hook automatycznie się zainstaluje (npm prepare)
# Gotowe!
```

---

## Troubleshooting

### "Hook nie działa"

```bash
# Sprawdź czy hook jest wykonywalny
ls -la .husky/pre-commit

# Jeśli nie:
chmod +x .husky/pre-commit
```

### "Chcę tymczasowo wyłączyć hook"

```bash
# Ustaw zmienną środowiskową
export HUSKY=0

# Twoje commity będą bez hooka
git commit -m "..."

# Włącz z powrotem
unset HUSKY
```

### "Hook failuje mimo że podbijam wersję"

```bash
# Sprawdź czy plik jest w stage
git status

# Powinno być:
# Changes to be committed:
#   modified:   frontend/src/version.ts

# Jeśli nie ma, dodaj:
git add frontend/src/version.ts
```

---

**Więcej info:** `.github/BRANCH_RULES.md` i `CLAUDE.md`
