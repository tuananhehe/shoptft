/**
 * Service Quản Lý Cấu Hình & Giao Diện Trang Chủ (Homepage CMS)
 * ShopTFT Mobile - Tuấn Thái Bình
 */

import { BankConfig } from "./vietqr-helper";
export type { BankConfig };

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

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  faviconUrl: string;
  bgImageUrl?: string;
  bgColor?: string;
  googleVerification?: string;
  bingVerification?: string;
  author?: string;
}

export interface PricingConfig {
  passChangeFee: number;
  rate2Hours: number;
  rate7Days: number;
  rate30Days: number;
  defaultPriceDisplayMode?: "HOURLY" | "DAILY" | "LONG_TERM" | "AUTO";
  displayUnit?: string;
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
  seo?: SEOConfig;
  pricing?: PricingConfig;
  contact?: ContactConfig;
  bank?: BankConfig;
  servicePackages: ServicePackageItem[];
  faqs: FAQConfigItem[];
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  sections: {
    hero: true,
    alertBanner: true,
    vipShop: true,
    cloneShop: true,
    about: true,
    services: true,
    reviews: true,
    faq: true,
    floatingChat: false,
  },
  hero: {
    badge: "HỆ THỐNG THUÊ ACC TFT ĐTCL CHÍNH CHỦ // TUẤN THÁI BÌNH",
    titleLine1: "Shop Thuê Acc TFT ĐTCL",
    titleLine2: "Uy Tín Hàng Đầu",
    titleHighlight: "Việt Nam",
    subtitle:
      "ShopTFTMobile chuyên tài khoản TFT/ĐTCL Việt Nam uy tín, đa dạng từ giá rẻ đến VIP. Thông tin minh bạch, tư vấn chu đáo và bàn giao trực tiếp qua Zalo.",
    stats: [
      { id: "experience", label: "Gắn Bó Cùng ĐTCL", value: "5+ Năm" },
      { id: "insurance", label: "Quỹ Checkscam.vn", value: "30.000.000đ" },
      { id: "delivery", label: "Bàn Giao & Hỗ Trợ", value: "Trực Tiếp Zalo" },
      { id: "support", label: "Hỗ Trợ 1-1", value: "Cùng Chủ Shop" },
    ],
  },
  images: {
    heroCardImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    heroCardCode: "MS: 8899",
    heroCardChibi: "Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long",
    heroCardArena: "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)",
    heroCardPrice: "15.000đ/h",
    avatarUrl: "/avatar.jpg",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
  },
  alertBanner: {
    active: true,
    content:
      "🎁 Ưu đãi đặc biệt: Hỗ trợ tư vấn chọn acc và hướng dẫn đăng nhập trực tiếp qua Zalo Tuấn Thái Bình!",
  },
  seo: {
    metaTitle: "Tuấn Thái Bình TFT | Hệ Thống Thuê Acc ĐTCL - TFT Mobile Uy Tín",
    metaDescription:
      "ShopTFTMobile chuyên tài khoản TFT/ĐTCL Việt Nam uy tín, đa dạng từ giá rẻ đến VIP. Thông tin minh bạch, tư vấn chu đáo và bàn giao trực tiếp qua Zalo.",
    metaKeywords:
      "thuê acc tft, thuê acc đtcl, shop tft, tuấn thái bình tft, thuê acc tí nị, cày thuê đtcl, shop acc tft uy tín, shop tft mobile, thuê tài khoản đtcl, tí nị ahri, tí nị yasuo, coaching tft",
    canonicalUrl: "https://www.shoptftmobile.net/",
    ogTitle: "Tuấn Thái Bình TFT | Nền Tảng Thuê Acc ĐTCL Uy Tín",
    ogDescription:
      "ShopTFTMobile chuyên tài khoản TFT/ĐTCL Việt Nam uy tín, đa dạng từ giá rẻ đến VIP. Thông tin minh bạch, tư vấn chu đáo và bàn giao trực tiếp qua Zalo.",
    ogImage: "/banner-seo.jpg",
    faviconUrl: "/favicon.ico",
    bgImageUrl: "",
    bgColor: "#F8FAFC",
    googleVerification: "",
    author: "Tuấn Thái Bình",
  },
  pricing: {
    passChangeFee: 20000,
    rate2Hours: 3,
    rate7Days: 12,
    rate30Days: 30,
  },
  contact: {
    phoneZalo: "0352.867.283",
    checkscamFund: "30.000.000đ",
  },
  bank: {
    bankId: "ACB",
    bankName: "Ngân hàng TMCP Á Châu (ACB)",
    accountNumber: "23456789",
    accountHolder: "TUAN THAI BINH",
    qrTemplate: "compact2",
    transferSyntax: "THUE ACC {CODE}",
  },
  servicePackages: [
    {
      id: "srv-01",
      title: "Cày Rank ĐTCL (Cày tay trực tiếp)",
      badge: "HỖ TRỢ LEO RANK",
      price: "Từ 50.000đ / Bậc",
      popular: false,
      features: [
        "Cày tay trực tiếp bởi Tuấn Thái Bình (Cựu Thách Đấu 1.134 ĐNG)",
        "Đảm bảo an toàn tài khoản, đổi IP sạch tránh khóa acc",
        "Cập nhật tiến độ liên tục qua Zalo sau mỗi trận đấu",
        "Hỗ trợ tận tâm trong suốt quá trình cày rank",
      ],
    },
    {
      id: "srv-02",
      title: "Coaching 1-1 Bắt Meta & Tư Duy Xoay Bài",
      badge: "HOT NHẤT HIỆN TẠI",
      price: "150.000đ / Buổi (90 Phút)",
      popular: true,
      features: [
        "Voice 1-1 qua Discord/Zalo, xem màn hình và chỉ lỗi sai trực tiếp",
        "Hướng dẫn cách giữ máu, quản lý kinh tế và roll ở các round then chốt",
        "Giáo án độc quyền các đội hình Meta leo rank ổn định nhất",
        "Hỗ trợ giải đáp thắc mắc xoay bài qua Zalo sau buổi học",
      ],
    },
    {
      id: "srv-03",
      title: "Gói Duo Cùng Cựu Thách Đấu (Kèm Trực Tiếp)",
      badge: "NÂNG TẦM MMR",
      price: "100.000đ / Giờ (2-3 Trận)",
      popular: false,
      features: [
        "Duo trực tiếp cùng Tuấn Thái Bình trên acc phụ trình độ tương đương",
        "Call bài, chia sẻ tướng và giữ chuỗi thắng cùng bạn trong trận",
        "Cải thiện MMR nhanh chóng, không lo gặp đồng đội troll game",
        "Vừa leo rank vừa học hỏi tư duy đỉnh cao trong từng round",
      ],
    },
  ],
  faqs: [
    {
      id: "faq-01",
      q: "Sau khi gửi thông tin qua Zalo thì bao lâu tôi nhận được tài khoản?",
      a: "Sau khi bạn xác nhận mã tài khoản và hoàn tất chuyển khoản, Shop sẽ trực tiếp kiểm tra và bàn giao tài khoản kèm hướng dẫn đăng nhập an toàn qua tin nhắn Zalo.",
      category: "THUE_ACC",
      badge: "Bàn giao Zalo",
    },
    {
      id: "faq-02",
      q: "Tôi có cần phải đặt cọc khi thuê tài khoản không?",
      a: "Không cần đặt cọc. Bạn chỉ cần thanh toán đúng số tiền của gói thời gian bạn chọn (2h, 7 ngày, 30 ngày...). Không phát sinh bất kỳ chi phí thế chấp hay phụ phí ẩn nào.",
      category: "THUE_ACC",
      badge: "Không Cọc",
    },
    {
      id: "faq-03",
      q: "Nếu đang chơi mà tài khoản bị lỗi hoặc bị trùng pass thì shop xử lý ra sao?",
      a: "ShopTFTMobile cam kết hỗ trợ chu đáo trong suốt thời gian thuê. Nếu có bất kỳ sự cố gián đoạn nào, shop sẽ đổi ngay acc tương đương hoặc bù thêm giờ chơi nhanh chóng qua Zalo 0352.867.283.",
      category: "BAO_MAT",
      badge: "Hỗ trợ chu đáo",
    },
    {
      id: "faq-04",
      q: "Shop có bảo hiểm checkscam bảo chứng uy tín không?",
      a: "Có! Tuấn Thái Bình đã đóng Quỹ Bảo Hiểm 30.000.000đ trên diễn đàn Checkscam.vn uy tín hàng đầu Việt Nam bảo chứng số điện thoại 0352.867.283. Bạn hoàn toàn có thể kiểm tra công khai danh tính bất cứ lúc nào.",
      category: "THANH_TOAN",
      badge: "Quỹ 30M",
    },
    {
      id: "faq-05",
      q: "Tôi có thể đổi sang Tướng Tí Nị hoặc Sân Đấu khác trong thời gian thuê không?",
      a: "Hoàn toàn được! Bạn chỉ cần nhắn tin Zalo cho shop, nếu acc khác đang trống shop sẽ hỗ trợ chuyển đổi linh hoạt số giờ còn lại sang acc mới để bạn trải nghiệm.",
      category: "THUE_ACC",
      badge: "Đổi acc linh hoạt",
    },
    {
      id: "faq-06",
      q: "Chơi trên điện thoại (ĐTCL Mobile iOS / Android) hay PC có được không?",
      a: "Tất cả tài khoản của shop đều hỗ trợ đăng nhập đa nền tảng: Cả trên máy tính PC (Client Riot VNG) và điện thoại di động (ĐTCL Mobile iOS / Android) đều mượt mà.",
      category: "THUE_ACC",
      badge: "Hỗ trợ Mobile & PC",
    },
  ],
};

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
 * Upload file hình ảnh / favicon lên máy chủ
 */
export async function uploadAdminFile(
  file: File,
  type: "favicon" | "background" | "general" = "general"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("shoptft_admin_token");
      if (token) {
        headers["x-admin-token"] = token;
      }
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể tải file lên!" };
    }

    return { success: true, url: result.url };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ khi upload!" };
  }
}

/**
 * Lấy toàn bộ cấu hình trang chủ (Fallback an toàn sang DEFAULT_HOMEPAGE_CONFIG)
 */
export async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    // Dynamic import to avoid circular SSR issues if any
    const { fetchWithTimeout } = await import("@/utils/api-client");
    const res = await fetchWithTimeout("/api/homepage", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      timeoutMs: 6000,
    });

    if (!res.ok) {
      return DEFAULT_HOMEPAGE_CONFIG;
    }
    const json = await res.json();
    return json.data || DEFAULT_HOMEPAGE_CONFIG;
  } catch (err) {
    return DEFAULT_HOMEPAGE_CONFIG;
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
