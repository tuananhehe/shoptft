"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";
import { Home, Gamepad2, Sparkles, Info, MessageCircle } from "lucide-react";

export const TFTMobileBottomBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort");

  const isHomeActive = pathname === "/";
  const isShopActive = pathname === "/shop" && sortParam !== "newest";
  const isNewArrivalsActive = pathname === "/shop" && sortParam === "newest";
  const isAboutActive = pathname === "/ve-shop";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {/* 1. Trang Chủ */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors ${
            isHomeActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative">
            <Home className="w-4 h-4" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Trang Chủ</span>
        </Link>

        {/* 2. Kho Acc */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors ${
            isShopActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative">
            <Gamepad2 className="w-4 h-4" />
            {isShopActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Kho Acc</span>
        </Link>

        {/* 3. Acc Mới */}
        <Link
          href="/shop?sort=newest"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors ${
            isNewArrivalsActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4" />
            {isNewArrivalsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Acc Mới</span>
        </Link>

        {/* 4. Về Shop */}
        <Link
          href="/ve-shop"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors ${
            isAboutActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative">
            <Info className="w-4 h-4" />
            {isAboutActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Về Shop</span>
        </Link>

        {/* 5. Zalo Shop */}
        <a
          href={PROFILE_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.trackClickZalo({ source: "mobile_bottom_bar" })}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-zinc-300 hover:text-white font-semibold transition-all active:scale-95"
        >
          <div className="relative w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
            <MessageCircle className="w-3.5 h-3.5 text-black" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-black" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-zinc-300 font-medium">Zalo</span>
        </a>
      </div>
    </nav>
  );
};
