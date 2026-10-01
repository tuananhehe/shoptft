import React from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { PROFILE_INFO } from "@/utils/profile-info";
import { analytics } from "@/utils/analytics";
import { Reveal } from "@/components/reveal";

export const TFTFinalCTA = () => (
  <section
    style={{ contentVisibility: "auto", containIntrinsicSize: "240px" }}
    className="bg-[#090909] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center border-b border-white/[0.08]"
  >
    <div className="max-w-2xl mx-auto space-y-3">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
          Tìm acc phù hợp với bạn
        </h2>
        <p className="text-zinc-400 text-xs sm:text-base font-normal max-w-lg mx-auto leading-relaxed mt-2">
          Duyệt kho acc TFT/ĐTCL có sẵn hoặc liên hệ trực tiếp cùng Tuấn Thái Bình để được tư vấn nhanh chóng.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          {/* Primary CTA */}
          <Link
            href="/shop"
            onClick={() => analytics.trackHomepageViewShop()}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-[#090909] font-semibold text-xs sm:text-sm tracking-wide shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Xem Kho Acc</span>
            <ArrowRight className="w-4 h-4 hidden sm:inline" />
          </Link>

          {/* Secondary CTA: Hướng Dẫn */}
          <Link
            href="/huong-dan"
            onClick={() => analytics.trackHomepageGuideClick()}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white border border-white/[0.12] hover:border-white/25 font-medium text-xs sm:text-sm tracking-wide transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Hướng Dẫn</span>
          </Link>

          {/* Optional Zalo CTA */}
          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.trackClickZalo({ source: "final_cta" })}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] active:scale-98 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/20 font-medium text-xs sm:text-sm tracking-wide transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Liên hệ Zalo</span>
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);
