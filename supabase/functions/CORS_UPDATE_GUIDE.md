# CORS Update Guide for Edge Functions

## ✅ UPDATED (3/12):
- validate-registration/index.ts
- process-attendance/index.ts
- generate-accounting-report/index.ts

## 🔄 TO UPDATE (9/12):
- update-balance/index.ts
- generate-recurring-activities-cron/index.ts
- generate-recurring-activities/index.ts
- delete-user-account/index.ts
- send-push-notifications/index.ts
- send-email-notification/index.ts
- send-payment-reminders/index.ts
- update-past-activities-status/index.ts
- send-activity-start-notifications/index.ts

## How to update each function:

### Step 1: Replace import section
**OLD:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**NEW:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
```

### Step 2: Update serve() function start
**OLD:**
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
```

**NEW:**
```typescript
serve(async (req) => {
  // Get CORS headers based on request origin
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
```

## Security Benefits:
- ✅ Blocks requests from unauthorized domains
- ✅ Allows only specific origins (localhost + Netlify + your domain)
- ✅ Prevents CSRF attacks from malicious websites
- ✅ Required by PSP (Autopay, Stripe, PayU)
