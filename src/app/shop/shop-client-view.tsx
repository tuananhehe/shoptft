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
  normalizeVipAccount,
  normalizeCloneAccount,
} from "@/components/product-card";
import {
  getVipAndCloneAccounts,
  mapRowToVipAccount,
  mapRowToCloneAccount,
} from "@/utils/supabase/accounts-service";

const TFTAccountModal = dynamic(
  () => import("@/components/tft-account-modal").then((m) => m.TFTAccountModal),
  { ssr: false }
);
import { TFTRentalAccount, TFTCloneAccount } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";
import { Reveal } from "@/components/reveal";
import { TFTRecentlyViewed } from "@/components/tft-recently-viewed";
import { ChevronRight, RotateCcw, AlertCircle } from "lucide-react";
import { SectionErrorBoundary } from "@/components/error-boundary";
import {
  calculateSearchRelevance,
  getSmartSearchSuggestions,
  normalizeSearchQuery,
} from "@/utils/search-discovery";

function removeAccents(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface ShopClientViewProps {
  initialVip?: TFTRentalAccount[];
  initialClone?: TFTCloneAccount[];
}

export function ShopClientView({ initialVip = [], initialClone = [] }: ShopClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vipRaw, setVipRaw] = useState<TFTRentalAccount[]>(initialVip);
  const [cloneRaw, setCloneRaw] = useState<TFTCloneAccount[]>(initialClone);
  const [isLoading, setIsLoading] = useState(initialVip.length === 0 && initialClone.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVipAccount, setSelectedVipAccount] = useState<TFTRentalAccount | null>(null);

  // Progressive Scroll Loading State (Batch 12 items)
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreServer, setHasMoreServer] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Parse initial filters from URL
  const initialType = (searchParams.get("type") || "").toUpperCase();
  const validType: "ALL" | "VIP" | "CLONE" =
    initialType === "VIP" ? "VIP" : initialType === "CLONE" ? "CLONE" : "ALL";

  const rawSort = (searchParams.get("sort") || "").toLowerCase();
  let validSort: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" = "NEWEST";
  if (rawSort === "price_desc") validSort = "PRICE_DESC";
  else if (rawSort === "price_asc") validSort = "PRICE_ASC";
  else if (rawSort === "newest") validSort = "NEWEST";
  else if (validType === "VIP" && !rawSort) validSort = "PRICE_DESC";

  const rawStatus = (searchParams.get("status") || "").toUpperCase();
  const validStatus: "ALL" | "AVAILABLE" | "RENTED" =
    rawStatus === "AVAILABLE" ? "AVAILABLE" : rawStatus === "RENTED" ? "RENTED" : "ALL";

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    type: validType,
    pet: searchParams.get("pet") || "",
    arena: searchParams.get("arena") || "",
    price: searchParams.get("price") || "ALL",
    status: validStatus,
    sort: validSort,
  });

  const focusParam = searchParams.get("focus");
  const hasTrackedViewShop = useRef(false);

  useEffect(() => {
    if (!hasTrackedViewShop.current) {
      hasTrackedViewShop.current = true;
      const initialTotal = (initialVip?.length || 0) + (initialClone?.length || 0);
      analytics.trackViewShop(initialTotal);
    }
  }, [initialVip?.length, initialClone?.length]);

  // Load remaining/fresh Accounts from database only if SSR dataset was empty
  const loadData = useCallback(async () => {
    if (vipRaw.length > 0 || cloneRaw.length > 0) {
      setIsLoading(false);
      return;
    }
    try {
      setLoadError(null);
      setIsLoading(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const { vipAccounts, cloneAccounts, error } = await getVipAndCloneAccounts();
      if (error && (!vipAccounts || vipAccounts.length === 0) && (!cloneAccounts || cloneAccounts.length === 0)) {
        if (vipRaw.length === 0 && cloneRaw.length === 0) {
          setLoadError(error);
        }
      } else {
        if (vipAccounts && vipAccounts.length > 0) {
          setVipRaw(vipAccounts);
        }
        if (cloneAccounts && cloneAccounts.length > 0) {
          setCloneRaw(cloneAccounts);
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError" && vipRaw.length === 0 && cloneRaw.length === 0) {
        setLoadError("Không tải được dữ liệu. Thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [vipRaw.length, cloneRaw.length]);

  useEffect(() => {
    if (vipRaw.length === 0 && cloneRaw.length === 0) {
      loadData();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadData, vipRaw.length, cloneRaw.length]);

  // Sync state when URL searchParams change
  const searchParamVal = searchParams.get("search") || "";
  const typeParamVal = searchParams.get("type") || "";
  const petParamVal = searchParams.get("pet") || "";
  const arenaParamVal = searchParams.get("arena") || "";
  const priceParamVal = searchParams.get("price") || "";
  const statusParamVal = searchParams.get("status") || "";
  const sortParamVal = searchParams.get("sort") || "";

  useEffect(() => {
    const urlType = typeParamVal.toUpperCase();
    const curType: "ALL" | "VIP" | "CLONE" =
      urlType === "VIP" ? "VIP" : urlType === "CLONE" ? "CLONE" : "ALL";

    const s = sortParamVal.toLowerCase();
    let curSort: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" = "NEWEST";
    if (s === "price_desc") curSort = "PRICE_DESC";
    else if (s === "price_asc") curSort = "PRICE_ASC";
    else if (s === "newest") curSort = "NEWEST";
    else if (curType === "VIP" && !s) curSort = "PRICE_DESC";

    const st = statusParamVal.toUpperCase();
    const curStatus: "ALL" | "AVAILABLE" | "RENTED" =
      st === "AVAILABLE" ? "AVAILABLE" : st === "RENTED" ? "RENTED" : "ALL";

    setFilters((prev) => ({
      ...prev,
      search: searchParamVal,
      type: curType,
      pet: petParamVal,
      arena: arenaParamVal,
      price: priceParamVal || "ALL",
      status: curStatus,
      sort: curSort,
    }));
  }, [searchParamVal, typeParamVal, petParamVal, arenaParamVal, priceParamVal, statusParamVal, sortParamVal]);

  // Handle browser Back / Forward (popstate)
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

      setFilters({
        search: sp.get("search") || "",
        type: curType,
        pet: sp.get("pet") || "",
        arena: sp.get("arena") || "",
        price: sp.get("price") || "ALL",
        status: curStatus,
        sort: curSort,
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Synchronize state changes to URL parameters
  const updateUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.type !== "ALL") params.set("type", newFilters.type.toLowerCase());
      if (newFilters.pet) params.set("pet", newFilters.pet);
      if (newFilters.arena) params.set("arena", newFilters.arena);
      if (newFilters.price && newFilters.price !== "ALL") params.set("price", newFilters.price);
      if (newFilters.status !== "ALL") params.set("status", newFilters.status.toLowerCase());

      if (newFilters.sort === "PRICE_DESC") {
        if (newFilters.type !== "VIP") params.set("sort", "price_desc");
      } else if (newFilters.sort === "PRICE_ASC") {
        params.set("sort", "price_asc");
      } else if (newFilters.sort === "NEWEST") {
        if (newFilters.type === "VIP") params.set("sort", "newest");
      }

      const queryString = params.toString();
      const newPath = queryString ? `/shop?${queryString}` : "/shop";
      window.history.replaceState(null, "", newPath);
    },
    []
  );

  // Convert raw accounts to unified ProductCardData
  const allNormalizedAccounts = useMemo<ProductCardData[]>(() => {
    const vips = vipRaw.map((v) => normalizeVipAccount(v));
    const clones = cloneRaw.map((c) => normalizeCloneAccount(c));
    return [...vips, ...clones].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [vipRaw, cloneRaw]);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const handleFilterChange = useCallback(
    (updates: Partial<FilterState>) => {
      const prev = filtersRef.current;

      // 1. Search tracking (only when query actually changed & non-empty)
      if (updates.search !== undefined) {
        const query = updates.search.trim();
        if (query.length > 0 && query !== prev.search.trim()) {
          const queryNorm = removeAccents(query);
          const resultsCount = allNormalizedAccounts.filter((acc) => {
            let enriched = `${acc.title} ${acc.code} ${acc.mainPet || ""} ${(acc.rawVip?.allChibi || []).join(" ")} ${acc.arena || ""}`;
            if (enriched.toLowerCase().includes("tí nị")) enriched += " chibi pet linh thu";
            if (acc.type === "CLONE") enriched += " smurf clone";
            if (enriched.toLowerCase().includes("hàng hiệu")) enriched += " prestige";
            if (enriched.toLowerCase().includes("sân đấu")) enriched += " map arena";
            const textNorm = removeAccents(enriched);
            return textNorm.includes(queryNorm);
          }).length;
          analytics.trackSearchProduct({ query, results_count: resultsCount });
        }
      }

      // 2. Filter tracking (only fire when user actually changes filter)
      if (updates.type !== undefined && updates.type !== prev.type) {
        analytics.trackApplyFilter({ filter_type: "type", filter_value: updates.type.toLowerCase() });
      }
      if (updates.pet !== undefined && updates.pet !== prev.pet && updates.pet) {
        analytics.trackApplyFilter({ filter_type: "pet", filter_value: updates.pet });
      }
      if (updates.arena !== undefined && updates.arena !== prev.arena && updates.arena) {
        analytics.trackApplyFilter({ filter_type: "arena", filter_value: updates.arena });
      }
      if (updates.price !== undefined && updates.price !== prev.price && updates.price !== "ALL") {
        analytics.trackApplyFilter({ filter_type: "price", filter_value: updates.price });
      }
      if (updates.status !== undefined && updates.status !== prev.status && updates.status !== "ALL") {
        analytics.trackApplyFilter({ filter_type: "status", filter_value: updates.status.toLowerCase() });
      }
      if (updates.sort !== undefined && updates.sort !== prev.sort) {
        analytics.trackApplyFilter({ filter_type: "sort", filter_value: updates.sort.toLowerCase() });
      }

      setFilters((prevFilters) => {
        let nextType = updates.type !== undefined ? updates.type : prevFilters.type;
        let nextSort = updates.sort !== undefined ? updates.sort : prevFilters.sort;

        if (updates.type === "VIP" && updates.sort === undefined && prevFilters.type !== "VIP") {
          nextSort = "PRICE_DESC";
        } else if (updates.type && updates.type !== "VIP" && updates.sort === undefined && prevFilters.type === "VIP") {
          nextSort = "NEWEST";
        }

        const next = { ...prevFilters, ...updates, type: nextType, sort: nextSort };
        updateUrlParams(next);
        return next;
      });
    },
    [allNormalizedAccounts, updateUrlParams]
  );

  const handleResetAll = () => {
    const defaultSort = "NEWEST";
    const resetState: FilterState = {
      search: "",
      type: "ALL",
      pet: "",
      arena: "",
      price: "ALL",
      status: "ALL",
      sort: defaultSort,
    };
    setFilters(resetState);
    updateUrlParams(resetState);
  };

  const handleSelectSuggestion = (suggestionQuery: string) => {
    analytics.trackSearchSuggestionClick({
      original_query: filters.search,
      suggestion: suggestionQuery,
    });
    handleFilterChange({ search: suggestionQuery });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== "ALL") count++;
    if (filters.pet) count++;
    if (filters.arena) count++;
    if (filters.price !== "ALL") count++;
    if (filters.status !== "ALL") count++;
    return count;
  }, [filters.type, filters.pet, filters.arena, filters.price, filters.status]);

  // Compute Filter Options data for dropdown lists
  const filterOptions = useMemo(() => {
    const petMap = new Map<string, number>();
    const baseGroupMap = new Map<string, number>();
    const arenaMap = new Map<string, number>();

    const baseList = [
      "Ahri", "Gwen", "Yasuo", "Yone", "Jinx", "Irelia", "Lee Sin", "Shyvana",
      "Aatrox", "Sett", "Kaisa", "Zed", "Akali", "Sona", "Morgana", "Tristana",
      "Teemo", "Vayne", "Senna", "Riven", "Pyke", "Katarina", "Warwick", "Kayle",
      "Ashe", "Ezreal", "Lux", "Malphite", "Vi", "Ekko", "Caitlyn", "Annie"
    ];

    allNormalizedAccounts.forEach((acc) => {
      if (acc.mainPet) {
        petMap.set(acc.mainPet, (petMap.get(acc.mainPet) || 0) + 1);
        const norm = removeAccents(acc.mainPet);
        baseList.forEach((base) => {
          if (norm.includes(removeAccents(base))) {
            baseGroupMap.set(base, (baseGroupMap.get(base) || 0) + 1);
          }
        });
      }
      if (acc.arena) {
        arenaMap.set(acc.arena, (arenaMap.get(acc.arena) || 0) + 1);
      }
    });

    return {
      baseGroups: Array.from(baseGroupMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      specificPets: Array.from(petMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      arenas: Array.from(arenaMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      stats: {
        total: allNormalizedAccounts.length,
        vip: vipRaw.length,
        clone: cloneRaw.length,
        available: allNormalizedAccounts.filter((a) => a.status === "AVAILABLE").length,
        rented: allNormalizedAccounts.filter((a) => a.status === "RENTED").length,
      },
    };
  }, [allNormalizedAccounts, vipRaw, cloneRaw]);

  // Filter and Sort Pipeline
  const filteredAccounts = useMemo(() => {
    return allNormalizedAccounts
      .filter((acc) => {
        // 1. Type
        if (filters.type !== "ALL" && acc.type !== filters.type) return false;

        // 2. Status
        if (filters.status !== "ALL" && acc.status !== filters.status) return false;

        // 3. Search query
        if (filters.search.trim()) {
          const queryNorm = removeAccents(filters.search.trim());
          const cleanCode = acc.code.replace(/[^a-zA-Z0-9]/g, " ");
          const extraVipPets = (acc.rawVip?.allChibi || []).join(" ");
          const extraVipArenas = (acc.rawVip?.allArenas || []).join(" ");
          const cloneFeatures = (acc.features || []).join(" ");

          let enrichedText = `${acc.code} ${cleanCode} ${acc.title} ${acc.mainPet || ""} ${extraVipPets} ${acc.arena || ""} ${extraVipArenas} ${acc.rank || ""} ${cloneFeatures} ${acc.description || ""}`;
          const rawLower = enrichedText.toLowerCase();
          if (rawLower.includes("tí nị") || rawLower.includes("ti ni")) {
            enrichedText += " chibi pet linh thu";
          }
          if (acc.type === "CLONE" || rawLower.includes("unranked")) {
            enrichedText += " smurf clone trang thong tin";
          }
          if (rawLower.includes("hàng hiệu") || rawLower.includes("hang hieu")) {
            enrichedText += " prestige";
          }
          if (rawLower.includes("sân đấu") || rawLower.includes("san dau") || acc.arena) {
            enrichedText += " map arena san dau";
          }
          if (rawLower.includes("thách đấu") || rawLower.includes("thach dau")) {
            enrichedText += " challenger";
          }

          const textNorm = removeAccents(enrichedText);
          const words = queryNorm.split(" ").filter(Boolean);
          const matchAll = words.every((w) => textNorm.includes(w));
          if (!matchAll) return false;
        }

        // 4. Pet / Chibi filter
        if (filters.pet.trim()) {
          const targetPet = removeAccents(filters.pet.trim());
          const accPet = removeAccents(`${acc.mainPet || ""} ${acc.title || ""}`);
          if (!accPet.includes(targetPet)) return false;
        }

        // 5. Arena filter
        if (filters.arena.trim()) {
          const targetArena = removeAccents(filters.arena.trim());
          const accArena = removeAccents(acc.arena || "");
          if (!accArena.includes(targetArena)) return false;
        }

        // 6. Price Preset filter (Numeric comparison, not string)
        if (filters.price && filters.price !== "ALL") {
          const price = Number(acc.price) || 0;
          if (filters.type === "VIP") {
            if (filters.price === "under_15k" && price >= 15000) return false;
            if (filters.price === "15k_25k" && (price < 15000 || price > 25000)) return false;
            if (filters.price === "over_25k" && price <= 25000) return false;
          } else if (filters.type === "CLONE") {
            if (filters.price === "under_100k" && price >= 100000) return false;
            if (filters.price === "100k_200k" && (price < 100000 || price > 200000)) return false;
            if (filters.price === "200k_500k" && (price < 200000 || price > 500000)) return false;
            if (filters.price === "over_500k" && price <= 500000) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "PRICE_ASC") {
          return Number(a.price) - Number(b.price);
        }
        if (filters.sort === "PRICE_DESC") {
          return Number(b.price) - Number(a.price);
        }
        // Khi có search query, xếp hạng theo điểm liên quan (relevance) trước
        if (filters.search.trim()) {
          const scoreA = calculateSearchRelevance(
            {
              id: a.id,
              code: a.code,
              title: a.title,
              rank: a.rank,
              mainPet: a.mainPet,
              allPets: a.rawVip?.allChibi,
              arena: a.arena,
              allArenas: a.rawVip?.allArenas,
              features: a.features,
              description: a.description,
              status: a.status,
              type: a.type,
            },
            filters.search
          );
          const scoreB = calculateSearchRelevance(
            {
              id: b.id,
              code: b.code,
              title: b.title,
              rank: b.rank,
              mainPet: b.mainPet,
              allPets: b.rawVip?.allChibi,
              arena: b.arena,
              allArenas: b.rawVip?.allArenas,
              features: b.features,
              description: b.description,
              status: b.status,
              type: b.type,
            },
            filters.search
          );
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
        }
        // "NEWEST": Sort by creation timestamp descending
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [allNormalizedAccounts, filters]);

  // Track search no-result events (Phase 10)
  const lastNoResultQueryRef = useRef<string>("");
  useEffect(() => {
    if (!isLoading && filteredAccounts.length === 0 && filters.search.trim()) {
      const q = filters.search.trim();
      if (lastNoResultQueryRef.current !== q) {
        lastNoResultQueryRef.current = q;
        analytics.trackSearchNoResult({
          query: q,
          active_filters: {
            type: filters.type,
            pet: filters.pet,
            arena: filters.arena,
            price: filters.price,
            status: filters.status,
          },
        });
      }
    }
  }, [isLoading, filteredAccounts.length, filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const hasMore = visibleCount < filteredAccounts.length || hasMoreServer;

  const visibleAccounts = useMemo(
    () => filteredAccounts.slice(0, visibleCount),
    [filteredAccounts, visibleCount]
  );

  // IntersectionObserver for incremental loading (load-ahead 600-1000px)
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          if (visibleCount < filteredAccounts.length) {
            setIsLoadingMore(true);
            setTimeout(() => {
              setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredAccounts.length));
              setIsLoadingMore(false);
            }, 60);
          } else if (hasMoreServer) {
            setIsLoadingMore(true);
            const offset = allNormalizedAccounts.length;
            fetch(`/api/accounts?offset=${offset}&limit=24`)
              .then((res) => (res.ok ? res.json() : null))
              .then((res) => {
                if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                  const existingIds = new Set([
                    ...vipRaw.map((v) => v.id),
                    ...cloneRaw.map((c) => c.id),
                  ]);
                  const newVips: TFTRentalAccount[] = [];
                  const newClones: TFTCloneAccount[] = [];

                  res.data.forEach((row: any, i: number) => {
                    if (!existingIds.has(row.id)) {
                      if (row.type === "VIP") {
                        newVips.push(mapRowToVipAccount(row, offset + i));
                      } else {
                        newClones.push(mapRowToCloneAccount(row, offset + i));
                      }
                    }
                  });

                  if (newVips.length > 0) setVipRaw((prev) => [...prev, ...newVips]);
                  if (newClones.length > 0) setCloneRaw((prev) => [...prev, ...newClones]);
                  if (newVips.length === 0 && newClones.length === 0) {
                    setHasMoreServer(false);
                  }
                } else {
                  setHasMoreServer(false);
                }
              })
              .catch(() => {
                setHasMoreServer(false);
              })
              .finally(() => {
                setIsLoadingMore(false);
              });
          }
        }
      },
      {
        rootMargin: "800px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    hasMoreServer,
    isLoading,
    isLoadingMore,
    visibleCount,
    filteredAccounts.length,
    allNormalizedAccounts.length,
    vipRaw,
    cloneRaw,
  ]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      {/* Header */}
      <TFTNavbar />

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-20 sm:pb-16 flex-1">
        {/* Breadcrumb - Ẩn trên mobile <= 480px để tiết kiệm diện tích màn hình */}
        <nav aria-label="Breadcrumb" className="hidden sm:block mb-3.5">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-400 font-normal">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </li>
            <li className="text-white font-medium">Kho Acc</li>
          </ol>
        </nav>

        {/* Page Title & Subtitle - Tinh gọn trên mobile */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
            Kho Acc TFT - ĐTCL
          </h1>
          <p className="mt-1 text-zinc-400 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Tìm acc theo Pet, Chibi, Sân Đấu, loại tài khoản và mức giá phù hợp.
          </p>
        </div>

        {/* Filter Bar Component */}
        <CatalogFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetAll={handleResetAll}
          totalMatching={filteredAccounts.length}
          filterOptions={filterOptions}
          initialFocus={focusParam}
        />

        {/* Result Count & Active Filter Summary (Mobile: "134 tài khoản", Desktop: "Tìm thấy 134 tài khoản phù hợp") */}
        <div className="flex items-center justify-between gap-3 mb-3.5 sm:mb-4 text-xs sm:text-[13px] text-zinc-400 border-b border-white/[0.06] pb-2.5 sm:pb-3">
          <div>
            <span className="hidden sm:inline">Tìm thấy </span>
            <strong className="text-white font-bold font-mono px-0.5">
              {filteredAccounts.length}
            </strong>
            <span className="hidden sm:inline"> tài khoản phù hợp</span>
            <span className="sm:hidden"> tài khoản</span>
          </div>

          {(filters.search ||
            filters.type !== "ALL" ||
            filters.pet ||
            filters.arena ||
            filters.price !== "ALL" ||
            filters.status !== "ALL") && (
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/[0.05]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : allNormalizedAccounts.length === 0 && loadError ? (
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent p-8 sm:p-12 text-center my-6 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Không tải được dữ liệu
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 font-normal leading-relaxed">
              {loadError || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại."}
            </p>
            <button
              onClick={() => {
                setIsLoading(true);
                loadData();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs sm:text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <ProductCardEmptyState
            searchQuery={filters.search}
            activeFilterCount={activeFilterCount}
            suggestions={getSmartSearchSuggestions(filters.search)}
            onSelectSuggestion={handleSelectSuggestion}
            onClearSearch={() => handleFilterChange({ search: "" })}
            onReset={handleResetAll}
            onSwitchType={(type) => handleFilterChange({ type, search: "" })}
            totalCount={allNormalizedAccounts.length}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {visibleAccounts.map((item, idx) => (
                <Reveal key={item.id} delay={Math.min((idx % PAGE_SIZE) * 40, 120)} className="h-full">
                  <ProductCard
                    item={item}
                    priority={idx === 0}
                    onSelectAccount={(vip) => setSelectedVipAccount(vip)}
                  />
                </Reveal>
              ))}
            </div>

            {/* Incremental Loading Sentinel & Skeletons */}
            {hasMore && (
              <div ref={sentinelRef} className="mt-4 pt-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 opacity-70">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}

            {!hasMore && filteredAccounts.length > PAGE_SIZE && (
              <div className="text-center py-8">
                <p className="text-xs text-zinc-500 font-normal">
                  Đã hiển thị toàn bộ {filteredAccounts.length} tài khoản phù hợp.
                </p>
              </div>
            )}
          </>
        )}

        {/* Recently Viewed Shelf (only rendered if user has viewed accounts) */}
        <SectionErrorBoundary sectionName="RecentlyViewed" silent>
          <TFTRecentlyViewed
            title="Acc Bạn Đã Xem Gần Đây"
            subtitle="Tiện lợi so sánh lại các tài khoản bạn vừa tham khảo trên shop"
          />
        </SectionErrorBoundary>
      </main>

      {/* Account Order / Detail Modal */}
      <TFTAccountModal
        account={selectedVipAccount}
        onClose={() => setSelectedVipAccount(null)}
      />

      {/* Footer & Mobile Bottom Bar */}
      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
