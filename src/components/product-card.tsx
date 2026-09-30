"use client";

import React from "react";
import { Eye, KeyRound, Search, Heart } from "lucide-react";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { TFTRentalAccount, TFTCloneAccount } from "@/data/tft-data";
import { getAccountProductUrl } from "@/utils/account-lookup";
import { isFavorite, toggleFavorite } from "@/utils/product-discovery";
import { usePrimaryCtaExperiment } from "@/utils/experiments";

/**
 * Định dạng tiền tệ Việt Nam (VNĐ) chuẩn: 15.000đ, 99.000đ, 1.200.000đ
 */
export function formatVND(amount?: number | null): string {
  if (amount == null || isNaN(amount)) return "0đ";
  return `${Number(amount).toLocaleString("vi-VN")}đ`;
}

/**
 * Interface thống nhất chuẩn hóa dữ liệu hiển thị cho Thẻ Sản Phẩm (Product Card)
 */
export interface ProductCardData {
  id: string;
  code: string;
  type: "VIP" | "CLONE";
  title: string;
  thumbnail: string;
  rank?: string;
  rankBadgeBg?: string;
  rankColor?: string;
  status: "AVAILABLE" | "RENTED" | string;
  rentedUntil?: string | null;
  price: number;
  priceUnit: string;
  mainPet?: string;
  extraPetsCount?: number;
  allPetsSummary?: string;
  arena?: string;
  features?: string[];
  description?: string;
  createdAt?: string;
  rawVip?: TFTRentalAccount;
  rawClone?: TFTCloneAccount;
}

/**
 * Chuẩn hóa tài khoản VIP thành ProductCardData
 */
export function normalizeVipAccount(
  account: TFTRentalAccount,
  priceMode: string = "AUTO"
): ProductCardData {
  const effectiveMode =
    account.priceDisplayType && account.priceDisplayType !== "AUTO"
      ? account.priceDisplayType
      : priceMode && priceMode !== "AUTO"
      ? priceMode
      : "HOURLY";

  let price = Number(account.hourlyPrice) || 15000;
  let priceUnit = " / Giờ";

  if (effectiveMode === "DAILY") {
    price = account.dailyPrice || (Number(account.hourlyPrice) || 15000) * 3;
    priceUnit = " / Ngày";
  } else if (effectiveMode === "LONG_TERM") {
    const baseValue =
      Number(account.accountValue) ||
      Number(account.periodPrice) ||
      Number(account.monthlyPrice) ||
      ((Number(account.hourlyPrice) || 15000) * 50) ||
      850000;
    price = Number(account.periodPrice) || Number(account.monthlyPrice) || baseValue;
    priceUnit = account.periodUnit || " / Trọn gói";
  } else if (effectiveMode === "CUSTOM") {
    price = account.customPrice || Number(account.hourlyPrice) || 15000;
    priceUnit = account.customPriceUnit ? ` ${account.customPriceUnit}` : "";
  }

  const allChibi = Array.isArray(account.allChibi) && account.allChibi.length > 0
    ? account.allChibi
    : account.mainChibi
    ? [account.mainChibi]
    : [];

  const mainPet = allChibi[0] || account.mainChibi || account.title;
  const extraPetsCount = Math.max(0, allChibi.length - 1);
  const allPetsSummary = extraPetsCount > 0 ? `${mainPet} +${extraPetsCount}` : mainPet;
  const arena = account.mainArena || (Array.isArray(account.allArenas) && account.allArenas[0]) || "";

  return {
    id: account.id,
    code: account.code,
    type: "VIP",
    title: account.title,
    thumbnail: account.thumbnail,
    rank: account.rank,
    rankBadgeBg: "bg-white/10 text-white border-white/15",
    rankColor: "text-white",
    status: account.status === "RENTED" ? "RENTED" : "AVAILABLE",
    rentedUntil: account.rentedUntil,
    price,
    priceUnit,
    mainPet,
    extraPetsCount,
    allPetsSummary,
    arena,
    description: account.description,
    createdAt: account.createdAt,
    rawVip: account,
  };
}

/**
 * Chuẩn hóa tài khoản CLONE thành ProductCardData
 */
