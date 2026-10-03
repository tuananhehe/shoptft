import { supabase } from "@/utils/supabase/client";
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import {
  TFTRentalAccount,
  TFTCloneAccount,
  TFT_RENTAL_ACCOUNTS,
  TFT_CLONE_ACCOUNTS,
} from "@/data/tft-data";
import {
  AccountDbRow,
  mapRowToVipAccount,
  mapRowToCloneAccount,
} from "@/utils/supabase/accounts-service";
import {
  ProductCardData,
  normalizeVipAccount,
  normalizeCloneAccount,
} from "@/utils/product-card-shared";
import {
  normalizeSearchQuery,
  removeVietnameseAccents,
  calculateSearchRelevance,
} from "@/utils/search-discovery";

export interface ShopQueryFilters {
  search?: string;
  type?: "ALL" | "VIP" | "CLONE";
  pet?: string;
  arena?: string;
  price?: string;
  status?: "ALL" | "AVAILABLE" | "RENTED";
  sort?: "NEWEST" | "PRICE_ASC" | "PRICE_DESC";
  page?: number;
  limit?: number;
  isAdmin?: boolean;
}

export interface ShopInventoryResult {
  items: ProductCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptionsData {
  baseGroups: { name: string; count: number }[];
  specificPets: { name: string; count: number }[];
  arenas: { name: string; count: number }[];
  stats: {
    total: number;
    vip: number;
    clone: number;
    available: number;
    rented: number;
  };
}

const BASE_CHAMPIONS = [
  "Ahri", "Gwen", "Yasuo", "Yone", "Jinx", "Irelia", "Lee Sin", "Shyvana",
  "Aatrox", "Sett", "Kaisa", "Zed", "Akali", "Sona", "Morgana", "Tristana",
  "Teemo", "Vayne", "Senna", "Riven", "Pyke", "Katarina", "Warwick", "Kayle",
  "Ashe", "Ezreal", "Lux", "Malphite", "Vi", "Ekko", "Caitlyn", "Annie",
];

const PUBLIC_CARD_COLUMNS =
  "id, code, type, title, rank, price, hourly_price, daily_price, period_price, period_unit, price_display_type, custom_price, custom_price_unit, champions, arenas, image_url, status, rented_until, created_at, features, weekly_price, description";

interface CachedInventory {
  timestamp: number;
  allAccounts: ProductCardData[];
  filterOptions: FilterOptionsData;
}

let cachedInventory: CachedInventory | null = null;
const CACHE_TTL_MS = 20 * 1000; // 20s fast in-memory L1 cache

/**
 * On-demand revalidation cho toàn bộ inventory:
 * - Purge Next.js Data Cache tags: 'products', 'products:newest', 'shop-products'
 * - Revalidate các route HTML: '/', '/shop', '/thue-acc-tft-dtcl'
 * - Xóa L1 in-memory cache
 */
export function revalidateShopAndInventory() {
  try {
    cachedInventory = null;
    revalidateTag("products");
    revalidateTag("products:newest");
    revalidateTag("shop-products");
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/thue-acc-tft-dtcl", "page");
    console.log("✅ [Inventory Revalidation] Purged cache tags: products, products:newest, shop-products and revalidated paths: /, /shop, /thue-acc-tft-dtcl");
  } catch (err) {
    console.warn("⚠️ [Inventory Revalidation] Revalidation warning:", err);
  }
}

export function invalidateShopInventoryCache() {
  revalidateShopAndInventory();
}

/**
 * Lấy danh sách tài khoản VIP mới nhất phục vụ Homepage (“Acc TFT Mới Cập Nhật”) và Landing page.
 * Đảm bảo:
 * - Query đúng: WHERE status IN ('AVAILABLE', 'RENTED') AND type = 'VIP'
 * - Sort đúng: ORDER BY created_at DESC
 * - Bounded query: LIMIT 4
 * - Cache: Next.js Data Cache với tag ['products', 'products:newest'] + on-demand revalidation tức thì sau mutation.
 */
export const getNewestVipAccountsServer = unstable_cache(
  async (limit: number = 4): Promise<TFTRentalAccount[]> => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(PUBLIC_CARD_COLUMNS)
        .eq("type", "VIP")
        .in("status", ["AVAILABLE", "RENTED"])
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data.map((row: AccountDbRow, idx: number) => mapRowToVipAccount(row, idx));
      }
    } catch (err) {
      console.warn("Lỗi server query newest vip accounts:", err);
    }
    return TFT_RENTAL_ACCOUNTS.slice(0, limit);
  },
  ["homepage-newest-vip-accounts-v2"],
  {
    revalidate: 60,
    tags: ["products", "products:newest"],
  }
);

