import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { getBlogPosts, BlogPost } from "@/utils/blog-service";
import {
  Sparkles,
  Gamepad2,
  Trophy,
  ArrowRight,
  ChevronRight,
  Flame,
  Layers,
  Clock,
  ShieldCheck,
  Zap,
  BookOpen,
  Sword,
  Wand2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TFT Mùa 18 – Tổng hợp hướng dẫn, meta và cập nhật | ShopTFTMobile",
  description:
    "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): tổng hợp hướng dẫn, meta patch mới nhất, giáo án đội hình, cẩm nang Pet Chibi Sân Đấu và kinh nghiệm leo rank.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/blog/tft-mua-18",
  },
  openGraph: {
    title: "TFT Mùa 18 – Tổng hợp hướng dẫn, meta và cập nhật | ShopTFTMobile",
    description:
      "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): tổng hợp hướng dẫn, meta patch mới nhất, giáo án đội hình, cẩm nang Pet Chibi Sân Đấu và kinh nghiệm leo rank.",
    url: "https://www.shoptftmobile.net/blog/tft-mua-18",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Xayah_8.jpg",
        width: 1200,
        height: 630,
        alt: "TFT Mùa 18 Hub Tổng Hợp",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TFT Mùa 18 – Tổng hợp hướng dẫn, meta và cập nhật | ShopTFTMobile",
    description:
      "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): tổng hợp hướng dẫn, meta patch mới nhất, giáo án đội hình, cẩm nang Pet Chibi Sân Đấu và kinh nghiệm leo rank.",
    images: ["https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Xayah_8.jpg"],
  },
};

