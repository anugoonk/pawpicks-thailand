import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteShell } from "@/components/site-shell";
import { getListedGuides, guideRoute } from "@/lib/guides";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "คู่มือเลือกซื้อ",
  description: "คู่มือและบทความเลือกซื้อของใช้แมวและ Pet Tech จาก PawPicks Thailand",
  alternates: { canonical: "/guides" },
};

export default async function GuidesIndexPage() {
  const guides = getListedGuides();
  // No guides yet → no page (never an empty "coming soon" index).
  if (guides.length === 0) notFound();

  return (
    <SiteShell>
      <section className="section">
        <Breadcrumbs items={[{ name: "คู่มือ" }]} />
        <div className="section-heading">
          <div>
            <p className="eyebrow">PAWPICKS GUIDES</p>
            <h1>คู่มือเลือกซื้อ</h1>
          </div>
        </div>
        <ul className="guide-list">
          {guides.map((g) => (
            <li key={g.slug}>
              <h2>
                <Link href={guideRoute(g.slug)}>{g.title}</Link>
              </h2>
              <p>{g.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
