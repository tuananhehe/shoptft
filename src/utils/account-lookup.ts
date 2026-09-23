import { supabase } from "@/utils/supabase/client";
import {
  TFTRentalAccount,
  TFTCloneAccount,
  TFT_RENTAL_ACCOUNTS,
  TFT_CLONE_ACCOUNTS,
} from "@/data/tft-data";
import { AccountDbRow, cleanTftImageUrl } from "@/utils/supabase/accounts-service";

export interface UnifiedProductAccount {
  id: string;
  code: string;
  type: "VIP" | "CLONE";
  title: string;
  rank: string;
  rankColor: string;
  rankBadgeBg: string;
  status: "AVAILABLE" | "RENTED";
  rentedUntil?: string | null;
  thumbnail: string;
  description: string;

  // Pricing
  price?: number;
  hourlyPrice: number;
  dailyPrice: number;
  nightPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  periodPrice?: number;
  periodUnit?: string;
  accountValue: number;
  priceDisplayType?: "HOURLY" | "DAILY" | "LONG_TERM" | "CUSTOM" | "AUTO";
  customPrice?: number;
  customPriceUnit?: string;

  // VIP specifics
  mainChibi?: string;
  allChibi: string[];
  mainArena?: string;
  allArenas: string[];
  totalLittleLegends?: number;
  totalArenas?: number;
  totalBooms?: number;
  tag?: string;

  // Clone specifics
  features: string[];
  rankBadge?: string;
  durationLabel?: string;
}

// Helper xác định màu sắc rank an toàn
export const getRankTheme = (rankStr?: string | null) => {
  const str = (rankStr || "").toUpperCase();
  if (str.includes("THÁCH ĐẤU")) {
    return {
      rankColor: "text-amber-500",
      rankBadgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-600",
      borderGlow: "border-amber-400/40 shadow-amber-500/10",
      gradient: "from-amber-500 via-orange-500 to-amber-600",
    };
  }
  if (str.includes("ĐẠI CAO THỦ")) {
    return {
      rankColor: "text-rose-500",
      rankBadgeBg: "bg-rose-50 border-rose-200 text-rose-600",
      borderGlow: "border-rose-400/40 shadow-rose-500/10",
      gradient: "from-rose-500 via-red-500 to-rose-600",
    };
  }
  if (str.includes("CAO THỦ")) {
    return {
      rankColor: "text-purple-600",
      rankBadgeBg: "bg-purple-50 border-purple-200 text-purple-600",
      borderGlow: "border-purple-400/40 shadow-purple-500/10",
      gradient: "from-purple-500 via-indigo-500 to-purple-600",
    };
  }
  if (str.includes("KIM CƯƠNG")) {
    return {
      rankColor: "text-sky-600",
      rankBadgeBg: "bg-sky-50 border-sky-200 text-sky-600",
      borderGlow: "border-sky-400/40 shadow-sky-500/10",
      gradient: "from-sky-500 via-cyan-500 to-blue-600",
    };
  }
  if (str.includes("LỤC BẢO")) {
    return {
      rankColor: "text-emerald-600",
      rankBadgeBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
      borderGlow: "border-emerald-400/40 shadow-emerald-500/10",
      gradient: "from-emerald-500 via-teal-500 to-green-600",
    };
  }
  if (str.includes("VÀNG") || str.includes("BẠCH KIM")) {
    return {
      rankColor: "text-amber-600",
      rankBadgeBg: "bg-amber-50 border-amber-200 text-amber-700",
      borderGlow: "border-amber-400/40 shadow-amber-500/10",
      gradient: "from-amber-500 via-yellow-500 to-amber-600",
    };
  }
  if (str.includes("BẠC")) {
    return {
      rankColor: "text-slate-600",
      rankBadgeBg: "bg-slate-100 border-slate-300 text-slate-700",
      borderGlow: "border-slate-300 shadow-slate-500/10",
      gradient: "from-slate-400 to-slate-600",
    };
  }
  if (str.includes("ĐỒNG") || str.includes("SẮT")) {
    return {
      rankColor: "text-amber-800",
      rankBadgeBg: "bg-amber-100/60 border-amber-300 text-amber-800",
      borderGlow: "border-amber-600/30",
      gradient: "from-amber-700 to-amber-900",
    };
  }
  return {
    rankColor: "text-slate-600",
    rankBadgeBg: "bg-slate-100 border-slate-200 text-slate-700",
    borderGlow: "border-slate-200",
    gradient: "from-slate-600 to-slate-800",
  };
};

