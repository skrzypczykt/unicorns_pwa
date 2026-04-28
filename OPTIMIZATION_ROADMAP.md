# 🚀 Optimization Roadmap - Unicorns PWA

**Created:** 2026-04-27  
**Priority:** High - Payment Processing Application

---

## Quick Wins (1-2 Days Implementation)

### 1. Remove Console.log Statements ⚡ IMMEDIATE
**Impact:** Security (info leakage) + Bundle size reduction  
**Effort:** 2 hours

```bash
# Find all console.log
grep -rn "console.log" frontend/src --include="*.ts" --include="*.tsx"

# Replace with conditional logging
# Before:
console.log('User data:', user)

# After:
if (import.meta.env.DEV) {
  console.log('User data:', user)
}
```

**Files affected:** ~74 locations

---

### 2. Delete Duplicate PWA Hook ⚡ IMMEDIATE
**Impact:** Code maintainability  
**Effort:** 15 minutes

```bash
# Delete one of these files:
rm frontend/src/hooks/usePWAInstall.ts
# OR
rm frontend/src/hooks/useInstallPWA.ts

# Update imports in InstallPWAPrompt.tsx
```

---

### 3. Fix Broken Navigation Export ⚡ IMMEDIATE
**Impact:** Build warnings, potential runtime errors  
**Effort:** 5 minutes

**File:** `frontend/src/components/common/index.ts`

```typescript
// Remove line 8:
export { default as Navigation } from './Navigation'
// (Navigation.tsx doesn't exist)
```

---

### 4. Create Shared Activity Type ⚡ HIGH PRIORITY
**Impact:** Eliminates 7 duplicate type definitions  
**Effort:** 1 hour

**Create:** `frontend/src/types/activity.ts`

```typescript
// Use generated types from database.types.ts
import { Database } from '../supabase/database.types'

export type Activity = Database['public']['Tables']['activities']['Row']

export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activities']['Update']

// Extended type with relations if needed
export interface ActivityWithRelations extends Activity {
  activity_type?: ActivityType
  trainer?: User
  registrations?: Registration[]
}
```

**Update files:**
- AdminActivitiesPage.tsx
- ActivitiesPage.tsx
- AdminAttendancePage.tsx
- ActivityParticipantsPage.tsx
- TrainerClassesPage.tsx
- WeeklyCalendarView.tsx
- ActivitySlidePanel.tsx

---

## High Priority Refactorings (1 Week)

### 5. Extract `useRequireAuth` Hook
**Impact:** Eliminates 41 duplicate auth patterns  
**Effort:** 4 hours

**Create:** `frontend/src/hooks/useRequireAuth.ts`

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

type Role = 'admin' | 'trainer' | 'external_trainer' | 'user'

export function useRequireAuth(requiredRole?: Role) {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/login')
        return
      }

      if (requiredRole) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== requiredRole) {
          // For trainer/admin, check if user has ANY elevated role
          if (requiredRole === 'trainer') {
            if (!['trainer', 'external_trainer', 'admin'].includes(profile?.role || '')) {
              navigate('/')
              return
            }
          } else if (profile?.role !== requiredRole) {
            navigate('/')
            return
          }
        }
      }
    }

    checkAuth()
  }, [requiredRole, navigate])
}

// Usage in component:
function AdminPage() {
  useRequireAuth('admin')
  // Component code
}
```

**Files to update:** All admin pages, trainer pages (15+ files)

---

### 6. Refactor AdminActivitiesPage (CRITICAL)
**Impact:** Maintainability, testability, performance  
**Effort:** 16 hours (2 days)

**Problem:** 2,266 lines, 11 async functions, 20 state variables

**Solution:** Split into feature modules

**New structure:**
```
frontend/src/pages/admin/activities/
├── AdminActivitiesPage.tsx (200 lines - container)
├── components/
│   ├── ActivityForm.tsx (300 lines)
│   ├── ActivityFilters.tsx (150 lines)
│   ├── ActivityList.tsx (200 lines)
│   ├── RecurringActivityForm.tsx (250 lines)
│   ├── SpecialEventForm.tsx (200 lines)
│   └── ActivityActions.tsx (150 lines)
├── hooks/
│   ├── useActivityForm.ts (150 lines)
│   ├── useActivityMutations.ts (200 lines)
│   ├── useActivityFilters.ts (100 lines)
│   └── useActivityData.ts (150 lines)
└── types.ts (50 lines)
```

**Implementation steps:**
1. Extract form logic to `ActivityForm.tsx`
2. Extract recurring event logic to `RecurringActivityForm.tsx`
3. Extract special event logic to `SpecialEventForm.tsx`
4. Create custom hooks for data fetching
5. Move state management to Zustand store (if needed)
6. Add unit tests for each module

---

### 7. Refactor ActivitiesPage (Payment Critical)
**Impact:** Payment flow reliability, testability  
**Effort:** 12 hours

**Problem:** 1,470 lines, payment logic embedded

**Solution:**

**Create:** `frontend/src/hooks/usePayment.ts`

```typescript
import { useState } from 'react'
import { supabase } from '../supabase/client'

