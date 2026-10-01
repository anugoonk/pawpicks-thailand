import { z } from "zod";

export const CARRIERS = ["ไปรษณีย์ไทย", "KEX", "Flash Express", "J&T Express", "SPX Express", "DHL", "อื่น ๆ"] as const;
export const shipmentSchema = z.object({
  orderId: z.string().uuid(),
  carrier: z.enum(CARRIERS),
  trackingNumber: z.string().trim().min(5).max(80).regex(/^[a-zA-Z0-9-]+$/),
});

export const STATUS_TH: Record<string, string> = {
  pending: "รอชำระเงิน", awaiting_payment: "รอชำระเงิน", paid: "ชำระเงินแล้ว",
  processing: "กำลังเตรียมจัดส่ง", shipped: "จัดส่งแล้ว", fulfilled: "จัดส่งแล้ว",
  completed: "เสร็จสมบูรณ์", cancelled: "ยกเลิก", refunded: "คืนเงินแล้ว",
};

/** Statuses meaning the buyer's payment was confirmed by a verified webhook. */
export const PAID_STATUSES = ["paid", "processing", "shipped", "fulfilled", "completed"] as const;
/** Statuses where the parcel has left (or the order is done). */
export const SHIPPED_STATUSES = ["shipped", "fulfilled", "completed"] as const;
/** Statuses an admin may attach / edit tracking on (mirrors SQL ship_order). */
export const SHIPPABLE_STATUSES = ["paid", "processing", "shipped", "fulfilled"] as const;
export const CLOSED_STATUSES = ["cancelled", "refunded"] as const;

export const isPaidStatus = (s: string) => (PAID_STATUSES as readonly string[]).includes(s);
export const isShippedStatus = (s: string) => (SHIPPED_STATUSES as readonly string[]).includes(s);
export const isShippableStatus = (s: string) => (SHIPPABLE_STATUSES as readonly string[]).includes(s);
export const isClosedStatus = (s: string) => (CLOSED_STATUSES as readonly string[]).includes(s);
