import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { getBlogPosts } from "@/utils/blog-service";
import { BlogClientView } from "./blog-client-view";
import { ChevronRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog TFT Mùa 18 & Cẩm Nang ĐTCL | ShopTFTMobile",
  description:
    "Chuyên trang kiến thức ĐTCL / TFT Mùa 18: phân tích meta patch 18.3, giáo án đội hình Ahri, Dị Thú, mẹo reroll và cẩm nang chọn tướng Tí Nị từ cựu Thách Đấu Tuấn Thái Bình.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/blog",
  },
  openGraph: {
    title: "Blog TFT Mùa 18 & Cẩm Nang ĐTCL | ShopTFTMobile",
    description:
      "Chuyên trang kiến thức ĐTCL / TFT Mùa 18: phân tích meta patch 18.3, giáo án đội hình Ahri, Dị Thú, mẹo reroll và cẩm nang chọn tướng Tí Nị từ cựu Thách Đấu Tuấn Thái Bình.",
    url: "https://www.shoptftmobile.net/blog",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://www.shoptftmobile.net/banner-seo.jpg",
        width: 1200,
        height: 630,
        alt: "Blog TFT Mùa 18 ShopTFTMobile",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default async function BlogIndexPage() {
  const publishedPosts = await getBlogPosts({ status: "published" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
            "name": "Blog TFT Mùa 18",
            "item": "https://www.shoptftmobile.net/blog",
          },
        ],
      },
      {
        "@type": "Blog",
        "name": "Blog Cẩm Nang TFT Mùa 18 & ĐTCL",
        "description": "Kho bài viết phân tích meta, hướng dẫn đội hình và cẩm nang leo rank ĐTCL Mùa 18.",
        "url": "https://www.shoptftmobile.net/blog",
        "publisher": {
          "@type": "Organization",
          "name": "ShopTFTMobile",
          "logo": "https://www.shoptftmobile.net/avatar.jpg",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TFTNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium">Blog TFT Mùa 18</span>
        </nav>

        {/* Page Header */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cẩm Nang & Phân Tích Meta Chuyên Sâu</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Blog TFT Mùa 18 – Kiến Thức & Meta ĐTCL Uy Tín
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Tổng hợp các bài viết phân tích meta chuẩn chỉ theo từng patch, cẩm nang xoay bài leo Thách Đấu và hướng dẫn trải nghiệm Tí Nị Thần Thoại từ Tuấn Thái Bình.
          </p>
        </div>

        {/* Interactive Client View */}
        <BlogClientView initialPosts={publishedPosts} />
      </main>

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
