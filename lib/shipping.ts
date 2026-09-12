import { z } from "zod";

export const CARRIERS = ["ไปรษณีย์ไทย", "KEX", "Flash Express", "J&T Express", "SPX Express", "DHL", "อื่น ๆ"] as const;
export const shipmentSchema = z.object({
  orderId: z.string().uuid(),
  carrier: z.enum(CARRIERS),
  trackingNumber: z.string().trim().min(5).max(80).regex(/^[a-zA-Z0-9-]+$/),
});

export const STATUS_TH: Record<string, string> = {
  pending: "รอชำระเงิน", paid: "กำลังเตรียมจัดส่ง", fulfilled: "จัดส่งแล้ว",
  cancelled: "ยกเลิก", refunded: "คืนเงินแล้ว",
};
