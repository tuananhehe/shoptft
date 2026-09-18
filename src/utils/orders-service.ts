/**
 * Service Quản Lý Đơn Hàng & Thuê Tài Khoản
 * ShopTFT Mobile - Tuấn Thái Bình
 */

export type OrderType = "VIP" | "CLONE" | "SERVICE" | "COACHING";
export type OrderStatus = "RENTING" | "COMPLETED" | "EXPIRED" | "CANCELLED";
export type OrderCreator = "ADMIN" | "CUSTOMER" | "ZALO";

export interface OrderItem {
  id: string; // "ORD-9821"
  type: OrderType;
  customer: string; // Mặc định: "Khách hàng ẩn danh"
  deliveredBy?: string; // Mặc định: "Admin"
  phoneZalo?: string;
  accountCode: string;
  accountTitle: string;
  package: string;
  durationHours?: number; // Số giờ thuê (-1: Vô cực ∞)
  amount: number;
  paymentMethod?: "TRANSFER" | "MOMO" | "ZALO_PAY" | "CARD" | "CASH";
  status: OrderStatus;
  createdBy?: OrderCreator; // Mặc định: "ADMIN" (Đơn do Admin tạo)
  source?: "ADMIN" | "WEB_ORDER" | "ZALO";
  createdAt: string; // ISO string
  startedAt?: string; // ISO string ("Ngày cho thuê")
  expiresAt?: string | null; // ISO string ("Ngày kết thúc")
  accountLogin: string;
  accountPass: string;
  notes?: string;
}

export interface OrdersStats {
  totalRevenue: number;
  totalOrders: number;
  rentingOrders: number;
  completedOrders: number;
  expiredOrders: number;
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
 * Lấy danh sách toàn bộ đơn hàng
 */
export async function getOrders(): Promise<{ success: boolean; data: OrderItem[]; stats: OrdersStats; error?: string }> {
  try {
    const res = await fetch("/api/orders", {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        data: [],
        stats: { totalRevenue: 0, totalOrders: 0, rentingOrders: 0, completedOrders: 0, expiredOrders: 0 },
        error: errJson.error || "Không thể tải danh sách đơn hàng",
      };
    }

    const json = await res.json();
    return {
      success: true,
      data: json.data || [],
      stats: json.stats || { totalRevenue: 0, totalOrders: 0, rentingOrders: 0, completedOrders: 0, expiredOrders: 0 },
    };
  } catch (err: any) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);
    return {
      success: false,
      data: [],
      stats: { totalRevenue: 0, totalOrders: 0, rentingOrders: 0, completedOrders: 0, expiredOrders: 0 },
      error: err.message || "Lỗi kết nối máy chủ",
    };
  }
}

/**
 * Tạo mới đơn hàng (Người nhận mặc định là "Khách hàng ẩn danh", người giao mặc định là "Admin")
 */
export async function createOrder(
  payload: Omit<OrderItem, "id" | "createdAt"> & { id?: string }
): Promise<{ success: boolean; data?: OrderItem; error?: string }> {
  try {
    const enrichedPayload = {
      ...payload,
      customer: payload.customer?.trim() || "Khách hàng ẩn danh",
      deliveredBy: payload.deliveredBy?.trim() || "Admin",
      startedAt: payload.startedAt || new Date().toISOString(),
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(enrichedPayload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể tạo đơn hàng!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ khi tạo đơn!" };
  }
}

/**
 * Cập nhật đơn hàng
 */
export async function updateOrder(
  id: string,
  updates: Partial<OrderItem>
): Promise<{ success: boolean; data?: OrderItem; error?: string }> {
  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể cập nhật đơn hàng!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ khi cập nhật đơn!" };
  }
}

/**
 * Xóa đơn hàng
 */
export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể xóa đơn hàng!" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ khi xóa đơn!" };
  }
}

/**
 * Gia hạn thời gian thuê của đơn hàng
 */
export async function extendOrder(
  id: string,
  extraHours: number,
  extraPrice: number
): Promise<{ success: boolean; data?: OrderItem; error?: string }> {
  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}&action=extend`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ extraHours, extraPrice }),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể gia hạn đơn hàng!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ khi gia hạn đơn!" };
  }
}

/**
 * Đổi mật khẩu tài khoản và cập nhật vào đơn hàng
 */
export function generateRandomPassword(prefix = "TuanTFT@"): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${digits}`;
}

