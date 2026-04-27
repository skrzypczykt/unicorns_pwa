# Run Seed Script on Supabase

## Quick Steps

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Seed Script**
   - Copy content from `supabase/seed-test-env.sql`
   - Paste into SQL editor
   - Click "Run"

4. **Verify**
   Run this query to check test users exist:
   ```sql
   SELECT id, email, raw_user_meta_data->>'full_name' as full_name
   FROM auth.users
   WHERE email LIKE '%unicorns-test.local'
   ORDER BY email;
   ```

   Should show 4 users:
   - admin@unicorns-test.local
   - member@unicorns-test.local
   - test.user@unicorns-test.local
   - trainer@unicorns-test.local

5. **Run E2E tests**
   ```bash
   cd frontend
   npm run test:e2e
   ```

## Note

The seed script uses the Vault secret `test_user_password` which should already be set to:
`Uj7#mK9$nR2@pL5!qW8`

If you get a Vault error, set it in Supabase Dashboard → Project Settings → Vault
