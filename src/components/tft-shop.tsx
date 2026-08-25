"use client";

import React, { useState } from "react";
import { TFT_RENTAL_ACCOUNTS, TFTRentalAccount } from "@/data/tft-data";
import {
  Search,
  KeyRound,
  Eye,
  ShieldCheck,
  Sparkles,
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Flame,
  Star,
  Layers,
} from "lucide-react";

interface TFTShopProps {
  onSelectAccount: (account: TFTRentalAccount) => void;
}

const RENTAL_DURATIONS = [
  { id: "ALL", label: "Tất cả gói thuê" },
  { id: "HOURLY", label: "Thuê theo giờ (Từ 6k/h)" },
  { id: "DAILY", label: "Thuê theo ngày (Từ 25k/ngày)" },
  { id: "NIGHT", label: "Thuê qua đêm (22h - 8h Sáng)" },
];

const RANK_OPTIONS = [
  { id: "ALL", label: "Tất cả bậc rank" },
  { id: "THÁCH ĐẤU", label: "Thách Đấu" },
  { id: "ĐẠI CAO THỦ", label: "Đại Cao Thủ" },
  { id: "CAO THỦ", label: "Cao Thủ" },
  { id: "KIM CƯƠNG", label: "Kim Cương" },
  { id: "LỤC BẢO", label: "Lục Bảo" },
  { id: "VÀNG/BẠCH KIM", label: "Vàng / Bạch Kim" },
];

const CHIBI_OPTIONS = [
  { id: "ALL", label: "Tất cả tướng Tí Nị" },
  { id: "Ahri", label: "Tí Nị Ahri Chiêu Hồn" },
  { id: "Gwen", label: "Tí Nị Gwen Búp Bê" },
  { id: "Yasuo", label: "Tí Nị Yasuo Chân Long" },
  { id: "Aatrox", label: "Tí Nị Aatrox Cuồng Kiếm" },
  { id: "Kai'Sa", label: "Tí Nị Kai'Sa Nữ Thần Rồng" },
  { id: "Irelia", label: "Tí Nị Irelia Thánh Kiếm" },
  { id: "Teemo", label: "Tí Nị Teemo Tiểu Quỷ" },
  { id: "Sivir", label: "Tí Nị Sivir Tinh Binh" },
];

