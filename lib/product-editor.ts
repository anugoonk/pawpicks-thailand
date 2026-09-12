import { z } from "zod";

// Product art can use local assets or HTTPS; reject script/data URLs and protocol-relative URLs.
export const imageUrlSchema = z.string().trim().max(2000).refine((value) => {
  if (/^\/assets\/[a-zA-Z0-9/_ .-]+$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
  catch { return false; }
}, "ใช้ URL รูป https:// หรือ /assets/ เท่านั้น");

export const productDetailsInputSchema = z.object({
  productId: z.string().min(1).max(200),
  dimensions: z.string().trim().max(300),
  material: z.string().trim().max(300),
  instructions: z.string().trim().max(4000),
  suitableFor: z.string().trim().max(1000),
  images: z.array(z.object({ src: imageUrlSchema, alt: z.string().trim().min(1).max(300) })).max(8),
});

export const inventoryInputSchema = z.object({
  productId: z.string().min(1).max(200),
  quantity: z.coerce.number().int().min(0).max(1000000),
  threshold: z.coerce.number().int().min(0).max(1000000),
  expectedUpdatedAt: z.string().datetime({ offset: true }),
});

export type ActionState = { error?: string; success?: string };
