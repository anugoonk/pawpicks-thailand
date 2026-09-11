import "server-only";

import { hasSupabase } from "@/lib/env";

export type MyOrderItem = {
  name: string;
  quantity: number;
  unitPriceThb: number;
};

export type MyOrder = {
  id: string;
  status: string;
  amountTotalThb: number;
  currency: string;
  createdAt: string;
  items: MyOrderItem[];
};

export type OrderRow = {
  id: string;
  status: string;
  amount_total_thb: number | null;
  currency: string | null;
  created_at: string;
  order_items:
    | { name: string; quantity: number; unit_price_thb: number }[]
    | null;
};

/** snake_case DB row -> camelCase app shape, with the same defaults as the
 *  DB columns' `not null default` (0 baht, "thb", no items). */
export function mapOrderRow(o: OrderRow): MyOrder {
  return {
    id: o.id,
    status: o.status,
    amountTotalThb: o.amount_total_thb ?? 0,
    currency: o.currency ?? "thb",
    createdAt: o.created_at,
    items: (o.order_items ?? []).map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPriceThb: it.unit_price_thb,
    })),
  };
}

/**
 * Orders visible to the signed-in caller, newest first. Relies on the RLS
 * policy "orders: read own" (`user_id = auth.uid() or is_admin()`) — the
 * cookie-bound server client sees only its own orders, or every order when
 * the caller is an admin. Returns [] when signed out or unconfigured.
 */
export async function getMyOrders(limit = 50): Promise<MyOrder[]> {
  if (!hasSupabase()) return [];

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, amount_total_thb, currency, created_at, order_items(name, quantity, unit_price_thb)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as OrderRow[]).map(mapOrderRow);
}
