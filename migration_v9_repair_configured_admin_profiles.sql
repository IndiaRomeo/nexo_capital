-- ============================================================
-- MIGRATION V9: Repair configured admin profile rows
-- Run this in Supabase SQL Editor after migration_v8.
-- ============================================================

-- These IDs are currently configured in src/config/adminRouting.js.
-- If the auth user exists but the public profile row is missing, this
-- creates/repairs the admin profile so assigned_admin_id FK checks pass.
WITH configured_admins(id) AS (
  VALUES
    ('d5b2d17c-2177-45d4-a8cb-479c0a68fa48'::uuid),
    ('de4c7784-f1ef-45c9-ba13-6dd91d4b0215'::uuid)
)
INSERT INTO public.profiles (id, email, nombre, numero_cuenta, is_admin)
SELECT
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'nombre', 'Admin'),
  'IL' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  true
FROM auth.users u
JOIN configured_admins c ON c.id = u.id
ON CONFLICT (id) DO UPDATE
SET is_admin = true,
    email = excluded.email,
    updated_at = now();

-- IMPORTANT: If this returns rows, those UUIDs do not exist in Auth Users.
-- In that case, update src/config/adminRouting.js with the real admin user.id,
-- or create that admin user in Authentication first.
WITH configured_admins(id) AS (
  VALUES
    ('d5b2d17c-2177-45d4-a8cb-479c0a68fa48'::uuid),
    ('de4c7784-f1ef-45c9-ba13-6dd91d4b0215'::uuid)
)
SELECT c.id AS configured_admin_id_missing_in_auth_users
FROM configured_admins c
LEFT JOIN auth.users u ON u.id = c.id
WHERE u.id IS NULL;
-- ============================================================
