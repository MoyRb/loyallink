-- LoyalLink MVP base schema + RLS
-- Execute with Supabase CLI: supabase db push

create extension if not exists pgcrypto;

create type public.app_role as enum ('business_owner', 'customer');
create type public.points_transaction_type as enum ('earn', 'redeem');
create type public.qr_operation_status as enum ('pending', 'used', 'expired', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  primary_color text,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  card_label text,
  created_at timestamptz not null default now(),
  unique (business_id, customer_id)
);

create table if not exists public.point_wallets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  unique (business_id, customer_id)
);

create table if not exists public.qr_operations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  type public.points_transaction_type not null,
  points integer not null check (points > 0),
  token text not null unique,
  status public.qr_operation_status not null default 'pending',
  expires_at timestamptz not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  claimed_by uuid references public.profiles (id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  type public.points_transaction_type not null,
  points integer not null check (points > 0),
  source text not null,
  qr_operation_id uuid references public.qr_operations (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_businesses_owner_id on public.businesses (owner_id);
create index if not exists idx_loyalty_cards_customer_id on public.loyalty_cards (customer_id);
create index if not exists idx_point_wallets_customer_id on public.point_wallets (customer_id);
create index if not exists idx_point_transactions_customer_created_at on public.point_transactions (customer_id, created_at desc);
create index if not exists idx_qr_operations_business_status on public.qr_operations (business_id, status);

-- Auto-provision profile when a new auth user is created.
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'customer')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_point_wallets_updated_at on public.point_wallets;
create trigger set_point_wallets_updated_at
before update on public.point_wallets
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.point_wallets enable row level security;
alter table public.point_transactions enable row level security;
alter table public.qr_operations enable row level security;

-- Profiles: users can only read/update their own profile.
create policy "profiles_select_self"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_update_self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- Businesses: business owners can manage their own businesses;
-- customers can read businesses where they already hold a loyalty card.
create policy "businesses_owner_full_access"
on public.businesses
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "businesses_customer_read_linked"
on public.businesses
for select
using (
  exists (
    select 1
    from public.loyalty_cards lc
    where lc.business_id = businesses.id
      and lc.customer_id = auth.uid()
  )
);

-- Loyalty cards: customers only see their cards; business owners can create/view
-- cards for their own business.
create policy "loyalty_cards_customer_read"
on public.loyalty_cards
for select
using (customer_id = auth.uid());

create policy "loyalty_cards_owner_manage"
on public.loyalty_cards
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = loyalty_cards.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = loyalty_cards.business_id
      and b.owner_id = auth.uid()
  )
);

-- Point wallets: customers only see their own balances; owners can manage
-- wallets that belong to their business.
create policy "point_wallets_customer_read"
on public.point_wallets
for select
using (customer_id = auth.uid());

create policy "point_wallets_owner_manage"
on public.point_wallets
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = point_wallets.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = point_wallets.business_id
      and b.owner_id = auth.uid()
  )
);

-- Point transactions: customers read only their movements; business owners can
-- create/read movements for businesses they own.
create policy "point_transactions_customer_read"
on public.point_transactions
for select
using (customer_id = auth.uid());

create policy "point_transactions_owner_manage"
on public.point_transactions
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = point_transactions.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = point_transactions.business_id
      and b.owner_id = auth.uid()
  )
);

-- QR operations: restricted to business owner records only.
create policy "qr_operations_owner_manage"
on public.qr_operations
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = qr_operations.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = qr_operations.business_id
      and b.owner_id = auth.uid()
  )
);

-- Storage bucket for business logos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-logos',
  'business-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Public read for logos. Authenticated owners can upload/update/delete only
-- inside their own folder: <owner_id>/<filename>.
create policy "business_logos_public_read"
on storage.objects
for select
using (bucket_id = 'business-logos');

create policy "business_logos_owner_write"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "business_logos_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "business_logos_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
