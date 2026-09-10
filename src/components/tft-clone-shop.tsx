"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { TFTCloneAccount, TFT_CLONE_ACCOUNTS, PROFILE_INFO } from "@/data/tft-data";
import { getVipAndCloneAccounts, formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { TFTImageLightbox } from "@/components/tft-image-lightbox";
import { motion, Variants } from "framer-motion";
import {
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  Zap,
  RefreshCw,
  AlertTriangle,
  Eye,
  Info,
  Lock,
  MessageCircle,
  ArrowUpDown,
  Clock,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const cloneContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

const cloneCardVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const CLONE_RANK_FILTERS = [
  { id: "ALL", label: "Tất cả loại rank" },
  { id: "UNRANKED", label: "Unranked / Trắng TT" },
  { id: "ĐỒNG", label: "Rank Sắt / Đồng / Bạc" },
  { id: "VÀNG", label: "Rank Vàng / Bạch Kim" },
  { id: "LỤC BẢO", label: "Rank Lục Bảo / Kim Cương" },
];

// Helper lấy giá acc clone an toàn
const getAccountPrice = (account?: TFTCloneAccount | null): number => {
  if (!account) return 150000;
  return Number(account.price) || Number(account.periodPrice) || Number(account.monthlyPrice) || 150000;
};

/**
 * Chuẩn hóa chuỗi tiếng Việt
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
 * Helper tìm kiếm thông minh cho acc Clone / Smurf
 */
const matchesCloneSearch = (acc: TFTCloneAccount, query: string): boolean => {
  const trimmed = (query || "").trim();
  if (!trimmed) return true;

  const featuresStr = Array.isArray(acc.features) ? acc.features.join(" ") : "";
  const fullText = [
    acc.code,
    acc.title,
    acc.rankBadge,
    featuresStr,
    acc.description,
  ]
    .filter(Boolean)
    .join(" ");

  const rawLowerTarget = fullText.toLowerCase();
  const rawLowerQuery = trimmed.toLowerCase();

  // 1. Khớp chuỗi trực tiếp
  if (rawLowerTarget.includes(rawLowerQuery)) return true;

  // 2. Chuẩn hóa không dấu
  const targetNorm = removeVietnameseAccents(fullText);
  const queryNorm = removeVietnameseAccents(trimmed);

  if (targetNorm.includes(queryNorm)) return true;

  // 3. Khớp không khoảng trắng
  const targetCompact = targetNorm.replace(/\s+/g, "");
  const queryCompact = queryNorm.replace(/\s+/g, "");
  if (queryCompact && targetCompact.includes(queryCompact)) return true;

  // 4. Khớp đa từ khóa
  const queryTokens = queryNorm.split(" ").filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => targetNorm.includes(token));
  }

  return false;
};

