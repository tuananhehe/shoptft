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
  Flame,
  Crown,
} from "lucide-react";

interface TFTAccountModalProps {
  account: TFTRentalAccount | null;
  onClose: () => void;
}

export const TFTAccountModal: React.FC<TFTAccountModalProps> = ({ account, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState<"2h" | "7d" | "30d" | "perm">("2h");
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!account) return null;

  // Giá trị gốc của tài khoản
  const baseAccountValue = account.accountValue || account.dailyPrice * 16 || 850000;

  // Hàm làm tròn tiền đến hàng nghìn
  const roundToThousand = (val: number) => Math.round(val / 1000) * 1000;
  const formatMoney = (val: number) => `${roundToThousand(val).toLocaleString("vi-VN")}đ`;

  // Cấu hình 4 gói thời gian thuê theo công thức linh hoạt
  const packageConfigs = {
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
      name: "Sở Hữu 999 Ngày (Mua Đứt)",
      rate: 1.00,
      basePrice: roundToThousand(baseAccountValue),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue),
      note: "Bàn giao Full Mail chính chủ",
      tag: "Bàn giao Full Mail chính chủ",
      badgeColor: "bg-purple-100 text-purple-700",
    },
  };

  const activePkg = packageConfigs[selectedPackage];

  // Copy mã Acc riêng lẻ
  const copyAccCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Logic Xử Lý Bấm Nút "NHẬN ACC QUA ZALO"
  const handleOrderZalo = () => {
    // Ghép nội dung tin nhắn tự động theo mẫu yêu cầu
    const orderMessage = `[ĐƠN ĐẶT ACC TFT]
- Mã Acc: ${account.code}
- Tên Acc: ${account.title}
- Thời hạn: ${activePkg.name}
- Tổng thanh toán: ${formatMoney(activePkg.totalPrice)}
Nhờ shop gửi STK và hỗ trợ bàn giao thông tin!`;

    // Thực hiện copy văn bản trên vào clipboard của người dùng
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderMessage).catch(() => {});
    }

    // Hiển thị Toast thông báo trực quan
    setToastMessage("Đã sao chép thông tin đơn hàng! Hãy dán (Ctrl+V) vào khung chat Zalo với shop.");
    setTimeout(() => setToastMessage(null), 6000);

    // Mở link Zalo shop
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

          {/* 4 GÓI THỜI GIAN THUÊ THEO CÔNG THỨC LINH HOẠT */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Chọn Gói Thời Gian Thuê / Sở Hữu:</span>
              </span>
              <span className="text-xs text-emerald-600 font-semibold">100% Không Cần Đặt Cọc</span>
            </h4>

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

              {/* Gói 4: Sở Hữu 999 Ngày (Mua Đứt) */}
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
                    100% Mua Đứt
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* TOTAL PRICE & GHI CHÚ CHI TIẾT TÁCH RÕ TIỀN THUÊ GỐC + PHÍ HOÀN TRẢ */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
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

            {/* Chi Tiết Bóc Tách Phí */}
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

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
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
