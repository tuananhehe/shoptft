"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { PROFILE_INFO } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";

interface TFTHeroProps {
  heroConfig?: any;
  imagesConfig?: any;
}

export const TFTHero: React.FC<TFTHeroProps> = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const executeSearch = () => {
    const query = searchTerm.trim();
    if (query) {
      analytics.trackHomepageSearch(query);
      analytics.trackSearchProduct({ query });
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    } else {
      analytics.trackHomepageViewShop();
      router.push("/shop");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const shortcuts = [
    { label: "Ahri", href: "/shop?search=Ahri" },
    { label: "Jinx", href: "/shop?search=Jinx" },
    { label: "Gwen", href: "/shop?search=Gwen" },
    { label: "Pet/Chibi", href: "/shop?focus=pet" },
    { label: "Sân Đấu", href: "/shop?focus=arena" },
    { label: "VIP", href: "/shop?type=vip" },
    { label: "Clone", href: "/shop?type=clone" },
  ];

  return (
    <section className="relative bg-[#09090b] text-white border-b border-white/[0.08] overflow-hidden py-8 sm:py-10 lg:py-12">
      {/* Subtle radial glow & clean grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* H1 Heading */}
        <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[50px] leading-[1.08] tracking-[-0.03em] text-white max-w-4xl mx-auto">
          <span className="inline-block whitespace-nowrap">TÌM ĐÚNG ACC TFT - ĐTCL</span>{" "}
          <span className="inline-block whitespace-nowrap">BẠN MUỐN</span>
        </h1>

        {/* Supporting Description */}
        <p className="mt-3 sm:mt-3.5 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
          Khám phá kho acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu và nhu cầu sử dụng.
        </p>

        {/* Large Search Form */}
        <form onSubmit={handleSearch} className="mt-6 max-w-2xl mx-auto" role="search">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  executeSearch();
                }
              }}
              placeholder="Tìm Pet, Chibi, Sân Đấu, mã acc..."
              aria-label="Tìm kiếm tài khoản TFT"
              className="w-full h-12 sm:h-14 pl-12 pr-28 sm:pr-32 rounded-2xl bg-[#141416] focus:bg-[#18181c] border border-white/15 focus:border-white/40 text-white placeholder:text-zinc-500 text-sm focus:outline-none transition-all shadow-sm"
            />
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                executeSearch();
              }}
              aria-label="Tìm kiếm"
              className="absolute right-2 top-2 bottom-2 px-4 sm:px-5 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-black text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
            >
              <span>Tìm kiếm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick Shortcuts (5-7 chips) */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-zinc-500">Gợi ý:</span>
          {shortcuts.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                analytics.trackHomepageChipClick(item.label);
                if (item.href.includes("search=")) {
                  analytics.trackSearchProduct({ query: item.label });
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Primary & Secondary Actions + Truthful Trust Line */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Link
              href="/shop"
              onClick={() => analytics.trackHomepageViewShop()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold transition-colors shadow-sm"
            >
              <span>Xem Kho Acc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/huong-dan"
              onClick={() => analytics.trackHomepageGuideClick()}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
            >
              <span>Hướng Dẫn</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs sm:text-[13px] text-zinc-400 font-normal">
            <span className="inline-flex items-center gap-1.5">
              <span>Bảo hiểm giao dịch 30M</span>
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-white underline font-medium text-[11px] sm:text-xs transition-colors"
                title="Kiểm tra quỹ bảo hiểm Checkscam.vn"
              >
                (Xem xác minh)
              </a>
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span>Hỗ trợ trực tiếp</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span>Bàn giao qua Zalo</span>
          </div>
        </div>
      </div>
    </section>
  );
};
