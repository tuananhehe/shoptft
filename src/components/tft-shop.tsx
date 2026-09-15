"use client";

import React, { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { TFTRentalAccount, TFT_RENTAL_ACCOUNTS } from "@/data/tft-data";
import { getVipAndCloneAccounts, formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { getHomepageConfig } from "@/utils/homepage-service";
import { getAccountProductUrl } from "@/utils/account-lookup";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { TFTImageLightbox } from "@/components/tft-image-lightbox";
import { motion, AnimatePresence, Variants } from "framer-motion";
import toast from "react-hot-toast";
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
  Share2,
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
 * Helper lấy thông tin hiển thị giá thuê linh hoạt theo cấu hình Admin & Cấu hình Toàn Cục
 */
export const getAccountDisplayPrice = (account: TFTRentalAccount, globalMode?: string) => {
  const effectiveMode =
    account.priceDisplayType && account.priceDisplayType !== "AUTO"
      ? account.priceDisplayType
      : globalMode && globalMode !== "AUTO"
      ? globalMode
      : "HOURLY";

  if (effectiveMode === "DAILY") {
    const amount = account.dailyPrice || (Number(account.hourlyPrice) || 15000) * 3;
    return {
      price: amount,
      unit: " / Ngày",
      badge: "Gói Ngày",
    };
  }
  if (effectiveMode === "LONG_TERM") {
    const baseValue =
      Number(account.accountValue) ||
      Number(account.periodPrice) ||
      Number(account.monthlyPrice) ||
      ((Number(account.hourlyPrice) || 15000) * 50) ||
      850000;
    const amount = Number(account.periodPrice) || Number(account.monthlyPrice) || baseValue;
    return {
      price: amount,
      unit: account.periodUnit || " / ∞",
      badge: "Lâu Dài",
    };
  }
  if (effectiveMode === "CUSTOM") {
    const amount = account.customPrice || Number(account.hourlyPrice) || 15000;
    return {
      price: amount,
      unit: account.customPriceUnit ? ` ${account.customPriceUnit}` : "",
      badge: "Đặc Biệt",
    };
  }
  // Default HOURLY
  return {
    price: Number(account.hourlyPrice) || 15000,
    unit: " / Giờ",
    badge: "",
  };
};

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
  const [globalPriceMode, setGlobalPriceMode] = useState<string>("AUTO");
  const [isLoading, setIsLoading] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [selectedSort, setSelectedSort] = useState<"DEFAULT" | "PRICE_ASC" | "PRICE_DESC">("DEFAULT");
  const [visibleCount, setVisibleCount] = useState(12);
  const [previewAccount, setPreviewAccount] = useState<TFTRentalAccount | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Fetch dữ liệu mới nhất từ Supabase & cấu hình giá toàn cục chạy ngầm
  useEffect(() => {
    let isMounted = true;
    getVipAndCloneAccounts().then(({ vipAccounts: fetchedVip }) => {
      if (isMounted && fetchedVip && fetchedVip.length > 0) {
        setVipAccounts(fetchedVip);
      }
    });
    getHomepageConfig().then((cfg) => {
      if (isMounted && cfg?.pricing?.defaultPriceDisplayMode) {
        setGlobalPriceMode(cfg.pricing.defaultPriceDisplayMode);
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

  // Reset số lượng tài khoản hiển thị ban đầu khi người dùng đổi bộ lọc/tìm kiếm
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedStatus, selectedSort, showFullCatalog]);

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

        // 2. Khớp Tìm kiếm toàn diện (Sân đấu, Tướng, Rank, Mã số, Mô tả, v.v.)
        const matchesSearch = matchesAccountSearch(acc, deferredSearchTerm);

        return matchesStatus && matchesSearch;
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
  }, [vipAccounts, selectedStatus, deferredSearchTerm, selectedSort]);

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
            className="animate-infinite-loop flex items-stretch gap-3 sm:gap-4 px-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {loopAccounts.map((account, index) => (
              <div
                key={`${account.id}-${index}`}
                className="w-[170px] min-w-[170px] max-w-[170px] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] flex-shrink-0 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group select-none"
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
                    <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5">
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-black/80 text-[9px] sm:text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                        {account.code}
                      </span>
                    </div>

                    {/* Top Left Status Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5">
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
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5">
                      <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded sm:rounded-md bg-white/95 text-slate-900 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                        {account.rank}
                      </span>
                    </div>
                  </div>

                  {/* Tướng Tí Nị - Cố định chiều cao dòng */}
                  <div
                    onClick={() => onSelectAccount(account)}
                    className="text-slate-900 font-bold text-xs sm:text-sm leading-snug line-clamp-1 truncate group-hover:text-orange-700 transition-colors h-4 sm:h-5 cursor-pointer"
                  >
                    {account.mainChibi}
                  </div>

                  {/* Sân Đấu - Cố định chiều cao dòng */}
                  <p
                    onClick={() => onSelectAccount(account)}
                    className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 truncate mt-0.5 sm:mt-1 font-medium flex items-center gap-1 h-3.5 sm:h-4 cursor-pointer"
                  >
                    <span>🏟️</span>
                    <span className="truncate">{account.mainArena}</span>
                  </p>
                </div>

                {/* Price & Actions */}
                <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2">
                  {(() => {
                    const displayInfo = getAccountDisplayPrice(account, globalPriceMode);
                    return (
                      <div className="flex items-center justify-between gap-1 h-5 sm:h-6 overflow-hidden">
                        <div className="flex items-baseline gap-0.5 min-w-0 truncate">
                          <span className="text-xs sm:text-base font-bold text-red-600 font-mono truncate">
                            {displayInfo.price.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-600 font-medium whitespace-nowrap">{displayInfo.unit}</span>
                        </div>
                        {displayInfo.badge && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-1 sm:px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                            {displayInfo.badge}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-0.5">
                    <button
                      onClick={() => setPreviewAccount(account)}
                      className="h-7 sm:h-8.5 px-1 sm:px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span>Chi Tiết</span>
                    </button>

                    <button
                      onClick={() => onSelectAccount(account)}
                      className="h-7 sm:h-8.5 px-1 sm:px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer"
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
          {/* BỘ LỌC & TÌM KIẾM TINH GỌN (UI/UX CHUẨN MOBILE & DESKTOP) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3">
            {/* 1. Thanh Tìm Kiếm Đa Năng */}
            <div className="relative flex items-center">
              {/* Nút / Hitbox icon Tìm kiếm (tối thiểu 44px) - Click để focus nhanh */}
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                aria-label="Kích hoạt tìm kiếm"
                className="w-11 sm:w-12 h-full absolute left-0 top-0 flex items-center justify-center text-slate-400 hover:text-orange-600 active:scale-95 transition-all cursor-pointer z-10"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Tìm kiếm Tướng Tí Nị, Sân Đấu, Mã số (MS: 8899), Rank..."
                className="w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-11 sm:pr-12 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
              />

              {/* Nút / Hitbox Xóa từ khóa (tối thiểu 44px) - Click 1 chạm trên Mobile */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="w-11 sm:w-12 h-full absolute right-0 top-0 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-95 transition-all cursor-pointer z-10 group"
                  title="Xóa tìm kiếm"
                >
                  <span className="w-6.5 h-6.5 rounded-full bg-slate-200 group-hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors shadow-2xs">
                    <X className="w-3.5 h-3.5" />
                  </span>
                </button>
              )}
            </div>

            {/* 2. Hàng Bộ Lọc: Trạng Thái Thuê & Lọc Theo Giá (Thiết kế Touch-Friendly) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              {/* Lọc Trạng Thái Thuê (Segmented Controls) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ALL")}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStatus === "RENTED"
                      ? "bg-rose-600 text-white shadow-xs shadow-rose-600/20"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Đang Thuê ({statusStats.rented})</span>
                </button>
              </div>

              {/* Lọc Theo Giá & Nút Đặt Lại */}
              <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                {/* Sắp xếp giá */}
                <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setSelectedSort("DEFAULT")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSort === "DEFAULT"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Mặc định
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSort("PRICE_ASC")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSort === "PRICE_ASC"
                        ? "bg-white text-orange-600 shadow-2xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Giá từ thấp đến cao"
                  >
                    <span>Giá</span>
                    <span className="text-xs">↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSort("PRICE_DESC")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSort === "PRICE_DESC"
                        ? "bg-white text-orange-600 shadow-2xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Giá từ cao đến thấp"
                  >
                    <span>Giá</span>
                    <span className="text-xs">↘</span>
                  </button>
                </div>

                {/* Nút Đặt lại bộ lọc */}
                {(selectedStatus !== "ALL" || searchTerm || selectedSort !== "DEFAULT") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("ALL");
                      setSearchTerm("");
                      setSelectedSort("DEFAULT");
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
                    title="Xóa tất cả bộ lọc"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Đặt lại</span>
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
                      <div
                        onClick={() => onSelectAccount(account)}
                        className="text-slate-900 font-bold text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors cursor-pointer"
                      >
                        {account.mainChibi}
                      </div>

                      {/* Sân Đấu */}
                      <p
                        onClick={() => onSelectAccount(account)}
                        className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 sm:mt-1 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>🏟️</span>
                        <span>{account.mainArena}</span>
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                      {(() => {
                        const displayInfo = getAccountDisplayPrice(account, globalPriceMode);
                        return (
                          <div className="flex items-baseline justify-between flex-wrap gap-x-1">
                            <div>
                              <span className="text-xs sm:text-base md:text-lg font-bold text-red-600 font-mono">
                                {displayInfo.price.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-600 font-medium">{displayInfo.unit}</span>
                            </div>
                            {displayInfo.badge ? (
                              <span className="text-[9px] sm:text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-1 sm:px-1.5 py-0.5 rounded-md">
                                {displayInfo.badge}
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:inline">
                                120+ lượt
                              </span>
                            )}
                          </div>
                        );
                      })()}

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
