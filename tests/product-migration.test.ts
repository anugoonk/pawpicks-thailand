import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const BASE = [
  "20260910120000_init.sql",
  "20260910120100_rls.sql",
  "20260911000000_security_hardening.sql",
  "20260911000001_handle_new_user_revoke_public.sql",
  "20260912000000_orders_shipping_address.sql",
  "20260912010000_product_inventory_shipping.sql",
];
const NEW = ["20261001000000_order_status_values.sql", "20261001000100_product_catalog_fields.sql"];
const adminId = "00000000-0000-0000-0000-000000000001";
const buyerId = "00000000-0000-0000-0000-000000000002";

const apply = async (db: PGlite, files: string[]) => {
  for (const f of files) {
    // PGlite has gen_random_uuid built in; the optional pgcrypto extension is unnecessary.
    await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8").replace('create extension if not exists "pgcrypto";', ""));
  }
};
const bootstrap = (db: PGlite) =>
  db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text);
    create table storage.objects(id uuid primary key, bucket_id text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
const grants = (db: PGlite) =>
  db.exec(`grant usage on schema public, auth to anon, authenticated, service_role;
    grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
    insert into auth.users values ('${adminId}', 'admin@example.test'), ('${buyerId}', 'buyer@example.test');
    update profiles set role='admin' where id='${adminId}';`);
const insert = (id: string, cols = "", vals = "") =>
  `insert into products(id,slug,name,category,price_thb,image,shopee_url${cols}) values ('${id}','${id}','${id}','T',100,'/x.png','https://shopee.co.th/x'${vals});`;

describe("backfill of existing products", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await PGlite.create();
    await bootstrap(db);
    await apply(db, BASE);
    // Rows as they exist in production today: written by old code, no status column yet.
    await db.exec(
      insert("unconfirmed", ",stock_quantity", ",null") + insert("instock", ",stock_quantity", ",5") +
      insert("soldout", ",stock_quantity", ",0") + insert("hidden", ",stock_quantity,active", ",9,false"),
    );
    await apply(db, NEW);
  }, 30000);
  afterAll(async () => { await db?.close(); });

  it("maps active + stock onto the new status without losing visibility", async () => {
    const rows = (await db.query<{ id: string; status: string; active: boolean }>("select id, status, active from products order by id")).rows;
    expect(Object.fromEntries(rows.map((r) => [r.id, r.status]))).toEqual({
      hidden: "archived", instock: "active", soldout: "out_of_stock", unconfirmed: "draft",
    });
    expect(rows.find((r) => r.id === "unconfirmed")?.active).toBe(true); // still shown as "กำลังตรวจสอบข้อมูล"
    expect(rows.find((r) => r.id === "hidden")?.active).toBe(false);
  });

  it("new columns start empty — nothing is invented", async () => {
    const r = (await db.query<Record<string, unknown>>("select sku, brand, model, compare_at_price_thb, warranty, shipping_weight_g, seo_title, key_features from products where id='instock'")).rows[0];
    expect(r).toEqual({ sku: null, brand: null, model: null, compare_at_price_thb: null, warranty: null, shipping_weight_g: null, seo_title: null, key_features: [] });
  });
});

