import { getSiteUrl } from "@/lib/env";

/**
 * Central site configuration. Nothing here is invented: contact details,
 * social links and analytics are read from NEXT_PUBLIC_* environment variables
 * and are `null` until the owner sets them. The UI must hide anything that is
 * `null` — never show a placeholder.
 *
 * NEXT_PUBLIC_* variables are inlined at build time, so each one must be
 * referenced by its literal name below.
 */

const text = (v: string | undefined): string | null => (v && v.trim() ? v.trim() : null);

/** Social/profile links must be real https URLs; anything else is treated as unset. */
function httpsUrl(v: string | undefined): string | null {
  const t = text(v);
  if (!t) return null;
  try {
    return new URL(t).protocol === "https:" ? t : null;
  } catch {
    return null;
  }
}

export const siteConfig = {
  siteName: "PawPicks Thailand",
  brandName: "PawPicks Thailand",
  shortName: "PawPicks",
  description:
    "PawPicks Thailand คัดเลือกของใช้แมวและ Pet Tech พร้อมข้อมูลสินค้าและบริการที่ชัดเจน",
  tagline: "คัดของดี เพื่อชีวิตที่ดีกว่าของเจ้านาย",
  siteUrl: getSiteUrl(),
  locale: "th_TH",
  language: "th",
  country: "TH",
  currency: "THB",
  social: {
    facebook: httpsUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL),
    instagram: httpsUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    youtube: httpsUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL),
    tiktok: httpsUrl(process.env.NEXT_PUBLIC_TIKTOK_URL),
    line: httpsUrl(process.env.NEXT_PUBLIC_LINE_URL),
  },
  contact: {
    email: text(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  },
  affiliate: {
    /** Show the affiliate disclosure near recommendations and CTAs. */
    disclosureEnabled: true,
    /** Merchant used to label a link whose host is not recognised. */
    defaultMerchant: "Shopee",
  },
  seo: {
    defaultTitle: "PawPicks Thailand — ของดีที่แมวเลือก",
    titleTemplate: "%s · PawPicks Thailand",
    defaultDescription:
      "ของใช้แมวและ Pet Tech ในที่เดียว คัดเลือกจากคุณสมบัติ ราคา และความปลอดภัย เพื่อชีวิตที่ดีขึ้นของแมวและคนที่รักแมว",
    /** Default social-share image (a file that exists in /public). */
    defaultImage: "/assets/pawpicks-hero.png",
  },
  analytics: {
    /** Flip on only when a provider is wired up (see lib/analytics.ts). No provider ID is stored here. */
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
  },
} as const;

export type ContactChannel = {
  /** e.g. "Facebook Page", "อีเมล" */
  label: string;
  /** Text shown to the visitor. */
  text: string;
  /** Link target (https:// or mailto:). */
  href: string;
};

/** Real contact channels only — empty until the owner configures some. */
export function getContactChannels(config = siteConfig): ContactChannel[] {
  const { social, contact } = config;
  const channels: ContactChannel[] = [];
  if (contact.email) channels.push({ label: "อีเมล", text: contact.email, href: `mailto:${contact.email}` });
  if (social.facebook) channels.push({ label: "Facebook", text: "PawPicks Thailand บน Facebook", href: social.facebook });
  if (social.line) channels.push({ label: "LINE", text: "PawPicks Thailand บน LINE", href: social.line });
  if (social.instagram) channels.push({ label: "Instagram", text: "PawPicks Thailand บน Instagram", href: social.instagram });
  if (social.tiktok) channels.push({ label: "TikTok", text: "PawPicks Thailand บน TikTok", href: social.tiktok });
  if (social.youtube) channels.push({ label: "YouTube", text: "PawPicks Thailand บน YouTube", href: social.youtube });
  return channels;
}
