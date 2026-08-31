"use client";

import React, { useState, useEffect } from "react";
import { TFTRentalAccount, PROFILE_INFO } from "@/data/tft-data";
import { formatRentalExpiry } from "@/utils/supabase/accounts-service";
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
  AlertTriangle,
  Flame,
  Crown,
  Lock,
  BellRing,
  Hourglass,
  Info,
} from "lucide-react";

interface TFTAccountModalProps {
  account: TFTRentalAccount | null;
  onClose: () => void;
}

type PackageKey = "2h" | "7d" | "30d" | "perm";

export const TFTAccountModal: React.FC<TFTAccountModalProps> = ({ account, onClose }) => {
  // State chọn gói và cam kết
  const [selectedPackage, setSelectedPackage] = useState<PackageKey | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Bộ đếm ngược thời gian cho acc đang thuê (tính bằng giây chuẩn từ Database)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  useEffect(() => {
    // Reset gói và cam kết khi mở acc mới
    setSelectedPackage(null);
    setIsAgreed(false);

    if (account?.status === "RENTED") {
      const info = formatRentalExpiry(account.rentedUntil);
      setCountdownSeconds(info ? info.remainingSec : 0);
    }
  }, [account]);

  // Hook đếm lùi từng giây theo thời gian thực chuẩn Database
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

  // Định dạng ngày:giờ:phút:giây
  const days = Math.floor(countdownSeconds / (24 * 3600));
  const hours = Math.floor((countdownSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const isInfinite = days > 365 || (rentalInfo ? rentalInfo.isInfinite : false);

  // Giá trị gốc của tài khoản (Luôn đảm bảo là số hợp lệ)
  const baseAccountValue =
    Number(account.accountValue) ||
    (account.dailyPrice ? Number(account.dailyPrice) * 16 : 0) ||
    (account.hourlyPrice ? Number(account.hourlyPrice) * 50 : 0) ||
    850000;

  // Hàm làm tròn tiền đến hàng nghìn
  const roundToThousand = (val: number) => {
    if (isNaN(val) || !val) return 0;
    return Math.round(val / 1000) * 1000;
  };
  const formatMoney = (val: number) => `${roundToThousand(val).toLocaleString("vi-VN")}đ`;

  // Cấu hình 4 gói thời gian thuê
  const packageConfigs: Record<PackageKey, {
    id: PackageKey;
    name: string;
    rate: number;
    basePrice: number;
    passFee: number;
    totalPrice: number;
    note: string;
    tag: string;
    badgeColor: string;
  }> = {
    "2h": {
      id: "2h",
      name: "2 Giờ Trải Nghiệm",
      rate: 0.03,
      basePrice: roundToThousand(baseAccountValue * 0.03),
      passFee: 20000,
      totalPrice: roundToThousand(baseAccountValue * 0.03) + 20000,
      note: "Đã gồm 20k phí đổi pass",
      tag: "Trải nghiệm nhanh",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
    "7d": {
      id: "7d",
      name: "Thuê 7 Ngày (1 Tuần)",
      rate: 0.12,
      basePrice: roundToThousand(baseAccountValue * 0.12),
      passFee: 20000,
      totalPrice: roundToThousand(baseAccountValue * 0.12) + 20000,
      note: "Đã gồm 20k phí đổi pass",
      tag: "Tiết kiệm 45%",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    "30d": {
      id: "30d",
      name: "Thuê 30 Ngày (1 Tháng)",
      rate: 0.30,
      basePrice: roundToThousand(baseAccountValue * 0.30),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue * 0.30),
      note: "Miễn phí đổi pass",
      tag: "Miễn phí đổi pass",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    "perm": {
      id: "perm",
      name: "Thuê Lâu Dài 999 Ngày",
      rate: 1.00,
      basePrice: roundToThousand(baseAccountValue),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue),
      note: "Bàn giao full thông tin cho khách",
      tag: "Bàn giao full thông tin cho khách",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    },
  };

  const activePkg = selectedPackage ? packageConfigs[selectedPackage] : null;
  const canSubmit = selectedPackage !== null && isAgreed;

  // Copy mã Acc riêng lẻ
  const copyAccCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(account.code).catch(() => {});
    }
    setCopiedCode(true);
    toast.success(`Đã sao chép mã tài khoản: ${account.code}!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Logic Xử Lý Bấm Nút "NHẬN ACC QUA ZALO" (Khi acc có sẵn)
  const handleOrderZalo = () => {
    if (!canSubmit || !activePkg) {
      toast.error("Vui lòng chọn gói thuê và đồng ý với điều khoản!");
      return;
    }

    const upgradeNote =
      selectedPackage === "30d"
        ? "\n*Ghi chú: Đơn này được áp dụng chính sách bù 70% để nâng cấp lên Thuê Lâu Dài trong quá trình sử dụng.*"
        : "";

    const orderMessage = `[ĐƠN ĐẶT ACC TFT]
- Mã Acc: ${account.code}
- Tên Acc: ${account.title}
- Thời hạn: ${activePkg.name}
- Tổng thanh toán: ${formatMoney(activePkg.totalPrice)}
Nhờ shop gửi STK và hỗ trợ bàn giao thông tin!${upgradeNote}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderMessage).catch(() => {});
    }

    toast.success("Đã sao chép nội dung đơn hàng! Hãy dán (Ctrl+V) vào Zalo với shop.");
    window.open(PROFILE_INFO.zaloUrl, "_blank");
  };

  // Logic Xử Lý Bấm Nút "ĐẶT LỊCH THUÊ SỚM QUA ZALO" (Khi acc đang có khách thuê)
  const handlePreOrderZalo = () => {
    const preOrderMessage = `[ĐẶT TRƯỚC ACC]
- Mã Acc: ${account.code}
- Tên Acc: ${account.title}
Báo mình khi acc này hết giờ thuê nhé!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(preOrderMessage).catch(() => {});
    }

    toast.success("Đã sao chép yêu cầu đặt trước! Hãy dán (Ctrl+V) vào Zalo để shop xếp lịch giữ acc cho bạn.");
    window.open(PROFILE_INFO.zaloUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 max-w-2xl w-full my-6 sm:my-8 rounded-3xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] shadow-2xl">
        {/* Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 w-full flex-shrink-0" />

        {/* 1. Header Bar */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 border border-orange-200 text-orange-800 font-mono font-bold text-xs">
                {account.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase bg-slate-200 text-slate-800">
                {account.rank}
              </span>
              {!isRented ? (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>SẴN SÀNG</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1.5 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                  <span>ĐANG CÓ KHÁCH THUÊ</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1.5">
              {account.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng modal"
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Scrollable Content - SPACING & WHITESPACE THOÁNG ĐÃNG */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-900 flex-1">
          {/* Main Account Image - Khung Vuông Chuẩn 1:1 Hiển Thị 100% Màu Gốc Ảnh Sáng Rõ */}
          <div className="relative aspect-square max-w-[320px] sm:max-w-[380px] mx-auto w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={account.thumbnail}
              alt={`Thuê acc TFT VIP ${account.code} - ${account.title} - Tuấn Thái Bình`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Specs Breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Tướng Tí Nị VIP</span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5 block">{(account.allChibi || []).length} Tướng</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Sân Đấu Thần Thoại</span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5 block">{(account.allArenas || []).length} Sân Đấu</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Bậc Rank</span>
              <span className="text-base sm:text-lg font-black text-orange-600 font-mono mt-0.5 block">{account.rank || "UNRANKED"}</span>
            </div>
          </div>

          {/* Detailed Inventory Lists - GIẢM BORDER, GỌN GÀNG */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Danh Sách Tướng Tí Nị Trong Acc:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {(account.allChibi || [account.mainChibi || "Tí Nị VIP"]).map((chibi, idx) => (
                  <li key={idx} className="bg-slate-50/90 p-3 rounded-xl flex items-center gap-2.5 text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{chibi}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Danh Sách Sân Đấu Thần Thoại:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {(account.allArenas || [account.mainArena || "Sân Đấu Thần Thoại"]).map((arena, idx) => (
                  <li key={idx} className="bg-slate-50/90 p-3 rounded-xl flex items-center gap-2.5 text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{arena}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TRƯỜNG HỢP 1: ACC ĐANG CÓ KHÁCH THUÊ -> HIỆN KHỐI COUNTDOWN */}
          {/* ============================================================ */}
          {isRented ? (
            <div className="bg-rose-50/80 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-sm border border-rose-200/80">
              <div className="flex items-center justify-center gap-2 text-rose-800 font-extrabold text-sm sm:text-base">
                <Lock className="w-5 h-5 text-rose-600 animate-pulse" />
                <span>TÀI KHOẢN ĐANG ĐƯỢC THUÊ</span>
              </div>

              {/* Countdown Timer dạng Thông Minh (Vô Cực / Ngày / Giờ / Phút / Giây) */}
              {isInfinite ? (
                <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-black text-rose-700 bg-white border border-rose-200/90 py-3 px-5 rounded-2xl shadow-inner font-mono">
                  <span>∞ Đang Cho Thuê Dài Hạn (Vô Cực)</span>
                </div>
              ) : days > 0 ? (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 font-mono">
                  <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                    <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(days)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Ngày</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">:</span>
                  <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                    <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(hours)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Giờ</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">:</span>
                  <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                    <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(minutes)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Phút</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">:</span>
                  <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                    <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(seconds)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Giây</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 sm:gap-3 font-mono">
                  <div className="bg-white border border-rose-200/90 px-3.5 py-2 rounded-2xl shadow-inner text-center min-w-[70px]">
                    <span className="text-2xl font-black text-rose-600 block leading-none">{pad(hours)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Giờ</span>
                  </div>
                  <span className="text-2xl font-black text-rose-400">:</span>
                  <div className="bg-white border border-rose-200/90 px-3.5 py-2 rounded-2xl shadow-inner text-center min-w-[70px]">
                    <span className="text-2xl font-black text-rose-600 block leading-none">{pad(minutes)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Phút</span>
                  </div>
                  <span className="text-2xl font-black text-rose-400">:</span>
                  <div className="bg-white border border-rose-200/90 px-3.5 py-2 rounded-2xl shadow-inner text-center min-w-[70px]">
                    <span className="text-2xl font-black text-rose-600 block leading-none">{pad(seconds)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Giây</span>
                  </div>
                </div>
              )}

              {/* Hiển thị thời điểm hết hạn cụ thể khớp với Admin */}
              {rentalInfo && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    {rentalInfo.isInfinite
                      ? "Thời hạn: Thuê Vô Cực (Không giới hạn)"
                      : `Hạn trả dự kiến: ${rentalInfo.expiryFormatted}`}
                  </span>
                </div>
              )}

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Dự kiến bàn giao cho lượt thuê tiếp theo sau khi hết thời gian đếm ngược. Bạn có thể đặt lịch trước để được ưu tiên nhận acc ngay khi trống!
              </p>
            </div>
          ) : (
            /* ============================================================ */
            /* TRƯỜNG HỢP 2: ACC CÓ SẴN -> CHỌN GÓI & THANH TOÁN (REFACTORED) */
            /* ============================================================ */
            <div className="space-y-6 pt-1">
              {/* 1. CHỌN GÓI THỜI GIAN THUÊ */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Chọn Gói Thời Gian Thuê:</span>
                  </h4>
                  
                  {!selectedPackage && (
                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                      👇 Vui lòng chọn 1 gói thời gian bên dưới
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Gói 1: 2 Giờ Trải Nghiệm */}
                  <button
                    type="button"
                    onClick={() => setSelectedPackage("2h")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPackage === "2h"
                        ? "bg-orange-50/80 border-orange-600 text-slate-900 shadow-md ring-4 ring-orange-500/10"
                        : "bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {packageConfigs["2h"].name}
                      </span>
                      <span className="font-black font-mono text-red-600 text-base">
                        {formatMoney(packageConfigs["2h"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                      <span className="text-slate-500 font-medium">{packageConfigs["2h"].note}</span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        3% + 20k
                      </span>
                    </div>
                  </button>

                  {/* Gói 2: Thuê 7 Ngày (1 Tuần) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPackage("7d")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPackage === "7d"
                        ? "bg-orange-50/80 border-orange-600 text-slate-900 shadow-md ring-4 ring-orange-500/10"
                        : "bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {packageConfigs["7d"].name}
                      </span>
                      <span className="font-black font-mono text-red-600 text-base">
                        {formatMoney(packageConfigs["7d"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                      <span className="text-slate-500 font-medium">{packageConfigs["7d"].note}</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        12% + 20k
                      </span>
                    </div>
                  </button>

                  {/* Gói 3: Thuê 30 Ngày (1 Tháng) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPackage("30d")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPackage === "30d"
                        ? "bg-orange-50/80 border-orange-600 text-slate-900 shadow-md ring-4 ring-orange-500/10"
                        : "bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {packageConfigs["30d"].name}
                      </span>
                      <span className="font-black font-mono text-red-600 text-base">
                        {formatMoney(packageConfigs["30d"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                      <span className="text-emerald-700 font-semibold">{packageConfigs["30d"].note}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        30% Giá Acc
                      </span>
                    </div>
                  </button>

                  {/* Gói 4: Thuê Lâu Dài 999 Ngày */}
                  <button
                    type="button"
                    onClick={() => setSelectedPackage("perm")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPackage === "perm"
                        ? "bg-orange-50/80 border-orange-600 text-slate-900 shadow-md ring-4 ring-orange-500/10"
                        : "bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {packageConfigs["perm"].name}
                      </span>
                      <span className="font-black font-mono text-red-600 text-base">
                        {formatMoney(packageConfigs["perm"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                      <span className="text-purple-700 font-semibold">{packageConfigs["perm"].note}</span>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        100% Lâu Dài
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. ĐẶC QUYỀN NÂNG CẤP - THẺ KHÔNG VIỀN, NỀN XANH CỰC NHẠT (REDUCED BORDERS) */}
              <div className="bg-blue-50/60 rounded-2xl p-4 sm:p-5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Đặc quyền nâng cấp (Rent-to-Own):</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Bạn có thể bù phần % chênh lệch để nâng cấp lên gói Thuê Lâu Dài bất cứ lúc nào trong thời gian đang thuê (và tối đa 24h sau khi hết hạn). Ví dụ: Đã thuê gói 30 ngày (30%), bạn chỉ cần bù thêm 70% là được bàn giao full thông tin sở hữu acc.
                </p>
              </div>

              {/* 3. ĐIỂM CHẠM CHÍNH: TỔNG THANH TOÁN (FOCAL POINT NỔI BẬT) */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 border-2 border-orange-500/30 rounded-3xl space-y-4 shadow-sm">
                {activePkg ? (
                  <>
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">
                          TỔNG THANH TOÁN:
                        </span>
                        <span className="text-sm sm:text-base text-slate-900 font-extrabold mt-0.5 block">
                          {activePkg.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono tracking-tight block">
                          {formatMoney(activePkg.totalPrice)}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                          ✓ Đã làm tròn đến hàng nghìn
                        </span>
                      </div>
                    </div>

                    {/* Bóc tách phí rõ ràng, thoáng đãng */}
                    <div className="pt-3.5 border-t border-orange-100/90 text-sm space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tiền thuê gốc:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatMoney(activePkg.basePrice)}
                        </span>
                      </div>

                      {activePkg.passFee > 0 ? (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Phí hoàn trả acc (phí đổi pass):</span>
                          <span className="font-mono font-bold text-orange-700">
                            +{formatMoney(activePkg.passFee)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-emerald-700 font-medium">
                          <span>Phí hoàn trả acc (phí đổi pass):</span>
                          <span className="font-bold text-emerald-800">Miễn phí (0đ)</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-3 space-y-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">
                      TỔNG THANH TOÁN:
                    </span>
                    <p className="text-base font-bold text-orange-700">
                      Vui lòng chọn 1 gói thời gian thuê ở trên
                    </p>
                  </div>
                )}

                {/* Mã định danh tài khoản */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                  <span>Mã định danh tài khoản:</span>
                  <button
                    type="button"
                    onClick={copyAccCode}
                    className="text-slate-800 hover:text-orange-700 font-mono font-bold flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedCode ? "Đã copy" : account.code}</span>
                  </button>
                </div>
              </div>

              {/* 4. CHECKBOX ĐỒNG Ý - TÁCH BIỆT, DỄ BẤM (SPACED OUT) */}
              <label className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-orange-50/50 hover:bg-orange-50/80 border border-orange-200/70 cursor-pointer text-sm select-none transition-colors shadow-xs">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 text-orange-600 rounded-lg border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600 flex-shrink-0"
                />
                <span className="text-slate-700 font-medium leading-relaxed">
                  Tôi đã đọc và cam kết không sử dụng phần mềm thứ 3 / phá rank, đồng ý với quy định thuê của Shop Tuấn Thái Bình.
                </span>
              </label>

              {/* 5. QUY TRÌNH THUÊ TÀI KHOẢN - THẺ KHÔNG VIỀN, NỀN XÁM NHẠT (REDUCED BORDERS) */}
              <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl text-sm space-y-1.5">
                <div className="font-bold flex items-center gap-2 text-slate-800">
                  <Info className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Quy trình thuê tài khoản:</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Sau khi chọn gói và tích cam kết, bấm nút &ldquo;Nhận Acc Qua Zalo&rdquo;. Hệ thống sẽ tự động sao chép cú pháp để bạn dán (Ctrl+V) vào Zalo shop, shop sẽ gửi STK và giao acc siêu tốc trong 30 giây!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Modal Action Footer */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Quỹ bảo hiểm 30.000.000đ Checkscam.vn bảo chứng</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors w-1/2 sm:w-auto shadow-xs cursor-pointer"
            >
              Đóng
            </button>

            {/* NÚT HÀNH ĐỘNG PHÂN BIỆT RÕ: CÓ SẴN VS ĐANG THUÊ */}
            {isRented ? (
              <button
                onClick={handlePreOrderZalo}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 active:from-orange-800 active:to-rose-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 w-1/2 sm:w-auto hover:scale-105 shadow-orange-600/20 cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>Đặt Lịch Thuê Sớm Qua Zalo</span>
              </button>
            ) : (
              <button
                onClick={handleOrderZalo}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-1/2 sm:w-auto cursor-pointer ${
                  canSubmit
                    ? "bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white shadow-md hover:scale-105 shadow-orange-700/20"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-500 border border-slate-300 shadow-xs"
                }`}
              >
                {!canSubmit && <Lock className="w-3.5 h-3.5" />}
                {canSubmit && <MessageCircle className="w-4 h-4" />}
                <span>Nhận Acc Qua Zalo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
