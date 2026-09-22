"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import { KeyRound, MessageCircle, Menu, X, Crown, User, Sparkles, Gamepad2, ChevronRight } from "lucide-react";
import { HomepageConfig, getHomepageConfig } from "@/utils/homepage-service";
import { useUserAuth } from "@/context/user-auth-context";
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

  const { user, openProfileModal, vipInfo, activeRentals } = useUserAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 text-slate-800 shadow-sm transition-all">
      {/* Top Accent Gradient Line */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SINGLE ROW HEADER (3 CỤM: TRÁI - GIỮA - PHẢI) */}
        <div className="h-16 sm:h-18 flex items-center justify-between">
          
          {/* 1. BÊN TRÁI: LOGO + TÊN THƯƠNG HIỆU */}
          <Link href="/#hero" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt="Logo Tuấn Thái Bình - Shop Thuê Acc TFT ĐTCL Uy Tín"
                className="w-full h-full rounded-[9px] sm:rounded-[10px] object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div className="border-l border-slate-200/80 pl-2.5 sm:pl-3 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                  {PROFILE_INFO.realName}
                </span>
                <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200 flex-shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate">
                ShopTFT Mobile
              </p>
            </div>
          </Link>

          {/* 2. Ở GIỮA: DÀN ĐỀU CÁC MENU ĐIỀU HƯỚNG VỚI KHOẢNG CÁCH THÔNG THOÁNG */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-700">
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

          {/* 3. BÊN PHẢI: NÚT THÀNH VIÊN VIP / GOOGLE AUTH & NÚT THUÊ ACC */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* User Profile / Google Login Button (Desktop) */}
            {user ? (
              <button
                onClick={() => openProfileModal("RENTALS")}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs hover:border-amber-400 group cursor-pointer relative"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-400 flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${vipInfo.currentTier.badgeBg}`}>
                  {vipInfo.currentTier.badge}
                </span>
                {activeRentals.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow-xs">
                    {activeRentals.length}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => openProfileModal("VIP")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-3.5 h-3.5"
                />
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Desktop Action Button */}
            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                className="hidden lg:inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-700/20 hover:shadow-lg transition-all hover:scale-105"
              >
                <KeyRound className="w-4 h-4" />
                <span>Thuê Acc Ngay</span>
              </Link>
            )}

            {/* Mobile User Profile Quick Button */}
            <button
              onClick={() => openProfileModal("RENTALS")}
              className="lg:hidden p-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 relative cursor-pointer"
              aria-label="Tài khoản của tôi"
            >
              <Crown className="w-4 h-4" />
              {activeRentals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center">
                  {activeRentals.length}
                </span>
              )}
            </button>

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

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
          {/* Mobile User Member Banner */}
          {user ? (
            <div
              onClick={() => {
                setMobileOpen(false);
                openProfileModal("RENTALS");
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-stone-900 text-white flex items-center justify-between border border-amber-400/40 shadow-sm cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl border border-amber-400" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">{user.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${vipInfo.currentTier.badgeBg}`}>
                      {vipInfo.currentTier.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-bold block mt-0.5">
                    🎮 Acc Đang Thuê: {activeRentals.length} • Giảm {vipInfo.currentTier.discountPercent}%
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileOpen(false);
                openProfileModal("VIP");
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between text-left cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Đăng Nhập Google / Thành Viên VIP</span>
                  <span className="text-[10px] text-orange-700 font-medium">Nhận ngay giảm 2-10% & Vé Test Acc 2H</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Quick Access Top Cards for Mobile */}
          <div className="grid grid-cols-2 gap-2 pb-1">
            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                onClick={() => setMobileOpen(false)}
                className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 flex flex-col justify-between text-left group active:scale-98 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-200/60 px-1.5 py-0.5 rounded">
                    VIP PRO
                  </span>
                  <KeyRound className="w-4 h-4 text-orange-600" />
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-slate-900 block">Kho Thuê Acc VIP</span>
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
                  <span className="text-[10px] font-black uppercase text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                    VÔ CỰC ∞
                  </span>
                  <MessageCircle className="w-4 h-4 text-slate-600" />
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-slate-900 block">Kho Acc Clone</span>
                  <span className="text-[10px] text-slate-500 font-medium">Bàn giao Full TT</span>
                </div>
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
                <span className="text-slate-400 text-xs">➔</span>
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
              <span>📞 Gọi Shop</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

