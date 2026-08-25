"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { KeyRound, MessageCircle, Menu, X } from "lucide-react";

export const TFTNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // 2. MENU ĐIỀU HƯỚNG: Title Case (viết hoa chữ cái đầu)
  const navLinks = [
    { label: "Trang Chủ", href: "#hero" },
    { label: "Thuê Acc", href: "#shop" },
    { label: "Cày Rank & Coach", href: "#services" },
    { label: "Về Bản Thân", href: "#about" },
    { label: "Đánh Giá", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/10 text-[#F9FAFB] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top Gradient Accent Line */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-[#10B981] w-full" />

      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* 1. CỤM LOGO (TRÁI): Avatar bo góc + Tên thương hiệu 1 dòng kèm badge PRO + slogan xám mờ */}
        <a href="#hero" className="flex items-center gap-3 group flex-shrink-0">
          {/* Avatar Bo Góc */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform flex-shrink-0">
            <div
              className="w-full h-full rounded-[10px] bg-cover bg-center"
              style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
            />
            {/* Online Status Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0A0E17] animate-pulse" />
          </div>

          {/* Brand Name on 1 Line with PRO Badge & Slogan */}
          <div className="border-l border-white/10 pl-3">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-black text-base sm:text-lg tracking-tight text-gray-50 group-hover:text-orange-400 transition-colors">
                {PROFILE_INFO.realName}
              </span>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-light tracking-wide truncate max-w-[170px] sm:max-w-none">
              {PROFILE_INFO.brandName} • Thuê Acc ĐTCL Uy Tín
            </p>
          </div>
        </a>

        {/* 2. MENU ĐIỀU HƯỚNG (GIỮA): 1 hàng ngang duy nhất, Title Case, khoảng cách đều nhau */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-gray-300 hover:text-orange-400 transition-colors relative py-1.5 whitespace-nowrap group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400 group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </nav>

        {/* 3. CỤM NÚT HÀNH ĐỘNG (PHẢI): Nút chính Thuê Acc Ngay + Nút phụ Zalo viền mảnh */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Nút chính: Thuê Acc Ngay (1 dòng, cam gradient gọn gàng) */}
          <a
            href="#shop"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.35)] transition-all hover:scale-105 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Thuê Acc Ngay</span>
          </a>

          {/* Nút phụ: Zalo Tư Vấn (viền mảnh, trong suốt dịu mắt) */}
          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 border border-sky-500/40 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Zalo Tư Vấn</span>
          </a>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-[#111827] border border-white/10 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0A0E17] border-b border-white/10 px-6 py-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-gray-200 hover:text-orange-400 py-2.5 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <a
              href="#shop"
              onClick={() => setMobileOpen(false)}
              className="w-full h-11 flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Thuê Acc Ngay</span>
            </a>

            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 flex items-center justify-center gap-1.5 border border-sky-500/50 text-sky-400 bg-sky-500/10 font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
