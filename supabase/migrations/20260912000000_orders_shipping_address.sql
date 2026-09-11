-- Checkout now collects a delivery address (shipping_address_collection was
-- missing entirely — a physical-goods store with no way to know where to
-- ship). Persist what Stripe collected so orders can actually be fulfilled.
alter table public.orders
  add column shipping_address jsonb;

comment on column public.orders.shipping_address is
  'Stripe Checkout shipping_details, camelCase: {name, phone, line1, line2, city, state, postalCode, country}. Written only by the webhook (service role).';
