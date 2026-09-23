"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import { KeyRound, MessageCircle, Menu, X, ChevronRight, Phone } from "lucide-react";
import { HomepageConfig, getHomepageConfig } from "@/utils/homepage-service";
import defaultConfig from "@/data/homepage-config.json";

interface TFTNavbarProps {
  sectionsConfig?: HomepageConfig["sections"];
}

export const TFTNavbar: React.FC<TFTNavbarProps> = ({ sectionsConfig }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sections, setSections] = useState<HomepageConfig["sections"]>(
    sectionsConfig || (defaultConfig.sections as unknown as HomepageConfig["sections"])
  );

  useEffect(() => {
    if (sectionsConfig) {
      setSections(sectionsConfig);
      return;
    }
    // Fetch live config if not passed via props (e.g. on /khao-sat or /acc/[id])
    async function loadLiveSections() {
      try {
        const live = await getHomepageConfig();
        if (live?.sections) {
          setSections(live.sections);
        }
      } catch (err) {
        console.warn("Dùng sections config mặc định cho navbar:", err);
      }
    }
    loadLiveSections();
  }, [sectionsConfig]);

  // Dynamically build nav links according to enabled sections
  const allPossibleLinks = [
    { label: "Trang Chủ", href: "/#hero", enabled: sections?.hero !== false },
    { label: "Kho VIP", href: "/#shop", enabled: sections?.vipShop !== false },
    { label: "Kho Clone", href: "/#clone-shop", enabled: sections?.cloneShop !== false },
    { label: "Cày Rank", href: "/#services", enabled: sections?.services !== false },
    { label: "Về Tuấn", href: "/#about", enabled: sections?.about !== false },
    { label: "Đánh Giá", href: "/#reviews", enabled: sections?.reviews === true },
    { label: "Khảo Sát", href: "/khao-sat", enabled: true },
    { label: "FAQ", href: "/#faq", enabled: sections?.faq !== false },
  ];

  const navLinks = allPossibleLinks.filter((link) => link.enabled);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 text-slate-800 shadow-sm transition-all">
      {/* Top Accent Gradient Line */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SINGLE ROW HEADER (3 CỤM: TRÁI - GIỮA - PHẢI) */}
        <div className="h-13 sm:h-18 flex items-center justify-between">
          
          {/* 1. BÊN TRÁI: LOGO + TÊN THƯƠNG HIỆU */}
          <Link href="/#hero" className="flex items-center gap-2 sm:gap-3 group flex-shrink min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt="Logo Tuấn Thái Bình - Shop Thuê Acc TFT ĐTCL Uy Tín"
                className="w-full h-full rounded-[8px] sm:rounded-[10px] object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
            </div>

            <div className="border-l border-slate-200/80 pl-2 sm:pl-3 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                  {PROFILE_INFO.realName}
                </span>
                <span className="bg-orange-100 text-orange-700 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded uppercase tracking-wider border border-orange-200 flex-shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide truncate">
                ShopTFT Mobile
              </p>
            </div>
          </Link>

          {/* 2. Ở GIỮA: DÀN ĐỀU CÁC MENU ĐIỀU HƯỚNG VỚI KHOẢNG CÁCH THÔNG THOÁNG */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-orange-600 transition-colors py-1.5 px-0.5 relative group whitespace-nowrap tracking-tight"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-orange-600 group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </nav>

          {/* 3. BÊN PHẢI: NÚT THUÊ ACC (DESKTOP) & NÚT MOBILE MENU */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Desktop Action Button */}
            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                className="hidden lg:inline-flex items-center px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                <span>Thuê Acc Ngay</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE FULL-WIDTH DRAWER DROPDOWN */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 shadow-xl space-y-3 animate-fadeIn">
          {/* 2 Nút Danh Mục Nhanh Mobile */}
          <div className="grid grid-cols-2 gap-2">
            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                onClick={() => setMobileOpen(false)}
                className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/80 flex flex-col justify-between text-left group active:scale-98 transition-all"
              >
                <span className="font-bold text-xs text-slate-900 block">Kho VIP (Theo Giờ)</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Tướng Tí Nị & Sân EDM</span>
              </Link>
            )}

            {sections?.cloneShop !== false && (
              <Link
                href="/#clone-shop"
                onClick={() => setMobileOpen(false)}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-left group active:scale-98 transition-all"
              >
                <span className="font-bold text-xs text-slate-900 block">Kho Clone (Sở Hữu)</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Bàn giao Full thông tin</span>
              </Link>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-xs font-bold text-slate-700 hover:text-orange-600 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Zalo 24/7</span>
            </a>

            <a
              href={`tel:${PROFILE_INFO.phoneZalo.replace(/[^0-9]/g, "")}`}
              className="h-10 px-3 flex items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Hotline</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

