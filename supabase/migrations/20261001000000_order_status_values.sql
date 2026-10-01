-- Extra order lifecycle states requested for the storefront. ADD VALUE lives in
-- its own migration (own transaction): Postgres cannot use a new enum value in
-- the transaction that adds it. Existing values keep their meaning; the app
-- still writes 'pending'/'paid'/'fulfilled'/'cancelled'/'refunded' today.
alter type public.order_status add value if not exists 'awaiting_payment' after 'pending';
alter type public.order_status add value if not exists 'processing' after 'paid';
alter type public.order_status add value if not exists 'shipped' after 'processing';
alter type public.order_status add value if not exists 'completed' after 'fulfilled';
