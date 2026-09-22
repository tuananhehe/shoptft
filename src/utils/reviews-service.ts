/**
 * Service Quản Lý Đánh Giá & Góp Ý Từ Khách Hàng (Google Login & Web)
 * ShopTFT Mobile - Tuấn Thái Bình
 */

export interface CustomerReviewItem {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerAvatar?: string;
  customerZalo?: string;
  vipTier?: string; // "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "CHALLENGER"
  rating: number; // 1 to 5
  category: "THUE_ACC" | "CAY_THUE" | "COACHING" | "GDTG" | "ALL";
  accountBought: string;
  comment: string;
  improvementSuggestion?: string;
  verifiedTag: string; // "Đã Thuê VIP" | "Đã Xác Thực Google" | "Khách VIP"
  isApproved: boolean; // Được duyệt hiển thị công khai trang chủ
  isGoogleUser: boolean;
  adminReply?: string;
  adminReplyAt?: string;
  createdAt: string; // ISO string
  date: string; // "22/09/2026"
}

export interface ReviewsResponse {
  success: boolean;
  data: CustomerReviewItem[];
  total: number;
  avgRating: number;
  ratingBreakdown?: Record<number, number>;
  error?: string;
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
 * Lấy danh sách đánh giá (Khách xem các đánh giá đã duyệt, Admin xem toàn bộ)
 */
export async function getReviewsApi(isAdmin = false): Promise<ReviewsResponse> {
  try {
    const url = isAdmin ? "/api/reviews?admin=true" : "/api/reviews";
    const res = await fetch(url, {
      method: "GET",
      headers: isAdmin ? getAuthHeaders() : { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, data: [], total: 0, avgRating: 5.0, error: err.error || "Không thể tải đánh giá" };
    }

    const json = await res.json();
    return {
      success: true,
      data: json.data || [],
      total: json.total || 0,
      avgRating: json.avgRating || 5.0,
      ratingBreakdown: json.ratingBreakdown,
    };
  } catch (err: any) {
    return { success: false, data: [], total: 0, avgRating: 5.0, error: err.message || "Lỗi kết nối máy chủ" };
  }
}

/**
 * Gửi đánh giá mới từ khách hàng
 */
export async function submitReviewApi(
  payload: Omit<CustomerReviewItem, "id" | "createdAt" | "date" | "isApproved">
): Promise<{ success: boolean; data?: CustomerReviewItem; message?: string; error?: string }> {
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Không thể gửi đánh giá" };
    }

    return { success: true, data: json.data, message: json.message };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ" };
  }
}

/**
 * Admin cập nhật trạng thái đánh giá (Duyệt/Ẩn, Trả lời)
 */
export async function updateReviewStatusApi(
  id: string,
  updates: Partial<CustomerReviewItem>
): Promise<{ success: boolean; data?: CustomerReviewItem; error?: string }> {
  try {
    const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Không thể cập nhật đánh giá" };
    }

    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ" };
  }
}

/**
 * Admin xóa đánh giá
 */
export async function deleteReviewApi(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Không thể xóa đánh giá" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ" };
  }
}
