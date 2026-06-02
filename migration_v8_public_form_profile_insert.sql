-- ============================================================
-- MIGRATION V8: Allow public form users to save their own profile
-- Run this in Supabase SQL Editor after migration_v7.
-- ============================================================

-- The signup trigger normally creates public.profiles automatically.
-- This policy is a fallback for the form code when the profile row is missing.
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id
  AND coalesce(is_admin, false) = false
);

-- Keep the update policy strict: users can edit their own customer row,
-- but cannot promote themselves to admin.
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND coalesce(is_admin, false) = false
);

-- Optional audit query:
-- SELECT u.id, u.email
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON p.id = u.id
-- WHERE p.id IS NULL;
-- ============================================================
