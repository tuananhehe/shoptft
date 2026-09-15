"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { TFTRentalAccount, PROFILE_INFO } from "@/data/tft-data";
import { formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { getHomepageConfig, PricingConfig } from "@/utils/homepage-service";
import { getAccountProductUrl } from "@/utils/account-lookup";
import { copyToClipboard, buildZaloOrderUrl } from "@/utils/clipboard-helper";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { ZaloRedirectModal } from "@/components/zalo-redirect-modal";
import toast from "react-hot-toast";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Clock,
  KeyRound,
  Zap,
  Lock,
  BellRing,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
} from "lucide-react";

interface TFTAccountModalProps {
  account: TFTRentalAccount | null;
  onClose: () => void;
}

type PackageKey = "2h" | "7d" | "30d" | "perm";

export const TFTAccountModal: React.FC<TFTAccountModalProps> = ({ account, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("perm");
  const [isAgreed, setIsAgreed] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAllChibis, setShowAllChibis] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [zaloRedirectMessage, setZaloRedirectMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pricingRates, setPricingRates] = useState<PricingConfig>({
    passChangeFee: 20000,
    rate2Hours: 3,
    rate7Days: 12,
    rate30Days: 30,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    if (account) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [account]);

  // Đóng bằng phím ESC
  useEffect(() => {
    if (!account) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [account, onClose]);

  useEffect(() => {
    getHomepageConfig().then((cfg) => {
      if (cfg?.pricing) {
        setPricingRates(cfg.pricing);
      }
    });
  }, []);

  useEffect(() => {
    setSelectedPackage("perm");
    setIsAgreed(true);
    setShowAllChibis(false);

    if (account?.status === "RENTED") {
      const info = formatRentalExpiry(account.rentedUntil);
      setCountdownSeconds(info ? info.remainingSec : 0);
    }
  }, [account]);

  useEffect(() => {
    if (!account || account.status !== "RENTED") return;

    const updateTimer = () => {
      const info = formatRentalExpiry(account.rentedUntil);
      setCountdownSeconds(info ? info.remainingSec : 0);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [account]);

  if (!account) return null;

  const isRented = account.status === "RENTED";
  const rentalInfo = formatRentalExpiry(account.rentedUntil);

  const days = Math.floor(countdownSeconds / (24 * 3600));
  const hours = Math.floor((countdownSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const isInfinite = days > 365 || (rentalInfo ? rentalInfo.isInfinite : false);

  const baseAccountValue =
    Number(account.accountValue) ||
    (account.dailyPrice ? Number(account.dailyPrice) * 16 : 0) ||
    (account.hourlyPrice ? Number(account.hourlyPrice) * 50 : 0) ||
    850000;

  const roundToThousand = (val: number) => {
    if (isNaN(val) || !val) return 0;
    return Math.round(val / 1000) * 1000;
  };
  const formatMoney = (val: number) => `${roundToThousand(val).toLocaleString("vi-VN")}đ`;

  const rate2h = (pricingRates.rate2Hours || 3) / 100;
  const rate7d = (pricingRates.rate7Days || 12) / 100;
  const rate30d = (pricingRates.rate30Days || 30) / 100;
  const passFee = pricingRates.passChangeFee ?? 20000;

  const packageConfigs: Record<
    PackageKey,
    {
      id: PackageKey;
      name: string;
      sub: string;
      totalPrice: number;
      basePrice: number;
      passFee: number;
      tag?: string;
    }
  > = {
    "2h": {
      id: "2h",
      name: "2 Giờ",
      sub: "Trải nghiệm nhanh",
      basePrice: roundToThousand(baseAccountValue * rate2h),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate2h) + passFee,
      tag: "Phổ biến",
    },
    "7d": {
      id: "7d",
      name: "7 Ngày",
      sub: "Tiết kiệm 45%",
      basePrice: roundToThousand(baseAccountValue * rate7d),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate7d) + passFee,
      tag: "Tiết kiệm",
    },
    "30d": {
      id: "30d",
      name: "30 Ngày",
      sub: "Free đổi pass",
      basePrice: roundToThousand(baseAccountValue * rate30d),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue * rate30d),
      tag: "Hot nhất",
    },
    "perm": {
      id: "perm",
      name: "Lâu Dài (∞)",
      sub: "Bàn giao về chính chủ",
      basePrice: roundToThousand(baseAccountValue),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue),
      tag: "Chính chủ",
    },
  };

  const activePkg = packageConfigs[selectedPackage];
  const canSubmit = isAgreed && !isRented;

  const copyAccCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(account.code).catch(() => {});
    }
    setCopiedCode(true);
    toast.success(`Đã sao chép mã tài khoản: ${account.code}!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyAccountLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${getAccountProductUrl(account)}`;
      navigator.clipboard.writeText(url).catch(() => {});
      toast.success("Đã sao chép đường link riêng của acc!", { icon: "🔗" });
    }
  };

  const handleOrderZalo = async () => {
    if (!isAgreed) {
      toast.error("Vui lòng tích đồng ý với quy định thuê!");
      return;
    }

    const upgradeNote =
      selectedPackage === "30d"
        ? "\n*Ghi chú: Đơn này được áp dụng chính sách bù 70% để nâng cấp lên Thuê Lâu Dài trong quá trình sử dụng.*"
        : "";

    const linkUrl = typeof window !== "undefined" ? `${window.location.origin}${getAccountProductUrl(account)}` : "";

    const orderMessage = `Chào Tuấn Thái Bình, mình muốn thuê tài khoản ${account.code} (${account.title}) - Gói ${activePkg.name} (${formatMoney(activePkg.totalPrice)}). Link acc: ${linkUrl}${upgradeNote}`;

    await copyToClipboard(orderMessage);
    setZaloRedirectMessage(orderMessage);
  };

  const handlePreOrderZalo = async () => {
    const linkUrl = typeof window !== "undefined" ? `${window.location.origin}${getAccountProductUrl(account)}` : "";
    const preOrderMessage = `Chào Tuấn Thái Bình, mình muốn ĐẶT TRƯỚC tài khoản ${account.code} (${account.title}) khi hết giờ thuê. Link: ${linkUrl}`;

    await copyToClipboard(preOrderMessage);
    setZaloRedirectMessage(preOrderMessage);
  };

  const allChibis = account.allChibi || [account.mainChibi || "Tí Nị Thần Thoại"];
  const allArenas = account.allArenas || [account.mainArena || "Sân Đấu Thần Thoại"];
  const displayChibis = showAllChibis ? allChibis : allChibis.slice(0, 4);
  const directPageUrl = getAccountProductUrl(account);

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs sm:backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border-t sm:border border-slate-200 w-full sm:max-w-xl md:max-w-2xl rounded-t-[24px] sm:rounded-3xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] sm:max-h-[88vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Indicator for Mobile */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden bg-slate-50">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* 1. Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyAccCode}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100/90 border border-orange-200 text-orange-800 font-mono font-bold text-[11px] active:scale-95 transition-transform cursor-pointer"
              title="Bấm để sao chép mã"
            >
              <span>{account.code}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>

            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase bg-slate-200/80 text-slate-800">
              {account.rank}
            </span>

            {!isRented ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>SẴN SÀNG</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                <span>ĐANG THUÊ</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copyAccountLink}
              title="Sao chép link riêng"
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-orange-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Chép link</span>
            </button>

            <Link
              href={directPageUrl}
              target="_blank"
              title="Mở trang riêng acc này"
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-orange-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang riêng</span>
            </Link>

            <button
              onClick={onClose}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold shadow-xs transition-colors cursor-pointer flex-shrink-0 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-900 flex-1 overscroll-contain">
          {/* COMPACT HERO CARD: Thumbnail + Title + Specs gọn gàng */}
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs relative">
              <LazyAccountImage
                src={account.thumbnail}
                alt={`Acc ${account.code}`}
                containerClassName="w-full h-full"
                priority
              />
              <span className="absolute bottom-1 left-1 px-1 py-0.2 bg-black/80 text-[8px] sm:text-[9px] font-bold text-white rounded">
                VIP
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                {account.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium line-clamp-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-600 flex-shrink-0" />
                <span className="truncate">{account.mainChibi}</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                <span>🏟️</span>
                <span className="truncate">{account.mainArena}</span>
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {allChibis.length} Tí Nị
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {allArenas.length} Sân Đấu
                </span>
              </div>
            </div>
          </div>

          {/* INVENTORY BADGE CHIPS (Gọn gàng, có nút xem thêm) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Tướng Tí Nị & Sân Đấu Trong Acc:</span>
              </span>
              {allChibis.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllChibis(!showAllChibis)}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{showAllChibis ? "Thu gọn" : `+${allChibis.length - 4} xem thêm`}</span>
                  {showAllChibis ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {displayChibis.map((chibi, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50/80 border border-orange-200/80 text-orange-900 text-[11px] font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{chibi}</span>
                </span>
              ))}
              {allArenas.map((arena, idx) => (
                <span
                  key={`arena-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium"
                >
                  <span>🏟️</span>
                  <span className="truncate max-w-[200px]">{arena}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TRƯỜNG HỢP 1: ACC ĐANG ĐƯỢC THUÊ (COUNTDOWN GỌN GÀNG) */}
          {/* ============================================================ */}
          {isRented ? (
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-rose-800 font-bold text-xs sm:text-sm">
                <Lock className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>TÀI KHOẢN ĐANG CÓ KHÁCH THUÊ</span>
              </div>

              {isInfinite ? (
                <div className="py-2 px-3 bg-white border border-rose-200 rounded-xl font-mono text-sm font-bold text-rose-700">
                  ∞ Thuê Lâu Dài (Vô Cực)
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 sm:gap-2 font-mono">
                  {days > 0 && (
                    <>
                      <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                        <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(days)}</span>
                        <span className="text-[9px] text-slate-500 font-bold block">Ngày</span>
                      </div>
                      <span className="font-bold text-rose-400">:</span>
                    </>
                  )}
                  <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                    <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(hours)}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Giờ</span>
                  </div>
                  <span className="font-bold text-rose-400">:</span>
                  <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                    <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(minutes)}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Phút</span>
                  </div>
                  <span className="font-bold text-rose-400">:</span>
                  <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                    <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(seconds)}</span>
                    <span className="text-[9px] text-slate-500 font-bold block">Giây</span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-600">
                {rentalInfo?.expiryFormatted ? `Dự kiến trả acc: ${rentalInfo.expiryFormatted}. ` : ""}
                Bạn có thể đặt trước để ưu tiên nhận tài khoản ngay khi trống!
              </p>
            </div>
          ) : (
            /* ============================================================ */
            /* TRƯỜNG HỢP 2: ACC CÓ SẴN -> BẢNG CHỌN GÓI 2x2 CỰC GỌN */
            /* ============================================================ */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Chọn Gói Thời Gian Thuê:</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Bấm để đổi gói</span>
              </div>

              {/* GRID 2x2 COMPACT PACKAGE CARDS */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {(Object.keys(packageConfigs) as PackageKey[]).map((key) => {
                  const pkg = packageConfigs[key];
                  const isSelected = selectedPackage === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPackage(key)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/90 border-orange-600 text-slate-900 shadow-sm ring-2 ring-orange-500/20"
                          : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      {pkg.tag && (
                        <span
                          className={`absolute top-1.5 right-1.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {pkg.tag}
                        </span>
                      )}

                      <div className="font-bold text-xs sm:text-sm text-slate-900 pr-10">
                        {pkg.name}
                      </div>

                      <div className="font-black font-mono text-red-600 text-xs sm:text-sm mt-0.5">
                        {formatMoney(pkg.totalPrice)}
                      </div>

                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {pkg.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CHI TIẾT BÓC TÁCH GIÁ GỌN GÀNG */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Tiền thuê gốc ({activePkg.name}):</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(activePkg.basePrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí đổi pass hoàn trả:</span>
                  <span className={`font-mono font-bold ${activePkg.passFee > 0 ? "text-orange-700" : "text-emerald-700"}`}>
                    {activePkg.passFee > 0 ? `+${formatMoney(activePkg.passFee)}` : "Miễn phí (0đ)"}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>Tổng thanh toán:</span>
                  <span className="font-mono font-black text-red-600 text-sm">{formatMoney(activePkg.totalPrice)}</span>
                </div>
              </div>

              {/* GỢI Ý NÂNG CẤP HOẶC ĐẶC QUYỀN LÂU DÀI */}
              {selectedPackage === "perm" ? (
                <div className="flex items-start gap-1.5 px-3 py-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Đặc quyền gói Lâu Dài:</strong> Bàn giao thông tin acc về chính chủ, sở hữu lâu dài.
                  </span>
                </div>
              ) : selectedPackage === "30d" ? (
                <div className="flex items-start gap-1.5 px-3 py-2 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900">
                  <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Đặc quyền gói 30 ngày:</strong> Thuê gói 30 ngày chỉ cần bù thêm 70% để nâng cấp lên Thuê Lâu Dài bất cứ lúc nào.
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* CHECKBOX CAM KẾT */}
          {!isRented && (
            <label className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-orange-50/60 border border-orange-200/70 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600 flex-shrink-0"
              />
              <span className="text-slate-700 font-medium leading-tight">
                Cam kết không hack / phá rank & đồng ý điều khoản shop.
              </span>
            </label>
          )}
        </div>

        {/* 3. Sticky Action Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {isRented ? "Trạng thái:" : "Thanh toán:"}
            </span>
            <span className="font-black font-mono text-sm sm:text-base text-red-600 leading-tight">
              {isRented ? "Đang có khách" : formatMoney(activePkg.totalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {isRented ? (
              <button
                onClick={handlePreOrderZalo}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Đặt Lịch Thuê</span>
              </button>
            ) : (
              <button
                onClick={handleOrderZalo}
                disabled={!canSubmit}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  canSubmit
                    ? "bg-orange-700 hover:bg-orange-800 text-white shadow-md shadow-orange-700/20"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Nhận Acc Zalo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Zalo Redirect Modal with Oki Bae */}
      <ZaloRedirectModal
        isOpen={!!zaloRedirectMessage}
        onClose={() => setZaloRedirectMessage(null)}
        orderMessage={zaloRedirectMessage || ""}
        zaloUrl={PROFILE_INFO.zaloUrl}
      />
    </div>
  );

  if (mounted && typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