export default async function TftSet18HubPage() {
  const allPosts = await getBlogPosts({ status: "published" });
  const set18Posts = allPosts.filter(
    (p) =>
      p.category === "TFT Mùa 18" ||
      p.category === "Meta & Đội Hình" ||
      p.category === "Kinh nghiệm TFT" ||
      p.category === "Pet / Chibi / Sân Đấu" ||
      p.tags.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("tft"))
  );

  // Grouping into specific hub pillars
  const latestPosts = set18Posts.slice(0, 3);
  const metaPosts = set18Posts.filter(
    (p) =>
      p.category === "Meta & Đội Hình" ||
      p.slug.includes("doi-hinh") ||
      p.slug.includes("reroll")
  );
  const patchPosts = set18Posts.filter(
    (p) =>
      Boolean(p.patch) ||
      p.slug.includes("patch") ||
      p.slug.includes("tuong-4-vang") ||
      p.slug.includes("tuong-5-vang")
  );
  const cosmeticPosts = set18Posts.filter(
    (p) =>
      p.category === "Pet / Chibi / Sân Đấu" ||
      p.slug.includes("pet") ||
      p.slug.includes("chibi") ||
      p.slug.includes("san-dau")
  );
  const beginnerPosts = set18Posts.filter(
    (p) =>
      p.slug.includes("nguoi-moi") ||
      p.slug.includes("dau-game") ||
      p.slug.includes("co-che")
  );

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
            "name": "Blog",
            "item": "https://www.shoptftmobile.net/blog",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "TFT Mùa 18 Hub",
            "item": "https://www.shoptftmobile.net/blog/tft-mua-18",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "name": "TFT Mùa 18 – Tổng hợp hướng dẫn, meta và cập nhật",
        "description": "Cổng thông tin tổng hợp cơ chế, đội hình meta, tộc hệ và tướng ĐTCL Mùa 18.",
        "url": "https://www.shoptftmobile.net/blog/tft-mua-18",
      },
    ],
  };

  const renderPostCard = (post: BlogPost) => (
    <article
      key={post.id}
      className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-900 transition-all flex flex-col justify-between overflow-hidden group hover:border-white/20"
    >
      <div>
        <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-zinc-950">
          <img
            src={post.coverImage || "/banner-seo.jpg"}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-zinc-200 border border-white/10">
              {post.category}
            </span>
            {post.patch && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/80 text-black text-[10px] font-mono font-bold">
                P{post.patch}
              </span>
            )}
          </div>
        </Link>

        <div className="p-4 sm:p-5 space-y-2">
          <Link href={`/blog/${post.slug}`}>
            <h3 className="font-heading font-bold text-sm sm:text-base text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-600" />
          <span>{post.readingTime}</span>
        </span>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
        >
          <span>Đọc tiếp</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </article>
  );

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
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium">TFT Mùa 18 Hub</span>
        </nav>

        {/* 1. Hero Hub Banner + Intro ngắn */}
        <section className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-black p-6 sm:p-10 overflow-hidden mb-12">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuyên Mục Trọng Tâm // Set 18 Enchanted Wilds</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight leading-tight">
              TFT Mùa 18 – Tổng hợp hướng dẫn, meta và cập nhật
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Tổng hợp toàn diện kiến thức ĐTCL Mùa 18: cơ chế Tinh Linh (Wisps), danh sách đội hình chuẩn meta qua từng patch, cẩm nang linh thú Tí Nị Thần Thoại và hướng dẫn dành cho tân thủ từ cựu Thách Đấu Tuấn Thái Bình.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Xem Kho Acc Mùa 18</span>
              </Link>

              <Link
                href="/thue-acc-tft-dtcl"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 border border-white/[0.08] text-zinc-200 font-semibold text-xs hover:bg-zinc-700 transition-colors"
              >
                <span>Dịch Vụ Thuê Acc ĐTCL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Bài mới nhất (Latest Articles) */}
        {latestPosts.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                  Bài Viết Mới Nhất
                </h2>
              </div>
              <span className="text-xs text-zinc-500">Cập nhật liên tục</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestPosts.map(renderPostCard)}
            </div>
          </section>
        )}

        {/* 3. Meta & Đội Hình */}
        {metaPosts.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Sword className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                    Meta & Đội Hình
                  </h2>
                  <p className="text-xs text-zinc-400">Giáo án leo rank, đội hình reroll và bài carry mạnh nhất</p>
                </div>
              </div>
              <Link
                href="/shop?search=ahri"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Acc Ahri/Dị Thú →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {metaPosts.map(renderPostCard)}
            </div>
          </section>
        )}

        {/* 4. Patch & Bản Vá Cập Nhật */}
        {patchPosts.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                    Cập Nhật Patch & Phân Tích Tướng
                  </h2>
                  <p className="text-xs text-zinc-400">Thay đổi sức mạnh tướng 4 vàng, 5 vàng qua các bản vá</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500">Patch 18.3b</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {patchPosts.map(renderPostCard)}
            </div>
          </section>
        )}

        {/* 5. Pet / Chibi / Sân Đấu */}
        {cosmeticPosts.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                    Pet, Chibi & Sân Đấu Mùa 18
                  </h2>
                  <p className="text-xs text-zinc-400">Khám phá linh thú Tí Nị thần thoại và hiệu ứng sàn đấu độc quyền</p>
                </div>
              </div>
              <Link
                href="/shop?focus=pet"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Xem Acc Pet/Chibi →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cosmeticPosts.map(renderPostCard)}
            </div>
          </section>
        )}

        {/* 6. Hướng Dẫn Người Mới */}
        {beginnerPosts.length > 0 && (
          <section className="space-y-4 mb-12">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                    Hướng Dẫn Cho Người Mới
                  </h2>
                  <p className="text-xs text-zinc-400">Cách làm quen cơ chế Tinh Linh, giữ máu đầu game và tích lợi tức</p>
                </div>
              </div>
              <Link
                href="/huong-dan/doi-thong-tin-acc-riot"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Bảo Mật Riot →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {beginnerPosts.map(renderPostCard)}
            </div>
          </section>
        )}

        {/* Bottom Internal Linking Hub Section */}
        <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
            Trải Nghiệm Ngay Acc TFT Mùa 18 Tại ShopTFTMobile
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Xem ngay danh sách tài khoản sở hữu Tí Nị Thần Thoại Ahri, Yasuo và Sân Đấu Đổi Nhạc EDM đang sẵn sàng cho thuê với thủ tục bàn giao 1-1 nhanh chóng bởi Tuấn Thái Bình TFT.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors"
            >
              Khám Phá Kho Acc TFT
            </Link>
            <Link
              href="/thue-acc-tft-dtcl"
              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-medium text-xs hover:bg-zinc-700 transition-colors"
            >
              Dịch Vụ Thuê Acc ĐTCL
            </Link>
            <Link
              href="/huong-dan/doi-thong-tin-acc-riot"
              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-medium text-xs hover:bg-zinc-700 transition-colors"
            >
              Hướng Dẫn Đổi Thông Tin Riot
            </Link>
          </div>
        </section>
      </main>

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
