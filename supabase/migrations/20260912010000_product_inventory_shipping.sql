-- Product information is deliberately empty and stock unconfirmed until the
-- owner supplies real specifications and counts. stock_quantity = available units.
alter table public.products
  add column details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  add column stock_quantity integer check (stock_quantity >= 0),
  add column low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0);

alter table public.orders
  add column shipping_carrier text,
  add column tracking_number text,
  add column shipped_at timestamptz;

create table public.stock_reservations (
  stripe_session_id text primary key,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  state text not null default 'held' check (state in ('held', 'consumed', 'released')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.stock_reservations enable row level security;
create policy "reservations: admin read" on public.stock_reservations
  for select to authenticated using (public.is_admin());

-- All reservation operations lock session first, then products in id order.
-- Decrementing available units in the same transaction prevents overselling.
create function public.reserve_stock(p_session_id text, p_items jsonb, p_expires_at timestamptz)
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
      where id = item."productId" and active and stock_quantity >= item.quantity;
    if not found then raise exception 'insufficient_stock'; end if;
  end loop;
  insert into public.stock_reservations(stripe_session_id, items, expires_at)
    values (p_session_id, p_items, p_expires_at);
end;
$$;

-- Only call after Stripe confirms expiration/failure, never merely on a local
-- timer: delayed payments must retain their stock until Stripe settles them.
create function public.release_stock(p_session_id text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare reservation public.stock_reservations; item record;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_session_id, 0));
  select * into reservation from public.stock_reservations where stripe_session_id = p_session_id for update;
  if not found then
    insert into public.stock_reservations(stripe_session_id, items, state, expires_at)
      values (p_session_id, '[]', 'released', now());
    return;
  end if;
  if reservation.state <> 'held' then return; end if;
  for item in select * from jsonb_to_recordset(reservation.items) as x("productId" text, quantity integer) order by "productId" loop
    update public.products set stock_quantity = stock_quantity + item.quantity where id = item."productId";
  end loop;
  update public.stock_reservations set state = 'released' where stripe_session_id = p_session_id;
end;
$$;

-- An entire verified webhook is one transaction: order, items and reservation.
-- Repeated or delayed events cannot duplicate items or regress paid/shipped orders.
create function public.apply_checkout_event(p_order jsonb, p_items jsonb, p_inventory_required boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare session_id text := p_order->>'stripe_session_id';
  outcome public.order_status := (p_order->>'status')::public.order_status;
  existing public.orders; reservation public.stock_reservations; v_order_id uuid;
begin
  if session_id is null or outcome not in ('pending', 'paid', 'cancelled') then raise exception 'invalid_event'; end if;
  perform pg_advisory_xact_lock(hashtextextended(session_id, 0));
  select * into existing from public.orders where stripe_session_id = session_id for update;
  if existing.status in ('paid', 'fulfilled', 'refunded') then return; end if;
  if outcome = 'cancelled' then
    perform public.release_stock(session_id);
    update public.orders set status = 'cancelled' where stripe_session_id = session_id and status = 'pending';
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

-- Both UI authorization and SQL authorization apply. Stale inventory forms
-- cannot overwrite units reserved by a checkout since the form was opened.
create function public.update_inventory(p_product_id text, p_quantity integer, p_threshold integer, p_expected_updated_at timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_quantity is null or p_threshold is null or p_quantity not between 0 and 1000000 or p_threshold not between 0 and 1000000 then
    raise exception 'invalid_inventory';
  end if;
  update public.products set stock_quantity = p_quantity, low_stock_threshold = p_threshold
    where id = p_product_id and updated_at = p_expected_updated_at;
  if not found then raise exception 'inventory_changed'; end if;
end;
$$;

create function public.ship_order(p_order_id uuid, p_carrier text, p_tracking_number text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_carrier is null or p_carrier not in ('ไปรษณีย์ไทย', 'KEX', 'Flash Express', 'J&T Express', 'SPX Express', 'DHL', 'อื่น ๆ')
    or p_tracking_number is null or p_tracking_number !~ '^[a-zA-Z0-9-]{5,80}$' then raise exception 'invalid_shipment'; end if;
  update public.orders set shipping_carrier = p_carrier, tracking_number = p_tracking_number,
    shipped_at = coalesce(shipped_at, now()), status = 'fulfilled'
    where id = p_order_id and status in ('paid', 'fulfilled');
  if not found then raise exception 'order_not_paid'; end if;
end;
$$;

revoke all on function public.reserve_stock(text, jsonb, timestamptz) from public, anon, authenticated;
revoke all on function public.release_stock(text) from public, anon, authenticated;
revoke all on function public.apply_checkout_event(jsonb, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.reserve_stock(text, jsonb, timestamptz) to service_role;
grant execute on function public.release_stock(text) to service_role;
grant execute on function public.apply_checkout_event(jsonb, jsonb, boolean) to service_role;
revoke all on function public.update_inventory(text, integer, integer, timestamptz) from public, anon;
revoke all on function public.ship_order(uuid, text, text) from public, anon;
grant execute on function public.update_inventory(text, integer, integer, timestamptz) to authenticated;
grant execute on function public.ship_order(uuid, text, text) to authenticated;

-- Order payment states belong to verified webhooks. Admin shipment writes go
-- through ship_order, so a browser cannot mark an unpaid order as paid/shipped.
drop policy "orders: admin update" on public.orders;
