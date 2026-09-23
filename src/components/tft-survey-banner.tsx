"use client";

import React from "react";
import Link from "next/link";
import { ClipboardCheck, Gift, ArrowRight } from "lucide-react";
import { PROFILE_INFO } from "@/data/tft-data";

export const TFTSurveyBanner: React.FC = () => {
  return (
    <section className="py-5 sm:py-12 bg-gradient-to-b from-white via-orange-50/40 to-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-4 sm:p-10 border border-slate-800 shadow-xl">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-2 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 flex-shrink-0" />
                <span>Khảo Sát 30s • Nhận Quà Đến 50.000đ</span>
              </div>

              <h2 className="text-base sm:text-3xl font-black text-white tracking-tight leading-snug">
                BẠN ĐÁNH GIÁ THẾ NÀO VỀ DỊCH VỤ SHOP TFT TUẤN THÁI BÌNH?
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                Chỉ mất <strong>30 giây</strong> đóng góp ý kiến để nhận ngay <strong>Voucher thuê acc đến 50.000đ</strong>, miễn phí GDTG hoặc quà tặng website!
              </p>
            </div>

            {/* Right Action CTA */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-2 sm:gap-3">
              <Link
                href="/khao-sat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-base uppercase tracking-wider shadow-lg shadow-orange-600/25 active:scale-95 transition-all"
              >
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Làm Khảo Sát Ngay (30s)</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <span className="text-[11px] text-slate-400">
                Đã có hơn 150+ cờ thủ tham gia đóng góp ý kiến
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
