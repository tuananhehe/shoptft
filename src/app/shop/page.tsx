import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getInitialShopAccountsServer } from "@/utils/supabase/accounts-service";
import { ShopClientView } from "./shop-client-view";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { ProductCardSkeleton } from "@/components/product-card";

import { getSeoConfig } from "@/utils/seo-service";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig();
  const pageSeo = seoConfig.pages["/shop"] || {
    title: "Kho Acc TFT - ĐTCL Đa Dạng | ShopTFTMobile",
    description:
      "Tìm tài khoản TFT/ĐTCL theo Pet, Chibi, Sân Đấu, loại acc và mức giá tại ShopTFTMobile. Cập nhật trạng thái liên tục, thuê nhanh qua Zalo.",
    canonical: "https://www.shoptftmobile.net/shop",
  };

  const canonicalUrl = pageSeo.canonical || "https://www.shoptftmobile.net/shop";
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
          alt: "Kho Acc TFT ĐTCL - ShopTFTMobile",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    robots: pageSeo.robots || { index: true, follow: true },
  };
}

function ShopLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <TFTNavbar />
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-20 sm:pb-16 flex-1">
        <div className="mb-4 sm:mb-6 space-y-2">
          <div className="h-7 sm:h-8 bg-zinc-800/60 rounded-lg w-36 sm:w-48 animate-pulse" />
          <div className="h-3.5 sm:h-4 bg-zinc-800/40 rounded w-52 sm:w-72 animate-pulse" />
        </div>
        <div className="h-12 sm:h-14 bg-[#141414] border border-white/[0.08] rounded-2xl mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}

export default async function ShopPage() {
  const { vipAccounts, cloneAccounts } = await getInitialShopAccountsServer();

  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <ShopClientView initialVip={vipAccounts} initialClone={cloneAccounts} />
    </Suspense>
  );
}
