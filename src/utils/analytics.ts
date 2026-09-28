/**
 * ShopTFTMobile - Lightweight Privacy-First Analytics & Conversion Tracking
 * 
 * Strict Privacy Guidelines:
 * - NEVER send passwords, customer names, phone/Zalo numbers, or admin notes.
 * - Primary Conversion: click_zalo
 * - Safe fail-over: analytics errors NEVER block customer interactions.
 */

export interface TrackClickZaloParams {
  source:
    | "header"
    | "hero"
    | "product_card"
    | "product_detail"
    | "rental_modal"
    | "footer"
    | "about"
    | "mobile_bottom_bar"
    | "final_cta"
    | "faq"
    | "rental_process";
  product_id?: string;
  product_type?: "VIP" | "CLONE";
  rental_package?: string;
}

export interface TrackSearchProductParams {
  query: string;
  results_count?: number;
}

export interface TrackApplyFilterParams {
  filter_type: string;
  filter_value: string;
}

export interface TrackViewProductParams {
  product_id: string;
  product_type: "VIP" | "CLONE";
  availability: "AVAILABLE" | "RENTED";
  display_price?: number;
}

export interface TrackOpenRentalModalParams {
  product_id: string;
  product_type: "VIP" | "CLONE";
}

export interface TrackSelectRentalPackageParams {
  product_id: string;
  package_name: string;
  duration_hours?: number;
  price?: number;
}

export interface TrackMemberLoginParams {
  success: boolean;
}

// Global window declaration for gtag
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * An toàn phát sự kiện analytics
 */
function sendEvent(eventName: string, params: Record<string, any> = {}) {
  try {
    if (typeof window === "undefined") return;

    // Filter out any undefined or accidental PII
    const cleanParams: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        // Redact any accidental keys matching sensitive terms
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("pass") ||
          lowerKey.includes("phone") ||
          lowerKey.includes("zalo_number") ||
          lowerKey.includes("customer_name") ||
          lowerKey.includes("secret")
        ) {
          continue;
        }
        cleanParams[key] = val;
      }
    }

    // 1. Dispatch to window.gtag if GA4 is loaded
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, cleanParams);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...cleanParams,
      });
    }

    // 2. Debug logging in development or if debug mode is active
    if (
      process.env.NODE_ENV === "development" ||
      (typeof localStorage !== "undefined" && localStorage.getItem("debug_analytics") === "true")
    ) {
      // eslint-disable-next-line no-console
      console.info(`[Analytics] 📊 ${eventName}`, cleanParams);
    }
  } catch (err) {
    // Non-blocking fail-safe
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
    sendEvent("click_zalo", params);
  },

  /**
   * Khách hàng vào trang Kho Acc (/shop)
   */
  trackViewShop: (totalAccounts?: number) => {
    sendEvent("view_shop", { total_accounts: totalAccounts });
  },

  /**
   * Khách hàng tìm kiếm tài khoản
   */
  trackSearchProduct: (params: TrackSearchProductParams) => {
    sendEvent("search_product", {
      search_term: params.query.trim(),
      results_count: params.results_count,
    });
  },

  /**
   * Khách hàng áp dụng bộ lọc (tướng, sân đấu, rank, loại acc, trạng thái)
   */
  trackApplyFilter: (params: TrackApplyFilterParams) => {
    sendEvent("apply_filter", {
      filter_type: params.filter_type,
      filter_value: params.filter_value,
    });
  },

  /**
   * Khách hàng xem chi tiết 1 sản phẩm
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
   * Thành viên đăng nhập
   */
  trackMemberLogin: (params: TrackMemberLoginParams) => {
    sendEvent("member_login", {
      success: params.success,
    });
  },
};
