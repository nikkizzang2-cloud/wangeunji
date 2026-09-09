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

export const metadata: Metadata = {
  title: "Wang Eun Ji",
  description: "상업용 가구 작업물 아카이브",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${helvetica.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
