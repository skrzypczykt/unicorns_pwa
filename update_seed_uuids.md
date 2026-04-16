# Update Seed Data UUIDs

## Instructions

You need to replace the placeholder UUIDs in `seed.sql` with the real UUIDs from Supabase.

### Find and Replace in PyCharm

Open `supabase/seed.sql` and use Find & Replace (`Cmd+R`):

## Replacements Needed:

### 1. Admin User
**Find**: `00000000-0000-0000-0000-000000000001`
**Replace with**: `YOUR_ADMIN_UUID_HERE`

### 2. Trainer 1 (Anna Kowalska)
**Find**: `00000000-0000-0000-0000-000000000002`
**Replace with**: `YOUR_TRAINER1_UUID_HERE`

### 3. Trainer 2 (Piotr Nowak)
**Find**: `00000000-0000-0000-0000-000000000003`
**Replace with**: `YOUR_TRAINER2_UUID_HERE`

### 4. User 1 (Jan Wiśniewski)
**Find**: `00000000-0000-0000-0000-000000000004`
**Replace with**: `YOUR_USER1_UUID_HERE`

### 5. User 2 (Maria Lewandowska)
**Find**: `00000000-0000-0000-0000-000000000005`
**Replace with**: `YOUR_USER2_UUID_HERE`

### 6. User 3 (Tomasz Dąbrowski)
**Find**: `00000000-0000-0000-0000-000000000006`
**Replace with**: `YOUR_USER3_UUID_HERE`

---

## Quick Steps:

1. Open `supabase/seed.sql` in PyCharm (already open)
2. Press `Cmd+R` to open Find & Replace
3. For each user:
   - Paste the placeholder UUID in "Find"
   - Paste the real UUID in "Replace with"
   - Click "Replace All"
4. Save the file (`Cmd+S`)
5. Run the updated SQL in Supabase SQL Editor

---

## Example:

If your admin's real UUID is: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Find: `00000000-0000-0000-0000-000000000001`
Replace: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Then click "Replace All"

Repeat for all 6 users.
