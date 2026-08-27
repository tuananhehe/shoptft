import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani, Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tuấn Thái Bình TFT | Hệ Thống Thuê Acc ĐTCL - TFT Tự Động",
  description:
    "Shop thuê acc TFT, thuê acc ĐTCL VIP tự động 24/7. Cung cấp tài khoản full Tí Nị Thần Thoại, Sân Đấu Đổi Nhạc. Admin Tuấn Thái Bình (Cựu Thách Đấu) uy tín - Quỹ bảo hiểm 30M.",
  keywords: [
    "thuê acc tft",
    "thuê acc đtcl",
    "shop tft",
    "tuấn thái bình tft",
    "thuê acc tí nị",
    "cày thuê đtcl",
    "shop acc tft uy tín",
    "shop tft mobile",
    "thuê tài khoản đtcl",
    "tí nị ahri",
    "tí nị yasuo",
    "coaching tft",
  ],
  authors: [{ name: "Tuấn Thái Bình" }],
  creator: "Tuấn Thái Bình",
  publisher: "ShopTFT Mobile",
  metadataBase: new URL("https://shoptft.vercel.app/"),
  alternates: {
    canonical: "https://shoptft.vercel.app/",
  },
  openGraph: {
    title: "Tuấn Thái Bình TFT | Nền Tảng Thuê Acc ĐTCL Uy Tín",
    description:
      "Thuê acc VIP ĐTCL tự động 30s, full Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc. Bảo hiểm 30M Checkscam.",
    url: "https://shoptft.vercel.app/",
    siteName: "ShopTFT Mobile",
    images: [
      {
        url: "/banner-seo.jpg",
        width: 1200,
        height: 630,
        alt: "Shop Thuê Acc TFT - ĐTCL Uy Tín Tuấn Thái Bình",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuấn Thái Bình TFT | Nền Tảng Thuê Acc ĐTCL Uy Tín",
    description:
      "Thuê acc VIP ĐTCL tự động 30s, full Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc. Bảo hiểm 30M Checkscam.",
    images: ["/banner-seo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ShopTFT Mobile - Tuấn Thái Bình",
  "image": "https://shoptft.vercel.app/logo.png",
  "description": "Hệ thống cho thuê tài khoản TFT, DTCL uy tín hàng đầu Việt Nam, quản lý bởi Tuấn Thái Bình.",
  "url": "https://shoptft.vercel.app/",
  "telephone": "0352867283",
  "priceRange": "VND",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Thái Bình",
    "addressCountry": "VN",
  },
  "founder": {
    "@type": "Person",
    "name": "Tuấn Thái Bình",
    "jobTitle": "Cựu Thách Đấu ĐTCL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} bg-[#F8FAFC] antialiased scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className={`${inter.variable} ${rajdhani.variable} ${montserrat.variable} min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-orange-500 selection:text-white font-sans antialiased`}>
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              borderRadius: "16px",
              padding: "12px 18px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#ffffff",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
