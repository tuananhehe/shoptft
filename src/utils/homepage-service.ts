/**
 * Service Quản Lý Cấu Hình & Giao Diện Trang Chủ (Homepage CMS)
 * ShopTFT Mobile - Tuấn Thái Bình
 */

export interface HomepageSections {
  hero: boolean;
  alertBanner: boolean;
  vipShop: boolean;
  cloneShop: boolean;
  about: boolean;
  services: boolean;
  reviews: boolean;
  faq: boolean;
  floatingChat: boolean;
}

export interface HeroStatItem {
  id: string;
  label: string;
  value: string;
}

export interface HeroConfig {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  titleHighlight: string;
  subtitle: string;
  stats: HeroStatItem[];
}

export interface AlertBannerConfig {
  active: boolean;
  content: string;
}

export interface ServicePackageItem {
  id: string;
  title: string;
  badge: string;
  price: string;
  popular?: boolean;
  features: string[];
}

export interface FAQConfigItem {
  id: string;
  q: string;
  a: string;
  category: "THUE_ACC" | "BAO_MAT" | "CAY_RANK" | "THANH_TOAN" | string;
  badge?: string;
}

export interface HomepageImagesConfig {
  heroCardImage: string;
  heroCardCode: string;
  heroCardChibi: string;
  heroCardArena: string;
  heroCardPrice: string;
  avatarUrl: string;
  coverUrl: string;
}

export interface PricingConfig {
  passChangeFee: number;
  rate2Hours: number;
  rate7Days: number;
  rate30Days: number;
}

export interface ContactConfig {
  phoneZalo: string;
  checkscamFund: string;
}

export interface HomepageConfig {
  sections: HomepageSections;
  hero: HeroConfig;
  images: HomepageImagesConfig;
  alertBanner: AlertBannerConfig;
  pricing?: PricingConfig;
  contact?: ContactConfig;
  servicePackages: ServicePackageItem[];
  faqs: FAQConfigItem[];
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
 * Lấy toàn bộ cấu hình trang chủ
 */
export async function getHomepageConfig(): Promise<HomepageConfig | null> {
  try {
    const res = await fetch("/api/homepage", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Lỗi lấy cấu hình trang chủ:", err);
    return null;
  }
}

/**
 * Cập nhật cấu hình trang chủ (Admin)
 */
export async function updateHomepageConfig(
  payload: Partial<HomepageConfig>
): Promise<{ success: boolean; data?: HomepageConfig; error?: string }> {
  try {
    const res = await fetch("/api/homepage", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể cập nhật cấu hình!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ!" };
  }
}

/**
 * Khôi phục cấu hình trang chủ về mặc định (Admin)
 */
export async function resetHomepageConfig(): Promise<{
  success: boolean;
  data?: HomepageConfig;
  error?: string;
}> {
  try {
    const res = await fetch("/api/homepage?action=reset", {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể khôi phục mặc định!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ!" };
  }
}
