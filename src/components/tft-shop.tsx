"use client";

import React, { useState, useRef, useEffect } from "react";
import { TFTRentalAccount, TFT_RENTAL_ACCOUNTS } from "@/data/tft-data";
import { getVipAndCloneAccounts, formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { motion, Variants } from "framer-motion";
import {
  Search,
  KeyRound,
  Eye,
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Loader2,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface TFTShopProps {
  onSelectAccount: (account: TFTRentalAccount) => void;
}

const shopContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const shopCardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

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
  { id: "BẠC", label: "Bạc" },
  { id: "ĐỒNG", label: "Đồng / Sắt" },
  { id: "KHÔNG RANK", label: "Không Rank / Unranked" },
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
  // Khởi tạo sẵn danh sách có sẵn để render tức thì 0s, sau đó fetch ngầm từ Supabase
  const [vipAccounts, setVipAccounts] = useState<TFTRentalAccount[]>(TFT_RENTAL_ACCOUNTS || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("ALL");
  const [selectedRank, setSelectedRank] = useState("ALL");
  const [selectedChibi, setSelectedChibi] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [selectedSort, setSelectedSort] = useState<"DEFAULT" | "PRICE_ASC" | "PRICE_DESC">("DEFAULT");
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch dữ liệu mới nhất từ Supabase chạy ngầm
  useEffect(() => {
    let isMounted = true;
    getVipAndCloneAccounts().then(({ vipAccounts: fetchedVip }) => {
      if (isMounted && fetchedVip && fetchedVip.length > 0) {
        setVipAccounts(fetchedVip);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Top 6 Featured Accounts for horizontal loop
  const featuredAccounts = vipAccounts.slice(0, 6);
  const loopAccounts =
    featuredAccounts.length > 0 ? [...featuredAccounts, ...featuredAccounts] : [];

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -310, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 310, behavior: "smooth" });
    }
  };

  // Filtered & Sorted Accounts for Full Catalog
  const filteredAccounts = vipAccounts
    .filter((acc) => {
      const isRented = (acc.status || "").toUpperCase() === "RENTED";
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "RENTED" && isRented) ||
        (selectedStatus === "AVAILABLE" && !isRented);

      const rankStr = (acc.rank || "").toUpperCase();
      const matchesRank =
        selectedRank === "ALL" ||
        rankStr === selectedRank ||
        rankStr.includes(selectedRank) ||
        (selectedRank === "VÀNG/BẠCH KIM" && (rankStr.includes("VÀNG") || rankStr.includes("BẠCH KIM"))) ||
        (selectedRank === "ĐỒNG" && (rankStr.includes("ĐỒNG") || rankStr.includes("SẮT")));

      const mainChibiStr = (acc.mainChibi || "").toLowerCase();
      const allChibiArr = Array.isArray(acc.allChibi) ? acc.allChibi : [];
      const chibiQuery = (selectedChibi === "ALL" ? "" : selectedChibi).toLowerCase();

      const matchesChibi =
        selectedChibi === "ALL" ||
        mainChibiStr.includes(chibiQuery) ||
        allChibiArr.some((c) => (c || "").toLowerCase().includes(chibiQuery));

      const query = searchTerm.trim().toLowerCase();
      const titleStr = (acc.title || "").toLowerCase();
      const codeStr = (acc.code || "").toLowerCase();

      const matchesSearch =
        query === "" ||
        titleStr.includes(query) ||
        codeStr.includes(query) ||
        mainChibiStr.includes(query) ||
        rankStr.toLowerCase().includes(query);

      return matchesStatus && matchesRank && matchesChibi && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = Number(a.hourlyPrice) || 0;
      const priceB = Number(b.hourlyPrice) || 0;
      if (selectedSort === "PRICE_ASC") {
        return priceA - priceB;
      }
      if (selectedSort === "PRICE_DESC") {
        return priceB - priceA;
      }
      return 0;
    });

  return (
    <section id="shop" className="pt-8 pb-14 sm:pt-10 sm:pb-16 bg-slate-50 border-t border-slate-200/80 border-b border-slate-200 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Tài Khoản & Dịch Vụ Nổi Bật</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-gaming uppercase">
              KHO THUÊ ACC TFT VIP
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-normal">
              Trải nghiệm acc VIP sở hữu Tướng Tí Nị Thần Thoại & Sân Đấu Đổi Nhạc chỉ từ 6k/giờ. Tự động nhận pass sau khi thanh toán.
            </p>
          </div>

          {/* 2 NÚT ICON MŨI TÊN ĐIỀU HƯỚNG TRÒN (PREV / NEXT) */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handlePrev}
              aria-label="Previous accounts"
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-500 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next accounts"
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-500 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 1. SEAMLESS INFINITE MARQUEE AUTO-LOOP TRACK */}
      <div className="max-w-7xl mx-auto relative w-full py-3 overflow-hidden">
        {isLoading ? (
          /* SKELETON LOADING STATE CHO KHO VIP */
          <div className="flex gap-5 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[270px] sm:w-[290px] lg:w-[280px] xl:w-[290px] flex-shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-sm animate-pulse space-y-3"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-200" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-8 bg-slate-200 rounded-xl w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : vipAccounts.length === 0 ? (
          /* EMPTY STATE */
          <div className="px-4 py-12 text-center text-slate-500 bg-white mx-4 rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold">
              Đang kết nối cơ sở dữ liệu Supabase hoặc chưa có tài khoản VIP nào trong bảng.
            </p>
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="animate-infinite-loop flex gap-5 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {loopAccounts.map((account, index) => (
              <div
                key={`${account.id}-${index}`}
                className="w-[270px] sm:w-[290px] lg:w-[280px] xl:w-[290px] flex-shrink-0 flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
              >
                {/* Top Photo & Badges */}
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900 mb-3 border border-slate-100 shadow-inner">
                    <img
                      src={account.thumbnail}
                      alt={`Thuê acc TFT VIP ${account.code} có ${account.mainChibi} - Tuấn Thái Bình`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top Right Code Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                        {account.code}
                      </span>
                    </div>

                    {/* Top Left Status Badge */}
                    <div className="absolute top-3 left-3">
                      {account.status === "AVAILABLE" ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>SẴN SÀNG</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
                          <span>ĐANG THUÊ</span>
                          {account.rentedUntil && formatRentalExpiry(account.rentedUntil)?.shortCountdown && (
                            <span className="text-[9px] font-mono bg-black/30 px-1 rounded">
                              {formatRentalExpiry(account.rentedUntil)?.shortCountdown}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Bottom Rank Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                        {account.rank}
                      </span>
                    </div>
                  </div>

                  {/* Tướng Tí Nị */}
                  <div className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                    {account.mainChibi}
                  </div>

                  {/* Sân Đấu */}
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium flex items-center gap-1.5">
                    <span>🏟️</span>
                    <span>{account.mainArena}</span>
                  </p>
                </div>

                {/* Price & Actions */}
                <div className="mt-auto pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                        {(Number(account.hourlyPrice) || 15000).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-xs text-slate-600 font-medium"> / Giờ</span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      Đã thuê: 120+ lượt
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectAccount(account)}
                      className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi Tiết</span>
                    </button>

                    <button
                      onClick={() => onSelectAccount(account)}
                      className="h-9 px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer"
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

      {/* 2. NÚT LỚN "XEM THÊM" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
        <button
          onClick={() => setShowFullCatalog(!showFullCatalog)}
          className={`max-w-md mx-auto w-full py-3 sm:py-3.5 px-6 inline-flex items-center justify-center gap-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md cursor-pointer ${
            showFullCatalog
              ? "bg-slate-800 text-white hover:bg-slate-900"
              : "bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white shadow-orange-700/25 hover:scale-105"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            {showFullCatalog
              ? "Thu gọn lại (Chế độ 6 acc tiêu biểu)"
              : `Xem thêm toàn bộ kho acc (${vipAccounts.length}+ acc có sẵn)`}
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
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Bàn Giao Tự Động</p>
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
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Đúng 100% Ảnh Mô Tả</p>
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
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Nghiêm Cấm Hack/Phá</p>
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
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Hỗ Trợ Đổi Acc 24/7</p>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Đổi acc tương đương hoặc bù giờ ngay lập tức nếu có sự cố.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BỘ LỌC & TÌM KIẾM */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-center">
              {/* Lọc Rank */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Bậc Rank TFT
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

              {/* Lọc Tướng Tí Nị */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Tướng Tí Nị Nổi Bật
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

              {/* Lọc Trạng Thái Thuê / Chưa Thuê */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Trạng Thái Thuê
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="AVAILABLE">🟢 Sẵn Sàng (Chưa Thuê)</option>
                  <option value="RENTED">🔴 Đang Cho Thuê</option>
                </select>
              </div>

              {/* Sắp Xếp Giá */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block flex items-center justify-between">
                  <span>Sắp Xếp Giá</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="DEFAULT">Mặc Định</option>
                  <option value="PRICE_ASC">Giá: Thấp đến Cao ↗</option>
                  <option value="PRICE_DESC">Giá: Cao đến Thấp ↘</option>
                </select>
              </div>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="pt-2 border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm mã số (VD: MS: 8899), Tướng Tí Nị, Sân Đấu, Rank..."
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* GRID 4 CỘT HIỂN THỊ TOÀN BỘ ACC VIP LỌC ĐƯỢC */}
          {filteredAccounts.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
              <p className="text-sm font-semibold text-slate-600">
                Không tìm thấy tài khoản VIP nào phù hợp với bộ lọc.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRank("ALL");
                  setSelectedChibi("ALL");
                  setSelectedDuration("ALL");
                  setSelectedStatus("ALL");
                  setSelectedSort("DEFAULT");
                }}
                className="mt-3 px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <motion.div
              variants={shopContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {filteredAccounts.map((account) => (
                <motion.div
                  key={account.id}
                  variants={shopCardVariants}
                  className="flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
                >
                  {/* Top Photo & Badges */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900 mb-3 border border-slate-100 shadow-inner">
                      <img
                        src={account.thumbnail}
                        alt={`Thuê acc TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Right Code Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                          {account.code}
                        </span>
                      </div>

                      {/* Top Left Status Badge */}
                      <div className="absolute top-3 left-3">
                        {account.status === "AVAILABLE" ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>SẴN SÀNG</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
                            <span>ĐANG THUÊ</span>
                            {account.rentedUntil && formatRentalExpiry(account.rentedUntil)?.shortCountdown && (
                              <span className="text-[9px] font-mono bg-black/30 px-1 rounded">
                                {formatRentalExpiry(account.rentedUntil)?.shortCountdown}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Bottom Rank Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                          {account.rank}
                        </span>
                      </div>
                    </div>

                    {/* Tướng Tí Nị */}
                    <div className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                      {account.mainChibi}
                    </div>

                    {/* Sân Đấu */}
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium flex items-center gap-1.5">
                      <span>🏟️</span>
                      <span>{account.mainArena}</span>
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="mt-auto pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                          {(Number(account.hourlyPrice) || 15000).toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-xs text-slate-600 font-medium"> / Giờ</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        Đã thuê: 120+ lượt
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectAccount(account)}
                        className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi Tiết</span>
                      </button>

                      <button
                        onClick={() => onSelectAccount(account)}
                        className="h-9 px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Thuê Ngay</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* NÚT THU GỌN Ở ĐÁY GRID */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setShowFullCatalog(false);
                const el = document.getElementById("shop");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
              <span>Thu gọn lại (Về chế độ Slider)</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
