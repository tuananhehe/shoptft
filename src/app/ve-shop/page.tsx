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
    title: "Về ShopTFTMobile & Tuấn Thái Bình TFT | Uy Tín & Trách Nhiệm",
    description:
      "ShopTFTMobile vận hành bởi Tuấn Thái Bình - cựu Thách Đấu ĐTCL. Cam kết thông tin minh bạch, bảo hiểm Checkscam 30 triệu, chăm sóc khách hàng chu đáo.",
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

export default function VeShopPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "https://www.shoptftmobile.net",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Về Shop",
        "item": "https://www.shoptftmobile.net/ve-shop",
      },
    ],
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black flex flex-col justify-between relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TFTNavbar />
      <TFTAbout />
      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
