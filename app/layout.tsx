import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLatestEdition } from "@/lib/data";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://romanvish.github.io/Roman-Poll/"),
  title: { default: "Roman Poll", template: "%s | Roman Poll" },
  description: "An independent, voter-driven college football Top 25 with transparent ballots and weekly analysis.",
  openGraph: {
    title: "Roman Poll",
    description: "College football rankings, transparent ballots, and weekly analysis.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const latest = getLatestEdition();
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader latestBallotsPath={`/ballots/${latest.season}/week/${latest.week}`} latestComparePath={`/compare/${latest.season}/week/${latest.week}`} />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
