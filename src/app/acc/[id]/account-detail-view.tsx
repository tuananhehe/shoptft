"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UnifiedProductAccount, getAccountProductUrl } from "@/utils/account-lookup";
import { PROFILE_INFO } from "@/data/tft-data";
import { formatRentalExpiry } from "@/utils/supabase/accounts-service";
import { getHomepageConfig, PricingConfig } from "@/utils/homepage-service";
import { copyToClipboard } from "@/utils/clipboard-helper";
import { analytics } from "@/utils/analytics";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { TFTImageLightbox } from "@/components/tft-image-lightbox";
import { ZaloRedirectModal } from "@/components/zalo-redirect-modal";
import { TFTRecentlyViewed } from "@/components/tft-recently-viewed";
import { addRecentlyViewed, isFavorite, toggleFavorite } from "@/utils/product-discovery";
import { usePrimaryCtaExperiment } from "@/utils/experiments";
import { Reveal } from "@/components/reveal";
import { SectionErrorBoundary } from "@/components/error-boundary";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Phone,
  MessageCircle,
  ChevronRight,
  ZoomIn,
  Sparkles,
  Heart,
  BookOpen,
} from "lucide-react";

interface AccountDetailViewProps {
  account: UnifiedProductAccount;
  relatedAccounts: UnifiedProductAccount[];
}

type PackageKey = "2h" | "7d" | "30d" | "perm";

