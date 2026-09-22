"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { HeroConfig, HomepageImagesConfig } from "@/utils/homepage-service";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  Zap,
} from "lucide-react";

interface TFTHeroProps {
  heroConfig?: HeroConfig;
  imagesConfig?: HomepageImagesConfig;
}

export const TFTHero: React.FC<TFTHeroProps> = ({ heroConfig, imagesConfig }) => {
  const cardImage =
    imagesConfig?.heroCardImage ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop";
  const cardCode = imagesConfig?.heroCardCode || "MS: 8899";
  const cardChibi = imagesConfig?.heroCardChibi || "Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long";
  const cardArena =
    imagesConfig?.heroCardArena || "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)";
  const cardPrice = imagesConfig?.heroCardPrice || "15.000đ/h";
  const avatar = imagesConfig?.avatarUrl || PROFILE_INFO.avatarUrl;

  const topBadge = heroConfig?.badge !== undefined ? heroConfig.badge : "HỆ THỐNG THUÊ ACC TFT ĐTCL CHÍNH CHỦ // TUẤN THÁI BÌNH";
  const title1 = heroConfig?.titleLine1 !== undefined ? heroConfig.titleLine1 : "Shop Thuê Acc TFT ĐTCL";
  const highlight = heroConfig?.titleHighlight !== undefined ? heroConfig.titleHighlight : "Việt Nam";
  const title2 = heroConfig?.titleLine2 !== undefined ? (heroConfig.titleLine2 ? ` ${heroConfig.titleLine2.trim()}` : "") : " Uy Tín Hàng Đầu";
  const subtitle =
    heroConfig?.subtitle !== undefined
      ? heroConfig.subtitle
      : "Shop thuê acc TFT, thuê acc ĐTCL VIP tự động 24/7 bàn giao 30s. Sở hữu trọn bộ Tướng Tí Nị Thần Thoại, Sân Đấu Đổi Nhạc EDM và Dịch vụ Cày Rank ĐTCL uy tín số 1 bởi Cựu Thách Đấu Tuấn Thái Bình (1.134 ĐNG - Bảo hiểm 30M Checkscam).";

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-18 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-0 items-center">
          
          {/* Left Column: Headline, Sub-text & Commitments (6 cols) */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-3 sm:space-y-5 text-center lg:text-left"
          >
            {/* Top trust badges: Clean & Professional */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {topBadge ? (
                <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-semibold">
                  {topBadge}
                </span>
              ) : null}

              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bảo Hiểm 30M Checkscam</span>
                <ExternalLink className="w-3 h-3 text-emerald-500" />
              </a>
            </div>

            {/* Thẻ H1 DUY NHẤT chuẩn SEO On-page & Typography Esports */}
            <h1 className="font-gaming text-xl sm:text-4xl md:text-[2.75rem] lg:text-[3.15rem] font-black uppercase text-slate-900 leading-[1.15] sm:leading-[1.1] tracking-tight">
              {title1 ? `${title1} ` : ""}
              {highlight ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                  {highlight}
                </span>
              ) : null}
              {title2 ? `${title2}` : ""}
            </h1>

            {/* Mô tả ngắn gọn chứa từ khóa SEO - Giới hạn 2 dòng trên mobile để không chiếm màn hình */}
            <p className="text-slate-700 text-xs sm:text-base lg:text-[1.02rem] max-w-[65ch] mx-auto lg:mx-0 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
              {subtitle}
            </p>

            {/* Nút bấm CTA: Tối giản, thanh lịch, chuyên nghiệp */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
              <a
                href="#shop"
                className="flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm transition-all hover:scale-[1.01] active:scale-98 cursor-pointer text-center whitespace-nowrap"
              >
                Kho VIP (Theo Giờ)
              </a>

              <a
                href="#clone-shop"
                className="flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm transition-all hover:scale-[1.01] active:scale-98 cursor-pointer text-center whitespace-nowrap"
              >
                Kho Clone (Sở Hữu)
              </a>
            </div>

            {/* Hàng 3 tính năng: Tinh gọn, thẩm mỹ */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-1 w-full">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] sm:text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">An Toàn 100%</span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] sm:text-xs font-semibold text-slate-700">
                <Zap className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                <span className="truncate">Bàn Giao 30s</span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] sm:text-xs font-semibold text-slate-700">
                <PhoneCall className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                <span className="truncate">Hỗ Trợ 24/7</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: KHUNG ĐỒ HỌA MOCKUP THẺ ACC VIP ESPORTS (Chỉ hiển thị trên màn hình Desktop lớn để không tốn màn hình Mobile) */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="hidden lg:flex lg:col-span-5 lg:col-start-8 relative justify-center py-4 sm:py-6"
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
                  src={cardImage}
                  alt={`${cardChibi} - Tuấn Thái Bình`}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover transform group-hover/photo:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Top Badge Inside Image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-orange-600 text-white font-mono font-black text-[11px] uppercase tracking-wider shadow-md">
                    {cardCode}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>SẴN SÀNG</span>
                  </span>
                </div>

                {/* Bottom Overlay Inside Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] text-amber-300 font-bold">
                    <span>{cardChibi}</span>
                  </div>
                  <div className="text-sm font-bold line-clamp-1 text-slate-50 uppercase tracking-wide">
                    {cardArena}
                  </div>
                </div>
              </div>

              {/* Card Footer Summary */}
              <div className="pt-3.5 px-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt="Tuấn Thái Bình - Admin hệ thống ShopTFT Mobile"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{PROFILE_INFO.realName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Chính Chủ ShopTFT</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Giá Thuê</span>
                    <span className="text-lg font-bold text-red-600 font-mono">{cardPrice}</span>
                  </div>
                </div>

                <a
                  href="#shop"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <span>Thuê Acc Ngay</span>
                </a>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