/**
 * Truy vấn và tính toán toàn bộ danh sách inventory đã chuẩn hóa từ Database
 */
async function fetchAndNormalizeAccountsFromDb(): Promise<{
  allAccounts: ProductCardData[];
  filterOptions: FilterOptionsData;
}> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select(PUBLIC_CARD_COLUMNS)
      .in("status", ["AVAILABLE", "RENTED"])
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const allAccounts: ProductCardData[] = [];
      const petMap = new Map<string, number>();
      const baseGroupMap = new Map<string, number>();
      const arenaMap = new Map<string, number>();

      data.forEach((row: AccountDbRow, idx: number) => {
        const isVip = row.type === "VIP";
        const card = isVip
          ? normalizeVipAccount(mapRowToVipAccount(row, idx))
          : normalizeCloneAccount(mapRowToCloneAccount(row, idx));

        allAccounts.push(card);

        // Thống kê linh thú / Pet
        if (Array.isArray(row.champions)) {
          row.champions.forEach((champ: string) => {
            const c = (champ || "").trim();
            if (!c) return;
            petMap.set(c, (petMap.get(c) || 0) + 1);

            const normChamp = removeVietnameseAccents(c);
            BASE_CHAMPIONS.forEach((base) => {
              if (normChamp.includes(removeVietnameseAccents(base))) {
                baseGroupMap.set(base, (baseGroupMap.get(base) || 0) + 1);
              }
            });
          });
        }
        if (card.mainPet && !petMap.has(card.mainPet)) {
          petMap.set(card.mainPet, (petMap.get(card.mainPet) || 0) + 1);
          const normPet = removeVietnameseAccents(card.mainPet);
          BASE_CHAMPIONS.forEach((base) => {
            if (normPet.includes(removeVietnameseAccents(base))) {
              baseGroupMap.set(base, (baseGroupMap.get(base) || 0) + 1);
            }
          });
        }

        // Thống kê sân đấu
        if (Array.isArray(row.arenas)) {
          row.arenas.forEach((arena: string) => {
            const ar = (arena || "").trim();
            if (!ar || ar === "Chưa xác định") return;
            arenaMap.set(ar, (arenaMap.get(ar) || 0) + 1);
          });
        }
        if (card.arena && card.arena !== "Chưa xác định" && !arenaMap.has(card.arena)) {
          arenaMap.set(card.arena, (arenaMap.get(card.arena) || 0) + 1);
        }
      });

      const baseGroups = Array.from(baseGroupMap.entries())
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      const specificPets = Array.from(petMap.entries())
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      const arenas = Array.from(arenaMap.entries())
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      const filterOptions: FilterOptionsData = {
        baseGroups,
        specificPets,
        arenas,
        stats: {
          total: allAccounts.length,
          vip: allAccounts.filter((r) => r.type === "VIP").length,
          clone: allAccounts.filter((r) => r.type === "CLONE").length,
          available: allAccounts.filter((r) => r.status === "AVAILABLE").length,
          rented: allAccounts.filter((r) => r.status === "RENTED").length,
        },
      };

      return { allAccounts, filterOptions };
    }
  } catch (err) {
    console.warn("Lỗi tải toàn bộ accounts từ Supabase, chuyển sang fallback static:", err);
  }

  // Fallback sang dữ liệu static nếu DB có sự cố
  const vips = TFT_RENTAL_ACCOUNTS.map((v) => normalizeVipAccount(v));
  const clones = TFT_CLONE_ACCOUNTS.map((c) => normalizeCloneAccount(c));
  const fallbackAccounts = [...vips, ...clones];

  const fallbackOptions: FilterOptionsData = {
    baseGroups: [],
    specificPets: [],
    arenas: [],
    stats: {
      total: fallbackAccounts.length,
      vip: vips.length,
      clone: clones.length,
      available: fallbackAccounts.filter((r) => r.status === "AVAILABLE").length,
      rented: fallbackAccounts.filter((r) => r.status === "RENTED").length,
    },
  };

  return { allAccounts: fallbackAccounts, filterOptions: fallbackOptions };
}

