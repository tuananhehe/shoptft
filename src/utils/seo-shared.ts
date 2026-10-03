export interface GlobalSeoConfig {
  siteName: string;
  brandName: string;
  secondaryBrandName?: string;
  canonicalOrigin: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  logoUrl?: string;
  phoneZalo?: string;
  zaloUrl?: string;
  supportHours?: string;
  trustVerificationUrl?: string;
  insuranceAmount?: string;
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
  category: "meta" | "canonical" | "product" | "redirect" | "robots" | "schema" | "blog" | "brand";
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

export interface ImageHealthItem {
  id: string;
  source: "product" | "blog" | "page";
  title: string;
  url: string;
  issue: "missing_alt" | "broken" | "missing_og" | "oversized" | "invalid_aspect_ratio";
  severity: "error" | "warning";
  message: string;
}

export interface ImageHealthReport {
  timestamp: string;
  totalChecked: number;
  missingAlt: number;
  brokenImage: number;
  missingOg: number;
  oversizedImage: number;
  invalidAspectRatio: number;
  items: ImageHealthItem[];
}

export interface InternalLinkItem {
  source: string;
  target: string;
  anchorText?: string;
  type: "normal" | "redirect" | "broken" | "orphan";
}

export interface InternalLinksAuditReport {
  timestamp: string;
  healthStatus: "excellent" | "good" | "needs_attention" | "critical";
  totalPagesAudited: number;
  totalInternalLinks: number;
  orphanPages: Array<{ path: string; title: string; type: "blog" | "page" | "guide" }>;
  brokenLinks: Array<{ source: string; target: string; reason: string }>;
  excessiveLinks: Array<{ path: string; totalLinks: number; warning: string }>;
  missingHubLinks: Array<{ path: string; title: string; category: string }>;
  redirectLinks: Array<{ source: string; target: string; destination: string }>;
}

export type GscPeriodKey = "7d" | "28d" | "3m";
export type GscQueryGroup = "BRAND" | "COMMERCIAL" | "DISCOVERY" | "CONTENT" | "GUIDE";
export type GscOpportunityType = "CTR" | "Ranking" | "Content" | "Cannibalization" | "Indexing";
export type GscOpportunityPriority = "HIGH" | "MEDIUM" | "LOW";

export interface GscQueryItem {
  query: string;
  group: GscQueryGroup;
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  previousCtr?: number;
  previousPosition?: number;
}

export interface GscPagePerformance {
  url: string;
  title: string;
  pageType: "home" | "shop" | "commercial_landing" | "brand_about" | "guide" | "hub" | "article" | "product";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  previousClicks?: number;
  previousPosition?: number;
  indexStatus: "indexed" | "needs_attention" | "not_indexed";
  canonicalUrl: string;
}

export interface RankingOpportunity {
  id: string;
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  opportunity: GscOpportunityType;
  priority: GscOpportunityPriority;
  reason: string;
  recommendedAction: string;
  targetAudienceOrIntent: string;
}

export interface BlogSeoConversion {
  slug: string;
  title: string;
  patch?: string;
  updatedAt: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  blogToShopClicks: number;
  productViews: number;
  zaloClicks: number;
  conversionRate: number;
  performanceGroup: "high_impression_low_ctr" | "pos_8_20" | "traffic_drop" | "top_performer";
}

export interface CannibalizationIssue {
  query: string;
  competingUrls: string[];
  recommendedUrl: string;
  actionReason: string;
}

export interface ContentGapItem {
  query: string;
  searchImpressions: number;
  userIntent: string;
  suggestedTitle: string;
  suggestedUrl: string;
  targetCluster: string;
}

export interface TitleChangeLog {
  id: string;
  pageUrl: string;
  oldTitle: string;
  newTitle: string;
  dateChanged: string;
  reason: string;
  baselineCtr: number;
  currentCtr?: number;
}

export interface FunnelMetrics {
  organicVisits: number;
  shopVisits: number;
  productViews: number;
  zaloClicks: number;
  organicToShopRate: number;
  shopToProductRate: number;
  productToZaloRate: number;
  overallConversionRate: number;
}

export interface GscSummaryMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  brandClicks: number;
  nonBrandClicks: number;
  nonBrandClicksPercentage: number;
  brandImpressions: number;
  nonBrandImpressions: number;
  brandCtr: number;
  nonBrandCtr: number;
  brandAvgPosition: number;
  nonBrandAvgPosition: number;
}

