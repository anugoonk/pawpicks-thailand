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

type OrderRow = {
  id: string;
  status: string;
  amount_total_thb: number | null;
  currency: string | null;
  created_at: string;
  order_items:
    | { name: string; quantity: number; unit_price_thb: number }[]
    | null;
};

/**
 * The signed-in user's orders, newest first. Relies on the RLS policy
 * "orders: read own" — the cookie-bound server client only ever sees rows
 * where `user_id = auth.uid()`. Returns [] when signed out or unconfigured.
 */
export async function getMyOrders(): Promise<MyOrder[]> {
  if (!hasSupabase()) return [];

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, amount_total_thb, currency, created_at, order_items(name, quantity, unit_price_thb)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return (data as OrderRow[]).map((o) => ({
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
  }));
}
