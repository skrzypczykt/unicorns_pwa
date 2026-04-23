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

## Code Style

- Use TypeScript strict mode
- Prefer functional components + hooks
- Use Tailwind for styling (no custom CSS)
- Keep components under 300 lines (split if larger)
- No console.log in production code (use console.error for errors)
- Comment only WHY, not WHAT (code should be self-documenting)
