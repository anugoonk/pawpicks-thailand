# Product details, inventory and shipment tracking

## Using the features

- `/admin/products`: edit dimensions, materials, suitability, instructions and up to eight additional image URLs with alt text. Original product artwork stays as the first image. Enter verified product information; empty fields show that information is being checked.
- The same page sets **available units** and a low-stock threshold. The summary highlights unconfirmed, low and empty stock. Counts exclude units already reserved for checkout; do not add reserved units back when doing a stock count.
- `/admin/orders`: select a carrier and enter the tracking number on a paid order. Saving changes its status to shipped. Tracking corrections retain the original shipment date. Payment states can no longer be changed using the old manual status dropdown.
- `/account`: customers see their own order progress, carrier, tracking number and shipment date. Guest customers can revisit their private checkout success URL. This is the shop's shipment status; it does not automatically poll a carrier for delivery scans.

## Database rollout

Apply `supabase/migrations/20260912010000_product_inventory_shipping.sql` to the intended Supabase project before deploying this application version. Check the linked project before running `npx supabase db push`; never reset or seed production as part of this rollout.

Existing product stock is intentionally **null / unconfirmed**. An admin must enter real available quantities before these products can be purchased. No stock counts, dimensions, materials or extra product photographs are invented by the migration.

The database change replaces direct admin order updates with the authorized `ship_order` function. Coordinate the migration with the application release: the previous admin status form will no longer update orders after the migration.

Keep these Stripe webhook events enabled:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

Checkout requires Supabase, its service role and Stripe. It creates a Stripe session with a 30-minute expiry, atomically reserves stock, then exposes the checkout URL. A failed reservation expires the session. The verified expiry/failure webhook returns held units exactly once. Delayed payments retain their reservation until Stripe confirms success or failure; never free them solely because the expiry timestamp passed.

Order writing, line items and inventory settlement run in one database transaction. Retries cannot duplicate items, consume stock twice, or regress an already paid/shipped order. Sessions created before this release can still finish without an inventory reservation. Their inventory must be accounted for when entering initial stock.

If webhooks are unavailable, reservations remain held rather than overselling. Restore the endpoint and replay the corresponding Stripe events. Do not manually release stock for a session still capable of completing payment. Refunds and returned-goods restocking remain operational tasks; there is no new refund action in this release.

## Verification

`npm test` includes an isolated PostgreSQL-compatible PGlite database running the actual migrations. Cases cover insufficient stock, whole-cart rollback, idempotent reservations, expiry-before-reserve, delayed payment, repeated/out-of-order webhooks, transactional rollback, stale admin forms, shipment gates and customer permissions. Route tests confirm that reservation failures never return a payment URL.

Run `npm run lint`, `npm run typecheck` and `npm run build` before release. After applying the migration, use a test environment to verify a complete Stripe payment and shipment, then check the customer account and private guest tracking page.
