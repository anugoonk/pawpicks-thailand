import type { ArticleInput } from "@/lib/guide-types";

/**
 * Buying guides / articles. Intentionally empty: add an entry only when real,
 * reviewed content exists. `/guides` and `/guides/[slug]` stay hidden (404 in
 * production) until at least one entry is `status: "published"`.
 *
 * Authoring example (kept as a comment so nothing fake ships):
 *
 *   {
 *     id: "guide-1",
 *     slug: "how-to-choose-an-automatic-feeder",
 *     title: "…",
 *     excerpt: "…",
 *     category: "auto-feeders",         // slug from data/categories.ts
 *     status: "published",
 *     publishedAt: "2026-10-01",
 *     updatedAt: "2026-10-01",
 *     content: [{ type: "h2", text: "…" }, { type: "p", text: "…" }],
 *     products: ["auto-feeder"],        // product slugs, rendered from product data
 *     faq: [{ question: "…", answer: "…" }],
 *   }
 */
export const GUIDES: ArticleInput[] = [];
