import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/stripe/webhook/route";

const mock = vi.hoisted(() => ({
  env: { STRIPE_WEBHOOK_SECRET: "whsec_test" as string | undefined },
  construct: vi.fn(),
  listLineItems: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/env", () => ({ serverEnv: () => mock.env }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mock.construct },
    checkout: { sessions: { listLineItems: mock.listLineItems } },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mock.rpc }) }));

const session = (over: Record<string, unknown> = {}) => ({
  id: "cs_1",
  payment_status: "paid",
  amount_total: 10000,
  currency: "thb",
  payment_intent: "pi_1",
  customer_details: { email: "buyer@example.test" },
  metadata: { inventory_required: "true" },
  ...over,
});
const event = (type: string, obj: unknown = session()) => ({ id: "evt_1", type, data: { object: obj } });
const call = (body = "{}", headers: Record<string, string> = { "stripe-signature": "t=1,v1=sig" }) =>
  POST(new Request("https://shop.example.test/api/stripe/webhook", { method: "POST", body, headers }));

beforeEach(() => {
  vi.clearAllMocks();
  mock.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
  mock.rpc.mockResolvedValue({ error: null });
  mock.listLineItems.mockResolvedValue({
    data: [{ description: "Feeder", quantity: 1, price: { unit_amount: 10000, product: { metadata: { product_id: "p1" } } } }],
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("Stripe webhook route", () => {
  it("returns 503 when the webhook secret is not configured", async () => {
    mock.env.STRIPE_WEBHOOK_SECRET = undefined;
    expect((await call()).status).toBe(503);
    expect(mock.rpc).not.toHaveBeenCalled();
  });

  it("rejects a request with no signature header", async () => {
    expect((await call("{}", {})).status).toBe(400);
    expect(mock.construct).not.toHaveBeenCalled();
    expect(mock.rpc).not.toHaveBeenCalled();
  });

  it("rejects an invalid signature and never touches orders", async () => {
    mock.construct.mockImplementation(() => { throw new Error("No signatures found"); });
    const res = await call("forged");
    expect(res.status).toBe(400);
    expect(mock.rpc).not.toHaveBeenCalled();
  });

  it("verifies the exact raw body with the configured secret", async () => {
    mock.construct.mockReturnValue(event("checkout.session.completed"));
    await call('{"raw":"payload"}');
    expect(mock.construct).toHaveBeenCalledWith('{"raw":"payload"}', "t=1,v1=sig", "whsec_test");
  });

  it("marks paid only for a verified, settled session", async () => {
    mock.construct.mockReturnValue(event("checkout.session.completed"));
    const res = await call();
    expect(res.status).toBe(200);
    expect(mock.rpc).toHaveBeenCalledTimes(1);
    const [fn, args] = mock.rpc.mock.calls[0];
    expect(fn).toBe("apply_checkout_event");
    expect(args.p_order).toMatchObject({ stripe_session_id: "cs_1", status: "paid", amount_total_thb: 100 });
    expect(args.p_inventory_required).toBe(true);
    expect(args.p_items).toHaveLength(1);
  });

  it("records an unpaid (e.g. PromptPay in flight) session as pending, not paid", async () => {
    mock.construct.mockReturnValue(event("checkout.session.completed", session({ payment_status: "unpaid" })));
    await call();
    expect(mock.rpc.mock.calls[0][1].p_order.status).toBe("pending");
  });

  it("a failed payment event cancels without fetching line items", async () => {
    mock.construct.mockReturnValue(event("checkout.session.async_payment_failed"));
    await call();
    expect(mock.rpc.mock.calls[0][1].p_order.status).toBe("cancelled");
    expect(mock.listLineItems).not.toHaveBeenCalled();
  });

  it("a duplicate delivery sends the identical idempotent call (SQL dedupes by session)", async () => {
    mock.construct.mockReturnValue(event("checkout.session.completed"));
    expect((await call()).status).toBe(200);
    expect((await call()).status).toBe(200);
    expect(mock.rpc).toHaveBeenCalledTimes(2);
    // paid_at is the delivery time; SQL ignores any event for an already-paid order
    // (see "holds stock during delayed payment and consumes once" in inventory-db.test.ts).
    const strip = (c: unknown[]) => {
      const [fn, a] = c as [string, { p_order: Record<string, unknown> }];
      return [fn, { ...a, p_order: { ...a.p_order, paid_at: undefined } }];
    };
    expect(strip(mock.rpc.mock.calls[1])).toEqual(strip(mock.rpc.mock.calls[0]));
  });

  it("returns 500 so Stripe retries when the database write fails", async () => {
    mock.construct.mockReturnValue(event("checkout.session.completed"));
    mock.rpc.mockResolvedValue({ error: new Error("db down") });
    expect((await call()).status).toBe(500);
  });

  it("acknowledges unrelated events without writing", async () => {
    mock.construct.mockReturnValue(event("customer.created", {}));
    expect((await call()).status).toBe(200);
    expect(mock.rpc).not.toHaveBeenCalled();
  });
});
