"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  Trophy,
  KeyRound,
  ShieldCheck,
  Star,
  Swords,
  Award,
  ExternalLink,
  Zap,
  Sparkles,
} from "lucide-react";

export const TFTHero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-[85vh] bg-[#0A0E17] text-[#F9FAFB] flex items-center overflow-hidden border-b border-white/10">
      {/* Visual Anchor: Depth Ambient Glow Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Đốm sáng cam neon mờ bên góc trái */}
        <div className="w-[500px] h-[500px] bg-orange-600/15 blur-[140px] rounded-full absolute -top-20 -left-20" />

        {/* Đốm sáng xanh tím mờ bên góc phải card profile */}
        <div className="w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full absolute top-10 -right-20" />

        {/* Soft Background TFT Gaming Texture */}
        <div
          className="w-full h-full bg-cover bg-center opacity-10 mix-blend-screen"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/80 to-[#0A0E17]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Focused Headline, Sub-text, Pills & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Badges (Cựu Thách Đấu Việt Nam // 1.134 ĐNG & Checkscam 30M) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
                <Trophy className="w-4 h-4 text-[#F59E0B] animate-bounce" />
                <span className="text-xs font-extrabold text-gray-100 uppercase tracking-wider">
                  CỰU THÁCH ĐẤU VIỆT NAM // 1.134 ĐNG
                </span>
              </div>

              {/* 🛡️ CHECKSCAM 30.000.000đ BADGE */}
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-extrabold uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Bảo Hiểm 30.000.000đ Checkscam.vn</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>

            {/* 1. TIÊU ĐỀ CÔ ĐỌNG & 2 DÒNG PHÂN CẤP RÕ RÀNG */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-50 leading-tight">
                THUÊ TÀI KHOẢN TFT VIP
              </h1>
              <div className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(249,115,22,0.35)] leading-tight">
                TỰ ĐỘNG BÀN GIAO 30S
              </div>
            </div>

            {/* 2. ĐOẠN MÔ TẢ NGẮN GỌN (SUB-TEXT) */}
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Hệ thống cho thuê acc Đấu Trường Chân Lý chính chủ bởi <strong className="text-white font-bold">{PROFILE_INFO.realName}</strong> (Cựu Thách Đấu). Trắng thông tin, đầy đủ Tí Nị Thần Thoại, giá chỉ từ 6k/giờ.
            </p>

            {/* 3. 3 TAG LỢI ÍCH TRỰC QUAN (PILLS KÍNH MỜ BO TRÒN) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm hover:border-[#10B981]/40 transition-colors">
                <Zap className="w-4 h-4 text-[#10B981]" />
                <span>Nhận pass tự động 30s</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm hover:border-[#10B981]/40 transition-colors">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Bảo hiểm Checkscam 30M</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm hover:border-amber-400/40 transition-colors">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>100% Không cần đặt cọc</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-2">
              <a
                href="#shop"
                className="w-full sm:w-auto px-7 py-3.5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)]"
              >
                <KeyRound className="w-4 h-4" />
                <span>THUÊ ACC NGAY ➔</span>
              </a>

              <a
                href="#about"
                className="w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/15 hover:border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105"
              >
                <Award className="w-4 h-4 text-[#F59E0B]" />
                <span>VỀ BẢN THÂN</span>
              </a>
            </div>
          </div>

          {/* Right Column: Redesigned Profile Card with Glassmorphism & Cựu Thách Đấu Việt Nam // 1.134 ĐNG */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-2xl rounded-2xl p-6 sm:p-7 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 group">
              
              {/* Header: Large Avatar & Cựu Thách Đấu Việt Nam // 1.134 ĐNG Badge */}
              <div className="flex items-center gap-4 pb-5 border-b border-slate-800/80">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#F59E0B] to-[#10B981] shadow-[0_0_20px_rgba(255,107,0,0.3)] flex-shrink-0">
                  <div
                    className="w-full h-full rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-slate-900 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-gray-50 tracking-tight">{PROFILE_INFO.realName}</h3>
                  </div>

                  {/* Đồng nhất: Cựu Thách Đấu Việt Nam // 1.134 ĐNG */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cựu Thách Đấu Việt Nam // 1.134 ĐNG</span>
                  </div>

                  <div className="text-[11px] text-[#10B981] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    <span>ONLINE BÀN GIAO ACC 24/7</span>
                  </div>
                </div>
              </div>

              {/* 4 Stats: Grid 2x2 thông thoáng (gap-3.5) */}
              <div className="grid grid-cols-2 gap-3.5 my-5">
                {/* Stat 1: Lượt Thuê */}
                <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-xl text-center hover:border-orange-500/40 transition-colors group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-1 font-medium">
                    <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Lượt Đã Thuê</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#F59E0B] font-mono tracking-tight">
                    {PROFILE_INFO.accountsRented}
                  </div>
                </div>

                {/* Stat 2: Satisfaction Rate */}
                <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-xl text-center hover:border-orange-500/40 transition-colors group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-1 font-medium">
                    <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    <span>Hài Lòng</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#F59E0B] font-mono tracking-tight">
                    {PROFILE_INFO.satisfactionRate}
                  </div>
                </div>

                {/* Stat 3: Experience Years */}
                <div className="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-xl text-center hover:border-orange-500/40 transition-colors group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-1 font-medium">
                    <Swords className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Kinh Nghiệm</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#F59E0B] font-mono tracking-tight">
                    {PROFILE_INFO.experienceYears}+ Năm
                  </div>
                </div>

                {/* Stat 4: Insurance Checkscam (Emerald #10B981) */}
                <div className="bg-slate-950/60 border border-[#10B981]/30 p-3.5 rounded-xl text-center hover:border-[#10B981] transition-colors group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Bảo Hiểm</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-[#10B981] font-mono tracking-tight">
                    {PROFILE_INFO.insuranceFund}
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Seal with Checkscam Emerald #10B981 notice */}
              <div className="p-3 bg-gradient-to-r from-[#10B981]/10 via-[#10B981]/5 to-transparent border-l-4 border-[#10B981] rounded-r-lg text-xs text-gray-300 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span className="font-light text-[11px] leading-relaxed">
                  Giao dịch tuyệt đối an toàn với quỹ cọc bảo hiểm 30M trên hệ thống Checkscam.vn uy tín toàn quốc.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
