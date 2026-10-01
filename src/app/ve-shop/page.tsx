import React from "react";
import type { Metadata } from "next";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTAbout } from "@/components/tft-about";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";

import { getSeoConfig } from "@/utils/seo-service";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig();
  const pageSeo = seoConfig.pages["/ve-shop"] || {
    title: "Tuấn Thái Bình TFT | Về ShopTFTMobile",
    description:
      "Giới thiệu ShopTFTMobile và Tuấn Thái Bình TFT, cách shop hỗ trợ khách tìm acc TFT/ĐTCL, quy trình bàn giao và kênh liên hệ chính thức.",
    canonical: "https://www.shoptftmobile.net/ve-shop",
  };

  const canonicalUrl = pageSeo.canonical || "https://www.shoptftmobile.net/ve-shop";
  const ogImg = pageSeo.ogImage || seoConfig.global.defaultOgImage || "/banner-seo.jpg";

  return {
    title: {
      absolute: pageSeo.title,
    },
    description: pageSeo.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageSeo.ogTitle || pageSeo.title,
      description: pageSeo.ogDescription || pageSeo.description,
      url: canonicalUrl,
      siteName: seoConfig.global.siteName || "ShopTFTMobile",
      images: [
        {
          url: ogImg.startsWith("http") ? ogImg : `${seoConfig.global.canonicalOrigin}${ogImg}`,
          width: 1200,
          height: 630,
          alt: "Tuấn Thái Bình TFT ShopTFTMobile",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageSeo.ogTitle || pageSeo.title,
      description: pageSeo.ogDescription || pageSeo.description,
      images: [ogImg.startsWith("http") ? ogImg : `${seoConfig.global.canonicalOrigin}${ogImg}`],
    },
    robots: pageSeo.robots || { index: true, follow: true },
  };
}

export default async function VeShopPage() {
  const seoDb = await getSeoConfig();
  const origin = (seoDb.global.canonicalOrigin || "https://www.shoptftmobile.net").replace(/\/+$/, "");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": origin,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Về Shop",
        "item": `${origin}/ve-shop`,
      },
    ],
  };

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${origin}/ve-shop#webpage`,
    "url": `${origin}/ve-shop`,
    "name": "Tuấn Thái Bình TFT | Về ShopTFTMobile",
    "description":
      "Giới thiệu ShopTFTMobile và Tuấn Thái Bình TFT, cách shop hỗ trợ khách tìm acc TFT/ĐTCL, quy trình bàn giao và kênh liên hệ chính thức.",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      "name": seoDb.global.siteName || "ShopTFTMobile",
      "url": origin,
    },
    "about": {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      "name": seoDb.schema.organizationName || "ShopTFTMobile",
      "alternateName": "Tuấn Thái Bình TFT",
      "url": origin,
      "logo": `${origin}/avatar.jpg`,
      "founder": {
        "@type": "Person",
        "name": seoDb.schema.founderName || "Tuấn Thái Bình",
        "jobTitle": seoDb.schema.founderTitle || "Cựu Thách Đấu ĐTCL",
        "url": `${origin}/ve-shop`,
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+84352867283",
        "contactType": "customer service",
        "availableLanguage": ["Vietnamese"],
        "url": "https://zalo.me/0352867283",
      },
      "sameAs": [
        "https://zalo.me/0352867283",
        "https://tiktok.com/@shoptftmobile",
        "https://checkscam.vn/?qh_ss=0352867283",
      ],
    },
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black flex flex-col justify-between relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <TFTNavbar />
      <TFTAbout />
      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
