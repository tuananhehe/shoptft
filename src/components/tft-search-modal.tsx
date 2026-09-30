"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cleanTftImageUrl } from "@/utils/supabase/accounts-service";
import { getAccountProductUrl } from "@/utils/account-lookup";
import {
  Search,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Crown,
  Gamepad2,
  Flame,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  code: string;
  type: "VIP" | "CLONE";
  title: string;
  rank?: string;
  price?: number;
  hourly_price?: number;
  daily_price?: number;
  champions?: string[];
  arenas?: string[];
  features?: string[];
  image_url: string;
  status: "AVAILABLE" | "RENTED";
  description?: string;
}

const POPULAR_KEYWORDS = [
  { label: "Gwen Tí Nị", query: "Gwen" },
  { label: "Yasuo Tí Nị", query: "Yasuo" },
  { label: "Yone Tí Nị", query: "Yone" },
  { label: "Ahri Tí Nị", query: "Ahri" },
  { label: "Tí Nị Hàng Hiệu", query: "Hàng Hiệu" },
  { label: "Sân Đấu Thần Thoại", query: "Sân Đấu" },
  { label: "Kho Clone", query: "Clone" },
];

interface TFTSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const TFTSearchModal: React.FC<TFTSearchModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setInternalOpen(false);
    }
    setSearchTerm("");
    setResults([]);
  };

  // Lắng nghe sự kiện toàn cục tft:open-search và phím tắt Ctrl+K / Cmd+K / Slash
  useEffect(() => {
    const handleOpenEvent = () => {
      setInternalOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Phím tắt Ctrl+K hoặc Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setInternalOpen((prev) => !prev);
        return;
      }

      // Phím tắt "/" khi không focus vào ô input nào khác
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setInternalOpen(true);
        return;
      }

      // Đóng modal khi bấm Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("tft:open-search", handleOpenEvent);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("tft:open-search", handleOpenEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Autofocus input khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  // Debounce gọi API /api/accounts
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/accounts?search=${encodeURIComponent(trimmed)}&type=ALL&limit=8`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResults(json.data);
          setTotalCount(json.total || json.data.length);
          setSelectedIndex(0);
        } else {
          setResults([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.warn("Lỗi tìm kiếm:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const handleSelectAccount = (acc: SearchResultItem) => {
    handleClose();
    const targetUrl = getAccountProductUrl(acc);
    router.push(targetUrl);
  };

  const handleViewAllResults = () => {
    const trimmed = searchTerm.trim();
    handleClose();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("search", trimmed);
    }
    const q = params.toString();
    router.push(q ? `/shop?${q}` : "/shop");
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm tài khoản TFT"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#141414] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Search Box */}
        <div className="relative p-3.5 sm:p-4 border-b border-white/[0.08] bg-[#181818] flex items-center gap-3">
          <div className="text-zinc-400 pl-1">
            {isLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
            ) : (
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Pet, Chibi, Sân đấu, Mã acc (VD: Ahri, MS: 8899)..."
            className="flex-1 bg-transparent text-white placeholder:text-zinc-500 text-sm sm:text-base font-medium focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (results.length > 0 && selectedIndex < results.length) {
                  handleSelectAccount(results[selectedIndex]);
                } else if (searchTerm.trim()) {
                  handleViewAllResults();
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
              }
            }}
          />

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Xóa từ khóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleClose}
            className="px-2.5 py-1 rounded-lg bg-[#1c1c1e] hover:bg-[#252528] text-zinc-300 hover:text-white text-xs font-mono font-medium border border-white/[0.08] transition-colors cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#141414] border-b border-white/[0.08] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono font-medium text-zinc-400 flex items-center gap-1 mr-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            Gợi ý:
          </span>
          {POPULAR_KEYWORDS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setSearchTerm(item.query);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-full bg-[#1c1c1e] hover:bg-[#252528] text-zinc-300 hover:text-white border border-white/[0.08] text-[11px] font-medium whitespace-nowrap transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Body: Result List or Empty State */}
        <div className="overflow-y-auto p-2 sm:p-3 divide-y divide-white/[0.06] flex-1">
          {searchTerm.trim() ? (
            results.length > 0 ? (
              <div className="space-y-1">
                {results.map((acc, idx) => {
                  const isVip = acc.type === "VIP";
                  const isAvailable = acc.status === "AVAILABLE";
                  const priceDisplay = isVip
                    ? `${(Number(acc.hourly_price) || 15000).toLocaleString("vi-VN")}đ`
                    : `${(Number(acc.price) || 79000).toLocaleString("vi-VN")}đ`;
                  const priceUnit = isVip ? "/ Giờ" : "/ Sở Hữu";
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white/10 border border-white/20"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {/* Image & Basic Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-[#090909] border border-white/[0.08] overflow-hidden flex-shrink-0 relative">
                          <img
                            src={cleanTftImageUrl(acc.image_url)}
                            alt={acc.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isVip ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white border border-white/20 uppercase font-mono">
                                VIP
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-zinc-300 border border-white/10 uppercase font-mono">
                                CLONE
                              </span>
                            )}

                            <span className="font-mono text-xs font-bold text-zinc-200">
                              {acc.code}
                            </span>

                            {isAvailable ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                                SẴN SÀNG
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950/40 text-rose-400 border border-rose-800/40">
                                ĐANG THUÊ
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                            {acc.champions?.[0] || acc.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {isVip
                              ? acc.arenas?.[0] || "Sân Đấu Thần Thoại Đổi Nhạc EDM"
                              : acc.features?.[0] || "Acc Clone Sạch Bàn Giao Riot"}
                          </p>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white font-mono">
                            {priceDisplay}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium">
                            {priceUnit}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !isLoading ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#181818] border border-white/[0.08] text-zinc-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Không tìm thấy tài khoản với từ khóa &quot;{searchTerm}&quot;
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Hãy thử tìm kiếm với tên tướng Tí Nị (Ahri, Jinx, Gwen), Sân đấu, hoặc xem toàn bộ kho acc.
                </p>
                <button
                  onClick={handleViewAllResults}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  <span>Xem Toàn Bộ Kho Acc</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null
          ) : (
            <div className="py-8 px-4 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-zinc-400 px-1">
                <span>DANH MỤC NỔI BẬT</span>
                <span className="text-[10px] text-zinc-500">Bàn giao qua Zalo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    handleClose();
                    router.push("/shop?type=vip");
                  }}
                  className="p-3.5 rounded-2xl bg-[#181818] hover:bg-[#1f1f1f] border border-white/[0.08] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/15">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white group-hover:text-zinc-200 transition-colors">
                        Kho Acc VIP Theo Giờ
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Tướng Tí Nị & Sân Đấu EDM
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => {
                    handleClose();
                    router.push("/shop?type=clone");
                  }}
                  className="p-3.5 rounded-2xl bg-[#181818] hover:bg-[#1f1f1f] border border-white/[0.08] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/15">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white group-hover:text-zinc-200 transition-colors">
                        Kho Acc Clone Sở Hữu
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        Bàn giao full thông tin Riot
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info in Modal */}
        {results.length > 0 && (
          <div className="p-3 bg-[#181818] border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
            <span>
              Tìm thấy <strong className="text-white font-mono">{totalCount}</strong> tài khoản
            </span>
            <button
              onClick={handleViewAllResults}
              className="text-zinc-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả trên trang chủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
