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

export const LazyAccountImage: React.FC<LazyAccountImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-contain",
  containerClassName = "relative aspect-square w-full overflow-hidden rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center",
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallbackStep, setFallbackStep] = useState(0); // 0 = original, 1 = sanitized/strip, 2 = failed
  const imgRef = useRef<HTMLImageElement>(null);

  const initialCleanSrc = useMemo(() => cleanTftImageUrl(src), [src]);

  // Determine actual image source based on fallback step
  const activeSrc = useMemo(() => {
    if (!initialCleanSrc) return null;
    if (fallbackStep === 0) return initialCleanSrc;
    if (fallbackStep === 1) {
      // Thử loại bỏ các phần mở rộng lạ sau _tier nếu có
      if (initialCleanSrc.includes("raw.communitydragon.org") && /_tier\d+\.[^/]+\.png$/i.test(initialCleanSrc)) {
        return initialCleanSrc.replace(/_tier\d+\.[^/]+\.png$/i, "_tier1.png");
      }
      return null;
    }
    return null;
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
    if (fallbackStep === 0 && initialCleanSrc?.includes("raw.communitydragon.org")) {
      setFallbackStep(1);
    } else {
      setFallbackStep(2); // All image attempts failed -> render clean neutral placeholder
      setIsLoaded(true);
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {/* 1. Placeholder tĩnh khi ảnh đang tải */}
      {!isLoaded && fallbackStep < 2 && activeSrc && (
        <div className="absolute inset-0 z-0 bg-zinc-800/40 animate-pulse" />
      )}

      {/* 2. Thẻ ảnh với transition fade-in */}
      {fallbackStep < 2 && activeSrc ? (
        <img
          ref={imgRef}
          src={activeSrc}
          alt={alt}
          width={400}
          height={400}
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0d0f] text-zinc-400 text-xs p-3 text-center gap-1.5 select-none">
          <Gamepad2 className="w-8 h-8 text-zinc-500 drop-shadow-sm" />
          <span className="text-[11px] font-medium text-zinc-300 line-clamp-1">{alt || "Tài Khoản ĐTCL"}</span>
          <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
            ShopTFTMobile
          </span>
        </div>
      )}
    </div>
  );
};
