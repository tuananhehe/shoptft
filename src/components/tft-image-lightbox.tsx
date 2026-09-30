"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  KeyRound,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Share2,
  Gamepad2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAccountProductUrl } from "@/utils/account-lookup";

interface TFTImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  code: string;
  rank?: string;
  price?: string | number;
  status?: string;
  onClose: () => void;
  onRentNow?: () => void;
}

function sanitizeTftImageUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim();

  // Sửa các đuôi bị nối đúp tên file của CommunityDragon
  cleaned = cleaned.replace(/\.chibi_annie_cafecuties\.png$/i, ".png");
  cleaned = cleaned.replace(/\.chibi_vex_base\.png$/i, ".png");
  cleaned = cleaned.replace(/\.chibi_vex_cafecuties\.png$/i, ".png");
  cleaned = cleaned.replace(/\.tft_style2_darius_base\.png$/i, ".png");

  // Xử lý tier dị bản nếu có
  if (cleaned.includes("raw.communitydragon.org") && /_tier\d+\.[^/]+\.png$/i.test(cleaned)) {
    cleaned = cleaned.replace(/_tier\d+\.[^/]+\.png$/i, "_tier1.png");
  }

  // Tối ưu Unsplash nếu là link ảnh mẫu
  if (cleaned.includes("images.unsplash.com")) {
    cleaned = cleaned.replace(/w=\d+/, "w=1200").replace(/q=\d+/, "q=85");
    if (!cleaned.includes("auto=format")) {
      cleaned += "&auto=format";
    }
  }

  return cleaned;
}

const LIGHTBOX_FALLBACK = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop";

export const TFTImageLightbox: React.FC<TFTImageLightboxProps> = ({
  isOpen,
  imageUrl,
  title,
  code,
  rank,
  price,
  status,
  onClose,
  onRentNow,
}) => {
  const [mounted, setMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Client-only mount check for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanUrl = useMemo(() => sanitizeTftImageUrl(imageUrl), [imageUrl]);

  // Reset scale và error state khi ảnh hoặc trạng thái mở thay đổi
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setImgError(false);
    }
  }, [isOpen, imageUrl]);

  // Đóng bằng phím ESC hoặc phím tắt +/- để zoom
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setScale((prev) => Math.min(prev + 0.5, 3));
      } else if (e.key === "-") {
        setScale((prev) => Math.max(prev - 0.5, 1));
      } else if (e.key === "0") {
        setScale(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi mở lightbox
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const productUrl = getAccountProductUrl({ id: code, code });

  const copyAccCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    toast.success(`Đã sao chép mã tài khoản: ${code}!`);
  };

  const copyAccLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}${productUrl}`;
      navigator.clipboard.writeText(fullUrl).catch(() => {});
      setCopiedLink(true);
      toast.success("Đã sao chép link riêng của tài khoản!", { icon: "🔗" });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => (prev > 1 ? 1 : 2));
  };

  const isRented = (status || "").toUpperCase() === "RENTED";

  const lightboxContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Phóng to ảnh tài khoản ${code}`}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-2.5 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 1. TOP FLOATING CONTROL BAR */}
      <div
        className="flex items-center justify-between w-full max-w-5xl mx-auto z-20 pt-1 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Info Tags */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          <button
            type="button"
            onClick={copyAccCode}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Bấm để sao chép mã"
          >
            <span>{code}</span>
            <Copy className="w-3 h-3 text-slate-300" />
          </button>

          {rank && (
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-zinc-200 border border-white/15 font-semibold text-[11px] uppercase tracking-wide truncate max-w-[130px] sm:max-w-none">
              {rank}
            </span>
          )}

          {isRented ? (
            <span className="px-2 py-0.5 sm:py-1 rounded-lg bg-white/10 text-zinc-400 border border-white/10 font-semibold text-[10px] sm:text-[11px] uppercase">
              ĐANG THUÊ
            </span>
          ) : (
            <span className="px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px] sm:text-[11px] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CÒN ACC</span>
            </span>
          )}
        </div>

        {/* Zoom Controls + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/10 border border-white/15 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              aria-label="Thu nhỏ"
              className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono font-semibold text-zinc-200 hover:text-white transition-colors"
              title="Khôi phục 100%"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              aria-label="Phóng to"
              className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Phóng to (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={copyAccLink}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sao chép link web acc này"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedLink ? "Đã chép link" : "Chép link"}</span>
          </button>

          <Link
            href={productUrl}
            target="_blank"
            className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer"
            title="Mở trang riêng acc này"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Trang riêng</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem ảnh"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN ZOOMABLE IMAGE CONTAINER */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center py-2 sm:py-4 overflow-auto relative touch-manipulation"
        onClick={(e) => {
          // Chỉ đóng nếu click vào vùng nền trống
          if (e.target === containerRef.current) {
            onClose();
          }
        }}
      >
        <div
          className="relative max-w-5xl max-h-[76vh] w-auto h-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] bg-zinc-950 flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          onClick={toggleZoom}
          title={scale > 1 ? "Nhấp để thu về 100%" : "Nhấp để phóng to 200%"}
        >
          {!imgError && cleanUrl ? (
            <img
              src={cleanUrl}
              alt={title}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              className={`w-full h-full object-contain max-h-[72vh] sm:max-h-[76vh] transition-all select-none ${
                scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
            />
          ) : (
            /* Fallback Card khi ảnh gốc gặp sự cố */
            <div className="w-[320px] sm:w-[480px] h-[280px] sm:h-[360px] flex flex-col items-center justify-center bg-zinc-900/90 text-zinc-300 p-6 text-center gap-3">
              <Gamepad2 className="w-12 h-12 text-zinc-500" />
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-white/10 border border-white/15">
                  {code}
                </span>
                <h4 className="text-sm font-semibold text-white">{title}</h4>
              </div>
              <p className="text-xs text-zinc-400 max-w-xs">
                Ảnh tài khoản hiện đang được cập nhật lại từ server. Bạn vẫn có thể thuê hoặc liên hệ Tuấn Thái Bình để xem ảnh trực tiếp!
              </p>
            </div>
          )}

          {/* Scale Overlay Indicator on mobile */}
          {scale > 1 && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/20 sm:hidden">
              {Math.round(scale * 100)}% (Chạm để đặt lại)
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM FLOATING INFO & ACTION BAR */}
      <div
        className="w-full max-w-5xl mx-auto z-20 pb-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-900/95 border border-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          <div className="text-center sm:text-left min-w-0 flex-1">
            <h4 className="text-white font-bold text-sm sm:text-base line-clamp-1">
              {title}
            </h4>
            {price && (
              <p className="text-zinc-400 font-mono font-medium text-xs sm:text-sm mt-0.5">
                Giá thuê từ: <span className="text-white font-bold text-sm sm:text-base">{typeof price === "number" ? `${price.toLocaleString("vi-VN")}đ` : price}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mobile zoom controls */}
            <div className="flex sm:hidden items-center bg-white/10 border border-white/15 rounded-xl px-1 py-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 1}
                aria-label="Thu nhỏ"
                className="p-1 text-zinc-300 disabled:opacity-30"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 text-[10px] font-mono font-bold text-zinc-200"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                aria-label="Phóng to"
                className="p-1 text-zinc-300 disabled:opacity-30"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex-1 sm:flex-none cursor-pointer"
            >
              Đóng
            </button>

            {onRentNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRentNow();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Thuê Ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
};
