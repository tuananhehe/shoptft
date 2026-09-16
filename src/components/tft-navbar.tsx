"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  KeyRound,
  MessageCircle,
  Menu,
  X,
  ClipboardCheck,
  Crown,
  Gamepad2,
  Swords,
  UserCheck,
  Star,
  HelpCircle,
  Sparkles,
  Phone,
} from "lucide-react";
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
  const pathname = usePathname();

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
    {
      id: "hero",
      label: "Trang Chủ",
      href: "/#hero",
      enabled: sections?.hero !== false,
      icon: null,
    },
    {
      id: "shop",
      label: "Kho VIP",
      href: "/#shop",
      enabled: sections?.vipShop !== false,
      badge: "HOT",
      badgeColor: "bg-orange-600 text-white",
      icon: Crown,
    },
    {
      id: "clone-shop",
      label: "Kho Clone",
      href: "/#clone-shop",
      enabled: sections?.cloneShop !== false,
      badge: "∞",
      badgeColor: "bg-slate-800 text-white",
      icon: Gamepad2,
    },
    {
      id: "services",
      label: "Cày Rank",
      href: "/#services",
      enabled: sections?.services !== false,
      icon: Swords,
    },
    {
      id: "about",
      label: "Về Tuấn",
      href: "/#about",
      enabled: sections?.about !== false,
      icon: UserCheck,
    },
    {
      id: "reviews",
      label: "Đánh Giá",
      href: "/#reviews",
      enabled: sections?.reviews === true, // Only show if explicitly enabled
      icon: Star,
    },
    {
      id: "survey",
      label: "Khảo Sát",
      href: "/khao-sat",
      enabled: true, // Always accessible
      badge: "🎁 Quà",
      badgeColor: "bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse",
      isSpecial: true,
      icon: ClipboardCheck,
    },
    {
      id: "faq",
      label: "FAQ",
      href: "/#faq",
      enabled: sections?.faq !== false,
      icon: HelpCircle,
    },
  ];

  const visibleNavLinks = allPossibleLinks.filter((item) => item.enabled);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 text-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all">
      {/* Top Accent Gradient Line */}
      <div className="h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-18 flex items-center justify-between gap-2">
          
          {/* 1. BÊN TRÁI: LOGO + TÊN THƯƠNG HIỆU */}
          <Link
            href="/#hero"
            className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0 min-w-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-all flex-shrink-0">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt="Logo Tuấn Thái Bình - Shop Thuê Acc TFT ĐTCL Uy Tín"
                className="w-full h-full rounded-[9px] sm:rounded-[10px] object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div className="border-l border-slate-200/80 pl-2.5 sm:pl-3 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors font-gaming truncate">
                  {PROFILE_INFO.realName}
                </span>
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs flex-shrink-0 font-gaming">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate">
                ShopTFT Mobile • 24/7
              </p>
            </div>
          </Link>

          {/* 2. Ở GIỮA: MENU ĐIỀU HƯỚNG DYNAMIC TRÊN DESKTOP */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-bold text-slate-700 font-gaming">
            {visibleNavLinks.map((link) => {
              const isCurrent =
                link.href === pathname ||
                (pathname === "/khao-sat" && link.href === "/khao-sat");

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`inline-flex items-center gap-1 py-1.5 px-2.5 xl:px-3 rounded-xl transition-all uppercase tracking-wider text-xs xl:text-sm whitespace-nowrap relative group ${
                    isCurrent
                      ? "text-orange-600 bg-orange-50/80 shadow-xs font-black"
                      : link.isSpecial
                      ? "text-amber-700 hover:text-amber-800 hover:bg-amber-50/80 font-black"
                      : "text-slate-700 hover:text-orange-600 hover:bg-slate-100/80"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase leading-none shadow-xs ${link.badgeColor}`}
                    >
                      {link.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-orange-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. BÊN PHẢI: NÚT THUÊ ACC & NÚT MOBILE MENU */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Quick Zalo Badge on Desktop */}
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-xs font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Zalo 24/7</span>
            </a>

            {/* Desktop CTA: Thuê Acc VIP */}
            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                className="hidden lg:inline-flex items-center gap-1.5 px-4 xl:px-5 py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-amber-700 active:from-orange-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-600/20 hover:shadow-orange-600/35 transition-all hover:scale-105 active:scale-95 font-gaming cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Thuê Acc VIP</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
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

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
          {/* Quick Access Top Cards for Mobile */}
          <div className="grid grid-cols-2 gap-2 pb-1">
            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                onClick={() => setMobileOpen(false)}
                className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 flex flex-col justify-between text-left group active:scale-98 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-200/60 px-1.5 py-0.5 rounded font-gaming">
                    VIP PRO
                  </span>
                  <Crown className="w-4 h-4 text-orange-600" />
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-slate-900 block font-gaming">Kho Thuê Acc VIP</span>
                  <span className="text-[10px] text-slate-500 font-medium">Tướng Tí Nị + Sân EDM</span>
                </div>
              </Link>
            )}

            {sections?.cloneShop !== false && (
              <Link
                href="/#clone-shop"
                onClick={() => setMobileOpen(false)}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-left group active:scale-98 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded font-gaming">
                    VÔ CỰC ∞
                  </span>
                  <Gamepad2 className="w-4 h-4 text-slate-600" />
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-slate-900 block font-gaming">Kho Acc Clone</span>
                  <span className="text-[10px] text-slate-500 font-medium">Bàn giao Full TT</span>
                </div>
              </Link>
            )}
          </div>

          {/* Special Survey Highlight Card on Mobile */}
          <Link
            href="/khao-sat"
            onClick={() => setMobileOpen(false)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-300 flex items-center justify-between text-left active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5 font-gaming">
                  Khảo Sát Khách Hàng
                  <span className="px-1.5 py-0.2 bg-red-600 text-white text-[8px] font-black rounded-full uppercase">
                    Quà 🎁
                  </span>
                </span>
                <span className="text-[10px] text-amber-800 font-medium block">
                  Đóng góp ý kiến nhận Voucher giảm giá
                </span>
              </div>
            </div>
            <span className="text-xs text-amber-700 font-black">➔</span>
          </Link>

          {/* Dynamic Section Links on Mobile */}
          <div className="flex flex-col space-y-1 pt-1">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold text-slate-700 hover:text-orange-600 py-2.5 px-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between font-gaming uppercase tracking-wide"
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase ${link.badgeColor}`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 text-xs">➔</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Fast Contact */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 font-gaming"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Zalo 24/7</span>
            </a>

            <a
              href={`tel:${PROFILE_INFO.phoneZalo.replace(/[^0-9]/g, "")}`}
              className="h-10 px-3 flex items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs active:scale-95 font-gaming"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gọi Shop</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
