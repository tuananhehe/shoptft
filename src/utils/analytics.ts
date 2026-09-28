/**
 * ShopTFTMobile - Lightweight Privacy-First Analytics & Conversion Tracking (Phase 8)
 * 
 * Strict Privacy Guidelines:
 * - NEVER send passwords, full names, phone/Zalo numbers, emails, credentials, or admin notes.
 * - Primary Conversion: click_zalo
 * - Safe fail-over: analytics errors NEVER block customer interactions or website performance.
 * - Non-blocking, deferred execution with deduplication and UTM attribution.
 */

export interface TrackClickZaloParams {
  source:
    | "header"
    | "hero"
    | "product_card"
    | "product_detail"
    | "rental_modal"
    | "about"
    | "footer"
    | "floating_chat"
    | "mobile_bottom_bar"
    | "final_cta"
    | "faq"
    | "rental_process"
    | "favorites_modal"
    | string;
  product_id?: string;
  product_type?: "VIP" | "CLONE" | string;
  rental_package?: string;
}

export interface TrackSearchProductParams {
  query: string;
  results_count?: number;
}

export interface TrackApplyFilterParams {
  filter_type: "type" | "pet" | "arena" | "price" | "status" | "sort" | string;
  filter_value: string;
}

export interface TrackViewProductParams {
  product_id: string;
  product_type: "VIP" | "CLONE" | string;
  availability: "AVAILABLE" | "RENTED" | string;
  display_price?: number;
}

export interface TrackOpenRentalModalParams {
  product_id: string;
  product_type: "VIP" | "CLONE" | string;
}

export interface TrackSelectRentalPackageParams {
  product_id: string;
  package_name: string;
  duration_hours?: number;
  price?: number;
}

export interface TrackFavoriteProductParams {
  product_id: string;
  product_type?: string;
  action: "add" | "remove";
}

export interface TrackMemberLoginParams {
  success: boolean;
}

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Global window declaration for gtag
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const UTM_STORAGE_KEY = "tft_utm_session";
const DEDUP_WINDOW_MS = 600; // Deduplication window for identical event + payload

// In-memory cache for sliding duplicate prevention
const recentEventsCache = new Map<string, number>();

/**
 * Trích xuất và duy trì UTM parameters xuyên suốt session người dùng
 * Không lưu vào database khách hàng, chỉ lưu sessionStorage trên trình duyệt.
 */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get("utm_source");
    const medium = searchParams.get("utm_medium");
    const campaign = searchParams.get("utm_campaign");
    const term = searchParams.get("utm_term");
    const content = searchParams.get("utm_content");

    if (source || medium || campaign) {
      const currentUtm: UtmParams = {
        utm_source: source || undefined,
        utm_medium: medium || undefined,
        utm_campaign: campaign || undefined,
        utm_term: term || undefined,
        utm_content: content || undefined,
      };
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(currentUtm));
      } catch {
        // Ignored if storage disabled/restricted
      }
      return currentUtm;
    }

    try {
      const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UtmParams;
      }
    } catch {
      // Ignored
    }
  } catch {
    // Non-blocking
  }
  return {};
}

/**
 * Kiểm tra và ngăn chặn sự kiện trùng lặp do React StrictMode hoặc double-render
 */
function isDuplicateEvent(eventName: string, params: Record<string, any>): boolean {
  try {
    const key = `${eventName}:${JSON.stringify(params)}`;
    const now = Date.now();
    const lastFired = recentEventsCache.get(key);

    if (lastFired && now - lastFired < DEDUP_WINDOW_MS) {
      return true;
    }

    recentEventsCache.set(key, now);

    // Garbage collection để tránh phình bộ nhớ
    if (recentEventsCache.size > 80) {
      for (const [k, timestamp] of recentEventsCache.entries()) {
        if (now - timestamp > 4000) {
          recentEventsCache.delete(k);
        }
      }
    }
  } catch {
    // Fail-safe
  }
  return false;
}

/**
 * An toàn phát sự kiện analytics
 * - Bảo mật tuyệt đối không gửi PII (mật khẩu, tên, sđt, email, token, credential)
 * - Tự động đính kèm attribution UTM nếu có
 * - Chống duplicate events
 */
