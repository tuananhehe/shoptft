"use client";

import React, { useState, useEffect } from "react";
import { TFTRentalAccount, PROFILE_INFO } from "@/data/tft-data";
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

  // Bộ đếm ngược thời gian cho acc đang thuê (tính bằng giây)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(7890); // ~ 2h 11m 30s

  useEffect(() => {
    // Reset gói và cam kết khi mở acc mới
    setSelectedPackage(null);
    setIsAgreed(false);

    // Tính thời gian đếm ngược giả lập dựa theo mã acc (1h - 4h)
    if (account) {
      const seed = account.code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const initialSeconds = (seed % 10800) + 3600; // từ 1h đến 4h
      setCountdownSeconds(initialSeconds);
    }
  }, [account]);

  // Hook đếm lùi từng giây
  useEffect(() => {
    if (!account || account.status !== "RENTED") return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [account]);

  if (!account) return null;

  const isRented = account.status === "RENTED";

  // Định dạng giờ:phút:giây
  const hours = Math.floor(countdownSeconds / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Giá trị gốc của tài khoản
  const baseAccountValue = account.accountValue || account.dailyPrice * 16 || 850000;

  // Hàm làm tròn tiền đến hàng nghìn
  const roundToThousand = (val: number) => Math.round(val / 1000) * 1000;
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
      badgeColor: "bg-blue-100 text-blue-700",
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
      badgeColor: "bg-amber-100 text-amber-700",
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
      badgeColor: "bg-emerald-100 text-emerald-700",
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
      badgeColor: "bg-purple-100 text-purple-700",
    },
  };

  const activePkg = selectedPackage ? packageConfigs[selectedPackage] : null;
  const canSubmit = selectedPackage !== null && isAgreed;

  // Copy mã Acc riêng lẻ
  const copyAccCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopiedCode(true);
    toast.success(`✅ Đã sao chép mã tài khoản: ${account.code}!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Logic Xử Lý Bấm Nút "NHẬN ACC QUA ZALO" (Khi acc có sẵn)
  const handleOrderZalo = () => {
    if (!canSubmit || !activePkg) {
      toast.error("⚠️ Vui lòng chọn gói thuê và đồng ý với điều khoản!");
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

    toast.success("✅ Đã sao chép nội dung đơn hàng! Hãy dán (Ctrl+V) vào Zalo với shop.");
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

    toast.success("✅ Đã sao chép yêu cầu đặt trước! Hãy dán (Ctrl+V) vào Zalo để shop xếp lịch giữ acc cho bạn.");
    window.open(PROFILE_INFO.zaloUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-2xl w-full my-8 rounded-2xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] shadow-2xl">
        {/* Top Accent Line */}
        <div className="h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

        {/* Header Bar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-100 border border-orange-200 text-orange-700 font-mono font-bold text-xs">
                {account.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                {account.rank}
              </span>
              {!isRented ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>🟢 SẴN SÀNG</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                  <span>🔴 ĐANG CÓ KHÁCH THUÊ</span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
              {account.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {/* Main Account Image */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={account.thumbnail}
              alt={`Thuê acc TFT VIP ${account.code} - ${account.title} - Tuấn Thái Bình`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <div className="text-white">
                <span className="text-xs text-orange-400 font-bold block">{account.mainChibi}</span>
                <span className="text-sm font-semibold">{account.mainArena}</span>
              </div>
            </div>
          </div>

          {/* Key Specs Breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tướng Tí Nị VIP</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{account.allChibi.length} Tướng</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sân Đấu Thần Thoại</span>
              <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{account.allArenas.length} Sân Đấu</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bậc Rank</span>
              <span className="text-base font-bold text-orange-600 font-mono mt-0.5 block">{account.rank}</span>
            </div>
          </div>

          {/* Detailed Inventory Lists */}
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Danh Sách Tướng Tí Nị Trong Acc:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {account.allChibi.map((chibi, idx) => (
                  <li key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{chibi}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Danh Sách Sân Đấu Thần Thoại:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {account.allArenas.map((arena, idx) => (
                  <li key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
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
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center my-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-rose-700 font-extrabold text-sm sm:text-base">
                <Lock className="w-5 h-5 text-rose-600 animate-pulse" />
                <span>TÀI KHOẢN ĐANG ĐƯỢC THUÊ</span>
              </div>

              {/* Countdown Timer dạng HH:MM:SS đếm lùi từng giây */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 font-mono">
                <div className="bg-white border border-rose-200 px-3 py-2 rounded-xl shadow-inner text-center min-w-[65px]">
                  <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(hours)}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold mt-1 block">Giờ</span>
                </div>
                <span className="text-xl font-black text-rose-400">:</span>
                <div className="bg-white border border-rose-200 px-3 py-2 rounded-xl shadow-inner text-center min-w-[65px]">
                  <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(minutes)}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold mt-1 block">Phút</span>
                </div>
                <span className="text-xl font-black text-rose-400">:</span>
                <div className="bg-white border border-rose-200 px-3 py-2 rounded-xl shadow-inner text-center min-w-[65px]">
                  <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(seconds)}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold mt-1 block">Giây</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                ⏳ Dự kiến bàn giao cho lượt thuê tiếp theo sau khi hết thời gian đếm ngược. Bạn có thể đặt lịch trước để được ưu tiên nhận acc ngay khi trống!
              </p>
            </div>
          ) : (
            /* ============================================================ */
            /* TRƯỜNG HỢP 2: ACC CÓ SẴN -> HIỆN CHỌN GÓI VÀ BÓC TÁCH PHÍ */
            /* ============================================================ */
            <>
              {/* 4 GÓI THỜI GIAN THUÊ - BỎ MẶC ĐỊNH CHỌN GÓI */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Chọn Gói Thời Gian Thuê:</span>
                  </h4>
                  
                  {!selectedPackage && (
                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1 animate-pulse">
                      👇 Vui lòng chọn gói thời gian bạn muốn thuê
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gói 1: 2 Giờ Trải Nghiệm */}
                  <button
                    onClick={() => setSelectedPackage("2h")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      selectedPackage === "2h"
                        ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm ring-2 ring-orange-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {packageConfigs["2h"].name}
                      </span>
                      <span className="font-extrabold font-mono text-red-600 text-sm">
                        {formatMoney(packageConfigs["2h"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{packageConfigs["2h"].note}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        3% + 20k
                      </span>
                    </div>
                  </button>

                  {/* Gói 2: Thuê 7 Ngày (1 Tuần) */}
                  <button
                    onClick={() => setSelectedPackage("7d")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      selectedPackage === "7d"
                        ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm ring-2 ring-orange-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {packageConfigs["7d"].name}
                      </span>
                      <span className="font-extrabold font-mono text-red-600 text-sm">
                        {formatMoney(packageConfigs["7d"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{packageConfigs["7d"].note}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        12% + 20k
                      </span>
                    </div>
                  </button>

                  {/* Gói 3: Thuê 30 Ngày (1 Tháng) */}
                  <button
                    onClick={() => setSelectedPackage("30d")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      selectedPackage === "30d"
                        ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm ring-2 ring-orange-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {packageConfigs["30d"].name}
                      </span>
                      <span className="font-extrabold font-mono text-red-600 text-sm">
                        {formatMoney(packageConfigs["30d"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-semibold">{packageConfigs["30d"].note}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        30% Giá Acc
                      </span>
                    </div>
                  </button>

                  {/* Gói 4: Thuê Lâu Dài 999 Ngày */}
                  <button
                    onClick={() => setSelectedPackage("perm")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      selectedPackage === "perm"
                        ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm ring-2 ring-orange-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {packageConfigs["perm"].name}
                      </span>
                      <span className="font-extrabold font-mono text-red-600 text-sm">
                        {formatMoney(packageConfigs["perm"].totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-purple-600 font-semibold">{packageConfigs["perm"].note}</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        100% Thuê Lâu Dài
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* KHỐI THÔNG BÁO ĐẶC QUYỀN NÂNG CẤP (RENT-TO-OWN) */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-3.5 text-blue-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-blue-900">
                  <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>⚡ Đặc quyền nâng cấp (Rent-to-Own):</span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed font-normal">
                  Bạn có thể bù phần % chênh lệch để nâng cấp lên gói Thuê Lâu Dài bất cứ lúc nào trong thời gian đang thuê (và tối đa 24h sau khi hết hạn thuê). Ví dụ: Đã thuê gói 30 ngày (30%), chỉ cần bù thêm 70% để sở hữu acc.
                </p>
              </div>

              {/* TOTAL PRICE & GHI CHÚ BÓC TÁCH PHÍ */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                {activePkg ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 uppercase font-semibold block">Tổng Thanh Toán:</span>
                        <span className="text-xs text-slate-800 font-bold">{activePkg.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-red-600 font-mono">
                          {formatMoney(activePkg.totalPrice)}
                        </span>
                        <span className="text-[10px] text-emerald-600 block font-semibold">✓ Đã làm tròn đến hàng nghìn</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tiền thuê gốc:</span>
                        <span className="font-mono font-semibold text-slate-800">{formatMoney(activePkg.basePrice)}</span>
                      </div>

                      {activePkg.passFee > 0 ? (
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Phí hoàn trả acc (phí đổi pass):</span>
                          <span className="font-mono font-semibold text-orange-600">+{formatMoney(activePkg.passFee)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span>Phí hoàn trả acc (phí đổi pass):</span>
                          <span className="font-semibold">Miễn phí (0đ)</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 space-y-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold block">Tổng Thanh Toán:</span>
                    <p className="text-sm font-bold text-orange-600">
                      Vui lòng chọn gói thời gian bên trên
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Mã định danh tài khoản:</span>
                  <button
                    onClick={copyAccCode}
                    className="text-slate-700 hover:text-orange-600 font-semibold flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded shadow-sm transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? "Đã copy" : account.code}</span>
                  </button>
                </div>
              </div>

              {/* CHECKBOX CAM KẾT (ĐIỀU KIỆN BẮT BUỘC) */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/70 hover:bg-orange-50 border border-orange-200/90 cursor-pointer text-xs select-none transition-colors shadow-sm">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600 flex-shrink-0"
                />
                <span className="text-slate-700 font-medium leading-relaxed">
                  Tôi đã đọc và cam kết <strong>không dùng phần mềm thứ 3/phá rank</strong>, đồng ý với quy định thuê của Shop Tuấn Thái Bình.
                </span>
              </label>
            </>
          )}

          {/* Safety Notice */}
          <div className="p-3 bg-slate-100 border-l-4 border-slate-400 rounded-r-lg text-xs text-slate-700 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-800">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span>Quy trình thuê tài khoản:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {isRented
                ? "Tài khoản đang có khách thuê, hãy bấm nút bên dưới để nhắn Zalo shop giữ lịch và ưu tiên giao ngay khi hết giờ."
                : "Sau khi chọn gói và tích cam kết, bấm nút 'Nhận Acc Qua Zalo'. Hệ thống sẽ tự sao chép thông tin để bạn dán (Ctrl+V) vào Zalo, shop sẽ gửi STK và giao acc trong 30 giây!"}
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bảo hiểm 30M Checkscam.vn bảo chứng</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors w-1/2 sm:w-auto shadow-sm"
            >
              Đóng
            </button>

            {/* NÚT HÀNH ĐỘNG PHÂN BIỆT RÕ: CÓ SẴN VS ĐANG THUÊ */}
            {isRented ? (
              <button
                onClick={handlePreOrderZalo}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 active:from-orange-800 active:to-rose-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 w-1/2 sm:w-auto hover:scale-105 shadow-orange-600/20"
              >
                <BellRing className="w-4 h-4" />
                <span>🔔 Đặt Lịch Thuê Sớm Qua Zalo</span>
              </button>
            ) : (
              <button
                onClick={handleOrderZalo}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-1/2 sm:w-auto cursor-pointer ${
                  canSubmit
                    ? "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-md hover:scale-105 shadow-orange-600/20"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-500 border border-slate-300 shadow-sm"
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