/**
 * Định dạng thời gian đếm ngược thuê còn lại
 */
export function getRentalTimeRemaining(expiresAt?: string | null): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  formatted: string;
  hoursLeft: number;
} {
  if (!expiresAt) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      formatted: "Vô Cực ∞",
      hoursLeft: 999999,
    };
  }

  const expireTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expireTime - now;

  if (diffMs <= 0) {
    const overdueMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
    if (overdueMinutes < 60) {
      return {
        isExpired: true,
        isExpiringSoon: false,
        formatted: `Quá hạn ${overdueMinutes}p`,
        hoursLeft: 0,
      };
    }
    const overdueHours = Math.floor(overdueMinutes / 60);
    return {
      isExpired: true,
      isExpiringSoon: false,
      formatted: `Quá hạn ${overdueHours}h`,
      hoursLeft: 0,
    };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);

  const isExpiringSoon = diffMs <= 60 * 60 * 1000; // Còn dưới 1 tiếng

  let formatted = "";
  if (days > 0) {
    formatted = `Còn ${days} ngày ${hours % 24}h`;
  } else if (hours > 0) {
    formatted = `Còn ${hours}h ${minutes}p`;
  } else {
    formatted = `Còn ${minutes} phút`;
  }

  return {
    isExpired: false,
    isExpiringSoon,
    formatted,
    hoursLeft: hours,
  };
}

/**
 * Format ngày giờ theo chuẩn tiếng Việt DD/MM/YYYY HH:mm
 */
export function formatOrderDateTime(isoString?: string | null): string {
  if (!isoString) return "Chưa xác định";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Chưa xác định";
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "Chưa xác định";
  }
}

/**
 * Tạo tin nhắn Zalo chuẩn bàn giao thông tin theo loại đơn
 */
