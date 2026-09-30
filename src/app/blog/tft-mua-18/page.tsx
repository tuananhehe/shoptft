import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { getBlogPosts } from "@/utils/blog-service";
import {
  Sparkles,
  Gamepad2,
  Trophy,
  ArrowRight,
  ChevronRight,
  Flame,
  Layers,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TFT Mùa 18 – Đại Ngàn Kỳ Bí | Cổng Thông Tin & Meta Hub ĐTCL",
  description:
    "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): cơ chế Tinh Linh (Wisps), danh sách đội hình mạnh nhất Patch 18.3b, tộc hệ, tướng và tướng Tí Nị Thần Thoại.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/blog/tft-mua-18",
  },
  openGraph: {
    title: "TFT Mùa 18 – Đại Ngàn Kỳ Bí | Cổng Thông Tin & Meta Hub ĐTCL",
    description:
      "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): cơ chế Tinh Linh (Wisps), danh sách đội hình mạnh nhất Patch 18.3b, tộc hệ, tướng và tướng Tí Nị Thần Thoại.",
    url: "https://www.shoptftmobile.net/blog/tft-mua-18",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://doihinhtft.vn/wp-content/uploads/2026/07/image-15-1536x864.png",
        width: 1200,
        height: 630,
        alt: "TFT Mùa 18 Đại Ngàn Kỳ Bí Hub",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default async function TftSet18HubPage() {
  const allPosts = await getBlogPosts({ status: "published" });
  const set18Posts = allPosts.filter(
    (p) =>
      p.category === "TFT Mùa 18" ||
      p.category === "Meta & Đội Hình" ||
      p.tags.includes("tft mùa 18")
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
            "name": "TFT Mùa 18 – Đại Ngàn Kỳ Bí",
            "item": "https://www.shoptftmobile.net/blog/tft-mua-18",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "name": "TFT Mùa 18 – Đại Ngàn Kỳ Bí (Enchanted Wilds)",
        "description": "Cổng thông tin tổng hợp cơ chế, đội hình meta, tộc hệ và tướng ĐTCL Mùa 18.",
        "url": "https://www.shoptftmobile.net/blog/tft-mua-18",
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
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium">TFT Mùa 18 Hub</span>
        </nav>

        {/* Hero Hub Banner */}
        <section className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-black p-6 sm:p-10 overflow-hidden mb-12">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuyên Mục Trọng Tâm // Set 18 Enchanted Wilds</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight leading-tight">
              TFT Mùa 18 – Đại Ngàn Kỳ Bí
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Cổng tra cứu thông tin tổng thể mùa giải: cơ chế Tinh Linh hộ mệnh, biến chuyển meta qua từng patch, danh sách giáo án leo rank và những bộ sưu tập tướng Tí Nị Thần Thoại đặc sắc nhất.
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
                <span>Dịch Vụ Thuê Acc Uy Tín</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Set 18 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm text-white">Cơ Chế Tinh Linh</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              4 nguyên tố ngọc bổ trợ mở ra ô trang bị thứ 4 độc lập cho tướng chủ lực.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm text-white">Meta Patch 18.3b</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sự trỗi dậy của bài Ahri Tinh Linh, Dị Thú Reroll và lối chơi Fast 9 cân bằng.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm text-white">Tí Nị Thần Thoại</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ahri Chiêu Hồn, Yasuo Bão Kiếm và Gwen Búp Bê với hiệu ứng kết liễu cực độc.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm text-white">Kinh Nghiệm Leo Rank</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Các cẩm nang giữ máu đầu game, quản lý 50 vàng và thời điểm xoay bài vòng 4-1.
            </p>
          </div>
        </section>

        {/* Featured Set 18 Articles */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                Tất Cả Bài Viết Về TFT Mùa 18
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Các bài viết được chọn lọc kỹ lưỡng, cập nhật thường xuyên theo từng bản vá.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {set18Posts.length} bài viết
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {set18Posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-900 transition-all flex flex-col justify-between overflow-hidden group hover:border-white/20"
              >
                <div>
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-zinc-950">
                    <img
                      src={post.coverImage}
                      alt={post.title}
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
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
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
            ))}
          </div>
        </section>

        {/* Bottom Internal Linking Section */}
        <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
            Trải Nghiệm Ngay Acc TFT Mùa 18 Tại ShopTFTMobile
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Xem ngay danh sách tài khoản sở hữu Tí Nị Thần Thoại Ahri, Yasuo và Sân Đấu Đổi Nhạc EDM đang sẵn sàng cho thuê với thủ tục bàn giao 1-1 nhanh chóng.
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
