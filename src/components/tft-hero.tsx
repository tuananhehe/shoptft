"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  Trophy,
  KeyRound,
  ShieldCheck,
  Star,
  Swords,
  PhoneCall,
  ExternalLink,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const TFTHero: React.FC = () => {
  return (
    <section id="hero" className="relative bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] text-slate-900 border-b border-slate-200 overflow-hidden">
      {/* Background Soft Lighting Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] bg-orange-500/8 blur-[120px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[500px] h-[500px] bg-amber-500/8 blur-[120px] rounded-full absolute top-20 right-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-18 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline, Bio & Commitments (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* 1. Tag tiêu đề nhỏ đỏ cam */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
                  SHOP TFT MOBILE • HỆ THỐNG GIAO DỊCH TỰ ĐỘNG
                </span>
              </div>

              {/* 🛡️ CHECKSCAM 30M BADGE */}
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bảo Hiểm 30M Checkscam</span>
                <ExternalLink className="w-3 h-3 ml-0.5 text-emerald-600" />
              </a>
            </div>

            {/* 2. Tiêu đề lớn & Phân cấp rõ ràng */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.18] tracking-tight">
                Nền tảng thuê tài khoản ĐTCL & Dịch vụ game chuyên nghiệp
              </h1>
            </div>

            {/* 3. Mô tả ngắn gọn */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Thuê acc VIP tự động bàn giao 30s, quỹ bảo hiểm 30M Checkscam an toàn tuyệt đối. Đầy đủ Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc, giá chỉ từ 6k/giờ.
            </p>

            {/* 4. Nút bấm: "Khám phá kho acc" (Màu đỏ/cam bo tròn) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-1">
              <a
                href="#shop"
                className="w-full sm:w-auto px-7 py-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg shadow-orange-600/25 transition-all hover:scale-105"
              >
                <KeyRound className="w-4 h-4" />
                <span>Khám phá kho acc</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>

              <a
                href="#about"
                className="w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm uppercase tracking-wider transition-all hover:border-slate-400 shadow-sm"
              >
                <span>Về Bản Thân</span>
              </a>
            </div>

            {/* 5. Hàng 3 cam kết dưới nút */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-700">
              <div className="flex items-center gap-2.5 justify-center lg:justify-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Bảo hiểm 30M Checkscam</span>
              </div>
              <div className="flex items-center gap-2.5 justify-center lg:justify-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <Zap className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="font-semibold">Bàn giao tự động 30s</span>
              </div>
              <div className="flex items-center gap-2.5 justify-center lg:justify-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <PhoneCall className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span className="font-semibold">Hỗ trợ trực tiếp 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Profile Card (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-7 hover:border-orange-300 transition-all group">
              {/* Header: Large Avatar & Rank Badge */}
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-md flex-shrink-0">
                  <div
                    className="w-full h-full rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">{PROFILE_INFO.realName}</h3>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cựu Thách Đấu // 1.134 ĐNG</span>
                  </div>

                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>ONLINE BÀN GIAO ACC 24/7</span>
                  </div>
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-0.5 font-medium">
                    <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                    <span>Lượt Đã Thuê</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {PROFILE_INFO.accountsRented}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-0.5 font-medium">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Hài Lòng</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {PROFILE_INFO.satisfactionRate}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-0.5 font-medium">
                    <Swords className="w-3.5 h-3.5 text-orange-600" />
                    <span>Kinh Nghiệm</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {PROFILE_INFO.experienceYears}+ Năm
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs mb-0.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bảo Hiểm</span>
                  </div>
                  <div className="text-lg font-black text-emerald-700 font-mono">
                    {PROFILE_INFO.insuranceFund}
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Seal */}
              <div className="p-3 bg-emerald-50/80 border-l-4 border-emerald-500 rounded-r-lg text-xs text-emerald-900 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] leading-relaxed font-medium">
                  Giao dịch an toàn với quỹ bảo hiểm 30M ký quỹ trên hệ thống Checkscam.vn uy tín.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