export const TFTShop: React.FC<TFTShopProps> = ({ onSelectAccount }) => {
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("ALL");
  const [selectedRank, setSelectedRank] = useState("ALL");
  const [selectedChibi, setSelectedChibi] = useState("ALL");

  // Top 5 Featured Accounts for horizontal marquee
  const featuredAccounts = TFT_RENTAL_ACCOUNTS.slice(0, 5);
  const loopAccounts = [...featuredAccounts, ...featuredAccounts];

  // Filtered Accounts
  const filteredAccounts = TFT_RENTAL_ACCOUNTS.filter((acc) => {
    const matchesRank = selectedRank === "ALL" || acc.rank === selectedRank;
    const matchesChibi =
      selectedChibi === "ALL" ||
      acc.mainChibi.toLowerCase().includes(selectedChibi.toLowerCase()) ||
      acc.allChibi.some((c) => c.toLowerCase().includes(selectedChibi.toLowerCase()));

    const matchesSearch =
      acc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.mainChibi.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRank && matchesChibi && matchesSearch;
  });

  return (
    <section id="shop" className="pt-8 pb-14 sm:pt-10 sm:pb-16 bg-slate-50 border-t border-slate-200/80 border-b border-slate-200 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Tài Khoản & Dịch Vụ Nổi Bật</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              KHO CHO THUÊ ACC TFT TỰ ĐỘNG
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-normal">
              Trải nghiệm acc VIP sở hữu Tướng Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc chỉ từ 6k/giờ. Tự động nhận pass sau khi thanh toán.
            </p>
          </div>

          {/* Pause / Play Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-orange-600" />}
              <span>{isPaused ? "Tiếp Tục Chạy" : "Tạm Dừng"}</span>
            </button>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              (Rê chuột tự dừng)
            </span>
          </div>
        </div>
      </div>

      {/* 1. SEAMLESS INFINITE MARQUEE AUTO-LOOP TRACK (LIGHT MODE CARDS WITH DEPTH SHADOW) */}
      <div className="relative w-full py-2 overflow-hidden mask-gradient">
        {/* Left & Right fade gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div
          className={`animate-infinite-loop flex gap-5 px-4 ${isPaused ? "!animation-play-state-paused" : ""}`}
          style={{ animationPlayState: isPaused ? "paused" : undefined }}
        >
          {loopAccounts.map((account, index) => (
            <div
              key={`${account.id}-${index}`}
              className="w-[280px] sm:w-[310px] flex-shrink-0 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              {/* Top Photo & Badges */}
              <div>
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-900 mb-3 border border-slate-100 shadow-inner">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${account.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                  {/* Top Right Code Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm">
                      {account.code}
                    </span>
                  </div>

                  {/* Top Left Status Badge */}
                  <div className="absolute top-2 left-2">
                    {account.status === "AVAILABLE" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>SẴN SÀNG</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm">
                        ĐANG THUÊ
                      </span>
                    )}
                  </div>

                  {/* Bottom Rank */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 rounded bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                      {account.rank}
                    </span>
                  </div>
                </div>

                {/* Tag danh mục nhỏ màu xám nhạt */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {account.mainChibi}
                  </span>
                </div>

                {/* Tên gói/acc in đậm */}
                <h3 className="text-slate-800 text-sm font-semibold line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                  {account.title}
                </h3>

                {/* Sân Đấu */}
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal">
                  🏟️ {account.mainArena}
                </p>
              </div>

              {/* Price & Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2.5">
                {/* Giá tiền màu đỏ tươi kèm số lượt đã thuê bên cạnh */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                      {account.hourlyPrice.toLocaleString()}đ
                    </span>
                    <span className="text-xs text-slate-500 font-normal"> / Giờ</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Đã thuê: 120+ lượt
                  </span>
                </div>

                {/* 2 Buttons: Chi Tiết & Thuê Ngay */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectAccount(account)}
                    className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi Tiết</span>
                  </button>

                  <button
                    onClick={() => onSelectAccount(account)}
                    className="h-9 px-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-1 hover:scale-105"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Thuê Ngay</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. NÚT LỚN "XEM THÊM TOÀN BỘ KHO ACC" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
        <button
          onClick={() => setShowFullCatalog(!showFullCatalog)}
          className={`h-12 sm:h-14 px-8 inline-flex items-center justify-center gap-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-md ${
            showFullCatalog
              ? "bg-slate-800 text-white hover:bg-slate-900"
              : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 hover:scale-105"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            {showFullCatalog
              ? "Thu gọn lại (Chế độ 5 acc tiêu biểu)"
              : `Xem thêm toàn bộ kho acc cho thuê (${TFT_RENTAL_ACCOUNTS.length}+ acc có sẵn)`}
          </span>
          {showFullCatalog ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4 animate-bounce" />
          )}
        </button>
      </div>

      {/* 3. KHU VỰC MỞ RỘNG (CAM KẾT + BỘ LỌC + GRID 4 CỘT) */}
      {showFullCatalog && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-slate-200/80 space-y-8 animate-fadeIn">
          {/* KHUNG CAM KẾT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px]">Bàn Giao Tự Động</h4>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Nhận ngay ID & Mật Khẩu qua Zalo trong 30 giây sau khi quét QR.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px]">Đúng 100% Ảnh Mô Tả</h4>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Cam kết đúng Tướng Tí Nị, Sân Đấu và Bậc Rank như mô tả.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px]">Nghiêm Cấm Hack/Phá</h4>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Nghiêm cấm dùng phần mềm thứ 3 hoặc phá rank của chủ acc.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px]">Hỗ Trợ Đổi Acc 24/7</h4>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Đổi acc tương đương hoặc bù giờ ngay lập tức nếu có sự cố.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BỘ LỌC & TÌM KIẾM */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
              {/* Filter 1 */}
              <div className="lg:col-span-3">
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Thời Gian Thuê
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {RENTAL_DURATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2 */}
              <div className="lg:col-span-3">
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Bậc Rank
                </label>
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {RANK_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3 */}
              <div className="lg:col-span-3">
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Tướng Tí Nị
                </label>
                <select
                  value={selectedChibi}
                  onChange={(e) => setSelectedChibi(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {CHIBI_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="lg:col-span-3">
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Tìm Theo Mã Số / Tên
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Mã MS: 8899..."
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>
                Tìm thấy <strong className="text-slate-900 font-mono">{filteredAccounts.length}</strong> tài khoản cho thuê
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>🟢 Sẵn sàng bàn giao</span>
              </div>
            </div>
          </div>

          {/* GRID 4 CỘT TẤT CẢ ACC */}
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
              <KeyRound className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                Không tìm thấy tài khoản phù hợp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng đổi bộ lọc hoặc liên hệ Zalo để tìm acc theo yêu cầu riêng.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
                >
                  {/* Top Photo & Badges */}
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-900 mb-3 border border-slate-100 shadow-inner">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${account.thumbnail})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm">
                          {account.code}
                        </span>
                      </div>

                      <div className="absolute top-2 left-2">
                        {account.status === "AVAILABLE" ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>SẴN SÀNG</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm">
                            ĐANG THUÊ
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                          {account.rank}
                        </span>
                      </div>
                    </div>

                    {/* Tag danh mục nhỏ màu xám nhạt */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {account.mainChibi}
                      </span>
                    </div>

                    {/* Tên gói/acc in đậm */}
                    <h3 className="text-slate-800 text-sm font-semibold line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                      {account.title}
                    </h3>

                    {/* Sân Đấu */}
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal">
                      🏟️ {account.mainArena}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                          {account.hourlyPrice.toLocaleString()}đ
                        </span>
                        <span className="text-xs text-slate-500 font-normal"> / Giờ</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Đã thuê: 95+ lượt
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectAccount(account)}
                        className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi Tiết</span>
                      </button>

                      <button
                        onClick={() => onSelectAccount(account)}
                        className="h-9 px-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-1 hover:scale-105"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Thuê Ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
