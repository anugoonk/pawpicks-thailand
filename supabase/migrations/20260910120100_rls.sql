-- PawPicks Thailand — Row Level Security
--
-- Principle: the anon/authenticated keys can only READ public catalogue data
-- and a user's OWN orders. All writes to money/inventory go through the
-- service role (webhook, admin tooling), which bypasses RLS.

alter table public.profiles     enable row level security;
alter table public.collections  enable row level security;
alter table public.cats         enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admin reads all"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: update own (role locked)"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admin updates all"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- catalogue: public read of active rows; admin full control
-- ---------------------------------------------------------------------------
create policy "collections: public read active"
  on public.collections for select
  using (active or public.is_admin());

create policy "collections: admin write"
  on public.collections for all
  using (public.is_admin()) with check (public.is_admin());

create policy "cats: public read"
  on public.cats for select
  using (true);

create policy "cats: admin write"
  on public.cats for all
  using (public.is_admin()) with check (public.is_admin());

create policy "products: public read active"
  on public.products for select
  using (active or public.is_admin());

create policy "products: admin write"
  on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- orders / order_items: read own or admin. No client writes at all.
-- ---------------------------------------------------------------------------
create policy "orders: read own"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create policy "order_items: read own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- storage: product-images bucket — public read, admin-only write
-- ---------------------------------------------------------------------------
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product-images: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admin update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
