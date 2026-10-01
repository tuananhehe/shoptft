"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import { useUserAuth } from "@/context/user-auth-context";
import { getFavorites } from "@/utils/product-discovery";
import { TFTFavoritesModal } from "@/components/tft-favorites-modal";
import { Menu, X, User, Heart, ChevronDown } from "lucide-react";

export const TFTNavbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUserAuth();

  // Active navigation states (Supports parent active during sub-routes)
  const isShopActive = pathname.startsWith("/shop") || pathname.startsWith("/acc");
  const isGuideActive = pathname.startsWith("/huong-dan");
  const isAboutActive = pathname === "/ve-shop";
  const isBlogActive = pathname.startsWith("/blog");

  // Desktop hover dropdown state with 150ms bridge delay to prevent flickering
  const [desktopDropdown, setDesktopDropdown] = useState<"shop" | "guide" | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: "shop" | "guide") => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDesktopDropdown(menu);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setDesktopDropdown(null);
    }, 180);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDesktopDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setDesktopDropdown(null);
  }, [pathname]);

  // Favorites state
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    setFavoriteCount(getFavorites().length);
    const handleFavUpdate = (e: any) => {
      setFavoriteCount(e.detail?.favorites ? e.detail.favorites.length : getFavorites().length);
    };
    window.addEventListener("tft:favorites_updated", handleFavUpdate);
    return () => window.removeEventListener("tft:favorites_updated", handleFavUpdate);
  }, []);

  // Prevent body scrolling when mobile navigation drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Subtle header transition on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 text-white ${
        scrolled
          ? "bg-[#09090b]/95 border-b border-white/[0.12] shadow-sm"
          : "bg-[#09090b]/80 border-b border-white/[0.06]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* 1. Left: Brand & Operator */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt={PROFILE_INFO.realName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-sm text-white group-hover:text-zinc-200 transition-colors tracking-tight">
                  {PROFILE_INFO.realName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-medium">
                  TFT
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">ShopTFT Mobile</p>
            </div>
          </Link>

          {/* 2. Center: Clean Navigation (Logo | Kho Acc ▼ | Hướng Dẫn ▼ | Về Shop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full text-xs sm:text-sm font-medium">
            {/* Kho Acc Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("shop")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/shop"
                onFocus={() => handleMouseEnter("shop")}
                className={`transition-colors py-2 flex items-center gap-1.5 ${
                  isShopActive
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
                aria-expanded={desktopDropdown === "shop"}
                aria-haspopup="true"
              >
                <span>Kho Acc</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    desktopDropdown === "shop" ? "rotate-180 text-white" : "text-zinc-400"
                  }`}
                />
              </Link>

              {desktopDropdown === "shop" && (
                <div
                  className="absolute left-0 top-full pt-2.5 z-[60] animate-in fade-in slide-in-from-top-1.5 duration-150 ease-out"
                  onMouseEnter={() => handleMouseEnter("shop")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-56 rounded-xl bg-[#0c0d12] border border-white/12 shadow-[0_20px_45px_rgba(0,0,0,0.9)] p-1.5 text-xs select-none">
                    <Link
                      href="/shop"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Tất cả Acc</span>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider">/shop</span>
                    </Link>
                    <Link
                      href="/shop?type=vip"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Acc VIP</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono font-semibold border border-amber-400/20">VIP</span>
                    </Link>
                    <Link
                      href="/shop?type=clone"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Acc Clone</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 font-mono border border-white/5">CLONE</span>
                    </Link>
                    <Link
                      href="/shop?sort=newest"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Acc Mới</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 font-mono font-medium border border-emerald-400/20">MỚI</span>
                    </Link>
                    <div className="my-1 border-t border-white/[0.08]" />
                    <Link
                      href="/shop?focus=pet"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Linh Thú / Chibi</span>
                      <span className="text-[11px] text-zinc-500">Tướng</span>
                    </Link>
                    <Link
                      href="/shop?focus=arena"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Sân Đấu</span>
                      <span className="text-[11px] text-zinc-500">Bản đồ</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Hướng Dẫn Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("guide")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/huong-dan"
                onFocus={() => handleMouseEnter("guide")}
                className={`transition-colors py-2 flex items-center gap-1.5 ${
                  isGuideActive
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
                aria-expanded={desktopDropdown === "guide"}
                aria-haspopup="true"
              >
                <span>Hướng Dẫn</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    desktopDropdown === "guide" ? "rotate-180 text-white" : "text-zinc-400"
                  }`}
                />
              </Link>

              {desktopDropdown === "guide" && (
                <div
                  className="absolute left-0 top-full pt-2.5 z-[60] animate-in fade-in slide-in-from-top-1.5 duration-150 ease-out"
                  onMouseEnter={() => handleMouseEnter("guide")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-64 rounded-xl bg-[#0c0d12] border border-white/12 shadow-[0_20px_45px_rgba(0,0,0,0.9)] p-1.5 text-xs select-none">
                    <Link
                      href="/huong-dan"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Tất cả hướng dẫn</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Hub</span>
                    </Link>
                    <Link
                      href="/huong-dan/doi-thong-tin-acc-riot"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors group whitespace-nowrap"
                    >
                      <span className="font-medium">Đổi thông tin Acc Riot</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 font-mono font-medium border border-emerald-400/20">Bảo mật</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Về Shop */}
            <Link
              href="/ve-shop"
              className={`transition-colors py-2 ${
                isAboutActive
                  ? "text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Về Shop
            </Link>
          </nav>

          {/* 3. Right: Member Login / Profile + Favorites + Primary CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium max-w-[80px] sm:max-w-[120px] truncate">
                  {user.full_name || `@${user.username}`}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-block text-xs text-zinc-300 hover:text-white font-medium px-2.5 py-1.5 transition-colors"
              >
                Đăng nhập
              </Link>
            )}

            {/* Favorites Icon Button */}
            <button
              type="button"
              onClick={() => setFavoritesOpen(true)}
              aria-label={`Xem danh sách acc đã lưu (${favoriteCount})`}
              title="Acc đã lưu"
              className="relative min-w-[40px] min-h-[40px] p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${favoriteCount > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              {favoriteCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Desktop Primary Action: Thuê Ngay */}
            <Link
              href="/shop"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all active:scale-98 shadow-sm"
            >
              Thuê Ngay
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden min-w-[40px] min-h-[40px] p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#09090b] px-4 py-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isShopActive
                  ? "text-white font-semibold bg-white/10"
                  : "text-zinc-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Kho Acc
            </Link>

            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isBlogActive
                  ? "text-white font-semibold bg-white/10"
                  : "text-zinc-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Blog Mùa 18
            </Link>

            <Link
              href="/huong-dan/doi-thong-tin-acc-riot"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isGuideActive
                  ? "text-white font-semibold bg-white/10"
                  : "text-zinc-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Hướng Dẫn Riot
            </Link>

            <Link
              href="/ve-shop"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isAboutActive
                  ? "text-white font-semibold bg-white/10"
                  : "text-zinc-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Về Shop
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setFavoritesOpen(true);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-zinc-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${favoriteCount > 0 ? "text-rose-500 fill-rose-500" : "text-zinc-400"}`} />
                <span>Acc Đã Lưu</span>
              </span>
              {favoriteCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 font-mono text-xs font-semibold">
                  {favoriteCount}
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">Trống</span>
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="text-xs text-zinc-300 hover:text-white"
              >
                Hồ sơ: <strong className="text-white">{user.full_name || user.username}</strong>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Đăng nhập thành viên
              </Link>
            )}

            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold"
            >
              Thuê Ngay
            </Link>
          </div>
        </div>
      )}

      {/* Favorites Modal Drawer */}
      <TFTFavoritesModal
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />
    </header>
  );
};
