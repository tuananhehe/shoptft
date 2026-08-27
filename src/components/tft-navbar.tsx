"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { KeyRound, MessageCircle, Menu, X } from "lucide-react";

export const TFTNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Trang Chủ", href: "#hero" },
    { label: "Kho Acc", href: "#shop" },
    { label: "Cày Rank", href: "#services" },
    { label: "Về Tuấn", href: "#about" },
    { label: "Đánh Giá", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 text-slate-800 shadow-sm transition-all">
      {/* Top Accent Gradient Line */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SINGLE ROW HEADER (3 CỤM: TRÁI - GIỮA - PHẢI) */}
        <div className="h-16 sm:h-18 flex items-center justify-between">
          
          {/* 1. BÊN TRÁI: LOGO + TÊN THƯƠNG HIỆU */}
          <a href="#hero" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt="Logo Tuấn Thái Bình - Shop Thuê Acc TFT ĐTCL Uy Tín"
                className="w-full h-full rounded-[10px] object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div className="border-l border-slate-200/80 pl-3">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  {PROFILE_INFO.realName}
                </span>
                <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                ShopTFT Mobile
              </p>
            </div>
          </a>

          {/* 2. Ở GIỮA: DÀN ĐỀU CÁC MENU ĐIỀU HƯỚNG VỚI KHOẢNG CÁCH THÔNG THOÁNG (GAP-8) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-orange-600 transition-colors py-1 relative group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-orange-600 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* 3. BÊN PHẢI: NÚT THUÊ ACC & NÚT MOBILE MENU */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Nút Thuê Acc */}
            <a
              href="#shop"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-600/20 hover:shadow-lg transition-all hover:scale-105"
            >
              <KeyRound className="w-4 h-4" />
              <span>Thuê Acc</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-orange-600 py-2 border-b border-slate-100"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <a
              href="#shop"
              onClick={() => setMobileOpen(false)}
              className="w-full h-9 flex items-center justify-center gap-1.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <KeyRound className="w-3 h-3" />
              <span>Kho Acc</span>
            </a>

            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-9 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-700 bg-white font-semibold text-xs rounded-xl shadow-sm"
            >
              <MessageCircle className="w-3 h-3 text-sky-600" />
              <span>Zalo 24/7</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
