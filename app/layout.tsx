import type { Metadata, Viewport } from "next";
import { Anuphan, DM_Sans } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PawPicks Thailand — ของดีที่แมวเลือก",
    template: "%s · PawPicks Thailand",
  },
  description:
    "PawPicks Thailand คัดของใช้แมวและ Pet Tech ที่น่าใช้ พร้อมลิงก์ช้อปบน Shopee",
  applicationName: "PawPicks Thailand",
  openGraph: {
    title: "PawPicks Thailand — ของดีที่แมวเลือก",
    description:
      "ของใช้แมวและ Pet Tech ในที่เดียว คัดจากการใช้งานจริง เพื่อชีวิตที่ดีขึ้นของแมวและคนที่รักแมว",
    url: siteUrl,
    siteName: "PawPicks Thailand",
    locale: "th_TH",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
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
      <body>{children}</body>
    </html>
  );
}
