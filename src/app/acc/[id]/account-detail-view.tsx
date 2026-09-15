"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UnifiedProductAccount, getAccountProductUrl, getRankTheme } from "@/utils/account-lookup";
import { PROFILE_INFO } from "@/data/tft-data";
import { formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { getHomepageConfig, PricingConfig } from "@/utils/homepage-service";
import { copyToClipboard, buildZaloOrderUrl } from "@/utils/clipboard-helper";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { TFTImageLightbox } from "@/components/tft-image-lightbox";
import { ZaloRedirectModal } from "@/components/zalo-redirect-modal";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  KeyRound,
  Zap,
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  Layers,
  HelpCircle,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Crown,
  ArrowRight,
} from "lucide-react";

interface AccountDetailViewProps {
  account: UnifiedProductAccount;
  relatedAccounts: UnifiedProductAccount[];
}

type PackageKey = "2h" | "7d" | "30d" | "perm";

export function AccountDetailView({ account, relatedAccounts }: AccountDetailViewProps) {
  const isClone = account.type === "CLONE";
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("perm");
  const [isAgreed, setIsAgreed] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zaloRedirectMessage, setZaloRedirectMessage] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [pricingRates, setPricingRates] = useState<PricingConfig>({
    passChangeFee: 20000,
    rate2Hours: 3,
    rate7Days: 12,
    rate30Days: 30,
  });

  const rankTheme = getRankTheme(account.rank);

  useEffect(() => {
    getHomepageConfig().then((cfg) => {
      if (cfg?.pricing) {
        setPricingRates(cfg.pricing);
      }
    });
  }, []);

  useEffect(() => {
    setSelectedPackage("perm");
  }, [account.id]);

  useEffect(() => {
    if (account.status === "RENTED") {
      const info = formatRentalExpiry(account.rentedUntil);
      setCountdownSeconds(info ? info.remainingSec : 0);

      const timer = setInterval(() => {
        const liveInfo = formatRentalExpiry(account.rentedUntil);
        setCountdownSeconds(liveInfo ? liveInfo.remainingSec : 0);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [account]);

  const isRented = account.status === "RENTED";
  const rentalInfo = formatRentalExpiry(account.rentedUntil);

  const days = Math.floor(countdownSeconds / (24 * 3600));
  const hours = Math.floor((countdownSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const isInfinite = days > 365 || (rentalInfo ? rentalInfo.isInfinite : false);

  const roundToThousand = (val: number) => {
    if (isNaN(val) || !val) return 0;
    return Math.round(val / 1000) * 1000;
  };
  const formatMoney = (val: number) => `${roundToThousand(val).toLocaleString("vi-VN")}đ`;

  // Base account value for VIP calculation (khớp 100% với modal trang chủ)
  const baseAccountValue =
    Number(account.accountValue) ||
    (account.dailyPrice ? Number(account.dailyPrice) * 16 : 0) ||
    (account.hourlyPrice ? Number(account.hourlyPrice) * 50 : 0) ||
    850000;

  const rate2h = (pricingRates.rate2Hours || 3) / 100;
  const rate7d = (pricingRates.rate7Days || 12) / 100;
  const rate30d = (pricingRates.rate30Days || 30) / 100;
  const passFee = pricingRates.passChangeFee ?? 20000;

  // Giá sở hữu lâu dài cho Acc Clone (khớp 100% với Kho Clone trang chủ)
  const clonePrice = Number(account.price) || Number(account.periodPrice) || Number(account.monthlyPrice) || 150000;

  // Cấu hình 4 gói thuê VIP (khớp 100% với TFTAccountModal trang chủ)
  const packageConfigs: Record<
    PackageKey,
    {
      id: PackageKey;
      name: string;
      sub: string;
      totalPrice: number;
      basePrice: number;
      passFee: number;
      badge?: string;
    }
  > = {
    "2h": {
      id: "2h",
      name: "2 Giờ",
      sub: "Trải nghiệm nhanh",
      basePrice: roundToThousand(baseAccountValue * rate2h),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate2h) + passFee,
      badge: "Phổ Biến",
    },
    "7d": {
      id: "7d",
      name: "7 Ngày",
      sub: "Tiết kiệm 45%",
      basePrice: roundToThousand(baseAccountValue * rate7d),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate7d) + passFee,
      badge: "Tiết Kiệm",
    },
    "30d": {
      id: "30d",
      name: "30 Ngày",
      sub: "Free đổi pass",
      basePrice: roundToThousand(baseAccountValue * rate30d),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue * rate30d),
      badge: "Hot Nhất",
    },
    perm: {
      id: "perm",
      name: "Lâu Dài (∞)",
      sub: "Bàn giao về chính chủ",
      basePrice: roundToThousand(baseAccountValue),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue),
      badge: "Chính Chủ",
    },
  };

  const activePackage = isClone
    ? {
        id: "perm" as PackageKey,
        name: "Lâu Dài (∞)",
        sub: "Bàn giao thông tin acc về chính chủ, sở hữu lâu dài",
        basePrice: clonePrice,
        passFee: 0,
        totalPrice: clonePrice,
        badge: "Chính Chủ",
      }
    : packageConfigs[selectedPackage] || packageConfigs["perm"];

  // Helper hiển thị giá khởi điểm ở banner đầu trang (khớp logic trang chủ)
  const getHeaderDisplayPrice = () => {
    if (isClone) {
      return {
        amount: formatMoney(clonePrice),
        unit: " / ∞",
        badge: "Full Sở Hữu",
        label: "Giá sở hữu trọn đời:",
      };
    }
    const mode = account.priceDisplayType || "HOURLY";
    if (mode === "DAILY") {
      const dailyVal = account.dailyPrice || (Number(account.hourlyPrice) || 15000) * 3;
      return {
        amount: formatMoney(dailyVal),
        unit: " / Ngày",
        badge: "Gói Ngày",
        label: "Giá thuê theo ngày:",
      };
    }
    if (mode === "LONG_TERM") {
      const longTermVal = Number(account.periodPrice) || Number(account.monthlyPrice) || baseAccountValue;
      return {
        amount: formatMoney(longTermVal),
        unit: account.periodUnit || " / ∞",
        badge: "Lâu Dài",
        label: "Giá thuê lâu dài:",
      };
    }
    if (mode === "CUSTOM") {
      const customVal = account.customPrice || Number(account.hourlyPrice) || 15000;
      return {
        amount: formatMoney(customVal),
        unit: account.customPriceUnit ? ` ${account.customPriceUnit}` : "",
        badge: "Đặc Biệt",
        label: "Đơn giá đặc biệt:",
      };
    }
    return {
      amount: formatMoney(Number(account.hourlyPrice) || 15000),
      unit: " / Giờ",
      badge: "",
      label: "Giá thuê khởi điểm:",
    };
  };

  const headerPriceInfo = getHeaderDisplayPrice();

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Đã sao chép đường link tài khoản!", {
        icon: "🔗",
        duration: 2500,
      });
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopiedCode(true);
    toast.success(`Đã sao chép mã acc: ${account.code}`, {
      icon: "📋",
      duration: 2500,
    });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Thuê Acc TFT ${account.code} - ${account.title}`,
          text: `Xem ngay tài khoản TFT ${account.code} (${account.rank}) tại Shop Tuấn Thái Bình:`,
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleOrderZalo = async () => {
    if (!isAgreed) {
      toast.error(isClone ? "Vui lòng tích đồng ý với cam kết bàn giao!" : "Vui lòng tích đồng ý với quy định thuê!");
      return;
    }
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;

    let msg = "";
    if (isClone) {
      msg = `Chào Tuấn Thái Bình, mình muốn THUÊ LÂU DÀI (BÀN GIAO FULL THÔNG TIN) Acc Clone mã [${account.code}] - ${account.title} (Giá ${clonePrice.toLocaleString("vi-VN")}đ / ∞). Link: ${currentUrl}. Hỗ trợ kiểm tra và bàn giao tài khoản cho mình nhé!`;
    } else {
      const upgradeNote =
        selectedPackage === "30d"
          ? "\n*Ghi chú: Đơn này được áp dụng chính sách bù 70% để nâng cấp lên Thuê Lâu Dài trong quá trình sử dụng.*"
          : "";
      msg = `Chào Tuấn Thái Bình, mình muốn thuê tài khoản ${account.code} (${account.title}) - Gói ${activePackage.name} (${formatMoney(activePackage.totalPrice)}). Link acc: ${currentUrl}${upgradeNote}`;
    }

    // Tự động lưu nội dung vào clipboard
    await copyToClipboard(msg);

    // Mở popup xác nhận sao chép & chuyển tiếp qua Zalo ("Oki bae")
    setZaloRedirectMessage(msg);
  };

  const handlePreOrderZalo = async () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;
    let preOrderMsg = "";
    if (isClone) {
      preOrderMsg = `Chào Tuấn Thái Bình, mình muốn ĐẶT TRƯỚC Acc Clone ${account.code} (${account.title}) khi hết hạn thuê. Link: ${currentUrl}`;
    } else {
      preOrderMsg = `Chào Tuấn Thái Bình, mình muốn ĐẶT TRƯỚC tài khoản ${account.code} (${account.title}) khi hết giờ thuê. Link: ${currentUrl}`;
    }

    await copyToClipboard(preOrderMsg);
    setZaloRedirectMessage(preOrderMsg);
  };

  const allChibis =
    account.allChibi && account.allChibi.length > 0
      ? account.allChibi
      : account.mainChibi
      ? [account.mainChibi]
      : [];

  const allArenas =
    account.allArenas && account.allArenas.length > 0
      ? account.allArenas
      : account.mainArena
      ? [account.mainArena]
      : [];

  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* 1. Header Navigation */}
      <TFTNavbar />

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        {/* Breadcrumb & Top Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link
              href="/"
              className="hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang Chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={account.type === "VIP" ? "/#tft-vip-shop" : "/#tft-clone-shop"}
              className="hover:text-orange-600 transition-colors hidden xs:inline"
            >
              {account.type === "VIP" ? "Kho Acc VIP" : "Kho Acc Clone"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden xs:inline" />
            <span className="text-slate-900 font-bold font-mono">
              {account.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép link</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              aria-label="Chia sẻ sản phẩm"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* Product Showcase Grid: 2 Clean Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT COLUMN (COL 1-5): Image & Compact Trust Pillars */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-4 shadow-sm relative overflow-hidden">
              {/* Image Container with Zoom Lightbox Click */}
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 cursor-zoom-in group shadow-inner"
              >
                <LazyAccountImage
                  src={account.thumbnail}
                  alt={`Thuê acc TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                  priority
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top-Right Badge: Account Code with Quick Click to Copy */}
                <button
                  onClick={handleCopyCode}
                  title="Chạm để sao chép mã acc"
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/85 text-xs font-mono font-bold text-white shadow-md backdrop-blur-md active:scale-90 transition-transform cursor-pointer hover:bg-orange-600"
                >
                  <span>{account.code}</span>
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-300" />
                  )}
                </button>

                {/* Top-Left Badge: Availability Status */}
                <div className="absolute top-3 left-3">
                  {!isRented ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600/95 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>SẴN SÀNG</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600/95 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ĐANG THUÊ</span>
                    </span>
                  )}
                </div>

                {/* Bottom-Left: Rank Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-lg bg-white/95 text-slate-900 text-xs font-extrabold uppercase tracking-wide backdrop-blur-md shadow-md">
                    {account.rank}
                  </span>
                </div>

                {/* Hover hint */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md flex items-center gap-1.5">
                    🔍 Chạm để phóng to ảnh
                  </span>
                </div>
              </div>

              {/* Rented Countdown Banner (if rented) */}
              {isRented && (
                <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-rose-500/10 border border-rose-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                      <Clock
                        className="w-4 h-4 text-rose-600 animate-spin"
                        style={{ animationDuration: "6s" }}
                      />
                      <span>Thời Gian Trả Acc Dự Kiến:</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {rentalInfo.expiryFormatted}
                    </span>
                  </div>
                  <div className="mt-2 text-center font-mono font-black text-rose-600 text-base sm:text-lg tracking-wider">
                    {isInfinite
                      ? "Thuê Vô Cực ∞"
                      : countdownSeconds > 0
                      ? `${days > 0 ? `${days} ngày ` : ""}${pad(hours)}:${pad(
                          minutes
                        )}:${pad(seconds)}`
                      : "Sắp sẵn sàng"}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Trust & Guarantee Strip */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <div className="text-[11px] font-bold text-slate-900 leading-tight">
                  Bảo Hiểm 30M
                </div>
                <div className="text-[9px] text-slate-500 font-medium">
                  Checkscam uy tín
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-0.5">
                <Zap className="w-4 h-4 text-orange-600 mx-auto" />
                <div className="text-[11px] font-bold text-slate-900 leading-tight">
                  Bàn Giao 30s
                </div>
                <div className="text-[9px] text-slate-500 font-medium">
                  Tự động qua Zalo
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-0.5">
                <Crown className="w-4 h-4 text-amber-500 mx-auto" />
                <div className="text-[11px] font-bold text-slate-900 leading-tight">
                  Tuấn Thái Bình
                </div>
                <div className="text-[9px] text-slate-500 font-medium">
                  1.134 ĐNG Top 1
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (COL 6-12): Details, Assets Summary & Interactive Booking */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* 1. Header Overview & Assets Badges Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${rankTheme.rankBadgeBg}`}
                >
                  {account.rank}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {isClone ? "TÀI KHOẢN CLONE / SMURF" : "TÀI KHOẢN VIP"}
                </span>
                {account.tag && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-orange-100 text-orange-700 border border-orange-200">
                    🔥 {account.tag}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight font-gaming tracking-tight">
                {account.title}
              </h1>

              {/* Asset Tags Cloud (Tướng Tí Nị & Sân Đấu) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tài sản & vật phẩm sở hữu:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {allChibis.map((chibi, idx) => (
                    <span
                      key={`chibi-${idx}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                    >
                      <span>👑</span>
                      <span>{chibi}</span>
                    </span>
                  ))}

                  {allArenas.map((arena, idx) => (
                    <span
                      key={`arena-${idx}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold"
                    >
                      <span>🏟️</span>
                      <span>{arena}</span>
                    </span>
                  ))}

                  {account.features &&
                    account.features.map((feat, idx) => (
                      <span
                        key={`feat-${idx}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* 2. Interactive Package Selector & Direct Booking Box */}
            {isClone ? (
              /* CLONE ACCOUNT FULL OWNERSHIP CARD (Khớp 100% Kho Clone) */
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Gói Sở Hữu Vô Cực (Bàn Giao Về Chính Chủ):</span>
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Bảo hành trọn đời
                  </span>
                </div>

                {/* BẢNG GIÁ & QUYỀN LỢI */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Giá sở hữu lâu dài:
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black font-mono text-red-600">
                        {clonePrice.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-sm font-bold text-slate-800">/ ∞</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Bàn giao thông tin acc về chính chủ, sở hữu lâu dài</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Đầy đủ Riot ID, Mật khẩu và hỗ trợ đổi Mail chính chủ</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Miễn phí bảo hành và hỗ trợ kỹ thuật trọn gói</span>
                    </p>
                  </div>
                </div>

                {/* CHECKBOX CAM KẾT */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50/60 border border-orange-200/70 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600 flex-shrink-0"
                  />
                  <span className="text-slate-700 font-medium leading-tight">
                    Đồng ý với chính sách bàn giao về chính chủ & bảo hành của Shop.
                  </span>
                </label>

                {/* Action CTA Button */}
                <div className="space-y-2.5 pt-1">
                  {isRented ? (
                    <button
                      onClick={handlePreOrderZalo}
                      className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 transition-all duration-300 font-gaming cursor-pointer shadow-orange-600/30 active:scale-[0.99]"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Đặt Lịch Thuê Trước Qua Zalo</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOrderZalo}
                      disabled={!isAgreed}
                      className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all duration-300 font-gaming cursor-pointer ${
                        isAgreed
                          ? "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99]"
                          : "bg-slate-300 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Nhận Acc Zalo (Bàn Giao Về Chính Chủ)</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                    <span>Hỗ trợ kỹ thuật 24/7</span>
                    <a
                      href={`tel:${PROFILE_INFO.phoneZalo.replace(/\./g, "")}`}
                      className="font-bold text-orange-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hotline: {PROFILE_INFO.phoneZalo}</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* VIP ACCOUNT PACKAGE SELECTOR (4 GÓI CHUẨN) */
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span>Chọn Gói Thuê Tài Khoản:</span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tự động tính phí đổi pass
                  </span>
                </div>

                {/* 4 Package Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["2h", "7d", "30d", "perm"] as PackageKey[]).map(
                    (pkgKey) => {
                      const pkg = packageConfigs[pkgKey];
                      const isSelected = selectedPackage === pkgKey;
                      return (
                        <button
                          key={pkgKey}
                          onClick={() => setSelectedPackage(pkgKey)}
                          className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                            isSelected
                              ? "bg-orange-50/70 border-orange-500 shadow-md shadow-orange-500/10 ring-2 ring-orange-500/20"
                              : "bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {pkg.badge && (
                            <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-600 text-white leading-none">
                              {pkg.badge}
                            </span>
                          )}
                          <div>
                            <div
                              className={`text-xs font-bold ${
                                isSelected
                                  ? "text-orange-950"
                                  : "text-slate-800"
                              }`}
                            >
                              {pkg.name}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {pkg.sub}
                            </div>
                          </div>
                          <div className="mt-2 font-mono font-bold text-sm text-red-600">
                            {formatMoney(pkg.totalPrice)}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Calculated Price Breakdown Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Gói đã chọn:</span>
                    <strong className="text-slate-900">
                      {activePackage.name}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Giá thuê gốc:</span>
                    <span>{formatMoney(activePackage.basePrice)}</span>
                  </div>
                  {activePackage.passFee > 0 ? (
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Phí dịch vụ đổi pass Riot:</span>
                      <span>+{formatMoney(activePackage.passFee)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>Phí dịch vụ đổi pass:</span>
                      <span>Miễn phí 100%</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      Tổng thanh toán:
                    </span>
                    <span className="text-lg sm:text-xl font-black text-red-600 font-mono">
                      {formatMoney(activePackage.totalPrice)}
                    </span>
                  </div>
                  {selectedPackage === "perm" && (
                    <div className="mt-1 pt-1.5 border-t border-emerald-100 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Đặc quyền gói Lâu Dài:</strong> Bàn giao thông tin acc về chính chủ, sở hữu lâu dài.
                      </span>
                    </div>
                  )}
                  {selectedPackage === "30d" && (
                    <div className="mt-1 pt-1.5 border-t border-orange-100 text-[11px] text-orange-700 bg-orange-50/50 p-2 rounded-lg">
                      💡 <strong>Chính sách nâng cấp:</strong> Gói 30 ngày được hoàn 70% giá trị để nâng cấp lên Thuê Lâu Dài Vô Cực bất cứ lúc nào!
                    </div>
                  )}
                </div>

                {/* Agreement checkbox */}
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  <span>
                    Tôi đồng ý với quy định không sử dụng tool hack/AFK và chấp hành nội quy của Shop TFT.
                  </span>
                </label>

                {/* Big CTA Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  {isRented ? (
                    <button
                      onClick={handlePreOrderZalo}
                      className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 transition-all duration-300 font-gaming cursor-pointer shadow-orange-600/30 active:scale-[0.99]"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Đặt Lịch Thuê Trước Qua Zalo</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOrderZalo}
                      disabled={!isAgreed}
                      className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all duration-300 font-gaming cursor-pointer ${
                        isAgreed
                          ? "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99]"
                          : "bg-slate-300 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Thuê Ngay Qua Zalo (Bàn Giao 30s)</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                    <span>Hệ thống tự động 24/7</span>
                    <a
                      href={`tel:${PROFILE_INFO.phoneZalo.replace(/\./g, "")}`}
                      className="font-bold text-orange-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hotline: {PROFILE_INFO.phoneZalo}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. SECTION: Quy Trình Thuê & Bàn Giao Tự Động 30 Giây (GIỮ LẠI & TỐI ƯU UX) */}
        <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-gaming uppercase tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              <span>Quy Trình Thuê & Bàn Giao Tài Khoản Tự Động 30s</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bảo hiểm 30 Triệu Checkscam</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Chọn Gói & Gửi Zalo
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                Bấm nút <strong>Thuê Ngay</strong> để hệ thống tự động copy mã{" "}
                <strong className="text-orange-700">{account.code}</strong> và gửi qua Zalo Tuấn Thái Bình.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Bàn Giao Riot ID Sau 30s
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                Hệ thống gửi thông tin đăng nhập tài khoản tự động chỉ sau 30 giây thanh toán.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Đăng Nhập & Leo Rank
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                Đăng nhập Riot Client và trải nghiệm full Tướng Tí Nị & Sân Đấu Thần Thoại với bảo hành 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* 4. SECTION: Gợi Ý Tài Khoản Tương Tự (SMART SIMILARITY MATCHING) */}
        {relatedAccounts && relatedAccounts.length > 0 && (
          <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-2xl font-black text-slate-900 font-gaming uppercase tracking-tight">
                  TÀI KHOẢN TƯƠNG TỰ BẠN CÓ THỂ THÍCH
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Gợi ý các tài khoản cùng phân khúc Tướng Tí Nị, Sân Đấu và Rank gần nhất
                </p>
              </div>

              <Link
                href={account.type === "VIP" ? "/#tft-vip-shop" : "/#tft-clone-shop"}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 flex-shrink-0"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedAccounts.map((rel) => {
                const relUrl = getAccountProductUrl(rel);
                const relPrice =
                  rel.type === "CLONE"
                    ? Number(rel.price) || 150000
                    : rel.hourlyPrice || 15000;
                const relUnit =
                  rel.type === "CLONE"
                    ? " / ∞"
                    : rel.periodUnit || " / Giờ";

                return (
                  <Link
                    key={rel.id}
                    href={relUrl}
                    className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-3.5 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                        <LazyAccountImage
                          src={rel.thumbnail}
                          alt={rel.title}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 right-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-white">
                            {rel.code}
                          </span>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-white/95 text-[9px] font-extrabold uppercase text-slate-900 shadow-xs">
                            {rel.rank}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {rel.title}
                      </h4>

                      {/* Highlight Chibi / Feature */}
                      <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                        {rel.mainChibi ||
                          (rel.allChibi && rel.allChibi[0]) ||
                          (rel.features && rel.features[0]) ||
                          rel.rank}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-red-600 font-mono">
                        {formatMoney(relPrice)}
                        <span className="text-[10px] text-slate-500 font-normal">
                          {relUnit}
                        </span>
                      </span>
                      <span className="text-[10px] font-bold text-orange-600 group-hover:underline flex items-center gap-0.5">
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer */}
      <TFTFooter />

      {/* Lightbox Modal */}
      <TFTImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={account.thumbnail}
        code={account.code}
        rank={account.rank}
        status={account.status}
        price={account.hourlyPrice || account.price}
        title={`${account.code} - ${account.title}`}
      />

      {/* Zalo Redirect Confirmation Modal ("Oki bae") */}
      <ZaloRedirectModal
        isOpen={!!zaloRedirectMessage}
        onClose={() => setZaloRedirectMessage(null)}
        orderMessage={zaloRedirectMessage || ""}
        zaloUrl={PROFILE_INFO.zaloUrl}
      />

      {/* Sticky Bottom Action Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-4 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[140px]">
            {isRented
              ? "Trạng thái:"
              : isClone
              ? `${account.code} - Full Sở Hữu:`
              : `${account.code} - Gói ${activePackage.name}:`}
          </span>
          <span className="text-base font-black text-red-600 font-mono">
            {isRented ? "Đang có khách" : formatMoney(activePackage.totalPrice)}
          </span>
        </div>

        {isRented ? (
          <button
            onClick={handlePreOrderZalo}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-600/20 font-gaming cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Đặt Lịch Thuê</span>
          </button>
        ) : (
          <button
            onClick={handleOrderZalo}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-600/20 font-gaming cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isClone ? "Nhận Acc Zalo" : "Thuê Qua Zalo"}</span>
          </button>
        )}
      </div>
    </main>
  );
}
