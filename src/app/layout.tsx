import type { Metadata, Viewport } from "next";
import fs from "fs";
import path from "path";
import { Inter, Montserrat, Roboto_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { UserAuthProvider } from "@/context/user-auth-context";
import { UserProfileModal } from "@/components/user-profile-modal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "homepage-config.json");

/**
 * Trích xuất mã xác minh sạch nếu người dùng dán toàn bộ thẻ <meta> hoặc chuỗi raw
 */
function cleanVerificationCode(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  // Nếu người dùng dán cả thẻ <meta ... content="XYZ" ... />
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    return metaMatch[1].trim();
  }

  // Nếu người dùng dán dạng key=value (VD: google-site-verification=XYZ hoặc msvalidate.01=XYZ)
  if (trimmed.includes("=")) {
    const parts = trimmed.split("=");
    return parts[parts.length - 1].replace(/["';>]/g, "").trim();
  }

  return trimmed;
}

function getLiveSiteData() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      const data = JSON.parse(fileData);
      return {
        seo: data?.seo || {},
        faqs: Array.isArray(data?.faqs) ? data.faqs : [],
      };
    }
  } catch (e) {
    console.error("Error reading live config in layout:", e);
  }
  return {
    seo: {},
    faqs: [],
  };
}

function getLiveSEOConfig() {
  const { seo } = getLiveSiteData();
  const rawCanonical = seo.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://shoptftmobile.net";
  const canonicalUrl = rawCanonical.trim().replace(/\/+$/, "");

  return {
    metaTitle:
      seo.metaTitle || "Tuấn Thái Bình TFT | Hệ Thống Thuê Acc ĐTCL - TFT Tự Động 24/7",
    metaDescription:
      seo.metaDescription ||
      "Shop thuê acc TFT, thuê acc ĐTCL VIP tự động 24/7 bàn giao 30s. Đầy đủ Tướng Tí Nị Thần Thoại, Sân Đấu Đổi Nhạc EDM & Cày Rank uy tín bởi Tuấn Thái Bình (Bảo hiểm 30M).",
    metaKeywords:
      seo.metaKeywords ||
      "thuê acc tft, thuê acc đtcl, shop tft, tuấn thái bình tft, thuê acc tí nị, cày thuê đtcl, shop acc tft uy tín, shop tft mobile, thuê tài khoản đtcl, tí nị ahri, tí nị yasuo, coaching tft",
    canonicalUrl,
    ogTitle:
      seo.ogTitle || seo.metaTitle || "Tuấn Thái Bình TFT | Nền Tảng Thuê Acc ĐTCL Uy Tín",
    ogDescription:
      seo.ogDescription ||
      seo.metaDescription ||
      "Thuê acc VIP ĐTCL / TFT Mobile tự động bàn giao 30s, trọn bộ Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc EDM. Quỹ bảo hiểm 30M Checkscam uy tín số 1.",
    ogImage: seo.ogImage || "/banner-seo.jpg",
    faviconUrl: seo.faviconUrl || "/favicon.ico",
    bgImageUrl: seo.bgImageUrl || "",
    bgColor: seo.bgColor || "#F8FAFC",
    googleVerification: cleanVerificationCode(seo.googleVerification),
    bingVerification: cleanVerificationCode(seo.bingVerification),
    author: seo.author || "Tuấn Thái Bình",
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

  const absoluteOgImage = seo.ogImage.startsWith("http")
    ? seo.ogImage
    : `${seo.canonicalUrl}${seo.ogImage.startsWith("/") ? "" : "/"}${seo.ogImage}`;

  const otherMeta: Record<string, string> = {
    bingbot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  };

  if (seo.bingVerification) {
    otherMeta["msvalidate.01"] = seo.bingVerification;
  }
  if (seo.googleVerification) {
    otherMeta["google-site-verification"] = seo.googleVerification;
  }

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: keywordsList,
    authors: [{ name: seo.author }],
    creator: seo.author,
    publisher: "ShopTFT Mobile - Tuấn Thái Bình",
    applicationName: "ShopTFT Mobile",
    metadataBase: new URL(seo.canonicalUrl),
    alternates: {
      canonical: seo.canonicalUrl,
    },
    icons: {
      icon: [
        { url: seo.faviconUrl || "/favicon.ico" },
        { url: seo.faviconUrl || "/favicon.ico", sizes: "32x32", type: "image/png" },
      ],
      shortcut: seo.faviconUrl || "/favicon.ico",
      apple: seo.faviconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonicalUrl,
      siteName: "ShopTFT Mobile - Tuấn Thái Bình",
      images: [
        {
          url: absoluteOgImage,
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
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [absoluteOgImage],
    },
    verification: {
      google: seo.googleVerification || undefined,
      other: otherMeta,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: otherMeta,
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
  const { faqs } = getLiveSiteData();

  const absoluteBannerUrl = seo.ogImage.startsWith("http")
    ? seo.ogImage
    : `${seo.canonicalUrl}${seo.ogImage.startsWith("/") ? "" : "/"}${seo.ogImage}`;

  const jsonLdGraph: any[] = [
    {
      "@type": "WebSite",
      "@id": `${seo.canonicalUrl}/#website`,
      url: seo.canonicalUrl,
      name: "ShopTFT Mobile - Tuấn Thái Bình",
      description: seo.metaDescription,
      inLanguage: "vi-VN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${seo.canonicalUrl}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${seo.canonicalUrl}/#localbusiness`,
      name: "ShopTFT Mobile - Tuấn Thái Bình",
      image: absoluteBannerUrl,
      logo: `${seo.canonicalUrl}/avatar.jpg`,
      description: seo.metaDescription,
      url: seo.canonicalUrl,
      telephone: "0352.867.283",
      priceRange: "6.000đ - 1.200.000đ",
      currenciesAccepted: "VND",
      paymentAccepted: "Chuyển khoản Ngân Hàng, VietQR, ZaloPay, MoMo",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Thái Bình",
        addressCountry: "VN",
      },
      founder: {
        "@type": "Person",
        name: "Tuấn Thái Bình",
        jobTitle: "Cựu Thách Đấu TFT 1.134 ĐNG",
        url: seo.canonicalUrl,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.98",
        reviewCount: "1850",
        bestRating: "5",
        worstRating: "1",
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
  ];

  // Schema FAQPage: Tự động trích xuất các câu hỏi thường gặp để Google & Bing hiển thị rich FAQ accordion
  if (Array.isArray(faqs) && faqs.length > 0) {
    jsonLdGraph.push({
      "@type": "FAQPage",
      "@id": `${seo.canonicalUrl}/#faq`,
      mainEntity: faqs.map((f: any) => ({
        "@type": "Question",
        name: f.q || "",
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a || "",
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": jsonLdGraph,
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
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://doihinhtft.vn" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://doihinhtft.vn" />
        <link rel="canonical" href={seo.canonicalUrl} />
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
        className={`${inter.variable} ${montserrat.variable} ${robotoMono.variable} min-h-screen w-full max-w-full overflow-x-hidden text-slate-900 selection:bg-orange-500 selection:text-white font-sans antialiased`}
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
        <UserAuthProvider>
          <UserProfileModal />
          {children}
        </UserAuthProvider>
      </body>
    </html>
  );
}
