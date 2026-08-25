"use client";

import React, { useState } from "react";
import { TFTRentalAccount, PROFILE_INFO } from "@/data/tft-data";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  QrCode,
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
  const [selectedPackage, setSelectedPackage] = useState<"1h" | "3h" | "night" | "1day" | "3days">("1h");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!account) return null;

  // Calculate rental price based on selected package
  let rentalPrice = account.hourlyPrice;
  let packageLabel = "1 Giờ Trải Nghiệm";

  if (selectedPackage === "3h") {
    rentalPrice = Math.round(account.hourlyPrice * 3 * 0.9);
    packageLabel = "3 Giờ Chiến Game (Giảm 10%)";
  } else if (selectedPackage === "night") {
    rentalPrice = account.nightPrice;
    packageLabel = "Qua Đêm (22h - 8h Sáng)";
  } else if (selectedPackage === "1day") {
    rentalPrice = account.dailyPrice;
    packageLabel = "Trọn Gói 1 Ngày (24 Tiếng)";
  } else if (selectedPackage === "3days") {
    rentalPrice = Math.round(account.dailyPrice * 3 * 0.85);
    packageLabel = "Gói 3 Ngày (Tiết Kiệm 15%)";
  }

  const copyAccCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const zaloRentalMessageUrl = `https://zalo.me/0352867283?text=${encodeURIComponent(
    `Chào Tuấn, mình muốn thuê tài khoản ĐTCL mã ${account.code} (${account.title}) gói ${packageLabel} giá ${rentalPrice.toLocaleString()}đ trên website.`
  )}`;

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
                    {account.hourlyPrice.toLocaleString()}đ
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
                    {Math.round(account.hourlyPrice * 3 * 0.9).toLocaleString()}đ
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
                    {account.nightPrice.toLocaleString()}đ
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
                    {account.dailyPrice.toLocaleString()}đ
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Chơi nguyên ngày cuối tuần</span>
              </button>
            </div>
          </div>

          {/* TOTAL PRICE & QR PAYMENT OPTION */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold block">Tổng Tiền Thuê:</span>
                <span className="text-xs text-slate-600">{packageLabel}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-red-600 font-mono">
                  {rentalPrice.toLocaleString()}đ
                </span>
                <span className="text-[10px] text-emerald-600 block font-semibold">✓ Không phí phát sinh</span>
              </div>
            </div>

            {/* Toggle QR Bank Details */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQR ? "Ẩn mã QR thanh toán" : "Hiện mã QR thanh toán nhanh"}</span>
              </button>

              <button
                onClick={copyAccCode}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Đã copy mã" : "Copy Mã Acc"}</span>
              </button>
            </div>

            {showQR && (
              <div className="pt-3 border-t border-slate-200 bg-white p-4 rounded-xl border border-slate-200 text-center space-y-3">
                <div className="inline-block p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                  {/* Generated Dynamic VietQR URL */}
                  <img
                    src={`https://img.vietqr.io/image/MB-999988886666-compact2.png?amount=${rentalPrice}&addInfo=${encodeURIComponent(
                      `THUE ${account.code}`
                    )}&accountName=${encodeURIComponent(PROFILE_INFO.bankInfo.accountHolder)}`}
                    alt="VietQR Payment"
                    className="w-48 h-48 mx-auto object-contain rounded-lg"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Ngân hàng: <strong>{PROFILE_INFO.bankInfo.bankName}</strong></p>
                  <p>Số tài khoản: <strong className="font-mono text-orange-600">{PROFILE_INFO.bankInfo.accountNumber}</strong></p>
                  <p>Chủ tài khoản: <strong>{PROFILE_INFO.bankInfo.accountHolder}</strong></p>
                  <p>Nội dung CK: <strong className="font-mono text-red-600">THUE {account.code}</strong></p>
                </div>
              </div>
            )}
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Quy định khi thuê tài khoản:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Nghiêm cấm dùng phần mềm thứ 3 / phá rank / đổi thông tin. Vi phạm sẽ thu hồi ngay lập tức. Sau khi chuyển khoản, vui lòng nhắn tin Zalo để nhận thông tin đăng nhập tự động.
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

            <a
              href={zaloRentalMessageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 w-1/2 sm:w-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nhận Acc Qua Zalo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
