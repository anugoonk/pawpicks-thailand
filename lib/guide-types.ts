import { z } from "zod";
import { isoDate } from "@/lib/types";

/** A block of article body. Plain data — no markdown/HTML parsing, so content can't inject markup. */
export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("h2"), text: z.string().min(1) }),
  z.object({ type: z.literal("h3"), text: z.string().min(1) }),
  z.object({ type: z.literal("p"), text: z.string().min(1) }),
  z.object({ type: z.literal("ul"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("ol"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("callout"), title: z.string().optional(), text: z.string().min(1) }),
  z.object({
    type: z.literal("image"),
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
  }),
]);
export type ContentBlock = z.infer<typeof contentBlockSchema>;

export const articleStatusSchema = z.enum(["draft", "published", "archived"]);

/**
 * A guide / buying-guide article. Only `published` articles are public.
 * Draft articles are viewable outside production (noindex) for review.
 * Nothing here may be invented: products are referenced by slug and rendered
 * from the product data, never copied into the article.
 */
export const articleSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1),
    excerpt: z.string().min(1),
    content: z.array(contentBlockSchema).default([]),
    /** Category slug (see data/categories.ts). */
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    /** Display name; falls back to "PawPicks Editorial" in the template. */
    author: z.string().optional(),
    publishedAt: isoDate.optional(),
    updatedAt: isoDate,
    status: articleStatusSchema.default("draft"),
    featured: z.boolean().default(false),
    /** Product slugs recommended in this article (rendered from product data). */
    products: z.array(z.string()).default([]),
    /** How this article's picks were made (paragraphs). */
    methodology: z.array(z.string()).default([]),
    /** Overrides the standard disclosure text when set. */
    affiliateDisclosure: z.string().optional(),
    faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).default([]),
    /** Slugs of other guides. */
    relatedArticles: z.array(z.string()).default([]),
    sources: z.array(z.object({ title: z.string().min(1), url: z.string().url().optional() })).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: z.string().optional(),
  })
  .superRefine((a, ctx) => {
    if (a.status === "published") {
      if (a.content.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["content"], message: `Published guide "${a.slug}" needs content.` });
      }
      if (!a.publishedAt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["publishedAt"], message: `Published guide "${a.slug}" needs publishedAt.` });
      }
    }
  });
export type Article = z.infer<typeof articleSchema>;
export type ArticleInput = z.input<typeof articleSchema>;
