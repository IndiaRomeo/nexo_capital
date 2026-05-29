-- ============================================================
-- MIGRATION V6: Keep old contact messages shared, assign new ones to admin 2 only
-- Run this in Supabase SQL Editor after migration_v5.
-- ============================================================

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS assigned_admin_id uuid references public.profiles(id) on delete set null;

CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned_admin
ON public.contact_messages(assigned_admin_id);

-- Leave existing messages with assigned_admin_id = NULL.
-- NULL means legacy/shared, so both admins can still see old messages.

DROP POLICY IF EXISTS "Admins manage messages" ON public.contact_messages;
CREATE POLICY "Admins manage assigned messages"
ON public.contact_messages
FOR ALL
USING (
  public.is_admin()
  AND (
    assigned_admin_id IS NULL
    OR assigned_admin_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  AND (
    assigned_admin_id IS NULL
    OR assigned_admin_id = auth.uid()
  )
);

-- Public contact form can still insert messages only for a real admin.
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  assigned_admin_id IS NOT NULL
  AND public.is_admin_profile(assigned_admin_id)
);

-- ============================================================
