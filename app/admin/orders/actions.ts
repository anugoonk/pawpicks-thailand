"use server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { shipmentSchema } from "@/lib/shipping";
import type { ActionState } from "@/lib/product-editor";

export async function saveShipment(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { error: "ไม่มีสิทธิ์แก้ไขการจัดส่ง" };
  const parsed = shipmentSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "เลือกบริษัทขนส่งและกรอกเลขพัสดุ 5–80 ตัวอักษร (ภาษาอังกฤษ ตัวเลข หรือ -)" };
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase.rpc("ship_order", {
    p_order_id: parsed.data.orderId, p_carrier: parsed.data.carrier, p_tracking_number: parsed.data.trackingNumber,
  });
  if (error) return { error: error.message.includes("order_not_paid")
    ? "จัดส่งได้เฉพาะคำสั่งซื้อที่ชำระเงินแล้ว กรุณารีเฟรชเพื่อตรวจสถานะ"
    : "บันทึกการจัดส่งไม่สำเร็จ กรุณาลองใหม่" };
  revalidatePath("/admin/orders"); revalidatePath("/account");
  return { success: "บันทึกเลขพัสดุและเปลี่ยนสถานะเป็นจัดส่งแล้ว" };
}
