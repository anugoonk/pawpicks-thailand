"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { orderStatusSchema } from "@/lib/types";

/**
 * Manual status change by an admin (e.g. "fulfilled" after shipping,
 * "refunded"). `paid`/`pending`/`cancelled` normally come from the Stripe
 * webhook — this exists for the cases a human needs to intervene.
 *
 * Double-gated: `isAdmin()` here, and the "orders: admin update" RLS policy
 * on the actual write — either alone would already block a non-admin.
 */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const statusInput = String(formData.get("status") ?? "");
  const parsed = orderStatusSchema.safeParse(statusInput);
  if (!orderId || !parsed.success) return;

  if (!(await isAdmin())) return;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.from("orders").update({ status: parsed.data }).eq("id", orderId);

  revalidatePath("/admin/orders");
}
