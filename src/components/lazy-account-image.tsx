"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Gamepad2 } from "lucide-react";

interface LazyAccountImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

/**
 * Tự động chuẩn hóa và sửa các lỗi URL ảnh CommunityDragon thường gặp
 */
function cleanTftImageUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim();

  // Sửa các đuôi bị nối đúp tên file của CommunityDragon
  cleaned = cleaned.replace(/\.chibi_annie_cafecuties\.png$/i, ".png");
  cleaned = cleaned.replace(/\.chibi_vex_base\.png$/i, ".png");
  cleaned = cleaned.replace(/\.chibi_vex_cafecuties\.png$/i, ".png");
  cleaned = cleaned.replace(/\.tft_style2_darius_base\.png$/i, ".png");

  return cleaned;
}

const PRIMARY_FALLBACK = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop";

export const LazyAccountImage: React.FC<LazyAccountImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-900 border border-slate-100 shadow-inner",
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallbackStep, setFallbackStep] = useState(0); // 0 = original, 1 = sanitized/strip, 2 = primary fallback, 3 = failed
  const imgRef = useRef<HTMLImageElement>(null);

  const initialCleanSrc = useMemo(() => cleanTftImageUrl(src), [src]);

  // Determine actual image source based on fallback step
  const activeSrc = useMemo(() => {
    if (!initialCleanSrc) return PRIMARY_FALLBACK;
    if (fallbackStep === 0) return initialCleanSrc;
    if (fallbackStep === 1) {
      // Thử loại bỏ các phần mở rộng lạ sau _tier nếu có
      if (initialCleanSrc.includes("raw.communitydragon.org") && /_tier\d+\.[^/]+\.png$/i.test(initialCleanSrc)) {
        return initialCleanSrc.replace(/_tier\d+\.[^/]+\.png$/i, "_tier1.png");
      }
      return PRIMARY_FALLBACK;
    }
    return PRIMARY_FALLBACK;
  }, [initialCleanSrc, fallbackStep]);

  useEffect(() => {
    setFallbackStep(0);
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, [activeSrc]);

  const handleError = () => {
    if (fallbackStep < 2) {
      setFallbackStep((prev) => prev + 1);
    } else {
      setFallbackStep(3); // All image attempts failed
      setIsLoaded(true);
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {/* 1. Placeholder tĩnh khi ảnh đang tải */}
      {!isLoaded && fallbackStep < 3 && (
        <div className="absolute inset-0 z-0 bg-slate-800/40 animate-pulse" />
      )}

      {/* 2. Thẻ ảnh với transition fade-in */}
      {fallbackStep < 3 ? (
        <img
          ref={imgRef}
          src={activeSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        /* 3. Fallback sang trọng nếu toàn bộ link ảnh đều hỏng */
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300 text-xs p-3 text-center gap-1.5 select-none">
          <Gamepad2 className="w-8 h-8 text-orange-500/80 drop-shadow-sm" />
          <span className="text-[11px] font-bold text-slate-200 line-clamp-1">{alt || "Tài Khoản ĐTCL"}</span>
          <span className="text-[9px] font-mono text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/20">
            TFT Shop Tuấn
          </span>
        </div>
      )}
    </div>
  );
};