export function normalizeCloneAccount(
  account: TFTCloneAccount,
  _priceMode: string = "AUTO"
): ProductCardData {
  const price = Number(account.price) || Number(account.periodPrice) || 79000;
  const priceUnit = " / Sở Hữu";
  const features = Array.isArray(account.features) ? account.features : [];
  const mainPet = account.title;

  return {
    id: account.id,
    code: account.code,
    type: "CLONE",
    title: account.title,
    thumbnail: account.thumbnail,
    rank: account.rankBadge || "UNRANKED",
    status: account.status === "RENTED" ? "RENTED" : "AVAILABLE",
    rentedUntil: account.rentedUntil,
    price,
    priceUnit,
    mainPet,
    allPetsSummary: mainPet,
    arena: "",
    features,
    description: account.description,
    createdAt: account.createdAt,
    rawClone: account,
  };
}

interface ProductCardProps {
  item: ProductCardData;
  onViewDetail?: (item: ProductCardData) => void;
  onSelectAccount?: (vip: TFTRentalAccount) => void;
  onSelectClone?: (clone: TFTCloneAccount) => void;
  onFindSimilar?: (item: ProductCardData) => void;
  priority?: boolean;
}

/**
 * COMPONENT THẺ SẢN PHẨM TFT CHUẨN MONOCHROME LUXURY E-COMMERCE
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onViewDetail,
  onSelectAccount,
  onSelectClone,
  onFindSimilar,
  priority = false,
}) => {
  const isVip = item.type === "VIP";
  const isAvailable = item.status === "AVAILABLE";

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(item);
      return;
    }
    if (isVip && item.rawVip && onSelectAccount) {
      onSelectAccount(item.rawVip);
      return;
    }
    if (!isVip && item.rawClone && onSelectClone) {
      onSelectClone(item.rawClone);
      return;
    }
    window.location.href = getAccountProductUrl(item);
  };

  const handlePrimaryAction = () => {
    if (isVip) {
      if (onSelectAccount && item.rawVip) {
        onSelectAccount(item.rawVip);
      } else {
        handleViewDetail();
      }
    } else {
      if (onSelectClone && item.rawClone) {
        onSelectClone(item.rawClone);
      } else {
        window.location.href = getAccountProductUrl(item);
      }
    }
  };

  const handleFindSimilar = () => {
    if (onFindSimilar) {
      onFindSimilar(item);
      return;
    }

    const searchTarget = item.mainPet || item.title.split("-")[0]?.trim() || item.code;
    const targetType = isVip ? "vip" : "clone";

    if (typeof window !== "undefined") {
      if (window.location.pathname === "/shop") {
        window.dispatchEvent(
          new CustomEvent("tft:search", {
            detail: {
              query: searchTarget,
              type: targetType,
            },
          })
        );
      } else {
        const params = new URLSearchParams();
        if (searchTarget) params.set("search", searchTarget);
        params.set("type", targetType);
        window.location.href = `/shop?${params.toString()}`;
      }
    }
  };

  const { ctaText } = usePrimaryCtaExperiment();
  const [isFav, setIsFav] = React.useState(false);

  React.useEffect(() => {
    setIsFav(isFavorite(item.id));
    const handleUpdate = (e: any) => {
      if (!e.detail?.changedId || e.detail.changedId === item.id) {
        setIsFav(isFavorite(item.id));
      }
    };
    window.addEventListener("tft:favorites_updated", handleUpdate);
    return () => window.removeEventListener("tft:favorites_updated", handleUpdate);
  }, [item.id]);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleFavorite(item);
    setIsFav(next);
  };

  return (
    <div
      style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}
      className={`flex flex-col h-full justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-200 ease-out group ${
        isAvailable
          ? "bg-[#121214] hover:bg-[#151518] border border-white/[0.08] hover:border-white/20 hover:-translate-y-[2px] sm:hover:-translate-y-[3px]"
          : "bg-[#0f0f11] border border-white/[0.05] opacity-80"
      }`}
    >
      {/* ============================================================ */}
      {/* 1. KHU VỰC ẢNH SẢN PHẨM & OVERLAY BADGES (TINH GỌN)          */}
      {/* ============================================================ */}
      <div>
        <div
          onClick={handleViewDetail}
          className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#0a0a0c] mb-2 sm:mb-3 border border-white/[0.06] cursor-pointer flex items-center justify-center group/img"
        >
          <LazyAccountImage
            src={item.thumbnail}
            alt={`Tài khoản TFT ${item.code} - ${item.title}`}
            containerClassName="w-full h-full flex items-center justify-center"
            className="w-full h-full object-contain transition-transform duration-200 ease-out group-hover/img:scale-[1.02]"
            priority={priority}
          />

          {/* Top-Left: Badge Phân Loại (VIP / CLONE) */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
            {isVip ? (
              <span className="px-1.5 sm:px-2 py-0.5 rounded bg-white text-[#09090b] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-mono shadow-sm">
                VIP
              </span>
            ) : (
              <span className="px-1.5 sm:px-2 py-0.5 rounded bg-[#09090b]/90 text-zinc-300 border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-mono backdrop-blur-sm">
                CLONE
              </span>
            )}
          </div>

          {/* Top-Right: Trạng Thái Acc (● CÒN ACC / ● ĐANG THUÊ) */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
            {isAvailable ? (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#09090b]/90 text-emerald-400 border border-emerald-500/20 text-[9px] sm:text-[10px] font-semibold tracking-tight uppercase backdrop-blur-md flex items-center gap-1 sm:gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CÒN ACC</span>
              </span>
            ) : (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#09090b]/90 text-zinc-400 border border-white/10 text-[9px] sm:text-[10px] font-semibold tracking-tight uppercase backdrop-blur-md flex items-center gap-1 sm:gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>ĐANG THUÊ</span>
              </span>
            )}
          </div>

          {/* Bottom-Left: Mã Tài Khoản (Chỉ hiện trên desktop/tablet >= sm, ẩn trên mobile <= 480px) */}
          <div className="hidden sm:block absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded bg-[#09090b]/90 text-zinc-300 text-[9px] sm:text-[10px] font-mono font-medium border border-white/10 backdrop-blur-sm">
              #{item.code}
            </span>
          </div>

          {/* Bottom-Right: Favorite Button (♡ / ♥) */}
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={isFav ? `Bỏ lưu tài khoản ${item.code}` : `Lưu tài khoản ${item.code}`}
            title={isFav ? "Bỏ lưu" : "Lưu acc"}
            className="absolute bottom-1.5 right-1.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#09090b]/80 hover:bg-[#09090b] border border-white/10 hover:border-white/30 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm group/fav active:scale-90"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isFav ? "text-rose-500 fill-rose-500" : "text-zinc-400 group-hover/fav:text-white"
              }`}
            />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2. TÊN SẢN PHẨM (CLAMP 2 DÒNG, FONT 13-14px TRÊN MOBILE)      */}
        {/* ============================================================ */}
        <h3
          onClick={handleViewDetail}
          className="font-heading font-semibold text-[13px] sm:text-base text-white line-clamp-2 min-h-[36px] sm:min-h-[44px] leading-snug group-hover:text-zinc-200 transition-colors cursor-pointer mb-1.5 sm:mb-2.5"
          title={item.title}
        >
          {item.title}
        </h3>

        {/* ============================================================ */}
        {/* 3. THÔNG TIN METADATA (PET & SÂN ĐẤU, ẨN TRÊN MOBILE <= 480px)*/}
        {/* ============================================================ */}
        <div className="hidden sm:block space-y-1 text-xs sm:text-[13px] mb-2.5 sm:mb-3">
          <div
            onClick={handleViewDetail}
            className="flex items-center gap-1.5 text-zinc-200 min-w-0 cursor-pointer"
            title={item.allPetsSummary || item.mainPet}
          >
            <span className="text-zinc-400 font-medium flex-shrink-0 text-xs sm:text-[13px]">
              Pet:
            </span>
            <span className="font-normal text-zinc-200 truncate">
              {item.allPetsSummary || item.mainPet || "Tướng Tí Nị"}
            </span>
          </div>

          <div
            onClick={handleViewDetail}
            className="flex items-center gap-1.5 text-zinc-300 min-w-0 cursor-pointer"
            title={item.arena || (item.features && item.features[0]) || "Bản đồ cơ bản"}
          >
            <span className="text-zinc-400 font-medium flex-shrink-0 text-xs sm:text-[13px]">
              {item.arena ? "Sân:" : item.features && item.features.length > 0 ? "Đặc điểm:" : "Sân:"}
            </span>
            <span className="font-normal text-zinc-300 truncate">
              {item.arena || (item.features && item.features.length > 0 ? item.features[0] : "Bản đồ cơ bản")}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. GIÁ SẢN PHẨM & CÁC NÚT THAO TÁC (CTA)                     */}
      {/* ============================================================ */}
      <div className="mt-auto pt-2 sm:pt-3 border-t border-white/[0.06]">
        {/* Hiển thị giá nổi bật (Mobile: 16px font-bold 1 line, Desktop: 18-20px) */}
        <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
          <span className="text-base sm:text-[20px] font-bold text-white font-heading tracking-tight whitespace-nowrap">
            {formatVND(item.price)}
          </span>
          {/* Suffix: ẩn trên mobile để giữ card gọn gàng 1 dòng, desktop giữ nguyên */}
          {item.priceUnit && (
            <span className="hidden sm:inline text-xs sm:text-[13px] text-zinc-400 font-medium whitespace-nowrap">
              {item.priceUnit}
            </span>
          )}
        </div>

        {/* Nút CTA: Mobile 1 nút nổi bật (Chiều cao 38-40px, full-width, tap-friendly) */}
        {/* Mobile View (< sm) */}
        <div className="sm:hidden">
          {isAvailable ? (
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full h-[38px] px-3 bg-white hover:bg-zinc-200 active:scale-98 text-[#09090b] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              aria-label={`Thuê ngay tài khoản ${item.code}`}
            >
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0 text-[#09090b]" />
              <span className="truncate">Thuê ngay</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full h-[38px] px-3 bg-white/[0.03] text-zinc-400 border border-white/[0.06] font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-80"
              aria-label={`Tài khoản ${item.code} đang thuê`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span className="truncate">Đang thuê</span>
            </button>
          )}
        </div>

        {/* Desktop / Tablet View (>= sm): 2 nút (Chi tiết | Thuê ngay) */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-2">
          {/* Nút Phụ: Chi tiết */}
          <button
            type="button"
            onClick={handleViewDetail}
            className="h-10 px-2 bg-white/[0.04] hover:bg-white/[0.08] active:scale-98 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            aria-label={`Xem chi tiết tài khoản ${item.code}`}
          >
            <Eye className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
            <span className="truncate">Chi tiết</span>
          </button>

          {/* Nút Chính: Thuê ngay hoặc Đang thuê */}
          {isAvailable ? (
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="h-10 px-2 bg-white hover:bg-zinc-200 active:scale-98 text-[#09090b] font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              aria-label={`${ctaText} tài khoản ${item.code}`}
            >
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0 text-[#09090b]" />
              <span className="truncate">{ctaText}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="h-10 px-1.5 bg-white/[0.03] text-zinc-500 border border-white/[0.05] font-medium text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-80"
              aria-label={`Tài khoản ${item.code} đang thuê`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="truncate">Đang thuê</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENT SKELETON CHO PRODUCT CARD (DARK MONOCHROME)
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-between bg-[#121214] border border-white/[0.07] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 animate-pulse">
      <div>
        {/* Image thumbnail placeholder with exact square 1:1 aspect ratio */}
        <div className="relative aspect-square w-full rounded-lg sm:rounded-xl bg-zinc-800/60 mb-2 sm:mb-3 border border-white/[0.06] overflow-hidden">
          <div className="absolute top-2 left-2 w-8 h-4 rounded bg-zinc-700/60" />
          <div className="absolute top-2 right-2 w-16 h-4 rounded bg-zinc-700/60" />
          <div className="hidden sm:block absolute bottom-2 left-2 w-10 h-3.5 rounded bg-zinc-700/60" />
        </div>

        {/* Title skeleton (clamped 2 lines) */}
        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-2.5">
          <div className="h-3.5 sm:h-4.5 bg-zinc-800/70 rounded w-4/5" />
          <div className="h-3.5 sm:h-4.5 bg-zinc-800/50 rounded w-3/5" />
        </div>

        {/* Metadata lines skeleton (Pet & Sân) - Hidden on mobile */}
        <div className="hidden sm:block space-y-1.5 mb-3">
          <div className="h-3.5 bg-zinc-800/40 rounded w-2/3" />
          <div className="h-3.5 bg-zinc-800/40 rounded w-1/2" />
        </div>
      </div>

      {/* Price & action buttons skeleton */}
      <div className="mt-auto pt-2 sm:pt-3 border-t border-white/[0.06] space-y-2 sm:space-y-2.5">
        <div className="h-4.5 sm:h-5.5 bg-zinc-800/70 rounded w-24 sm:w-28" />
        {/* Mobile Skeleton */}
        <div className="sm:hidden">
          <div className="h-[38px] bg-zinc-800/60 rounded-xl w-full" />
        </div>
        {/* Desktop Skeleton */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-2">
          <div className="h-10 bg-zinc-800/40 rounded-xl" />
          <div className="h-10 bg-zinc-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENT EMPTY STATE CHUẨN (SMART NO-RESULT RECOVERY - PHASE 10)
 */
export const ProductCardEmptyState: React.FC<{
  title?: string;
  description?: string;
  searchQuery?: string;
  activeFilterCount?: number;
  suggestions?: string[];
  onSelectSuggestion?: (query: string) => void;
  onClearSearch?: () => void;
  onReset?: () => void;
  onViewAll?: () => void;
  onSwitchType?: (type: "VIP" | "CLONE") => void;
  totalCount?: number;
}> = ({
  title,
  description,
  searchQuery,
  activeFilterCount = 0,
  suggestions = ["Gwen", "Yasuo", "Yone", "Hàng Hiệu", "Sân Đấu"],
  onSelectSuggestion,
  onClearSearch,
  onReset,
  onViewAll,
  onSwitchType,
  totalCount,
}) => {
  const displayTitle = searchQuery
    ? `Không tìm thấy acc phù hợp với "${searchQuery}".`
    : title || "Không tìm thấy tài khoản phù hợp";

  const displayDescription = searchQuery
    ? activeFilterCount > 0
      ? `Từ khóa "${searchQuery}" kết hợp với các bộ lọc hiện tại không có tài khoản phù hợp. Bạn có thể thử bỏ bớt bộ lọc hoặc chọn từ khóa gợi ý.`
      : "Vui lòng kiểm tra lại từ khóa hoặc chọn các gợi ý bên dưới để xem tài khoản có sẵn trong kho."
    : description || "Bạn có thể thử tìm với từ khóa khác, thay đổi bộ lọc hoặc bấm Đặt lại để xem toàn bộ danh mục.";

  return (
    <div className="p-6 sm:p-10 text-center bg-[#141414] rounded-2xl border border-white/[0.08] space-y-4 col-span-full animate-in fade-in duration-200">
      <div className="w-12 h-12 rounded-full bg-white/[0.06] text-zinc-300 flex items-center justify-center mx-auto border border-white/10">
        <Search className="w-5 h-5 text-zinc-400" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-semibold text-white">
          {displayTitle}
        </h4>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {/* Gợi ý từ khóa hot có cơ sở thật trong kho */}
      {suggestions && suggestions.length > 0 && onSelectSuggestion && (
        <div className="pt-1 pb-2">
          <div className="text-[11px] text-zinc-500 mb-2 font-medium">Có thể bạn đang tìm:</div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {suggestions.slice(0, 5).map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => onSelectSuggestion(sug)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Các nút hành động phục hồi không để dead-end */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {searchQuery && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-[#090909] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Xóa tìm kiếm
          </button>
        )}

        {activeFilterCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Xóa {activeFilterCount} bộ lọc
          </button>
        )}

        {onSwitchType && (
          <>
            <button
              type="button"
              onClick={() => onSwitchType("VIP")}
              className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Xem Kho VIP
            </button>
            <button
              type="button"
              onClick={() => onSwitchType("CLONE")}
              className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Xem Kho Clone
            </button>
          </>
        )}

        {onReset && !activeFilterCount && (
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15"
          >
            Xem toàn bộ kho {totalCount ? `(${totalCount} acc)` : ""}
          </button>
        )}
      </div>
    </div>
  );
};
