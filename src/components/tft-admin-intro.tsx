import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const TFTAdminIntro = () => (
  <section
    style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
    className="bg-[#090909] py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]"
  >
    <div className="max-w-xl mx-auto text-center flex flex-col items-center">
      <Reveal>
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[1px] bg-white/20 border border-white/20 mb-4 shadow-md overflow-hidden">
            <img
              src="/avatar.jpg"
              alt="Tuấn Thái Bình"
              className="w-full h-full rounded-[15px] object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] mb-2">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            <span>CHỦ SHOP</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-white leading-tight">
            Tuấn Thái Bình
          </h2>
          <p className="text-zinc-300 text-sm font-medium mt-1">
            Người vận hành ShopTFTMobile
          </p>
          <p className="text-zinc-400 text-sm mt-2 max-w-md leading-relaxed font-normal">
            5+ năm đồng hành cùng cộng đồng ĐTCL Việt Nam. Từng đạt mức Rank Thách Đấu, cam kết tư vấn và hỗ trợ tài khoản trực tiếp, minh bạch.
          </p>

          <Link
            href="/ve-shop"
            className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white hover:text-zinc-300 transition-colors"
          >
            <span>Tìm hiểu về shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);
