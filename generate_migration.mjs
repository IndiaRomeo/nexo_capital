import fs from 'fs';
import path from 'path';

const dl = 'C:/Users/jeffr/Downloads';

function extractInserts(csvContent) {
  return csvContent.split(/\r?\n/).slice(1)
    .filter(l => l.trim().startsWith('"'))
    .map(l => {
      const inner = l.slice(1, l.lastIndexOf(';"') + 1);
      return inner.replace(/""/g, '"');
    });
}

const leadsInserts = extractInserts(fs.readFileSync(path.join(dl, 'Supabase Snippet Lead records upsert formatter for insertion.csv'), 'utf8'));
const lasInserts   = extractInserts(fs.readFileSync(path.join(dl, 'Supabase Snippet Insert Admin Lead State Snapshot.csv'), 'utf8'));

let sql = `-- ============================================================
-- NEXO CAPITAL - Migration Script completo
-- Pega TODO esto en nexocapital > SQL Editor > Run
-- ============================================================

-- 1. Schema updates
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS titular_cuenta text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS contraseña text,
  ADD COLUMN IF NOT EXISTS desembolso_completado boolean default false,
  ADD COLUMN IF NOT EXISTS desembolso_fecha timestamptz,
  ADD COLUMN IF NOT EXISTS desembolso_estado text,
  ADD COLUMN IF NOT EXISTS archived boolean default false,
  ADD COLUMN IF NOT EXISTS assigned_admin_id uuid references public.profiles(id) on delete set null;

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS created_by_admin_id uuid references public.profiles(id) on delete set null;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS assigned_admin_id uuid references public.profiles(id) on delete set null;

CREATE TABLE IF NOT EXISTS public.lead_admin_states (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  stage text, notas text, archived boolean DEFAULT false,
  fecha_nacimiento_admin date, direccion_admin text,
  codigo_postal_admin text, estado_civil_admin text,
  desembolso_estado text, ingresos text, banco text,
  tiempo_cuenta text, trabajando text, historial_credito text,
  monto_necesario text, proposito text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  loan_amount numeric(10,2), loan_term_months integer, loan_rate_pct numeric(5,2)
);
ALTER TABLE public.lead_admin_states ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_admin_states' AND policyname='Admins manage lead states') THEN
    CREATE POLICY "Admins manage lead states" ON public.lead_admin_states FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 2. Leads (${leadsInserts.length} registros)
`;

for (const line of leadsInserts) {
  sql += line.replace(/;$/, ' ON CONFLICT (id) DO NOTHING;') + '\n';
}

sql += `\n-- 3. Lead admin states (${lasInserts.length} registros)\n`;
for (const line of lasInserts) {
  sql += line.replace(/;$/, ' ON CONFLICT (id) DO NOTHING;') + '\n';
}

sql += `
-- 4. Loans (8 prestamos activos)
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('6663b9b3-5ce8-47db-989d-e08bd47a4d3a'::uuid,'41cfac39-4dc6-41a0-ad02-790056f87579'::uuid,'IL-13180486',1500.00,12,0.0400,130.00,1560.00,1560.00,'activo','2026-05-05','2027-05-05','2026-05-05 20:33:00.241223+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('104a05c8-cf5e-4de0-8b16-319d14e42298'::uuid,'3d582351-5135-4058-97ba-231396941fad'::uuid,'IL-10621367',12000.00,24,0.0400,520.00,12480.00,12480.00,'activo','2026-05-05','2027-05-05','2026-05-05 19:50:21.769194+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('8ed01da2-520d-4f80-93db-717ccde3b420'::uuid,'430debd0-a8e8-49c9-b529-21436d7f0b92'::uuid,'IL-76233109',6000.00,36,0.0600,176.67,6360.00,6360.00,'activo','2026-05-08','2029-05-08','2026-05-08 21:37:13.206211+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('d2231f8d-6a93-45d9-9aa4-a9196bda0ac7'::uuid,'86ddda60-09ef-48ee-851c-2f938221865c'::uuid,'IL-52170331',2000.00,12,0.0400,173.33,2080.00,2080.00,'activo','2026-05-12','2027-05-12','2026-05-12 02:16:10.39763+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('59eaddaa-fe2c-4567-820a-e60d3e523a20'::uuid,'f12fe098-46eb-4d14-a4dc-2462c75cfebe'::uuid,'IL-96650682',5000.00,12,0.0100,420.83,5050.00,5050.00,'activo','2026-05-13','2027-05-13','2026-05-13 18:24:10.813462+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('43dab400-db98-4448-bc89-b7bf85c06bc6'::uuid,'d7e8fb0e-7d88-4ec3-89d9-f1c979002d84'::uuid,'IL-80625788',25000.00,36,0.0100,701.39,25250.00,25250.00,'activo','2026-05-14','2029-05-14','2026-05-14 17:43:45.711576+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('f943093a-f5cb-4b19-aa80-e7867ea80440'::uuid,'53c2d729-21a2-4f5e-b1f5-d97103186116'::uuid,'IL-81803277',25000.00,36,0.0100,701.39,25250.00,25250.00,'activo','2026-05-14','2029-05-14','2026-05-14 18:03:23.21762+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.loans (id,lead_id,numero_prestamo,monto,plazo_meses,tasa_interes,cuota_mensual,total_pagar,saldo_pendiente,estado,fecha_inicio,fecha_vencimiento,created_at) VALUES ('e6ca25be-1a04-429b-8df2-932115680dcf'::uuid,'46f83545-12e7-4aa7-93d6-a972caf00032'::uuid,'IL-01684146',1750.00,12,0.0400,151.67,1820.00,1820.00,'activo','2026-05-16','2027-05-16','2026-05-16 03:21:25.736429+00'::timestamptz) ON CONFLICT (id) DO NOTHING;
`;

const outPath = path.join(dl, 'nexocapital_migration.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Archivo generado:', outPath);
console.log('  Leads:', leadsInserts.length);
console.log('  Lead admin states:', lasInserts.length);
console.log('  Loans: 8');
