# Development Guide - Unicorn Sports PWA 🦄🌈

## Project Status

### ✅ Completed

#### 1. Database & Backend (Supabase)
- [x] PostgreSQL database schema with 7 tables
- [x] Row Level Security (RLS) policies
- [x] Database functions (participant count, capacity check, cancellation deadline)
- [x] Seed data with sample users, activities, and transactions
- [x] 3 Edge Functions (TypeScript/Deno):
  - `process-attendance` - Marks attendance and deducts balance
  - `update-balance` - Admin manual balance updates
  - `validate-registration` - Activity registration with validation

#### 2. Frontend Setup
- [x] Vite + React + TypeScript project initialized
- [x] Dependencies installed:
  - `@supabase/supabase-js` - Supabase client
  - `@tanstack/react-query` - Data fetching
  - `react-router-dom` - Routing
  - `react-i18next` - Internationalization
  - `date-fns` - Date formatting
  - `zustand` - State management
  - `tailwindcss` - Styling
  - `vite-plugin-pwa` - PWA support
- [x] Tailwind configured with rainbow unicorn theme
- [x] PWA manifest and service worker config
- [x] Polish translations (i18n)
- [x] TypeScript types for Supabase database
- [x] Supabase client setup

### 🚧 In Progress / To Do

#### 3. UI Components (Pending)
- [ ] UnicornButton - Rainbow gradient buttons
- [ ] UnicornHeader - App header with unicorn logo
- [ ] UnicornCard - Card components
- [ ] UnicornLoader - Loading animation
- [ ] BalanceDisplay - User balance component

#### 4. Pages (Pending)
- [ ] LoginPage
- [ ] RegisterPage
- [ ] User Dashboard
- [ ] Activities Browse Page
- [ ] My Classes Page
- [ ] Trainer Attendance Page
- [ ] Admin Dashboard
- [ ] Admin Balance Management

## Quick Start

### Prerequisites

1. **Node.js 18+** - Install from nodejs.org
2. **Supabase Account** - Sign up at supabase.com (free tier is fine)
3. **Git** - For version control

### Setup Instructions

#### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to be provisioned
3. Go to Project Settings → API
4. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secure!)

#### 2. Initialize Database

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get ref from project settings)
supabase link --project-ref YOUR_PROJECT_REF

# Apply database migrations
cd /Users/tskrzypczyk/PycharmProjects/unicorns_pwa
supabase db push

# Load seed data
supabase db execute --file ./supabase/seed.sql
```

**Important:** The seed data uses placeholder UUIDs. You need to create actual users in Supabase Auth first, then update the seed.sql file with the real UUIDs.

#### 3. Create Auth Users

In Supabase Dashboard → Authentication → Users, create these test accounts:

- **admin@unicorn.test** (password: yourpassword)
- **trener1@unicorn.test** (password: yourpassword)
- **user1@unicorn.test** (password: yourpassword)

Note the UUID for each user, then update `supabase/seed.sql` accordingly.

#### 4. Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy process-attendance
supabase functions deploy update-balance
supabase functions deploy validate-registration

# Set environment variables (service role key)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 5. Configure Frontend

```bash
cd frontend

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 6. Start Development Server

```bash
cd frontend
npm run dev
```

Visit http://localhost:5173

## Architecture Overview

### Payment Flow (CRITICAL UNDERSTANDING)

**This is NOT a pre-payment system. Payment happens AFTER attendance is marked.**

1. **User Registers for Activity**
   - Creates registration record
   - Status: `registered`
   - `payment_processed`: `FALSE`
   - **NO money deducted yet**

2. **User Can Cancel Before Deadline**
   - Updates status to `cancelled`
   - **NO refund needed** (nothing was charged)

3. **Trainer Marks Attendance as "Present"**
   - THIS IS WHEN PAYMENT HAPPENS
   - Edge Function `process-attendance`:
     - Checks user balance >= activity cost
     - Deducts from balance
     - Creates balance_transaction record
     - Updates `payment_processed`: `TRUE`
     - Updates registration status: `attended`

