# Pages Directory Structure

## Overview

Katalog zawiera wszystkie strony (views) aplikacji Unicorns PWA. Strony są zorganizowane według ról użytkowników i funkcjonalności.

## Directory Structure

```
pages/
├── admin/              # Strony administratora (12 plików)
│   ├── AdminActivitiesPage.tsx
│   ├── AdminAttendancePage.tsx
│   ├── AdminMemberDocumentsPage.tsx
│   ├── AdminMemberFeesPage.tsx
│   ├── AdminMemberNewsPage.tsx
│   ├── AdminMemberPollsPage.tsx
│   ├── AdminMemberZoneManagementPage.tsx
│   ├── AdminPaymentsPage.tsx
│   ├── AdminRefundsPage.tsx
│   ├── AdminReportsPage.tsx
│   ├── AdminSectionsPage.tsx
│   └── AdminUsersPage.tsx
├── auth/               # Autoryzacja (4 pliki)
│   ├── AuthCallbackPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── RegisterPage.tsx
│   └── SimpleLoginPage.tsx
├── member-zone/        # Strefa Członka (5 plików)
│   ├── MemberBalancePage.tsx
│   ├── MemberDocumentsPage.tsx
│   ├── MemberNewsPage.tsx
│   ├── MemberPollsPage.tsx
│   └── MemberZonePage.tsx
├── payment/            # Płatności (4 pliki)
│   ├── AutopayRedirectPage.tsx
│   ├── PaymentCancelPage.tsx
│   ├── PaymentReturnPage.tsx
│   └── PaymentSuccessPage.tsx
├── public/             # Strony publiczne (6 plików)
│   ├── AboutAppPage.tsx
│   ├── DonationsPage.tsx
│   ├── LegalNoticePage.tsx
│   ├── NewsArticlePage.tsx
│   ├── NewsPage.tsx
│   └── PublicAboutPage.tsx
├── trainer/            # Strony trenera (1 plik)
│   └── TrainerClassesPage.tsx
├── user/               # Strony użytkownika (8 plików)
│   ├── AccountPage.tsx
│   ├── ActivitiesPage.tsx
│   ├── ActivityParticipantsPage.tsx
│   ├── EditProfilePage.tsx
│   ├── MyClassesPage.tsx
│   ├── NotificationsPage.tsx
│   ├── ProfilePage.tsx
│   └── SettingsPage.tsx
└── README.md           # Ten plik
```

**Total:** 40 plików w 7 kategoriach

## Page Categories and Routing

### 🔐 Auth Pages (`auth/`) - No authentication required
- **SimpleLoginPage** (`/login`) - Logowanie
- **RegisterPage** (`/register`) - Rejestracja  
- **ForgotPasswordPage** (`/forgot-password`) - Reset hasła (placeholder - niezaimplementowane)
- **AuthCallbackPage** (`/auth/callback`) - OAuth callback handler

### 🌍 Public Pages (`public/`) - No authentication required
- **PublicAboutPage** (`/`) - Strona główna / Dashboard
- **AboutAppPage** (`/about-app`) - Informacje o aplikacji
- **NewsPage** (`/news`) - Aktualności publiczne (lista)
- **NewsArticlePage** (`/news/:articleId`) - Szczegóły artykułu
- **LegalNoticePage** (`/legal`) - Informacje prawne, regulaminy
- **DonationsPage** (`/donations`) - Wsparcie stowarzyszenia

### 👤 User Pages (`user/`) - Authentication required
- **ActivitiesPage** (`/activities`) - Harmonogram zajęć i wydarzeń
- **MyClassesPage** (`/my-classes`) - Moje rezerwacje
- **ProfilePage** (`/profile`) - Profil użytkownika (podgląd)
- **AccountPage** (`/account`) - Konto (transakcje, historia)
- **EditProfilePage** (`/edit-profile`) - Edycja profilu
- **NotificationsPage** (`/notifications`) - Powiadomienia push
- **SettingsPage** (`/settings`) - Ustawienia aplikacji
- **ActivityParticipantsPage** (`/admin/activities/:activityId/participants`) - Lista uczestników *

\* *Uwaga: Ta strona jest używana głównie przez adminów, ale routing jest w `/admin/` więc została w `user/`. Można przenieść do `admin/` jeśli wymagana jest rola admin.*

### 🏛️ Member Zone Pages (`member-zone/`) - Requires `is_association_member = true`
- **MemberZonePage** (`/member-zone`) - Hub strefy członka
- **MemberNewsPage** (`/member-zone/news`) - Ogłoszenia dla członków stowarzyszenia
- **MemberDocumentsPage** (`/member-zone/documents`) - Dokumenty, statuty, uchwały
- **MemberPollsPage** (`/member-zone/polls`) - Głosowania członków
- **MemberBalancePage** (`/member-zone/fees`) - Składki członkowskie

### ✅ Trainer Pages (`trainer/`) - Requires role: `trainer`, `external_trainer`, or `admin`
- **TrainerClassesPage** (`/trainer/classes`) - Zajęcia do prowadzenia (oznaczanie obecności)

### ⚙️ Admin Pages (`admin/`) - Requires role: `admin`

