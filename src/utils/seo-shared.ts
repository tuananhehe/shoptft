export interface GlobalSeoConfig {
  siteName: string;
  brandName: string;
  canonicalOrigin: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  googleVerification?: string;
  bingVerification?: string;
  twitterHandle?: string;
}

export interface PageRobotsConfig {
  index: boolean;
  follow: boolean;
}

export interface PageSeoItem {
  path: string;
  name: string;
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: PageRobotsConfig;
}

export interface ProductSeoTemplate {
  titleTemplate: string;
  descriptionTemplate: string;
  defaultOgImage: string;
}

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface SchemaConfig {
  organizationName: string;
  founderName: string;
  founderTitle: string;
  sameAs: string[];
}

export interface RobotsConfig {
  allowPaths: string[];
  disallowPaths: string[];
  crawlDelay?: number;
}

export interface SeoConfigDatabase {
  global: GlobalSeoConfig;
  pages: Record<string, PageSeoItem>;
  productTemplate: ProductSeoTemplate;
  redirects: RedirectRule[];
  schema: SchemaConfig;
  robotsConfig: RobotsConfig;
}

export interface SeoAuditIssue {
  id: string;
  type: "error" | "warning" | "passed";
  category: "meta" | "canonical" | "product" | "redirect" | "robots" | "schema" | "blog";
  title: string;
  detail: string;
  page?: string;
}

export interface SeoAuditReport {
  timestamp: string;
  healthStatus: "excellent" | "good" | "needs_attention" | "critical";
  summary: {
    total: number;
    errors: number;
    warnings: number;
    passed: number;
  };
  issues: SeoAuditIssue[];
}

