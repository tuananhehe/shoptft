"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { Search, KeyRound, User, MessageCircle, Menu, X, ShoppingBag } from "lucide-react";

export const TFTNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const navLinks = [
    { label: "Trang Chủ", href: "#hero" },
    { label: "Kho Cho Thuê", href: "#shop" },
    { label: "Cày Rank & Coach", href: "#services" },
    { label: "Về Tuấn", href: "#about" },
    { label: "Đánh Giá", href: "#reviews" },
    { label: "Hỏi Đáp", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-sm transition-all">
      {/* Top Accent Line */}
      <div className="h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* 1. CỤM LOGO (TRÁI): Avatar bo góc + Tên thương hiệu + Badge PRO */}
          <a href="#hero" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <div
                className="w-full h-full rounded-[10px] bg-cover bg-center"
                style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div className="border-l border-slate-200 pl-3">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  {PROFILE_INFO.realName}
                </span>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide truncate max-w-[160px] sm:max-w-none">
                {PROFILE_INFO.brandName} • Sàn Thuê Acc ĐTCL
              </p>
            </div>
          </a>

          {/* 2. THANH TÌM KIẾM SẢN PHẨM RỘNG BO TRÒN (GIỮA) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6 relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Tìm acc theo Tướng Tí Nị, Sân Đấu, Mã Số (MS: 8899)..."
                className="w-full h-10 pl-10 pr-4 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* 3. CỤM BÊN PHẢI: Nút Đăng nhập viền mảnh & Nút CTA "Bắt đầu thuê" */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Zalo Support */}
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Zalo 24/7</span>
            </a>

            {/* Nút Đăng Nhập (Viền Mảnh) */}
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Đăng nhập</span>
            </a>

            {/* Nút CTA "Bắt đầu thuê" (Đỏ Cam Thương Mại Điện Tử) */}
            <a
              href="#shop"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Bắt đầu thuê</span>
            </a>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Categories Sub-Bar */}
        <div className="hidden md:flex items-center gap-6 py-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-orange-600 transition-colors py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-orange-600 group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-lg animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm acc theo Tí Nị, Rank..."
              className="w-full h-10 pl-9 pr-3 bg-slate-100 text-slate-900 placeholder-slate-400 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-col space-y-2 pt-2">
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

          <div className="pt-2 grid grid-cols-2 gap-3">
            <a
              href="#shop"
              onClick={() => setMobileOpen(false)}
              className="w-full h-10 flex items-center justify-center gap-1.5 bg-orange-600 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kho Cho Thuê</span>
            </a>

            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-700 bg-white font-semibold text-xs rounded-lg shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Zalo Tư Vấn</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