**Panel główny:**
- **AdminUsersPage** (`/admin/users`) - Zarządzanie użytkownikami
- **AdminActivitiesPage** (`/admin/activities`) - Zarządzanie zajęciami i wydarzeniami
- **AdminSectionsPage** (`/admin/sections`) - Zarządzanie sekcjami (rodzaje zajęć)
- **AdminReportsPage** (`/admin/reports`) - Raporty i statystyki
- **AdminAttendancePage** (`/admin/attendance`) - Zarządzanie obecnością
- **AdminPaymentsPage** (`/admin/payments`) - Przegląd płatności
- **AdminRefundsPage** (`/admin/refunds`) - Zarządzanie zwrotami

**Strefa Członka - Admin:**
- **AdminMemberZoneManagementPage** (`/admin/member-zone-management`) - Hub zarządzania strefą
- **AdminMemberNewsPage** (`/admin/member-news`) - Zarządzanie ogłoszeniami
- **AdminMemberDocumentsPage** (`/admin/member-documents`) - Zarządzanie dokumentami
- **AdminMemberPollsPage** (`/admin/member-polls`) - Zarządzanie głosowaniami
- **AdminMemberFeesPage** (`/admin/member-fees`) - Zarządzanie składkami członkowskimi

### 💳 Payment Pages (`payment/`) - Authentication required
- **AutopayRedirectPage** (`/autopay-redirect`) - Przekierowanie do bramki Autopay (POST formularz)
- **PaymentReturnPage** (`/payment-return`) - Handler powrotu z Autopay (redirect helper)
- **PaymentSuccessPage** (`/payment-success`) - Potwierdzenie udanej płatności
- **PaymentCancelPage** (`/payment-cancel`) - Informacja o anulowanej płatności

## Connection Graph

```
                                [App.tsx]
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
    [Auth Routes]             [Public Routes]            [User Routes]
        │                           │                           │
  ┌─────┴─────┐             ┌───────┴───────┐         ┌─────────┴─────────┐
Login  Register        HomePage  News       │      Activities  MyClasses  │
Forgot Callback         AboutApp Legal      │       Profile   Account     │
                        Donations            │       EditProfile Settings │
                                             │       Notifications         │
                                             │                             │
                                    [Member Zone Routes]          [Trainer Routes]
                                             │                             │
                                    ┌────────┴────────┐              TrainerClasses
                                    │        │        │                    
                                  News  Documents  Polls
                                  Hub    Balance

                                        [Admin Routes]
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
              [Main Admin]          [Member Zone Admin]      [Activity Detail]
                    │                        │                        │
        ┌───────────┼───────────┐   ┌────────┼────────┐       ActivityParticipants
        │           │           │   │        │        │
     Users    Activities   Sections News Documents Polls
     Reports  Attendance   Payments Fees
              Refunds      MemberZoneHub


                                    [Payment Flow]
                                         │
                        ┌────────────────┼────────────────┐
                        │                │                │
                  PaymentInit     AutopayRedirect   PaymentReturn
                        │                │                │
                        └────────────────┼────────────────┘
                                         │
                             ┌───────────┴───────────┐
                             │                       │
                      PaymentSuccess         PaymentCancel
```

## Import Patterns in App.tsx

```typescript
// Auth
import SimpleLoginPage from './pages/auth/SimpleLoginPage'

// Public
import PublicAboutPage from './pages/public/PublicAboutPage'

// User
import ActivitiesPage from './pages/user/ActivitiesPage'

// Member Zone
import MemberZonePage from './pages/member-zone/MemberZonePage'

// Trainer
import TrainerClassesPage from './pages/trainer/TrainerClassesPage'

// Admin
import AdminUsersPage from './pages/admin/AdminUsersPage'

// Payment
import AutopayRedirectPage from './pages/payment/AutopayRedirectPage'
```

## Migration Completed ✅

**What was done:**

1. ✅ **Created 7 subdirectories:**
   - `auth/` - Authorization & registration
   - `public/` - Public pages (no auth)
   - `user/` - User pages (auth required)
   - `member-zone/` - Association member pages
   - `trainer/` - Trainer pages
   - `admin/` - Admin panel pages
   - `payment/` - Payment flow pages

2. ✅ **Moved 40 files** to organized structure

3. ✅ **Deleted unused files:**
   - `AboutPage.tsx` - not routed in App.tsx
   - `DashboardPage.tsx` - embedded component, not standalone route

4. ✅ **Updated imports in App.tsx:**
   - All imports now use organized subdirectories
   - Grouped by category with comments

## Notes

- **Total pages:** 40 (down from 42 after removing unused)
- **Categories:** Auth (4), Public (6), User (8), Member Zone (5), Trainer (1), Admin (12), Payment (4)
- **Routing unchanged:** All routes in App.tsx remain the same, only imports changed
- **Backwards compatible:** No breaking changes to URLs or functionality

## Future Considerations

- Consider moving `ActivityParticipantsPage` from `user/` to `admin/` if it requires admin role
- `ForgotPasswordPage` currently shows placeholder - implement password reset functionality
- All payment pages use Autopay integration - add other providers if needed
