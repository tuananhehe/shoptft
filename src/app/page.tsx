import React from "react";
import type { Metadata } from "next";
import { HomePageView } from "./home-page-view";
import { getNewestVipAccountsServer } from "@/utils/supabase/accounts-service";

import { getSeoConfig } from "@/utils/seo-service";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig();
  const pageSeo = seoConfig.pages["/"] || {
    title: "Thuê Acc TFT - ĐTCL Uy Tín | ShopTFTMobile - Tuấn Thái Bình TFT",
    description:
      "Hệ thống thuê acc TFT / ĐTCL uy tín hàng đầu. Đầy đủ acc VIP, acc Clone, Linh thú Tí Nị, Sân đấu EDM đổi nhạc. Bàn giao trực tiếp qua Zalo Tuấn Thái Bình.",
    canonical: "https://www.shoptftmobile.net",
  };

  const canonicalUrl = pageSeo.canonical || seoConfig.global.canonicalOrigin || "https://www.shoptftmobile.net";
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
          alt: "ShopTFTMobile - Tuấn Thái Bình TFT",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    robots: pageSeo.robots || { index: true, follow: true },
  };
}

export default async function HomePage() {
  const initialNewAccounts = await getNewestVipAccountsServer(4);
  return <HomePageView initialNewAccounts={initialNewAccounts} />;
}
