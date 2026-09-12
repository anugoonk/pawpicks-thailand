import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let db: PGlite;
const adminId = "00000000-0000-0000-0000-000000000001";
const customerId = "00000000-0000-0000-0000-000000000002";
const items = [{ productId: "p1", quantity: 1 }];
const lines = [{ product_id: "p1", name: "Test product", unit_price_thb: 100, quantity: 1 }];
const reserve = (id = "cs_1", input = items) => db.query("select reserve_stock($1, $2, now() + interval '30 minutes')", [id, JSON.stringify(input)]);
const event = (status: string, id = "cs_1", input = lines, required = true) => db.query("select apply_checkout_event($1, $2, $3)", [JSON.stringify({
  stripe_session_id: id, status, user_id: customerId, amount_total_thb: 100,
  currency: "thb", paid_at: status === "paid" ? "2026-09-12T10:00:00Z" : null,
}), JSON.stringify(input), required]);
async function stock() { return (await db.query<{ stock_quantity: number }>("select stock_quantity from products where id='p1'")).rows[0].stock_quantity; }

beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text);
    create table storage.objects(id uuid primary key, bucket_id text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
  for (const file of ["20260910120000_init.sql", "20260910120100_rls.sql", "20260911000000_security_hardening.sql", "20260911000001_handle_new_user_revoke_public.sql", "20260912000000_orders_shipping_address.sql", "20260912010000_product_inventory_shipping.sql"]) {
    // PGlite has gen_random_uuid built in; the optional pgcrypto extension is unnecessary here.
    await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8").replace('create extension if not exists "pgcrypto";', ""));
  }
  await db.exec(`grant usage on schema public, auth to anon, authenticated, service_role;
    grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
    insert into auth.users values ('${adminId}', 'admin@example.test'), ('${customerId}', 'buyer@example.test');
    update profiles set role='admin' where id='${adminId}';`);
}, 30000);
beforeEach(async () => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);
    truncate stock_reservations, order_items, orders, products cascade;
    insert into products(id,slug,name,category,price_thb,image,shopee_url,stock_quantity)
      values ('p1','p1','Test product','Test',100,'/assets/test.png','https://shopee.co.th/test',2),
      ('p2','p2','Unavailable product','Test',100,'/assets/test.png','https://shopee.co.th/test',0);`);
});
afterAll(async () => { await db?.close(); });

describe("inventory transactions", () => {
  it("reserves once and prevents another checkout overselling the last unit", async () => {
    await reserve("cs_1", [{ productId: "p1", quantity: 2 }]);
    await reserve("cs_1", [{ productId: "p1", quantity: 2 }]);
    expect(await stock()).toBe(0);
    await expect(reserve("cs_2")).rejects.toThrow("insufficient_stock");
    expect(await stock()).toBe(0);
  });
  it("rolls back the whole cart when any item is unavailable", async () => {
    await expect(reserve("cs_1", [...items, { productId: "p2", quantity: 1 }])).rejects.toThrow("insufficient_stock");
    expect(await stock()).toBe(2);
  });
  it("rejects duplicate, unknown, inactive and unconfirmed stock", async () => {
    await expect(reserve("cs_dup", [...items, ...items])).rejects.toThrow("invalid_items");
    await expect(reserve("cs_bad", [{ productId: "missing", quantity: 1 }])).rejects.toThrow("insufficient_stock");
    await db.exec("update products set active=false where id='p1'");
    await expect(reserve()).rejects.toThrow("insufficient_stock");
    await db.exec("update products set active=true, stock_quantity=null where id='p1'");
    await expect(reserve()).rejects.toThrow("insufficient_stock");
  });
  it("releases an expired reservation exactly once", async () => {
    await reserve(); await event("cancelled"); await event("cancelled");
    expect(await stock()).toBe(2);
  });
  it("prevents reserving a session whose expiration webhook arrived first", async () => {
    await event("cancelled");
    await expect(reserve()).rejects.toThrow("reservation_conflict");
  });
  it("holds stock during delayed payment and consumes once on success", async () => {
    await reserve(); await event("pending"); await event("paid"); await event("paid");
    await event("pending"); await event("cancelled");
    expect(await stock()).toBe(1);
    expect((await db.query("select status from orders")).rows).toEqual([{ status: "paid" }]);
    expect((await db.query("select count(*)::int as count from order_items")).rows).toEqual([{ count: 1 }]);
  });
  it("rolls back the order and reservation consumption when item writing fails", async () => {
    await reserve();
    await expect(event("paid", "cs_1", [{ ...lines[0], quantity: 0 }])).rejects.toThrow();
    expect((await db.query("select * from orders")).rows).toHaveLength(0);
    expect((await db.query("select state from stock_reservations")).rows).toEqual([{ state: "held" }]);
    await event("paid"); expect(await stock()).toBe(1);
  });
  it("requires a reservation for new sessions but accepts legacy sessions", async () => {
    await expect(event("paid")).rejects.toThrow("reservation_missing");
    await event("paid", "cs_legacy", lines, false);
    expect((await db.query("select status from orders")).rows).toEqual([{ status: "paid" }]);
  });
  it("rejects stale admin stock counts after a reservation", async () => {
    const old = (await db.query<{ stamp: string }>("select updated_at::text as stamp from products where id='p1'")).rows[0].stamp;
    await reserve();
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${adminId}',false)`);
    await expect(db.query("select update_inventory('p1',10,5,$1)", [old])).rejects.toThrow("inventory_changed");
    expect(await stock()).toBe(1);
  });
});

describe("shipment authorization and payment state", () => {
  it("admin can ship a paid order and later webhook retries preserve tracking", async () => {
    await reserve(); await event("paid");
    const id = (await db.query<{ id: string }>("select id from orders")).rows[0].id;
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${adminId}',false)`);
    await db.query("select ship_order($1,'Flash Express','TH123456789')", [id]);
    await db.exec("reset role"); await event("paid"); await event("cancelled");
    expect((await db.query("select status, tracking_number from orders")).rows).toEqual([{ status: "fulfilled", tracking_number: "TH123456789" }]);
    expect(await stock()).toBe(1);
  });
  it("refuses shipment before payment", async () => {
    await reserve(); await event("pending");
    const id = (await db.query<{ id: string }>("select id from orders")).rows[0].id;
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${adminId}',false)`);
    await expect(db.query("select ship_order($1,'Flash Express','TH123456789')", [id])).rejects.toThrow("order_not_paid");
    await db.query("update orders set status='paid' where id=$1", [id]);
    expect((await db.query("select status from orders")).rows).toEqual([{ status: "pending" }]);
  });
  it("customers cannot reserve, ship, or change stock through RPCs", async () => {
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${customerId}',false)`);
    await expect(reserve()).rejects.toThrow("permission denied");
    await expect(db.query("select update_inventory('p1',100,5,now())")).rejects.toThrow("forbidden");
    await expect(db.query("select ship_order($1,'Flash Express','TH123456789')", [adminId])).rejects.toThrow("forbidden");
  });
});
