import { beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_PRODUCTS } from "@/lib/data";
import { POST } from "@/app/api/checkout/route";

const mock = vi.hoisted(() => ({ products: vi.fn(), create: vi.fn(), expire: vi.fn(), rpc: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/env", () => ({ hasStripe: () => true, hasSupabase: () => true, getSiteUrl: () => "https://shop.example.test", serverEnv: () => ({ SHIPPING_FLAT_RATE: 50, FREE_SHIPPING_THRESHOLD: 1500 }) }));
vi.mock("@/lib/products", () => ({ getProductsByIds: mock.products }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => ({ ok: true }), clientIp: () => "test" }));
vi.mock("@/lib/stripe", () => ({ assertTestModeOutsideProduction: vi.fn(), getStripe: () => ({ checkout: { sessions: { create: mock.create, expire: mock.expire } } }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mock.rpc }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }) }));

const product = { ...FALLBACK_PRODUCTS[0], stockQuantity: 2 };
const item = { productId: product.id, quantity: 1 };
const request = (items = [item]) => new Request("https://shop.example.test/api/checkout", { method: "POST", body: JSON.stringify({ items }) });
beforeEach(() => {
  vi.clearAllMocks();
  mock.products.mockResolvedValue(new Map([[product.id, product]]));
  mock.create.mockResolvedValue({ id: "cs_test", url: "https://checkout.stripe.com/test", expires_at: 1800000000 });
  mock.expire.mockResolvedValue({}); mock.rpc.mockResolvedValue({ error: null });
});
describe("checkout inventory boundary", () => {
  it("rejects duplicate product IDs before pricing or payment", async () => {
    expect((await POST(request([item, item]))).status).toBe(422);
    expect(mock.products).not.toHaveBeenCalled(); expect(mock.create).not.toHaveBeenCalled();
  });
  it("rejects sold-out and unconfirmed products without creating a Stripe session", async () => {
    for (const stockQuantity of [0, null]) {
      mock.products.mockResolvedValue(new Map([[product.id, { ...product, stockQuantity }]]));
      expect((await POST(request())).status).toBe(409);
    }
    expect(mock.create).not.toHaveBeenCalled();
  });
  it("does not disclose a checkout URL when atomic reservation loses a race", async () => {
    mock.rpc.mockResolvedValue({ error: { message: "insufficient_stock" } });
    const response = await POST(request());
    expect(response.status).toBe(409); expect(await response.json()).not.toHaveProperty("url");
    expect(mock.expire).toHaveBeenCalledWith("cs_test");
  });
  it("fails closed on a reservation network error and expires the unpaid session", async () => {
    mock.rpc.mockRejectedValue(new Error("network"));
    const response = await POST(request());
    expect(response.status).toBe(503); expect(await response.json()).not.toHaveProperty("url");
    expect(mock.expire).toHaveBeenCalledWith("cs_test");
  });
  it("reserves before returning a payment URL and uses server prices", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mock.rpc).toHaveBeenCalledWith("reserve_stock", expect.objectContaining({ p_session_id: "cs_test", p_items: [item] }));
    expect(mock.create).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({ inventory_required: "true" }),
      line_items: [expect.objectContaining({ price_data: expect.objectContaining({ unit_amount: product.priceThb * 100 }) })],
    }));
    expect((await response.json()).url).toBe("https://checkout.stripe.com/test");
  });
});
