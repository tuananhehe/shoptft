"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserAuth } from "@/context/user-auth-context";
import { Home, Gamepad2, BookOpen, Store, User } from "lucide-react";

export const TFTMobileBottomBar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useUserAuth();

  // Active navigation states (Phase 11.5 / Navigation UX Patch)
  const isHomeActive = pathname === "/";
  const isShopActive = pathname.startsWith("/shop") || pathname.startsWith("/acc");
  const isGuideActive = pathname.startsWith("/huong-dan");
  const isAboutActive = pathname === "/ve-shop";
  const isAccountActive =
    pathname === "/profile" ||
    pathname === "/login" ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/tai-khoan");

  const accountHref = user ? "/profile" : "/login";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] px-1 py-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {/* 1. Trang Chủ */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors ${
            isHomeActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Home className="w-4.5 h-4.5 stroke-[1.8]" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
            Trang Chủ
          </span>
        </Link>

        {/* 2. Kho Acc */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors ${
            isShopActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Gamepad2 className="w-4.5 h-4.5 stroke-[1.8]" />
            {isShopActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
            Kho Acc
          </span>
        </Link>

        {/* 3. Hướng Dẫn */}
        <Link
          href="/huong-dan/doi-thong-tin-acc-riot"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors ${
            isGuideActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 stroke-[1.8]" />
            {isGuideActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
            Hướng Dẫn
          </span>
        </Link>

        {/* 4. Về Shop */}
        <Link
          href="/ve-shop"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors ${
            isAboutActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Store className="w-4.5 h-4.5 stroke-[1.8]" />
            {isAboutActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
            Về Shop
          </span>
        </Link>

        {/* 5. Tài Khoản */}
        <Link
          href={accountHref}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors ${
            isAccountActive
              ? "text-white font-semibold"
              : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <User className="w-4.5 h-4.5 stroke-[1.8]" />
            {isAccountActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
            Tài Khoản
          </span>
        </Link>
      </div>
    </nav>
  );
};
