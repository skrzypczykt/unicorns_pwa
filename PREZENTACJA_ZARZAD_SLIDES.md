---
marp: true
theme: default
paginate: true
backgroundColor: #fff
backgroundImage: linear-gradient(135deg, #e9d5ff 0%, #ffffff 50%, #fce7f3 100%)
style: |
  section {
    font-size: 24px;
  }
  h1 {
    color: #9333ea;
    font-size: 48px;
  }
  h2 {
    color: #a855f7;
    font-size: 36px;
  }
  table {
    font-size: 20px;
  }
  ul, ol {
    font-size: 22px;
  }
---

# 🦄 Unicorns Łódź
## Aplikacja PWA - Prezentacja dla Zarządu

**Data:** 21 kwietnia 2026  
**Wersja:** 0.3.0  
**Czas:** 60 minut

---

# 📋 Agenda

1. Wstęp i cele (5 min)
2. Funkcjonalności (15 min)
3. Technologie (10 min)
4. Bezpieczeństwo (10 min)
5. Płatności (10 min)
6. Koszty operacyjne (5 min)
7. Wdrożenie (5 min)

---

# 1. WSTĘP I CELE

---

## 🎯 Problem do rozwiązania

- ❌ Brak centralnego systemu zarządzania
- ❌ Ręczne listy obecności (Excel)
- ❌ Brak płatności online
- ❌ Rozproszenie informacji
- ❌ Brak kontroli nad saldami

---

## ✅ Rozwiązanie: PWA

**Progressive Web App**

- 📱 iOS, Android, Desktop
- 🔄 Działa offline
- 🚀 Szybka i bezpieczna
- 💰 Jedna platforma = niższe koszty

---

## 💡 Korzyści - Członkowie

- 📱 Łatwa rezerwacja (3 kliknięcia)
- 💳 Płatność online (BLIK, karta)
- 🔔 Powiadomienia push
- 📊 Przejrzysty widok rezerwacji
- 🏛️ Strefa członka

---

## 💡 Korzyści - Zarząd

- 📈 Statystyki real-time
- 💰 Automatyczne naliczanie opłat
- 📋 Raporty księgowe (CSV)
- 👥 Zarządzanie użytkownikami
- 🎯 Monitoring frekwencji

---

## 💡 Korzyści - Trenerzy

- ✅ Łatwe oznaczanie obecności
- 📱 Panel z listą uczestników
- 👀 Widok liczby zapisanych
- 💳 Status płatności uczestników

---

# 2. FUNKCJONALNOŚCI

---

## ✅ Harmonogram zajęć

- **Widok kalendarza** - jak Google Calendar
- **Widok kafelkowy** - tradycyjna lista
- **Filtrowanie** po sekcjach
- **Slide-in panel** - szczegóły
- **Wydarzenia online** - link Zoom/Meet
- **Grupa WhatsApp** - szybki link

---

## ✅ Moje rezerwacje

- Lista wszystkich rezerwacji
- Status płatności (✅ / 💳)
- Anulowanie (z limitem czasu)
- Sortowanie chronologiczne
- Historia anulowań

---

## ✅ Strefa Członka

**Dla członków stowarzyszenia:**

- 📰 Aktualności wewnętrzne
- 📄 Dokumenty (uchwały, protokoły)
- 🗳️ Głosowania online
- 💰 Składki członkowskie

---

## ✅ Panel Trenera

- Lista uczestników zajęć
- ✅ Checkbox obecności (1 klik)
- 💳 Status płatności uczestnika
- 📊 Statystyki frekwencji
- 📋 Moje zajęcia (wszystkie)

---

## ✅ Panel Admina - Zarządzanie

- **Zajęcia** - kreator, edycja, anulowanie
- **Sekcje** - badminton, taniec, fitness
- **Użytkownicy** - role, uprawnienia
- **Wydarzenia cykliczne** - auto-generowanie
- **Wydarzenia specjalne** - turnieje, imprezy

---

## ✅ Panel Admina - Raporty

- 📊 **Raport finansowy** - przychody/koszty
- 📈 **Raport frekwencji** - obecności
- 💾 **Export CSV** - format PL
- 🔍 **Filtry** - daty, sekcje, użytkownicy

---

## 🆕 NOWOŚĆ v0.3.0 - Płatności

- 💳 **Integracja płatności** - Autopay
- ✅ **Webhook** - auto-aktualizacja statusu
- 🔒 **Weryfikacja podpisów** - security
- 📊 **Dashboard admina** - statystyki
- 📝 **Audit log** - historia zdarzeń
- 💰 **Model PREPAID** - płatność z góry

---

## 🆕 NOWOŚĆ v0.3.0 - Bezpieczeństwo

**Ocena: 6.5/10 → 9.0/10** ✅

- ✅ Content Security Policy (CSP)
- ✅ HSTS (wymuszenie HTTPS)
- ✅ CORS restrictions
- ✅ OWASP Top 10 compliance
- ✅ PCI DSS SAQ A ready

---

# 3. TECHNOLOGIE

---

## 🏗️ Architektura

```
FRONTEND (React PWA) → Netlify
    ↓ HTTPS + JWT
BACKEND (Supabase) → Baza + API
    ↓
PŁATNOŚCI (Autopay)
```

---

## 🔧 Stack Frontend

| Tech | Wersja | Zastosowanie |
|------|--------|--------------|
| React | 19.2 | UI Framework |
| TypeScript | 5.6 | Type Safety |
| Vite | 7.3 | Build (szybki) |
| TailwindCSS | 4.2 | Styling |
| Workbox | 7.4 | Offline |

---

## 🔧 Stack Backend

| Tech | Zastosowanie |
|------|--------------|
| PostgreSQL | Baza danych |
| Supabase Auth | Autentykacja |
| RLS Policies | Bezpieczeństwo |
| Edge Functions | Serverless API |
| Realtime | Live updates |

---

## 💰 Infrastruktura i Hosting

**Frontend (Netlify):**
- Plan: 9 USD/miesiąc (~40 PLN)
- W fazie rozwoju: +2×5 USD za deploy sloty
- **Obecnie:** ~40-50 PLN/miesiąc
- **Docelowo:** 9 USD/m po stabilizacji
- **Przyszłość:** przejście na plan darmowy

**Backend (Supabase):**
- Baza danych i procesy backendowe
- Oddzielne od hostingu frontendu
- Plan: Free Tier (wystarczający)

---

## 🚀 PWA vs Native App

| Cecha | PWA | Native |
|-------|-----|--------|
| Instalacja | 1 klik | 5 kroków |
| Rozmiar | 2 MB | 50-100 MB |
| Aktualizacje | Auto | Ręczne |
| Koszt | 1x kod | 2x kod |
| Offline | ✅ | ✅ |
| Push | ✅ | ✅ |

**PWA = niższe koszty + szybsze**

---

# 4. BEZPIECZEŃSTWO

---

## 🔒 Ocena: 9.0/10 ✅

| Kategoria | Ocena |
|-----------|-------|
| SQL Injection | 10/10 |
| XSS Protection | 9/10 |
| CSRF Protection | 9/10 |
| Transport Security | 10/10 |
| Authentication | 10/10 |
| Data Exposure | 9/10 |

---

## 🛡️ Zabezpieczenia #1

**Content Security Policy (CSP)**
- Blokuje XSS attacks
- Kontrola źródeł skryptów
- **WYMAGANE przez PSP**

**HSTS**
- Wymusza HTTPS przez 1 rok
- Chroni przed MITM attacks
- **WYMAGANE przez PSP**

---

## 🛡️ Zabezpieczenia #2

**CORS Restrictions**
- Przed: `*` (wszyscy) ❌
- Po: `unicorns.org.pl` (tylko my) ✅
- **WYMAGANE przez PSP**

**Row Level Security (RLS)**
- Polityki na poziomie bazy
- User widzi tylko swoje dane
- Admin widzi wszystko

---

## 🏆 Zgodność OWASP Top 10

- ✅ A01: Broken Access Control
- ✅ A02: Cryptographic Failures
- ✅ A03: Injection
- ✅ A04: Insecure Design
- ✅ A05: Security Misconfiguration
- ✅ A06: Vulnerable Components
- ✅ A07: Auth Failures
- ✅ A08: Data Integrity

---

## 🏆 PCI DSS SAQ A

**Payment Card Industry Standard**

✅ Nie przechowujemy danych kart  
✅ Przekierowanie do bramki  
✅ HTTPS + HSTS + CSP  
✅ Signature verification  

**Architektura zgodna** ✅

---

# 5. PŁATNOŚCI

---

## 💳 Dostawcy płatności - Autopay

**Autopay (dawniej Blue Media):**
- Brak kosztów wstępnych
- **Bonus:** 6 miesięcy gratis (~350 PLN oszczędności)
- Metody: BLIK, karty, przelewy online

**Opcja A:** 1,3% + 0,25 PLN za transakcję
- Dla mniejszych obrotów

**Opcja B:** 29,99 PLN/m + 1,1% (powyżej 5500 PLN)
- Dla większych obrotów

---

## 💳 Alternatywa - Dostawca z Łodzi

**Najniższe prowizje na rynku:**
- **0,35%** za przelewy online
- **0,8%** za BLIK i karty płatnicze
- Możliwa negocjacja do **0,7%**

**Brak dodatkowych opłat:**
- Brak stałych opłat miesięcznych
- Brak opłat za transakcję
- Brak kosztów wstępnych

**Rekomendacja:** najlepsza opcja ekonomicznie

---

## 🔄 Jak działa płatność?

1. User zapisuje się → pending
2. Kliknie "Opłać" → redirect
3. Bramka przetwarza BLIK/kartę
4. Webhook → weryfikacja podpisu ✅
5. Update: payment_status = 'paid'
6. User wraca → "Sukces!" 🎉

---

## 📊 Panel płatności (Admin)

**Statystyki:**
- Liczba płatności (success/failed)
- Łączna kwota
- Success rate %
- Per dostawca

**Filtry:**
- Okres (1/7/30/90 dni)
- Dostawca, Status

---

## 🛡️ Zabezpieczenia płatności

1. **Signature Verification**
   - Weryfikacja podpisu przed przetworzeniem

2. **Idempotency**
   - Deduplikacja webhooków

3. **Webhook Log**
   - Audit trail, pełna historia

4. **HTTPS Only**
   - Szyfrowana komunikacja

---

## 💰 Model: PREPAID

**Płatność PRZED zajęciami**

1. Zapis → płatność wymagana
2. Płatność → BLIK/karta online
3. Weryfikacja → webhook ✅
4. Dostęp → zajęcia odblokowane
5. Uczestnictwo → trener oznacza

**System:** wyłącznie prepaid, brak postpaid

---

# 6. KOSZTY OPERACYJNE

---

## 💸 Koszty miesięczne - Infrastruktura

| Pozycja | Koszt |
|---------|-------|
| **Netlify** (hosting frontendu) | 9 USD (~40 PLN) |
| Netlify - deploy sloty (faza rozwoju) | +10 USD |
| **Supabase** (backend) | 0 PLN (Free Tier) |
| **Domena** unicorns.org.pl | 0 PLN (posiadana) |
| **SSL Certificate** | 0 PLN (Let's Encrypt) |

**Obecnie:** ~40-50 PLN/m  
**Docelowo:** ~40 PLN/m (po stabilizacji)

---

## 📧 Komunikacja z użytkownikami

**Email (serwis mailingowy):**
- Koszty w zależności od liczby użytkowników
- Przypomnienia o zajęciach
- Potwierdzenia płatności
- Aktualności dla członków

**⚠️ SMS - NIE ZALECAMY:**
- Bardzo drogie (0,10-0,20 PLN/SMS)
- Nieekonomiczne w stosunku do wartości
- Push notifications są darmowe i skuteczne

---

## 💳 Prowizje płatności

**Opcja 1: Autopay A (1,3% + 0,25 PLN)**
- Dla mniejszych obrotów
- Brak stałych opłat miesięcznych

**Opcja 2: Autopay B (29,99 PLN/m + 1,1%)**
- Dla obrotów >5500 PLN/m
- Niższa prowizja od transakcji

**Opcja 3: Dostawca z Łodzi**
- 0,35% przelewy / 0,7-0,8% BLIK+karty
- Najniższe prowizje
- Brak stałych opłat

---

## 📊 Przykład: 6,300 PLN obrotu

**Scenariusz:** 210 transakcji × 30 PLN = 6,300 PLN

| Wariant | Prowizja | Koszty stałe | **RAZEM** |
|---------|----------|--------------|-----------|
| Autopay A | 82 PLN + 53 PLN | 0 | **135 PLN** |
| Autopay B | 69 PLN | 30 PLN | **99 PLN** |
| Łódź (0,7%) | 44 PLN | 0 | **44 PLN** |

**+ Infrastruktura:** 40 PLN  
**+ Email:** ~10-20 PLN

**Koszt całkowity:** 94-195 PLN/m (zależy od dostawcy)

---

# 7. WDROŻENIE

---

## 🚀 Roadmap (4 tygodnie)

**Tydzień 1:** Testy i poprawki ✅  
**Tydzień 2:** Beta z użytkownikami  
**Tydzień 3:** Integracja płatności  
**Tydzień 4:** LAUNCH! 🚀

---

## 📋 Tydzień 2 - BETA

- [ ] 10-15 beta testerów
- [ ] Zbieranie feedbacku
- [ ] Testy UX
- [ ] Poprawki błędów
- [ ] Test płatności (sandbox)

---

## 🎯 Tydzień 3 - Przygotowanie

- [ ] Rejestracja u Autopay (2-5 dni)
- [ ] Konfiguracja webhooków
- [ ] Testy produkcyjne
- [ ] Materiały promocyjne

---

## 🚀 Tydzień 4 - LAUNCH

- [ ] Oficjalne uruchomienie
- [ ] Monitoring pierwszych dni
- [ ] Hot-fix błędów
- [ ] Zbieranie opinii
- [ ] Raport po 7 dniach


---

# 🎉 DZIĘKUJĘ!

**Kontakt:**
📧 unicorns.lodz@gmail.com  
👥 facebook.com/groups/604562728465563  
📸 @unicorns_lodz  
🌐 unicorns.org.pl

**Wersja:** 0.3.0  
**Data:** 21 kwietnia 2026

---

**Aplikacja stworzona z magią jednorożców** 🦄🌈✨