export interface GscPerformanceReport {
  period: GscPeriodKey;
  summary: GscSummaryMetrics;
  brandQueries: GscQueryItem[];
  nonBrandQueries: GscQueryItem[];
  topPages: GscPagePerformance[];
  opportunities: RankingOpportunity[];
  cannibalization: CannibalizationIssue[];
  contentGaps: ContentGapItem[];
  blogPerformance: BlogSeoConversion[];
  funnel: FunnelMetrics;
  titleHistory: TitleChangeLog[];
  contentOpportunities?: ContentOpportunityItem[];
}

export type SearchIntentType = "Commercial" | "Informational" | "Discovery" | "Guide" | "Brand";
export type ContentOpportunityAction = "Optimize Existing" | "Create Article" | "Create Guide" | "Monitor" | "Ignore";
export type ContentOpportunityPriority = "HIGH" | "MEDIUM" | "LOW";

export interface ContentOpportunityItem {
  id: string;
  query: string;
  intent: SearchIntentType;
  existingPage: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  recommendedAction: ContentOpportunityAction;
  priority: ContentOpportunityPriority;
  reason: string;
  briefId?: string;
}

export interface ContentBrief {
  id: string;
  primaryQuery: string;
  secondaryQueries: string[];
  searchIntent: SearchIntentType;
  targetUrl: string;
  existingCompetingPages: string[];
  requiredSections: string[];
  internalLinksIncoming: Array<{ page: string; anchorText: string }>;
  internalLinksOutgoing: Array<{ target: string; anchorText: string }>;
  contentType: "blog_article" | "guide" | "commercial_landing" | "page_update";
  patchOrSeason?: string;
  freshnessRequirement: string;
  uniqueValueChecklist: string[];
  status: "backlog" | "draft" | "review" | "ready";
  aiDraftProposal?: {
    title: string;
    metaDescription: string;
    outline: string[];
    draftPreview: string;
  };
}

export type BacklinkStatus = "active" | "301_redirect" | "broken" | "lost";
export type BacklinkType = "dofollow" | "nofollow" | "ugc" | "brand_mention";

export interface BacklinkItem {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  status: BacklinkStatus;
  type: BacklinkType;
  firstSeen: string;
  lastSeen: string;
  authorityCategory: "profile" | "community" | "guide" | "legacy_com" | "partner";
  notes?: string;
}

export interface BrandMentionItem {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  mentionedBrand: "ShopTFTMobile" | "Tuấn Thái Bình TFT";
  contextSnippet: string;
  hasLink: boolean;
  linkUrl?: string;
  discoveredDate: string;
  outreachPotential: "recommended" | "not_needed" | "contacted" | "declined";
  notes?: string;
}

export interface LinkableAssetItem {
  slug: string;
  title: string;
  path: string;
  category: "topic_hub" | "guide" | "comparison" | "checklist";
  whyLinkable: string;
  naturalAnchorExamples: string[];
  referringDomainsCount: number;
}

export interface BacklinkMonitorReport {
  timestamp: string;
  summary: {
    totalBacklinks: number;
    totalReferringDomains: number;
    dofollowCount: number;
    nofollowCount: number;
    ugcCount: number;
    brandMentionsCount: number;
    activeCount: number;
    redirectCount: number;
    brokenCount: number;
    lostCount: number;
    oldDomainComCount: number;
    oldDomainResolvedCount: number;
  };
  backlinks: BacklinkItem[];
  brandMentions: BrandMentionItem[];
  linkableAssets: LinkableAssetItem[];
  brokenTargets: Array<{ targetUrl: string; count: number; suggestedRedirect: string }>;
  topLinkedPages: Array<{ path: string; title: string; referringDomains: number; backlinkCount: number }>;
}

export const PRODUCTION_ORIGIN = "https://www.shoptftmobile.net";

/**
 * Chuẩn hóa canonical URL tuyệt đối cho production
 * Không query string, không hash, không trailing slash bất thường, luôn dùng PRODUCTION_ORIGIN
 */
