"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { motion } from "framer-motion";
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
  Flame,
} from "lucide-react";

export const TFTHero: React.FC = () => {
  return (
    <section id="hero" className="relative bg-gradient-to-b from-orange-50/50 via-white to-slate-50 text-slate-900 border-b border-slate-200/80 overflow-hidden">
      {/* 1. CYBER GAMING BACKGROUND TEXTURE (SUBTLE GRID & DOT MATRIX) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-35 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_15%,#000_60%,transparent_100%)]" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:36px_36px]" />
      
      {/* Background Soft Lighting Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] bg-orange-500/10 blur-[130px] rounded-full absolute -top-24 -left-20" />
        <div className="w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full absolute top-10 right-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-12 lg:pt-14 lg:pb-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Sub-text & Commitments (7 cols) - TÁCH NHẬP TỪ BÊN TRÁI SANG */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-5 text-center lg:text-left"
          >
            {/* Tag tiêu đề nhỏ đỏ cam Esports HUD */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-orange-100/80 border border-orange-300/80 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="text-[11px] font-black text-orange-700 uppercase tracking-wider font-gaming">
                  SHOP TFT MOBILE • HỆ THỐNG GIAO DỊCH TỰ ĐỘNG
                </span>
              </div>

              {/* 🛡️ CHECKSCAM 30M BADGE */}
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-700 text-[11px] font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer font-gaming"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bảo Hiểm 30M Checkscam</span>
                <ExternalLink className="w-3 h-3 ml-0.5 text-emerald-600" />
              </a>
            </div>

            {/* Thẻ H1 DUY NHẤT chuẩn SEO On-page & Typography Esports Rajdhani / Montserrat */}
            <h1 className="font-gaming text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-black uppercase text-slate-900 leading-[1.08] sm:leading-[1.1] tracking-tight">
              Nền tảng thuê tài khoản ĐTCL &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                Dịch vụ game chuyên nghiệp
              </span>{" "}
              bởi Tuấn Thái Bình
            </h1>

            {/* Mô tả ngắn gọn chứa từ khóa SEO */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Shop thuê acc TFT, thuê acc ĐTCL VIP tự động bàn giao 30s. Đầy đủ Tướng Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc với Quỹ bảo hiểm 30M Checkscam an toàn tuyệt đối.
            </p>

            {/* Nút bấm CTA Gaming Esports (Bo góc góc cạnh rounded-xl, viền border, Gradient nổi bật) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <a
                href="#shop"
                className="w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 active:from-orange-800 active:to-amber-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/30 border border-orange-400/50 transition-all hover:scale-105 cursor-pointer font-gaming"
              >
                <KeyRound className="w-4 h-4" />
                <span>Khám phá kho acc</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>

              <a
                href="#about"
                className="w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-sm uppercase tracking-wider transition-all hover:border-slate-400 shadow-sm cursor-pointer font-gaming"
              >
                <span>Về Bản Thân</span>
              </a>
            </div>

            {/* Hàng 3 tính năng: Trượt ngang mượt mà trên Mobile (snap-x hide-scrollbar), Grid 3 cột trên Desktop */}
            <div className="flex flex-row overflow-x-auto snap-x hide-scrollbar space-x-3 w-full pb-2 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:space-x-0">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-sm whitespace-nowrap flex-shrink-0 snap-center text-xs font-bold text-slate-700 justify-center lg:justify-start font-gaming">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Tài khoản an toàn 100%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-sm whitespace-nowrap flex-shrink-0 snap-center text-xs font-bold text-slate-700 justify-center lg:justify-start font-gaming">
                <Zap className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>Bàn giao tự động 30s</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-sm whitespace-nowrap flex-shrink-0 snap-center text-xs font-bold text-slate-700 justify-center lg:justify-start font-gaming">
                <PhoneCall className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>Hỗ trợ trực tiếp 24/7</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: KHUNG ĐỒ HỌA MOCKUP THẺ ACC VIP ESPORTS CHUẨN TFT HEXTECH & AURA GLOW */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center py-4 sm:py-6"
          >
            {/* Gaming Hextech / Mythic Aura Glow (Cyan & Amber/Orange) phía sau thẻ Card */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-orange-500/30 via-amber-400/25 to-cyan-400/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 transform scale-95" />

            {/* Main Esports Card Container (Tích hợp HUD Tags trực tiếp bên trong) */}
            <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.18)] transition-all duration-500 group">
              
              {/* 4. TÍCH HỢP HUD GAMING TAGS TRỰC TIẾP TRONG HEADER THẺ (Không bay lơ lửng bên ngoài) */}
              <div className="grid grid-cols-3 gap-2 mb-3.5 text-center">
                {/* HUD Tag 1: Bảo Hiểm */}
                <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl py-1.5 px-2">
                  <span className="text-[9px] font-black text-emerald-800 uppercase block font-gaming leading-none">Bảo Hiểm</span>
                  <strong className="text-[11px] font-black text-emerald-600 font-mono block mt-0.5">30.000.000đ</strong>
                </div>

                {/* HUD Tag 2: Rank Cựu Thách Đấu */}
                <div className="bg-amber-50 border border-amber-200/90 rounded-xl py-1.5 px-2">
                  <span className="text-[9px] font-black text-amber-800 uppercase block font-gaming leading-none">Rank ĐTCL</span>
                  <strong className="text-[11px] font-black text-amber-600 block mt-0.5 font-gaming">1.134 ĐNG</strong>
                </div>

                {/* HUD Tag 3: Tốc Độ Bàn Giao */}
                <div className="bg-orange-50 border border-orange-200/90 rounded-xl py-1.5 px-2">
                  <span className="text-[9px] font-black text-orange-800 uppercase block font-gaming leading-none">Bàn Giao</span>
                  <strong className="text-[11px] font-black text-orange-600 block mt-0.5 font-gaming">30s Qua Zalo</strong>
                </div>
              </div>

              {/* Top Photo: Sáng Rõ Showcase Tướng Tí Nị & Sân Đấu ĐTCL với Viền Hextech Glow */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900 border border-slate-200/80 shadow-inner group/photo">
                {/* Glow viền trong ảnh */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 opacity-20 blur-sm pointer-events-none" />
                
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
                  alt="Thuê acc TFT VIP có Tí Nị Ahri Chiêu Hồn và Yasuo Chân Long - Tuấn Thái Bình"
                  className="w-full h-full object-cover transform group-hover/photo:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Top Badge Inside Image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-orange-600 text-white font-mono font-black text-[11px] uppercase tracking-wider shadow-md">
                    MS: 8899
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wide shadow-md flex items-center gap-1 font-gaming">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>SẴN SÀNG</span>
                  </span>
                </div>

                {/* Bottom Overlay Inside Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] text-amber-300 font-black flex items-center gap-1 font-gaming">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long</span>
                  </div>
                  <div className="text-sm font-black line-clamp-1 text-slate-50 font-gaming uppercase tracking-wide">
                    Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)
                  </div>
                </div>
              </div>

              {/* Card Footer Summary */}
              <div className="pt-3.5 px-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={PROFILE_INFO.avatarUrl}
                      alt="Tuấn Thái Bình - Admin hệ thống ShopTFT Mobile"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{PROFILE_INFO.realName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Chính Chủ ShopTFT</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-black font-gaming">Giá Thuê</span>
                    <span className="text-lg font-black text-red-600 font-mono">15.000đ<span className="text-xs text-slate-500 font-normal">/h</span></span>
                  </div>
                </div>

                <a
                  href="#shop"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 active:from-orange-800 active:to-amber-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/25 border border-orange-400/40 transition-all hover:scale-[1.02] cursor-pointer font-gaming"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Thuê Acc Nhanh 30s ➔</span>
                </a>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
