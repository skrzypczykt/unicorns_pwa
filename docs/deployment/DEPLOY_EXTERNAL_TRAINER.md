# Deploy external_trainer role to Production

## Problem
When running `supabase db push`, it tries to apply ALL migrations from the beginning, including ones that already exist in production. This causes errors like:

```
ERROR: policy "Users can view own profile" for table "users" already exists
```

## Solution: Manual Migration

### Option 1: Supabase Studio SQL Editor (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **First, check your schema:**
   
   Copy and paste this to understand your database structure:
   ```sql
   -- Copy the entire contents of:
   -- supabase/CHECK_SCHEMA.sql
   ```
   
   Run it and check the output.

4. **Copy and paste the correct migration:**
   
   **If you got an error about user_role enum not existing**, use this version:
   ```sql
   -- Copy the entire contents of:
   -- supabase/migrations/010_add_external_trainer_role_no_enum.sql
   ```
   
   **If user_role enum exists**, use this version:
   ```sql
   -- Copy the entire contents of:
   -- supabase/migrations/010_add_external_trainer_role_safe.sql
   ```

5. **Run the query**
   - Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)
   - You should see: "✅ Migration completed successfully!"

6. **Verify**
   - The migration will output success messages
   - You can now create users with role `external_trainer`

### Option 2: Using Supabase CLI with specific migration

If you want to use CLI, you'll need to mark old migrations as already applied:

```bash
# This is more complex and not recommended
# Better to use Option 1 (SQL Editor)
```

## What does this migration do?

### New User Role: `external_trainer`

External trainers have these characteristics:

| Feature | User | Trainer | External Trainer | Admin |
|---------|------|---------|------------------|-------|
| Register for activities | ✅ | ✅ | ❌ | ✅ |
| Lead activities | ❌ | ✅ | ✅ | ✅ |
| Mark attendance | ❌ | ✅ (own) | ✅ (own) | ✅ (all) |
| Have balance/account | ✅ | ✅ | ❌ | ✅ |
| Balance transactions | ✅ | ✅ | ❌ | ✅ |

### Technical Details

1. **Enum Update**: Adds `external_trainer` to `user_role` enum
2. **RLS Policies**: 
   - Prevents external_trainers from creating registrations
   - Allows external_trainers to view their activities
   - Allows external_trainers to mark attendance
3. **Triggers**: 
   - Blocks balance_transactions for external_trainers
   - Blocks user_section_balances for external_trainers
4. **Frontend**: Already updated to handle this role

## After Migration

### Creating an external trainer:

1. Go to **Admin → Manage Users**
2. Find or create the user
3. Change their role to `external_trainer` (you'll need to do this via SQL Editor for now)

```sql
UPDATE users
SET role = 'external_trainer'
WHERE email = 'trainer@example.com';
```

### What external trainers see:

- Dashboard: Only the "Trainer Panel" card (no activities, my-classes, or profile cards)
- Header: No balance display
- They can access `/trainer/classes` to mark attendance
- They cannot access `/activities` or `/my-classes`

## Troubleshooting

### Error: "type 'user_role' does not exist"
**Solution**: Your database uses VARCHAR/TEXT for the role column instead of an enum. 
- Use `010_add_external_trainer_role_no_enum.sql` instead
- This version adds a CHECK constraint instead of modifying an enum

### Error: "duplicate_object"
This means `external_trainer` already exists. The migration is safe to re-run.

### Error: "relation does not exist"
Make sure you're connected to the correct database (production, not local).

### Error: "constraint already exists"
The migration has already been partially applied. It's safe to continue - existing constraints will be dropped and recreated.

### Users with external_trainer role can still register
Check that the RLS policies were applied correctly:
```sql
SELECT * FROM pg_policies WHERE tablename = 'registrations';
```

## Rollback (if needed)

If you need to remove the external_trainer role:

```sql
-- First, convert all external_trainers to regular trainers
UPDATE users SET role = 'trainer' WHERE role = 'external_trainer';

-- Note: You cannot remove enum values in PostgreSQL
-- You would need to recreate the enum type, which is complex
-- Better to just not use the role if you don't want it
```