describe("status rules", () => {
  let db: PGlite;
  const status = async (id: string) => (await db.query<{ status: string; active: boolean }>(`select status, active from products where id='${id}'`)).rows[0];
  beforeAll(async () => {
    db = await PGlite.create();
    await bootstrap(db);
    await apply(db, [...BASE, ...NEW]);
    await grants(db);
  }, 30000);
  afterAll(async () => { await db?.close(); });

  it("legacy inserts that omit status are classified from active/stock", async () => {
    await db.exec(insert("l1", ",stock_quantity", ",3") + insert("l2") + insert("l3", ",active", ",false"));
    expect(await status("l1")).toEqual({ status: "active", active: true });
    expect(await status("l2")).toEqual({ status: "draft", active: true });
    expect(await status("l3")).toEqual({ status: "archived", active: false });
  });

  it("rejects an unknown status value", async () => {
    await expect(db.exec(insert("bad", ",status", ",'selling'"))).rejects.toThrow();
  });

  it("'active' without a confirmed stock count is forced back to draft", async () => {
    await db.exec(insert("noStock", ",status", ",'active'"));
    expect((await status("noStock")).status).toBe("draft");
  });

  it("first confirmed stock promotes a draft; zero stock becomes out_of_stock", async () => {
    await db.exec(insert("d1") + insert("d2"));
    await db.exec("update products set stock_quantity = 4 where id='d1'; update products set stock_quantity = 0 where id='d2';");
    expect((await status("d1")).status).toBe("active");
    expect((await status("d2")).status).toBe("out_of_stock");
  });

  it("an explicit draft hold survives later stock changes", async () => {
    await db.exec(insert("hold", ",stock_quantity", ",5") + "update products set status='draft' where id='hold';");
    await db.exec("update products set stock_quantity = 9 where id='hold';");
    expect((await status("hold")).status).toBe("draft");
  });

  it("stock tracks active <-> out_of_stock automatically", async () => {
    await db.exec(insert("s1", ",stock_quantity", ",1"));
    await db.exec("update products set stock_quantity = 0 where id='s1';");
    expect((await status("s1")).status).toBe("out_of_stock");
    await db.exec("update products set stock_quantity = 2 where id='s1';");
    expect((await status("s1")).status).toBe("active");
  });

  it("archiving hides the product; legacy active toggles still work", async () => {
    await db.exec(insert("a1", ",stock_quantity", ",3") + "update products set status='archived' where id='a1';");
    expect(await status("a1")).toEqual({ status: "archived", active: false });
    await db.exec("update products set active = true where id='a1';");
    expect(await status("a1")).toEqual({ status: "active", active: true });
    await db.exec("update products set active = false where id='a1';");
    expect(await status("a1")).toEqual({ status: "archived", active: false });
  });

  it("anonymous visitors cannot read archived products", async () => {
    await db.exec(insert("vis", ",stock_quantity", ",1") + insert("gone", ",stock_quantity,status", ",1,'archived'"));
    await db.exec("set role anon");
    const ids = (await db.query<{ id: string }>("select id from products where id in ('vis','gone')")).rows.map((r) => r.id);
    await db.exec("reset role");
    expect(ids).toEqual(["vis"]);
  });

  it("SKU must be unique when set (many products may have none)", async () => {
    await db.exec(insert("k1", ",sku", ",'SKU-1'") + insert("k2", ",sku", ",'SKU-2'") + insert("k3") + insert("k4"));
    await expect(db.exec(insert("k5", ",sku", ",'SKU-1'"))).rejects.toThrow();
  });

  it("only status='active' products can be reserved; selling the last unit flips to out_of_stock and release restores it", async () => {
    await db.exec(insert("sale", ",stock_quantity", ",1") + insert("held", ",stock_quantity", ",5") + "update products set status='draft' where id='held';");
    const reserve = (id: string, pid: string) =>
      db.query("select reserve_stock($1, $2, now() + interval '30 minutes')", [id, JSON.stringify([{ productId: pid, quantity: 1 }])]);
    await expect(reserve("cs_held", "held")).rejects.toThrow("insufficient_stock");
    await reserve("cs_sale", "sale");
    expect((await status("sale")).status).toBe("out_of_stock");
    await db.query("select release_stock('cs_sale')");
    expect((await status("sale")).status).toBe("active");
  });
});

describe("extended order statuses", () => {
  let db: PGlite;
  const lines = JSON.stringify([{ product_id: "p1", name: "P", unit_price_thb: 100, quantity: 1 }]);
  const event = (st: string, id = "cs_1") =>
    db.query("select apply_checkout_event($1, $2, false)", [JSON.stringify({
      stripe_session_id: id, status: st, user_id: buyerId, amount_total_thb: 100, currency: "thb",
      paid_at: st === "paid" ? "2026-10-01T10:00:00Z" : null,
    }), lines]);
  const orderStatus = async () => (await db.query<{ status: string }>("select status from orders")).rows[0].status;
  beforeAll(async () => {
    db = await PGlite.create();
    await bootstrap(db);
    await apply(db, [...BASE, ...NEW]);
    await grants(db);
    await db.exec(insert("p1", ",stock_quantity", ",5"));
  }, 30000);
  afterAll(async () => { await db?.close(); });

  it("accepts the new lifecycle values", async () => {
    const values = (await db.query<{ v: string }>("select unnest(enum_range(null::order_status))::text as v")).rows.map((r) => r.v);
    expect(values).toEqual(["pending", "awaiting_payment", "paid", "processing", "shipped", "fulfilled", "completed", "cancelled", "refunded"]);
  });

  it("later or duplicate webhooks never regress an order that moved past paid", async () => {
    await event("paid");
    for (const st of ["processing", "shipped", "completed"]) {
      await db.exec(`update orders set status='${st}'`);
      await event("paid"); await event("pending"); await event("cancelled");
      expect(await orderStatus()).toBe(st);
    }
  });

  it("an unpaid awaiting_payment order is cancelled by a failed/expired payment", async () => {
    await db.exec("truncate order_items, orders cascade");
    await event("pending", "cs_2");
    await db.exec("update orders set status='awaiting_payment'");
    await event("cancelled", "cs_2");
    expect(await orderStatus()).toBe("cancelled");
  });

  it("admins can ship a processing order", async () => {
    await db.exec("truncate order_items, orders cascade");
    await event("paid", "cs_3");
    await db.exec("update orders set status='processing'");
    const id = (await db.query<{ id: string }>("select id from orders")).rows[0].id;
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${adminId}',false)`);
    await db.query("select ship_order($1,'Flash Express','TH123456789')", [id]);
    await db.exec("reset role");
    expect((await db.query("select status, tracking_number from orders")).rows).toEqual([{ status: "fulfilled", tracking_number: "TH123456789" }]);
  });
});
