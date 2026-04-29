# Claude Code Instructions

## Git Workflow

**NEVER push automatically.** Always ask user permission before `git push`.

### Before every push:

1. Bump version in `frontend/src/version.ts` ([semver](https://semver.org/)):
   - MAJOR: breaking changes
   - MINOR: new features (backward-compatible)
   - PATCH: bug fixes

2. Update `CHANGELOG.md`:
   - Add version section with date
   - List changes: Added, Changed, Fixed, Removed, Security

3. Commit version:
   ```bash
   git add frontend/src/version.ts CHANGELOG.md
   git commit -m "Wersja X.Y.Z"
   ```

4. Push only after user approval.


## Balance Display

**Do not display user balance anywhere:**
- No balance cards (ProfilePage, AccountPage)
- No "Balance before/after" columns in transaction tables
- Transaction history shows only: date, description, type, amount

## Duration Formatting

Use `utils/formatDuration.ts`:
- ≤ 120 min → "90 min"
- \> 120 min → "3h", "2h 30min"
- ≥ 24h → "2 dni", "1 dzień 5h"

## Payment Deduplication

- One registration (activity_id + user_id) = one payment
- "Pay" button hidden when `payment_status === 'paid'`
- Recurring events: each instance (different activity_id) is a separate event

## Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS
- Supabase client
- React Router

**Backend:**
- Supabase (PostgreSQL + Auth + Edge Functions)
- Deno (Edge Functions runtime)

**Deployment:**
- Frontend: Netlify
- Backend: Supabase Cloud

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── payment/        # Payment module (generic provider pattern)
│   ├── utils/          # Helper functions
│   └── supabase/       # Supabase client
├── public/
└── dist/              # Build output

supabase/
├── functions/         # Edge Functions (Deno)
├── migrations/        # SQL migrations
└── seed.sql          # Initial data

CLAUDE.md             # This file
CHANGELOG.md          # Version history
PAYMENT_TESTING.md    # Payment testing guide
```

## Common Tasks

**Run dev server:**
```bash
cd frontend && npm run dev
```

**Deploy Edge Function:**
```bash
npx supabase functions deploy <function-name>
```

**Create migration:**
```bash
# Manual: create file supabase/migrations/NNN_description.sql
```

**Apply migrations:**
```bash
npx supabase db reset  # Local
# Production: run SQL in Supabase Dashboard → SQL Editor
```

## Key Concepts

**Activities:**
- `is_recurring=true, parent_activity_id=NULL, status='template'` → Template (no date_time)
- `is_recurring=false, parent_activity_id=NULL` → Single event
- `parent_activity_id != NULL` → Instance of recurring event
- `is_special_event=true` → Special event (no trainer required)

**Registrations:**
- `status`: 'registered', 'attended', 'cancelled'
- `payment_status`: 'unpaid', 'paid'
- `refund_status`: 'none', 'pending', 'processed', 'failed'

**Transactions:**
- `type`: 'payment', 'refund', 'manual'
- `provider`: 'manual', 'autopay', 'stripe', etc.
- `status`: 'pending', 'completed', 'failed', 'cancelled'

**Roles:**
- `user` - regular user
- `trainer` - internal trainer (can manage activities/sections)
- `external_trainer` - external trainer (can manage activities/sections)
- `admin` - full access

## Payment Flow

```
User clicks "Pay"
  ↓
Frontend calls /functions/v1/payment-initiate
  ↓
Create transaction (status='pending')
  ↓
Redirect to payment provider (Autopay/Stripe)
  ↓
User pays at provider
  ↓
Provider sends webhook ITN to /functions/v1/autopay-webhook
  ↓
Update transaction.status = 'completed'
  ↓
Update registration.payment_status = 'paid'
```

## Testing Payments (Autopay)

**PBL (PayByLink) - TEST 106:**
```json
{ "paymentMethod": "pbl" }
```
Click "Zapłać" on test bank page → Success

**BLIK (WhiteLabel GatewayID=509):**
```json
{ "paymentMethod": "blik", "blikCode": "111112" }
```
- `111112` → Success
- `111121` → Invalid code
- `111122` → Expired
- `111123` → Already used

**Cards (default):**
- Success: `4111111111111111`, CVV: `123`, Exp: `12/25`
- Failure: `4000000000000002`

See `PAYMENT_TESTING.md` for full details.

## Security Notes

- Edge Functions verify JWT tokens (decode without `SUPABASE_SERVICE_ROLE_KEY`)
- Admin-only functions check `users.role = 'admin'`
- Trainer functions check `role IN ('trainer', 'external_trainer', 'admin')`
- Payment webhooks verify signature/hash from provider
- CSP headers configured in `netlify.toml`

## Architecture Patterns

### Component Organization

**Size Limits:**
- Keep components under 300 lines (enforced via code review)
- Split large components into: hooks, sub-components, utils
- Use composition over prop drilling

**Current Refactoring Targets:**
- `AdminActivitiesPage`: 2,266 lines → split into modules
- `ActivitiesPage`: 1,470 lines → split into modules

### State Management

**Installed but Underutilized:**
- Zustand: state management (installed, minimal usage)
- React Query: data fetching & caching (installed, partial usage)

**Current Pattern:**
- Direct Supabase queries in components (34 files)
- Local useState for UI state
- useEffect for data fetching

**Target Pattern:**
- Zustand stores for global state (user, activities, registrations)
- React Query hooks for server state
- Data access layer for query abstraction

### Data Access Layer (Implemented v0.8.0)

**IMPLEMENTED** - Repository pattern fully deployed across all domains.

**Location:** `frontend/src/supabase/repositories/`

**Structure:**
```
repositories/
├── base.ts           # QueryResult<T>, QueryListResult<T>, error handling
├── activities.ts     # 12 functions (380 lines)
├── registrations.ts  # 16 functions (520 lines)
├── users.ts          # 19 functions (577 lines)
├── balances.ts       # 16 functions (480 lines)
├── sections.ts       # 10 functions (280 lines)
├── association.ts    # 20 functions (530 lines)
└── index.ts          # Barrel export
```

**Usage Examples:**

```typescript
// Import from centralized repository
import { getActivitiesInWeek, createActivity } from '@/supabase/repositories'

// Fetch activities
const result = await getActivitiesInWeek(startDate, endDate)
if (result.error) {
  console.error('Failed to fetch activities:', result.error)
  return
}
const activities = result.data // Fully typed!

// Create activity
const newActivity = await createActivity({
  name: 'Yoga Class',
  trainer_id: user.id,
  date_time: new Date().toISOString(),
  // ... TypeScript autocomplete for all fields
})
```

**Benefits Achieved:**
- ✅ Type-safe queries with automatic validation from database.types.ts
- ✅ Centralized error handling with handleQueryError()
- ✅ Easy to mock for testing (just mock the repository module)
- ✅ Eliminated ~500 lines of duplicated query code
- ✅ Single source of truth for all database operations

**Migration Guide:**

**Before (direct Supabase query):**
```typescript
const { data, error } = await supabase
  .from('activities')
  .select('*')
  .gte('date_time', startDate)
  .lte('date_time', endDate)
  .order('date_time')

if (error) {
  console.error(error)
  return
}
```

**After (repository):**
```typescript
import { getActivitiesInWeek } from '@/supabase/repositories'

const result = await getActivitiesInWeek(startDate, endDate)
if (result.error) {
  // Error already logged by handleQueryError()
  return
}
const activities = result.data
```

**Repository Function Naming:**
- `get*` - Fetch single item or list
- `create*` - Insert new record
- `update*` - Modify existing record
- `delete*` - Remove record
- `*` (action) - Complex operations (e.g., processTransaction, bulkUpdateAttendance)

**When to Add New Functions:**
If you need a new query pattern:
1. Check if repository function exists
2. If not, add it to the appropriate repository file
3. Export from `index.ts`
4. Use it across all pages that need it

### Authentication

**Current Pattern:**
- `useRequireAuth` hook (centralized in v0.6.0)
- Auto-redirect to /login if unauthenticated
- Role-based access in components

**Security:**
- Client-side checks are UX-only (not security boundary)
- Server-side validation in Edge Functions (JWT verification)
- RLS policies enforce database-level security

### Error Handling

**Global Boundary:**
- `ErrorBoundary` component (added v0.6.0)
- Catches React errors, prevents white screen
- Shows user-friendly error message

**Edge Function Errors:**
- Return structured JSON: `{ error: string, details?: any }`
- Client displays error toast/alert
- Never expose internal error details to users

### Testing Strategy

**E2E Tests (Playwright):**
- Tagged with `@payment`, `@admin`, `@user`
- Graceful skip conditions for unimplemented UI (v0.6.8-0.6.10)
- Run in CI via GitHub Actions

**Unit Tests (Vitest):**
- Utils and hooks (partial coverage)
- Target: 80% coverage on business logic

**Payment Regression:**
- Dedicated CI workflow (`payment-regression.yml`)
- Runs on every PR touching payment code
- Tests critical flows: PBL, BLIK, Cards, Webhooks

### Code Quality Metrics

**Achieved (v0.6.0-0.6.10):**
- ✅ console.log: 74 → 3 (95% reduction)
- ✅ Auth duplication: 41 → 1 hook (98% reduction)
- ✅ Code duplication: ~15% → ~8%
- ✅ Security scans: 0 → 3 workflows

**Targets:**
- Components > 300 lines: 2 → 0
- Code duplication: 8% → <5%
- E2E test pass rate: ~15% → 80%
- TypeScript `any`: some → 0

### Performance Considerations

**Current Issues:**
- No code splitting (single bundle)
- Some N+1 queries in activity listings
- No image optimization

**Planned Optimizations:**
- Route-based code splitting
- React Query for deduplication
- Virtual scrolling for long lists
- Image lazy loading

## Code Style

- Use TypeScript strict mode
- Prefer functional components + hooks
- Use Tailwind for styling (no custom CSS)
- Keep components under 300 lines (split if larger)
- No console.log in production code (use console.error for errors)
- Comment only WHY, not WHAT (code should be self-documenting)