/**
 * Data Cache layer cho toàn bộ danh sách inventory dùng chung giữa các Vercel serverless instance.
 * Tự động gắn tag 'products' và 'shop-products'.
 */
const getCachedNormalizedInventory = unstable_cache(
  async () => {
    return await fetchAndNormalizeAccountsFromDb();
  },
  ["shop-all-normalized-inventory-v2"],
  {
    revalidate: 60,
    tags: ["products", "shop-products"],
  }
);

/**
 * Lấy toàn bộ danh sách tài khoản đã chuẩn hóa thành ProductCardData từ DB.
 * Ưu tiên:
 * 1. L1 Fast in-memory cache (cho cùng instance trong 20s)
 * 2. Next.js Data Cache (unstable_cache chia sẻ giữa các instance trên Vercel, invalidate tức thì qua revalidateTag)
 */
async function getAllNormalizedAccounts(isAdmin: boolean = false): Promise<{
  allAccounts: ProductCardData[];
  filterOptions: FilterOptionsData;
}> {
  if (isAdmin) {
    return await fetchAndNormalizeAccountsFromDb();
  }

  const now = Date.now();
  if (cachedInventory && now - cachedInventory.timestamp < CACHE_TTL_MS) {
    return {
      allAccounts: cachedInventory.allAccounts,
      filterOptions: cachedInventory.filterOptions,
    };
  }

  const result = await getCachedNormalizedInventory();
  cachedInventory = {
    timestamp: now,
    allAccounts: result.allAccounts,
    filterOptions: result.filterOptions,
  };

  return result;
}

/**
 * Hàm tìm kiếm, lọc, sắp xếp và phân trang trực tiếp trên toàn bộ inventory phía server
 */