function sendEvent(eventName: string, params: Record<string, any> = {}) {
  try {
    if (typeof window === "undefined") return;

    // Filter out undefined and redact accidental PII
    const cleanParams: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === null) continue;

      const lowerKey = key.toLowerCase();
      // Loại bỏ hoàn toàn các key nhạy cảm
      if (
        lowerKey.includes("pass") ||
        lowerKey.includes("phone") ||
        lowerKey.includes("zalo_number") ||
        lowerKey.includes("customer_") ||
        lowerKey.includes("client_") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("cred") ||
        lowerKey.includes("email") ||
        lowerKey.includes("cookie") ||
        (lowerKey.includes("name") && lowerKey !== "package_name" && lowerKey !== "filter_type") ||
        (lowerKey.includes("note") && lowerKey !== "rental_note")
      ) {
        continue;
      }

      // Kiểm tra giá trị có dạng số điện thoại hoặc email không
      if (typeof val === "string") {
        if (val.includes("@") && val.includes(".")) continue;
        if (/^(0|\+84)\d{9,10}$/.test(val.replace(/\s+/g, ""))) continue;
      }

      cleanParams[key] = val;
    }

    // Gắn UTM attribution nếu có
    const utm = getStoredUtmParams();
    if (utm.utm_source && !cleanParams.utm_source) cleanParams.utm_source = utm.utm_source;
    if (utm.utm_medium && !cleanParams.utm_medium) cleanParams.utm_medium = utm.utm_medium;
    if (utm.utm_campaign && !cleanParams.utm_campaign) cleanParams.utm_campaign = utm.utm_campaign;

    // Chống trùng lặp sự kiện
    if (isDuplicateEvent(eventName, cleanParams)) {
      return;
    }

    // 1. Dispatch tới Google Analytics 4 (window.gtag)
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, cleanParams);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...cleanParams,
      });
    }

    // 2. Debug log trong development hoặc bật flag debug_analytics
    if (
      process.env.NODE_ENV === "development" ||
      (typeof localStorage !== "undefined" && localStorage.getItem("debug_analytics") === "true")
    ) {
      // eslint-disable-next-line no-console
      console.info(`[Analytics] 📊 ${eventName}`, cleanParams);
    }
  } catch (err) {
    // Analytics lỗi không bao giờ làm gián đoạn UX của website
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[Analytics Warning] Failed to dispatch event:", err);
    }
  }
}

export const analytics = {
  /**
   * PRIMARY CONVERSION: Khách hàng click chuyển đổi sang Zalo
   */
  trackClickZalo: (params: TrackClickZaloParams) => {
    sendEvent("click_zalo", {
      source: params.source,
      product_id: params.product_id,
      product_type: params.product_type,
      rental_package: params.rental_package,
    });
  },

  /**
   * Khách hàng vào xem Kho Acc (/shop)
   */
  trackViewShop: (totalAccounts?: number) => {
    sendEvent("view_shop", { total_accounts: totalAccounts });
  },

  /**
   * Khách hàng tìm kiếm tài khoản
   */
  trackSearchProduct: (params: TrackSearchProductParams) => {
    const trimmed = params.query.trim();
    if (!trimmed) return;
    sendEvent("search_product", {
      search_term: trimmed,
      results_count: params.results_count,
    });
  },

  /**
   * Khách hàng áp dụng bộ lọc (loại acc, pet, sân, giá, trạng thái, sắp xếp)
   */
  trackApplyFilter: (params: TrackApplyFilterParams) => {
    if (!params.filter_value) return;
    sendEvent("apply_filter", {
      filter_type: params.filter_type,
      filter_value: params.filter_value,
    });
  },

  /**
   * Khách hàng xem chi tiết 1 sản phẩm (qua modal hoặc trang chi tiết)
   */
  trackViewProduct: (params: TrackViewProductParams) => {
    sendEvent("view_product", {
      product_id: params.product_id,
      product_type: params.product_type,
      availability: params.availability,
      price: params.display_price,
    });
  },

  /**
   * Khách hàng mở modal chọn gói thuê
   */
  trackOpenRentalModal: (params: TrackOpenRentalModalParams) => {
    sendEvent("open_rental_modal", {
      product_id: params.product_id,
      product_type: params.product_type,
    });
  },

  /**
   * Khách hàng chọn gói thời gian thuê (2h, 7 ngày, 30 ngày, Lâu dài)
   */
  trackSelectRentalPackage: (params: TrackSelectRentalPackageParams) => {
    sendEvent("select_rental_package", {
      product_id: params.product_id,
      package_name: params.package_name,
      duration_hours: params.duration_hours,
      price: params.price,
    });
  },

  /**
   * Khách hàng lưu / bỏ lưu yêu thích tài khoản
   */
  trackFavoriteProduct: (params: TrackFavoriteProductParams) => {
    sendEvent("favorite_product", {
      product_id: params.product_id,
      product_type: params.product_type,
      action: params.action,
    });
  },

  /**
   * Thành viên đăng nhập
   */
  trackMemberLogin: (params: TrackMemberLoginParams) => {
    sendEvent("member_login", {
      success: params.success,
    });
  },
};
