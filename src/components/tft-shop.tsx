"use client";

import React, { useState } from "react";
import { TFT_RENTAL_ACCOUNTS, TFTRentalAccount } from "@/data/tft-data";
import {
  Search,
  KeyRound,
  Eye,
  ShieldCheck,
  Sparkles,
  Trophy,
  ArrowRight,
  Clock,
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Filter,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Flame,
} from "lucide-react";

interface TFTShopProps {
  onSelectAccount: (account: TFTRentalAccount) => void;
}

const RENTAL_DURATIONS = [
  { id: "ALL", label: "TẤT CẢ GÓI THUÊ" },
  { id: "HOURLY", label: "THUÊ THEO GIỜ (Từ 6k/h)" },
  { id: "DAILY", label: "THUÊ THEO NGÀY (Từ 25k/ngày)" },
  { id: "NIGHT", label: "THUÊ QUA ĐÊM (22h - 8h Sáng)" },
];

const RANK_OPTIONS = [
  { id: "ALL", label: "TẤT CẢ BẬC RANK" },
  { id: "THÁCH ĐẤU", label: "THÁCH ĐẤU" },
  { id: "ĐẠI CAO THỦ", label: "ĐẠI CAO THỦ" },
  { id: "CAO THỦ", label: "CAO THỦ" },
  { id: "KIM CƯƠNG", label: "KIM CƯƠNG" },
  { id: "LỤC BẢO", label: "LỤC BẢO" },
  { id: "VÀNG/BẠCH KIM", label: "VÀNG / BẠCH KIM" },
];

