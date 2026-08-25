import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tuấn Thái Bình TFT | Cựu Thách Đấu & Shop Acc TFT Chính Chủ Uy Tín",
  description:
    "Hồ sơ cá nhân game thủ Cựu Thách Đấu Tuấn Thái Bình TFT và Shop Acc TFT Chính Chủ Uy Tín, cho thuê acc Chibi Ahri, Yasuo, Gwen, Sân Đấu Thần Thoại, cày thuê rank bảo mật.",
  keywords: [
    "Tuấn Thái Bình TFT",
    "Shop Acc TFT Chính Chủ Uy Tín",
    "Thuê Acc TFT",
    "Mua Acc Đấu Trường Chân Lý",
    "Acc Chibi Ahri",
    "Acc Chibi Yasuo",
    "Cày Thuê TFT",
    "Coaching TFT",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0c14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} bg-[#0a0c14] antialiased dark scroll-smooth`}>
      <body className="min-h-screen bg-[#0a0c14] text-white selection:bg-amber-500 selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