export function buildDeliveryMessage(ord: OrderItem): string {
  const customerName = ord.customer || "Khách hàng ẩn danh";
  const deliverer = ord.deliveredBy || "Admin";
  const startedStr = ord.startedAt
    ? formatOrderDateTime(ord.startedAt)
    : "Bắt đầu ngay";
  const expiryStr = ord.expiresAt
    ? formatOrderDateTime(ord.expiresAt)
    : "Full Sở Hữu Vô Cực ∞";

  if (ord.type === "CLONE") {
    return `[BÀN GIAO TOÀN QUYỀN ACC CLONE ĐTCL - TUẤN THÁI BÌNH]
Xin chào ${customerName}, Shop bàn giao bạn thông tin tài khoản:
━━━━━━━━━━━━━━━━━━━━━━━
👑 Mã Đơn Hàng: ${ord.id}
🛡️ Người Giao: ${deliverer}
👤 Người Nhận: ${customerName}
🎮 Mã Tài Khoản: ${ord.accountCode} - ${ord.accountTitle}
👤 Riot ID / Login: ${ord.accountLogin}
🔑 Mật Khẩu: ${ord.accountPass}
💰 Gói: ${ord.package} (Full Sở Hữu Trọn Đời ∞)
📅 Ngày Cho Thuê: ${startedStr}
⏳ Ngày Kết Thúc: ${expiryStr}
━━━━━━━━━━━━━━━━━━━━━━━
📌 HƯỚNG DẪN BẢO MẬT:
1. Đăng nhập tại https://account.riotgames.com
2. Đổi ngay Mật Khẩu và liên kết Email cá nhân của bạn.
3. Kích hoạt bảo mật 2 lớp (2FA).
🛡️ Cam kết: Tài khoản sạch 100%, bảo hành trọn đời từ Tuấn Thái Bình (Quỹ 30M Checkscam).`;
  }

  if (ord.type === "SERVICE" || ord.type === "COACHING") {
    return `[XÁC NHẬN ĐƠN DỊCH VỤ ĐTCL - TUẤN THÁI BÌNH]
Xin chào ${customerName}, đơn dịch vụ của bạn đã được tiếp nhận:
━━━━━━━━━━━━━━━━━━━━━━━
⭐ Mã Đơn: ${ord.id}
🛡️ Người Giao: ${deliverer}
👤 Người Nhận: ${customerName}
🏆 Dịch Vụ: ${ord.accountTitle} (${ord.package})
💵 Tổng Phí: ${ord.amount.toLocaleString("vi-VN")}đ
📅 Ngày Bắt Đầu: ${startedStr}
${ord.accountLogin ? `🎙️ Kênh Voice / Phòng Học: ${ord.accountLogin}` : ""}
${ord.accountPass ? `🔑 Mã Phòng / Pass: ${ord.accountPass}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━
📞 Tuấn Thái Bình sẽ trực tiếp liên hệ và bắt đầu dịch vụ cho bạn ngay bây giờ!`;
  }

  // Mặc định: Đơn thuê Acc VIP
  return `[BÀN GIAO TÀI KHOẢN THUÊ TFT VIP - TUẤN THÁI BÌNH]
Xin chào ${customerName}, Shop gửi bạn thông tin tài khoản trải nghiệm:
━━━━━━━━━━━━━━━━━━━━━━━
⭐ Mã Đơn Hàng: ${ord.id}
🛡️ Người Giao: ${deliverer}
👤 Người Nhận: ${customerName}
✨ Tài Khoản: ${ord.accountCode} (${ord.accountTitle})
👤 Riot ID / Login: ${ord.accountLogin}
🔑 Mật Khẩu: ${ord.accountPass}
⏰ Gói Thuê: ${ord.package}
📅 Ngày Cho Thuê: ${startedStr}
⏳ Ngày Kết Thúc (Hạn Trả): ${expiryStr}
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ LƯU Ý KHI THUÊ:
- Vui lòng KHÔNG tự ý đổi mật khẩu / email của shop.
- KHÔNG sử dụng phần mềm thứ ba hoặc cố tình phá rank.
- Hỗ trợ đổi acc / gia hạn / nâng cấp sở hữu bù 70% qua Zalo 0352.867.283.
🛡️ Shop bảo hành 100% suốt thời gian bạn thuê! Chúc bạn leo rank vui vẻ!`;
}

/**
 * Helper xác định chính xác Gói Thuê, Số Giờ Thuê và Giá Tiền dựa trên cấu hình trong Quản Lý Acc & Supabase
 */
export function determinePackageFromAccount(
  acc: any,
  existingOrder?: Partial<OrderItem>
): { packageName: string; durationHours: number; amount: number } {
  const accountValue = Number(acc.price) || Number(acc.period_price) || Number(acc.accountValue) || 850000;
  const rentedUntilStr = existingOrder?.expiresAt || acc.rented_until;
  const rentedUntil = rentedUntilStr ? new Date(rentedUntilStr) : null;
  const startedAtStr = existingOrder?.startedAt || existingOrder?.createdAt || acc.created_at;
  const startedAt = startedAtStr ? new Date(startedAtStr) : new Date("2026-09-01");

  // 1. Tài khoản Clone / Smurf
  if (acc.type === "CLONE") {
    const clonePrice = Number(acc.price) || Number(acc.period_price) || Number(acc.monthly_price) || 150000;
    return {
      packageName: "Gói Thuê Lâu Dài (Bàn Giao Full Thông Tin)",
      durationHours: -1,
      amount: clonePrice,
    };
  }

  // 2. Tài khoản VIP có giá tùy chỉnh (CUSTOM)
  if (acc.price_display_type === "CUSTOM" && acc.custom_price && Number(acc.custom_price) > 0) {
    return {
      packageName: `Gói Tùy Chỉnh (${acc.custom_price_unit || "Theo yêu cầu"})`,
      durationHours: 24,
      amount: Number(acc.custom_price),
    };
  }

  // 3. Nếu Admin thiết lập hiển thị THEO GIỜ (HOURLY)
  if (acc.price_display_type === "HOURLY") {
    const hourly = Number(acc.hourly_price) > 0
      ? Number(acc.hourly_price)
      : Math.round((((accountValue * 0.03) + 20000) / 2) / 1000) * 1000;
    
    let hours = 2;
    if (rentedUntil && !isNaN(rentedUntil.getTime())) {
      const diffMs = Math.max(0, rentedUntil.getTime() - startedAt.getTime());
      const calcHours = Math.round(diffMs / (3600 * 1000));
      if (calcHours > 0 && calcHours <= 24) hours = calcHours;
    }
    const amount = (hourly * hours) + 20000;
    return {
      packageName: `Gói ${hours} Giờ (Trải Nghiệm Nhanh)`,
      durationHours: hours,
      amount: Math.round(amount / 1000) * 1000,
    };
  }

  // 4. Nếu Admin thiết lập hiển thị THEO NGÀY (DAILY)
  if (acc.price_display_type === "DAILY") {
    const daily = Number(acc.daily_price) > 0
      ? Number(acc.daily_price)
      : Math.round((((accountValue * 0.12) + 20000) / 2) / 1000) * 1000;
    return {
      packageName: "Gói 24 Giờ (1 Ngày VIP)",
      durationHours: 24,
      amount: daily,
    };
  }

  // 5. Nếu Admin thiết lập hiển thị LÂU DÀI (LONG_TERM)
  if (acc.price_display_type === "LONG_TERM") {
    const periodPrice = Number(acc.period_price) > 0
      ? Number(acc.period_price)
      : accountValue;
    return {
      packageName: "Gói Thuê Lâu Dài (Vô Cực ∞)",
      durationHours: -1,
      amount: periodPrice,
    };
  }

  // 6. Trường hợp AUTO (Tự động tính theo thời hạn thuê rented_until thực tế)
  if (rentedUntil && !isNaN(rentedUntil.getTime())) {
    const endYear = rentedUntil.getFullYear();
    const diffMs = Math.max(0, rentedUntil.getTime() - startedAt.getTime());
    const diffHours = diffMs / (3600 * 1000);
    const diffDays = Math.round(diffMs / (24 * 3600 * 1000));

    // Thuê Lâu Dài (Vô Cực ∞) nếu hết hạn >= 2028 hoặc period_unit chứa ∞
    if (endYear >= 2028 || acc.period_unit?.includes("∞")) {
      return {
        packageName: "Gói Thuê Lâu Dài (Vô Cực ∞)",
        durationHours: -1,
        amount: accountValue,
      };
    }

    // Thuê 30 Ngày (1 Tháng VIP)
    if (diffDays >= 16) {
      const monthAmount = Math.round((accountValue * 0.30) / 1000) * 1000;
      return {
        packageName: "Gói 30 Ngày (1 Tháng VIP)",
        durationHours: 720,
        amount: monthAmount,
      };
    }

    // Thuê 7 Ngày (1 Tuần VIP)
    if (diffDays >= 4) {
      const weekAmount = Number(acc.weekly_price) > 0
        ? Number(acc.weekly_price)
        : Math.round((accountValue * 0.12) / 1000) * 1000 + 20000;
      return {
        packageName: "Gói 7 Ngày (Tiết Kiệm VIP)",
        durationHours: 168,
        amount: weekAmount,
      };
    }

    // Thuê 12 Giờ (Qua Đêm VIP)
    if (diffHours >= 8 && diffHours < 16) {
      const hourly = Number(acc.hourly_price) > 0
        ? Number(acc.hourly_price)
        : Math.round((((accountValue * 0.03) + 20000) / 2) / 1000) * 1000;
      return {
        packageName: "Gói 12 Giờ (Qua Đêm VIP)",
        durationHours: 12,
        amount: Math.round((hourly * 2.5) / 1000) * 1000 + 20000,
      };
    }

    // Thuê 24 Giờ (1 Ngày VIP)
    if (diffHours >= 16) {
      const dailyAmount = Number(acc.daily_price) > 0
        ? Number(acc.daily_price)
        : Math.round((((accountValue * 0.12) + 20000) / 2) / 1000) * 1000;
      return {
        packageName: "Gói 24 Giờ (1 Ngày VIP)",
        durationHours: 24,
        amount: dailyAmount,
      };
    }

    // Thuê theo Giờ (2 Giờ / 4 Giờ)
    const hoursCount = Math.max(2, Math.round(diffHours) || 2);
    const hourly = Number(acc.hourly_price) > 0
      ? Number(acc.hourly_price)
      : Math.round((((accountValue * 0.03) + 20000) / 2) / 1000) * 1000;
    const hourAmount = (hourly * hoursCount) + 20000;
    return {
      packageName: `Gói ${hoursCount} Giờ (Trải Nghiệm Nhanh)`,
      durationHours: hoursCount,
      amount: Math.round(hourAmount / 1000) * 1000,
    };
  }

  return {
    packageName: "Gói Thuê Lâu Dài (Vô Cực ∞)",
    durationHours: -1,
    amount: accountValue,
  };
}

