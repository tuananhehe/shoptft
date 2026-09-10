"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { TFTRentalAccount, TFT_RENTAL_ACCOUNTS } from "@/data/tft-data";
import { getVipAndCloneAccounts, formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { TFTImageLightbox } from "@/components/tft-image-lightbox";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  X,
} from "lucide-react";

interface TFTShopProps {
  onSelectAccount: (account: TFTRentalAccount) => void;
}

const shopContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

const shopCardVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const RENTAL_DURATIONS = [
  { id: "ALL", label: "Tất cả gói thuê" },
  { id: "HOURLY", label: "Thuê theo giờ (Từ 6k/h)" },
  { id: "DAILY", label: "Thuê theo ngày (Từ 25k/ngày)" },
  { id: "NIGHT", label: "Thuê qua đêm (22h - 8h Sáng)" },
];

const BASE_RANK_OPTIONS = [
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

/**
 * Chuẩn hóa chuỗi tiếng Việt: chuyển chữ thường, bỏ dấu, chuyển ký tự đặc biệt thành khoảng trắng
 */
const removeVietnameseAccents = (str?: string | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Helper tìm kiếm thông minh: Tìm kiếm mọi thuộc tính bao gồm Sân Đấu, Tướng Tí Nị, Rank, Mã số, Mô tả
 * Hỗ trợ gõ có dấu lẫn không dấu (VD: "san dau", "paris", "kda", "8899", "aatrox")
 */
const matchesAccountSearch = (acc: TFTRentalAccount, query: string): boolean => {
  const trimmed = (query || "").trim();
  if (!trimmed) return true;

  const allArenasStr = Array.isArray(acc.allArenas) ? acc.allArenas.join(" ") : "";
  const allChibiStr = Array.isArray(acc.allChibi) ? acc.allChibi.join(" ") : "";

  const fullText = [
    acc.code,
    acc.title,
    acc.mainArena,
    allArenasStr,
    acc.mainChibi,
    allChibiStr,
    acc.rank,
    acc.description,
    acc.tag,
  ]
    .filter(Boolean)
    .join(" ");

  const rawLowerTarget = fullText.toLowerCase();
  const rawLowerQuery = trimmed.toLowerCase();

  // 1. Khớp chuỗi trực tiếp (có dấu)
  if (rawLowerTarget.includes(rawLowerQuery)) return true;

  // 2. Chuẩn hóa không dấu
  const targetNorm = removeVietnameseAccents(fullText);
  const queryNorm = removeVietnameseAccents(trimmed);

  if (targetNorm.includes(queryNorm)) return true;

  // 3. Khớp không khoảng trắng (VD: "ms735" khớp "MS: 735", "sanxanh" khớp "Sân Xanh")
  const targetCompact = targetNorm.replace(/\s+/g, "");
  const queryCompact = queryNorm.replace(/\s+/g, "");
  if (queryCompact && targetCompact.includes(queryCompact)) return true;

  // 4. Khớp đa từ khóa (Mọi từ đơn trong query đều phải xuất hiện trong target)
  const queryTokens = queryNorm.split(" ").filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => targetNorm.includes(token));
  }

  return false;
};

