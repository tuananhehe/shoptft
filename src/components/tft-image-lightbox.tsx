"use client";

import React, { useEffect } from "react";
import { X, KeyRound, ZoomIn, Sparkles, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

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
  // Đóng bằng phím ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi mở lightbox
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const copyAccCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    toast.success(`Đã sao chép mã tài khoản: ${code}!`);
  };

  const isRented = (status || "").toUpperCase() === "RENTED";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* 1. TOP FLOATING BAR */}
      <div
        className="flex items-center justify-between w-full max-w-4xl mx-auto z-10 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyAccCode}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{code}</span>
            <Copy className="w-3 h-3 text-slate-300" />
          </button>

          {rank && (
            <span className="px-2.5 py-1 rounded-lg bg-orange-600/90 text-white font-extrabold text-[11px] uppercase tracking-wide">
              {rank}
            </span>
          )}

          {isRented ? (
            <span className="px-2.5 py-1 rounded-lg bg-rose-600/90 text-white font-bold text-[11px] uppercase">
              Đang Thuê
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white font-bold text-[11px] uppercase">
              Sẵn Sàng
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng xem ảnh"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. MAIN ZOOMABLE IMAGE CONTAINER */}
      <div
        className="flex-1 flex items-center justify-center py-2 sm:py-4 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-w-4xl max-h-[75vh] w-auto h-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-slate-900">
          <img
            src={imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"}
            alt={title}
            className="w-full h-full object-contain max-h-[72vh] sm:max-h-[76vh] animate-scaleIn"
          />
        </div>
      </div>

      {/* 3. BOTTOM FLOATING INFO & RENT ACTION BAR */}
      <div
        className="w-full max-w-4xl mx-auto z-10 pb-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900/90 border border-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          <div className="text-center sm:text-left min-w-0 flex-1">
            <h4 className="text-white font-bold text-sm sm:text-base line-clamp-1">
              {title}
            </h4>
            {price && (
              <p className="text-orange-400 font-mono font-bold text-xs sm:text-sm mt-0.5">
                Giá thuê từ: <span className="text-white font-black text-sm sm:text-base">{typeof price === "number" ? `${price.toLocaleString("vi-VN")}đ` : price}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors w-1/3 sm:w-auto cursor-pointer"
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
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
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
};