export const TFTCloneShop: React.FC = () => {
  // Khởi tạo sẵn danh sách có sẵn để render tức thì 0s, sau đó fetch ngầm từ Supabase
  const [cloneAccounts, setCloneAccounts] = useState<TFTCloneAccount[]>(TFT_CLONE_ACCOUNTS || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClone, setSelectedClone] = useState<TFTCloneAccount | null>(null);
  const [previewClone, setPreviewClone] = useState<TFTCloneAccount | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRankFilter, setSelectedRankFilter] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [selectedSort, setSelectedSort] = useState<"DEFAULT" | "PRICE_ASC" | "PRICE_DESC">("DEFAULT");
  const [visibleCount, setVisibleCount] = useState(12);
  const sliderRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Fetch dữ liệu mới nhất từ Supabase chạy ngầm
  useEffect(() => {
    let isMounted = true;
    getVipAndCloneAccounts().then(({ cloneAccounts: fetchedClone }) => {
      if (isMounted && fetchedClone && fetchedClone.length > 0) {
        setCloneAccounts(fetchedClone);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Thống kê trạng thái thực tế của kho acc clone
  const cloneStatusStats = useMemo(() => {
    let availableCount = 0;
    let rentedCount = 0;
    cloneAccounts.forEach((acc) => {
      const isRented = (acc.status || "").toUpperCase() === "RENTED";
      if (isRented) rentedCount++;
      else availableCount++;
    });
    return {
      total: cloneAccounts.length,
      available: availableCount,
      rented: rentedCount,
    };
  }, [cloneAccounts]);

  // Reset số lượng tài khoản hiển thị ban đầu khi đổi bộ lọc
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedRankFilter, selectedStatus, selectedSort, showFullCatalog]);

  // Mảng tài khoản nhân đôi cho hiệu ứng trượt vô tận mượt mà y hệt Kho VIP
  const loopCloneAccounts =
    cloneAccounts.length > 0 ? [...cloneAccounts, ...cloneAccounts] : [];

  // Lọc & Sắp xếp tài khoản khi mở rộng toàn bộ kho
  const filteredCloneAccounts = useMemo(() => {
    return cloneAccounts
      .filter((acc) => {
        // 1. Khớp trạng thái thuê
        const isRented = (acc.status || "").toUpperCase() === "RENTED";
        const matchesStatus =
          selectedStatus === "ALL" ||
          (selectedStatus === "RENTED" && isRented) ||
          (selectedStatus === "AVAILABLE" && !isRented);

        // 2. Khớp Tìm kiếm thông minh
        const matchesSearch = matchesCloneSearch(acc, searchTerm);

        // 3. Khớp Phân loại Rank
        const badgeNorm = removeVietnameseAccents(acc.rankBadge);
        const matchesRank =
          selectedRankFilter === "ALL" ||
          (selectedRankFilter === "UNRANKED" && (badgeNorm.includes("unranked") || badgeNorm.includes("trang tt") || badgeNorm.includes("khong rank"))) ||
          (selectedRankFilter === "ĐỒNG" && (badgeNorm.includes("dong") || badgeNorm.includes("sat") || badgeNorm.includes("bac"))) ||
          (selectedRankFilter === "VÀNG" && (badgeNorm.includes("vang") || badgeNorm.includes("bach kim"))) ||
          (selectedRankFilter === "LỤC BẢO" && (badgeNorm.includes("luc bao") || badgeNorm.includes("kim cuong")));

        return matchesStatus && matchesSearch && matchesRank;
      })
      .sort((a, b) => {
        const priceA = getAccountPrice(a);
        const priceB = getAccountPrice(b);
        if (selectedSort === "PRICE_ASC") {
          return priceA - priceB;
        }
        if (selectedSort === "PRICE_DESC") {
          return priceB - priceA;
        }
        return 0;
      });
  }, [cloneAccounts, selectedStatus, searchTerm, selectedRankFilter, selectedSort]);

  // Tải lũy tiến cho kho Clone
  const visibleCloneAccounts = filteredCloneAccounts.slice(0, visibleCount);

  // IntersectionObserver tự động nạp tiếp 12 acc Clone tiếp theo khi cuộn
  useEffect(() => {
    if (!showFullCatalog) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredCloneAccounts.length) {
          setVisibleCount((prev) => Math.min(prev + 12, filteredCloneAccounts.length));
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showFullCatalog, visibleCount, filteredCloneAccounts.length]);

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

  const openCloneModal = (account: TFTCloneAccount) => {
    setSelectedClone(account);
    setIsAgreed(false);
    setCopiedCode(false);
  };

  const copyAccCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(true);
    toast.success(`Đã sao chép mã tài khoản: ${code}!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getZaloMessage = (account: TFTCloneAccount) => {
    const price = getAccountPrice(account);
    return `Chào Tuấn Thái Bình, mình muốn THUÊ LÂU DÀI (BÀN GIAO FULL THÔNG TIN) Acc Clone mã [${account.code}] - ${account.title} (Giá ${price.toLocaleString("vi-VN")}đ / ∞). Hỗ trợ kiểm tra và bàn giao tài khoản cho mình nhé!`;
  };

  const handleOrderZalo = (account: TFTCloneAccount) => {
    if (!isAgreed) {
      toast.error("Vui lòng tích đồng ý với cam kết bàn giao trước khi tiếp tục!");
      return;
    }

    const msg = getZaloMessage(account);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    toast.success("Đã sao chép nội dung đơn hàng! Hãy dán (Ctrl+V) vào Zalo với shop.");
    setTimeout(() => {
      window.open(PROFILE_INFO.zaloUrl, "_blank");
    }, 350);
  };

  return (
    <section id="clone-shop" className="py-12 sm:py-16 bg-white border-b border-slate-200/80 relative overflow-hidden">
      {/* Background Subtle Tech Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. HEADER SECTION VỚI CỤM NÚT ĐIỀU HƯỚNG MŨI TÊN TRÒN (< & >) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="space-y-2">
            {/* Tag phụ (Badge nền cam nhạt) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-sm font-gaming">
              <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>Sở Hữu Vô Cực • Bàn Giao Full Thông Tin</span>
            </div>

            {/* Tiêu đề chính h2 font Esports Gaming */}
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-gaming uppercase">
              KHO ACC CLONE / SMURF{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                (THUÊ LÂU DÀI ∞)
              </span>
            </h2>

            {/* Mô tả ngắn */}
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-normal">
              Thuê lâu dài không thời hạn, bàn giao toàn quyền Riot ID & Mật khẩu cho khách. Đổi mật khẩu và bảo hành trọn đời uy tín.
            </p>
          </div>

          {/* 2 NÚT ICON MŨI TÊN ĐIỀU HƯỚNG TRÒN (PREV / NEXT) GÓC PHẢI */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={handlePrev}
              aria-label="Trang trước acc clone"
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-500 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Trang tiếp theo acc clone"
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-500 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 2. SEAMLESS INFINITE SLIDER / CAROUSEL AUTO-LOOP TRACK */}
      <div className="max-w-7xl mx-auto relative w-full py-3 overflow-hidden">
        {isLoading ? (
          /* SKELETON LOADING STATE CHO KHO CLONE */
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
        ) : cloneAccounts.length === 0 ? (
          /* EMPTY STATE */
          <div className="px-4 py-12 text-center text-slate-500 bg-slate-50 mx-4 rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold">
              Đang kết nối cơ sở dữ liệu Supabase hoặc chưa có tài khoản Clone nào trong bảng.
            </p>
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="animate-infinite-loop flex gap-3 sm:gap-5 px-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {loopCloneAccounts.map((account, index) => {
              const accPrice = getAccountPrice(account);

              return (
                <div
                  key={`${account.id}-${index}`}
                  className="w-[165px] sm:w-[280px] lg:w-[280px] xl:w-[290px] flex-shrink-0 flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group snap-start"
                >
                  {/* TOP KHUNG ẢNH VUÔNG ASPECT-SQUARE HIỂN THỊ 100% MÀU GỐC */}
                  <div>
                    <div
                      onClick={() => setPreviewClone(account)}
                      className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-100 mb-2 sm:mb-3 border border-slate-100 shadow-inner cursor-pointer group-hover:border-orange-300 transition-colors"
                    >
                      <LazyAccountImage
                        src={account.thumbnail}
                        alt={`Thuê acc clone TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Right: Mã Acc */}
                      <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-black/80 text-[9px] sm:text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                          {account.code}
                        </span>
                      </div>

                      {/* Top Left: Trạng Thái */}
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

                      {/* Bottom Left: Huy Hiệu Rank Clone/Unranked */}
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3">
                        <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded sm:rounded-md bg-white/95 text-slate-900 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                          {account.rankBadge}
                        </span>
                      </div>
                    </div>

                    {/* TÊN ĐỊNH DANH ACC */}
                    <div className="text-slate-900 font-bold text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                      {account.title}
                    </div>

                    {/* GẠCH ĐẦU DÒNG TÍNH NĂNG NGẮN GỌN */}
                    <ul className="mt-1.5 sm:mt-2.5 space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-slate-600 font-medium">
                      {account.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1 sm:gap-1.5 line-clamp-1">
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ĐÁY THẺ: GIÁ THUÊ LÂU DÀI (KÝ HIỆU VÔ CỰC ∞) & 2 NÚT THAO TÁC */}
                  <div className="mt-auto pt-2 sm:pt-3.5 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                    {/* Giá Thuê với Ký hiệu Vô Cực ∞ */}
                    <div className="flex items-baseline justify-between flex-wrap gap-x-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs sm:text-base md:text-lg font-bold text-red-600 font-mono">
                          {accPrice.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500 font-medium"> / </span>
                        <span className="text-sm sm:text-lg text-slate-900 font-black leading-none" title="Sở hữu vô cực">
                          ∞
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 sm:px-2 py-0.5 rounded-md hidden xs:inline sm:inline">
                        Full Sở Hữu
                      </span>
                    </div>

                    {/* Cụm 2 Nút Bấm: Chi Tiết & Thuê Ngay (Tương tự Kho VIP) */}
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                      <button
                        onClick={() => setPreviewClone(account)}
                        className="h-7 sm:h-9 px-1 sm:px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span>Chi Tiết</span>
                      </button>

                      <button
                        onClick={() => openCloneModal(account)}
                        className="h-7 sm:h-9 px-1 sm:px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer font-gaming"
                      >
                        <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span>Thuê Ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. NÚT LỚN "XEM THÊM TOÀN BỘ KHO ACC CLONE" */}
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
              ? "Thu gọn lại (Chế độ trượt ngang)"
              : `Xem thêm toàn bộ kho acc Clone (${cloneAccounts.length}+ acc có sẵn)`}
          </span>
          {showFullCatalog ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4 animate-bounce" />
          )}
        </button>
      </div>

      {/* 4. KHU VỰC MỞ RỘNG TOÀN BỘ KHO ACC CLONE (BỘ LỌC + GRID TÀI KHOẢN) */}
      {showFullCatalog && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200/80 space-y-6 sm:space-y-8 animate-fadeIn">
          {/* BỘ LỌC & TÌM KIẾM ACC CLONE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
            {/* Quick Status Pills for Fast Touch on Mobile */}
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
                Tất Cả ({cloneStatusStats.total})
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
                <span>Sẵn Sàng ({cloneStatusStats.available})</span>
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
                <span>Đang Thuê ({cloneStatusStats.rented})</span>
              </button>
              {(selectedStatus !== "ALL" || selectedRankFilter !== "ALL" || searchTerm || selectedSort !== "DEFAULT") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus("ALL");
                    setSelectedRankFilter("ALL");
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

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 items-center">
              {/* Lọc Rank */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Phân Loại Rank
                </label>
                <select
                  value={selectedRankFilter}
                  onChange={(e) => setSelectedRankFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {CLONE_RANK_FILTERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc Trạng Thái Thuê */}
              <div>
                <label className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                  Trạng Thái Thuê
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">Tất Cả ({cloneStatusStats.total})</option>
                  <option value="AVAILABLE">🟢 Sẵn Sàng ({cloneStatusStats.available})</option>
                  <option value="RENTED">🔴 Đang Cho Thuê ({cloneStatusStats.rented})</option>
                </select>
              </div>

              {/* Sắp Xếp Giá */}
              <div className="col-span-2 lg:col-span-1">
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
                  placeholder="🔍 Nhập mã số (CLONE-01), rank (Unranked, Đồng, Vàng), tính năng..."
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

          {/* GRID 4 CỘT HIỂN THỊ TOÀN BỘ ACC CLONE ĐƯỢC LỌC */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4.5 shadow-xs animate-pulse space-y-2.5"
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
          ) : filteredCloneAccounts.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                Không tìm thấy tài khoản clone nào phù hợp với bộ lọc.
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {selectedStatus === "RENTED" && cloneStatusStats.rented === 0
                  ? "Hiện tại toàn bộ tài khoản Clone đều đang Sẵn Sàng (chưa có acc nào đang cho thuê)."
                  : selectedStatus === "AVAILABLE" && cloneStatusStats.available === 0
                  ? "Hiện tại toàn bộ tài khoản Clone đều đang có khách thuê."
                  : "Bạn có thể thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRankFilter("ALL");
                    setSelectedStatus("ALL");
                    setSelectedSort("DEFAULT");
                  }}
                  className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>

                {selectedStatus !== "ALL" && (
                  <button
                    onClick={() => setSelectedStatus("ALL")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Xem tất cả ({cloneStatusStats.total} acc)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* THANH THỐNG KÊ TIẾN ĐỘ TẢI ACC CLONE */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>
                  Đang hiển thị{" "}
                  <strong className="text-slate-900 font-bold font-mono">
                    {visibleCloneAccounts.length}
                  </strong>{" "}
                  / {filteredCloneAccounts.length} tài khoản Clone phù hợp
                </span>
                {visibleCount < filteredCloneAccounts.length && (
                  <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
                    Tự động tải thêm khi cuộn
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {visibleCloneAccounts.map((account) => {
                  const accPrice = getAccountPrice(account);

                  return (
                    <div
                      key={account.id}
                      style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
                      className="flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group animate-fadeIn"
                    >
                      {/* Top Photo & Badges */}
                      <div>
                        <div
                          onClick={() => setPreviewClone(account)}
                          className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-100 mb-2 sm:mb-3 border border-slate-100 shadow-inner cursor-pointer group-hover:border-orange-300 transition-colors"
                        >
                          <LazyAccountImage
                            src={account.thumbnail}
                            alt={`Thuê acc clone TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Top Right: Mã Acc */}
                          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded sm:rounded-md bg-black/80 text-[9px] sm:text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                              {account.code}
                            </span>
                          </div>

                          {/* Top Left: Trạng Thái */}
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

                          {/* Bottom Left: Huy Hiệu Rank */}
                          <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-10">
                            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded sm:rounded-md bg-white/95 text-slate-900 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                              {account.rankBadge}
                            </span>
                          </div>
                        </div>

                        {/* Tên định danh */}
                        <div className="text-slate-900 font-bold text-xs sm:text-sm md:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                          {account.title}
                        </div>

                        {/* Danh sách tính năng */}
                        <ul className="mt-1.5 sm:mt-2.5 space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-slate-600 font-medium">
                          {account.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-1 sm:gap-1.5 line-clamp-1">
                              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Đáy Thẻ: Giá tiền và 2 Nút Bấm */}
                      <div className="mt-auto pt-2 sm:pt-3.5 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                        <div className="flex items-baseline justify-between flex-wrap gap-x-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs sm:text-base md:text-lg font-bold text-red-600 font-mono">
                              {accPrice.toLocaleString("vi-VN")}đ
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-500 font-medium"> / </span>
                            <span className="text-sm sm:text-lg text-slate-900 font-black leading-none" title="Sở hữu vô cực">
                              ∞
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 sm:px-2 py-0.5 rounded-md hidden xs:inline sm:inline">
                            Full Sở Hữu
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 sm:gap-2">
                          <button
                            onClick={() => setPreviewClone(account)}
                            className="h-7 sm:h-9 px-1 sm:px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            <span>Chi Tiết</span>
                          </button>

                          <button
                            onClick={() => openCloneModal(account)}
                            className="h-7 sm:h-9 px-1 sm:px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer font-gaming"
                          >
                            <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            <span>Thuê Ngay</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SENTINEL INFINITE SCROLL & TẢI THÊM PROGRESSIVE CHO CLONE */}
              <div ref={loadMoreSentinelRef} className="py-4 flex flex-col items-center justify-center gap-2">
                {visibleCount < filteredCloneAccounts.length ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                      <span>Đang nạp thêm tài khoản ({visibleCloneAccounts.length}/{filteredCloneAccounts.length})...</span>
                    </div>
                    <button
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredCloneAccounts.length))}
                      className="text-xs text-orange-700 hover:text-orange-800 font-bold bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      Bấm để tải thêm ngay (+12 acc)
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    ✓ Đã tải hoàn tất toàn bộ {filteredCloneAccounts.length} tài khoản Clone
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
                const el = document.getElementById("clone-shop");
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

      {/* ============================================================ */}
      {/* 5. MODAL XEM CHI TIẾT & BÀN GIAO FULL THÔNG TIN ACC CLONE */}
      {/* ============================================================ */}
      {selectedClone && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs sm:backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border-t sm:border border-slate-200 w-full sm:max-w-xl md:max-w-2xl rounded-t-[24px] sm:rounded-3xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] sm:max-h-[88vh] shadow-2xl">
            {/* Top Drag Indicator for Mobile */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden bg-slate-50">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header Bar */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => copyAccCode(selectedClone.code)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 border border-sky-200 text-sky-800 font-mono font-bold text-[11px] active:scale-95 transition-transform cursor-pointer"
                  title="Bấm để sao chép mã"
                >
                  <span>{selectedClone.code}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>

                <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase bg-slate-200/80 text-slate-800">
                  {selectedClone.rankBadge}
                </span>

                {(selectedClone.status || "").toUpperCase() !== "RENTED" ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>SẴN SÀNG</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    <span>ĐANG THUÊ</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedClone(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold shadow-xs transition-colors cursor-pointer flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal Chi Tiết */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-900 flex-1 overscroll-contain">
              {/* COMPACT HERO CARD */}
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative">
                  <LazyAccountImage
                    src={selectedClone.thumbnail}
                    alt={`Acc ${selectedClone.code}`}
                    containerClassName="w-full h-full"
                    priority
                  />
                  <span className="absolute bottom-1 left-1 px-1 py-0.2 bg-black/80 text-[8px] sm:text-[9px] font-bold text-white rounded">
                    CLONE
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {selectedClone.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium line-clamp-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span>Thuê lâu dài (Sở hữu vô cực ∞)</span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span>Bàn giao full quyền Riot ID & Pass</span>
                  </p>
                </div>
              </div>

              {/* Danh sách đặc điểm nổi bật */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Đặc Điểm & Cam Kết Bàn Giao:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClone.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-[11px] font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* TRƯỜNG HỢP ACC ĐANG ĐƯỢC THUÊ */}
              {(selectedClone.status || "").toUpperCase() === "RENTED" ? (
                <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-rose-800 font-bold text-xs sm:text-sm">
                    <Lock className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>TÀI KHOẢN ĐANG CÓ KHÁCH THUÊ</span>
                  </div>

                  {(() => {
                    const info = formatRentalExpiry(selectedClone.rentedUntil);
                    if (!info) return null;
                    const pad = (n: number) => n.toString().padStart(2, "0");

                    return (
                      <div className="space-y-2">
                        {info.isInfinite ? (
                          <div className="py-2 px-3 bg-white border border-rose-200 rounded-xl font-mono text-sm font-bold text-rose-700">
                            ∞ Thuê Lâu Dài (Vô Cực)
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 sm:gap-2 font-mono">
                            {info.days > 0 && (
                              <>
                                <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                                  <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(info.days)}</span>
                                  <span className="text-[9px] text-slate-500 font-bold block">Ngày</span>
                                </div>
                                <span className="font-bold text-rose-400">:</span>
                              </>
                            )}
                            <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                              <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(info.hours)}</span>
                              <span className="text-[9px] text-slate-500 font-bold block">Giờ</span>
                            </div>
                            <span className="font-bold text-rose-400">:</span>
                            <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                              <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(info.minutes)}</span>
                              <span className="text-[9px] text-slate-500 font-bold block">Phút</span>
                            </div>
                            <span className="font-bold text-rose-400">:</span>
                            <div className="bg-white border border-rose-200 px-2 py-1 rounded-xl text-center min-w-[48px]">
                              <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">{pad(info.seconds)}</span>
                              <span className="text-[9px] text-slate-500 font-bold block">Giây</span>
                            </div>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-600">
                          {info.expiryFormatted ? `Dự kiến hết hạn: ${info.expiryFormatted}. ` : ""}
                          Bạn có thể đặt trước qua Zalo để nhận acc ngay khi trống!
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* BẢNG GIÁ & QUYỀN LỢI */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Giá sở hữu lâu dài:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-black font-mono text-red-600">
                          {getAccountPrice(selectedClone).toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-sm font-bold text-slate-800">/ ∞</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center gap-1 text-emerald-700 font-medium">
                        ✓ Bàn giao đầy đủ Riot ID, Mật khẩu và hỗ trợ đổi Mail
                      </p>
                      <p className="flex items-center gap-1 text-slate-600">
                        ✓ Miễn phí bảo hành và hỗ trợ kỹ thuật trọn gói
                      </p>
                    </div>
                  </div>

                  {/* CHECKBOX CAM KẾT */}
                  <label className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-orange-50/60 border border-orange-200/70 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600 flex-shrink-0"
                    />
                    <span className="text-slate-700 font-medium leading-tight">
                      Đồng ý với chính sách bàn giao & bảo hành của Shop Tuấn Thái Bình.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-4 py-3 sm:px-6 sm:py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {(selectedClone.status || "").toUpperCase() === "RENTED" ? "Trạng thái:" : "Thanh toán:"}
                </span>
                <span className="font-black font-mono text-sm sm:text-base text-red-600 leading-tight">
                  {(selectedClone.status || "").toUpperCase() === "RENTED"
                    ? "Đang có khách"
                    : `${getAccountPrice(selectedClone).toLocaleString("vi-VN")}đ`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedClone(null)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                {(selectedClone.status || "").toUpperCase() === "RENTED" ? (
                  <button
                    onClick={() => {
                      const preOrderMsg = `[ĐẶT TRƯỚC ACC CLONE]\n- Mã Acc: ${selectedClone.code}\n- Tên Acc: ${selectedClone.title}\nBáo mình khi acc này hết hạn thuê nhé!`;
                      if (navigator.clipboard) navigator.clipboard.writeText(preOrderMsg).catch(() => {});
                      toast.success("Đã sao chép cú pháp! Dán (Ctrl+V) vào Zalo để đặt trước acc.");
                      window.open(PROFILE_INFO.zaloUrl, "_blank");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Đặt Lịch Thuê</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOrderZalo(selectedClone)}
                    disabled={!isAgreed}
                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                      isAgreed
                        ? "bg-orange-700 hover:bg-orange-800 text-white shadow-md shadow-orange-700/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Nhận Acc Zalo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Phóng to ảnh chi tiết tài khoản Clone */}
      <TFTImageLightbox
        isOpen={!!previewClone}
        imageUrl={previewClone?.thumbnail || ""}
        title={previewClone?.title || ""}
        code={previewClone?.code || ""}
        rank={previewClone?.rankBadge}
        price={`${getAccountPrice(previewClone).toLocaleString("vi-VN")}đ / Vô Cực ∞`}
        status={previewClone?.status}
        onClose={() => setPreviewClone(null)}
        onRentNow={() => {
          if (previewClone) {
            openCloneModal(previewClone);
          }
        }}
      />
    </section>
  );
};
