import { z } from "zod";

/** A curated product shown on the storefront. */
export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  /** Price in Thai Baht, whole number (Stripe amount = priceThb * 100). */
  priceThb: z.number().int().nonnegative(),
  image: z.string(),
  /** CSS crop class from the original design (crop-fountain, crop-feeder, …). */
  imageCrop: z.string().nullable().default(null),
  badge: z.string().nullable().default(null),
  badgeDark: z.boolean().default(false),
  companionCatId: z.string().nullable().default(null),
  companionLabel: z.string().nullable().default(null),
  companionImage: z.string().nullable().default(null),
  companionAlt: z.string().nullable().default(null),
  shopeeUrl: z.string().url(),
  searchKeywords: z.string().default(""),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type Product = z.infer<typeof productSchema>;

/** A "shop by collection" card. Visual label/order come from CSS ::before. */
export const collectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  blurb: z.string(),
  query: z.string(),
  catImages: z.array(z.object({ src: z.string(), alt: z.string() })).length(2),
  sortOrder: z.number().int().default(0),
});
export type Collection = z.infer<typeof collectionSchema>;

/** A PawPicks mascot cat. */
export const catSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  ariaLabel: z.string(),
  query: z.string().default(""),
  sortOrder: z.number().int().default(0),
});
export type Cat = z.infer<typeof catSchema>;

/* ------------------------------------------------------------------ */
/* Checkout                                                            */
/* ------------------------------------------------------------------ */

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;
