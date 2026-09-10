const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

/** Format a whole-Baht amount as "฿1,290". */
export function formatThb(amount: number): string {
  return thb.format(amount);
}