/**
 * Chuẩn hóa một chuỗi slug hoặc code để so sánh linh hoạt
 * Ví dụ: "MS: 8899" -> "8899", "ms-8899" -> "8899", "CLONE-01" -> "clone01"
 */
export function normalizeAccountCode(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/^ms[\s\-:_]*/i, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Sinh đường dẫn link riêng thân thiện cho từng tài khoản
 * Ví dụ: /acc/8899 hoặc /acc/CLONE-01
 */
export function getAccountProductUrl(account: { id: string; code?: string }): string {
  if (!account) return "/";
  const code = (account.code || "").trim();
  // Nếu mã có dạng "MS: 8899" -> lấy "8899"
  const cleanCode = code.replace(/^MS:\s*/i, "").replace(/\s+/g, "-");
  const slug = cleanCode || account.id;
  return `/acc/${encodeURIComponent(slug)}`;
}

/**
 * Chuyển đổi một dòng DB (AccountDbRow) thành UnifiedProductAccount
 */
export function transformDbRowToUnified(row: AccountDbRow, index = 0): UnifiedProductAccount {
  const isVip = row.type === "VIP";
  const { rankColor, rankBadgeBg } = getRankTheme(row.rank);
  const champions = Array.isArray(row.champions) ? row.champions.filter(Boolean) : [];
  const arenas = Array.isArray(row.arenas) ? row.arenas.filter(Boolean) : [];
  const mainChibi = champions[0] || (isVip ? "Tí Nị Thần Thoại" : undefined);
  const mainArena = arenas[0] || (isVip ? "Sân Đấu Thần Thoại" : undefined);
  const allChibi = champions.length > 0 ? champions : mainChibi ? [mainChibi] : [];
  const allArenas = arenas.length > 0 ? arenas : mainArena ? [mainArena] : [];

  const features = Array.isArray(row.features) && row.features.length > 0
    ? row.features.filter(Boolean)
    : isVip
    ? [
        `Tướng Tí Nị HOT: ${mainChibi || "Full Set VIP"}`,
        `Sân Đấu: ${mainArena || "Thần Thoại Đổi Nhạc EDM"}`,
        "Tài Khoản Riot ID Chính Chủ 100%",
        "Bàn Giao Tự Động Siêu Tốc 30 Giây",
      ]
    : [
        "Tài Khoản An Toàn 100%",
        "Hỗ Trợ Bàn Giao Thông Về Khách",
        "Sẵn Sản Phẩm Như Mô Tả 100%",
      ];

  const accountValue = Number(row.price) || (isVip ? 850000 : 150000);
  const hourly = Number(row.hourly_price) > 0
    ? Number(row.hourly_price)
    : isVip
    ? Math.round((((accountValue * 0.03) + 20000) / 2) / 1000) * 1000
    : 10000;
  const daily = Number(row.daily_price) || (isVip ? Math.round((((accountValue * 0.12) + 20000) / 2) / 1000) * 1000 : 25000);

  // Sinh mô tả chuẩn xác, chi tiết và đồng bộ hoàn hảo với dữ liệu trên web
  let description = (row.description || "").trim();
  if (!description || description === "Tài khoản chính chủ hoạt động tốt." || description.length < 25) {
    if (isVip) {
      const chibiDesc = allChibi.length > 0 ? allChibi.join(", ") : mainChibi;
      const arenaDesc = allArenas.length > 0 ? allArenas.join(", ") : mainArena;
      description = `Tài khoản VIP chính chủ sở hữu ${chibiDesc}${arenaDesc ? ` kèm ${arenaDesc}` : ""}. Bậc rank ${row.rank || "VIP"}, cam kết Riot ID sạch 100%, bàn giao tự động 30s và bảo hành trực tiếp bởi Cựu Thách Đấu Tuấn Thái Bình (Bảo hiểm 30M Checkscam).`;
    } else {
      description = `Tài khoản Clone / Smurf sạch sẽ bậc rank ${row.rank || "Unranked"}, sẵn sàng vào game leo rank ngay. Bàn giao full quyền Riot ID và bảo hành 100%.`;
    }
  }

  return {
    id: String(row.id || (isVip ? `vip-${index}` : `clone-${index}`)),
    code: row.code || (isVip ? `MS: ${8800 + index}` : `CLONE-${index + 1 < 10 ? `0${index + 1}` : index + 1}`),
    type: row.type || (isVip ? "VIP" : "CLONE"),
    title: row.title || (isVip ? `${row.rank || "VIP"} - ${mainChibi || row.code}` : `Acc Clone ${row.rank || "Unranked"}`),
    rank: row.rank || (isVip ? "THÁCH ĐẤU" : "UNRANKED"),
    rankColor,
    rankBadgeBg,
    status: String(row.status || "").toUpperCase() === "RENTED" ? "RENTED" : "AVAILABLE",
    rentedUntil: row.rented_until || null,
    thumbnail:
      cleanTftImageUrl(row.image_url) ||
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    description,
    price: accountValue,
    hourlyPrice: hourly,
    dailyPrice: daily,
    nightPrice: Math.round(hourly * 2.5),
    weeklyPrice: Number(row.weekly_price) || daily * 5,
    monthlyPrice: Number(row.period_price) || accountValue,
    periodPrice: Number(row.period_price) || accountValue,
    periodUnit: row.period_unit || (isVip ? " / Giờ" : " / ∞"),
    accountValue,
    priceDisplayType: row.price_display_type || (isVip ? "HOURLY" : "LONG_TERM"),
    customPrice: row.custom_price ? Number(row.custom_price) : undefined,
    customPriceUnit: row.custom_price_unit || undefined,
    mainChibi,
    allChibi,
    mainArena,
    allArenas,
    totalLittleLegends: allChibi.length || (isVip ? 12 : 1),
    totalArenas: allArenas.length || (isVip ? 4 : 1),
    totalBooms: 5,
    features,
    rankBadge: row.rank || (isVip ? "VIP PRO" : "UNRANKED"),
    durationLabel: isVip ? "Thuê Theo Giờ / Ngày" : "Thuê Lâu Dài (Full Sở Hữu)",
  };
}

/**
 * Chuyển đổi fallback data VIP
 */
function transformVipFallback(item: TFTRentalAccount): UnifiedProductAccount {
  const { rankColor, rankBadgeBg } = getRankTheme(item.rank);
  return {
    id: item.id,
    code: item.code,
    type: "VIP",
    title: item.title,
    rank: item.rank,
    rankColor,
    rankBadgeBg,
    status: item.status,
    rentedUntil: item.rentedUntil,
    thumbnail: item.thumbnail,
    description: item.description,
    price: item.accountValue,
    hourlyPrice: item.hourlyPrice,
    dailyPrice: item.dailyPrice,
    nightPrice: item.nightPrice,
    accountValue: item.accountValue || 850000,
    periodPrice: item.periodPrice,
    periodUnit: item.periodUnit || " / Giờ",
    priceDisplayType: item.priceDisplayType || "HOURLY",
    customPrice: item.customPrice,
    customPriceUnit: item.customPriceUnit,
    mainChibi: item.mainChibi,
    allChibi: item.allChibi || [item.mainChibi],
    mainArena: item.mainArena,
    allArenas: item.allArenas || [item.mainArena],
    totalLittleLegends: item.totalLittleLegends,
    totalArenas: item.totalArenas,
    totalBooms: item.totalBooms,
    tag: item.tag,
    features: [
      `Tướng Tí Nị HOT: ${item.mainChibi}`,
      `Sân Đấu: ${item.mainArena}`,
      "Cam kết Riot ID chính chủ 100%",
      "Bàn giao siêu tốc 30 giây",
    ],
    rankBadge: item.rank,
    durationLabel: "Thuê Theo Giờ / Ngày",
  };
}

/**
 * Chuyển đổi fallback data Clone
 */
function transformCloneFallback(item: TFTCloneAccount): UnifiedProductAccount {
  const { rankColor, rankBadgeBg } = getRankTheme(item.rankBadge);
  const price = Number(item.price) || Number(item.periodPrice) || 150000;
  return {
    id: item.id,
    code: item.code,
    type: "CLONE",
    title: item.title,
    rank: item.rankBadge || "UNRANKED",
    rankColor,
    rankBadgeBg,
    status: item.status,
    rentedUntil: item.rentedUntil,
    thumbnail: item.thumbnail,
    description: item.description,
    price,
    hourlyPrice: Number(item.hourlyPrice) || 10000,
    dailyPrice: Number(item.dailyPrice) || 25000,
    nightPrice: Number(item.nightPrice) || 20000,
    weeklyPrice: Number(item.weeklyPrice) || 50000,
    monthlyPrice: price,
    periodPrice: item.periodPrice || price,
    periodUnit: item.periodUnit || " / ∞",
    accountValue: price,
    priceDisplayType: item.priceDisplayType || "LONG_TERM",
    customPrice: item.customPrice,
    customPriceUnit: item.customPriceUnit,
    allChibi: [],
    allArenas: [],
    features: item.features || [
      "Tài Khoản An Toàn 100%",
      "Hỗ Trợ Bàn Giao Thông Về Khách",
      "Sẵn Sản Phẩm Như Mô Tả 100%",
    ],
    rankBadge: item.rankBadge,
    durationLabel: item.durationLabel || "Thuê Lâu Dài (Full Sở Hữu)",
  };
}

/**
 * Lấy toàn bộ danh sách tài khoản (từ Supabase DB hoặc Fallback)
 */
export async function getAllProductAccounts(): Promise<UnifiedProductAccount[]> {
  const vips = TFT_RENTAL_ACCOUNTS.map(transformVipFallback);
  const clones = TFT_CLONE_ACCOUNTS.map(transformCloneFallback);
  const staticAll = [...vips, ...clones];

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbAccounts = data.map((row: AccountDbRow, idx: number) => transformDbRowToUnified(row, idx));
      const existingCodes = new Set(dbAccounts.map((a) => normalizeAccountCode(a.code)));
      const existingIds = new Set(dbAccounts.map((a) => a.id.toLowerCase()));
      
      const uniqueFallbacks = staticAll.filter(
        (f) => !existingCodes.has(normalizeAccountCode(f.code)) && !existingIds.has(f.id.toLowerCase())
      );

      return [...dbAccounts, ...uniqueFallbacks];
    }
  } catch (e) {
    console.warn("Lỗi khi load accounts từ Supabase trong getAllProductAccounts:", e);
  }

  return staticAll;
}

