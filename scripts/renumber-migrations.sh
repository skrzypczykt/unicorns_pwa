#!/bin/bash
# Renumber migrations to fix duplicates
# Created: 2026-04-26

set -e

cd "$(dirname "$0")/.."

echo "🔧 Renumbering migrations to fix duplicates..."
echo ""

cd supabase/migrations

# Backup already created, proceed with renames

# 002 duplicates: keep 002_allow_user_registration, rename fix → 003
if [ -f "002_fix_rls_policies.sql" ]; then
  echo "Renaming: 002_fix_rls_policies.sql → 003_fix_rls_policies.sql"
  git mv 002_fix_rls_policies.sql 003_fix_rls_policies.sql
fi

# Shift 003 → 004
if [ -f "003_recurring_events.sql" ]; then
  echo "Renaming: 003_recurring_events.sql → 004_recurring_events.sql"
  git mv 003_recurring_events.sql 004_recurring_events.sql
fi

# Shift 004 → 005
if [ -f "004_registration_windows.sql" ]; then
  echo "Renaming: 004_registration_windows.sql → 005_registration_windows.sql"
  git mv 004_registration_windows.sql 005_registration_windows.sql
fi

# Shift 005 → 006
if [ -f "005_fix_admin_users_access.sql" ]; then
  echo "Renaming: 005_fix_admin_users_access.sql → 006_fix_admin_users_access.sql"
  git mv 005_fix_admin_users_access.sql 006_fix_admin_users_access.sql
fi

# 006 duplicates: keep 006_activity_images (now 007), rename participants → 008
if [ -f "006_add_participants_count.sql" ]; then
  echo "Renaming: 006_add_participants_count.sql → 008_add_participants_count.sql"
  git mv 006_add_participants_count.sql 008_add_participants_count.sql
fi

# Now shift original 006_activity_images → 007
if [ -f "006_activity_images.sql" ]; then
  echo "Renaming: 006_activity_images.sql → 007_activity_images.sql"
  git mv 006_activity_images.sql 007_activity_images.sql
fi

# 007 duplicates: auto_create first, push_notifications second
if [ -f "007_push_notifications.sql" ]; then
  echo "Renaming: 007_push_notifications.sql → 009_push_notifications.sql"
  git mv 007_push_notifications.sql 009_push_notifications.sql
fi

# Now shift original 007_auto_create (but it's already 007 in new scheme, wait...)
# Actually: current 007_auto_create_user_profile should stay, 007_push → 009

# Shift 008-009 → 010-011
if [ -f "008_section_based_balances.sql" ]; then
  echo "Renaming: 008_section_based_balances.sql → 010_section_based_balances.sql"
  git mv 008_section_based_balances.sql 010_section_based_balances.sql
fi

if [ -f "009_accounting_report_function.sql" ]; then
  echo "Renaming: 009_accounting_report_function.sql → 011_accounting_report_function.sql"
  git mv 009_accounting_report_function.sql 011_accounting_report_function.sql
fi

# 010 trio: delete old attempts, keep safe version as 012
if [ -f "010_add_external_trainer_role.sql" ]; then
  echo "Removing: 010_add_external_trainer_role.sql (superseded by safe version)"
  git rm 010_add_external_trainer_role.sql
fi

if [ -f "010_add_external_trainer_role_no_enum.sql" ]; then
  echo "Removing: 010_add_external_trainer_role_no_enum.sql (superseded by safe version)"
  git rm 010_add_external_trainer_role_no_enum.sql
fi

if [ -f "010_add_external_trainer_role_safe.sql" ]; then
  echo "Renaming: 010_add_external_trainer_role_safe.sql → 012_add_external_trainer_role.sql"
  git mv 010_add_external_trainer_role_safe.sql 012_add_external_trainer_role.sql
fi

# Shift everything >= 011 by +2 (now that we have 010→012, next is 011→013)
for i in {50..11}; do
  num=$(printf "%03d" $i)
  newnum=$(printf "%03d" $((i + 2)))

  for file in ${num}_*.sql; do
    if [ -f "$file" ]; then
      newname=$(echo "$file" | sed "s/^${num}/${newnum}/")
      echo "Renaming: $file → $newname"
      git mv "$file" "$newname"
    fi
  done
done

echo ""
echo "✅ Migration renumbering complete!"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Test migrations: npx supabase db reset"
echo "3. Commit: git commit -m 'Renumber migrations to fix duplicates'"
