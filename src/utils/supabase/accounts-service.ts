import { TFTRentalAccount, TFTCloneAccount } from "@/data/tft-data";

export interface AccountDbRow {
  id: string;
  code: string;
  type: "VIP" | "CLONE";
  title: string;
  rank: string;
  price?: number;
  hourly_price?: number;
  weekly_price?: number;
  period_price?: number;
  champions?: string[];
  arenas?: string[];
  features?: string[];
  image_url: string;
  status: "AVAILABLE" | "RENTED";
  rented_until?: string | null;
  description?: string | null;
  created_at?: string;
}

// Helper xác định màu sắc rank an toàn
const getRankColors = (rankStr?: string | null) => {
  const str = (rankStr || "").toUpperCase();
  if (str.includes("THÁCH ĐẤU")) {
    return {
      rankColor: "text-amber-600",
      rankBadgeBg: "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-500/30 text-amber-600",
    };
  }
  if (str.includes("ĐẠI CAO THỦ")) {
    return {
      rankColor: "text-rose-600",
      rankBadgeBg: "bg-rose-50 border-rose-200 text-rose-600",
    };
  }
  if (str.includes("CAO THỦ")) {
    return {
      rankColor: "text-purple-600",
      rankBadgeBg: "bg-purple-50 border-purple-200 text-purple-600",
    };
  }
  if (str.includes("KIM CƯƠNG")) {
    return {
      rankColor: "text-sky-600",
      rankBadgeBg: "bg-sky-50 border-sky-200 text-sky-600",
    };
  }
  if (str.includes("LỤC BẢO")) {
    return {
      rankColor: "text-emerald-600",
      rankBadgeBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
    };
  }
  if (str.includes("VÀNG") || str.includes("BẠCH KIM")) {
    return {
      rankColor: "text-amber-600",
      rankBadgeBg: "bg-amber-50 border-amber-200 text-amber-700",
    };
  }
  if (str.includes("BẠC")) {
    return {
      rankColor: "text-slate-600",
      rankBadgeBg: "bg-slate-100 border-slate-300 text-slate-700",
    };
  }
  if (str.includes("ĐỒNG") || str.includes("SẮT")) {
    return {
      rankColor: "text-amber-800",
      rankBadgeBg: "bg-amber-100/60 border-amber-300 text-amber-800",
    };
  }
  if (str.includes("KHÔNG RANK") || str.includes("UNRANKED")) {
    return {
      rankColor: "text-slate-500",
      rankBadgeBg: "bg-slate-100 border-slate-200 text-slate-600",
    };
  }
  return {
    rankColor: "text-amber-600",
    rankBadgeBg: "bg-amber-50 border-amber-200 text-amber-600",
  };
};

/**
 * Chuyển đổi Date sang định dạng YYYY-MM-DDTHH:mm theo giờ địa phương (local timezone Việt Nam)
 * Dùng cho thẻ <input type="datetime-local">
 */
export const toLocalDatetimeInputString = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Helper tính toán thông tin hết hạn và đếm ngược thời gian cho acc đang thuê
 */