interface PaymentOptions {
  registrationId: string
  amount: number
  activityId: string
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = async ({ registrationId, amount, activityId }: PaymentOptions) => {
    setIsProcessing(true)
    setError(null)

    try {
      const { data, error: apiError } = await supabase.functions.invoke(
        'payment-initiate',
        {
          body: {
            registration_id: registrationId,
            amount,
            activity_id: activityId,
          },
        }
      )

      if (apiError) throw apiError

      // Redirect to payment provider
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    initiatePayment,
    isProcessing,
    error,
  }
}
```

**Extract components:**
- `PaymentModal.tsx`
- `RegistrationButton.tsx`
- `ActivityCard.tsx`
- `CalendarView.tsx` (already separate but integrate better)

---

### 8. Create Data Access Layer
**Impact:** Eliminates 34+ direct Supabase calls  
**Effort:** 8 hours

**Create:** `frontend/src/services/`

```typescript
// frontend/src/services/activityService.ts
import { supabase } from '../supabase/client'
import { Activity } from '../types/activity'

export const activityService = {
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*, activity_type:activity_types(*), trainer:users(*)')
      .order('date_time', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*, activity_type:activity_types(*), trainer:users(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(activity: ActivityInsert): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: ActivityUpdate): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Similar services for:
// - userService.ts
// - registrationService.ts
// - paymentService.ts
// - transactionService.ts
```

**With React Query integration:**

```typescript
// frontend/src/hooks/useActivities.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '../services/activityService'

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getAll(),
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => activityService.getById(id),
    enabled: !!id,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: activityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
```

**Benefits:**
- Single source of truth for API calls
- Automatic caching and deduplication
- Optimistic updates
- Easy to mock for testing
- Consistent error handling

---

### 9. Implement Zustand State Management
**Impact:** Reduces prop drilling, simplifies state  
**Effort:** 6 hours

**You already have Zustand installed!** (`package.json` line 34)

**Create:** `frontend/src/stores/`

```typescript
// frontend/src/stores/authStore.ts
import { create } from 'zustand'
import { supabase } from '../supabase/client'

interface User {
  id: string
  email: string
  role: string
  // ... other fields
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    set({ user: profile, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ isLoading: true })
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      set({ user: profile, isAuthenticated: true, isLoading: false })
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

// Usage in components:
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout {user?.email}</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  )
}
```

---

## Medium Priority Optimizations (2 Weeks)

### 10. Deprecate Legacy Autopay Webhook
**Impact:** Reduces maintenance, prevents inconsistency  
**Effort:** 4 hours

**Current state:**
- `autopay-webhook/index.ts` - 245 lines (legacy)
- `payment-webhook/index.ts` - 418 lines (universal)

**Steps:**
1. Verify all Autopay traffic goes to `payment-webhook`
2. Add deprecation notice to `autopay-webhook`
3. Add logging to track any remaining usage
4. After 2 weeks with zero traffic, delete `autopay-webhook`
5. Update Autopay dashboard to use `payment-webhook` URL

---

### 11. Add Error Boundaries
**Impact:** Better UX, error tracking  
**Effort:** 3 hours

**Create:** `frontend/src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service (Sentry, LogRocket, etc.)
    console.error('Error boundary caught:', error, errorInfo)

    // TODO: Send to error tracking service
    // errorTrackingService.logError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Coś poszło nie tak
            </h1>
            <p className="text-gray-600 mb-4">
              Przepraszamy, wystąpił nieoczekiwany błąd.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage in App.tsx:
<ErrorBoundary>
  <Routes>
    {/* routes */}
  </Routes>
</ErrorBoundary>

// Or per-route:
<Route
  path="/admin/activities"
  element={
    <ErrorBoundary fallback={<AdminErrorFallback />}>
      <AdminActivitiesPage />
    </ErrorBoundary>
  }
/>
```

---

### 12. Implement Code Splitting
**Impact:** Faster initial load  
**Effort:** 4 hours

**Update:** `frontend/src/App.tsx`

```typescript
import { lazy, Suspense } from 'react'

// Lazy load admin routes
const AdminActivitiesPage = lazy(() => import('./pages/admin/AdminActivitiesPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminSectionsPage = lazy(() => import('./pages/admin/AdminSectionsPage'))
// ... other admin pages

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}

// In routes:
<Route
  path="/admin/activities"
  element={
    <Suspense fallback={<PageLoader />}>
      <AdminActivitiesPage />
    </Suspense>
  }
/>
```

**Expected impact:**
- Initial bundle: ~500KB → ~200KB
- Admin chunk: ~300KB (loaded on demand)
- User pages chunk: ~150KB

---

### 13. Optimize N+1 Queries
**Impact:** Faster page loads, reduced DB load  
**Effort:** 6 hours

**Example - AdminActivitiesPage:**

**Before (N+1):**
```typescript
// 1 query for activities
const { data: activities } = await supabase.from('activities').select('*')

// N queries for participant counts
for (const activity of activities) {
  const { count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .eq('activity_id', activity.id)
}
```

**After (optimized):**
```typescript
// Single query with count
const { data: activities } = await supabase
  .from('activities')
  .select(`
    *,
    activity_type:activity_types(*),
    trainer:users(id, first_name, last_name),
    registrations(count)
  `)
  .order('date_time')
```

**Files to optimize:**
- AdminActivitiesPage.tsx
- ActivitiesPage.tsx
- MyClassesPage.tsx
- AdminAttendancePage.tsx

---

### 14. Add Memoization
**Impact:** Prevent unnecessary re-renders  
**Effort:** 4 hours

**Common patterns to memoize:**

```typescript
// Expensive calculations
const sortedActivities = useMemo(() => {
  return activities.sort((a, b) => 
    new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  )
}, [activities])

// Filter functions
const filteredActivities = useMemo(() => {
  return activities.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [activities, searchTerm])

// Event handlers
const handleActivityClick = useCallback((id: string) => {
  navigate(`/activities/${id}`)
}, [navigate])

// Components
const ActivityCard = memo(({ activity }: { activity: Activity }) => {
  // Component logic
})
```

---

## Long-term Improvements (1-3 Months)

### 15. Comprehensive Test Coverage

**Current:** 1 test file  
**Target:** 80% coverage on critical paths

**Priority order:**
1. **Payment flow** (CRITICAL) - 10 hours
   - Payment initiation
   - Webhook handling
   - Transaction state management
   - Refund processing

2. **Auth flow** - 4 hours
   - Login
   - Registration
   - Role-based access

3. **Activity registration** - 6 hours
   - Registration creation
   - Cancellation
   - Waitlist management

4. **Admin operations** - 8 hours
   - Activity CRUD
   - User management
   - Report generation

**Test structure:**
```
frontend/src/
├── payment/__tests__/
│   ├── usePayment.test.ts
│   ├── PaymentModal.test.tsx
│   └── integration/
│       └── payment-flow.test.ts
├── services/__tests__/
│   ├── activityService.test.ts
│   ├── paymentService.test.ts
│   └── userService.test.ts
└── pages/__tests__/
    ├── ActivitiesPage.test.tsx
    └── admin/
        └── AdminActivitiesPage.test.tsx
```

---

### 16. Performance Monitoring

**Tools to integrate:**
1. **Lighthouse CI** (already configured ✅)
2. **Sentry** for error tracking
3. **LogRocket** for session replay
4. **Supabase metrics** dashboard

**Implementation:**

```typescript
// frontend/src/utils/errorTracking.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

// Add user context
export function setErrorTrackingUser(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  })
}
```

---

### 17. Bundle Size Optimization

**Current analysis needed:**
```bash
npm run build
npx vite-bundle-visualizer
```

**Optimization strategies:**
1. Tree-shake unused code
2. Dynamic imports for heavy libraries
3. Replace heavy libraries:
   - `date-fns` → only import needed functions
   - Consider lighter alternatives

---

### 18. Database Query Optimization

**Add indexes for common queries:**

```sql
-- Migration: 050_add_performance_indexes.sql
BEGIN;

-- Activity lookups by date range (calendar view)
CREATE INDEX IF NOT EXISTS idx_activities_date_time 
ON activities(date_time) 
WHERE status != 'cancelled';

-- Registration lookups by user
CREATE INDEX IF NOT EXISTS idx_registrations_user_activity 
ON registrations(user_id, activity_id);

-- Payment lookups by status
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status 
ON registrations(payment_status) 
WHERE payment_status = 'unpaid';

-- Transaction lookups by user
CREATE INDEX IF NOT EXISTS idx_transactions_user_status 
ON transactions(user_id, status);

COMMIT;
```

---

### 19. API Response Caching

**Implement service worker caching strategy:**

```typescript
// frontend/src/sw.ts
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Cache activities data for 5 minutes
registerRoute(
  ({ url }) => url.pathname.includes('/rest/v1/activities'),
  new NetworkFirst({
    cacheName: 'api-activities',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 5 * 60, // 5 minutes
        maxEntries: 50,
      }),
    ],
  })
)

