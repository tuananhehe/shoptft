"use client";

import React, { useState, useRef, useEffect } from "react";
import { TFTCloneAccount, TFT_CLONE_ACCOUNTS, PROFILE_INFO } from "@/data/tft-data";
import { getVipAndCloneAccounts, formatRentalExpiry } from "@/utils/supabase/accounts-service";
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
} from "lucide-react";
import toast from "react-hot-toast";

const cloneContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cloneCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
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

export const TFTCloneShop: React.FC = () => {
  // Khởi tạo sẵn danh sách có sẵn để render tức thì 0s, sau đó fetch ngầm từ Supabase
  const [cloneAccounts, setCloneAccounts] = useState<TFTCloneAccount[]>(TFT_CLONE_ACCOUNTS || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClone, setSelectedClone] = useState<TFTCloneAccount | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRankFilter, setSelectedRankFilter] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [selectedSort, setSelectedSort] = useState<"DEFAULT" | "PRICE_ASC" | "PRICE_DESC">("DEFAULT");
  const sliderRef = useRef<HTMLDivElement>(null);

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

  // Mảng tài khoản nhân đôi cho hiệu ứng trượt vô tận mượt mà y hệt Kho VIP
  const loopCloneAccounts =
    cloneAccounts.length > 0 ? [...cloneAccounts, ...cloneAccounts] : [];

  // Lọc & Sắp xếp tài khoản khi mở rộng toàn bộ kho
  const filteredCloneAccounts = cloneAccounts
    .filter((acc) => {
      const isRented = (acc.status || "").toUpperCase() === "RENTED";
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "RENTED" && isRented) ||
        (selectedStatus === "AVAILABLE" && !isRented);

      const query = searchTerm.trim().toLowerCase();
      const titleStr = (acc.title || "").toLowerCase();
      const codeStr = (acc.code || "").toLowerCase();
      const badgeStr = (acc.rankBadge || "").toUpperCase();

      const matchesSearch =
        query === "" ||
        titleStr.includes(query) ||
        codeStr.includes(query) ||
        badgeStr.toLowerCase().includes(query);

      const matchesRank =
        selectedRankFilter === "ALL" ||
        (selectedRankFilter === "UNRANKED" && (badgeStr.includes("UNRANKED") || badgeStr.includes("TRẮNG TT"))) ||
        (selectedRankFilter === "ĐỒNG" && (badgeStr.includes("ĐỒNG") || badgeStr.includes("SẮT") || badgeStr.includes("BẠC"))) ||
        (selectedRankFilter === "VÀNG" && (badgeStr.includes("VÀNG") || badgeStr.includes("BẠCH KIM"))) ||
        (selectedRankFilter === "LỤC BẢO" && (badgeStr.includes("LỤC BẢO") || badgeStr.includes("KIM CƯƠNG")));

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
          <div className="flex gap-5 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[270px] sm:w-[290px] lg:w-[280px] xl:w-[290px] flex-shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-sm animate-pulse space-y-3"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-200" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-8 bg-slate-200 rounded-xl w-1/2" />
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
            className="animate-infinite-loop flex gap-5 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {loopCloneAccounts.map((account, index) => {
              const accPrice = getAccountPrice(account);

              return (
                <div
                  key={`${account.id}-${index}`}
                  className="w-[270px] sm:w-[290px] lg:w-[280px] xl:w-[290px] flex-shrink-0 flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group snap-start"
                >
                  {/* TOP KHUNG ẢNH VUÔNG ASPECT-SQUARE HIỂN THỊ 100% MÀU GỐC */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-3 border border-slate-100 shadow-inner">
                      <img
                        src={account.thumbnail}
                        alt={`Thuê acc clone TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Right: Mã Acc */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                          {account.code}
                        </span>
                      </div>

                      {/* Top Left: Trạng Thái */}
                      <div className="absolute top-3 left-3">
                        {account.status === "AVAILABLE" ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>SẴN SÀNG</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
                            <span>ĐANG THUÊ</span>
                            {account.rentedUntil && formatRentalExpiry(account.rentedUntil)?.shortCountdown && (
                              <span className="text-[9px] font-mono bg-black/30 px-1 rounded">
                                {formatRentalExpiry(account.rentedUntil)?.shortCountdown}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Bottom Left: Huy Hiệu Rank Clone/Unranked */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                          {account.rankBadge}
                        </span>
                      </div>
                    </div>

                    {/* TÊN ĐỊNH DANH ACC */}
                    <div className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                      {account.title}
                    </div>

                    {/* GẠCH ĐẦU DÒNG TÍNH NĂNG NGẮN GỌN */}
                    <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 font-medium">
                      {account.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ĐÁY THẺ: GIÁ THUÊ LÂU DÀI (KÝ HIỆU VÔ CỰC ∞) & 2 NÚT THAO TÁC */}
                  <div className="mt-auto pt-3.5 border-t border-slate-100 space-y-2.5">
                    {/* Giá Thuê với Ký hiệu Vô Cực ∞ */}
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                          {accPrice.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-xs text-slate-500 font-medium"> / </span>
                        <span className="text-lg sm:text-xl text-slate-900 font-black leading-none" title="Sở hữu vô cực">
                          ∞
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                        Full Quyền Sở Hữu
                      </span>
                    </div>

                    {/* Cụm 2 Nút Bấm: Chi Tiết & Thuê Ngay (Tương tự Kho VIP) */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openCloneModal(account)}
                        className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi Tiết</span>
                      </button>

                      <button
                        onClick={() => openCloneModal(account)}
                        className="h-9 px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer font-gaming"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
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

      {/* 4. KHU VỰC MỞ RỘNG TOÀN BỘ KHO ACC CLONE (BỘ LỌC + GRID 4 CỘT) */}
      {showFullCatalog && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-slate-200/80 space-y-8 animate-fadeIn">
          {/* KHUNG CAM KẾT ACC CLONE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Bàn Giao Tự Động 30s</p>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Nhận ngay Riot ID & Mật Khẩu qua Zalo trong 30 giây sau khi quét QR.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Trắng Thông Tin 100%</p>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Tự do đổi mật khẩu & mail cá nhân, toàn quyền sở hữu trọn đời.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 uppercase text-[11px]">MMR Sạch Chuẩn</p>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Không lo dính hình phạt afk/tool, cộng nhiều ĐNG khi thắng trận.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 uppercase text-[11px]">Bảo Hành Vĩnh Viễn</p>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Đổi acc tương đương ngay lập tức nếu có bất kỳ trục trặc nào.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BỘ LỌC & TÌM KIẾM ACC CLONE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-center">
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
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="AVAILABLE">🟢 Sẵn Sàng (Chưa Thuê)</option>
                  <option value="RENTED">🔴 Đang Cho Thuê</option>
                </select>
              </div>

              {/* Sắp Xếp Giá */}
              <div>
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
                  placeholder="Nhập mã số (CLONE-01), rank, hoặc từ khóa..."
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* GRID 4 CỘT HIỂN THỊ TOÀN BỘ ACC CLONE ĐƯỢC LỌC */}
          {filteredCloneAccounts.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
              <p className="text-sm font-semibold text-slate-600">
                Không tìm thấy tài khoản clone nào phù hợp với bộ lọc.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRankFilter("ALL");
                  setSelectedStatus("ALL");
                  setSelectedSort("DEFAULT");
                }}
                className="mt-3 px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <motion.div
              variants={cloneContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {filteredCloneAccounts.map((account) => {
                const accPrice = getAccountPrice(account);

                return (
                  <motion.div
                    key={account.id}
                    variants={cloneCardVariants}
                    className="flex flex-col h-full justify-between bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
                  >
                    {/* Top Photo & Badges */}
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-3 border border-slate-100 shadow-inner">
                        <img
                          src={account.thumbnail}
                          alt={`Thuê acc clone TFT ${account.code} ${account.title} - Tuấn Thái Bình`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Right: Mã Acc */}
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-bold text-white shadow-sm backdrop-blur-sm">
                            {account.code}
                          </span>
                        </div>

                        {/* Top Left: Trạng Thái */}
                        <div className="absolute top-3 left-3">
                          {account.status === "AVAILABLE" ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>SẴN SÀNG</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center gap-1">
                              <span>ĐANG THUÊ</span>
                              {account.rentedUntil && formatRentalExpiry(account.rentedUntil)?.shortCountdown && (
                                <span className="text-[9px] font-mono bg-black/30 px-1 rounded">
                                  {formatRentalExpiry(account.rentedUntil)?.shortCountdown}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Bottom Left: Huy Hiệu Rank */}
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                            {account.rankBadge}
                          </span>
                        </div>
                      </div>

                      {/* Tên định danh */}
                      <div className="text-slate-900 font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-orange-700 transition-colors">
                        {account.title}
                      </div>

                      {/* Danh sách tính năng */}
                      <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 font-medium">
                        {account.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Đáy Thẻ: Giá tiền và 2 Nút Bấm */}
                    <div className="mt-auto pt-3.5 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-bold text-red-600 font-mono">
                            {accPrice.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-xs text-slate-500 font-medium"> / </span>
                          <span className="text-lg sm:text-xl text-slate-900 font-black leading-none" title="Sở hữu vô cực">
                            ∞
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                          Full Quyền Sở Hữu
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openCloneModal(account)}
                          className="h-9 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết</span>
                        </button>

                        <button
                          onClick={() => openCloneModal(account)}
                          className="h-9 px-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-700/20 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer font-gaming"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Thuê Ngay</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* NÚT THU GỌN Ở ĐÁY GRID */}
          <div className="text-center pt-4">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 max-w-2xl w-full my-6 sm:my-8 rounded-3xl overflow-hidden relative animate-fadeIn flex flex-col max-h-[92vh] shadow-2xl">
            {/* Top Accent Line */}
            <div className="h-1 bg-gradient-to-r from-sky-500 via-orange-500 to-amber-500 w-full flex-shrink-0" />

            {/* Header Bar */}
            <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 border border-sky-200 text-sky-800 font-mono font-bold text-xs">
                    {selectedClone.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase bg-slate-200 text-slate-800">
                    {selectedClone.rankBadge}
                  </span>
                  {(selectedClone.status || "").toUpperCase() !== "RENTED" ? (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>SẴN SÀNG BÀN GIAO</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1.5 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      <span>ĐANG CÓ KHÁCH THUÊ</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1.5">
                  {selectedClone.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedClone(null)}
                aria-label="Đóng modal"
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal Chi Tiết */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-900 flex-1">
              {/* Main Account Image - Khung Vuông Chuẩn 1:1 Hiển Thị 100% Màu Gốc Sáng Rõ */}
              <div className="relative aspect-square max-w-[320px] sm:max-w-[380px] mx-auto w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                <img
                  src={selectedClone.thumbnail}
                  alt={`Thuê acc clone TFT ${selectedClone.code} - ${selectedClone.title} - Tuấn Thái Bình`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Key Specs Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Bậc Rank</span>
                  <span className="text-sm sm:text-base font-black text-sky-700 font-mono mt-0.5 block">{selectedClone.rankBadge}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Thời Hạn Thuê</span>
                  <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">Vô Cực (∞)</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Hình Thức</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600 mt-0.5 block">Bàn Giao Full</span>
                </div>
              </div>

              {/* Danh sách đặc điểm nổi bật */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Đặc Điểm & Tính Năng Tài Khoản:</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {selectedClone.features.map((feat, idx) => (
                    <li key={idx} className="bg-slate-50/90 p-3 rounded-xl flex items-center gap-2.5 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TRƯỜNG HỢP ACC ĐANG ĐƯỢC THUÊ */}
              {(selectedClone.status || "").toUpperCase() === "RENTED" ? (
                <div className="bg-rose-50/80 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-sm border border-rose-200/80">
                  <div className="flex items-center justify-center gap-2 text-rose-800 font-extrabold text-sm sm:text-base">
                    <Lock className="w-5 h-5 text-rose-600 animate-pulse" />
                    <span>TÀI KHOẢN ĐANG ĐƯỢC THUÊ</span>
                  </div>

                  {(() => {
                    const info = formatRentalExpiry(selectedClone.rentedUntil);
                    if (!info) return null;
                    const pad = (n: number) => n.toString().padStart(2, "0");

                    return (
                      <div className="space-y-3">
                        {info.isInfinite ? (
                          <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-black text-rose-700 bg-white border border-rose-200/90 py-3 px-5 rounded-2xl shadow-inner font-mono">
                            <span>∞ Đang Cho Thuê Dài Hạn (Vô Cực)</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 font-mono">
                            {info.days > 0 && (
                              <>
                                <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                                  <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(info.days)}</span>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Ngày</span>
                                </div>
                                <span className="text-xl sm:text-2xl font-black text-rose-400">:</span>
                              </>
                            )}
                            <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                              <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(info.hours)}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Giờ</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-black text-rose-400">:</span>
                            <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                              <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(info.minutes)}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Phút</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-black text-rose-400">:</span>
                            <div className="bg-white border border-rose-200/90 px-2.5 sm:px-3 py-2 rounded-2xl shadow-inner text-center min-w-[55px] sm:min-w-[65px]">
                              <span className="text-xl sm:text-2xl font-black text-rose-600 block leading-none">{pad(info.seconds)}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Giây</span>
                            </div>
                          </div>
                        )}

                        {/* Hiển thị hạn trả cụ thể */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-rose-600" />
                          <span>
                            {info.isInfinite
                              ? "Thời hạn: Thuê Vô Cực (Không giới hạn)"
                              : `Hạn trả dự kiến: ${info.expiryFormatted}`}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Dự kiến bàn giao cho lượt thuê tiếp theo sau khi hết thời gian đếm ngược. Bạn có thể đặt lịch trước qua Zalo để shop ưu tiên giao acc khi trống!
                  </p>
                </div>
              ) : (
                <>
                  {/* Thẻ Quyền Lợi Bàn Giao Toàn Quyền */}
                  <div className="bg-blue-50/60 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-bold text-blue-900">
                      <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Quyền Lợi Khách Hàng:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100 text-slate-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Nắm Giữ Thông Tin An Toàn</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100 text-slate-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Sở Hữu Lâu Dài Chính Chủ</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100 text-slate-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Bảo Hành Đầy Đủ Theo Chính Sách Shop</span>
                      </div>
                    </div>
                  </div>

                  {/* KHỐI TỔNG THANH TOÁN (FOCAL POINT NỔI BẬT) */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 border-2 border-orange-500/30 rounded-3xl space-y-4 shadow-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">
                          TỔNG THANH TOÁN SỞ HỮU:
                        </span>
                        <span className="text-sm sm:text-base text-slate-900 font-extrabold mt-0.5 block">
                          Thuê Lâu Dài (Sở Hữu Vô Cực ∞)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono tracking-tight block">
                            {getAccountPrice(selectedClone).toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-lg text-slate-700 font-black"> / ∞</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                          ✓ Bàn giao full thông tin cho khách
                        </span>
                      </div>
                    </div>

                    {/* Mã định danh tài khoản */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                      <span>Mã định danh tài khoản:</span>
                      <button
                        type="button"
                        onClick={() => copyAccCode(selectedClone.code)}
                        className="text-slate-800 hover:text-orange-700 font-mono font-bold flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copiedCode ? "Đã copy" : selectedClone.code}</span>
                      </button>
                    </div>
                  </div>

                  {/* CHECKBOX CAM KẾT */}
                  <label className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-orange-50/50 hover:bg-orange-50/80 border border-orange-200/70 cursor-pointer text-sm select-none transition-colors shadow-xs">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-orange-600 rounded-lg border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600 flex-shrink-0"
                    />
                    <span className="text-slate-700 font-medium leading-relaxed">
                      Tôi đã đọc và đồng ý với chính sách bàn giao full quyền sở hữu tài khoản và bảo hành trọn gói của Shop Tuấn Thái Bình.
                    </span>
                  </label>

                  {/* QUY TRÌNH NHẬN ACC */}
                  <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl text-sm space-y-1.5">
                    <div className="font-bold flex items-center gap-2 text-slate-800">
                      <Info className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span>Quy trình nhận tài khoản:</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      Sau khi tích cam kết, bấm nút &ldquo;Nhận Acc Full Quyền Qua Zalo&rdquo;. Hệ thống sẽ tự sao chép cú pháp để bạn dán (Ctrl+V) vào Zalo, shop sẽ gửi STK và bàn giao Riot ID & Mật Khẩu siêu tốc trong 30 giây!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Quỹ bảo hiểm 30.000.000đ Checkscam.vn bảo chứng</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedClone(null)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors w-1/2 sm:w-auto shadow-xs cursor-pointer"
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
                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-700 hover:bg-rose-800 text-white shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 w-1/2 sm:w-auto cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Đặt Lịch Thuê Sớm</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOrderZalo(selectedClone)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-1/2 sm:w-auto cursor-pointer ${
                      isAgreed
                        ? "bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white shadow-md hover:scale-105 shadow-orange-700/20"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-500 border border-slate-300 shadow-xs"
                    }`}
                  >
                    {!isAgreed && <Lock className="w-3.5 h-3.5" />}
                    {isAgreed && <MessageCircle className="w-4 h-4" />}
                    <span>Nhận Acc Full Quyền</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