export const TFTShop: React.FC<TFTShopProps> = ({ onSelectAccount }) => {
  // Khởi tạo sẵn danh sách có sẵn để render tức thì 0s, sau đó fetch ngầm từ Supabase
  const [vipAccounts, setVipAccounts] = useState<TFTRentalAccount[]>(TFT_RENTAL_ACCOUNTS || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("ALL");
  const [selectedRank, setSelectedRank] = useState("ALL");
  const [selectedChibi, setSelectedChibi] = useState("ALL");
  const [selectedArena, setSelectedArena] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [selectedSort, setSelectedSort] = useState<"DEFAULT" | "PRICE_ASC" | "PRICE_DESC">("DEFAULT");
  const [visibleCount, setVisibleCount] = useState(12);
  const [previewAccount, setPreviewAccount] = useState<TFTRentalAccount | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

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

  // Thống kê số lượng acc Available / Rented thực tế trong kho
  const statusStats = useMemo(() => {
    let availableCount = 0;
    let rentedCount = 0;
    vipAccounts.forEach((acc) => {
      const isRented = (acc.status || "").toUpperCase() === "RENTED";
      if (isRented) rentedCount++;
      else availableCount++;
    });
    return {
      total: vipAccounts.length,
      available: availableCount,
      rented: rentedCount,
    };
  }, [vipAccounts]);

  // Trích xuất danh sách Tướng Tí Nị thực tế có trong kho
  const dynamicChibiOptions = useMemo(() => {
    const chibis = new Set<string>();
    vipAccounts.forEach((acc) => {
      if (acc.mainChibi && acc.mainChibi !== "Tí Nị Thần Thoại") {
        chibis.add(acc.mainChibi.trim());
      }
      if (Array.isArray(acc.allChibi)) {
        acc.allChibi.forEach((c) => {
          if (c && c !== "Tí Nị Thần Thoại") chibis.add(c.trim());
        });
      }
    });
    return Array.from(chibis).slice(0, 30);
  }, [vipAccounts]);

  // Trích xuất danh sách Sân Đấu thực tế có trong kho
  const dynamicArenaOptions = useMemo(() => {
    const arenas = new Set<string>();
    vipAccounts.forEach((acc) => {
      if (acc.mainArena && acc.mainArena !== "Sân Đấu Thần Thoại") {
        arenas.add(acc.mainArena.trim());
      }
      if (Array.isArray(acc.allArenas)) {
        acc.allArenas.forEach((a) => {
          if (a && a !== "Sân Đấu Thần Thoại") arenas.add(a.trim());
        });
      }
    });
    return Array.from(arenas).slice(0, 30);
  }, [vipAccounts]);

  // Reset số lượng tài khoản hiển thị ban đầu khi người dùng đổi bộ lọc/tìm kiếm
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedRank, selectedChibi, selectedArena, selectedStatus, selectedSort, showFullCatalog]);

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
  const filteredAccounts = useMemo(() => {
    return vipAccounts
      .filter((acc) => {
        // 1. Khớp trạng thái thuê (Sẵn sàng / Đang thuê)
        const isRented = (acc.status || "").toUpperCase() === "RENTED";
        const matchesStatus =
          selectedStatus === "ALL" ||
          (selectedStatus === "RENTED" && isRented) ||
          (selectedStatus === "AVAILABLE" && !isRented);

        // 2. Khớp Bậc Rank
        const rankStr = (acc.rank || "").toUpperCase();
        const rankNorm = removeVietnameseAccents(acc.rank);
        const selRankNorm = removeVietnameseAccents(selectedRank);
        const matchesRank =
          selectedRank === "ALL" ||
          rankStr === selectedRank ||
          rankNorm.includes(selRankNorm) ||
          (selectedRank === "VÀNG/BẠCH KIM" && (rankNorm.includes("vang") || rankNorm.includes("bach kim"))) ||
          (selectedRank === "ĐỒNG" && (rankNorm.includes("dong") || rankNorm.includes("sat"))) ||
          (selectedRank === "KHÔNG RANK" && (rankNorm.includes("khong rank") || rankNorm.includes("unranked")));

        // 3. Khớp Tướng Tí Nị
        const chibiNorm = removeVietnameseAccents(selectedChibi);
        const accChibiNorm = removeVietnameseAccents(`${acc.mainChibi || ""} ${(acc.allChibi || []).join(" ")}`);
        const matchesChibi = selectedChibi === "ALL" || accChibiNorm.includes(chibiNorm);

        // 4. Khớp Sân Đấu
        const arenaNorm = removeVietnameseAccents(selectedArena);
        const accArenaNorm = removeVietnameseAccents(`${acc.mainArena || ""} ${(acc.allArenas || []).join(" ")}`);
        const matchesArena = selectedArena === "ALL" || accArenaNorm.includes(arenaNorm);

        // 5. Khớp Tìm kiếm toàn diện (Sân đấu, Tướng, Rank, Mã số, Mô tả, v.v.)
        const matchesSearch = matchesAccountSearch(acc, searchTerm);

        return matchesStatus && matchesRank && matchesChibi && matchesArena && matchesSearch;
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
  }, [vipAccounts, selectedStatus, selectedRank, selectedChibi, selectedArena, searchTerm, selectedSort]);

  // Tải lũy tiến: Chỉ render số lượng acc hiện tại để tránh giật lag khi danh sách có hàng trăm acc
  const visibleAccounts = filteredAccounts.slice(0, visibleCount);

  // IntersectionObserver tự động nạp tiếp 12 acc tiếp theo khi người dùng cuộn đến gần cuối
  useEffect(() => {
    if (!showFullCatalog) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredAccounts.length) {
          setVisibleCount((prev) => Math.min(prev + 12, filteredAccounts.length));
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showFullCatalog, visibleCount, filteredAccounts.length]);

  return (
    <section id="shop" className="pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24 bg-[#F8F9FA] border-t border-slate-200/90 border-b border-slate-200/90 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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
          <div className="flex gap-3 sm:gap-5 px-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar py-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-[165px] sm:w-[280px] lg:w-[280px] xl:w-[290px] flex-shrink-0 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4.5 shadow-xs animate-pulse space-y-2.5"
              >
                <div className="aspect-square w-full rounded-lg sm:rounded-xl bg-slate-200" />
                <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center gap-2">
                  <div className="h-3.5 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-7 sm:h-8 bg-slate-200 rounded-lg sm:rounded-xl w-1/2" />
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
            className="animate-infinite-loop flex gap-3 sm:gap-5 px-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {loopAccounts.map((account, index) => (
              <div
                key={`${account.id}-${index}`}
                className="w-[165px] sm:w-[280px] lg:w-[280px] xl:w-[290px] flex-shrink-0 flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
              >
                {/* Top Photo & Badges */}
                <div>
                  <div
                    onClick={() => setPreviewAccount(account)}
                    className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-900 mb-2 sm:mb-3 border border-slate-100 shadow-inner cursor-pointer group-hover:border-orange-300 transition-colors"
                  >
                    <LazyAccountImage
                      src={account.thumbnail}
                      alt={`Thuê acc TFT VIP ${account.code} có ${account.mainChibi} - Tuấn Thái Bình`}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top Right Code Badge */}
                    <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-black/80 text-[9px] sm:text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                        {account.code}
                      </span>
                    </div>

                    {/* Top Left Status Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                      {account.status === "AVAILABLE" ? (
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-emerald-600/90 text-white text-[8px] sm:text-[10px] font-bold tracking-tight sm:tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse" />
                          <span>SẴN SÀNG</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-rose-600/90 text-white text-[8px] sm:text-[10px] font-bold tracking-tight sm:tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
                          <span>ĐANG THUÊ</span>
                          {account.rentedUntil && formatRentalExpiry(account.rentedUntil)?.shortCountdown && (
                            <span className="text-[8px] sm:text-[9px] font-mono bg-black/30 px-0.5 rounded hidden sm:inline">
                              {formatRentalExpiry(account.rentedUntil)?.shortCountdown}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Bottom Rank Badge */}
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3">
                      <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded sm:rounded-md bg-white/95 text-slate-900 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                        {account.rank}
                      </span>
                    </div>
                  </div>

                  {/* Tướng Tí Nị */}
                  <div className="text-slate-900 font-bold text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                    {account.mainChibi}
                  </div>

                  {/* Sân Đấu */}
                  <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 sm:mt-1 font-medium flex items-center gap-1">
                    <span>🏟️</span>
                    <span>{account.mainArena}</span>
                  </p>
                </div>

                {/* Price & Actions */}
                <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                  <div className="flex items-baseline justify-between flex-wrap gap-x-1">
                    <div>
                      <span className="text-xs sm:text-base md:text-lg font-bold text-red-600 font-mono">
                        {(Number(account.hourlyPrice) || 15000).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-600 font-medium"> / Giờ</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:inline">
                      120+ lượt
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 sm:gap-2">
                    <button
                      onClick={() => setPreviewAccount(account)}
                      className="h-7 sm:h-9 px-1 sm:px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span>Chi Tiết</span>
                    </button>

                    <button
                      onClick={() => onSelectAccount(account)}
                      className="h-7 sm:h-9 px-1 sm:px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
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

      {/* 3. KHU VỰC MỞ RỘNG (BỘ LỌC + GRID TÀI KHOẢN) */}
      {showFullCatalog && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200/80 space-y-6 sm:space-y-8 animate-fadeIn">
          {/* BỘ LỌC & TÌM KIẾM */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
            {/* Quick Status & Rank Pills for Fast Touch on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              <button
                type="button"
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Tất Cả ({statusStats.total})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("AVAILABLE")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === "AVAILABLE"
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sẵn Sàng ({statusStats.available})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("RENTED")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === "RENTED"
                    ? "bg-rose-600 text-white shadow-xs shadow-rose-600/20"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Đang Thuê ({statusStats.rented})</span>
              </button>
              {(selectedStatus !== "ALL" || selectedRank !== "ALL" || selectedChibi !== "ALL" || selectedArena !== "ALL" || searchTerm || selectedSort !== "DEFAULT") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus("ALL");
                    setSelectedRank("ALL");
                    setSelectedChibi("ALL");
                    setSelectedArena("ALL");
                    setSearchTerm("");
                    setSelectedSort("DEFAULT");
                  }}
                  className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 items-center">
              {/* 1. Lọc Rank */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Bậc Rank TFT
                </label>
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="w-full h-10 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer truncate"
                >
                  {BASE_RANK_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Lọc Tướng Tí Nị */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Tướng Tí Nị
                </label>
                <select
                  value={selectedChibi}
                  onChange={(e) => setSelectedChibi(e.target.value)}
                  className="w-full h-10 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer truncate"
                >
                  <option value="ALL">Tất cả tướng Tí Nị ({dynamicChibiOptions.length})</option>
                  {dynamicChibiOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Lọc Sân Đấu */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Sân Đấu Thần Thoại
                </label>
                <select
                  value={selectedArena}
                  onChange={(e) => setSelectedArena(e.target.value)}
                  className="w-full h-10 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer truncate"
                >
                  <option value="ALL">Tất cả sân đấu ({dynamicArenaOptions.length})</option>
                  {dynamicArenaOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Lọc Trạng Thái Thuê / Chưa Thuê */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Trạng Thái Thuê
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full h-10 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer truncate"
                >
                  <option value="ALL">Tất Cả ({statusStats.total})</option>
                  <option value="AVAILABLE">🟢 Sẵn Sàng ({statusStats.available})</option>
                  <option value="RENTED">🔴 Đang Cho Thuê ({statusStats.rented})</option>
                </select>
              </div>

              {/* 5. Sắp Xếp Giá */}
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block flex items-center justify-between">
                  <span>Sắp Xếp Giá</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="w-full h-10 px-2.5 sm:px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer truncate"
                >
                  <option value="DEFAULT">Mặc Định</option>
                  <option value="PRICE_ASC">Giá: Thấp đến Cao ↗</option>
                  <option value="PRICE_DESC">Giá: Cao đến Thấp ↘</option>
                </select>
              </div>
            </div>

            {/* Thanh Tìm Kiếm Đa Năng */}
            <div className="pt-2 border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Tìm kiếm Sân Đấu (VD: Tiệm Trà, Paris, Sân Xanh, KDA...), Tướng Tí Nị, Mã số (MS: 735), Rank..."
                  className="w-full h-10.5 pl-9.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 absolute right-2.5 top-2.5 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* GRID 4 CỘT HIỂN THỊ TOÀN BỘ ACC VIP LỌC ĐƯỢC */}
          {filteredAccounts.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                Không tìm thấy tài khoản VIP nào phù hợp với bộ lọc hiện tại.
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {selectedStatus === "RENTED" && statusStats.rented === 0
                  ? "Hiện tại tất cả tài khoản đều đang Sẵn Sàng (chưa có acc nào đang cho thuê)."
                  : selectedStatus === "AVAILABLE" && statusStats.available === 0
                  ? "Hiện tại tất cả tài khoản đều đang có khách thuê."
                  : "Bạn có thể thử tìm với từ khóa khác, chọn lại Trạng Thái Thuê hoặc đặt lại bộ lọc."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRank("ALL");
                    setSelectedChibi("ALL");
                    setSelectedArena("ALL");
                    setSelectedDuration("ALL");
                    setSelectedStatus("ALL");
                    setSelectedSort("DEFAULT");
                  }}
                  className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Đặt lại toàn bộ bộ lọc
                </button>

                {selectedStatus !== "ALL" && (
                  <button
                    onClick={() => setSelectedStatus("ALL")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Xem tất cả ({statusStats.total} acc)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* THANH THỐNG KÊ TIẾN ĐỘ TẢI ACC */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>
                  Đang hiển thị{" "}
                  <strong className="text-slate-900 font-bold font-mono">
                    {visibleAccounts.length}
                  </strong>{" "}
                  / {filteredAccounts.length} tài khoản VIP phù hợp
                </span>
                {visibleCount < filteredAccounts.length && (
                  <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
                    Tự động tải thêm khi cuộn
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {visibleAccounts.map((account) => (
                  <div
                    key={account.id}
                    style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
                    className="flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group animate-fadeIn"
                  >
                    {/* Top Photo & Badges */}
                    <div>
                      <div
                        onClick={() => setPreviewAccount(account)}
                        className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-900 mb-2 sm:mb-3 border border-slate-100 shadow-inner cursor-pointer group-hover:border-orange-300 transition-colors"
                      >
                        <LazyAccountImage
                          src={account.thumbnail}
                          alt={`Thuê acc TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Right Code Badge */}
                        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-black/80 text-[9px] sm:text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                            {account.code}
                          </span>
                        </div>

                        {/* Top Left Status Badge */}
                        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
                          {account.status === "AVAILABLE" ? (
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-emerald-600/90 text-white text-[8px] sm:text-[10px] font-bold tracking-tight sm:tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse" />
                              <span>SẴN SÀNG</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-rose-600/90 text-white text-[8px] sm:text-[10px] font-bold tracking-tight sm:tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
                              <span>ĐANG THUÊ</span>
                              {account.rentedUntil && formatRentalExpiry(account.rentedUntil)?.shortCountdown && (
                                <span className="text-[8px] sm:text-[9px] font-mono bg-black/30 px-0.5 rounded hidden sm:inline">
                                  {formatRentalExpiry(account.rentedUntil)?.shortCountdown}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Bottom Rank Badge */}
                        <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-10">
                          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded sm:rounded-md bg-white/95 text-slate-900 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                            {account.rank}
                          </span>
                        </div>
                      </div>

                      {/* Tướng Tí Nị */}
                      <div className="text-slate-900 font-bold text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                        {account.mainChibi}
                      </div>

                      {/* Sân Đấu */}
                      <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 sm:mt-1 font-medium flex items-center gap-1">
                        <span>🏟️</span>
                        <span>{account.mainArena}</span>
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                      <div className="flex items-baseline justify-between flex-wrap gap-x-1">
                        <div>
                          <span className="text-xs sm:text-base md:text-lg font-bold text-red-600 font-mono">
                            {(Number(account.hourlyPrice) || 15000).toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-600 font-medium"> / Giờ</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:inline">
                          120+ lượt
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 sm:gap-2">
                        <button
                          onClick={() => setPreviewAccount(account)}
                          className="h-7 sm:h-9 px-1 sm:px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span>Chi Tiết</span>
                        </button>

                        <button
                          onClick={() => onSelectAccount(account)}
                          className="h-7 sm:h-9 px-1 sm:px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span>Thuê Ngay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SENTINEL INFINITE SCROLL & TẢI THÊM PROGRESSIVE */}
              <div ref={loadMoreSentinelRef} className="py-4 flex flex-col items-center justify-center gap-2">
                {visibleCount < filteredAccounts.length ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                      <span>Đang nạp thêm tài khoản ({visibleAccounts.length}/{filteredAccounts.length})...</span>
                    </div>
                    <button
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredAccounts.length))}
                      className="text-xs text-orange-700 hover:text-orange-800 font-bold bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      Bấm để tải thêm ngay (+12 acc)
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    ✓ Đã tải hoàn tất toàn bộ {filteredAccounts.length} tài khoản VIP
                  </p>
                )}
              </div>
            </>
          )}

          {/* NÚT THU GỌN Ở ĐÁY GRID */}
          <div className="text-center pt-2">
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

      {/* Lightbox Phóng to ảnh chi tiết tài khoản VIP */}
      <TFTImageLightbox
        isOpen={!!previewAccount}
        imageUrl={previewAccount?.thumbnail || ""}
        title={previewAccount?.title || ""}
        code={previewAccount?.code || ""}
        rank={previewAccount?.rank}
        price={`${(Number(previewAccount?.hourlyPrice) || 15000).toLocaleString("vi-VN")}đ / Giờ`}
        status={previewAccount?.status}
        onClose={() => setPreviewAccount(null)}
        onRentNow={() => {
          if (previewAccount) {
            onSelectAccount(previewAccount);
          }
        }}
      />
    </section>
  );
};