const CHIBI_OPTIONS = [
  { id: "ALL", label: "TẤT CẢ TƯỚNG TÍ NỊ" },
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

  // Top 5 Featured Accounts for the horizontal continuous auto-loop
  const featuredAccounts = TFT_RENTAL_ACCOUNTS.slice(0, 5);
  // Duplicate for seamless infinite loop
  const loopAccounts = [...featuredAccounts, ...featuredAccounts];

  // Filtered Accounts for Full Catalog Drawer
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
    <section id="shop" className="py-20 bg-[#0A0E17] text-[#F9FAFB] border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#F59E0B] text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
              <span>Vòng Lặp Tự Động // 5 Acc Tiêu Biểu</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-50">
              DỊCH VỤ <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">THUÊ ACC TFT</span> TỰ ĐỘNG
            </h2>
            <p className="text-gray-400 font-light text-sm sm:text-base max-w-2xl">
              Hệ thống tự động chạy vòng lặp 5 tài khoản tiêu biểu sở hữu Tướng Tí Nị VIP & Sân Đấu Thần Thoại. Rê chuột vào acc bất kỳ để dừng lại xem chi tiết.
            </p>
          </div>

          {/* Pause / Play Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3.5 py-1.5 rounded-lg bg-[#111827] border border-white/10 hover:border-amber-500/40 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-[#10B981]" /> : <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />}
              <span>{isPaused ? "Tiếp Tục Chạy" : "Tạm Dừng"}</span>
            </button>

            <span className="text-xs text-gray-500 font-mono hidden sm:inline">
              (Rê chuột tự dừng)
            </span>
          </div>
        </div>
      </div>

      {/* 1. SEAMLESS INFINITE MARQUEE AUTO-LOOP TRACK (5 ACC TIÊU BIỂU CHẠY NGANG) */}
      <div className="relative w-full py-4 overflow-hidden mask-gradient">
        {/* Left & Right fade gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-[#0A0E17] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-[#0A0E17] to-transparent z-10 pointer-events-none" />

        <div
          className={`animate-infinite-loop flex gap-6 px-4 ${isPaused ? "!animation-play-state-paused" : ""}`}
          style={{ animationPlayState: isPaused ? "paused" : undefined }}
        >
          {loopAccounts.map((account, index) => (
            <div
              key={`${account.id}-${index}`}
              className="w-[280px] sm:w-[320px] flex-shrink-0 bg-[#111827]/90 border border-white/10 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_12px_35px_rgba(255,107,0,0.2)] group"
            >
              {/* 16:9 Photo Area */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[#0A0E17]">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${account.thumbnail})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/70" />

                {/* Top-Right Badge: Mã Số (MS: XXXX) */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-black/90 border border-amber-500/40 text-[11px] font-mono font-black text-[#F59E0B] shadow-md">
                    {account.code}
                  </span>
                </div>

                {/* Top-Left Badge: Trạng Thái Thuê */}
                <div className="absolute top-2.5 left-2.5">
                  {account.status === "AVAILABLE" ? (
                    <span className="px-2.5 py-1 rounded-md bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] text-[10px] font-black tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      <span>SẴN SÀNG</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[10px] font-black tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>ĐANG THUÊ</span>
                    </span>
                  )}
                </div>

                {/* Bottom Rank Badge */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${account.rankBadgeBg}`}
                  >
                    {account.rank}
                  </span>
                </div>
              </div>

              {/* Card Body: Gọn Gàng, Liền Mạch */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  {/* Tên Tướng Tí Nị Nổi Bật */}
                  <div className="text-[11px] font-bold text-[#F59E0B] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{account.mainChibi}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-100 line-clamp-2 leading-snug group-hover:text-[#F59E0B] transition-colors">
                    {account.title}
                  </h3>

                  {/* Sân Đấu */}
                  <p className="text-[11px] text-gray-400 line-clamp-1 font-light">
                    🏟️ {account.mainArena}
                  </p>
                </div>

                {/* Card Footer: Giá Thuê & 2 Nút "Chi Tiết" / "Thuê Ngay" */}
                <div className="pt-2.5 border-t border-white/10 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Giá Thuê:</span>
                    <div className="text-right">
                      <span className="text-base font-black text-[#F59E0B] font-mono">
                        {account.hourlyPrice.toLocaleString()}đ
                      </span>
                      <span className="text-[10px] text-gray-400 font-light"> / Giờ</span>
                      <span className="text-[10px] text-gray-500 block font-mono">
                        ({account.dailyPrice.toLocaleString()}đ/Ngày)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectAccount(account)}
                      className="h-9 px-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 hover:text-white border border-white/10 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      title="Xem chi tiết tài khoản"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi Tiết</span>
                    </button>

                    <button
                      onClick={() => onSelectAccount(account)}
                      className="h-9 px-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] hover:scale-105 flex items-center justify-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Thuê Ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. NÚT LỚN "XEM THÊM TOÀN BỘ KHO ACC" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
        <button
          onClick={() => setShowFullCatalog(!showFullCatalog)}
          className={`h-14 px-8 inline-flex items-center justify-center gap-3 rounded-2xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-xl ${
            showFullCatalog
              ? "bg-[#111827] border border-amber-500/50 text-[#F59E0B] hover:bg-[#1F2937]"
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.35)] hover:scale-105"
          }`}
        >
          <KeyRound className="w-5 h-5" />
          <span>
            {showFullCatalog
              ? "THU GỌN LẠI (CHẾ ĐỘ 5 ACC TIÊU BIỂU)"
              : `XEM THÊM TOÀN BỘ KHO ACC CHO THUÊ (${TFT_RENTAL_ACCOUNTS.length}+ ACC CÓ SẴN)`}
          </span>
          {showFullCatalog ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5 animate-bounce" />
          )}
        </button>
      </div>

      {/* 3. KHU VỰC MỞ RỘNG (CAM KẾT + BỘ LỌC + GRID 4 CỘT TẤT CẢ ACC) */}
      {showFullCatalog && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-10 border-t border-white/10 space-y-10 animate-fadeIn">
          {/* KHUNG CAM KẾT THUÊ ACC */}
          <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
              {/* Cam kết 1 */}
              <div className="flex items-start gap-3 bg-[#0A0E17]/60 p-4 rounded-xl border border-white/5 hover:border-[#10B981]/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-100 uppercase text-[11px]">Bàn Giao Tự Động</h4>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Nhận ngay ID & Mật Khẩu qua Zalo trong 30 giây sau khi quét QR thanh toán.
                  </p>
                </div>
              </div>

              {/* Cam kết 2 */}
              <div className="flex items-start gap-3 bg-[#0A0E17]/60 p-4 rounded-xl border border-white/5 hover:border-[#10B981]/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-100 uppercase text-[11px]">Đúng 100% Ảnh Mô Tả</h4>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Cam kết đúng Tướng Tí Nị, Sân Đấu và Bậc Rank như thông tin công khai.
                  </p>
                </div>
              </div>

              {/* Cam kết 3 */}
              <div className="flex items-start gap-3 bg-[#0A0E17]/60 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-100 uppercase text-[11px]">Nghiêm Cấm Hack/Phá</h4>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Nghiêm cấm dùng phần mềm thứ 3 hoặc phá rank (vi phạm sẽ khóa quyền truy cập).
                  </p>
                </div>
              </div>

              {/* Cam kết 4 */}
              <div className="flex items-start gap-3 bg-[#0A0E17]/60 p-4 rounded-xl border border-white/5 hover:border-[#10B981]/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-100 uppercase text-[11px]">Hỗ Trợ Đổi Acc 24/7</h4>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Đổi acc tương đương hoặc bù giờ ngay lập tức nếu phát sinh lỗi kỹ thuật.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BỘ LỌC & TÌM KIẾM (FILTER BAR) */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
              {/* Dropdown 1: Thời Gian Thuê */}
              <div className="lg:col-span-3">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">
                  Thời Gian Thuê
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#0A0E17] border border-white/10 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {RENTAL_DURATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Bậc Rank */}
              <div className="lg:col-span-3">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">
                  Bậc Rank Hiện Tại
                </label>
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#0A0E17] border border-white/10 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {RANK_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 3: Tướng Tí Nị */}
              <div className="lg:col-span-3">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">
                  Tướng Tí Nị
                </label>
                <select
                  value={selectedChibi}
                  onChange={(e) => setSelectedChibi(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#0A0E17] border border-white/10 rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {CHIBI_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="lg:col-span-3">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">
                  Tìm Theo Mã Số / Tên
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập mã MS: 8899..."
                    className="w-full h-11 pl-9 pr-3 bg-[#0A0E17] border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quick Counter */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5 text-xs text-gray-400">
              <div>
                Hiển thị <strong className="text-gray-100 font-mono">{filteredAccounts.length}</strong> tài khoản cho thuê trong kho
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[#10B981] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span>🟢 Sẵn sàng thuê ngay</span>
                </span>
              </div>
            </div>
          </div>

          {/* GRID 4 CỘT TOÀN BỘ DANH SÁCH ACC */}
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-16 bg-[#111827] border border-white/10 rounded-2xl p-8">
              <KeyRound className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                Không tìm thấy tài khoản cho thuê phù hợp
              </h3>
              <p className="text-xs text-gray-400 font-light mt-1">
                Vui lòng thay đổi bộ lọc hoặc liên hệ Zalo để đặt thuê acc riêng theo yêu cầu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-[#111827]/90 border border-white/10 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_12px_35px_rgba(255,107,0,0.2)] group"
                >
                  {/* 16:9 Photo Area */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#0A0E17]">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${account.thumbnail})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/70" />

                    {/* Top-Right Badge: Mã Số (MS: XXXX) */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-black/90 border border-amber-500/40 text-[11px] font-mono font-black text-[#F59E0B] shadow-md">
                        {account.code}
                      </span>
                    </div>

                    {/* Top-Left Badge: Trạng Thái Thuê */}
                    <div className="absolute top-2.5 left-2.5">
                      {account.status === "AVAILABLE" ? (
                        <span className="px-2.5 py-1 rounded-md bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] text-[10px] font-black tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          <span>SẴN SÀNG</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[10px] font-black tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>ĐANG THUÊ</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Rank Badge */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${account.rankBadgeBg}`}
                      >
                        {account.rank}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Gọn Gàng, Liền Mạch */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Tên Tướng Tí Nị Nổi Bật */}
                      <div className="text-[11px] font-bold text-[#F59E0B] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{account.mainChibi}</span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-100 line-clamp-2 leading-snug group-hover:text-[#F59E0B] transition-colors">
                        {account.title}
                      </h3>

                      {/* Sân Đấu */}
                      <p className="text-[11px] text-gray-400 line-clamp-1 font-light">
                        🏟️ {account.mainArena}
                      </p>
                    </div>

                    {/* Card Footer: Giá Thuê & 2 Nút "Chi Tiết" / "Thuê Ngay" */}
                    <div className="pt-2.5 border-t border-white/10 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Giá Thuê:</span>
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-[#F59E0B] font-mono">
                            {account.hourlyPrice.toLocaleString()}đ
                          </span>
                          <span className="text-[10px] text-gray-400 font-light"> / Giờ</span>
                          <span className="text-[10px] text-gray-500 block font-mono">
                            ({account.dailyPrice.toLocaleString()}đ/Ngày)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onSelectAccount(account)}
                          className="h-9 px-2 bg-[#1F2937] hover:bg-[#374151] text-gray-200 hover:text-white border border-white/10 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                          title="Xem chi tiết tài khoản"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết</span>
                        </button>

                        <button
                          onClick={() => onSelectAccount(account)}
                          className="h-9 px-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] hover:scale-105 flex items-center justify-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Thuê Ngay</span>
                        </button>
                      </div>
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
