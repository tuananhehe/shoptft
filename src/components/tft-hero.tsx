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
    <section id="hero" className="relative bg-gradient-to-b from-orange-50/40 via-white to-slate-50 text-slate-900 border-b border-slate-200/60 overflow-hidden">
      {/* Background Soft Lighting Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] bg-orange-500/10 blur-[130px] rounded-full absolute -top-24 -left-20" />
        <div className="w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full absolute top-10 right-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-12 lg:pt-14 lg:pb-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Sub-text & Commitments (7 cols) */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Tag tiêu đề nhỏ đỏ cam */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="text-xs font-black text-orange-700 uppercase tracking-wider">
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

            {/* Tiêu đề lớn: Cụm từ "Dịch vụ game chuyên nghiệp" Gradient Đỏ - Cam */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.18] tracking-tight">
              Nền tảng thuê tài khoản ĐTCL &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                Dịch vụ game chuyên nghiệp
              </span>
            </h1>

            {/* Mô tả ngắn gọn */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Thuê acc VIP tự động bàn giao 30s, quỹ bảo hiểm 30M Checkscam an toàn tuyệt đối. Đầy đủ Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc, giá chỉ từ 6k/giờ.
            </p>

            {/* Nút bấm CTA: "Khám phá kho acc" (Màu đỏ/cam bo tròn) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-1">
              <a
                href="#shop"
                className="w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all hover:scale-105"
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

            {/* Hàng 3 cam kết dưới nút */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2.5 justify-center lg:justify-start bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Bảo hiểm 30M Checkscam</span>
              </div>
              <div className="flex items-center gap-2.5 justify-center lg:justify-start bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm">
                <Zap className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="font-semibold">Bàn giao tự động 30s</span>
              </div>
              <div className="flex items-center gap-2.5 justify-center lg:justify-start bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm">
                <PhoneCall className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span className="font-semibold">Hỗ trợ trực tiếp 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: KHUNG ĐỒ HỌA MOCKUP THẺ ACC VIP 3D + 3 FLOATING BADGES (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center py-6 sm:py-8">
            {/* Background Glow Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 via-amber-300/20 to-emerald-400/20 rounded-3xl blur-2xl transform scale-95" />

            {/* Main 3D Card Mockup Container */}
            <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.14)] transition-all duration-500 group">
              
              {/* Top Photo: Sáng Rõ Showcase Tướng Tí Nị & Sân Đấu ĐTCL */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-900 border border-slate-100 shadow-inner">
                <div
                  className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Top Badge Inside Image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-mono font-black text-[11px] uppercase tracking-wider shadow-md">
                    MS: 8899
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wide shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>SẴN SÀNG</span>
                  </span>
                </div>

                {/* Bottom Overlay Inside Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long</span>
                  </div>
                  <div className="text-sm font-extrabold line-clamp-1 text-slate-50">
                    Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)
                  </div>
                </div>
              </div>

              {/* Card Footer Summary */}
              <div className="pt-3.5 px-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full bg-cover bg-center border border-slate-200"
                      style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{PROFILE_INFO.realName}</span>
                      <span className="text-[10px] text-slate-500">Chính Chủ ShopTFT</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Giá Thuê</span>
                    <span className="text-lg font-black text-red-600 font-mono">15.000đ<span className="text-xs text-slate-500 font-normal">/h</span></span>
                  </div>
                </div>

                <a
                  href="#shop"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-all hover:scale-[1.02]"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Thuê Acc Nhanh 30s ➔</span>
                </a>
              </div>

              {/* 1. FLOATING BADGE: Quỹ Bảo Hiểm 30M Checkscam (Đẩy nhích cao -top-5 sm:-top-6, shadow-lg) */}
              <div className="absolute -top-5 -left-3 sm:-top-6 sm:-left-5 bg-white/95 backdrop-blur-md border border-emerald-200/90 rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-emerald-500/10 flex items-center gap-2.5 hover:scale-105 transition-transform">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bảo Hiểm</span>
                  <strong className="text-xs font-black text-emerald-700 font-mono block leading-none">30.000.000đ</strong>
                </div>
              </div>

              {/* 2. FLOATING BADGE: Cựu Thách Đấu 1.134 ĐNG (Đẩy nhích cao -top-5 sm:-top-6, shadow-lg) */}
              <div className="absolute -top-5 -right-3 sm:-top-6 sm:-right-4 bg-white/95 backdrop-blur-md border border-amber-200/90 rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-amber-500/10 flex items-center gap-2 hover:scale-105 transition-transform">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rank ĐTCL</span>
                  <strong className="text-xs font-black text-amber-700 block leading-none">1.134 ĐNG</strong>
                </div>
              </div>

              {/* 3. FLOATING BADGE: Bàn Giao Tự Động 30s (Góc Dưới Trái, shadow-lg) */}
              <div className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-4 bg-white/95 backdrop-blur-md border border-orange-200/90 rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-orange-500/10 flex items-center gap-2 hover:scale-105 transition-transform">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <strong className="text-[11px] font-black text-orange-700 block leading-none">Giao Acc 30s</strong>
                  <span className="text-[9px] text-slate-500 font-medium">Tự động qua Zalo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
