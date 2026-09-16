"use client";

import React from "react";
import Link from "next/link";
import { ClipboardCheck, Gift, Star, ArrowRight, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { PROFILE_INFO } from "@/data/tft-data";

export const TFTSurveyBanner: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-white via-orange-50/40 to-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-orange-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                <span>Khảo Sát Khách Hàng • Tặng Ngay Voucher 20.000đ</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white font-gaming tracking-tight leading-snug">
                BẠN ĐÁNH GIÁ THẾ NÀO VỀ DỊCH VỤ SHOP TFT TUẤN THÁI BÌNH?
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Chỉ mất <strong>1 phút</strong> điền biểu mẫu khảo sát dạng Google Form để giúp Tuấn nâng cấp kho tài khoản, tốc độ bàn giao và dịch vụ CSKH. Hoàn thành để nhận ngay <strong>Mã giảm giá 20k</strong> cho lần thuê acc tiếp theo!
              </p>

              {/* Quick Pillars */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4 Phần khảo sát nhanh</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>Đóng góp tướng & sân đấu</span>
                </span>
                <span className="flex items-center gap-1 text-orange-400 font-semibold">
                  <Gift className="w-4 h-4" />
                  <span>Nhận voucher tự động</span>
                </span>
              </div>
            </div>

            {/* Right Action CTA */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
              <Link
                href="/khao-sat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all font-gaming"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>Làm Khảo Sát Ngay (1 Phút)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[11px] text-slate-400">
                ⭐ Đã có hơn 150+ cờ thủ tham gia đóng góp ý kiến
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
