"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  Home,
  Crown,
  Gamepad2,
  MessageCircle,
  ClipboardCheck,
} from "lucide-react";

export const TFTMobileBottomBar: React.FC = () => {
  const pathname = usePathname();
  const isSurveyPage = pathname === "/khao-sat";
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    if (isSurveyPage) {
      setActiveTab("survey");
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shopEl = document.getElementById("shop");
      const cloneEl = document.getElementById("clone-shop");
      const servicesEl = document.getElementById("services");

      const shopPos = (shopEl?.offsetTop || 500) - 200;
      const clonePos = (cloneEl?.offsetTop || 1500) - 200;
      const servicesPos = (servicesEl?.offsetTop || 2500) - 200;

      if (scrollY >= clonePos && scrollY < servicesPos) {
        setActiveTab("clone-shop");
      } else if (scrollY >= shopPos && scrollY < clonePos) {
        setActiveTab("shop");
      } else if (scrollY < shopPos) {
        setActiveTab("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSurveyPage]);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    setActiveTab(id);
    if (pathname !== "/") {
      return; // Allow normal link navigation back to home anchor
    }
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {/* 1. Trang Chủ */}
        <a
          href={pathname === "/" ? "#hero" : "/#hero"}
          onClick={(e) => handleNavClick("hero", e)}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === "hero" && !isSurveyPage
              ? "text-orange-600 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === "hero" && !isSurveyPage && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-600" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Trang Chủ</span>
        </a>

        {/* 2. Kho Acc VIP */}
        <a
          href={pathname === "/" ? "#shop" : "/#shop"}
          onClick={(e) => handleNavClick("shop", e)}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === "shop" && !isSurveyPage
              ? "text-orange-600 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div className="relative">
            <Crown className="w-5 h-5" />
            {activeTab === "shop" && !isSurveyPage && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-600" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Kho VIP</span>
        </a>

        {/* 3. Kho Clone / Smurf */}
        <a
          href={pathname === "/" ? "#clone-shop" : "/#clone-shop"}
          onClick={(e) => handleNavClick("clone-shop", e)}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === "clone-shop" && !isSurveyPage
              ? "text-orange-600 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div className="relative">
            <Gamepad2 className="w-5 h-5" />
            {activeTab === "clone-shop" && !isSurveyPage && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-600" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Kho Clone</span>
        </a>

        {/* 4. Chat Zalo (Nổi Bật) */}
        <a
          href={PROFILE_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-sky-600 hover:text-sky-700 font-bold transition-all active:scale-95"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 -mt-2">
            <MessageCircle className="w-4.5 h-4.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-sky-700 font-bold">Zalo Shop</span>
        </a>

        {/* 5. Khảo Sát (Nhận Quà / Voucher) */}
        <Link
          href="/khao-sat"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
            isSurveyPage
              ? "text-orange-600 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div className="relative">
            <ClipboardCheck className={`w-5 h-5 ${isSurveyPage ? "text-orange-600" : "text-amber-500"}`} />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-black rounded-full uppercase shadow-xs">
              Quà
            </span>
            {isSurveyPage && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-600" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 ${isSurveyPage ? "text-orange-600 font-bold" : "text-amber-700 font-semibold"}`}>
            Khảo Sát
          </span>
        </Link>
      </div>
    </nav>
  );
};
