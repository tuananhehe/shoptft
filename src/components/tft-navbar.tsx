"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import { useUserAuth } from "@/context/user-auth-context";
import { analytics } from "@/utils/analytics";
import { getFavorites } from "@/utils/product-discovery";
import { TFTFavoritesModal } from "@/components/tft-favorites-modal";
import { ChevronDown, Menu, X, User, Heart } from "lucide-react";

export const TFTNavbar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [guideDropdown, setGuideDropdown] = useState(false);
  const { user } = useUserAuth();

  // Active navigation states
  const sortParam = searchParams.get("sort");
  const isShopActive = pathname === "/shop" && sortParam !== "newest";
  const isNewArrivalsActive = pathname === "/shop" && sortParam === "newest";
  const isAboutActive = pathname === "/ve-shop";
  const isGuideActive = pathname.startsWith("/huong-dan");

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
  }, [pathname, searchParams]);

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

          {/* 2. Center: Clean Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-300">
            {/* Kho Acc Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopDropdown(true)}
              onMouseLeave={() => setShopDropdown(false)}
            >
              <Link
                href="/shop"
                className={`inline-flex items-center gap-1 transition-colors py-2 ${
                  isShopActive
                    ? "text-white font-semibold"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <span>Kho Acc</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>

              {shopDropdown && (
                <div className="absolute top-full left-0 w-48 py-1.5 rounded-xl bg-[#121214] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                  <Link
                    href="/shop"
                    className="block px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Tất cả tài khoản
                  </Link>
                  <Link
                    href="/shop?type=vip"
                    className="block px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Kho VIP (Chibi & Sân)
                  </Link>
                  <Link
                    href="/shop?type=clone"
                    className="block px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Kho Clone (Sở hữu)
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/shop?sort=newest"
              className={`transition-colors py-2 ${
                isNewArrivalsActive
                  ? "text-white font-semibold"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              Acc Mới
            </Link>

            {/* Hướng Dẫn Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setGuideDropdown(true)}
              onMouseLeave={() => setGuideDropdown(false)}
            >
              <Link
                href="/huong-dan/doi-thong-tin-acc-riot"
                className={`inline-flex items-center gap-1 transition-colors py-2 ${
                  isGuideActive
                    ? "text-white font-semibold"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <span>Hướng Dẫn</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>

              {guideDropdown && (
                <div className="absolute top-full left-0 w-56 py-1.5 rounded-xl bg-[#121214] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                  <Link
                    href="/huong-dan/doi-thong-tin-acc-riot"
                    className="block px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Đổi thông tin acc Riot
                  </Link>
                  <Link
                    href="/#huong-dan"
                    className="block px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Quy trình thuê tài khoản
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/ve-shop"
              className={`transition-colors py-2 ${
                isAboutActive
                  ? "text-white font-semibold"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              Về Shop
            </Link>
          </nav>

          {/* 3. Right: Member Login / Profile + Primary CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium max-w-[120px] truncate">
                  {user.full_name || `@${user.username}`}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs text-zinc-300 hover:text-white font-medium px-2.5 py-1.5 transition-colors"
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
              className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${favoriteCount > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              {favoriteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {favoriteCount}
                </span>
              )}
            </button>

            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all active:scale-98 shadow-sm"
            >
              Thuê Ngay
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
              Kho Acc (Tất cả)
            </Link>
            <Link
              href="/shop?type=vip"
              onClick={() => setMobileOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              • Kho VIP (Chibi & Sân)
            </Link>
            <Link
              href="/shop?type=clone"
              onClick={() => setMobileOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              • Kho Clone (Sở hữu)
            </Link>
            <Link
              href="/shop?sort=newest"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isNewArrivalsActive
                  ? "text-white font-semibold bg-white/10"
                  : "text-zinc-200 hover:text-white hover:bg-white/5"
              }`}
            >
              Acc Mới
            </Link>
            <Link
              href="/#huong-dan"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Quy Trình Thuê Acc
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
              Đổi Thông Tin Acc Riot
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
              Về ShopTFTMobile
            </Link>
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setMobileOpen(false);
                analytics.trackClickZalo({ source: "header" });
              }}
              className="flex items-center justify-between px-3 py-2 text-sm text-zinc-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span>Tư Vấn Zalo</span>
              <span className="text-[11px] text-zinc-400">Trực tiếp</span>
            </a>
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
              Xem kho acc
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