/**
 * Tìm kiếm tài khoản thông minh theo ID, Mã số đầy đủ ("MS: 8899"), Mã rút gọn ("8899", "clone-01"), hoặc Alias ("vip-01", "vip-1", "1")
 */
export async function getAccountByIdOrSlug(identifier: string): Promise<UnifiedProductAccount | null> {
  if (!identifier) return null;

  const rawDecoded = decodeURIComponent(identifier).trim();
  const normalizedSearch = normalizeAccountCode(rawDecoded);
  const allAccounts = await getAllProductAccounts();

  if (!allAccounts || allAccounts.length === 0) return null;

  // 1. Tìm theo exact ID (case-insensitive)
  let match = allAccounts.find(
    (a) => a.id.toLowerCase() === rawDecoded.toLowerCase()
  );
  if (match) return match;

  // 2. Tìm theo exact Code (case-insensitive)
  match = allAccounts.find(
    (a) => a.code.toLowerCase() === rawDecoded.toLowerCase()
  );
  if (match) return match;

  // 3. Tìm theo Code sau khi gọt bỏ "MS: "
  const rawWithoutMs = rawDecoded.replace(/^ms[\s\-:_]*/i, "").trim().toLowerCase();
  if (rawWithoutMs) {
    match = allAccounts.find((a) => {
      const codeWithoutMs = a.code.replace(/^ms[\s\-:_]*/i, "").trim().toLowerCase();
      return codeWithoutMs === rawWithoutMs;
    });
    if (match) return match;
  }

  // 4. Tìm theo normalized code (loại bỏ toàn bộ ký tự đặc biệt)
  if (normalizedSearch) {
    match = allAccounts.find((a) => {
      const normCode = normalizeAccountCode(a.code);
      const normId = normalizeAccountCode(a.id);
      return normCode === normalizedSearch || normId === normalizedSearch;
    });
    if (match) return match;
  }

  // 5. Smart Alias: /acc/vip-01, /acc/vip-1, /acc/rent-1 -> Lấy acc VIP thứ N
  const vipAliasMatch = rawDecoded.match(/^(?:vip|rent)[\-_]?0*(\d+)$/i);
  if (vipAliasMatch) {
    const idx = parseInt(vipAliasMatch[1], 10) - 1;
    const vipList = allAccounts.filter((a) => a.type === "VIP");
    if (idx >= 0 && idx < vipList.length) {
      return vipList[idx];
    }
    if (vipList.length > 0) {
      return vipList[0];
    }
  }

  // 6. Smart Alias: /acc/clone-01, /acc/clone-1 -> Lấy acc Clone thứ N
  const cloneAliasMatch = rawDecoded.match(/^clone[\-_]?0*(\d+)$/i);
  if (cloneAliasMatch) {
    const idx = parseInt(cloneAliasMatch[1], 10) - 1;
    const cloneList = allAccounts.filter((a) => a.type === "CLONE");
    if (idx >= 0 && idx < cloneList.length) {
      return cloneList[idx];
    }
    if (cloneList.length > 0) {
      return cloneList[0];
    }
  }

  // 7. Số thứ tự đơn thuần: /acc/1, /acc/2, /acc/01
  const numberMatch = rawDecoded.match(/^0*(\d+)$/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10);
    // Ưu tiên tìm acc có code chứa số đó (VD: 598 -> MS: 598)
    const byCodeNumber = allAccounts.find((a) => {
      const codeDigits = a.code.replace(/[^0-9]/g, "");
      return codeDigits === String(num);
    });
    if (byCodeNumber) return byCodeNumber;

    // Nếu là số nhỏ (1, 2, 3...) thì lấy acc thứ N trong danh sách
    if (num >= 1 && num <= allAccounts.length) {
      return allAccounts[num - 1];
    }
  }

  // 8. Tìm kiếm substring trong mã code hoặc tiêu đề
  if (normalizedSearch && normalizedSearch.length >= 2) {
    match = allAccounts.find((a) => {
      const normCode = normalizeAccountCode(a.code);
      const normTitle = normalizeAccountCode(a.title);
      return normCode.includes(normalizedSearch) || normTitle.includes(normalizedSearch);
    });
    if (match) return match;
  }

  // Fallback an toàn: Nếu vẫn không tìm thấy, trả về tài khoản đầu tiên để không bao giờ bị đứt link
  return allAccounts[0] || null;
}

