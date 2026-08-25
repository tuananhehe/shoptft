"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { Search, KeyRound, MessageCircle, Menu, X } from "lucide-react";

export const TFTNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const navLinks = [
    { label: "Trang Chủ", href: "#hero" },
    { label: "Kho Acc", href: "#shop" },
    { label: "Cày Rank", href: "#services" },
    { label: "Về Tuấn", href: "#about" },
    { label: "Đánh Giá", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 text-slate-800 shadow-sm transition-all">
      {/* Top Accent Gradient Line */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SINGLE ROW HEADER (1 HÀNG DUY NHẤT) */}
        <div className="h-16 sm:h-18 flex items-center justify-between gap-3 lg:gap-6">
          {/* 1. LOGO & BRAND */}
          <a href="#hero" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <div
                className="w-full h-full rounded-[10px] bg-cover bg-center"
                style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div className="hidden sm:block border-l border-slate-200/80 pl-2.5">
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

          {/* 2. MENU LINKS NGẮN GỌN (Ẩn trên màn hình nhỏ) */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-600">
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

          {/* 3. Ô SEARCH BO TRÒN GỌN GÀNG */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Tìm acc, Tí Nị, MS: 8899..."
                className="w-full h-9 pl-8 pr-3 bg-slate-100/90 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-full border border-slate-200/80 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* 4. CỤM NÚT HÀNH ĐỘNG (ZALO / THUÊ NGAY) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Nút Zalo Tư Vấn */}
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-xl transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Zalo Tư Vấn</span>
            </a>

            {/* Nút Thuê Ngay */}
            <a
              href="#shop"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-xs rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Thuê Acc</span>
            </a>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm acc, Tí Nị, Rank..."
              className="w-full h-9 pl-8 pr-3 bg-slate-100 text-slate-900 placeholder-slate-400 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-col space-y-1.5 pt-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-xs font-semibold text-slate-700 hover:text-orange-600 py-1.5 border-b border-slate-100"
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
