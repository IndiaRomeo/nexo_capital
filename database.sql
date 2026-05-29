-- ============================================================
-- IMPULSO LATINO - Supabase Database Schema
-- Paste this entire file into your Supabase SQL Editor and run it.
-- ============================================================

-- Profiles (auto-created when a user signs up via trigger)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  nombre text,
  telefono text,
  estado_residencia text,
  fecha_nacimiento date,
  direccion text,
  codigo_postal text,
  estado_civil text,
  numero_cuenta text unique,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Loan applications from the website form
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  nombre text not null,
  email text not null,
  telefono text not null,
  estado_residencia text,
  trabajando text,
  tipo_trabajo text,
  ingresos text,
  cuenta_activa text,
  ingresos_en_cuenta text,
  banco text,
  tiempo_cuenta text,
  historial_credito text,
  monto_necesario text,
  proposito text,
  stage text default 'nuevo',
  notas text,
  fecha_nacimiento_admin date,
  direccion_admin text,
  codigo_postal_admin text,
  estado_civil_admin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Approved/active loans (admin creates these)
create table if not exists public.loans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  numero_prestamo text unique,
  monto numeric(10,2) not null,
  plazo_meses integer not null,
  tasa_interes numeric(5,4) not null,
  cuota_mensual numeric(10,2) not null,
  total_pagar numeric(10,2) not null,
  saldo_pendiente numeric(10,2) not null,
  estado text default 'activo',
  fecha_inicio date default current_date,
  fecha_vencimiento date,
  created_at timestamptz default now()
);

-- Contact form messages
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  nombre text not null,
  telefono text,
  email text,
  mensaje text not null,
  leido boolean default false,
  respuesta text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.loans enable row level security;
alter table public.contact_messages enable row level security;

-- Helper used by RLS policies.
-- SECURITY DEFINER prevents recursive reads of profiles policies while checking admin status.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Users view own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Admins view all profiles" on profiles;
drop policy if exists "Anyone can insert leads" on leads;
drop policy if exists "Users view own leads by email" on leads;
drop policy if exists "Admins manage all leads" on leads;
drop policy if exists "Users view own loans" on loans;
drop policy if exists "Admins manage loans" on loans;
drop policy if exists "Anyone can insert messages" on contact_messages;
drop policy if exists "Admins manage messages" on contact_messages;

-- Profiles
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins view all profiles" on profiles for select using (public.is_admin());

-- Leads
create policy "Anyone can insert leads" on leads for insert with check (true);
create policy "Users view own leads by email" on leads for select using (
  auth.uid() = user_id or
  email = (auth.jwt() ->> 'email')
);
create policy "Users update own leads" on leads for update using (
  auth.uid() = user_id or
  email = (auth.jwt() ->> 'email')
) with check (
  auth.uid() = user_id or
  email = (auth.jwt() ->> 'email')
);
create policy "Admins manage all leads" on leads for all using (public.is_admin());

-- Loans
create policy "Users view own loans" on loans for select using (auth.uid() = user_id);
create policy "Admins manage loans" on loans for all using (public.is_admin()) with check (public.is_admin());

-- Contact messages
create policy "Anyone can insert messages" on contact_messages for insert with check (true);
create policy "Admins manage messages" on contact_messages for all using (
  public.is_admin()
  and (
    assigned_admin_id is null
    or assigned_admin_id = auth.uid()
  )
) with check (
  public.is_admin()
  and (
    assigned_admin_id is null
    or assigned_admin_id = auth.uid()
  )
);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nombre, numero_cuenta)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    'IL' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TO GRANT ADMIN ACCESS to a user who has already signed up:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-admin@email.com';
--
-- If the auth user exists but profiles is empty, run this after creating the user
-- in Authentication > Users:
-- INSERT INTO public.profiles (id, email, nombre, numero_cuenta, is_admin)
-- SELECT id, email, 'Admin', 'IL' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), true
-- FROM auth.users
-- WHERE email = 'your-admin@email.com'
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;
-- ============================================================