/**
 * Helper tính điểm tương đồng giữa hai tài khoản TFT (loại acc, Chibi, Sân đấu, Rank, Giá)
 */
function calculateSimilarityScore(
  current: UnifiedProductAccount,
  candidate: UnifiedProductAccount
): number {
  let score = 0;

  // 1. Cùng loại tài khoản (VIP với VIP, Clone với Clone): +50 điểm
  if (current.type === candidate.type) {
    score += 50;
  } else {
    // Khác loại thì trừ điểm lớn để ưu tiên tuyệt đối cùng kho
    score -= 40;
  }

  // 2. Trùng Tướng Tí Nị (Chibis): +35 điểm cho mỗi Tí Nị trùng nhau
  const currentChibis = (current.allChibi || []).map((c) => c.toLowerCase().trim()).filter(Boolean);
  const candidateChibis = (candidate.allChibi || []).map((c) => c.toLowerCase().trim()).filter(Boolean);
  if (currentChibis.length > 0 && candidateChibis.length > 0) {
    const sharedChibis = currentChibis.filter((c) =>
      candidateChibis.some((cc) => cc.includes(c) || c.includes(cc))
    );
    score += sharedChibis.length * 35;
  }

  // 3. Trùng Sân Đấu (Arenas): +25 điểm cho mỗi Sân Đấu trùng nhau
  const currentArenas = (current.allArenas || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  const candidateArenas = (candidate.allArenas || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (currentArenas.length > 0 && candidateArenas.length > 0) {
    const sharedArenas = currentArenas.filter((a) =>
      candidateArenas.some((ca) => ca.includes(a) || a.includes(ca))
    );
    score += sharedArenas.length * 25;
  }

  // 4. Bậc Rank:
  const rankCurr = (current.rank || "").toUpperCase();
  const rankCand = (candidate.rank || "").toUpperCase();
  if (rankCurr && rankCand) {
    if (rankCurr === rankCand) {
      score += 30;
    } else {
      // Nhóm rank cao cấp: Thách Đấu, Đại Cao Thủ, Cao Thủ
      const highTiers = ["THÁCH ĐẤU", "ĐẠI CAO THỦ", "CAO THỦ"];
      const midTiers = ["KIM CƯƠNG", "LỤC BẢO", "BẠCH KIM", "VÀNG"];
      const isCurrHigh = highTiers.some((t) => rankCurr.includes(t));
      const isCandHigh = highTiers.some((t) => rankCand.includes(t));
      const isCurrMid = midTiers.some((t) => rankCurr.includes(t));
      const isCandMid = midTiers.some((t) => rankCand.includes(t));

      if ((isCurrHigh && isCandHigh) || (isCurrMid && isCandMid)) {
        score += 18;
      }
    }
  }

  // 5. Tương đồng về tầm giá (Hourly hoặc Full Giá)
  const priceCurr = current.hourlyPrice || current.price || 15000;
  const priceCand = candidate.hourlyPrice || candidate.price || 15000;
  const priceDiffRatio = Math.abs(priceCurr - priceCand) / Math.max(priceCurr, 1);
  if (priceDiffRatio < 0.25) {
    score += 15;
  } else if (priceDiffRatio < 0.5) {
    score += 8;
  }

  // 6. Ưu tiên tài khoản đang SẴN SÀNG (AVAILABLE) hơn RENTED
  if (candidate.status === "AVAILABLE") {
    score += 6;
  }

  return score;
}

/**
 * Lấy danh sách tài khoản liên quan / tương tự dựa trên điểm số tương đồng thông minh
 */
export async function getRelatedAccounts(
  currentId: string,
  limit = 4
): Promise<UnifiedProductAccount[]> {
  const all = await getAllProductAccounts();
  const normalizedSearch = normalizeAccountCode(currentId);
  const current = all.find(
    (a) =>
      a.id === currentId ||
      a.code === currentId ||
      normalizeAccountCode(a.code) === normalizedSearch ||
      normalizeAccountCode(a.id) === normalizedSearch
  );

  const filtered = all.filter(
    (a) => a.id !== current?.id && a.code !== current?.code
  );

  if (!current) {
    return filtered.slice(0, limit);
  }

  // Tính điểm tương đồng và sắp xếp giảm dần
  const scored = filtered.map((candidate) => ({
    account: candidate,
    score: calculateSimilarityScore(current, candidate),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.account);
}