export const formatRentalExpiry = (rentedUntil?: string | null) => {
  if (!rentedUntil) {
    return {
      remainingSec: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isInfinite: false,
      expiryFormatted: "Đang cập nhật",
      shortCountdown: "Đang thuê",
    };
  }
  try {
    const endMs = new Date(rentedUntil).getTime();
    if (isNaN(endMs)) {
      return {
        remainingSec: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isInfinite: false,
        expiryFormatted: "Đang cập nhật",
        shortCountdown: "Đang thuê",
      };
    }
    const nowMs = Date.now();
    const remainingSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
    const days = Math.floor(remainingSec / (24 * 3600));
    const hours = Math.floor((remainingSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((remainingSec % 3600) / 60);
    const seconds = remainingSec % 60;

    const endDate = new Date(rentedUntil);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const endHours = pad(endDate.getHours());
    const endMins = pad(endDate.getMinutes());
    const endDay = pad(endDate.getDate());
    const endMonth = pad(endDate.getMonth() + 1);
    const endYear = endDate.getFullYear();

    const isInfinite = days > 365;

    return {
      remainingSec,
      days,
      hours,
      minutes,
      seconds,
      isInfinite,
      expiryFormatted: isInfinite
        ? "Vô Cực (Thuê Lâu Dài)"
        : `${endHours}:${endMins}, ${endDay}/${endMonth}/${endYear}`,
      shortCountdown: isInfinite
        ? "Vô Cực ∞"
        : days > 0
        ? `Còn ${days}N ${hours}H`
        : remainingSec > 0
        ? `Còn ${hours}H ${minutes}P`
        : "Đang cập nhật",
    };
  } catch {
    return {
      remainingSec: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isInfinite: false,
      expiryFormatted: "Đang cập nhật",
      shortCountdown: "Đang thuê",
    };
  }
};

/**
 * Gọi GET /api/accounts để lấy danh sách từ Database
 */
export async function getVipAndCloneAccounts(): Promise<{
  vipAccounts: TFTRentalAccount[];
  cloneAccounts: TFTCloneAccount[];
}> {
  try {
    const res = await fetch("/api/accounts", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Lỗi fetch /api/accounts:", res.statusText);
      return { vipAccounts: [], cloneAccounts: [] };
    }

    const result = await res.json();
    const data: AccountDbRow[] = result.data || [];

    if (!data || data.length === 0) {
      return { vipAccounts: [], cloneAccounts: [] };
    }

    const vipRows = data.filter((row: AccountDbRow) => row.type === "VIP");
    const cloneRows = data.filter((row: AccountDbRow) => row.type === "CLONE");

    const vipAccounts: TFTRentalAccount[] = vipRows.map((row: AccountDbRow, idx: number) => {
      const { rankColor, rankBadgeBg } = getRankColors(row.rank || "THÁCH ĐẤU");
      const champions = Array.isArray(row.champions) ? row.champions.filter(Boolean) : [];
      const arenas = Array.isArray(row.arenas) ? row.arenas.filter(Boolean) : [];
      const accountValue = Number(row.price) || 850000;
      const hourly = Number(row.hourly_price) > 0
        ? Number(row.hourly_price)
        : Math.round((((accountValue * 0.03) + 20000) / 2) / 1000) * 1000;
      const daily = Math.round((((accountValue * 0.12) + 20000) / 2) / 1000) * 1000;
      const mainChibi = champions[0] || "Tí Nị Thần Thoại";
      const mainArena = arenas[0] || "Sân Đấu Thần Thoại";

      return {
        id: String(row.id || `vip-${idx}`),
        code: row.code || `MS: ${8800 + idx}`,
        title: row.title || `${row.rank || "VIP"} - ${mainChibi}`,
        mainChibi,
        allChibi: champions.length > 0 ? champions : [mainChibi],
        mainArena,
        allArenas: arenas.length > 0 ? arenas : [mainArena],
        rank: (row.rank as any) || "THÁCH ĐẤU",
        rankColor,
        rankBadgeBg,
        hourlyPrice: hourly,
        dailyPrice: daily,
        nightPrice: Math.round(hourly * 2.5),
        accountValue,
        status: String(row.status || "").toUpperCase() === "RENTED" ? "RENTED" : "AVAILABLE",
        rentedUntil: row.rented_until || null,
        totalLittleLegends: champions.length || 1,
        totalArenas: arenas.length || 1,
        totalBooms: 5,
        thumbnail:
          row.image_url ||
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        description: row.description || "Tài khoản VIP chính chủ.",
      };
    });

    const cloneAccounts: TFTCloneAccount[] = cloneRows.map((row: AccountDbRow, idx: number) => {
      const features = Array.isArray(row.features) && row.features.length > 0
        ? row.features
        : [
            "Đủ tướng cơ bản, vào trận ngay",
            "Hỗ trợ đổi Pass / Bảo hành trọn gói",
            "MMR sạch đẹp, cộng nhiều ĐNG",
          ];
      const price = Number(row.price) || Number(row.period_price) || 150000;

      return {
        id: String(row.id || `clone-${idx}`),
        code: row.code || `CLONE-${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`,
        title: row.title || `Acc Clone ${row.rank || "Unranked"}`,
        rankBadge: row.rank || "UNRANKED",
        status: String(row.status || "").toUpperCase() === "RENTED" ? "RENTED" : "AVAILABLE",
        rentedUntil: row.rented_until || null,
        thumbnail:
          row.image_url ||
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        features,
        price,
        periodPrice: price,
        periodUnit: " / ∞",
        durationLabel: "Thuê Lâu Dài (Bàn Giao Full Thông Tin)",
        weeklyPrice: 0,
        monthlyPrice: price,
        description: row.description || "Tài khoản Clone sạch sẽ, bàn giao full quyền sở hữu.",
      };
    });

    return { vipAccounts, cloneAccounts };
  } catch (err) {
    console.error("Lỗi khi kết nối API /api/accounts:", err);
    return { vipAccounts: [], cloneAccounts: [] };
  }
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("shoptft_admin_token");
    if (token) {
      headers["x-admin-token"] = token;
    }
  }
  return headers;
};

/**
 * Gọi POST /api/accounts để thêm tài khoản mới vào Database
 */
export async function createAccountApi(payload: Partial<AccountDbRow>): Promise<{
  success: boolean;
  data?: AccountDbRow;
  error?: string;
}> {
  try {
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return {
        success: false,
        error: result.error || "Không thể tạo tài khoản!",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Lỗi kết nối máy chủ!",
    };
  }
}

/**
 * Gọi PUT /api/accounts để cập nhật tài khoản trên Database
 */
export async function updateAccountApi(payload: Partial<AccountDbRow>): Promise<{
  success: boolean;
  data?: AccountDbRow;
  error?: string;
}> {
  try {
    const res = await fetch("/api/accounts", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return {
        success: false,
        error: result.error || "Không thể cập nhật tài khoản!",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Lỗi kết nối máy chủ!",
    };
  }
}

/**
 * Gọi DELETE /api/accounts để xóa tài khoản khỏi Database
 */
export async function deleteAccountApi(id?: string, code?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (id) params.append("id", id);
    if (code) params.append("code", code);

    const res = await fetch(`/api/accounts?${params.toString()}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return {
        success: false,
        error: result.error || "Không thể xóa tài khoản!",
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Lỗi kết nối máy chủ!",
    };
  }
}

/**
 * Cập nhật hàng loạt nhiều tài khoản cùng lúc (Batch Update)
 */
export async function bulkUpdateAccountsApi(
  ids: string[],
  updates: Partial<AccountDbRow>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch("/api/accounts", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids, ...updates }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return {
        success: false,
        error: result.error || "Không thể cập nhật hàng loạt!",
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Lỗi kết nối máy chủ!",
    };
  }
}

/**
 * Xóa hàng loạt nhiều tài khoản cùng lúc (Batch Delete)
 */
export async function bulkDeleteAccountsApi(ids: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/accounts?ids=${ids.join(",")}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return {
        success: false,
        error: result.error || "Không thể xóa hàng loạt!",
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Lỗi kết nối máy chủ!",
    };
  }
}
