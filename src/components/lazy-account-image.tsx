"use client";

import React, { useState, useEffect, useRef } from "react";
import { ImageOff, Sparkles } from "lucide-react";

interface LazyAccountImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const LazyAccountImage: React.FC<LazyAccountImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-900 border border-slate-100 shadow-inner",
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const fallbackUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop";
  const imageSource = !src || hasError ? fallbackUrl : src;

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, [imageSource]);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* 1. SKELETON SHIMMER PLACEHOLDER (Hiện trong khi ảnh đang load) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-400/70 animate-spin" />
          </div>
        </div>
      )}

      {/* 2. THẺ ẢNH VỚI ASYNC DECODING VÀ FADE-IN NGAY KHI XONG */}
      <img
        ref={imgRef}
        src={imageSource}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 3. FALLBACK NẾU ẢNH LỖI HOÀN TOÀN */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-800/90 text-slate-400 text-xs gap-1">
          <ImageOff className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] text-slate-400 font-medium">TFT Shop</span>
        </div>
      )}
    </div>
  );
};
