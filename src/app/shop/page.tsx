import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getInitialShopAccountsServer } from "@/utils/supabase/accounts-service";
import { ShopClientView } from "./shop-client-view";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { ProductCardSkeleton } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Kho Acc TFT - Tìm Thuê Acc Tí Nị, Sân Đấu & Cày Rank",
  description:
    "Khám phá kho tài khoản ĐTCL / TFT Mobile đa dạng: Tí Nị Thần Thoại, Sân Đấu Đổi Nhạc EDM, Rank Thách Đấu. Thuê acc nhanh gọn trực tiếp qua Zalo.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/shop",
  },
  openGraph: {
    title: "Kho Acc TFT - ShopTFTMobile",
    description:
      "Khám phá kho tài khoản ĐTCL / TFT Mobile đa dạng: Tí Nị Thần Thoại, Sân Đấu Đổi Nhạc EDM, Rank Thách Đấu. Thuê acc nhanh gọn trực tiếp qua Zalo.",
    url: "https://www.shoptftmobile.net/shop",
    siteName: "ShopTFTMobile",
    type: "website",
  },
};

function ShopLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <TFTNavbar />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 flex-1">
        <div className="mb-6 space-y-2">
          <div className="h-8 bg-zinc-800/60 rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-zinc-800/40 rounded w-72 animate-pulse" />
        </div>
        <div className="h-14 bg-[#141414] border border-white/[0.08] rounded-2xl mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
