import { describe, expect, it } from "vitest";
import { siteJsonLd } from "@/lib/site-jsonld";

describe("siteJsonLd", () => {
  const [org, site] = siteJsonLd("https://example.test");

  it("describes the Organization and WebSite for the given base", () => {
    expect(org["@type"]).toBe("Organization");
    expect(org.url).toBe("https://example.test");
    expect(site["@type"]).toBe("WebSite");
    expect(site.inLanguage).toBe("th");
  });

  it("points SearchAction at the on-site ?q= search", () => {
    expect(site.potentialAction?.target).toBe("https://example.test/?q={search_term_string}");
  });

  it("omits sameAs when no social profile is configured", () => {
    expect("sameAs" in org).toBe(false);
  });
});
