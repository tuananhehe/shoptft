import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getInitialShopAccountsServer } from "@/utils/supabase/accounts-service";
import { ShopClientView } from "./shop-client-view";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { ProductCardSkeleton } from "@/components/product-card";

import { getSeoConfig } from "@/utils/seo-service";

interface ShopPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasFilterParams = Object.keys(resolvedSearchParams).length > 0;

  const canonicalUrl = "https://www.shoptftmobile.net/shop";
  const title = "Kho Acc TFT - ĐTCL | ShopTFTMobile";
  const description =
    "Tìm tài khoản TFT/ĐTCL theo Pet, Chibi, Sân Đấu, loại acc và mức giá tại ShopTFTMobile.";
  const ogImg = "https://www.shoptftmobile.net/banner-seo.jpg";

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "ShopTFTMobile",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: "Kho Acc TFT - ĐTCL | ShopTFTMobile",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
    robots: hasFilterParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

function ShopLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <TFTNavbar />
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-20 sm:pb-16 flex-1">
        <div className="mb-4 sm:mb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading text-white">
            Kho Acc TFT - ĐTCL
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tìm kiếm và lựa chọn tài khoản ĐTCL theo Linh Thú Tí Nị, Sân Đấu, loại acc VIP hoặc Clone giá tốt tại ShopTFTMobile.
          </p>
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