export function AccountDetailView({ account, relatedAccounts }: AccountDetailViewProps) {
  const isClone = account.type === "CLONE";
  const { ctaText, variant, experimentId } = usePrimaryCtaExperiment();
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("perm");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zaloRedirectMessage, setZaloRedirectMessage] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [pricingRates, setPricingRates] = useState<PricingConfig>({
    passChangeFee: 20000,
    rate2Hours: 3,
    rate7Days: 12,
    rate30Days: 30,
  });

  const isRented = account.status === "RENTED";
  const rentalInfo = formatRentalExpiry(account.rentedUntil);

  const baseAccountValue =
    Number(account.accountValue) ||
    Number(account.periodPrice) ||
    Number(account.monthlyPrice) ||
    (Number(account.hourlyPrice) || 15000) * 50 ||
    850000;

  const clonePrice = Number(account.price) || Number(account.periodPrice) || Number(account.monthlyPrice) || 150000;

  useEffect(() => {
    getHomepageConfig().then((cfg) => {
      if (cfg?.pricing) {
        setPricingRates(cfg.pricing);
      }
    });
  }, []);

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(account.id));
    const handleFavUpdate = (e: any) => {
      if (!e.detail?.changedId || e.detail.changedId === account.id) {
        setIsFav(isFavorite(account.id));
      }
    };
    window.addEventListener("tft:favorites_updated", handleFavUpdate);
    return () => window.removeEventListener("tft:favorites_updated", handleFavUpdate);
  }, [account.id]);

  const handleToggleFav = () => {
    const nextState = toggleFavorite(account);
    setIsFav(nextState);
  };

  const hasTrackedViewProduct = useRef<string | null>(null);

  useEffect(() => {
    setSelectedPackage("perm");
    addRecentlyViewed(account);
    const productId = account.code || account.id;
    if (hasTrackedViewProduct.current !== productId) {
      hasTrackedViewProduct.current = productId;
      analytics.trackViewProduct({
        product_id: productId,
        product_type: isClone ? "CLONE" : "VIP",
        availability: isRented ? "RENTED" : "AVAILABLE",
        display_price: isClone ? clonePrice : baseAccountValue,
      });
    }
  }, [account.id, account.code, isClone, isRented, clonePrice, baseAccountValue]);

  useEffect(() => {
    if (account.status === "RENTED") {
      const info = formatRentalExpiry(account.rentedUntil);
      setCountdownSeconds(info ? info.remainingSec : 0);

      const timer = setInterval(() => {
        const liveInfo = formatRentalExpiry(account.rentedUntil);
        setCountdownSeconds(liveInfo ? liveInfo.remainingSec : 0);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [account]);

  const days = Math.floor(countdownSeconds / (24 * 3600));
  const hours = Math.floor((countdownSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const isInfinite = days > 365 || (rentalInfo ? rentalInfo.isInfinite : false);

  const formatMoney = (amount?: number) => {
    if (!amount) return "0đ";
    return `${amount.toLocaleString("vi-VN")}đ`;
  };

  const roundToThousand = (num: number) => Math.round(num / 1000) * 1000;

  const passFee = pricingRates.passChangeFee || 20000;
  const rate2h = (pricingRates.rate2Hours || 3) / 100;
  const rate7d = (pricingRates.rate7Days || 12) / 100;
  const rate30d = (pricingRates.rate30Days || 30) / 100;

  const packageConfigs: Record<
    PackageKey,
    {
      id: PackageKey;
      name: string;
      sub: string;
      totalPrice: number;
      basePrice: number;
      passFee: number;
      badge?: string;
    }
  > = {
    "2h": {
      id: "2h",
      name: "2 Giờ",
      sub: "Trải nghiệm nhanh",
      basePrice: roundToThousand(baseAccountValue * rate2h),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate2h) + passFee,
      badge: "Phổ Biến",
    },
    "7d": {
      id: "7d",
      name: "7 Ngày",
      sub: "Tiết kiệm 45%",
      basePrice: roundToThousand(baseAccountValue * rate7d),
      passFee: passFee,
      totalPrice: roundToThousand(baseAccountValue * rate7d) + passFee,
      badge: "Tiết Kiệm",
    },
    "30d": {
      id: "30d",
      name: "30 Ngày",
      sub: "Free đổi pass",
      basePrice: roundToThousand(baseAccountValue * rate30d),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue * rate30d),
      badge: "Hot Nhất",
    },
    perm: {
      id: "perm",
      name: "Lâu Dài (∞)",
      sub: "Bàn giao về chính chủ",
      basePrice: roundToThousand(baseAccountValue),
      passFee: 0,
      totalPrice: roundToThousand(baseAccountValue),
      badge: "Chính Chủ",
    },
  };

  const activePackage = isClone
    ? {
        id: "perm" as PackageKey,
        name: "Lâu Dài (∞)",
        sub: "Bàn giao thông tin acc về chính chủ, sở hữu lâu dài",
        basePrice: clonePrice,
        passFee: 0,
        totalPrice: clonePrice,
        badge: "Chính Chủ",
      }
    : packageConfigs[selectedPackage] || packageConfigs["perm"];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      copyToClipboard(window.location.href);
      setCopiedLink(true);
      toast.success("Đã sao chép link tài khoản!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(account.code);
    setCopiedCode(true);
    toast.success(`Đã sao chép mã acc [${account.code}]`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Thuê Acc TFT [${account.code}] - ${account.title}`,
          text: `Xem acc TFT ${account.code} tại ShopTFT Mobile`,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleOrderZalo = () => {
    const rawUrl = typeof window !== "undefined" ? window.location.href : "";
    const packageNote = isClone
      ? `Gói: Mua Sở Hữu Lâu Dài (${formatMoney(clonePrice)})`
      : `Gói: ${activePackage.name} (${formatMoney(activePackage.totalPrice)})`;

    const message = [
      `Chào Tuấn Thái Bình, mình muốn thuê/mua tài khoản TFT:`,
      `- Mã số: ${account.code}`,
      `- Tên acc: ${account.title}`,
      `- ${packageNote}`,
      `- Link: ${rawUrl}`,
      `Nhờ shop tư vấn và bàn giao tài khoản qua Zalo giúp mình nhé!`,
    ].join("\n");

    try {
      analytics.trackClickZalo({
        source: "product_detail",
        product_id: account.code || account.id,
        product_type: isClone ? "CLONE" : "VIP",
        rental_package: selectedPackage,
      });
    } catch {}

    setZaloRedirectMessage(message);
  };

  const allChibis =
    account.allChibi && account.allChibi.length > 0
      ? account.allChibi
      : account.mainChibi
      ? [account.mainChibi]
      : [];

  const allArenas =
    account.allArenas && account.allArenas.length > 0
      ? account.allArenas
      : account.mainArena
      ? [account.mainArena]
      : [];

  const primarySearchTarget = allChibis[0] || account.title.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* 1. Header */}
      <TFTNavbar />

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 pb-28 lg:pb-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-white/[0.08]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link
              href="/shop"
              onClick={() => {
                try {
                  analytics.trackProductToShop(account.code || account.id);
                } catch {}
              }}
              className="hover:text-white transition-colors"
            >
              Kho Acc
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{account.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              aria-label="Chia sẻ sản phẩm"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </button>

            <button
              onClick={handleToggleFav}
              aria-label={isFav ? "Bỏ lưu tài khoản" : "Lưu tài khoản yêu thích"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isFav
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  : "bg-white/[0.05] border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isFav ? "Đã lưu" : "Lưu acc"}</span>
            </button>
          </div>
        </div>

        {/* Product Showcase Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT COLUMN: Image & Trust */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121214] rounded-2xl border border-white/[0.08] p-3 sm:p-4 relative overflow-hidden">
              {/* Image Container */}
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#09090b] border border-white/[0.06] cursor-zoom-in group"
              >
                <LazyAccountImage
                  src={account.thumbnail}
                  alt={`Acc TFT ${account.title} - Mã ${account.code}`}
                  priority
                  containerClassName="w-full h-full flex items-center justify-center"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top-Right: Code Button */}
                <button
                  onClick={handleCopyCode}
                  title="Chạm để sao chép mã acc"
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/85 text-xs font-mono font-medium text-white shadow-md border border-white/15 cursor-pointer hover:bg-black"
                >
                  <span>{account.code}</span>
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                </button>

                {/* Top-Left: Availability Status */}
                <div className="absolute top-3 left-3">
                  {!isRented ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>CÒN ACC</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-zinc-400 border border-white/10 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>ĐANG THUÊ</span>
                    </span>
                  )}
                </div>

                {/* Bottom-Left: Rank Badge */}
                {account.rank && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/85 text-zinc-200 text-xs font-semibold uppercase tracking-wide border border-white/10 backdrop-blur-md">
                      {account.rank}
                    </span>
                  </div>
                )}

                {/* Zoom Hint */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/80 border border-white/20 text-xs font-medium text-white flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Phóng to ảnh</span>
                  </span>
                </div>
              </div>

              {/* Rented Status Box (if rented) */}
              {isRented && (
                <div className="mt-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Thời gian trả acc dự kiến:</span>
                    </div>
                    <span className="font-mono text-white font-medium">
                      {rentalInfo.expiryFormatted}
                    </span>
                  </div>
                  <div className="text-center font-mono font-bold text-zinc-300 text-sm">
                    {isInfinite
                      ? "Thuê Vô Cực ∞"
                      : countdownSeconds > 0
                      ? `${days > 0 ? `${days} ngày ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
                      : "Sắp sẵn sàng"}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Xem xác minh bảo hiểm trên Checkscam"
                className="p-3 rounded-xl bg-[#121214] border border-white/[0.08] hover:border-emerald-500/40 transition-colors space-y-1 block group"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
                <div className="font-semibold text-white">Bảo Hiểm 30M</div>
                <div className="text-[10px] text-zinc-400 group-hover:text-emerald-400 transition-colors">Xem xác minh ↗</div>
              </a>
              <div className="p-3 rounded-xl bg-[#121214] border border-white/[0.08] space-y-1">
                <MessageCircle className="w-4 h-4 text-zinc-300 mx-auto" />
                <div className="font-semibold text-white">Bàn Giao Zalo</div>
                <div className="text-[10px] text-zinc-400">Thủ công uy tín</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121214] border border-white/[0.08] space-y-1">
                <Sparkles className="w-4 h-4 text-zinc-300 mx-auto" />
                <div className="font-semibold text-white">Tuấn Thái Bình</div>
                <div className="text-[10px] text-zinc-400">Cựu Thách Đấu</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Actions */}
          {/* RIGHT COLUMN: Details & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* 1. Header Title & Quick Status Card */}
            <div className="bg-[#121214] rounded-2xl border border-white/[0.08] p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white/10 text-white border border-white/10">
                  {isClone ? "KHO CLONE" : "KHO VIP"}
                </span>
                {account.rank && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                    {account.rank}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-400 bg-white/[0.05]">
                  Mã: {account.code}
                </span>
                <span className={`ml-auto px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 ${
                  isRented ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isRented ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                  <span>{isRented ? "Đang thuê" : "Còn sẵn sàng"}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-white leading-tight">
                {account.title}
              </h1>
            </div>

            {/* 2. Pricing & Booking Packages Card (Đưa lên trên để user quyết định nhanh) */}
            <div className="bg-[#121214] rounded-2xl border border-white/[0.08] p-4 sm:p-6 space-y-4">
              {isClone ? (
                /* Clone Account */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Gói thuê: Sở Hữu Trọn Đời</h2>
                    <span className="text-xs text-zinc-400">Bàn giao về mail chính chủ</span>
                  </div>

                  <div className="p-4 bg-[#18181b] rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Giá sở hữu lâu dài:</span>
                    <span className="text-2xl font-bold font-heading text-white">
                      {formatMoney(clonePrice)}
                    </span>
                  </div>
                </div>
              ) : (
                /* VIP Account Package Selector */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Gói thuê</h2>
                    <span className="text-xs text-zinc-400">Bàn giao qua Zalo</span>
                  </div>

                  {/* 4 Packages Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["2h", "7d", "30d", "perm"] as PackageKey[]).map((pkgKey) => {
                      const pkg = packageConfigs[pkgKey];
                      const isSelected = selectedPackage === pkgKey;
                      return (
                        <button
                          key={pkgKey}
                          onClick={() => {
                            if (selectedPackage !== pkgKey) {
                              setSelectedPackage(pkgKey);
                              analytics.trackSelectRentalPackage({
                                product_id: account.code || account.id,
                                package_name: pkg.name,
                                duration_hours: pkgKey === "2h" ? 2 : pkgKey === "7d" ? 168 : 720,
                                price: pkg.totalPrice,
                              });
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[85px] ${
                            isSelected
                              ? "bg-white/15 border-white text-white shadow-sm"
                              : "bg-[#18181b] border-white/10 hover:border-white/20 text-zinc-300"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{pkg.name}</div>
                            <div className="text-[10px] text-zinc-400 line-clamp-1">{pkg.sub}</div>
                          </div>
                          <div className="mt-2 font-mono font-bold text-xs sm:text-sm text-white">
                            {formatMoney(pkg.totalPrice)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Price Summary */}
                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/10 space-y-1.5 text-xs text-zinc-300">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Gói đã chọn:</span>
                      <strong className="text-white font-medium">{activePackage.name}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-white font-semibold">Tổng thanh toán:</span>
                      <span className="text-xl font-heading font-bold text-white">
                        {formatMoney(activePackage.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 space-y-2">
                {isRented ? (
                  <div className="space-y-2">
                    <div className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Tài khoản đang có khách thuê</span>
                    </div>
                    <Link
                      href={`/shop?search=${encodeURIComponent(primarySearchTarget)}&status=available`}
                      className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-99"
                    >
                      <span>Tìm acc tương tự đang còn</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleOrderZalo}
                    className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{ctaText}</span>
                  </button>
                )}

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Bàn giao & hỗ trợ trực tiếp qua Zalo</span>
                  <a
                    href={`tel:${PROFILE_INFO.phoneZalo.replace(/\./g, "")}`}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hotline: {PROFILE_INFO.phoneZalo}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Detailed Specifications & Inventory Card */}
            <div className="bg-[#121214] rounded-2xl border border-white/[0.08] p-4 sm:p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Chi Tiết Trang Bị & Thông Số
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-zinc-500 text-[11px]">Phân loại</div>
                  <div className="font-semibold text-white mt-0.5">{isClone ? "Acc Clone (Chính chủ)" : "Acc VIP Thuê"}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-zinc-500 text-[11px]">Mức Rank</div>
                  <div className="font-semibold text-white mt-0.5">{account.rank || "Chưa rank"}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-zinc-500 text-[11px]">Trạng thái</div>
                  <div className={`font-semibold mt-0.5 ${isRented ? "text-amber-400" : "text-emerald-400"}`}>
                    {isRented ? "Đang thuê" : "Còn sẵn sàng"}
                  </div>
                </div>
              </div>

              {allChibis.length > 0 && (
                <div className="pt-1">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
                    Pet / Chibi
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allChibis.map((chibi, idx) => (
                      <span
                        key={`chibi-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-200 text-xs font-medium"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{chibi}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {allArenas.length > 0 && (
                <div className="pt-1">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
                    Sân Đấu
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allArenas.map((arena, idx) => (
                      <span
                        key={`arena-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-200 text-xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>{arena}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {account.features && account.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {account.features.map((feat, idx) => (
                    <span
                      key={`feat-${idx}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              )}

              {account.description && (
                <div className="pt-3 border-t border-white/[0.08] text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-1">
                  <div className="text-zinc-400 font-semibold text-xs">Mô tả:</div>
                  <p>{account.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Accounts Section */}
        {relatedAccounts && relatedAccounts.length > 0 && (
          <SectionErrorBoundary sectionName="RelatedAccounts" silent>
            <Reveal>
              <div
                style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}
                className="mt-12 pt-8 border-t border-white/[0.08] space-y-4"
              >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
                    {isRented ? "Acc tương tự đang còn" : "Acc tương tự"}
                  </h2>
                  <p className="text-zinc-400 text-xs">
                    {isRented
                      ? "Gợi ý các tài khoản đang sẵn sàng có Pet và Sân Đấu tương đồng"
                      : "Gợi ý cùng phân khúc Tướng Tí Nị và Sân Đấu"}
                  </p>
                </div>

                <Link
                  href="/shop"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Xem tất cả kho acc</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {relatedAccounts.slice(0, 6).map((rel) => {
                  const relUrl = getAccountProductUrl(rel);
                  const relPrice =
                    rel.type === "CLONE"
                      ? Number(rel.price) || 150000
                      : rel.hourlyPrice || 15000;
                  const relUnit =
                    rel.type === "CLONE" ? " / Sở hữu" : " / Giờ";

                  return (
                    <Link
                      key={rel.id}
                      href={relUrl}
                      onClick={() => {
                        try {
                          analytics.trackProductToRelated(account.code || account.id, rel.code || rel.id);
                        } catch {}
                      }}
                      className="bg-[#121214] rounded-2xl border border-white/[0.08] hover:border-white/20 p-3 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#09090b] mb-2.5">
                          <LazyAccountImage
                            src={rel.thumbnail}
                            alt={`Acc TFT ${rel.title}`}
                            containerClassName="w-full h-full flex items-center justify-center"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1.5 right-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                              {rel.code}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 group-hover:text-zinc-200 transition-colors">
                          {rel.title}
                        </h3>

                        <div className="mt-1 text-[11px] text-zinc-400 line-clamp-1">
                          {rel.mainChibi || (rel.allChibi && rel.allChibi[0]) || rel.rank}
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="font-heading font-bold text-white">
                          {formatMoney(relPrice)}
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {relUnit}
                          </span>
                        </span>
                        <span className="text-[11px] text-zinc-400 group-hover:text-white transition-colors">
                          Chi tiết →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            </Reveal>
          </SectionErrorBoundary>
        )}

        {/* Hướng Dẫn & Cẩm Nang Liên Quan (Shop -> Content) */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-heading font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hướng dẫn liên quan</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Cẩm nang bảo mật Riot, mẹo chọn acc theo Pet và giải đáp thắc mắc khi thuê.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/huong-dan/doi-thong-tin-acc-riot"
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs transition-colors"
            >
              Đổi thông tin Riot
            </Link>
            <Link
              href="/blog/cach-chon-acc-tft-theo-pet-chibi-va-san-dau"
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs transition-colors"
            >
              Chọn acc theo Pet
            </Link>
            <Link
              href="/thue-acc-tft-dtcl#faq"
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs transition-colors"
            >
              FAQ thuê acc
            </Link>
          </div>
        </div>

        {/* Recently Viewed Accounts */}
        <SectionErrorBoundary sectionName="RecentlyViewed" silent>
          <TFTRecentlyViewed excludeId={account.id} />
        </SectionErrorBoundary>
      </main>

      {/* Footer */}
      <TFTFooter />

      {/* Lightbox Modal */}
      <TFTImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={account.thumbnail}
        code={account.code}
        rank={account.rank}
        status={account.status}
        price={account.hourlyPrice || account.price}
        title={`${account.code} - ${account.title}`}
      />

      {/* Zalo Redirect Modal */}
      <ZaloRedirectModal
        isOpen={!!zaloRedirectMessage}
        onClose={() => setZaloRedirectMessage(null)}
        orderMessage={zaloRedirectMessage || ""}
        zaloUrl={PROFILE_INFO.zaloUrl}
      />

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-t border-white/10 p-3 px-4 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-zinc-400 block truncate max-w-[140px]">
            {isRented
              ? "Trạng thái:"
              : isClone
              ? `${account.code} - Trọn gói:`
              : `${account.code} - ${activePackage.name}:`}
          </span>
          <span className="text-base font-heading font-bold text-white">
            {isRented ? "Đang có khách" : formatMoney(activePackage.totalPrice)}
          </span>
        </div>

        {isRented ? (
          <Link
            href={`/shop?search=${encodeURIComponent(primarySearchTarget)}&status=available`}
            className="py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs transition-colors"
          >
            Tìm acc tương tự đang còn
          </Link>
        ) : (
          <button
            onClick={handleOrderZalo}
            className="py-2.5 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{ctaText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
