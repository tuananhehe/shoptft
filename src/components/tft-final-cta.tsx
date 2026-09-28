"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { PROFILE_INFO } from "@/utils/profile-info";
import { analytics } from "@/utils/analytics";

export const TFTFinalCTA = () => (
  <section className="bg-[#090909] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center border-b border-white/[0.08]">
    <div className="max-w-2xl mx-auto space-y-3">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
        Tìm Acc TFT Phù Hợp Với Bạn
      </h2>
      <p className="text-zinc-400 text-xs sm:text-base font-normal max-w-lg mx-auto leading-relaxed">
        Duyệt Pet, Chibi và Sân Đấu đang có tại ShopTFTMobile.
      </p>

      <div className="pt-4 flex flex-row items-center justify-center gap-3">
        {/* Primary CTA */}
        <Link
          href="/shop"
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-[#090909] font-semibold text-xs sm:text-sm tracking-wide shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Xem kho acc</span>
          <ArrowRight className="w-4 h-4 hidden sm:inline" />
        </Link>

        {/* Secondary CTA */}
        <a
          href={PROFILE_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.trackClickZalo({ source: "final_cta" })}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] active:scale-98 text-white border border-white/[0.12] hover:border-white/25 font-medium text-xs sm:text-sm tracking-wide transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4 text-zinc-300" />
          <span>Liên hệ Zalo</span>
        </a>
      </div>
    </div>
  </section>
);
