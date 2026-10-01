-- Product catalogue fields (status, SKU, brand, warranty, SEO ...).
--
-- status is the source of truth for sale state:
--   draft         visible, but data/stock unconfirmed ("กำลังตรวจสอบข้อมูล") - not sellable
--   active        sellable (stock > 0)
--   out_of_stock  visible, stock confirmed at 0
--   archived      hidden
-- products.active is kept (RLS "public read active" and legacy code use it) but is
-- now DERIVED: active = (status <> 'archived'). A trigger keeps both in sync and
-- still accepts legacy writers that only touch active / stock_quantity.
-- No product data is invented: new columns are NULL until the owner fills them.

alter table public.products
  add column status text,
  add column sku text,
  add column brand text,
  add column model text,
  add column compare_at_price_thb integer check (compare_at_price_thb is null or compare_at_price_thb >= 0),
  add column full_description text,
  add column key_features jsonb not null default '[]'::jsonb check (jsonb_typeof(key_features) = 'array'),
  add column warranty text,
  add column shipping_weight_g integer check (shipping_weight_g is null or shipping_weight_g >= 0),
  add column return_info text,
  add column seo_title text,
  add column seo_description text;

-- Backfill from the old model (active + stock) before NOT NULL / CHECK apply.
update public.products set status = case
  when not active then 'archived'
  when stock_quantity is null then 'draft'
  when stock_quantity > 0 then 'active'
  else 'out_of_stock' end;

alter table public.products
  alter column status set not null,
  add constraint products_status_check check (status in ('draft', 'active', 'out_of_stock', 'archived'));
create unique index products_sku_key on public.products (sku) where sku is not null;
create index products_status_idx on public.products (status);

create or replace function public.sync_product_status()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    if new.status is null then  -- legacy insert that only knows active/stock
      new.status := case when not new.active then 'archived'
        when new.stock_quantity is null then 'draft'
        when new.stock_quantity > 0 then 'active' else 'out_of_stock' end;
    end if;
  elsif new.status is not distinct from old.status and new.active is distinct from old.active then
    -- legacy writer toggled active only
    new.status := case when not new.active then 'archived'
      when new.stock_quantity is null then 'draft'
      when new.stock_quantity > 0 then 'active' else 'out_of_stock' end;
  elsif old.status = 'draft' and new.status = 'draft'
        and old.stock_quantity is null and new.stock_quantity is not null then
    -- first confirmed stock count promotes a draft (mirrors the old active+stock rule)
    new.status := case when new.stock_quantity > 0 then 'active' else 'out_of_stock' end;
  end if;
  -- active / out_of_stock must always agree with the confirmed count
  if new.status in ('active', 'out_of_stock') then
    new.status := case when new.stock_quantity is null then 'draft'
      when new.stock_quantity > 0 then 'active' else 'out_of_stock' end;
  end if;
  new.active := new.status <> 'archived';
  return new;
end;
$$;
create trigger products_sync_status
  before insert or update on public.products
  for each row execute function public.sync_product_status();

-- Redefined (create or replace keeps grants): selling now requires status = 'active'.
create or replace function public.reserve_stock(p_session_id text, p_items jsonb, p_expires_at timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare item record; existing public.stock_reservations;
begin
  if p_session_id is null or p_session_id = '' or p_expires_at <= now()
     or p_expires_at is null or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'invalid_reservation';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_session_id, 0));
  select * into existing from public.stock_reservations where stripe_session_id = p_session_id for update;
  if found then
    if existing.state = 'held' and existing.items = p_items then return; end if;
    raise exception 'reservation_conflict';
  end if;
  if exists (select 1 from jsonb_to_recordset(p_items) as x("productId" text, quantity integer)
    where x."productId" is null or x.quantity is null or x.quantity not between 1 and 20)
    or (select count(*) <> count(distinct x."productId") from jsonb_to_recordset(p_items) as x("productId" text, quantity integer)) then
    raise exception 'invalid_items';
  end if;
  for item in select * from jsonb_to_recordset(p_items) as x("productId" text, quantity integer) order by "productId" loop
    update public.products set stock_quantity = stock_quantity - item.quantity
      where id = item."productId" and status = 'active' and stock_quantity >= item.quantity;
    if not found then raise exception 'insufficient_stock'; end if;
  end loop;
  insert into public.stock_reservations(stripe_session_id, items, expires_at)
    values (p_session_id, p_items, p_expires_at);
