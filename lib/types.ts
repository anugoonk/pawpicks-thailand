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
  /** Sale state from the DB. Absent for the static fallback → derived from active + stock. */
  status: z.enum(["draft", "active", "out_of_stock", "archived"]).optional(),
  sku: z.string().nullish(),
  brand: z.string().nullish(),
  model: z.string().nullish(),
  compareAtPriceThb: z.number().int().nonnegative().nullish(),
  fullDescription: z.string().nullish(),
  keyFeatures: z.array(z.string()).optional(),
  warranty: z.string().nullish(),
  shippingWeightG: z.number().int().nonnegative().nullish(),
  returnInfo: z.string().nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
  /* Affiliate-recommendation fields. All optional and never invented: the UI
     shows each one only when real, verified data exists. `shopeeUrl` is the
     affiliate URL; `originalPrice` is `compareAtPriceThb`. */
  merchant: z.string().nullish(),
  /** ISO date (YYYY-MM-DD) the price/rating was last checked on the merchant. */
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  /** 0–5; shown only together with `reviewCount`. */
  rating: z.number().min(0).max(5).nullish(),
  reviewCount: z.number().int().nonnegative().nullish(),
  soldCount: z.number().int().nonnegative().nullish(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  bestFor: z.string().nullish(),
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
  "awaiting_payment",
  "paid",
  "processing",
  "shipped",
  "fulfilled",
  "completed",
  "cancelled",
  "refunded",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/* ------------------------------------------------------------------ */
/* Top 10 articles                                                     */
/* ------------------------------------------------------------------ */

export const articleStatusSchema = z.enum(["draft", "coming_soon", "published", "archived"]);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

/** PawPicks Score inputs, each 0–100. Weights live in lib/top10-score.ts. */
export const top10ScoresSchema = z.object({
  quality: z.number().min(0).max(100),
  features: z.number().min(0).max(100),
  value: z.number().min(0).max(100),
  reviews: z.number().min(0).max(100),
  storeTrust: z.number().min(0).max(100),
  warranty: z.number().min(0).max(100),
});
export type Top10Scores = z.infer<typeof top10ScoresSchema>;

/** A single ranked product entry inside a published Top 10 article. */
export const top10ItemSchema = z.object({
  rank: z.number().int().min(1).max(10),
  productName: z.string().min(1),
  summary: z.string().min(1),
  shopeeUrl: z.string().url().optional(),
  image: z.string().optional(),
  /** Slug of a PawPicks product page (/products/[slug]) when we sell it. */
  productSlug: z.string().optional(),
  scores: top10ScoresSchema.optional(),
  pros: z.array(z.string()).default([]),
  considerations: z.array(z.string()).default([]),
  suitableFor: z.string().optional(),
  /** Free text, e.g. "ประมาณ 1,500–2,000 บาท (ตรวจเมื่อ 2026-10-01)". Verified only. */
  priceNote: z.string().optional(),
  warranty: z.string().optional(),
});
export type Top10Item = z.infer<typeof top10ItemSchema>;

export const top10FaqSchema = z.object({ question: z.string().min(1), answer: z.string().min(1) });

/**
 * A PawPicks Top 10 article. Only `published` articles may carry real ranked
 * items — everything else stays empty so the site never shows fabricated
 * products, prices, or reviews. A `published` article without exactly 10
 * verified, scored items fails to parse, which fails the build.
 *
 * Visibility: published = public + sitemap; coming_soon = card only (page is
 * 404 in production); draft = hidden everywhere in production; archived = gone.
 * Non-production (preview/dev) can open coming_soon/draft pages, noindex.
 */
export const top10ArticleSchema = z
  .object({
    slug: z.string().min(1).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1),
    category: z.string().min(1),
    excerpt: z.string().min(1),
    status: articleStatusSchema.default("coming_soon"),
    coverImage: z.string().optional(),
    /** ISO date (YYYY-MM-DD) of the last content change. */
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    publishedAt: z.string().optional(),
    editor: z.string().optional(),
    quickSummary: z.string().optional(),
    /** Meta description; falls back to `excerpt` when absent. */
    description: z.string().optional(),
    /** How this specific list was compiled (shown in addition to the site-wide method page). */
    methodology: z.string().optional(),
    /** Per-article override of the standard affiliate disclosure text. */
    affiliateDisclosure: z.string().optional(),
    howToChoose: z.array(z.string()).default([]),
    faq: z.array(top10FaqSchema).default([]),
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
      if (article.items.some((i) => !i.scores)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items"],
          message: `Published article "${article.slug}" needs PawPicks Score inputs on every item.`,
        });
      }
      if (!article.verifiedAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["verifiedAt"],
          message: `Published article "${article.slug}" must have verifiedAt set.`,
        });
      }
    } else if (article.items.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: `Unpublished article "${article.slug}" must not carry ranked items.`,
      });
    }
  });
export type Top10Article = z.infer<typeof top10ArticleSchema>;
/** Authoring shape for data files: defaulted fields (items, faq…) are optional. */
export type Top10ArticleInput = z.input<typeof top10ArticleSchema>;
