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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-white/15 max-w-2xl w-full my-8 rounded-2xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Top Accent Line */}
        <div className="h-[3px] bg-gradient-to-r from-[#FF6B00] via-[#F59E0B] to-[#10B981] w-full" />

        {/* Header Bar */}
        <div className="p-5 bg-[#0A0E17] border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-[#F59E0B] font-mono font-bold text-xs">
                {account.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${account.rankBadgeBg}`}>
                {account.rank}
              </span>
              {account.status === "AVAILABLE" ? (
                <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] font-bold text-[10px]">
                  🟢 SẴN SÀNG
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-bold text-[10px]">
                  🔴 ĐANG CÓ KHÁCH THUÊ
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-50 tracking-tight mt-1">
              {account.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#1F2937] border border-white/10 hover:border-white text-white flex items-center justify-center font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#F9FAFB]">
          {/* Main Hero Gallery (16:9) */}
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#0A0E17] border border-white/10 relative">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${account.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>{account.mainChibi}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase">Giá Thuê Gói Đang Chọn:</span>
                <span className="text-2xl font-black text-[#F59E0B] font-mono">
                  {rentalPrice.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>

          {/* CHỌN GÓI THỜI GIAN THUÊ (Rental Package Selector) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Bước 1: Chọn Thời Gian Thuê Tài Khoản:</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Gói 1h */}
              <button
                onClick={() => setSelectedPackage("1h")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "1h"
                    ? "bg-[#FF6B00]/15 border-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.25)]"
                    : "bg-[#0A0E17] border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <span className="block font-bold text-white">1 Giờ</span>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">{account.hourlyPrice.toLocaleString()}đ</span>
              </button>

              {/* Gói 3h */}
              <button
                onClick={() => setSelectedPackage("3h")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "3h"
                    ? "bg-[#FF6B00]/15 border-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.25)]"
                    : "bg-[#0A0E17] border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block font-bold text-white">3 Giờ</span>
                  <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded">-10%</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">
                  {Math.round(account.hourlyPrice * 3 * 0.9).toLocaleString()}đ
                </span>
              </button>

              {/* Gói Đêm */}
              <button
                onClick={() => setSelectedPackage("night")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "night"
                    ? "bg-[#FF6B00]/15 border-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.25)]"
                    : "bg-[#0A0E17] border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <span className="block font-bold text-white">Qua Đêm (22h-8h)</span>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">{account.nightPrice.toLocaleString()}đ</span>
              </button>

              {/* Gói 1 Ngày */}
              <button
                onClick={() => setSelectedPackage("1day")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPackage === "1day"
                    ? "bg-[#FF6B00]/15 border-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.25)]"
                    : "bg-[#0A0E17] border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <span className="block font-bold text-white">1 Ngày (24h)</span>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">{account.dailyPrice.toLocaleString()}đ</span>
              </button>

              {/* Gói 3 Ngày */}
              <button
                onClick={() => setSelectedPackage("3days")}
                className={`p-3 rounded-xl border text-left transition-all sm:col-span-2 ${
                  selectedPackage === "3days"
                    ? "bg-[#FF6B00]/15 border-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.25)]"
                    : "bg-[#0A0E17] border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block font-bold text-white">3 Ngày (Tiết kiệm nhất)</span>
                  <span className="text-[9px] bg-green-500/20 text-[#10B981] px-1 rounded">-15%</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#F59E0B]">
                  {Math.round(account.dailyPrice * 3 * 0.85).toLocaleString()}đ
                </span>
              </button>
            </div>
          </div>

          {/* Pricing & Fast Code Copy */}
          <div className="p-4 bg-[#0A0E17] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-gray-400">Gói thuê đang chọn: <strong className="text-white">{packageLabel}</strong></div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#F59E0B] font-mono">
                  {rentalPrice.toLocaleString()}đ
                </span>
                <span className="text-xs text-[#10B981] font-bold">
                  (Không cần đặt cọc)
                </span>
              </div>
            </div>

            <button
              onClick={copyAccCode}
              className="h-11 px-4 bg-[#1F2937] hover:bg-[#374151] border border-white/10 rounded-xl text-xs font-bold text-gray-200 flex items-center justify-center gap-2 transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? "ĐÃ SAO CHÉP MÃ" : `Sao Chép: ${account.code}`}</span>
            </button>
          </div>

          {/* Inventory Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>Kho Đồ & Sân Đấu Có Trong Tài Khoản:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-[#0A0E17] border border-white/10 rounded-xl space-y-2">
                <span className="font-bold text-white uppercase text-[11px] block">
                  Tướng Tí Nị Sở Hữu:
                </span>
                <ul className="space-y-1.5 text-gray-300 font-light">
                  {account.allChibi.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] flex-shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[#0A0E17] border border-white/10 rounded-xl space-y-2">
                <span className="font-bold text-white uppercase text-[11px] block">
                  Sân Đấu Thần Thoại:
                </span>
                <ul className="space-y-1.5 text-gray-300 font-light">
                  {account.allArenas.map((a, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* QR Payment Drawer */}
          {showQR && (
            <div className="p-4 bg-[#0A0E17] border border-amber-500/30 rounded-xl space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <h5 className="font-bold text-xs uppercase tracking-wider text-white">
                  Quét Mã QR Chuyển Khoản Ngân Hàng Tự Động
                </h5>
                <p className="text-xs text-gray-400">
                  Ngân hàng: <strong className="text-white">{PROFILE_INFO.bankInfo.bankName}</strong> | STK: <strong className="text-[#F59E0B] font-mono">{PROFILE_INFO.bankInfo.accountNumber}</strong>
                </p>
              </div>

              <div className="flex justify-center p-4 bg-white rounded-xl max-w-[180px] mx-auto">
                <div className="w-36 h-36 flex flex-col items-center justify-center text-black text-center text-xs">
                  <QrCode className="w-24 h-24 text-black" />
                  <span className="font-mono font-bold text-[10px] mt-1">{account.code} - {rentalPrice.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-400 font-mono">
                Nội dung chuyển khoản: <strong className="text-[#F59E0B] font-bold">THUE {account.code.replace('MS: ', '')} - SĐT</strong>
              </div>
            </div>
          )}

          {/* Rental Rules & Security Guarantee */}
          <div className="p-3.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-center gap-3 text-xs text-[#10B981]">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#10B981]" />
            <span>
              Bàn giao ID & Mật Khẩu qua Zalo trong 30 giây. Hỗ trợ đổi acc tương đương hoặc bù giờ ngay lập tức nếu phát sinh sự cố.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#0A0E17] border-t border-white/10 flex-shrink-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowQR(!showQR)}
            className="h-12 px-6 bg-[#1F2937] hover:bg-[#374151] border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-[#F59E0B]" />
            <span>{showQR ? "Ẩn Mã QR" : "Quét QR Thanh Toán"}</span>
          </button>

          <a
            href={zaloRentalMessageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] hover:from-[#e55f00] hover:to-[#d98200] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all hover:scale-105"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Thuê Ngay Qua Zalo ({account.code} - {rentalPrice.toLocaleString()}đ)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
