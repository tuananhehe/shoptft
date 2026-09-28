import type { Metadata, Viewport } from "next";
import Script from "next/script";
import fs from "fs";
import path from "path";
import { Inter, Manrope, Roboto_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
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

  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    return metaMatch[1].trim();
  }

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
  const rawCanonical = seo.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.shoptftmobile.net";
  const canonicalUrl = rawCanonical.trim().replace(/\/+$/, "");

  return {
    metaTitle:
      seo.metaTitle || "ShopTFTMobile - Kho Acc TFT, Pet, Chibi & Sân Đấu",
    metaDescription:
      seo.metaDescription ||
      "Tìm tài khoản TFT theo Pet, Chibi, Sân Đấu và nhu cầu sử dụng tại ShopTFTMobile. Hỗ trợ trực tiếp và bàn giao qua Zalo.",
    metaKeywords:
      seo.metaKeywords ||
      "thuê acc tft, shop acc tft, tuấn thái bình tft, acc tí nị, linh thú tft, sân đấu tft, shop tft mobile, tài khoản tft",
    canonicalUrl,
    ogTitle:
      seo.ogTitle || seo.metaTitle || "ShopTFTMobile - Kho Acc TFT, Pet, Chibi & Sân Đấu",
    ogDescription:
      seo.ogDescription ||
      seo.metaDescription ||
      "Tìm tài khoản TFT theo Pet, Chibi, Sân Đấu và nhu cầu sử dụng tại ShopTFTMobile. Hỗ trợ trực tiếp và bàn giao qua Zalo.",
    ogImage: seo.ogImage || "/banner-seo.jpg",
    faviconUrl: seo.faviconUrl || "/favicon.ico",
    bgImageUrl: seo.bgImageUrl || "",
    bgColor: seo.bgColor || "#09090b",
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
    title: {
      default: seo.metaTitle,
      template: "%s | ShopTFTMobile",
    },
    description: seo.metaDescription,
    keywords: keywordsList,
    authors: [{ name: seo.author }],
    creator: seo.author,
    publisher: "ShopTFTMobile - Tuấn Thái Bình",
    applicationName: "ShopTFTMobile",
    metadataBase: new URL(seo.canonicalUrl),
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
      siteName: "ShopTFTMobile",
      images: [
        {
          url: absoluteOgImage,
          width: 1200,
          height: 630,
          alt: "ShopTFTMobile - Kho Acc TFT",
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
  themeColor: "#09090b",
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

  const jsonLdGraph: any[] = [
    {
      "@type": "WebSite",
      "@id": `${seo.canonicalUrl}/#website`,
      url: seo.canonicalUrl,
      name: "ShopTFTMobile",
      description: seo.metaDescription,
      inLanguage: "vi-VN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${seo.canonicalUrl}/shop?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${seo.canonicalUrl}/#organization`,
      name: "ShopTFTMobile",
      url: seo.canonicalUrl,
      logo: `${seo.canonicalUrl}/avatar.jpg`,
      founder: {
        "@type": "Person",
        name: "Tuấn Thái Bình",
        jobTitle: "Cựu Thách Đấu ĐTCL",
        url: `${seo.canonicalUrl}/ve-shop`,
      },
      sameAs: [
        "https://zalo.me/0352867283",
        "https://checkscam.vn",
      ],
    },
  ];

  // Schema FAQPage neu co FAQ cau hinh thuc te
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

  return (
    <html lang="vi" className="scroll-smooth overflow-x-hidden w-full max-w-full">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://doihinhtft.vn" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://doihinhtft.vn" />
        <link rel="icon" href={seo.faviconUrl || "/favicon.ico"} sizes="any" />
        <link rel="apple-touch-icon" href={seo.faviconUrl || "/apple-touch-icon.png"} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_location: window.location.href,
                  page_path: window.location.pathname + window.location.search,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${robotoMono.variable} min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black font-sans antialiased`}
      >
        <Providers>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#18181b",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "500",
                borderRadius: "12px",
                padding: "12px 18px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
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
        </Providers>
      </body>
    </html>
  );
}
