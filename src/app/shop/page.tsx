import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getShopInventory } from "@/utils/shop-inventory-service";
import { ShopClientView } from "./shop-client-view";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { ProductCardSkeleton } from "@/components/product-card";
import { FilterState } from "@/components/catalog-filter-bar";
import { getSeoConfig } from "@/utils/seo-service";

interface ShopPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasFilterParams = Object.keys(resolvedSearchParams).some((k) => {
    const val = resolvedSearchParams[k];
    return val !== undefined && val !== "" && (Array.isArray(val) ? val.length > 0 : true);
  });

  const seoConfig = await getSeoConfig();
  const pageConfig = seoConfig.pages["/shop"];

  const canonicalUrl = pageConfig?.canonical || "https://www.shoptftmobile.net/shop";
  const title = pageConfig?.title || "Kho Acc TFT - ĐTCL | Danh Sách Acc VIP & Clone | ShopTFTMobile";
  const description =
    pageConfig?.description ||
    "Duyệt toàn bộ kho acc TFT/ĐTCL có sẵn. Bộ lọc Linh Thú, Sân Đấu, loại tài khoản VIP & Clone với bảng giá rõ ràng và cập nhật liên tục.";
  const ogImg = pageConfig?.ogImage || "https://www.shoptftmobile.net/banner-seo.jpg";

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
      siteName: seoConfig.global.siteName || "ShopTFTMobile",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: title,
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
          <div role="heading" aria-level={1} className="text-xl sm:text-2xl font-bold tracking-tight font-heading text-white">
            Kho Acc TFT - ĐTCL
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tìm acc theo Pet, Chibi, Sân Đấu, loại tài khoản và mức giá phù hợp.
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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  // Parse SSR initial filter state from URL query parameters
  const rawSearch = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "";
  const rawType = typeof resolvedSearchParams.type === "string" ? resolvedSearchParams.type.toUpperCase() : "ALL";
  const validType: "ALL" | "VIP" | "CLONE" = rawType === "VIP" ? "VIP" : rawType === "CLONE" ? "CLONE" : "ALL";

  const rawPet = typeof resolvedSearchParams.pet === "string" ? resolvedSearchParams.pet : "";
  const rawArena = typeof resolvedSearchParams.arena === "string" ? resolvedSearchParams.arena : "";
  const rawPrice = typeof resolvedSearchParams.price === "string" ? resolvedSearchParams.price : "ALL";

  const rawStatus = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status.toUpperCase() : "ALL";
  const validStatus: "ALL" | "AVAILABLE" | "RENTED" =
    rawStatus === "AVAILABLE" ? "AVAILABLE" : rawStatus === "RENTED" ? "RENTED" : "ALL";

  const rawSort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort.toLowerCase() : "";
  let validSort: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" = "NEWEST";
  if (rawSort === "price_desc") validSort = "PRICE_DESC";
  else if (rawSort === "price_asc") validSort = "PRICE_ASC";
  else if (rawSort === "newest") validSort = "NEWEST";
  else if (validType === "VIP" && !rawSort) validSort = "PRICE_DESC";

  // Query global database on server for first batch (24 items)
  const inventoryResult = await getShopInventory({
    search: rawSearch,
    type: validType,
    pet: rawPet,
    arena: rawArena,
    price: rawPrice,
    status: validStatus,
    sort: validSort,
    page: 1,
    limit: 24,
    isAdmin: false,
  });

  const initialFilters: FilterState = {
    search: rawSearch,
    type: validType,
    pet: rawPet,
    arena: rawArena,
    price: rawPrice,
    status: validStatus,
    sort: validSort,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://www.shoptftmobile.net",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Kho Acc",
        item: "https://www.shoptftmobile.net/shop",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<ShopLoadingSkeleton />}>
        <ShopClientView
          initialItems={inventoryResult.items}
          initialTotal={inventoryResult.total}
          initialHasMore={inventoryResult.hasMore}
          initialFilters={initialFilters}
          initialFilterOptions={inventoryResult.filterOptions}
        />
      </Suspense>
    </>
  );
}