export function buildCanonicalUrl(path: string): string {
  if (!path || path === "/") return PRODUCTION_ORIGIN;
  const cleanPath = path.split("?")[0].split("#")[0].trim();
  const withLeading = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const noTrailing =
    withLeading.length > 1 && withLeading.endsWith("/")
      ? withLeading.slice(0, -1)
      : withLeading;
  return `${PRODUCTION_ORIGIN}${noTrailing === "/" ? "" : noTrailing}`;
}

export const DEFAULT_SEO_CONFIG: SeoConfigDatabase = {
  global: {
    siteName: "ShopTFTMobile",
    brandName: "ShopTFTMobile",
    secondaryBrandName: "Tuấn Thái Bình TFT",
    canonicalOrigin: "https://www.shoptftmobile.net",
    defaultTitle: "Thuê Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile",
    defaultDescription:
      "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone. Xem trạng thái acc, giá thuê và thông tin rõ ràng tại ShopTFTMobile, hỗ trợ trực tiếp qua Zalo.",
    defaultOgImage: "/banner-seo.jpg",
    logoUrl: "/images/logo.png",
    phoneZalo: "0352867283",
    zaloUrl: "https://zalo.me/0352867283",
    supportHours: "11:00 - 24:00 hàng ngày",
    trustVerificationUrl: "https://checkscam.vn/?qh_ss=0352867283",
    insuranceAmount: "30.000.000 VNĐ",
    googleVerification: "",
    bingVerification: "",
    twitterHandle: "@ShopTFTMobile",
  },
  pages: {
    "/": {
      path: "/",
      name: "Trang chủ",
      title: "Thuê Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile",
      description:
        "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone. Xem trạng thái acc, giá thuê và thông tin rõ ràng tại ShopTFTMobile, hỗ trợ trực tiếp qua Zalo.",
      canonical: "https://www.shoptftmobile.net/",
      ogTitle: "Thuê Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile",
      ogDescription:
        "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone. Xem trạng thái acc, giá thuê và thông tin rõ ràng tại ShopTFTMobile, hỗ trợ trực tiếp qua Zalo.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/shop": {
      path: "/shop",
      name: "Kho Acc",
      title: "Kho Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile",
      description:
        "Xem kho acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP/Clone và mức giá tại ShopTFTMobile. Kiểm tra trạng thái acc và chọn tài khoản phù hợp.",
      canonical: "https://www.shoptftmobile.net/shop",
      ogTitle: "Kho Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile",
      ogDescription:
        "Xem kho acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP/Clone và mức giá tại ShopTFTMobile. Kiểm tra trạng thái acc và chọn tài khoản phù hợp.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/thue-acc-tft-dtcl": {
      path: "/thue-acc-tft-dtcl",
      name: "Thuê Acc TFT - ĐTCL",
      title: "Thuê Acc TFT - ĐTCL: Pet, Chibi & Sân Đấu | ShopTFTMobile",
      description:
        "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone tại ShopTFTMobile. Xem cách chọn acc, quy trình thuê và liên hệ hỗ trợ trực tiếp qua Zalo.",
      canonical: "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
      ogTitle: "Thuê Acc TFT - ĐTCL: Pet, Chibi & Sân Đấu | ShopTFTMobile",
      ogDescription:
        "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone tại ShopTFTMobile. Xem cách chọn acc, quy trình thuê và liên hệ hỗ trợ trực tiếp qua Zalo.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
    "/ve-shop": {
      path: "/ve-shop",
      name: "Về Shop",
      title: "Tuấn Thái Bình TFT | Về ShopTFTMobile",
      description:
        "Giới thiệu ShopTFTMobile và Tuấn Thái Bình TFT, cách shop hỗ trợ khách tìm acc TFT/ĐTCL, quy trình bàn giao và kênh liên hệ chính thức.",
      canonical: "https://www.shoptftmobile.net/ve-shop",
      ogTitle: "Tuấn Thái Bình TFT | Về ShopTFTMobile",
      ogDescription:
        "Giới thiệu ShopTFTMobile và Tuấn Thái Bình TFT, cách shop hỗ trợ khách tìm acc TFT/ĐTCL, quy trình bàn giao và kênh liên hệ chính thức.",
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
    "/blog/tft-mua-18": {
      path: "/blog/tft-mua-18",
      name: "TFT Mùa 18 Hub",
      title: "TFT Mùa 18 – Hướng Dẫn, Meta, Pet & Sân Đấu | ShopTFTMobile",
      description:
        "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): tổng hợp hướng dẫn, meta patch mới nhất, giáo án đội hình, cẩm nang Pet Chibi, Sân Đấu và kinh nghiệm leo rank.",
      canonical: "https://www.shoptftmobile.net/blog/tft-mua-18",
      ogTitle: "TFT Mùa 18 – Hướng Dẫn, Meta, Pet & Sân Đấu | ShopTFTMobile",
      ogDescription:
        "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): tổng hợp hướng dẫn, meta patch mới nhất, giáo án đội hình, cẩm nang Pet Chibi, Sân Đấu và kinh nghiệm leo rank.",
      ogImage: "/banner-seo.jpg",
      robots: { index: true, follow: true },
    },
  },
  productTemplate: {
    titleTemplate: "{product_name} | Acc TFT - ĐTCL | {site_name}",
    descriptionTemplate:
      "Xem {product_name} ({type}) kèm {pet}, {arena} tại {site_name}. Trạng thái {status}, giá thuê minh bạch và gợi ý tài khoản tương tự.",
    defaultOgImage: "/banner-seo.jpg",
  },
  redirects: [
    {
      "id": "red-1",
      source: "/acc-moi",
      destination: "/shop?sort=newest",
      permanent: true,
      enabled: true,
      createdAt: "2026-09-30T00:00:00.000Z",
    },
    {
      id: "red-2",
      source: "/review-pet-san-dau-tft",
      destination: "/blog/cach-chon-acc-tft-theo-pet-chibi-va-san-dau",
      permanent: true,
      enabled: true,
      createdAt: "2026-10-02T00:00:00.000Z",
    },
    {
      id: "red-3",
      source: "/huong-dan-thue-acc-cu",
      destination: "/thue-acc-tft-dtcl",
      permanent: true,
      enabled: true,
      createdAt: "2026-10-02T00:00:00.000Z",
    },
  ],
  schema: {
    organizationName: "ShopTFTMobile",
    founderName: "Tuấn Thái Bình",
    founderTitle: "Cựu Thách Đấu ĐTCL",
    sameAs: [
      "https://zalo.me/0352867283",
      "https://tiktok.com/@shoptftmobile",
      "https://checkscam.vn/?qh_ss=0352867283",
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
      "/blog",
      "/blog/*",
      "/cdn-cgi/image/*",
    ],
    disallowPaths: [
      "/cdn-cgi/",
      "/admin/",
      "/admin",
      "/admin/*",
      "/profile",
      "/profile/*",
      "/login",
      "/register",
      "/pay/*",
      "/api/",
      "/api/*",
      "/*?*search=*",
      "/*?*q=*",
      "/*?*sort=*",
      "/*?*price=*",
      "/*?*type=*",
      "/*?*focus=*",
      "/*?*status=*",
      "/*?*page=*",
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
    allArenas?: string[];
    price?: number;
    hourlyPrice?: number;
    status?: string;
  },
  template: ProductSeoTemplate,
  siteName: string = "ShopTFTMobile"
): { title: string; description: string; ogImage: string } {
  const rawTitle = (account.title || account.code).trim();
  const petName =
    account.mainChibi ||
    (account.allChibi && account.allChibi.length > 0 ? account.allChibi[0] : "");
  const arenaName =
    account.mainArena ||
    (account.allArenas && account.allArenas.length > 0 ? account.allArenas[0] : "");
  const typeName = account.type === "VIP" ? "Acc VIP" : "Acc Clone";
  const statusText = account.status === "RENTED" ? "đang có khách thuê" : "còn sẵn sàng";
  const site = siteName || "ShopTFTMobile";

  // Clean fallback values for tokens
  const petText = petName ? petName : "";
  const arenaText = arenaName ? arenaName : "";

  // Title generation
  const titlePattern =
    template.titleTemplate || "{product_name} | Acc TFT - ĐTCL | {site_name}";
  let generatedTitle = titlePattern
    .replace(/{product_name}/gi, rawTitle)
    .replace(/{type}/gi, typeName)
    .replace(/{site_name}/gi, site)
    .replace(/\s+/g, " ")
    .trim();

  // Intelligent truncation if title is too long (> 68 chars)
  const suffix = ` | Acc TFT - ĐTCL | ${site}`;
  if (generatedTitle.length > 68 && rawTitle.length > 35) {
    const maxNameLen = Math.max(15, 65 - suffix.length);
    const truncatedName = rawTitle.slice(0, maxNameLen).trim().replace(/[,.-]+$/, "");
    generatedTitle = `${truncatedName}...${suffix}`;
  }

  // Description generation
  const descPattern =
    template.descriptionTemplate ||
    "Xem chi tiết {product_name} ({type}) kèm {pet}, {arena} tại {site_name}. Trạng thái {status}, giá thuê minh bạch và gợi ý tài khoản tương tự.";

  let generatedDesc = descPattern
    .replace(/{product_name}/gi, rawTitle)
    .replace(/{pet}/gi, petText)
    .replace(/{arena}/gi, arenaText)
    .replace(/{type}/gi, typeName)
    .replace(/{status}/gi, statusText)
    .replace(/{site_name}/gi, site);

  // Clean separators: remove empty commas, dangling hyphens, double spaces
  generatedDesc = generatedDesc
    .replace(/kèm\s*,\s*/gi, "kèm ")
    .replace(/kèm\s+tại/gi, "tại")
    .replace(/,\s*,/g, ",")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*-\s*-+\s*/g, " - ")
    .replace(/\s*,\s*tại/gi, " tại")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    title: generatedTitle,
    description: generatedDesc,
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

// ==========================================
// PHASE 11: SERP CTR + TITLE/META EXPERIMENTS
// ==========================================

export type SerpExperimentStatus = "Running" | "Review" | "Keep" | "Revert";
export type SerpPriority = "HIGH" | "MEDIUM" | "LOW";

export interface SerpExperimentItem {
  id: string;
  page: string;
  primaryQuery: string;
  oldTitle: string;
  testTitle: string;
  oldMeta: string;
  testMeta: string;
  startDate: string;
  reviewDate: string;
  status: SerpExperimentStatus;
  baselineImpressions: number;
  baselineClicks: number;
  baselineCtr: number;
  baselinePosition: number;
  currentImpressions?: number;
  currentClicks?: number;
  currentCtr?: number;
  currentPosition?: number;
  ctrLiftPercentage?: number;
  downstreamConversionRate?: number;
  notes?: string;
  auditFindings?: string;
}

export interface SerpCtrOpportunity {
  query: string;
  pageUrl: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  expectedCtr: number;
  ctrGap: number;
  priority: SerpPriority;
  intentType: "Commercial" | "Discovery" | "Informational" | "Brand";
  diagnosis: string;
  recommendedWording: string;
}

export interface GoogleRewriteAuditItem {
  pageUrl: string;
  configuredTitle: string;
  serpDisplayTitle: string;
  status: "matched" | "rewritten" | "truncated";
  rewriteReason: string;
  recommendation: string;
}

export interface BrandVsNonBrandMetrics {
  brandImpressions: number;
  brandClicks: number;
  brandCtr: number;
  nonBrandImpressions: number;
  nonBrandClicks: number;
  nonBrandCtr: number;
  expectedNonBrandBenchmark: number;
}

export interface OrganicConversionMetrics {
  totalOrganicVisits: number;
  shopVisits: number;
  productViews: number;
  zaloInquiries: number;
  funnelShopRate: number;
  funnelProductRate: number;
  funnelZaloRate: number;
}

export interface SerpExperimentsReport {
  summary: {
    totalExperiments: number;
    running: number;
    inReview: number;
    kept: number;
    reverted: number;
    avgCtrLift: number;
    highPriorityOpportunities: number;
  };
  experiments: SerpExperimentItem[];
  opportunities: SerpCtrOpportunity[];
  rewriteAudits: GoogleRewriteAuditItem[];
  brandVsNonBrandCtr: BrandVsNonBrandMetrics;
  organicConversionTracking: OrganicConversionMetrics;
}

/**
 * Ước tính CTR tiêu chuẩn (benchmark) theo thứ hạng tìm kiếm tự nhiên của Google
 */
export function getSerpExpectedCtr(position: number): number {
  if (position <= 1.2) return 28.0;
  if (position <= 2.0) return 15.5;
  if (position <= 3.0) return 10.5;
  if (position <= 5.0) return 7.5;
  if (position <= 7.0) return 5.8;
  if (position <= 10.0) return 4.0;
  if (position <= 15.0) return 2.2;
  if (position <= 20.0) return 1.4;
  return 0.8;
}

/**
 * Phân loại mức độ ưu tiên tối ưu SERP CTR
 * HIGH: vị trí 1-10, impressions lớn, CTR < benchmark
 * MEDIUM: vị trí 10-20, impressions đáng kể
 * LOW: vị trí > 20 (cần đẩy rank trước khi test CTR)
 */
export function categorizeSerpPriority(position: number, impressions: number, ctr: number): SerpPriority {
  const benchmark = getSerpExpectedCtr(position);
  if (position <= 10) {
    if (impressions >= 3000 && ctr < benchmark) {
      return "HIGH";
    }
    return "MEDIUM";
  }
  if (position <= 20) {
    return impressions >= 2000 ? "MEDIUM" : "LOW";
  }
  return "LOW";
}

// ==========================================
// PHASE 12: AUTOMATED SEO HEALTH CHECKS
// ==========================================

export type HealthIssueSeverity = "CRITICAL" | "WARNING" | "INFO";

export type HealthIssueCategory =
  | "canonical"
  | "broken_link"
  | "redirect"
  | "sitemap"
  | "robots"
  | "meta"
  | "heading"
  | "blog_freshness"
  | "product"
  | "image"
  | "schema"
  | "brand"
  | "404";

export type HealthIssueStatus = "open" | "ignored" | "resolved";

export type HealthScanType =
  | "full"
  | "light"
  | "technical"
  | "blog"
  | "products"
  | "links"
  | "images";

export interface SeoHealthAiSuggestion {
  type: "title_fix" | "meta_fix" | "link_fix" | "refresh_brief" | "redirect_fix" | "general_advice";
  proposal: string;
  rationale: string;
}

export interface SeoHealthIssueItem {
  id: string;
  severity: HealthIssueSeverity;
  category: HealthIssueCategory;
  page: string;
  issue: string;
  detail: string;
  suggestedAction: string;
  status: HealthIssueStatus;
  firstDetected: string;
  lastDetected: string;
  resolvedDate?: string;
  aiSuggestion?: SeoHealthAiSuggestion;
}

export interface SeoHealthScanLog {
  id: string;
  timestamp: string;
  scanType: HealthScanType;
  durationMs: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  passedCount: number;
  totalUrlsChecked: number;
  status: "success" | "failed" | "in_progress";
  message?: string;
}

export interface SitemapHealthSummary {
  totalUrls: number;
  errors: number;
  warnings: number;
  isXmlValid: boolean;
  lastChecked: string;
}

export interface RobotsHealthSummary {
  accessible: boolean;
  sitemapDeclared: boolean;
  publicBlocked: boolean;
  cdnCgiConfigured: boolean;
  privateDisallowed: boolean;
  lastChecked: string;
}

export interface RedirectHealthSummary {
  totalRules: number;
  loopsDetected: number;
  chainsDetected: number;
  destinationsValid: boolean;
}

export interface BlogFreshnessSummary {
  evergreen: number;
  needsReview: number;
  outdated: number;
}

export interface SeoHealthReport {
  summary: {
    criticalErrors: number;
    warnings: number;
    passed: number;
    info: number;
    lastScan: string;
    nextScan: string;
    scanFrequency: "daily" | "weekly";
    totalUrlsMonitored: number;
    isScanning: boolean;
  };
  issues: SeoHealthIssueItem[];
  scanLogs: SeoHealthScanLog[];
  sitemapHealth: SitemapHealthSummary;
  robotsHealth: RobotsHealthSummary;
  redirectHealth: RedirectHealthSummary;
  brokenLinksCount: number;
  blogFreshnessCount: BlogFreshnessSummary;
}


