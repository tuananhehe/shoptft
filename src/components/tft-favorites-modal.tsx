"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DiscoveredProduct,
  getFavorites,
  toggleFavorite,
} from "@/utils/product-discovery";
import { formatVND } from "@/components/product-card";
import { LazyAccountImage } from "@/components/lazy-account-image";
import { PROFILE_INFO } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";
import {
  Heart,
  X,
  Trash2,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface TFTFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TFTFavoritesModal: React.FC<TFTFavoritesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [favorites, setFavorites] = useState<DiscoveredProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(getFavorites());

    const handleUpdate = (e: any) => {
      setFavorites(e.detail?.favorites || getFavorites());
    };

    window.addEventListener("tft:favorites_updated", handleUpdate);
    return () => window.removeEventListener("tft:favorites_updated", handleUpdate);
  }, []);

  // Sync when opening
  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavorites());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleRemove = (item: DiscoveredProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item);
  };

  const handleZaloContact = (item: DiscoveredProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.trackClickZalo({
      source: "product_card",
      product_id: item.code || item.id,
      product_type: item.type === "CLONE" ? "CLONE" : "VIP",
    });
    const message = `Chào ShopTFTMobile Tuấn Thái Bình! Tôi muốn thuê tài khoản ${item.code} (${item.title}) từ danh sách acc đã lưu.`;
    const url = `${PROFILE_INFO.zaloUrl}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f11] text-white border-t sm:border border-white/[0.12] w-full sm:max-w-xl md:max-w-2xl rounded-t-[24px] sm:rounded-2xl overflow-hidden relative flex flex-col max-h-[88vh] shadow-2xl animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-98 duration-150 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-[#141416] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                Acc Đã Lưu ({favorites.length})
              </h3>
              <p className="text-[11px] text-zinc-400">
                Lưu trên trình duyệt của bạn (không cần đăng nhập)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 overscroll-contain">
          {favorites.length === 0 ? (
            <div className="text-center py-12 sm:py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-white">
                Chưa có tài khoản nào được lưu
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Bấm vào biểu tượng trái tim ♡ trên bất kỳ thẻ acc nào để lưu lại và so sánh nhanh khi thuê.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all"
                >
                  <span>Duyệt kho acc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-3 group"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/acc/${encodeURIComponent(item.code.replace(/^MS:\s*/i, "").trim() || item.id)}`}
                    onClick={onClose}
                    className="w-16 h-16 rounded-lg bg-[#09090b] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center"
                  >
                    <LazyAccountImage
                      src={item.thumbnail}
                      alt={item.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white">
                        {item.type}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        #{item.code}
                      </span>
                      {item.status === "RENTED" && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-white/5 text-zinc-400 border border-white/10">
                          ĐANG THUÊ
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/acc/${encodeURIComponent(item.code.replace(/^MS:\s*/i, "").trim() || item.id)}`}
                      onClick={onClose}
                      className="text-xs sm:text-sm font-semibold text-white truncate block hover:text-zinc-300 transition-colors"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-heading font-bold text-white text-xs sm:text-sm">
                        {formatVND(item.price)}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {item.priceUnit}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleZaloContact(item, e)}
                      title="Thuê qua Zalo"
                      className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Thuê Zalo</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleRemove(item, e)}
                      title="Bỏ lưu"
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-white/[0.06] hover:border-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        {favorites.length > 0 && (
          <div className="px-4 py-3 sm:px-6 bg-[#121214] border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bàn giao trực tiếp qua Zalo</span>
            </span>
            <Link
              href="/shop"
              onClick={onClose}
              className="text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <span>Xem tiếp kho acc</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
