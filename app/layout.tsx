import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "よめたね",
  description: "音読練習アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF7F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
        <div className="max-w-md mx-auto min-h-screen bg-[#FAF7F2] relative">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
