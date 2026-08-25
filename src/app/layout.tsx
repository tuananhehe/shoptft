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
  title: "Tuấn Thái Bình TFT | Nền Tảng Thuê Tài Khoản ĐTCL & Dịch Vụ Game Chuyên Nghiệp",
  description:
    "Hệ thống thuê acc TFT VIP tự động bàn giao 30s, quỹ bảo hiểm 30M Checkscam an toàn tuyệt đối. Đầy đủ Tướng Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc.",
  keywords: [
    "Shop TFT Mobile",
    "Thuê Acc TFT",
    "Tuấn Thái Bình TFT",
    "Thuê Tài Khoản ĐTCL",
    "Tí Nị Ahri",
    "Tí Nị Yasuo",
    "Cày Thuê TFT",
    "Coaching TFT",
  ],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} bg-[#F8FAFC] antialiased scroll-smooth`}>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-orange-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
