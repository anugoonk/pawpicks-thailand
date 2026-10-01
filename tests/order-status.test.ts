import { describe, expect, it } from "vitest";
import { STATUS_TH, isClosedStatus, isPaidStatus, isShippableStatus, isShippedStatus } from "@/lib/shipping";
import { orderStatusSchema } from "@/lib/types";

describe("order status groups", () => {
  it("every status in the schema has a Thai label", () => {
    for (const s of orderStatusSchema.options) expect(STATUS_TH[s], s).toBeTruthy();
  });

  it("unpaid and closed orders are never treated as paid", () => {
    for (const s of ["pending", "awaiting_payment", "cancelled", "refunded"]) expect(isPaidStatus(s), s).toBe(false);
  });

  it("everything after payment counts as paid", () => {
    for (const s of ["paid", "processing", "shipped", "fulfilled", "completed"]) expect(isPaidStatus(s), s).toBe(true);
  });

  it("shipped grouping and shippable set match the SQL ship_order rule", () => {
    expect(["shipped", "fulfilled", "completed"].every(isShippedStatus)).toBe(true);
    expect(isShippedStatus("paid")).toBe(false);
    expect(["paid", "processing", "shipped", "fulfilled"].every(isShippableStatus)).toBe(true);
    expect(["pending", "awaiting_payment", "completed", "cancelled", "refunded"].some(isShippableStatus)).toBe(false);
    expect(isClosedStatus("refunded") && isClosedStatus("cancelled")).toBe(true);
  });
});
