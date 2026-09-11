import type { ShippingAddress } from "@/lib/checkout";

const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

/** Format a whole-Baht amount as "฿1,290". */
export function formatThb(amount: number): string {
  return thb.format(amount);
}

/** One-line delivery address for display, or null if nothing was collected. */
export function formatShippingAddress(a: ShippingAddress | null): string | null {
  if (!a) return null;
  const line = [a.line1, a.line2, a.city, a.state, a.postalCode]
    .filter(Boolean)
    .join(" ");
  return line || null;
}
