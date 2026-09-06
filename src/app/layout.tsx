import type { Metadata, Viewport } from "next";
import fs from "fs";
import path from "path";
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

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "homepage-config.json");

function getLiveSEOConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      const data = JSON.parse(fileData);
      if (data && data.seo) {
        return data.seo;
      }
    }
  } catch (e) {
    console.error("Error reading SEO config in layout:", e);
  }
  return {
    metaTitle: "Tuấn Thái Bình TFT | Hệ Thống Thuê Acc ĐTCL - TFT Tự Động 24/7",
    metaDescription:
      "Shop thuê acc TFT, thuê acc ĐTCL VIP tự động 24/7. Cung cấp tài khoản full Tí Nị Thần Thoại, Sân Đấu Đổi Nhạc. Admin Tuấn Thái Bình (Cựu Thách Đấu) uy tín - Quỹ bảo hiểm 30M.",
    metaKeywords:
      "thuê acc tft, thuê acc đtcl, shop tft, tuấn thái bình tft, thuê acc tí nị, cày thuê đtcl, shop acc tft uy tín, shop tft mobile, thuê tài khoản đtcl, tí nị ahri, tí nị yasuo, coaching tft",
    canonicalUrl: "https://shoptft.vercel.app/",
    ogTitle: "Tuấn Thái Bình TFT | Nền Tảng Thuê Acc ĐTCL Uy Tín",
    ogDescription:
      "Thuê acc VIP ĐTCL tự động 30s, full Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc. Bảo hiểm 30M Checkscam.",
    ogImage: "/banner-seo.jpg",
    faviconUrl: "/favicon.ico",
    bgImageUrl: "",
    bgColor: "#F8FAFC",
    googleVerification: "",
    author: "Tuấn Thái Bình",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = getLiveSEOConfig();
  const keywordsList = seo.metaKeywords
    ? seo.metaKeywords
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: keywordsList,
    authors: [{ name: seo.author || "Tuấn Thái Bình" }],
    creator: seo.author || "Tuấn Thái Bình",
    publisher: "ShopTFT Mobile",
    metadataBase: new URL(seo.canonicalUrl || "https://shoptft.vercel.app/"),
    alternates: {
      canonical: seo.canonicalUrl || "https://shoptft.vercel.app/",
    },
    icons: {
      icon: seo.faviconUrl || "/favicon.ico",
      shortcut: seo.faviconUrl || "/favicon.ico",
      apple: seo.faviconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: seo.canonicalUrl || "https://shoptft.vercel.app/",
      siteName: "ShopTFT Mobile",
      images: [
        {
          url: seo.ogImage || "/banner-seo.jpg",
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
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      images: [seo.ogImage || "/banner-seo.jpg"],
    },
    verification: seo.googleVerification
      ? { google: seo.googleVerification }
      : undefined,
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
}

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seo = getLiveSEOConfig();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${seo.canonicalUrl || "https://shoptft.vercel.app/"}#website`,
        url: seo.canonicalUrl || "https://shoptft.vercel.app/",
        name: "ShopTFT Mobile - Tuấn Thái Bình",
        description: seo.metaDescription,
        inLanguage: "vi-VN",
      },
      {
        "@type": "LocalBusiness",
        "@id": `${seo.canonicalUrl || "https://shoptft.vercel.app/"}#localbusiness`,
        name: "ShopTFT Mobile - Tuấn Thái Bình",
        image: `${seo.canonicalUrl || "https://shoptft.vercel.app/"}logo.png`,
        description: seo.metaDescription,
        url: seo.canonicalUrl || "https://shoptft.vercel.app/",
        telephone: "0352.867.283",
        priceRange: "6.000đ - 1.200.000đ",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Thái Bình",
          addressCountry: "VN",
        },
        founder: {
          "@type": "Person",
          name: "Tuấn Thái Bình",
          jobTitle: "Cựu Thách Đấu TFT 1.134 ĐNG",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        sameAs: [
          "https://zalo.me/0352867283",
          "https://checkscam.vn",
          "https://www.tiktok.com/@tuan.tft",
        ],
      },
    ],
  };

  const bodyStyle: React.CSSProperties = {
    backgroundColor: seo.bgColor || "#F8FAFC",
    ...(seo.bgImageUrl
      ? {
          backgroundImage: `url('${seo.bgImageUrl}')`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
  };

  return (
    <html lang="vi" className="scroll-smooth overflow-x-hidden w-full max-w-full">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="icon" href={seo.faviconUrl || "/favicon.ico"} sizes="any" />
        <link rel="apple-touch-icon" href={seo.faviconUrl || "/apple-touch-icon.png"} />
        <link rel="preload" href="/banner-seo.jpg" as="image" type="image/jpeg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body
        style={bodyStyle}
        className={`${inter.variable} ${rajdhani.variable} ${montserrat.variable} min-h-screen w-full max-w-full overflow-x-hidden text-slate-900 selection:bg-orange-500 selection:text-white font-sans antialiased`}
      >
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
