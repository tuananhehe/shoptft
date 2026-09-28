"use client";

import { UnifiedProductAccount } from "@/utils/account-lookup";
import { ProductCardData } from "@/components/product-card";
import { analytics } from "@/utils/analytics";
import toast from "react-hot-toast";

export interface DiscoveredProduct {
  id: string;
  code: string;
  type: "VIP" | "CLONE";
  title: string;
  thumbnail: string;
  price: number;
  priceUnit: string;
  status: "AVAILABLE" | "RENTED" | string;
  mainPet?: string;
  allPetsSummary?: string;
  arena?: string;
  rank?: string;
  viewedAt?: number;
  savedAt?: number;
}

const STORAGE_KEY_RECENT = "tft_recently_viewed_v2";
const STORAGE_KEY_FAVORITES = "tft_favorites_v2";
const MAX_RECENT_ITEMS = 12;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Chuẩn hóa một sản phẩm từ bất kỳ nguồn nào thành DiscoveredProduct tinh gọn (chỉ dữ liệu công khai)
 */
export function toDiscoveredProduct(
  item: UnifiedProductAccount | ProductCardData | DiscoveredProduct
): DiscoveredProduct {
  return {
    id: String(item.id),
    code: item.code,
    type: item.type === "CLONE" ? "CLONE" : "VIP",
    title: item.title,
    thumbnail: item.thumbnail,
    price: item.price || 0,
    priceUnit: "priceUnit" in item ? item.priceUnit : item.type === "CLONE" ? " / Trọn gói" : " / Giờ",
    status: item.status === "RENTED" ? "RENTED" : "AVAILABLE",
    mainPet: "mainPet" in item ? item.mainPet : "mainChibi" in item ? item.mainChibi : undefined,
    allPetsSummary: "allPetsSummary" in item ? item.allPetsSummary : undefined,
    arena: "arena" in item ? item.arena : "mainArena" in item ? item.mainArena : undefined,
    rank: item.rank,
  };
}

// ============================================================================
// 1. RECENTLY VIEWED (Acc đã xem gần đây)
// ============================================================================

export function getRecentlyViewed(): DiscoveredProduct[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && item.title);
  } catch (e) {
    console.warn("Lỗi đọc danh sách acc đã xem:", e);
    return [];
  }
}

export function addRecentlyViewed(
  product: UnifiedProductAccount | ProductCardData | DiscoveredProduct
): void {
  if (!isBrowser() || !product || !product.id) return;
  try {
    const clean = toDiscoveredProduct(product);
    clean.viewedAt = Date.now();

    const current = getRecentlyViewed();
    // Bỏ trùng lặp (newest viewed first)
    const filtered = current.filter(
      (item) => item.id !== clean.id && item.code !== clean.code
    );

    const updated = [clean, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));

    // Bắn event để các component sync ngay lập tức
    window.dispatchEvent(new CustomEvent("tft:recently_viewed_updated", { detail: updated }));
  } catch (e) {
    console.warn("Lỗi lưu acc đã xem:", e);
  }
}

export function clearRecentlyViewed(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY_RECENT);
  window.dispatchEvent(new CustomEvent("tft:recently_viewed_updated", { detail: [] }));
}

// ============================================================================
// 2. FAVORITES (Acc đã lưu / yêu thích)
// ============================================================================

export function getFavorites(): DiscoveredProduct[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && item.title);
  } catch (e) {
    console.warn("Lỗi đọc danh sách yêu thích:", e);
    return [];
  }
}

export function isFavorite(productId: string): boolean {
  if (!isBrowser() || !productId) return false;
  const current = getFavorites();
  return current.some((item) => item.id === productId || item.code === productId);
}

export function toggleFavorite(
  product: UnifiedProductAccount | ProductCardData | DiscoveredProduct
): boolean {
  if (!isBrowser() || !product || !product.id) return false;
  try {
    const clean = toDiscoveredProduct(product);
    const current = getFavorites();
    const existingIndex = current.findIndex(
      (item) => item.id === clean.id || item.code === clean.code
    );

    let updated: DiscoveredProduct[];
    let isAdded = false;

    if (existingIndex >= 0) {
      // Bỏ khỏi danh sách
      updated = current.filter((_, idx) => idx !== existingIndex);
      toast("Đã bỏ khỏi danh sách đã lưu", {
        icon: "🗑️",
        style: {
          background: "#141416",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "13px",
        },
      });
      analytics.trackFavoriteProduct({
        product_id: clean.code || clean.id,
        product_type: clean.type,
        action: "remove",
      });
    } else {
      // Thêm vào danh sách
      clean.savedAt = Date.now();
      updated = [clean, ...current].slice(0, 30);
      isAdded = true;
      toast.success(`Đã lưu acc ${clean.code} vào danh sách`, {
        icon: "❤️",
        style: {
          background: "#141416",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "13px",
        },
      });
      analytics.trackFavoriteProduct({
        product_id: clean.code || clean.id,
        product_type: clean.type,
        action: "add",
      });
    }

    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("tft:favorites_updated", { detail: { favorites: updated, changedId: clean.id, isAdded } })
    );

    return isAdded;
  } catch (e) {
    console.warn("Lỗi cập nhật yêu thích:", e);
    return false;
  }
}