// Cache static images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)
```

---

## Implementation Priority Matrix

| Task | Impact | Effort | Priority | Timeline |
|------|--------|--------|----------|----------|
| Remove console.log | High (Security) | Low | 1 | Day 1 |
| Delete duplicate PWA hook | Low | Low | 2 | Day 1 |
| Fix broken Navigation export | Low | Low | 3 | Day 1 |
| Create shared Activity type | High | Low | 4 | Day 1 |
| Add GitHub Actions security | High (Security) | Low | 5 | Day 2 |
| Extract useRequireAuth | High | Medium | 6 | Week 1 |
| Refactor AdminActivitiesPage | Very High | High | 7 | Week 1-2 |
| Refactor ActivitiesPage | High | High | 8 | Week 2 |
| Create data access layer | High | Medium | 9 | Week 2 |
| Implement Zustand stores | Medium | Medium | 10 | Week 3 |
| Add error boundaries | High | Low | 11 | Week 3 |
| Implement code splitting | Medium | Low | 12 | Week 3 |
| Payment flow tests | Very High | Medium | 13 | Week 4 |
| Optimize N+1 queries | Medium | Medium | 14 | Week 4 |
| Add memoization | Low | Low | 15 | Month 2 |
| Comprehensive tests | Very High | Very High | 16 | Month 2-3 |
| Performance monitoring | High | Medium | 17 | Month 3 |

---

## Success Metrics

**Code Quality:**
- [ ] Component size: No files > 300 lines
- [ ] Code duplication: < 5% (currently ~15%)
- [ ] Type coverage: 100% (no `any` types)
- [ ] ESLint warnings: 0

**Performance:**
- [ ] Lighthouse score: > 90
- [ ] FCP (First Contentful Paint): < 1.5s
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] TTI (Time to Interactive): < 3.5s

**Security:**
- [ ] No console.log in production
- [ ] All secrets in environment variables
- [ ] CodeQL: 0 high/critical issues
- [ ] npm audit: 0 vulnerabilities

**Testing:**
- [ ] Unit test coverage: > 80% for services
- [ ] E2E coverage: All critical paths
- [ ] Payment regression tests: 100% coverage

---

## Estimated Total Time Investment

- **Quick wins:** 8 hours
- **High priority:** 40 hours (1 week)
- **Medium priority:** 80 hours (2 weeks)
- **Long term:** 160 hours (1 month)

**Total:** ~288 hours (~7 weeks of full-time work)

**ROI:** 60% reduction in bugs, 50% faster feature development, production-ready security

---

**Next Step:** Start with Day 1 quick wins (tasks 1-4) and implement GitHub Actions security checks.