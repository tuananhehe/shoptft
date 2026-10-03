"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import {
  CatalogFilterBar,
  FilterState,
} from "@/components/catalog-filter-bar";
import {
  ProductCard,
  ProductCardData,
  ProductCardSkeleton,
  ProductCardEmptyState,
} from "@/components/product-card";
import { TFTRentalAccount, TFTCloneAccount } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";
import { Reveal } from "@/components/reveal";
import { TFTRecentlyViewed } from "@/components/tft-recently-viewed";
import { ChevronRight, RotateCcw, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { SectionErrorBoundary } from "@/components/error-boundary";
import { FilterOptionsData } from "@/utils/shop-inventory-service";

const TFTAccountModal = dynamic(
  () => import("@/components/tft-account-modal").then((m) => m.TFTAccountModal),
  { ssr: false }
);

interface ShopClientViewProps {
  initialItems?: ProductCardData[];
  initialTotal?: number;
  initialHasMore?: boolean;
  initialFilters?: FilterState;
  initialFilterOptions?: FilterOptionsData | null;
  // Legacy props fallback
  initialVip?: TFTRentalAccount[];
  initialClone?: TFTCloneAccount[];
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  type: "ALL",
  pet: "",
  arena: "",
  price: "ALL",
  status: "ALL",
  sort: "NEWEST",
};

export function ShopClientView({
  initialItems = [],
  initialTotal = 0,
  initialHasMore = false,
  initialFilters = DEFAULT_FILTERS,
  initialFilterOptions = null,
}: ShopClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Core Inventory State
  const [items, setItems] = useState<ProductCardData[]>(initialItems);
  const [total, setTotal] = useState<number>(initialTotal);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData | null>(initialFilterOptions);

  // 2. Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [selectedVipAccount, setSelectedVipAccount] = useState<TFTRentalAccount | null>(null);

  // 3. Request Race Safety & Prefetch Caches
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prefetchCacheRef = useRef<
    Map<string, { items: ProductCardData[]; total: number; hasMore: boolean }>
  >(new Map());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewShop = useRef<boolean>(false);

  // Helper tạo cache key duy nhất cho prefetch
  const makePrefetchKey = useCallback((f: FilterState, pageNum: number) => {
    return `${f.search}__${f.type}__${f.pet}__${f.arena}__${f.price}__${f.status}__${f.sort}__p${pageNum}`;
  }, []);

  // Helper build URL query parameters
  const buildApiParams = useCallback((f: FilterState, pageNum: number, limitNum: number = 24) => {
    const p = new URLSearchParams();
    if (f.search.trim()) p.set("search", f.search.trim());
    if (f.type && f.type !== "ALL") p.set("type", f.type.toUpperCase());
    if (f.pet.trim()) p.set("pet", f.pet.trim());
    if (f.arena.trim()) p.set("arena", f.arena.trim());
    if (f.price && f.price !== "ALL") p.set("price", f.price);
    if (f.status && f.status !== "ALL") p.set("status", f.status.toUpperCase());
    if (f.sort) p.set("sort", f.sort.toLowerCase());
    p.set("page", String(pageNum));
    p.set("limit", String(limitNum));
    return p;
  }, []);

  // Helper đồng bộ query params lên URL trình duyệt mà không reload trang
  const updateUrlHistory = useCallback((f: FilterState) => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    if (f.search.trim()) p.set("search", f.search.trim());
    if (f.type && f.type !== "ALL") p.set("type", f.type.toLowerCase());
    if (f.pet.trim()) p.set("pet", f.pet.trim());
    if (f.arena.trim()) p.set("arena", f.arena.trim());
    if (f.price && f.price !== "ALL") p.set("price", f.price);
    if (f.status && f.status !== "ALL") p.set("status", f.status.toLowerCase());
    if (f.sort && f.sort !== "NEWEST") p.set("sort", f.sort.toLowerCase());
    const queryStr = p.toString();
    const newUrl = queryStr ? `/shop?${queryStr}` : "/shop";
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  }, []);

  // Analytics view shop
  useEffect(() => {
    if (!hasTrackedViewShop.current) {
      hasTrackedViewShop.current = true;
      analytics.trackViewShop(initialTotal);
    }
  }, [initialTotal]);

  // Load filter options if missing
  useEffect(() => {
    if (!filterOptions) {
      fetch("/api/accounts/filter-options")
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          if (res?.success && res.data) {
            setFilterOptions(res.data);
          }
        })
        .catch(() => {});
    }
  }, [filterOptions]);

  // Background Prefetch Scheduler (khi browser idle, giới hạn tối đa 1 batch tiếp theo)
  const schedulePrefetch = useCallback(
    (targetPage: number, currentFilters: FilterState) => {
      if (typeof window === "undefined") return;

      // Kiểm tra chế độ tiết kiệm dữ liệu hoặc mạng quá chậm
      const conn = (navigator as any).connection;
      if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") {
        return;
      }

      const key = makePrefetchKey(currentFilters, targetPage);
      if (prefetchCacheRef.current.has(key)) return;

      const runPrefetch = () => {
        const params = buildApiParams(currentFilters, targetPage, 24);
        fetch(`/api/accounts?${params.toString()}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.success && Array.isArray(data.items)) {
              prefetchCacheRef.current.set(key, {
                items: data.items,
                total: data.total,
                hasMore: Boolean(data.hasMore),
              });
            }
          })
          .catch(() => {
            // Silently ignore background prefetch errors
          });
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(runPrefetch, { timeout: 2500 });
      } else {
        setTimeout(runPrefetch, 600);
      }
    },
    [buildApiParams, makePrefetchKey]
  );

  // Kích hoạt prefetch cho page 2 ngay sau khi mount nếu có nhiều hơn 1 trang
  useEffect(() => {
    if (initialHasMore) {
      schedulePrefetch(2, initialFilters);
    }
  }, [initialHasMore, initialFilters, schedulePrefetch]);

  // Thực thi Search & Filter toàn cầu trên Server khi state thay đổi
  const executeFilterChange = useCallback(
    (nextFilters: FilterState) => {
      // 1. Hủy request in-flight cũ
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const curReqId = ++requestIdRef.current;

      // 2. Cập nhật state UI ngay lập tức
      setFilters(nextFilters);
      updateUrlHistory(nextFilters);
      setPage(1);
      setIsLoading(true);
      setLoadMoreError(null);
      prefetchCacheRef.current.clear(); // Xóa stale prefetch cache của filter cũ

      // 3. Gọi server query toàn cục
      const params = buildApiParams(nextFilters, 1, 24);
      fetch(`/api/accounts?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (curReqId !== requestIdRef.current) return; // Bảo đảm request race safety
          const newItems = Array.isArray(data.items) ? data.items : [];
          setItems(newItems);
          setTotal(typeof data.total === "number" ? data.total : newItems.length);
          setHasMore(Boolean(data.hasMore));
          setIsLoading(false);

          // 4. Lên lịch prefetch page 2 cho filter mới nếu còn data
          if (data.hasMore) {
            schedulePrefetch(2, nextFilters);
          }
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          if (curReqId !== requestIdRef.current) return;
          console.warn("Lỗi fetch search/filter:", err);
          setIsLoading(false);
          setLoadMoreError("Không thể tìm kiếm lúc này. Vui lòng thử lại.");
        });
    },
    [buildApiParams, makePrefetchKey, schedulePrefetch, updateUrlHistory]
  );

  // Bộ lắng nghe sự kiện thay đổi filter từ CatalogFilterBar
  const handleFilterChange = useCallback(
    (updates: Partial<FilterState>) => {
      setFilters((prev) => {
        let nextType = updates.type !== undefined ? updates.type : prev.type;
        let nextSort = updates.sort !== undefined ? updates.sort : prev.sort;

        // Business logic: khi chuyển sang VIP mặc định sort price_desc nếu chưa có sort explicit
        if (updates.type === "VIP" && updates.sort === undefined && prev.type !== "VIP") {
          nextSort = "PRICE_DESC";
        } else if (updates.type && updates.type !== "VIP" && updates.sort === undefined && prev.type === "VIP") {
          nextSort = "NEWEST";
        }

        const next = { ...prev, ...updates, type: nextType, sort: nextSort };
        executeFilterChange(next);
        return next;
      });
    },
    [executeFilterChange]
  );

  // Reset toàn bộ bộ lọc
  const handleResetAll = useCallback(() => {
    const resetState: FilterState = {
      search: "",
      type: "ALL",
      pet: "",
      arena: "",
      price: "ALL",
      status: "ALL",
      sort: "NEWEST",
    };
    executeFilterChange(resetState);
  }, [executeFilterChange]);

  // Xem toàn bộ kho (bỏ query & filter)
  const handleShowAll = useCallback(() => {
    handleResetAll();
  }, [handleResetAll]);

  // Infinite Scroll Trigger (Sentinel IntersectionObserver)
  const loadNextBatch = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    const cacheKey = makePrefetchKey(filters, nextPage);
    const prefetched = prefetchCacheRef.current.get(cacheKey);

    // TH 1: Đã có sẵn trong prefetch cache -> Render tức thì!
    if (prefetched && Array.isArray(prefetched.items) && prefetched.items.length > 0) {
      prefetchCacheRef.current.delete(cacheKey);

      setItems((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const novel = prefetched.items.filter((a) => !existingIds.has(a.id));
        return [...prev, ...novel];
      });
      setPage(nextPage);
      setHasMore(prefetched.hasMore);
      if (prefetched.total !== undefined) setTotal(prefetched.total);

      // Tiếp tục prefetch page tiếp theo
      if (prefetched.hasMore) {
        schedulePrefetch(nextPage + 1, filters);
      }
      return;
    }

    // TH 2: Chưa prefetch kịp -> Fetch bình thường
    setIsLoadingMore(true);
    setLoadMoreError(null);
    const params = buildApiParams(filters, nextPage, 24);

    fetch(`/api/accounts?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.items)) {
          setItems((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const novel = data.items.filter((a: any) => !existingIds.has(a.id));
            return [...prev, ...novel];
          });
          setPage(nextPage);
          setHasMore(Boolean(data.hasMore));
          if (typeof data.total === "number") setTotal(data.total);

          // Prefetch batch tiếp theo
          if (data.hasMore) {
            schedulePrefetch(nextPage + 1, filters);
          }
        }
      })
      .catch((err) => {
        console.warn("Lỗi tải trang tiếp theo:", err);
        setLoadMoreError("Không thể tải thêm tài khoản. Nhấn để thử lại.");
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [buildApiParams, filters, hasMore, isLoading, isLoadingMore, makePrefetchKey, page, schedulePrefetch]);

  // Cài đặt IntersectionObserver cho Sentinel (load-ahead 800px)
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          loadNextBatch();
        }
      },
      { rootMargin: "800px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadNextBatch]);

  // Lắng nghe popstate (nút Back/Forward của trình duyệt)
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const urlType = (sp.get("type") || "").toUpperCase();
      const curType: "ALL" | "VIP" | "CLONE" =
        urlType === "VIP" ? "VIP" : urlType === "CLONE" ? "CLONE" : "ALL";

      const s = (sp.get("sort") || "").toLowerCase();
      let curSort: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" = "NEWEST";
      if (s === "price_desc") curSort = "PRICE_DESC";
      else if (s === "price_asc") curSort = "PRICE_ASC";
      else if (s === "newest") curSort = "NEWEST";
      else if (curType === "VIP" && !s) curSort = "PRICE_DESC";

      const st = (sp.get("status") || "").toUpperCase();
      const curStatus: "ALL" | "AVAILABLE" | "RENTED" =
        st === "AVAILABLE" ? "AVAILABLE" : st === "RENTED" ? "RENTED" : "ALL";

      const popFilters: FilterState = {
        search: sp.get("search") || "",
        type: curType,
        pet: sp.get("pet") || "",
        arena: sp.get("arena") || "",
        price: sp.get("price") || "ALL",
        status: curStatus,
        sort: curSort,
      };

      executeFilterChange(popFilters);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [executeFilterChange]);

  // Modal Detail Handlers
  const handleViewDetail = useCallback((item: ProductCardData) => {
    if (item.rawVip) {
      setSelectedVipAccount(item.rawVip);
    } else {
      router.push(`/acc/${item.code}`);
    }
  }, [router]);

  const handleSelectAccount = useCallback((vip: TFTRentalAccount) => {
    setSelectedVipAccount(vip);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <TFTNavbar />

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 sm:pb-16 flex-1">
        {/* Tiêu đề & Breadcrumb */}
        <div className="mb-4 sm:mb-6 space-y-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-300 font-medium">Kho Acc</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
              Kho Acc TFT - ĐTCL
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tìm kiếm kho hàng...
                </span>
              ) : (
                <span>
                  Tìm thấy <strong className="text-white font-semibold">{total.toLocaleString("vi-VN")}</strong> tài khoản phù hợp
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Thanh Bộ Lọc & Tìm Kiếm Toàn Cầu */}
        <div className="mb-6 sticky top-2 z-20">
          <CatalogFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetAll={handleResetAll}
            totalMatching={total}
            filterOptions={filterOptions}
          />
        </div>

        {/* Loading Spinner khi đổi Filter/Search */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Danh Sách Sản Phẩm */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {items.map((acc, index) => (
              <ProductCard
                key={acc.id}
                item={acc}
                priority={index < 8}
                onViewDetail={handleViewDetail}
                onSelectAccount={handleSelectAccount}
              />
            ))}
          </div>
        )}

        {/* Trạng Thái Không Tìm Thấy Sản Phẩm (No-Result) */}
        {!isLoading && items.length === 0 && (
          <div className="my-12 py-12 px-4 rounded-2xl bg-[#121214] border border-white/[0.08] text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Không tìm thấy acc phù hợp</h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Thử tìm với tên tướng khác, bỏ bớt bộ lọc hoặc xem danh sách tất cả acc đang sẵn sàng.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={handleResetAll}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
              <button
                onClick={handleShowAll}
                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-sm"
              >
                Xem toàn bộ kho
              </button>
            </div>
          </div>
        )}

        {/* Sentinel & Infinite Scroll Loader */}
        {hasMore && (
          <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-3">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 py-3 px-5 rounded-full bg-[#141416] border border-white/[0.08] shadow-lg animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang tải thêm tài khoản...</span>
              </div>
            )}
            {loadMoreError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 py-2 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-4 h-4" />
                <span>{loadMoreError}</span>
                <button
                  onClick={loadNextBatch}
                  className="ml-2 underline font-semibold text-rose-300 hover:text-white"
                >
                  Tải lại
                </button>
              </div>
            )}
          </div>
        )}

        {/* Đã xem gần đây */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <TFTRecentlyViewed />
        </div>
      </main>

      {/* Modal chi tiết tài khoản VIP */}
      {selectedVipAccount && (
        <TFTAccountModal
          account={selectedVipAccount}
          onClose={() => setSelectedVipAccount(null)}
        />
      )}

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