export const DEFAULT_SEO_CONFIG: SeoConfigDatabase = {
  global: {
    siteName: "ShopTFTMobile",
    brandName: "Tuấn Thái Bình TFT",
    canonicalOrigin: "https://www.shoptftmobile.net",
    defaultTitle: "Thuê Acc TFT - ĐTCL | ShopTFTMobile - Tuấn Thái Bình TFT",
    defaultDescription:
      "Kho tài khoản TFT/ĐTCL với Pet, Chibi và Sân Đấu đa dạng. Xem acc, lựa chọn nhu cầu và liên hệ ShopTFTMobile - Tuấn Thái Bình TFT để được hỗ trợ trực tiếp qua Zalo.",
    defaultOgImage: "/banner-seo.jpg",
    googleVerification: "",
    bingVerification: "",
    twitterHandle: "@ShopTFTMobile",
  },
  pages: {
    "/": {
      path: "/",
      name: "Trang chủ",
      title: "Thuê Acc TFT - ĐTCL Uy Tín | ShopTFTMobile - Tuấn Thái Bình TFT",
      description:
        "Hệ thống thuê acc TFT / ĐTCL uy tín hàng đầu. Đầy đủ acc VIP, acc Clone, Linh thú Tí Nị, Sân đấu EDM đổi nhạc. Bàn giao trực tiếp qua Zalo Tuấn Thái Bình.",
      canonical: "https://www.shoptftmobile.net",
      ogTitle: "Thuê Acc TFT - ĐTCL Uy Tín | ShopTFTMobile - Tuấn Thái Bình TFT",
      ogDescription:
        "Kho tài khoản TFT/ĐTCL với Pet, Chibi và Sân Đấu đa dạng. Bàn giao trực tiếp qua Zalo Tuấn Thái Bình.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/shop": {
      path: "/shop",
      name: "Kho Acc",
      title: "Kho Acc TFT - ĐTCL Đa Dạng | ShopTFTMobile",
      description:
        "Tìm tài khoản TFT/ĐTCL theo Pet, Chibi, Sân Đấu, loại acc và mức giá tại ShopTFTMobile. Cập nhật trạng thái liên tục, thuê nhanh qua Zalo.",
      canonical: "https://www.shoptftmobile.net/shop",
      ogTitle: "Kho Acc TFT - ĐTCL Đa Dạng | ShopTFTMobile",
      ogDescription:
        "Tìm tài khoản TFT/ĐTCL theo Pet, Chibi, Sân Đấu, loại acc và mức giá tại ShopTFTMobile.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/thue-acc-tft-dtcl": {
      path: "/thue-acc-tft-dtcl",
      name: "Dịch vụ Thuê Acc TFT",
      title: "Dịch Vụ Thuê Acc TFT - ĐTCL Uy Tín | ShopTFTMobile",
      description:
        "Dịch vụ thuê tài khoản ĐTCL (TFT Mobile & PC) uy tín bởi cựu Thách Đấu Tuấn Thái Bình. Đầy đủ acc VIP Tí Nị Thần Thoại và Acc Clone giá tốt, bàn giao 1-1.",
      canonical: "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
      ogTitle: "Dịch Vụ Thuê Acc TFT - ĐTCL Uy Tín | ShopTFTMobile",
      ogDescription:
        "Dịch vụ thuê tài khoản ĐTCL (TFT Mobile & PC) uy tín bởi cựu Thách Đấu Tuấn Thái Bình. Đầy đủ acc VIP Tí Nị Thần Thoại và Acc Clone giá tốt.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/ve-shop": {
      path: "/ve-shop",
      name: "Về Shop",
      title: "Về ShopTFTMobile & Tuấn Thái Bình TFT | Uy Tín & Trách Nhiệm",
      description:
        "ShopTFTMobile vận hành bởi Tuấn Thái Bình - cựu Thách Đấu ĐTCL. Cam kết thông tin minh bạch, bảo hiểm Checkscam 30 triệu, chăm sóc khách hàng chu đáo.",
      canonical: "https://www.shoptftmobile.net/ve-shop",
      ogTitle: "Về ShopTFTMobile & Tuấn Thái Bình TFT | Uy Tín & Trách Nhiệm",
      ogDescription:
        "ShopTFTMobile vận hành bởi Tuấn Thái Bình - cựu Thách Đấu ĐTCL. Cam kết thông tin minh bạch, bảo hiểm Checkscam 30 triệu.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/huong-dan": {
      path: "/huong-dan",
      name: "Hướng dẫn tổng hợp",
      title: "Hướng Dẫn Dịch Vụ TFT & Riot Games | ShopTFTMobile",
      description:
        "Tổng hợp hướng dẫn đổi thông tin tài khoản Riot Games, bảo mật 2 lớp và lưu ý khi thuê acc TFT tại ShopTFTMobile.",
      canonical: "https://www.shoptftmobile.net/huong-dan",
      ogTitle: "Hướng Dẫn Dịch Vụ TFT & Riot Games | ShopTFTMobile",
      ogDescription:
        "Tổng hợp hướng dẫn đổi thông tin tài khoản Riot Games, bảo mật 2 lớp và lưu ý khi thuê acc TFT.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/huong-dan/doi-thong-tin-acc-riot": {
      path: "/huong-dan/doi-thong-tin-acc-riot",
      name: "Hướng dẫn đổi thông tin Riot",
      title: "Hướng Dẫn Đổi Thông Tin Acc Riot An Toàn | ShopTFTMobile",
      description:
        "Hướng dẫn chi tiết từng bước đổi mật khẩu, email và bật bảo mật 2FA cho tài khoản Riot Games sau khi nhận acc từ Tuấn Thái Bình TFT.",
      canonical: "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot",
      ogTitle: "Hướng Dẫn Đổi Thông Tin Acc Riot An Toàn | ShopTFTMobile",
      ogDescription:
        "Hướng dẫn chi tiết từng bước đổi mật khẩu, email và bật bảo mật 2FA cho tài khoản Riot Games sau khi nhận acc từ Tuấn Thái Bình TFT.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
  },
  productTemplate: {
    titleTemplate: "{product_name} | Thuê Acc TFT - ShopTFTMobile",
    descriptionTemplate:
      "Thuê tài khoản TFT {product_name} ({type}) sở hữu {pet} kèm {arena}. Giá chỉ {price}. Bàn giao trực tiếp qua Zalo Tuấn Thái Bình TFT.",
    defaultOgImage: "/banner-seo.jpg",
  },
  redirects: [
    {
      id: "red-1",
      source: "/acc-moi",
      destination: "/shop?sort=newest",
      permanent: true,
      enabled: true,
      createdAt: "2026-09-30T00:00:00.000Z",
    },
  ],
  schema: {
    organizationName: "ShopTFTMobile",
    founderName: "Tuấn Thái Bình",
    founderTitle: "Cựu Thách Đấu ĐTCL",
    sameAs: [
      "https://zalo.me/0352867283",
      "https://checkscam.vn",
    ],
  },
  robotsConfig: {
    allowPaths: [
      "/",
      "/shop",
      "/thue-acc-tft-dtcl",
      "/ve-shop",
      "/acc/*",
      "/huong-dan",
      "/huong-dan/*",
    ],
    disallowPaths: [
      "/admin",
      "/admin/*",
      "/profile",
      "/profile/*",
      "/login",
      "/register",
      "/pay/*",
      "/api/*",
      "/*?*search=*",
      "/*?*q=*",
    ],
    crawlDelay: 0,
  },
};

/**
 * Thay thế biến template SEO cho chi tiết sản phẩm / tài khoản (Client & Server safe)
 */
export function formatProductSeo(
  account: {
    title: string;
    code: string;
    type: string;
    mainChibi?: string;
    allChibi?: string[];
    mainArena?: string;
    price?: number;
    hourlyPrice?: number;
  },
  template: ProductSeoTemplate,
  siteName: string = "ShopTFTMobile"
): { title: string; description: string; ogImage: string } {
  const petName =
    account.mainChibi ||
    (account.allChibi && account.allChibi.length > 0 ? account.allChibi[0] : "Linh Thú Đặc Biệt");
  const arenaName = account.mainArena || "Sân đấu đẹp";
  const typeName = account.type === "VIP" ? "Acc VIP" : "Acc Clone";
  const priceDisplay = account.price
    ? `${account.price.toLocaleString("vi-VN")}đ`
    : account.hourlyPrice
    ? `${account.hourlyPrice.toLocaleString("vi-VN")}đ/h`
    : "Giá tốt";

  const replaceTokens = (str: string) => {
    return str
      .replace(/{product_name}/gi, account.title || account.code)
      .replace(/{pet}/gi, petName)
      .replace(/{arena}/gi, arenaName)
      .replace(/{type}/gi, typeName)
      .replace(/{price}/gi, priceDisplay)
      .replace(/{site_name}/gi, siteName)
      .replace(/\s+/g, " ")
      .trim();
  };

  const title = replaceTokens(template.titleTemplate || "{product_name} | ShopTFTMobile");
  const description = replaceTokens(
    template.descriptionTemplate ||
      "Thuê {product_name} ({type}) với {pet} và {arena}. Bàn giao nhanh qua Zalo."
  );

  return {
    title,
    description,
    ogImage: template.defaultOgImage || "/banner-seo.jpg",
  };
}

/**
 * Kiểm tra vòng lặp redirect (Client & Server safe)
 */
export function detectRedirectLoop(
  source: string,
  destination: string,
  existingRules: RedirectRule[],
  currentRuleId?: string
): { hasLoop: boolean; message?: string } {
  const cleanSrc = source.trim().toLowerCase();
  const cleanDest = destination.trim().toLowerCase();

  if (cleanSrc === cleanDest) {
    return { hasLoop: true, message: "URL nguồn và đích không được trùng nhau." };
  }

  const activeRules = existingRules.filter(
    (r) => r.enabled && (!currentRuleId || r.id !== currentRuleId)
  );

  const directLoop = activeRules.find(
    (r) =>
      r.source.trim().toLowerCase() === cleanDest &&
      r.destination.trim().toLowerCase() === cleanSrc
  );

  if (directLoop) {
    return {
      hasLoop: true,
      message: `Tạo vòng lặp trực tiếp với quy tắc hiện có: "${directLoop.source}" -> "${directLoop.destination}".`,
    };
  }

  let curr = cleanDest;
  const visited = new Set<string>([cleanSrc]);

  for (let i = 0; i < 5; i++) {
    const nextHop = activeRules.find((r) => r.source.trim().toLowerCase() === curr);
    if (!nextHop) break;
    const nextDest = nextHop.destination.trim().toLowerCase();
    if (visited.has(nextDest)) {
      return {
        hasLoop: true,
        message: `Phát hiện chuỗi redirect vòng tròn: "${cleanSrc}" dẫn tới "${nextDest}".`,
      };
    }
    visited.add(nextDest);
    curr = nextDest;
  }

  return { hasLoop: false };
}
