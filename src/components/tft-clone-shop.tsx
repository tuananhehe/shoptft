"use client";

import React, { useState } from "react";
import { TFT_CLONE_ACCOUNTS, TFTCloneAccount, PROFILE_INFO } from "@/data/tft-data";
import { motion, Variants } from "framer-motion";
import {
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const cloneContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cloneCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const TFTCloneShop: React.FC = () => {
  const [selectedClone, setSelectedClone] = useState<TFTCloneAccount | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"MONTH" | "WEEK">("MONTH");
  const [copied, setCopied] = useState(false);

  const openRentalModal = (account: TFTCloneAccount, plan: "MONTH" | "WEEK" = "MONTH") => {
    setSelectedClone(account);
    setSelectedPlan(plan);
    setCopied(false);
  };

  const getActivePrice = (account: TFTCloneAccount) => {
    return selectedPlan === "MONTH" ? account.monthlyPrice : account.weeklyPrice;
  };

  const getActivePlanName = () => {
    return selectedPlan === "MONTH" ? "Gói 1 Tháng" : "Gói 1 Tuần";
  };

  const getZaloMessage = (account: TFTCloneAccount) => {
    const price = getActivePrice(account);
    const planName = getActivePlanName();
    return `Chào Tuấn Thái Bình, mình muốn THUÊ DÀI HẠN Acc Clone/Smurf mã [${account.code}] - ${account.title} (${planName} giá ${price.toLocaleString("vi-VN")}đ). Hỗ trợ kiểm tra và bàn giao tài khoản cho mình nhé!`;
  };

  const handleCopyAndZalo = (account: TFTCloneAccount) => {
    const msg = getZaloMessage(account);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    toast.success("Đã sao chép nội dung tin nhắn Zalo!");
    setTimeout(() => {
      window.open(PROFILE_INFO.zaloUrl, "_blank");
    }, 400);
  };

  return (
    <section id="clone-shop" className="py-12 sm:py-16 bg-white border-b border-slate-200/80 relative overflow-hidden">
      {/* Background Subtle Tech Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          {/* Tag phụ (Badge nền cam nhạt) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-orange-100/90 border border-orange-200 text-orange-800 font-bold text-xs shadow-sm font-gaming uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>TÀI KHOẢN KHỞI ĐỘNG & TEST META</span>
          </div>

          {/* Tiêu đề chính h2 font Esports Gaming */}
          <h2 className="font-gaming text-2xl sm:text-3xl md:text-4xl font-black uppercase text-slate-900 tracking-tight leading-tight">
            KHO ACC CLONE / SMURF{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
              (THUÊ DÀI HẠN)
            </span>
          </h2>

          {/* Mô tả ngắn */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Tài khoản rank thấp, Unranked hoặc trắng thông tin. Phù hợp để luyện tập đội hình mới, chơi cùng bạn bè. Tiết kiệm hơn với các gói thuê dài hạn.
          </p>
        </div>

        {/* 2. GRID 4 CỘT ACC CLONE / SMURF (EQUAL HEIGHT & MINIMALIST) */}
        <motion.div
          variants={cloneContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {TFT_CLONE_ACCOUNTS.map((account) => (
            <motion.div
              key={account.id}
              variants={cloneCardVariants}
              className="flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
            >
              {/* TOP KHUNG ẢNH VUÔNG ASPECT-SQUARE CÓ HUY HIỆU */}
              <div>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900 mb-3 border border-slate-100 shadow-inner">
                  <img
                    src={account.thumbnail}
                    alt={`Thuê acc clone TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

                  {/* Top Right: Mã Acc */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                      {account.code}
                    </span>
                  </div>

                  {/* Top Left: Trạng Thái */}
                  <div className="absolute top-3 left-3">
                    {account.status === "AVAILABLE" ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>SẴN SÀNG</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm">
                        ĐANG THUÊ
                      </span>
                    )}
                  </div>

                  {/* Bottom Left: Huy Hiệu Rank Clone/Unranked */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                      {account.rankBadge}
                    </span>
                  </div>
                </div>

                {/* TÊN ĐỊNH DANH ACC */}
                <div className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                  {account.title}
                </div>

                {/* GẠCH ĐẦU DÒNG TÍNH NĂNG NGẮN GỌN (THAY VÌ TÍ NỊ/SÂN ĐẤU) */}
                <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 font-medium">
                  {account.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ĐÁY THẺ: GIÁ DÀI HẠN & NÚT THUÊ DÀI HẠN (NEO BẰNG MT-AUTO) */}
              <div className="mt-auto pt-3.5 border-t border-slate-100 space-y-2.5">
                {/* Giá Thuê Theo Tháng (Ẩn hoàn toàn giá/giờ) */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                      {account.periodPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs text-slate-600 font-medium">{account.periodUnit}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    Tiết kiệm 65%
                  </span>
                </div>

                {/* Cụm 2 Nút Bấm: Gói Tuần & THUÊ DÀI HẠN */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openRentalModal(account, "WEEK")}
                    className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Gói Tuần</span>
                  </button>

                  <button
                    onClick={() => openRentalModal(account, "MONTH")}
                    className="h-9 px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer font-gaming"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Thuê Dài Hạn</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. THÔNG BÁO CAM KẾT ACC CLONE */}
        <div className="mt-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Cam kết Acc Clone / Smurf:</strong> 100% tài khoản sạch, không dính hình phạt, hỗ trợ đổi mật khẩu và bảo hành trọn vẹn thời gian thuê qua Zalo: <strong>{PROFILE_INFO.phoneZalo}</strong>.
            </span>
          </div>
          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex-shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Tư Vấn Zalo</span>
          </a>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MODAL THUÊ DÀI HẠN ACC CLONE / SMURF (CÚ PHÁP ZALO ĐỊNH SẴN) */}
      {/* ============================================================ */}
      {selectedClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/40 text-orange-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block font-gaming">
                    THUÊ ACC CLONE / SMURF DÀI HẠN
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-white line-clamp-1">
                    {selectedClone.code} • {selectedClone.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedClone(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
                aria-label="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Chọn Gói Thuê Dài Hạn */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 font-gaming">
                  1. Chọn Gói Thời Gian Thuê:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Gói 1 Tháng */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("MONTH")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPlan === "MONTH"
                        ? "border-orange-600 bg-orange-50/70 text-slate-900 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Gói 1 Tháng</span>
                      <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full">
                        TIẾT KIỆM
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-red-600 font-mono block">
                      {selectedClone.monthlyPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Chỉ ~5.000đ / ngày</span>
                  </button>

                  {/* Gói 1 Tuần */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("WEEK")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPlan === "WEEK"
                        ? "border-orange-600 bg-orange-50/70 text-slate-900 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Gói 1 Tuần</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        LINH HOẠT
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-red-600 font-mono block">
                      {selectedClone.weeklyPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Trải nghiệm 7 ngày</span>
                  </button>
                </div>
              </div>

              {/* Thông tin bàn giao & Quyền lợi */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quyền lợi gói thuê dài hạn:</span>
                </div>
                <p className="text-slate-600 pl-5 leading-relaxed">
                  • Cấp Riot ID & Mật khẩu riêng, hỗ trợ đổi mật khẩu trong thời gian thuê.
                </p>
                <p className="text-slate-600 pl-5 leading-relaxed">
                  • Bảo hành 100% thời gian thuê, đổi acc ngay nếu có trục trặc.
                </p>
              </div>

              {/* Hộp xem trước cú pháp tin nhắn Zalo */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 font-gaming flex items-center justify-between">
                  <span>2. Nội Dung Gửi Zalo Bàn Giao:</span>
                  <span className="text-[11px] text-slate-500 font-normal">Tự động gán sẵn</span>
                </label>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs leading-relaxed relative border border-slate-800">
                  {getZaloMessage(selectedClone)}
                </div>
              </div>

              {/* Cụm Nút Thao Tác Bàn Giao Zalo */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyAndZalo(selectedClone)}
                  className="w-full py-3.5 px-4 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-700/25 flex items-center justify-center gap-2 cursor-pointer font-gaming hover:scale-[1.02]"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Đã Copy • Đang Chuyển Sang Zalo...</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Tin Nhắn & Mở Zalo ({PROFILE_INFO.phoneZalo})</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Hotline / Zalo: <strong>{PROFILE_INFO.phoneZalo}</strong></span>
                  <a
                    href={PROFILE_INFO.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>Mở Zalo trực tiếp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
