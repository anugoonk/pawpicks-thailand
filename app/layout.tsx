import type { Metadata, Viewport } from "next";
import { Anuphan, DM_Sans } from "next/font/google";
import "./globals.css";
import { isProductionDeploy } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = siteConfig.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.siteName,
  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    url: siteUrl,
    siteName: siteConfig.siteName,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  // Preview deployments and local dev must never be indexed.
  robots: { index: isProductionDeploy(), follow: isProductionDeploy() },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffd34e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${anuphan.variable} ${dmSans.variable}`}>
      <body>
        <a className="skip-link" href="#top">ข้ามไปยังเนื้อหาหลัก</a>
        {children}
      </body>
    </html>
  );
}
