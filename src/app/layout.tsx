import type { Metadata } from "next";
import localFont from "next/font/local";
import TopBar from "@/components/TopBar";
import "./globals.css";

const helvetica = localFont({
  src: [
    { path: "../fonts/Helvetica.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Helvetica-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-helvetica",
  display: "swap",
});

// opengraph-image.png (this directory) supplies the og:image tag via
// Next.js's file convention automatically — the link-preview thumbnail is a
// screenshot of /intro, site-wide (every route inherits this since nothing
// more specific overrides it), per explicit request. An earlier revision
// dropped the description entirely (to remove the "상업용 가구 작업물
// 아카이브" line KakaoTalk's link-preview card was showing under the title);
// a later explicit request asked for a description again, this time the
// artist-statement fragment "'Mm' To 'M'" instead. openGraph.title is still
// spelled out explicitly rather than left to fall back from the top-level
// `title` above, since Next.js only does that fallback when an `openGraph`
// object is present to begin with — same reasoning now applies to
// `openGraph.description` vs. the top-level `description`.
export const metadata: Metadata = {
  title: "WANG EUNJI",
  description: "'Mm' To 'M'",
  openGraph: {
    title: "WANG EUNJI",
    description: "'Mm' To 'M'",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${helvetica.variable} antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
