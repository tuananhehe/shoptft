"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { TFTRentalAccount, PROFILE_INFO } from "@/data/tft-data";
import { formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { getHomepageConfig, PricingConfig } from "@/utils/homepage-service";
import { getAccountProductUrl } from "@/utils/account-lookup";
import { copyToClipboard } from "@/utils/clipboard-helper";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { ZaloRedirectModal } from "@/components/zalo-redirect-modal";
import toast from "react-hot-toast";
import {
  X,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Clock,
  Lock,
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
    }
  > = {
    "2h": {
      id: "2h",
      name: "2 Giờ",
      sub: "Trải nghiệm nhanh",
      basePrice: roundToThousand(baseAccountValue * rate2h),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate2h) + passFee,
    },
    "7d": {
      id: "7d",
      name: "7 Ngày",
      sub: "Tiết kiệm chi phí",
      basePrice: roundToThousand(baseAccountValue * rate7d),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate7d) + passFee,
    },
    "30d": {
      id: "30d",
      name: "30 Ngày",
      sub: "Hỗ trợ đổi pass",
      basePrice: roundToThousand(baseAccountValue * rate30d),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue * rate30d),
    },
    perm: {
      id: "perm",
      name: "Lâu Dài (∞)",
      sub: "Bàn giao tài khoản sử dụng lâu dài",
      basePrice: roundToThousand(baseAccountValue),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue),
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
      toast.success("Đã sao chép đường link của tài khoản!", { icon: "🔗" });
    }
  };

  const handleOrderZalo = async () => {
    if (!isAgreed) {
      toast.error("Vui lòng tích đồng ý với quy định dịch vụ!");
      return;
    }

    const upgradeNote =
      selectedPackage === "30d"
        ? "\n*Ghi chú: Khách muốn tìm hiểu chính sách bù phí nâng cấp lên gói Lâu Dài.*"
        : "";

    const linkUrl = typeof window !== "undefined" ? `${window.location.origin}${getAccountProductUrl(account)}` : "";

    const orderMessage = `Chào Tuấn Thái Bình, mình muốn thuê tài khoản ${account.code} (${account.title}) - Gói ${activePkg.name} (Tổng giá thuê: ${formatMoney(activePkg.totalPrice)}). Link acc: ${linkUrl}${upgradeNote}`;

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
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f11] text-white border-t sm:border border-white/[0.12] w-full sm:max-w-xl md:max-w-2xl rounded-t-[24px] sm:rounded-3xl overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[86vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Indicator for Mobile */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden bg-[#0f0f11]">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* 1. Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#141416] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyAccCode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-mono font-medium text-xs transition-colors cursor-pointer"
              title="Bấm để sao chép mã"
            >
              <span>{account.code}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            </button>

            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold uppercase bg-white/[0.05] border border-white/10 text-zinc-300 font-mono">
              {account.rank}
            </span>

            {!isRented ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] sm:text-xs flex items-center gap-1.5 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CÒN ACC</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 font-semibold text-[10px] sm:text-xs flex items-center gap-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>ĐANG THUÊ</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copyAccountLink}
              title="Sao chép link riêng"
              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Chép link</span>
            </button>

            <Link
              href={directPageUrl}
              target="_blank"
              title="Mở trang riêng acc này"
              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang riêng</span>
            </Link>

            <button
              onClick={onClose}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* COMPACT PRODUCT CARD */}
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 bg-[#141416] border border-white/[0.08] rounded-2xl items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-black border border-white/10 relative">
              <LazyAccountImage
                src={account.thumbnail}
                alt={`Acc ${account.code}`}
                containerClassName="w-full h-full"
                priority
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/85 text-[9px] font-mono font-bold text-white rounded border border-white/10">
                VIP
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-white line-clamp-1">
                {account.title}
              </h3>
              <p className="text-xs text-zinc-400 font-normal line-clamp-1 flex items-center gap-1.5">
                <span className="text-zinc-500">Tí Nị:</span>
                <span className="truncate text-zinc-300">{account.mainChibi}</span>
              </p>
              <p className="text-xs text-zinc-400 font-normal line-clamp-1 flex items-center gap-1.5">
                <span className="text-zinc-500">Sân Đấu:</span>
                <span className="truncate text-zinc-300">{account.mainArena}</span>
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-medium text-zinc-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded">
                  {allChibis.length} Tí Nị
                </span>
                <span className="text-[10px] font-medium text-zinc-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded">
                  {allArenas.length} Sân Đấu
                </span>
              </div>
            </div>
          </div>

          {/* INVENTORY BADGE CHIPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>Linh Thú & Sân Đấu Trong Acc:</span>
              {allChibis.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllChibis(!showAllChibis)}
                  className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-0.5 cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-normal"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{chibi}</span>
                </span>
              ))}
              {allArenas.map((arena, idx) => (
                <span
                  key={`arena-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-normal"
                >
                  <span className="text-zinc-500 text-[11px]">Sân:</span>
                  <span className="truncate max-w-[200px]">{arena}</span>
                </span>
              ))}
            </div>
          </div>

          {/* TRƯỜNG HỢP 1: ACC ĐANG ĐƯỢC THUÊ */}
          {isRented ? (
            <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-zinc-300 font-semibold text-xs sm:text-sm">
                <Lock className="w-4 h-4 text-zinc-400" />
                <span>TÀI KHOẢN ĐANG CÓ KHÁCH THUÊ</span>
              </div>

              {isInfinite ? (
                <div className="py-2.5 px-3 bg-white/[0.04] border border-white/10 rounded-xl font-mono text-sm font-semibold text-zinc-300">
                  ∞ Thuê Lâu Dài
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-mono">
                  {days > 0 && (
                    <>
                      <div className="bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[50px]">
                        <span className="text-base sm:text-lg font-bold text-white block leading-tight">{pad(days)}</span>
                        <span className="text-[9px] text-zinc-500 block">Ngày</span>
                      </div>
                      <span className="font-bold text-zinc-600">:</span>
                    </>
                  )}
                  <div className="bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[50px]">
                    <span className="text-base sm:text-lg font-bold text-white block leading-tight">{pad(hours)}</span>
                    <span className="text-[9px] text-zinc-500 block">Giờ</span>
                  </div>
                  <span className="font-bold text-zinc-600">:</span>
                  <div className="bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[50px]">
                    <span className="text-base sm:text-lg font-bold text-white block leading-tight">{pad(minutes)}</span>
                    <span className="text-[9px] text-zinc-500 block">Phút</span>
                  </div>
                  <span className="font-bold text-zinc-600">:</span>
                  <div className="bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[50px]">
                    <span className="text-base sm:text-lg font-bold text-white block leading-tight">{pad(seconds)}</span>
                    <span className="text-[9px] text-zinc-500 block">Giây</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-zinc-400">
                {rentalInfo?.expiryFormatted ? `Dự kiến trả acc: ${rentalInfo.expiryFormatted}. ` : ""}
                Bạn có thể liên hệ Zalo để đặt trước khi tài khoản được hoàn trả.
              </p>
            </div>
          ) : (
            /* TRƯỜNG HỢP 2: ACC CÒN ACC -> BẢNG CHỌN GÓI THUÊ */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Chọn Gói Thời Gian Thuê:</span>
                </span>
                <span className="text-[11px] text-zinc-500">Bấm để đổi gói</span>
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
                          ? "bg-white/[0.08] border-white text-white shadow-lg"
                          : "bg-[#141416] border-white/[0.08] text-zinc-300 hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="font-heading font-bold text-xs sm:text-sm text-white">
                        {pkg.name}
                      </div>

                      <div className="font-mono font-bold text-white text-xs sm:text-sm mt-0.5">
                        {formatMoney(pkg.totalPrice)}
                      </div>

                      <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                        {pkg.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CHI TIẾT BÓC TÁCH GIÁ */}
              <div className="p-3 bg-[#141416] border border-white/[0.08] rounded-xl space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Tiền thuê gốc ({activePkg.name}):</span>
                  <span className="font-mono font-medium text-white">{formatMoney(activePkg.basePrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí đổi mật khẩu hoàn trả:</span>
                  <span className={`font-mono font-medium ${activePkg.passFee > 0 ? "text-zinc-300" : "text-emerald-400"}`}>
                    {activePkg.passFee > 0 ? `+${formatMoney(activePkg.passFee)}` : "Miễn phí (0đ)"}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between font-bold text-white text-xs sm:text-sm">
                  <span>Tổng giá thuê:</span>
                  <span className="font-mono font-bold text-white text-sm sm:text-base">{formatMoney(activePkg.totalPrice)}</span>
                </div>
              </div>

              {/* GHI CHÚ GÓI */}
              {selectedPackage === "perm" ? (
                <div className="flex items-start gap-2 p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-zinc-200">Gói Lâu Dài:</strong> Bàn giao thông tin tài khoản và hỗ trợ cài đặt, sử dụng lâu dài.
                  </span>
                </div>
              ) : selectedPackage === "30d" ? (
                <div className="flex items-start gap-2 p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-zinc-400">
                  <Clock className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-zinc-200">Gói 30 ngày:</strong> Hỗ trợ đổi mật khẩu định kỳ và tư vấn nâng cấp gói nếu cần.
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* CHECKBOX CAM KẾT */}
          {!isRented && (
            <label className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#141416] border border-white/[0.08] cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black text-white focus:ring-0 cursor-pointer accent-white flex-shrink-0"
              />
              <span className="text-zinc-300 font-normal leading-tight">
                Cam kết không sử dụng phần mềm thứ ba & đồng ý điều khoản dịch vụ của shop.
              </span>
            </label>
          )}
        </div>

        {/* 3. Sticky Action Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#141416] border-t border-white/[0.08] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              {isRented ? "Trạng thái:" : "Tổng giá thuê:"}
            </span>
            <span className="font-heading font-bold text-sm sm:text-base text-white leading-tight">
              {isRented ? "Đang có khách" : formatMoney(activePkg.totalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border border-white/10 rounded-xl font-medium text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {isRented ? (
              <button
                onClick={handlePreOrderZalo}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-[#09090b] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Liên Hệ Zalo Đặt Trước</span>
              </button>
            ) : (
              <button
                onClick={handleOrderZalo}
                disabled={!canSubmit}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  canSubmit
                    ? "bg-white hover:bg-zinc-200 text-[#09090b] shadow-md"
                    : "bg-white/10 text-zinc-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Thuê Qua Zalo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Zalo Redirect Modal */}
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
