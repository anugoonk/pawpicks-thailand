"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { inventoryInputSchema, productDetailsInputSchema, type ActionState } from "@/lib/product-editor";

export async function saveProductDetails(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { error: "ไม่มีสิทธิ์แก้ไขสินค้า" };
  const imageLines = String(form.get("images") ?? "").split(/\r?\n/).filter((line) => line.trim());
  const parsed = productDetailsInputSchema.safeParse({
    productId: form.get("productId"), dimensions: form.get("dimensions"), material: form.get("material"),
    instructions: form.get("instructions"), suitableFor: form.get("suitableFor"),
    images: imageLines.map((line) => { const [src, ...alt] = line.split("|"); return { src: src.trim(), alt: alt.join("|").trim() }; }),
  });
  if (!parsed.success) return { error: "ตรวจสอบข้อมูล รูปแต่ละบรรทัดต้องเป็น URL https:// หรือ /assets/ ตามด้วย | และคำอธิบายรูป (สูงสุด 8 รูป)" };
  const { productId, ...details } = parsed.data;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").update({ details }).eq("id", productId).select("id");
  if (error || !data?.length) return { error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  revalidatePath("/admin/products"); revalidatePath("/products/[slug]", "page");
  return { success: "บันทึกรายละเอียดสินค้าแล้ว" };
}

export async function saveInventory(_previous: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { error: "ไม่มีสิทธิ์แก้ไขสต็อก" };
  if (form.get("quantity") === "" || form.get("threshold") === "") return { error: "กรุณากรอกจำนวนสินค้าและจุดแจ้งเตือน" };
  const parsed = inventoryInputSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "กรอกจำนวนเต็มตั้งแต่ 0 ถึง 1,000,000" };
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_inventory", {
    p_product_id: parsed.data.productId, p_quantity: parsed.data.quantity,
    p_threshold: parsed.data.threshold, p_expected_updated_at: parsed.data.expectedUpdatedAt,
  });
  if (error) return { error: error.message.includes("inventory_changed")
    ? "สต็อกมีการเปลี่ยนแปลง กรุณารีเฟรชหน้า ตรวจจำนวนล่าสุด แล้วบันทึกอีกครั้ง"
    : "บันทึกสต็อกไม่สำเร็จ กรุณาลองใหม่" };
  revalidatePath("/admin/products"); revalidatePath("/"); revalidatePath("/products/[slug]", "page");
  return { success: "บันทึกสต็อกแล้ว" };
}
