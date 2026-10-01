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

import { getSeoConfig } from "@/utils/seo-service";

export async function generateMetadata(): Promise<Metadata> {
  const seoDb = await getSeoConfig();
  const origin = (seoDb.global.canonicalOrigin || "https://www.shoptftmobile.net").replace(/\/+$/, "");
  const defaultTitle = seoDb.global.defaultTitle || "Thuê Acc TFT - ĐTCL | ShopTFTMobile - Tuấn Thái Bình TFT";
  const defaultDesc =
    seoDb.global.defaultDescription ||
    "Kho tài khoản TFT/ĐTCL với Pet, Chibi và Sân Đấu đa dạng. Hỗ trợ trực tiếp Zalo Tuấn Thái Bình.";
  const ogImg = seoDb.global.defaultOgImage || "/banner-seo.jpg";
  const absOgImage = ogImg.startsWith("http") ? ogImg : `${origin}${ogImg.startsWith("/") ? "" : "/"}${ogImg}`;

  const otherMeta: Record<string, string> = {
    bingbot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  };

  const gVer = cleanVerificationCode(seoDb.global.googleVerification);
  const bVer = cleanVerificationCode(seoDb.global.bingVerification);
  if (bVer) {
    otherMeta["msvalidate.01"] = bVer;
  }
  if (gVer) {
    otherMeta["google-site-verification"] = gVer;
  }

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${seoDb.global.siteName || "ShopTFTMobile"}`,
    },
    description: defaultDesc,
    keywords: [
      "thuê acc tft",
      "thuê acc đtcl",
      "tuấn thái bình tft",
      "shoptftmobile",
      "acc tí nị",
      "linh thú tft",
      "sân đấu tft",
    ],
    authors: [{ name: seoDb.schema.founderName || "Tuấn Thái Bình" }],
    creator: seoDb.schema.founderName || "Tuấn Thái Bình",
    publisher: `${seoDb.global.siteName} - ${seoDb.schema.founderName}`,
    applicationName: seoDb.global.siteName,
    metadataBase: new URL(origin),
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: origin,
      siteName: seoDb.global.siteName,
      images: [
        {
          url: absOgImage,
          width: 1200,
          height: 630,
          alt: `${seoDb.global.siteName} - Kho Acc TFT`,
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: [absOgImage],
    },
    verification: {
      google: gVer || undefined,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoDb = await getSeoConfig();
  const origin = (seoDb.global.canonicalOrigin || "https://www.shoptftmobile.net").replace(/\/+$/, "");
  const { faqs } = getLiveSiteData();

  const jsonLdGraph: any[] = [
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: origin,
      name: seoDb.global.siteName || "ShopTFTMobile",
      alternateName: "Tuấn Thái Bình TFT",
      description: seoDb.global.defaultDescription,
      inLanguage: "vi-VN",
    },
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: seoDb.schema.organizationName || "ShopTFTMobile",
      url: origin,
      logo: `${origin}/avatar.jpg`,
      founder: {
        "@type": "Person",
        name: seoDb.schema.founderName || "Tuấn Thái Bình",
        jobTitle: seoDb.schema.founderTitle || "Cựu Thách Đấu ĐTCL",
        url: `${origin}/ve-shop`,
      },
      sameAs: Array.isArray(seoDb.schema.sameAs) && seoDb.schema.sameAs.length > 0
        ? seoDb.schema.sameAs
        : ["https://zalo.me/0352867283", "https://checkscam.vn"],
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": jsonLdGraph,
  };

  return (
    <html lang="vi" className="scroll-smooth overflow-x-hidden w-full max-w-full">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://ddragon.leagueoflegends.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ddragon.leagueoflegends.com" />
        <link rel="preconnect" href="https://raw.communitydragon.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://raw.communitydragon.org" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