end;
$$;

-- A paid order must never regress when a later/duplicate webhook arrives, including
-- the new post-payment states.
create or replace function public.apply_checkout_event(p_order jsonb, p_items jsonb, p_inventory_required boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare session_id text := p_order->>'stripe_session_id';
  outcome public.order_status := (p_order->>'status')::public.order_status;
  existing public.orders; reservation public.stock_reservations; v_order_id uuid;
begin
  if session_id is null or outcome not in ('pending', 'paid', 'cancelled') then raise exception 'invalid_event'; end if;
  perform pg_advisory_xact_lock(hashtextextended(session_id, 0));
  select * into existing from public.orders where stripe_session_id = session_id for update;
  if existing.status in ('paid', 'processing', 'shipped', 'fulfilled', 'completed', 'refunded') then return; end if;
  if outcome = 'cancelled' then
    perform public.release_stock(session_id);
    update public.orders set status = 'cancelled' where stripe_session_id = session_id and status in ('pending', 'awaiting_payment');
    return;
  end if;
  if existing.status = 'cancelled' and outcome = 'pending' then return; end if;
  select * into reservation from public.stock_reservations where stripe_session_id = session_id for update;
  if p_inventory_required and (reservation.stripe_session_id is null or reservation.state <> 'held') then
    raise exception 'reservation_missing';
  end if;
  if reservation.state = 'released' then return; end if;
  insert into public.orders(stripe_session_id, stripe_payment_intent, user_id, status, email,
    amount_total_thb, currency, paid_at, shipping_address)
  values (session_id, p_order->>'stripe_payment_intent', (p_order->>'user_id')::uuid, outcome,
    p_order->>'email', (p_order->>'amount_total_thb')::integer, p_order->>'currency',
    (p_order->>'paid_at')::timestamptz, nullif(p_order->'shipping_address', 'null'::jsonb))
  on conflict (stripe_session_id) do update set
    status = excluded.status, stripe_payment_intent = excluded.stripe_payment_intent,
    email = coalesce(excluded.email, orders.email), amount_total_thb = excluded.amount_total_thb,
    paid_at = excluded.paid_at, shipping_address = coalesce(excluded.shipping_address, orders.shipping_address)
  returning id into v_order_id;
  delete from public.order_items where order_items.order_id = v_order_id;
  insert into public.order_items(order_id, product_id, name, unit_price_thb, quantity)
    select v_order_id, p.id, x.name, x.unit_price_thb, x.quantity
    from jsonb_to_recordset(p_items) as x(product_id text, name text, unit_price_thb integer, quantity integer)
    left join public.products p on p.id = x.product_id;
  if outcome = 'paid' then
    update public.stock_reservations set state = 'consumed' where stripe_session_id = session_id and state = 'held';
  end if;
end;
$$;

-- Shipping may start from processing and re-edit tracking after shipped. The app
-- still records 'fulfilled'; shipped/completed are available for later use.
create or replace function public.ship_order(p_order_id uuid, p_carrier text, p_tracking_number text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_carrier is null or p_carrier not in ('ไปรษณีย์ไทย', 'KEX', 'Flash Express', 'J&T Express', 'SPX Express', 'DHL', 'อื่น ๆ')
    or p_tracking_number is null or p_tracking_number !~ '^[a-zA-Z0-9-]{5,80}$' then raise exception 'invalid_shipment'; end if;
  update public.orders set shipping_carrier = p_carrier, tracking_number = p_tracking_number,
    shipped_at = coalesce(shipped_at, now()), status = 'fulfilled'
    where id = p_order_id and status in ('paid', 'processing', 'shipped', 'fulfilled');
  if not found then raise exception 'order_not_paid'; end if;
end;
$$;
