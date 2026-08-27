"use client";

import React, { useState } from "react";
import { TFTRentalAccount, PROFILE_INFO } from "@/data/tft-data";
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
} from "lucide-react";

interface TFTAccountModalProps {
  account: TFTRentalAccount | null;
  onClose: () => void;
}

export const TFTAccountModal: React.FC<TFTAccountModalProps> = ({ account, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState<"1h" | "3h" | "night" | "1day">("1h");
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!account) return null;

  // Tính giá tiền dựa theo gói thuê đã chọn
  let rentalPrice = account.hourlyPrice;
  let packageLabel = "Gói 1 Giờ Trải Nghiệm";

  if (selectedPackage === "3h") {
    rentalPrice = Math.round(account.hourlyPrice * 3 * 0.9);
    packageLabel = "Gói 3 Giờ (Giảm 10%)";
  } else if (selectedPackage === "night") {
    rentalPrice = account.nightPrice;
    packageLabel = "Gói Qua Đêm (22h - 8h Sáng)";
  } else if (selectedPackage === "1day") {
    rentalPrice = account.dailyPrice;
    packageLabel = "Gói Trọn 1 Ngày (24 Tiếng)";
  }

  // Copy mã Acc riêng lẻ
  const copyAccCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Logic Xử Lý Bấm Nút "NHẬN ACC QUA ZALO"
  const handleOrderZalo = () => {
    // 1. Ghép nội dung tin nhắn tự động
    const orderMessage = `[ĐƠN THUÊ ACC TFT]
- Mã Acc: ${account.code}
- Tên Acc: ${account.title}
- Gói thuê: ${packageLabel}
- Thành tiền: ${rentalPrice.toLocaleString("vi-VN")}đ
Nhờ shop gửi STK và bàn giao acc giúp mình!`;

    // 2. Thực hiện sao chép vào clipboard của người dùng
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderMessage).catch(() => {});
    }

    // 3. Hiển thị Toast thông báo trực quan
    setToastMessage("Đã sao chép thông tin đơn hàng! Hãy dán (Ctrl+V) vào khung chat Zalo với shop.");
    setTimeout(() => setToastMessage(null), 6000);

    // 4. Mở tab Zalo của shop
    window.open(PROFILE_INFO.zaloUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-2xl w-full my-8 rounded-2xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] shadow-2xl">
        {/* Top Accent Line */}
        <div className="h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

        {/* TOAST THÔNG BÁO TỰ ĐỘNG SAO CHÉP ĐƠN HÀNG */}
        {toastMessage && (
          <div className="absolute top-3 left-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-emerald-700 rounded-lg text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

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
              {account.status === "AVAILABLE" ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  🟢 SẴN SÀNG
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                  🔴 ĐANG CÓ KHÁCH THUÊ
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
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${account.thumbnail})` }}
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

          {/* RENTAL PACKAGES SELECTOR */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Chọn Gói Thời Gian Thuê:</span>
              </span>
              <span className="text-xs text-emerald-600 font-semibold">100% Không Cần Đặt Cọc</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setSelectedPackage("1h")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "1h"
                    ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Gói 1 Giờ Trải Nghiệm</span>
                  <span className="font-bold font-mono text-red-600 text-sm">
                    {account.hourlyPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Phù hợp test tướng & test bài</span>
              </button>

              <button
                onClick={() => setSelectedPackage("3h")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "3h"
                    ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Gói 3 Giờ (Giảm 10%)</span>
                  <span className="font-bold font-mono text-red-600 text-sm">
                    {Math.round(account.hourlyPrice * 3 * 0.9).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Tiết kiệm chi phí chơi nhiều trận</span>
              </button>

              <button
                onClick={() => setSelectedPackage("night")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "night"
                    ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Gói Qua Đêm (22h - 8h)</span>
                  <span className="font-bold font-mono text-red-600 text-sm">
                    {account.nightPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">10 tiếng cày đêm thả ga</span>
              </button>

              <button
                onClick={() => setSelectedPackage("1day")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "1day"
                    ? "bg-orange-50 border-orange-500 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Gói Trọn 1 Ngày (24h)</span>
                  <span className="font-bold font-mono text-red-600 text-sm">
                    {account.dailyPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Chơi nguyên ngày cuối tuần</span>
              </button>
            </div>
          </div>

          {/* TOTAL PRICE BLOCK (ĐÃ XÓA KHỐI QR THANH TOÁN) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold block">Tổng Tiền Thuê:</span>
                <span className="text-xs text-slate-700 font-medium">{packageLabel}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-red-600 font-mono">
                  {rentalPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-[10px] text-emerald-600 block font-semibold">✓ Không phí phát sinh</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Mã định danh tài khoản:</span>
              <button
                onClick={copyAccCode}
                className="text-xs text-slate-700 hover:text-orange-600 font-semibold flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Đã copy mã" : `Copy Mã (${account.code})`}</span>
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Quy trình thuê tài khoản nhanh:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Bấm nút <strong>"Nhận Acc Qua Zalo"</strong> bên dưới, hệ thống sẽ tự động sao chép toàn bộ thông tin đơn hàng. Bạn chỉ cần dán (Ctrl+V) vào khung chat Zalo, shop sẽ gửi STK và giao acc trong 30 giây!
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

            {/* NÚT TỰ ĐỘNG SAO CHÉP ĐƠN HÀNG VÀ MỞ ZALO */}
            <button
              onClick={handleOrderZalo}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 w-1/2 sm:w-auto hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nhận Acc Qua Zalo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
