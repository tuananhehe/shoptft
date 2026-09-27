"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Sparkles,
  Tag,
  Activity,
  ArrowUpDown,
  Check,
} from "lucide-react";

export interface FilterState {
  search: string;
  type: "ALL" | "VIP" | "CLONE";
  pet: string;
  arena: string;
  price: string;
  status: "ALL" | "AVAILABLE" | "RENTED";
  sort: "NEWEST" | "PRICE_ASC" | "PRICE_DESC";
}

interface FilterOptionsData {
  baseGroups: { name: string; count: number }[];
  specificPets: { name: string; count: number }[];
  arenas: { name: string; count: number }[];
  stats: { total: number; vip: number; clone: number; available: number; rented: number };
}

interface CatalogFilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetAll: () => void;
  totalMatching: number;
  filterOptions?: FilterOptionsData | null;
  initialFocus?: string | null;
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetAll,
  totalMatching,
  filterOptions,
  initialFocus,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(initialFocus || null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Debounced search input
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  const [petSearch, setPetSearch] = useState("");
  const [arenaSearch, setArenaSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý focus query param (?focus=pet | ?focus=arena)
  useEffect(() => {
    if (initialFocus === "pet" || initialFocus === "arena") {
      setOpenDropdown(initialFocus);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsMobileDrawerOpen(true);
      }
    }
  }, [initialFocus]);

  // Đếm các bộ lọc thực sự kích hoạt (KHÔNG tính sort)
  const meaningfulFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== "ALL") count++;
    if (filters.pet) count++;
    if (filters.arena) count++;
    if (filters.price && filters.price !== "ALL") count++;
    if (filters.status !== "ALL") count++;
    return count;
  }, [filters.type, filters.pet, filters.arena, filters.price, filters.status]);

  const hasActiveFiltersOrSearch = useMemo(() => {
    return !!(
      filters.search ||
      filters.type !== "ALL" ||
      filters.pet ||
      filters.arena ||
      (filters.price && filters.price !== "ALL") ||
      filters.status !== "ALL"
    );
  }, [filters]);

  const filteredPets = useMemo(() => {
    const term = petSearch.toLowerCase().trim();
    const baseGroups = filterOptions?.baseGroups || [];
    const specific = filterOptions?.specificPets || [];

    if (!term) {
      return {
        base: baseGroups.slice(0, 14),
        specific: specific.slice(0, 20),
      };
    }
    return {
      base: baseGroups.filter((g) => g.name.toLowerCase().includes(term)),
      specific: specific.filter((p) => p.name.toLowerCase().includes(term)),
    };
  }, [petSearch, filterOptions]);

  const filteredArenas = useMemo(() => {
    const term = arenaSearch.toLowerCase().trim();
    const arenas = filterOptions?.arenas || [];
    if (!term) return arenas.slice(0, 20);
    return arenas.filter((a) => a.name.toLowerCase().includes(term));
  }, [arenaSearch, filterOptions]);

  const pricePresets = useMemo(() => {
    if (filters.type === "VIP") {
      return [
        { id: "ALL", label: "Tất cả mức giá" },
        { id: "under_15k", label: "Dưới 15.000đ / Giờ" },
        { id: "15k_25k", label: "15.000đ – 25.000đ / Giờ" },
        { id: "over_25k", label: "Trên 25.000đ / Giờ" },
      ];
    }
    if (filters.type === "CLONE") {
      return [
        { id: "ALL", label: "Tất cả mức giá" },
        { id: "under_100k", label: "Dưới 100.000đ" },
        { id: "100k_200k", label: "100.000đ – 200.000đ" },
        { id: "200k_500k", label: "200.000đ – 500.000đ" },
        { id: "over_500k", label: "Trên 500.000đ" },
      ];
    }
    return [
      { id: "ALL", label: "Tất cả mức giá" },
      { id: "under_15k", label: "Tiết kiệm (VIP ≤ 15k/h · Clone ≤ 100k)" },
      { id: "15k_25k", label: "Phổ thông (VIP 15k–25k/h · Clone 100k–200k)" },
      { id: "over_25k", label: "Cao cấp (VIP > 25k/h · Clone > 200k)" },
    ];
  }, [filters.type]);

  const getPriceLabel = (id: string) => {
    const found = pricePresets.find((p) => p.id === id);
    return found ? found.label : id;
  };

  return (
    <div className="w-full space-y-2 mb-4 lg:sticky lg:top-[80px] z-30 transition-all" ref={dropdownRef}>
      {/* ============================================================ */}
      {/* 1. THANH LỌC CHÍNH (DESKTOP >= 1024PX & MOBILE COMPACT)     */}
      {/* ============================================================ */}
      <div className="bg-[#141414]/95 backdrop-blur-md border border-white/[0.08] shadow-lg rounded-2xl p-2.5 sm:p-3 text-white">
        {/* Hàng điều khiển Desktop */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {/* Ô tìm kiếm nhanh (35-40% bề ngang) */}
          <div className="relative flex-[1.4] min-w-[220px] max-w-[360px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, Pet, mã số, Sân Đấu..."
              className="w-full pl-9 pr-8 py-2 bg-[#181818] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  onFilterChange({ search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 1. Dropdown Loại Acc */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                filters.type !== "ALL"
                  ? "bg-white text-black font-semibold border-white"
                  : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <span>
                {filters.type === "VIP" ? "Kho VIP" : filters.type === "CLONE" ? "Kho Clone" : "Loại Acc"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {openDropdown === "type" && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#141414] border border-white/[0.08] rounded-xl shadow-xl z-40 py-1 text-xs">
                {[
                  { id: "ALL", label: `Tất cả (${filterOptions?.stats.total || 0})` },
                  { id: "VIP", label: `Kho VIP (${filterOptions?.stats.vip || 0})` },
                  { id: "CLONE", label: `Kho Clone (${filterOptions?.stats.clone || 0})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onFilterChange({ type: item.id as any });
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      filters.type === item.id ? "text-white font-semibold bg-white/10" : "text-zinc-300"
                    }`}
                  >
                    <span>{item.label}</span>
                    {filters.type === item.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Dropdown Pet / Chibi */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "pet" ? null : "pet")}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                filters.pet
                  ? "bg-white text-black font-semibold border-white"
                  : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span className="max-w-[110px] truncate">{filters.pet ? filters.pet : "Pet / Chibi"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {openDropdown === "pet" && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#141414] border border-white/[0.08] rounded-xl shadow-2xl z-40 p-2.5 text-xs">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={petSearch}
                    onChange={(e) => setPetSearch(e.target.value)}
                    placeholder="Tìm nhanh tướng (Ahri, Gwen, Yasuo...)"
                    className="w-full pl-8 pr-3 py-1.5 bg-[#181818] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({ pet: "" });
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      !filters.pet ? "text-white font-semibold bg-white/10" : "text-zinc-400"
                    }`}
                  >
                    <span>Tất cả Pet / Chibi</span>
                    {!filters.pet && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <div className="pt-1 border-t border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 font-semibold px-2 uppercase tracking-wider block mb-1">
                      Nhóm Tướng Nổi Bật
                    </span>
                    <div className="flex flex-wrap gap-1 p-1">
                      {filteredPets.base.map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => {
                            onFilterChange({ pet: filters.pet === g.name ? "" : g.name });
                            setOpenDropdown(null);
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            filters.pet === g.name
                              ? "bg-white text-black font-semibold"
                              : "bg-[#181818] text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {g.name} ({g.count})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Dropdown Sân Đấu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "arena" ? null : "arena")}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                filters.arena
                  ? "bg-white text-black font-semibold border-white"
                  : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <span className="max-w-[110px] truncate">{filters.arena ? filters.arena : "Sân Đấu"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {openDropdown === "arena" && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#141414] border border-white/[0.08] rounded-xl shadow-2xl z-40 p-2.5 text-xs">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={arenaSearch}
                    onChange={(e) => setArenaSearch(e.target.value)}
                    placeholder="Tìm tên sân đấu..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#181818] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({ arena: "" });
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      !filters.arena ? "text-white font-semibold bg-white/10" : "text-zinc-400"
                    }`}
                  >
                    <span>Tất cả Sân Đấu</span>
                    {!filters.arena && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {filteredArenas.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => {
                        onFilterChange({ arena: a.name });
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                        filters.arena === a.name ? "text-white font-semibold bg-white/10" : "text-zinc-300"
                      }`}
                    >
                      <span className="truncate pr-2">{a.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({a.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Dropdown Khoảng Giá */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                filters.price && filters.price !== "ALL"
                  ? "bg-white text-black font-semibold border-white"
                  : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>{filters.price && filters.price !== "ALL" ? getPriceLabel(filters.price) : "Khoảng Giá"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {openDropdown === "price" && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#141414] border border-white/[0.08] rounded-xl shadow-2xl z-40 py-1 text-xs">
                {pricePresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onFilterChange({ price: p.id });
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      filters.price === p.id || (!filters.price && p.id === "ALL")
                        ? "text-white font-semibold bg-white/10"
                        : "text-zinc-300"
                    }`}
                  >
                    <span>{p.label}</span>
                    {(filters.price === p.id || (!filters.price && p.id === "ALL")) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Dropdown Trạng Thái */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                filters.status !== "ALL"
                  ? "bg-white text-black font-semibold border-white"
                  : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                {filters.status === "AVAILABLE" ? "Còn acc" : filters.status === "RENTED" ? "Đang thuê" : "Trạng Thái"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {openDropdown === "status" && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#141414] border border-white/[0.08] rounded-xl shadow-xl z-40 py-1 text-xs">
                {[
                  { id: "ALL", label: "Tất cả trạng thái" },
                  { id: "AVAILABLE", label: "Còn acc (Sẵn sàng)", dot: "bg-emerald-400" },
                  { id: "RENTED", label: "Đang thuê", dot: "bg-zinc-500" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onFilterChange({ status: s.id as any });
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      filters.status === s.id ? "text-white font-semibold bg-white/10" : "text-zinc-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
                      <span>{s.label}</span>
                    </span>
                    {filters.status === s.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Dropdown Sắp Xếp */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                (filters.type === "VIP" ? filters.sort !== "PRICE_DESC" : filters.sort !== "NEWEST")
                  ? "bg-white text-black font-semibold border-white"
                  : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                {filters.sort === "PRICE_ASC"
                  ? "Giá thấp → cao"
                  : filters.sort === "PRICE_DESC"
                  ? "Giá cao → thấp"
                  : "Mới nhất"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {openDropdown === "sort" && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#141414] border border-white/[0.08] rounded-xl shadow-xl z-40 py-1 text-xs">
                {[
                  { id: "NEWEST", label: "Mới nhất" },
                  { id: "PRICE_ASC", label: "Giá thấp → cao" },
                  { id: "PRICE_DESC", label: "Giá cao → thấp" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onFilterChange({ sort: st.id as any });
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer ${
                      filters.sort === st.id ? "text-white font-semibold bg-white/10" : "text-zinc-300"
                    }`}
                  >
                    <span>{st.label}</span>
                    {filters.sort === st.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE COMPACT HEADER BAR (< 1024PX)                          */}
        {/* ============================================================ */}
        <div className="lg:hidden space-y-2">
          {/* Ô tìm kiếm nhanh trên Mobile */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, Pet, mã số, Sân Đấu..."
              className="w-full pl-9 pr-8 py-2 bg-[#181818] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  onFilterChange({ search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hàng nút: [ Bộ lọc (count) ] [ Sắp xếp ] */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                meaningfulFilterCount > 0
                  ? "bg-white text-black border-white"
                  : "bg-[#181818] text-zinc-200 border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                Bộ lọc{meaningfulFilterCount > 0 ? ` (${meaningfulFilterCount})` : ""}
              </span>
            </button>

            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => onFilterChange({ sort: e.target.value as any })}
                aria-label="Sắp xếp sản phẩm"
                className="w-full py-2 px-3 bg-[#181818] border border-white/[0.08] rounded-xl text-xs font-semibold text-zinc-200 focus:outline-none focus:border-white/30 cursor-pointer appearance-none text-center"
              >
                <option value="NEWEST">Mới nhất</option>
                <option value="PRICE_ASC">Giá thấp → cao</option>
                <option value="PRICE_DESC">Giá cao → thấp</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DÒNG THỐNG KÊ KẾT QUẢ & ACTIVE FILTER CHIPS               */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5 px-0.5">
        <div className="text-zinc-400 font-normal">
          Tìm thấy <strong className="text-white font-semibold font-mono">{totalMatching}</strong> acc phù hợp
        </div>

        {hasActiveFiltersOrSearch && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] text-white text-[11px] font-medium border border-white/10">
                <span>&quot;{filters.search}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    onFilterChange({ search: "" });
                  }}
                  className="hover:text-zinc-300 cursor-pointer"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.type !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] text-white text-[11px] font-medium border border-white/10">
                <span>{filters.type === "VIP" ? "VIP" : "Clone"}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ type: "ALL" })}
                  className="hover:text-zinc-300 cursor-pointer"
                  aria-label="Bỏ lọc loại acc"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.pet && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] text-white text-[11px] font-medium border border-white/10">
                <span>Pet: {filters.pet}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ pet: "" })}
                  className="hover:text-zinc-300 cursor-pointer"
                  aria-label="Bỏ lọc pet"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.arena && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] text-white text-[11px] font-medium border border-white/10">
                <span>Sân: {filters.arena}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ arena: "" })}
                  className="hover:text-zinc-300 cursor-pointer"
                  aria-label="Bỏ lọc sân đấu"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.price && filters.price !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] text-white text-[11px] font-medium border border-white/10">
                <span>{getPriceLabel(filters.price)}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ price: "ALL" })}
                  className="hover:text-zinc-300 cursor-pointer"
                  aria-label="Bỏ lọc khoảng giá"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.status !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] text-white text-[11px] font-medium border border-white/10">
                <span>{filters.status === "AVAILABLE" ? "Còn acc" : "Đang thuê"}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ status: "ALL" })}
                  className="hover:text-zinc-300 cursor-pointer"
                  aria-label="Bỏ lọc trạng thái"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                onResetAll();
              }}
              className="text-xs font-medium text-zinc-400 hover:text-white underline ml-1 cursor-pointer flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE FILTER DRAWER (BOTTOM SHEET TRƯỢT LÊN)              */}
      {/* ============================================================ */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-[#141414] text-white border-t border-white/[0.08] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl z-10">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
                <h3 className="text-base font-semibold text-white">Bộ Lọc Sản Phẩm</h3>
                {meaningfulFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white text-black font-bold text-xs">
                    {meaningfulFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-5 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium uppercase tracking-wider mb-2">
                  Loại Kho Tài Khoản
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ALL", label: "Tất Cả" },
                    { id: "VIP", label: "Kho VIP" },
                    { id: "CLONE", label: "Kho Clone" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onFilterChange({ type: t.id as any })}
                      className={`py-2 px-2 rounded-xl font-medium transition-all text-center cursor-pointer border ${
                        filters.type === t.id
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium uppercase tracking-wider mb-2">
                  Trạng Thái Thuê
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ALL", label: "Tất Cả" },
                    { id: "AVAILABLE", label: "Còn Acc", dot: "bg-emerald-400" },
                    { id: "RENTED", label: "Đang Thuê", dot: "bg-zinc-500" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onFilterChange({ status: s.id as any })}
                      className={`py-2 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer border ${
                        filters.status === s.id
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
                      }`}
                    >
                      {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium uppercase tracking-wider mb-2">
                  Khoảng Giá
                </label>
                <div className="space-y-1.5">
                  {pricePresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onFilterChange({ price: p.id })}
                      className={`w-full py-2 px-3 rounded-xl font-medium text-left flex items-center justify-between transition-colors cursor-pointer border ${
                        filters.price === p.id || (!filters.price && p.id === "ALL")
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-[#181818] text-zinc-300 border-white/[0.08] hover:border-white/[0.18]"
                      }`}
                    >
                      <span>{p.label}</span>
                      {(filters.price === p.id || (!filters.price && p.id === "ALL")) && (
                        <Check className="w-3.5 h-3.5 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-zinc-400 font-medium uppercase tracking-wider">
                    Linh Thú / Chibi ({filterOptions?.baseGroups.length || 0})
                  </label>
                  {filters.pet && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ pet: "" })}
                      className="text-white text-[11px] font-medium hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-[#181818] rounded-xl border border-white/[0.08]">
                  {filterOptions?.baseGroups.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => onFilterChange({ pet: filters.pet === b.name ? "" : b.name })}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        filters.pet === b.name
                          ? "bg-white text-black font-semibold"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      {b.name} <span className="text-[10px] opacity-75">({b.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-zinc-400 font-medium uppercase tracking-wider">
                    Sân Đấu ({filterOptions?.arenas.length || 0})
                  </label>
                  {filters.arena && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ arena: "" })}
                      className="text-white text-[11px] font-medium hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#181818] rounded-xl border border-white/[0.08]">
                  {filterOptions?.arenas.slice(0, 16).map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => onFilterChange({ arena: filters.arena === a.name ? "" : a.name })}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        filters.arena === a.name
                          ? "bg-white text-black font-semibold"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      {a.name} <span className="text-[10px] opacity-75">({a.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-3 bg-[#0C0C0D] border-t border-white/[0.08] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setSearchInput("");
                }}
                className="py-2.5 px-3 rounded-xl border border-white/15 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-[#090909] font-semibold text-xs tracking-wide transition-colors text-center cursor-pointer shadow-sm"
              >
                Xem {totalMatching} kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
