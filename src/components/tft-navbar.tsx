"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import { Menu, X } from "lucide-react";
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

  // Dynamically build clean nav links according to enabled sections
  const allPossibleLinks = [
    {
      id: "hero",
      label: "Trang Chủ",
      href: "/#hero",
      enabled: sections?.hero !== false,
    },
    {
      id: "shop",
      label: "Kho VIP",
      href: "/#shop",
      enabled: sections?.vipShop !== false,
    },
    {
      id: "clone-shop",
      label: "Kho Clone",
      href: "/#clone-shop",
      enabled: sections?.cloneShop !== false,
    },
    {
      id: "services",
      label: "Cày Rank",
      href: "/#services",
      enabled: sections?.services !== false,
    },
    {
      id: "about",
      label: "Về Tuấn",
      href: "/#about",
      enabled: sections?.about !== false,
    },
    {
      id: "reviews",
      label: "Đánh Giá",
      href: "/#reviews",
      enabled: sections?.reviews === true, // Only show if explicitly enabled
    },
    {
      id: "survey",
      label: "Khảo Sát",
      href: "/khao-sat",
      enabled: true,
      hasDot: true,
    },
    {
      id: "faq",
      label: "FAQ",
      href: "/#faq",
      enabled: sections?.faq !== false,
    },
  ];

  const visibleNavLinks = allPossibleLinks.filter((item) => item.enabled);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 text-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-13 sm:h-14 flex items-center justify-between gap-4">
          
          {/* 1. BÊN TRÁI: LOGO & TÊN THƯƠNG HIỆU TỐI GIẢN */}
          <Link
            href="/#hero"
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <img
              src={PROFILE_INFO.avatarUrl}
              alt={PROFILE_INFO.realName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                {PROFILE_INFO.realName}
              </span>
              <span className="text-[10px] text-slate-400 font-normal leading-none hidden sm:block">
                Shop TFT Uy Tín
              </span>
            </div>
          </Link>

          {/* 2. Ở GIỮA: MENU ĐIỀU HƯỚNG MẢNH MAI, ĐƠN GIẢN (DESKTOP) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[13px] font-medium text-slate-600">
            {visibleNavLinks.map((link) => {
              const isCurrent =
                link.href === pathname ||
                (pathname === "/khao-sat" && link.href === "/khao-sat");

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg transition-colors relative flex items-center gap-1.5 ${
                    isCurrent
                      ? "text-orange-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasDot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. BÊN PHẢI: NÚT LIÊN HỆ & THUÊ ACC MẢNH GỌN */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border border-slate-200/60"
            >
              Zalo 24/7
            </a>

            {sections?.vipShop !== false && (
              <Link
                href="/#shop"
                className="inline-flex items-center justify-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-medium rounded-full shadow-xs transition-colors cursor-pointer"
              >
                Thuê Acc
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer (Tối giản & Mảnh mai) */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-medium text-slate-700 hover:text-slate-900 py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{link.label}</span>
                {link.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                )}
              </div>
            </Link>
          ))}

          {/* Quick Zalo & Phone on Mobile */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-2">
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 text-center text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-colors"
            >
              Chat Zalo
            </a>
            <a
              href={`tel:${PROFILE_INFO.phoneZalo.replace(/[^0-9]/g, "")}`}
              className="flex-1 py-2 text-center text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-colors"
            >
              Gọi Hotline
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
