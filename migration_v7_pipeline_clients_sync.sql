-- ============================================================
-- MIGRATION V7: Keep Clientes and Pipeline aligned for admins
-- Run this in Supabase SQL Editor after migration_v5.
-- ============================================================

-- Repair historical leads that belong to a client assigned to an admin,
-- but were not assigned directly on the leads row.
UPDATE public.leads l
SET assigned_admin_id = p.assigned_admin_id
FROM public.profiles p
WHERE l.user_id = p.id
  AND l.assigned_admin_id IS NULL
  AND p.assigned_admin_id IS NOT NULL;

-- Allow an admin to see/manage a lead when either the lead is directly
-- assigned to them or the linked client profile is assigned to them.
DROP POLICY IF EXISTS "Admins manage assigned leads" ON public.leads;
CREATE POLICY "Admins manage assigned leads"
ON public.leads
FOR ALL
USING (
  public.is_admin()
  AND (
    assigned_admin_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = leads.user_id
        AND p.assigned_admin_id = auth.uid()
    )
  )
)
WITH CHECK (
  public.is_admin()
  AND (
    assigned_admin_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = leads.user_id
        AND p.assigned_admin_id = auth.uid()
    )
  )
);

-- Optional audit query:
-- SELECT l.id, l.nombre, l.email, l.assigned_admin_id AS lead_admin, p.assigned_admin_id AS profile_admin
-- FROM public.leads l
-- JOIN public.profiles p ON p.id = l.user_id
-- WHERE p.assigned_admin_id IS NOT NULL
--   AND (l.assigned_admin_id IS NULL OR l.assigned_admin_id <> p.assigned_admin_id);
-- ============================================================
