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
  details: z.object({
    dimensions: z.string().max(300).default(""),
    material: z.string().max(300).default(""),
    instructions: z.string().max(4000).default(""),
    suitableFor: z.string().max(1000).default(""),
    images: z.array(z.object({ src: z.string(), alt: z.string() })).max(8).default([]),
  }).default({}),
  /** Available units, excluding active checkout reservations. Null = unconfirmed. */
  stockQuantity: z.number().int().nonnegative().nullable().default(null),
  lowStockThreshold: z.number().int().nonnegative().default(5),
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
}).refine(({ items }) => new Set(items.map((i) => i.productId)).size === items.length,
  { message: "Duplicate products are not allowed", path: ["items"] });
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/* ------------------------------------------------------------------ */
/* Top 10 articles                                                     */
/* ------------------------------------------------------------------ */

export const articleStatusSchema = z.enum(["draft", "coming_soon", "published"]);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

/** A single ranked product entry inside a published Top 10 article. */
export const top10ItemSchema = z.object({
  rank: z.number().int().min(1).max(10),
  productName: z.string().min(1),
  summary: z.string().min(1),
  shopeeUrl: z.string().url().optional(),
  image: z.string().optional(),
});
export type Top10Item = z.infer<typeof top10ItemSchema>;

/**
 * A PawPicks Top 10 article. `published` articles are the only ones that may
 * carry real ranked items — everything else must stay empty so the site
 * never shows fabricated products, prices, or reviews. Enforced below: a
 * `published` article without exactly 10 verified items fails to parse,
 * which fails the build rather than shipping bad content.
 */
export const top10ArticleSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    category: z.string().min(1),
    excerpt: z.string().min(1),
    status: articleStatusSchema.default("coming_soon"),
    items: z.array(top10ItemSchema).max(10).default([]),
    verifiedAt: z.string().optional(),
  })
  .superRefine((article, ctx) => {
    if (article.status === "published") {
      if (article.items.length !== 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items"],
          message: `Published article "${article.slug}" must have exactly 10 verified items (has ${article.items.length}).`,
        });
      }
      if (!article.verifiedAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["verifiedAt"],
          message: `Published article "${article.slug}" must have verifiedAt set.`,
        });
      }
    }
  });
export type Top10Article = z.infer<typeof top10ArticleSchema>;