export async function getShopInventory(
  filters: ShopQueryFilters = {}
): Promise<ShopInventoryResult & { filterOptions: FilterOptionsData }> {
  const isAdmin = Boolean(filters.isAdmin);
  const { allAccounts, filterOptions } = await getAllNormalizedAccounts(isAdmin);

  const rawSearch = normalizeSearchQuery(filters.search);
  const queryNorm = removeVietnameseAccents(rawSearch);
  const searchWords = queryNorm ? queryNorm.split(" ").filter(Boolean) : [];

  const typeFilter = (filters.type || "ALL").toUpperCase();
  const statusFilter = (filters.status || "ALL").toUpperCase();
  const petFilter = removeVietnameseAccents(filters.pet);
  const arenaFilter = removeVietnameseAccents(filters.arena);
  const priceFilter = filters.price || "ALL";

  const rawSort = (filters.sort || "").toUpperCase();
  let explicitSort: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | null = null;
  if (rawSort === "PRICE_ASC") explicitSort = "PRICE_ASC";
  else if (rawSort === "PRICE_DESC") explicitSort = "PRICE_DESC";
  else if (rawSort === "NEWEST") explicitSort = "NEWEST";

  // 1. Áp dụng các bộ lọc toàn cục
  const filtered = allAccounts.filter((acc) => {
    // A. Quyền xem công khai (Ẩn tài khoản HIDDEN trừ khi là Admin)
    if (!isAdmin && acc.status === "HIDDEN") return false;

    // B. Lọc theo Phân Loại (VIP / CLONE)
    if (typeFilter !== "ALL" && acc.type !== typeFilter) return false;

    // C. Lọc theo Trạng Thái (AVAILABLE / RENTED)
    if (statusFilter !== "ALL" && acc.status !== statusFilter) return false;

    // D. Lọc theo Pet / Chibi
    if (petFilter) {
      const allPetNames = [
        acc.mainPet || "",
        acc.title || "",
        ...(acc.rawVip?.allChibi || []),
      ].join(" ");
      const normPetText = removeVietnameseAccents(allPetNames);
      if (!normPetText.includes(petFilter)) return false;
    }

    // E. Lọc theo Sân Đấu
    if (arenaFilter) {
      const allArenaNames = [
        acc.arena || "",
        acc.title || "",
        ...(acc.rawVip?.allArenas || []),
      ].join(" ");
      const normArenaText = removeVietnameseAccents(allArenaNames);
      if (!normArenaText.includes(arenaFilter)) return false;
    }

    // F. Lọc theo Mức Giá (Preset)
    if (priceFilter && priceFilter !== "ALL") {
      const price = Number(acc.price) || 0;
      if (acc.type === "VIP") {
        if (priceFilter === "under_15k" && price >= 15000) return false;
        if (priceFilter === "15k_25k" && (price < 15000 || price > 25000)) return false;
        if (priceFilter === "over_25k" && price <= 25000) return false;
      } else if (acc.type === "CLONE") {
        if (priceFilter === "under_100k" && price >= 100000) return false;
        if (priceFilter === "100k_200k" && (price < 100000 || price > 200000)) return false;
        if (priceFilter === "200k_500k" && (price < 200000 || price > 500000)) return false;
        if (priceFilter === "over_500k" && price <= 500000) return false;
      }
    }

    // G. Tìm Kiếm Toàn Cầu (Global Search trên mọi trường public)
    if (searchWords.length > 0) {
      const cleanCode = acc.code.replace(/[^a-zA-Z0-9]/g, " ");
      const extraVipPets = (acc.rawVip?.allChibi || []).join(" ");
      const extraVipArenas = (acc.rawVip?.allArenas || []).join(" ");
      const cloneFeatures = (acc.features || []).join(" ");

      let enrichedText = `${acc.code} ${cleanCode} ${acc.title} ${acc.mainPet || ""} ${extraVipPets} ${acc.arena || ""} ${extraVipArenas} ${acc.rank || ""} ${cloneFeatures} ${acc.description || ""}`;
      const rawLower = enrichedText.toLowerCase();

      // Mở rộng từ đồng nghĩa phục vụ tìm kiếm thông minh
      if (rawLower.includes("tí nị") || rawLower.includes("ti ni")) {
        enrichedText += " chibi pet linh thu ti ni";
      }
      if (acc.type === "CLONE" || rawLower.includes("unranked")) {
        enrichedText += " smurf clone trang thong tin";
      }
      if (rawLower.includes("hàng hiệu") || rawLower.includes("hang hieu")) {
        enrichedText += " prestige hang hieu";
      }
      if (rawLower.includes("sân đấu") || rawLower.includes("san dau") || acc.arena) {
        enrichedText += " map arena san dau";
      }
      if (rawLower.includes("thách đấu") || rawLower.includes("thach dau")) {
        enrichedText += " challenger thach dau";
      }

      const textNorm = removeVietnameseAccents(enrichedText);
      const matchAll = searchWords.every((word) => textNorm.includes(word));
      if (!matchAll) return false;
    }

    return true;
  });

  // 2. Sắp Xếp Toàn Cục (Sort trước khi phân trang)
  filtered.sort((a, b) => {
    // A. Người dùng chọn sắp xếp giá rõ ràng
    if (explicitSort === "PRICE_ASC") {
      return Number(a.price) - Number(b.price);
    }
    if (explicitSort === "PRICE_DESC") {
      return Number(b.price) - Number(a.price);
    }

    // B. Khi có từ khóa tìm kiếm và người dùng không chọn sort giá: Xếp hạng theo độ liên quan
    if (rawSearch) {
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
        rawSearch
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
        rawSearch
      );
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
    }

    // C. Mặc định cho danh mục VIP: giá cao đến thấp nếu không có query search
    if (!rawSearch && !explicitSort && typeFilter === "VIP") {
      return Number(b.price) - Number(a.price);
    }

    // D. Sắp xếp tài khoản mới nhất lên đầu (NEWEST)
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // 3. Đếm Tổng Số (total trước khi phân trang)
  const total = filtered.length;

  // 4. Phân Trang (Paginate: limit & page/offset)
  const limit = Math.max(1, Math.min(filters.limit || 24, 100));
  const page = Math.max(1, filters.page || 1);
  const offset = (page - 1) * limit;

  const items = filtered.slice(offset, offset + limit);
  const hasMore = offset + items.length < total;

  return {
    items,
    total,
    page,
    limit,
    hasMore,
    filterOptions,
  };
}

/**
 * Lấy danh sách Filter Options cho các Dropdown
 */
export async function getShopFilterOptions(): Promise<FilterOptionsData> {
  const { filterOptions } = await getAllNormalizedAccounts(false);
  return filterOptions;
}