4. **If User Doesn't Attend**
   - Trainer marks as "absent"
   - **NO payment deducted**
   - Status: `no_show`

### Database Tables

1. **users** - User profiles (extends Supabase Auth)
2. **activity_types** - Categories (Joga, Piłka Nożna, etc.)
3. **activities** - Classes/events
4. **registrations** - User sign-ups (RESERVATION, not payment)
5. **attendance** - Attendance records (triggers payment)
6. **balance_transactions** - Immutable audit log of all balance changes
7. **audit_log** - System audit trail

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth
- **State**: React Query + Zustand
- **i18n**: react-i18next (Polish)
- **PWA**: Vite PWA Plugin + Workbox

## Rainbow Unicorn Theme 🌈🦄

### Color Palette

```js
unicorn: {
  pink: '#FF69B4',
  purple: '#9370DB',
  blue: '#87CEEB',
  green: '#98FB98',
  yellow: '#FFD700',
  orange: '#FFA500',
  red: '#FF6B8A',
  lavender: '#E6E6FA',
}
```

### Gradients

- `bg-rainbow-gradient` - Horizontal rainbow
- `bg-rainbow-gradient-vertical` - Vertical rainbow
- `bg-rainbow-gradient-diagonal` - Diagonal rainbow

### Custom Classes

- `.text-rainbow` - Rainbow gradient text
- `.btn-unicorn` - Rainbow gradient button
- `.card-unicorn` - Unicorn-themed card
- `.sparkle` - Sparkle animation

## Next Steps

To continue development:

1. **Create UI Components** (Task #7)
   - UnicornButton, UnicornHeader, UnicornCard, etc.
   - Use Tailwind rainbow theme

2. **Implement Auth Pages** (Task #8)
   - Login/Register with Supabase Auth
   - Protected routes

3. **Build User Pages** (Task #9)
   - Dashboard
   - Browse activities
   - My classes with registration/cancellation

4. **Build Trainer Pages** (Task #10)
   - Attendance marking interface
   - Call `process-attendance` Edge Function

5. **Build Admin Pages** (Task #11)
   - User management
   - Activity CRUD
   - Balance updates (call `update-balance` Edge Function)

6. **Deploy** (Task #12)
   - Push to GitHub
   - Connect to Netlify
   - Configure environment variables

## Useful Commands

```bash
# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code

# Supabase
supabase start       # Start local Supabase
supabase stop        # Stop local Supabase
supabase db reset    # Reset local database
supabase functions serve  # Serve Edge Functions locally

# Database
supabase db push     # Apply migrations
supabase db diff     # Show changes
supabase db execute --file ./file.sql  # Run SQL file

# Edge Functions
supabase functions deploy <function-name>
supabase functions serve <function-name>
```

## Testing

### Test Accounts (after seeding)

- **Admin**: admin@unicorn.test
- **Trainer**: trener1@unicorn.test, trener2@unicorn.test
- **Users**: user1@unicorn.test, user2@unicorn.test, user3@unicorn.test

### Test Scenarios

1. **User registers for activity**
   - Verify NO payment yet
   - Check can_cancel_until date

2. **User cancels before deadline**
   - Verify cancellation works
   - Verify NO refund (nothing was charged)

3. **Trainer marks attendance as present**
   - Verify balance IS deducted
   - Verify transaction created
   - Verify `payment_processed = TRUE`

4. **User with insufficient balance**
   - Attendance marked but payment fails
   - System should handle gracefully

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` in frontend folder
- Ensure variables start with `VITE_`

### "Failed to fetch" errors
- Check Supabase project is running
- Verify CORS settings in Supabase
- Check RLS policies allow access

### Edge Functions not working
- Verify they're deployed: `supabase functions list`
- Check logs: `supabase functions logs <function-name>`
- Ensure service role key is set

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)

---

**Remember: This is a pay-per-class system where payment happens when attendance is marked, NOT when user registers!** 🦄✨
