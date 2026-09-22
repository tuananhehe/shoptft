"use client";

import React, { useState } from "react";
import { SERVICE_PACKAGES, PROFILE_INFO } from "@/data/tft-data";
import { ServicePackageItem } from "@/utils/homepage-service";
import { copyToClipboard } from "@/utils/clipboard-helper";
import { ZaloRedirectModal } from "@/components/zalo-redirect-modal";
import {
  Swords,
  Check,
  MessageCircle,
  Zap,
  ShieldCheck,
  Sparkles,
  Trophy,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Flame,
  UserCheck,
} from "lucide-react";

interface TFTServicesProps {
  packages?: ServicePackageItem[];
}

export const TFTServices: React.FC<TFTServicesProps> = ({ packages }) => {
  const [zaloRedirectMessage, setZaloRedirectMessage] = useState<string | null>(null);
  const displayPackages = packages && packages.length > 0 ? packages : SERVICE_PACKAGES;

  // Default active tab to popular package if available, else first package
  const defaultIndex = Math.max(
    0,
    displayPackages.findIndex((p) => p.popular)
  );
  const [activeMobileIndex, setActiveMobileIndex] = useState<number>(defaultIndex);

  const activePackage = displayPackages[activeMobileIndex] || displayPackages[0];

  const handleOrderService = async (srv: ServicePackageItem) => {
    const msg = `Chào Tuấn Thái Bình, mình muốn tư vấn dịch vụ ${srv.title} (${srv.price}).`;
    await copyToClipboard(msg);
    setZaloRedirectMessage(msg);
  };

  // Helper to format feature text with bold leading keywords for fast scanning
  const renderFeatureText = (feat: string) => {
    if (feat.includes(":")) {
      const parts = feat.split(":");
      return (
        <span>
          <strong className="font-bold text-slate-900">{parts[0]}:</strong>
          <span className="text-slate-600">{parts.slice(1).join(":")}</span>
        </span>
      );
    }
    if (feat.includes("bởi Tuấn Thái Bình")) {
      const parts = feat.split("bởi Tuấn Thái Bình");
      return (
        <span>
          <strong className="font-bold text-slate-900">{parts[0]}</strong>
          <span className="text-slate-600">bởi Tuấn Thái Bình{parts[1]}</span>
        </span>
      );
    }
    return <span className="text-slate-700">{feat}</span>;
  };

  // Helper for mobile tab short label and icon
  const getTabInfo = (srv: ServicePackageItem) => {
    if (srv.id === "srv-02" || srv.title.toLowerCase().includes("coach")) {
      return {
        icon: Headphones,
        shortTitle: "Coaching 1-1",
        tag: "HOT",
      };
    }
    if (srv.id === "srv-01" || srv.title.toLowerCase().includes("rank")) {
      return {
        icon: Swords,
        shortTitle: "Cày Rank",
        tag: "Top 1-3",
      };
    }
    return {
      icon: Trophy,
      shortTitle: "Duo Kèm",
      tag: "MMR+",
    };
  };

  return (
    <section id="services" className="py-6 sm:py-16 bg-white text-slate-900 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-12 space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>Dịch Vụ Chuyên Nghiệp</span>
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 font-gaming uppercase">
            CÀY THUÊ RANK & COACHING 1-1 ĐTCL
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal max-w-xl mx-auto leading-relaxed">
            Kèm 1-1 & cày tay 100% bởi Cựu Thách Đấu 1.134 ĐNG. Bảo mật danh tính tuyệt đối & đền bù 200% nếu có sự cố.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* MOBILE VIEW: COMPACT INTERACTIVE TAB SELECTOR + FOCUSED CARD ( < md ) */}
        {/* ==================================================================== */}
        <div className="md:hidden space-y-4">
          {/* Mobile Tab Pills */}
          <div className="flex items-center justify-between p-1 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1 shadow-inner">
            {displayPackages.map((srv, idx) => {
              const tab = getTabInfo(srv);
              const Icon = tab.icon;
              const isActive = activeMobileIndex === idx;

              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setActiveMobileIndex(idx)}
                  className={`flex-1 py-2.5 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 relative cursor-pointer ${
                    isActive
                      ? "bg-white text-orange-600 shadow-md shadow-slate-300/40 border border-slate-200/80 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 active:scale-95"
                  }`}
                >
                  {srv.popular && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[9px] font-black rounded-full uppercase shadow-xs">
                      HOT
                    </span>
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? "text-orange-600" : "text-slate-400"}`} />
                  <span className="truncate max-w-[90px] text-[11px] leading-none font-semibold">
                    {tab.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Focused Mobile Card */}
          {activePackage && (
            <div
              className={`rounded-2xl p-5 border transition-all duration-300 relative bg-white ${
                activePackage.popular
                  ? "border-2 border-orange-500 shadow-lg shadow-orange-500/10"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    activePackage.popular
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-orange-600" />
                  {activePackage.badge}
                </span>

                {activePackage.popular && (
                  <span className="text-[10px] font-extrabold text-red-600 uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Đặt Nhiều Nhất
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div className="mb-3.5 pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 font-gaming leading-snug">
                  {activePackage.title}
                </h3>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-orange-600 font-mono tracking-tight">
                    {activePackage.price}
                  </span>
                </div>
              </div>

              {/* Quick Highlight Pills */}
              <div className="grid grid-cols-2 gap-1.5 mb-3.5">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">Cày tay 100%</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">Bảo mật tuyệt đối</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quyền lợi & Cam kết:
                </div>
                <ul className="space-y-2 text-xs">
                  {activePackage.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="text-[11px]">{renderFeatureText(feat)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button & Navigation */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleOrderService(activePackage)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-amber-700 active:from-orange-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer font-gaming active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn Zalo Tư Vấn Gói Này</span>
                </button>

                {/* Arrow Nav Switcher on mobile */}
                <div className="flex items-center justify-between pt-1 px-1 text-slate-400 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMobileIndex(
                        (prev) => (prev - 1 + displayPackages.length) % displayPackages.length
                      )
                    }
                    className="inline-flex items-center gap-1 hover:text-slate-700 p-1 cursor-pointer font-medium"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Gói trước</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {displayPackages.map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeMobileIndex === i ? "w-4 bg-orange-600" : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveMobileIndex((prev) => (prev + 1) % displayPackages.length)
                    }
                    className="inline-flex items-center gap-1 hover:text-slate-700 p-1 cursor-pointer font-medium"
                  >
                    <span>Gói sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* DESKTOP & TABLET VIEW: CLEAN 3-COLUMN GRID ( >= md )                 */}
        {/* ==================================================================== */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {displayPackages.map((srv) => (
            <div
              key={srv.id}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                srv.popular
                  ? "bg-white border-2 border-orange-500 shadow-xl shadow-orange-600/10 -translate-y-1.5"
                  : "bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {srv.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3" /> GÓI ĐƯỢC ĐẶT NHIỀU NHẤT
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider">
                    {srv.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-gaming leading-snug">
                    {srv.title}
                  </h3>
                </div>

                <div className="py-2.5 border-y border-slate-200/80">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {srv.price}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {srv.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">{renderFeatureText(feat)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleOrderService(srv)}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer font-gaming ${
                    srv.popular
                      ? "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-amber-700 active:from-orange-800 text-white shadow-md shadow-orange-600/20 hover:scale-[1.02]"
                      : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs hover:border-slate-400"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tư Vấn Zalo Ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ==================================================================== */}
        {/* TRUST & GUARANTEE STRIP (Both Mobile & Desktop)                     */}
        {/* ==================================================================== */}
        <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Bảo Hiểm 30M Checkscam</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500">Bảo hiểm quỹ bồi thường uy tín</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Cày Tay 100% Cựu Thách Đấu</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500">Nói không với Tool / Hack / Bug</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Bảo Mật Thông Tin Tuyệt Đối</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500">Fake IP sạch, an toàn 100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Zalo Redirect Confirmation Modal ("Oki bae") */}
      <ZaloRedirectModal
        isOpen={!!zaloRedirectMessage}
        onClose={() => setZaloRedirectMessage(null)}
        orderMessage={zaloRedirectMessage || ""}
        zaloUrl={PROFILE_INFO.zaloUrl}
      />
    </section>
  );
};
