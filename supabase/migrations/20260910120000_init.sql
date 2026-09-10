-- PawPicks Thailand — initial schema
-- Catalogue (products / collections / cats) + commerce (orders / order_items)
-- + profiles for member & admin roles.

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('customer', 'admin');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- is_admin(): used by RLS policies. SECURITY DEFINER so it can read profiles
-- regardless of the caller's own RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- collections
-- ----------------------------------------------------------------------------
create table public.collections (
  id          text primary key,
  title       text not null,
  blurb       text not null,
  query       text not null default '',
  cat_images  jsonb not null default '[]'::jsonb,  -- [{src,alt}, {src,alt}]
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- cats (mascot team)
-- ----------------------------------------------------------------------------
create table public.cats (
  id          text primary key,
  name        text not null,
  image       text not null,
  aria_label  text not null,
  query       text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger cats_set_updated_at
  before update on public.cats
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table public.products (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  category          text not null,
  description       text not null default '',
  price_thb         integer not null check (price_thb >= 0),
  image             text not null,
  image_crop        text,
  badge             text,
  badge_dark        boolean not null default false,
  companion_cat_id  text references public.cats (id) on delete set null,
  companion_label   text,
  companion_image   text,
  companion_alt     text,
  shopee_url        text not null,
  search_keywords   text not null default '',
  active            boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index products_active_sort_idx on public.products (active, sort_order);
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- orders  (written ONLY by the service role, from the verified Stripe webhook)
-- ----------------------------------------------------------------------------
create type public.order_status as enum
  ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');

create table public.orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users (id) on delete set null,
  email                 text,
  status                public.order_status not null default 'pending',
  stripe_session_id     text unique,
  stripe_payment_intent text,
  amount_total_thb      integer not null default 0,
  currency              text not null default 'thb',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  paid_at               timestamptz
);
create index orders_user_idx on public.orders (user_id);
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      text references public.products (id) on delete set null,
  name            text not null,
  unit_price_thb  integer not null check (unit_price_thb >= 0),
  quantity        integer not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items (order_id);
