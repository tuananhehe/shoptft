import fs from "fs";
import path from "path";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";
import {
  GlobalSeoConfig,
  PageSeoItem,
  ProductSeoTemplate,
  RedirectRule,
  SchemaConfig,
  RobotsConfig,
  SeoConfigDatabase,
  SeoAuditIssue,
  SeoAuditReport,
  ImageHealthItem,
  ImageHealthReport,
  InternalLinksAuditReport,
  DEFAULT_SEO_CONFIG,
  detectRedirectLoop,
  GscPeriodKey,
  GscQueryItem,
  GscPagePerformance,
  RankingOpportunity,
  BlogSeoConversion,
  CannibalizationIssue,
  ContentGapItem,
  TitleChangeLog,
  FunnelMetrics,
  GscSummaryMetrics,
  GscPerformanceReport,
  ContentOpportunityItem,
  ContentBrief,
  ContentOpportunityAction,
  SearchIntentType,
  BacklinkStatus,
  BacklinkType,
  BacklinkItem,
  BrandMentionItem,
  LinkableAssetItem,
  BacklinkMonitorReport,
  SerpExperimentStatus,
  SerpPriority,
  SerpExperimentItem,
  SerpCtrOpportunity,
  GoogleRewriteAuditItem,
  SerpExperimentsReport,
  getSerpExpectedCtr,
  categorizeSerpPriority,
} from "@/utils/seo-shared";
import { BlogPost } from "@/utils/blog-shared";

export * from "@/utils/seo-shared";

const STORAGE_KEY = "system/seo-config.json";
const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "seo-config.json");
const GSC_DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "search-console-data.json");
const BACKLINKS_FILE_PATH = path.join(process.cwd(), "src", "data", "backlinks-data.json");
const SERP_EXPERIMENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "serp-experiments.json");
const SERP_EXPERIMENTS_KEY = "system/serp-experiments.json";

let memorySeoConfig: SeoConfigDatabase = { ...DEFAULT_SEO_CONFIG };

/**
 * Đọc cấu hình SEO toàn hệ thống (Server only)
 */
export async function getSeoConfig(): Promise<SeoConfigDatabase> {
  try {
    const loaded = await getCloudJson<SeoConfigDatabase>(
      STORAGE_KEY,
      CONFIG_FILE_PATH,
      DEFAULT_SEO_CONFIG
    );

    if (loaded && typeof loaded === "object") {
      memorySeoConfig = {
        global: { ...DEFAULT_SEO_CONFIG.global, ...(loaded.global || {}) },
        pages: { ...DEFAULT_SEO_CONFIG.pages, ...(loaded.pages || {}) },
        productTemplate: {
          ...DEFAULT_SEO_CONFIG.productTemplate,
          ...(loaded.productTemplate || {}),
        },
        redirects: Array.isArray(loaded.redirects) ? loaded.redirects : DEFAULT_SEO_CONFIG.redirects,
        schema: { ...DEFAULT_SEO_CONFIG.schema, ...(loaded.schema || {}) },
        robotsConfig: {
          ...DEFAULT_SEO_CONFIG.robotsConfig,
          ...(loaded.robotsConfig || {}),
        },
      };
      return memorySeoConfig;
    }
  } catch (err) {
    console.warn("Lỗi đọc seo-config, dùng default:", err);
  }
  return memorySeoConfig;
}

/**
 * Ghi lưu cấu hình SEO toàn hệ thống (Server only)
 */
export async function saveSeoConfig(cfg: SeoConfigDatabase): Promise<boolean> {
  memorySeoConfig = cfg;
  return await saveCloudJson(STORAGE_KEY, cfg, CONFIG_FILE_PATH);
}

/**
 * Kiểm tra tính hợp lệ và chấm điểm sức khỏe SEO thực tế
 */
export function runSeoAudit(
  cfg: SeoConfigDatabase,
  sampleAccountCount: number = 0,
  blogPosts: BlogPost[] = []
): SeoAuditReport {
  const issues: SeoAuditIssue[] = [];
  const canonicalOrigin = cfg.global.canonicalOrigin.trim().replace(/\/+$/, "");

  // 1. Audit Global Canonical
  if (!canonicalOrigin.startsWith("https://")) {
    issues.push({
      id: "global-canonical-https",
      type: "error",
      category: "canonical",
      title: "Canonical Origin thiếu giao thức HTTPS",
      detail: `Origin hiện tại "${canonicalOrigin}" phải bắt đầu bằng https://.`,
    });
  } else if (canonicalOrigin.includes("localhost") || canonicalOrigin.includes(".vercel.app")) {
    issues.push({
      id: "global-canonical-production",
      type: "warning",
      category: "canonical",
      title: "Canonical Origin đang dùng domain thử nghiệm/local",
      detail: `Khuyến nghị dùng domain chính thức https://www.shoptftmobile.net cho môi trường production.`,
    });
  } else {
    issues.push({
      id: "global-canonical-valid",
      type: "passed",
      category: "canonical",
      title: "Canonical Origin chuẩn xác",
      detail: `Domain gốc: ${canonicalOrigin}`,
    });
  }

  // 2. Audit Core Pages Metadata
  const requiredPages = ["/", "/shop", "/thue-acc-tft-dtcl", "/ve-shop", "/huong-dan/doi-thong-tin-acc-riot"];
  const seenTitles = new Map<string, string>();

  for (const pathKey of requiredPages) {
    const p = cfg.pages[pathKey];
    if (!p) {
      issues.push({
        id: `page-missing-${pathKey}`,
        type: "error",
        category: "meta",
        page: pathKey,
        title: `Thiếu cấu hình SEO cho trang ${pathKey}`,
        detail: `Trang ${pathKey} chưa được định nghĩa trong danh sách trang SEO.`,
      });
      continue;
    }

    // Title checks
    const title = (p.title || "").trim();
    if (!title) {
      issues.push({
        id: `title-empty-${pathKey}`,
        type: "error",
        category: "meta",
        page: pathKey,
        title: `Trang ${pathKey} chưa có Title`,
        detail: "Tiêu đề trang là yếu tố xếp hạng quan trọng nhất.",
      });
    } else if (title.length < 25) {
      issues.push({
        id: `title-short-${pathKey}`,
        type: "warning",
        category: "meta",
        page: pathKey,
        title: `Tiêu đề trang ${pathKey} quá ngắn (${title.length} ký tự)`,
        detail: "Nên từ 35 - 65 ký tự để hiển thị trọn vẹn và đủ từ khóa.",
      });
    } else if (title.length > 70) {
      issues.push({
        id: `title-long-${pathKey}`,
        type: "warning",
        category: "meta",
        page: pathKey,
        title: `Tiêu đề trang ${pathKey} có thể bị Google cắt bớt (${title.length} ký tự)`,
        detail: "Tiêu đề vượt quá 65 - 70 ký tự thường bị cắt dấu ba chấm trên SERP.",
      });
    } else {
      issues.push({
        id: `title-good-${pathKey}`,
        type: "passed",
        category: "meta",
        page: pathKey,
        title: `Tiêu đề trang ${pathKey} tối ưu (${title.length} ký tự)`,
        detail: title,
      });
    }

    // Check duplicate titles across pages
    if (title) {
      const lower = title.toLowerCase();
      if (seenTitles.has(lower)) {
        issues.push({
          id: `title-duplicate-${pathKey}`,
          type: "error",
          category: "meta",
          page: pathKey,
          title: `Tiêu đề trùng lặp giữa ${pathKey} và ${seenTitles.get(lower)}`,
          detail: `Cả hai trang đều dùng tiêu đề: "${title}". Mỗi trang cần tiêu đề duy nhất.`,
        });
      } else {
        seenTitles.set(lower, pathKey);
      }
    }

    // Description checks
    const desc = (p.description || "").trim();
    if (!desc) {
      issues.push({
        id: `desc-empty-${pathKey}`,
        type: "error",
        category: "meta",
        page: pathKey,
        title: `Trang ${pathKey} chưa có Meta Description`,
        detail: "Thẻ mô tả giúp tăng tỷ lệ click (CTR) từ kết quả tìm kiếm.",
      });
    } else if (desc.length < 50) {
      issues.push({
        id: `desc-short-${pathKey}`,
        type: "warning",
        category: "meta",
        page: pathKey,
        title: `Mô tả trang ${pathKey} ngắn (${desc.length} ký tự)`,
        detail: "Khuyên dùng từ 120 - 160 ký tự để cung cấp đầy đủ thông tin cho người tìm kiếm.",
      });
    } else if (desc.length > 175) {
      issues.push({
        id: `desc-long-${pathKey}`,
        type: "warning",
        category: "meta",
        page: pathKey,
        title: `Mô tả trang ${pathKey} dài (${desc.length} ký tự)`,
        detail: "Có thể bị cắt bớt khi hiển thị trên màn hình di động.",
      });
    } else {
      issues.push({
        id: `desc-good-${pathKey}`,
        type: "passed",
        category: "meta",
        page: pathKey,
        title: `Mô tả trang ${pathKey} đạt chuẩn (${desc.length} ký tự)`,
        detail: desc,
      });
    }

    // Canonical matching origin
    if (p.canonical && !p.canonical.startsWith(canonicalOrigin)) {
      issues.push({
        id: `canonical-mismatch-${pathKey}`,
        type: "warning",
        category: "canonical",
        page: pathKey,
        title: `Canonical URL trang ${pathKey} khác với Origin hệ thống`,
        detail: `Canonical đang là "${p.canonical}", khác Origin "${canonicalOrigin}".`,
      });
    }
  }

  // 3. Product Template Audit
  const tmpl = cfg.productTemplate;
  if (!tmpl.titleTemplate.includes("{product_name}")) {
    issues.push({
      id: "product-title-missing-token",
      type: "error",
      category: "product",
      title: "Mẫu Tiêu Đề Sản Phẩm thiếu biến {product_name}",
      detail: "Mẫu tiêu đề cần chứa {product_name} để phân biệt từng tài khoản.",
    });
  } else {
    issues.push({
      id: "product-title-template-valid",
      type: "passed",
      category: "product",
      title: "Mẫu Tiêu Đề Sản Phẩm hợp lệ",
      detail: tmpl.titleTemplate,
    });
  }

  if (!tmpl.descriptionTemplate.includes("{product_name}")) {
    issues.push({
      id: "product-desc-missing-token",
      type: "warning",
      category: "product",
      title: "Mẫu Mô Tả Sản Phẩm nên có biến {product_name}",
      detail: "Giúp phần mô tả chi tiết sản phẩm cụ thể và hấp dẫn hơn.",
    });
  } else {
    issues.push({
      id: "product-desc-template-valid",
      type: "passed",
      category: "product",
      title: "Mẫu Mô Tả Sản Phẩm đạt chuẩn",
      detail: tmpl.descriptionTemplate,
    });
  }

  // 4. Redirect Rules Audit
  for (const rule of cfg.redirects || []) {
    if (rule.enabled) {
      const loopCheck = detectRedirectLoop(rule.source, rule.destination, cfg.redirects, rule.id);
      if (loopCheck.hasLoop) {
        issues.push({
          id: `redirect-loop-${rule.id}`,
          type: "error",
          category: "redirect",
          title: `Phát hiện lỗi Redirect loop ở quy tắc "${rule.source}"`,
          detail: loopCheck.message || "Vòng lặp redirect.",
        });
      }
    }
  }

  // 5. Schema / Organization
  if (!cfg.schema.organizationName || !cfg.schema.founderName) {
    issues.push({
      id: "schema-missing-org",
      type: "warning",
      category: "schema",
      title: "Thông tin Organization / Founder chưa đầy đủ",
      detail: "Cần tên Tổ chức và Người sáng lập cho dữ liệu có cấu trúc Schema.org.",
    });
  } else {
    issues.push({
      id: "schema-valid",
      type: "passed",
      category: "schema",
      title: "Cấu hình Schema.org đầy đủ",
      detail: `Tổ chức: ${cfg.schema.organizationName} | Đại diện: ${cfg.schema.founderName}`,
    });
  }

  // 6. Robots / Sitemap summary
  if (!cfg.robotsConfig.allowPaths.includes("/")) {
    issues.push({
      id: "robots-disallow-root",
      type: "error",
      category: "robots",
      title: "Robots.txt chưa cấp phép truy cập trang chủ (/)",
      detail: "Cần đảm bảo bot tìm kiếm được thu thập dữ liệu trang chủ.",
    });
  } else {
    issues.push({
      id: "robots-status-valid",
      type: "passed",
      category: "robots",
      title: "Robots.txt cấu hình an toàn & mở đường cho bot",
      detail: `Cho phép ${cfg.robotsConfig.allowPaths.length} tuyến đường chính, chặn ${cfg.robotsConfig.disallowPaths.length} trang nhạy cảm.`,
    });
  }

  // 7. Blog Posts SEO Audit
  if (blogPosts && blogPosts.length > 0) {
    const seenBlogTitles = new Map<string, string>();
    const seenBlogSlugs = new Set<string>();

    for (const post of blogPosts) {
      const pagePath = `/blog/${post.slug}`;
      const postTitle = (post.seo?.title || post.title || "").trim();
      const postDesc = (post.seo?.description || post.excerpt || "").trim();

      // Check duplicate slug
      if (seenBlogSlugs.has(post.slug)) {
        issues.push({
          id: `blog-slug-duplicate-${post.slug}`,
          type: "error",
          category: "blog",
          page: pagePath,
          title: `Đường dẫn tĩnh trùng lặp: /blog/${post.slug}`,
          detail: `Có nhiều bài viết đang sử dụng chung slug "${post.slug}". Cần chỉnh sửa để tránh xung đột URL.`,
        });
      } else {
        seenBlogSlugs.add(post.slug);
      }

      // Check title
      if (!postTitle) {
        issues.push({
          id: `blog-title-missing-${post.id}`,
          type: "error",
          category: "blog",
          page: pagePath,
          title: `Bài viết "${post.title || post.id}" thiếu Tiêu đề SEO`,
          detail: "Bài viết cần có Tiêu đề hoặc SEO Title để xếp hạng tìm kiếm.",
        });
      } else if (postTitle.length < 25) {
        issues.push({
          id: `blog-title-short-${post.id}`,
          type: "warning",
          category: "blog",
          page: pagePath,
          title: `Tiêu đề bài viết "${post.title}" hơi ngắn (${postTitle.length} ký tự)`,
          detail: "Khuyến nghị tiêu đề từ 35 - 65 ký tự để đủ từ khóa và thu hút người đọc.",
        });
      } else {
        // Check duplicate title
        const lower = postTitle.toLowerCase();
        if (seenBlogTitles.has(lower)) {
          issues.push({
            id: `blog-title-duplicate-${post.id}`,
            type: "error",
            category: "blog",
            page: pagePath,
            title: `Tiêu đề bài viết trùng lặp với "${seenBlogTitles.get(lower)}"`,
            detail: `Cả hai bài viết đều có tiêu đề: "${postTitle}".`,
          });
        } else {
          seenBlogTitles.set(lower, post.title);
        }
      }

      // Check meta description
      if (!postDesc) {
        issues.push({
          id: `blog-desc-missing-${post.id}`,
          type: "error",
          category: "blog",
          page: pagePath,
          title: `Bài viết "${post.title}" thiếu Meta Description`,
          detail: "Thẻ mô tả hoặc tóm tắt excerpt bị trống, sẽ làm giảm tỷ lệ click từ Google.",
        });
      } else if (postDesc.length < 50) {
        issues.push({
          id: `blog-desc-short-${post.id}`,
          type: "warning",
          category: "blog",
          page: pagePath,
          title: `Mô tả bài viết "${post.title}" quá ngắn (${postDesc.length} ký tự)`,
          detail: "Khuyên dùng đoạn tóm tắt từ 120 - 160 ký tự.",
        });
      }

      // Canonical check
      if (post.seo?.canonical && !post.seo.canonical.startsWith(canonicalOrigin)) {
        issues.push({
          id: `blog-canonical-mismatch-${post.id}`,
          type: "warning",
          category: "blog",
          page: pagePath,
          title: `Canonical bài viết "${post.title}" khác domain chính`,
          detail: `Canonical đang là "${post.seo.canonical}", khác Origin "${canonicalOrigin}".`,
        });
      }
    }

    const blogErrors = issues.filter((i) => i.category === "blog" && i.type === "error").length;
    if (blogErrors === 0) {
      issues.push({
        id: "blog-seo-healthy",
        type: "passed",
        category: "blog",
        title: `Hệ thống ${blogPosts.length} bài viết Blog có cấu hình SEO chuẩn`,
        detail: "Mọi bài viết đều có tiêu đề, mô tả tóm tắt và đường dẫn tĩnh hợp lệ.",
      });
    }

    // 8. Topic Cluster, Orphan Pages & Internal Link Audit
    const inboundLinks = new Map<string, number>();
    const publishedSlugs = new Set(
      blogPosts.filter((p) => p.status === "published").map((p) => p.slug.toLowerCase().trim())
    );

    // Map all links from published articles
    for (const post of blogPosts) {
      if (post.status !== "published") continue;
      const content = post.content || "";
      const pagePath = `/blog/${post.slug}`;
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const href = match[2].trim();

        // Check broken blog links
        if (href.startsWith("/blog/")) {
          const targetSlug = href.replace("/blog/", "").split(/[?#]/)[0].toLowerCase().trim();
          if (targetSlug && targetSlug !== "tft-mua-18" && !publishedSlugs.has(targetSlug)) {
            issues.push({
              id: `broken-link-${post.id}-${targetSlug}`,
              type: "error",
              category: "blog",
              page: pagePath,
              title: `Phát hiện liên kết gãy tới ${href}`,
              detail: `Bài viết "${post.title}" chứa liên kết trỏ tới bài không tồn tại hoặc đã bị xóa.`,
            });
          } else if (targetSlug) {
            inboundLinks.set(targetSlug, (inboundLinks.get(targetSlug) || 0) + 1);
          }
        }

        // Check old domain references
        if (href.includes("shoptftmobile.com") || href.includes("shoptft.vn")) {
          issues.push({
            id: `legacy-domain-link-${post.id}`,
            type: "error",
            category: "blog",
            page: pagePath,
            title: `Phát hiện link chứa tên miền cũ: ${href}`,
            detail: `Bài viết "${post.title}" cần chuyển domain sang https://www.shoptftmobile.net.`,
          });
        }
      }

      // Check hub link for TFT Mùa 18 cluster
      const isSet18Post =
        post.category === "TFT Mùa 18" ||
        post.category === "Meta & Đội Hình" ||
        post.tags.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("set 18"));

      if (isSet18Post && !content.includes("/blog/tft-mua-18")) {
        issues.push({
          id: `missing-hub-link-${post.id}`,
          type: "warning",
          category: "blog",
          page: pagePath,
          title: `Bài viết "${post.title}" chưa có liên kết về Hub /blog/tft-mua-18`,
          detail: "Các bài viết thuộc chủ đề Mùa 18 nên có anchor link trỏ về Hub để củng cố sức mạnh Topic Cluster.",
        });
      }
    }

    // Check for Orphan Pages (0 inbound links among published articles)
    for (const post of blogPosts) {
      if (post.status !== "published") continue;
      const inboundCount = inboundLinks.get(post.slug.toLowerCase().trim()) || 0;
      if (inboundCount === 0) {
        issues.push({
          id: `orphan-article-${post.id}`,
          type: "warning",
          category: "blog",
          page: `/blog/${post.slug}`,
          title: `Bài viết "${post.title}" chưa có liên kết nội bộ trỏ tới (Orphan Page)`,
          detail: "Trang mồ côi khó được Google lập chỉ mục tốt. Hãy thêm liên kết từ các bài liên quan cùng chủ đề.",
        });
      }
    }

    const clusterErrors = issues.filter(
      (i) => (i.id.startsWith("broken-link-") || i.id.startsWith("legacy-domain-")) && i.type === "error"
    ).length;
    const clusterWarnings = issues.filter(
      (i) => (i.id.startsWith("missing-hub-link-") || i.id.startsWith("orphan-article-")) && i.type === "warning"
    ).length;

    if (clusterErrors === 0 && clusterWarnings === 0) {
      issues.push({
        id: "cluster-internal-links-passed",
        type: "passed",
        category: "blog",
        title: "Cấu trúc Topic Cluster & Internal Linking đạt chuẩn",
        detail: "Mọi bài viết đều có internal links trỏ tới, kết nối với Hub Mùa 18 và không phát hiện liên kết gãy.",
      });
    }
  }

  // 9. Brand Authority & Trust Signals Audit
  // Check 1: Inconsistent Brand Name
  const brandName = (cfg.global.brandName || "").trim();
  let hasInconsistentBrand = false;
  if (brandName !== "ShopTFTMobile") {
    hasInconsistentBrand = true;
    issues.push({
      id: "brand-name-inconsistent",
      type: "warning",
      category: "brand",
      title: "Tên thương hiệu chính chưa chuẩn hóa",
      detail: `Tên thương hiệu chính hiện tại là "${brandName}", khuyến nghị chuẩn hóa thành "ShopTFTMobile" (viết liền không dấu cách).`,
    });
  }

  // Check prohibited brand variants in core page titles
  for (const [pathKey, page] of Object.entries(cfg.pages)) {
    const t = page.title || "";
    if (t.includes("Shop TFT Mobile") || t.includes("TFT Mobile Shop")) {
      hasInconsistentBrand = true;
      issues.push({
        id: `brand-variant-mismatch-${pathKey}`,
        type: "warning",
        category: "brand",
        page: pathKey,
        title: `Phát hiện biến thể thương hiệu chưa chuẩn hóa trên trang ${pathKey}`,
        detail: `Tiêu đề trang "${t}" chứa biến thể cũ. Chuẩn hóa thành "ShopTFTMobile".`,
      });
    }
  }

  if (!hasInconsistentBrand) {
    issues.push({
      id: "brand-name-consistent",
      type: "passed",
      category: "brand",
      title: "Thương hiệu chính ShopTFTMobile đồng nhất",
      detail: `Thương hiệu chính "ShopTFTMobile" và định danh phụ "${cfg.global.secondaryBrandName || "Tuấn Thái Bình TFT"}" được định nghĩa chuẩn xác.`,
    });
  }

  // Check 2: Missing Logo
  const logoUrl = (cfg.global.logoUrl || "").trim();
  if (!logoUrl) {
    issues.push({
      id: "brand-logo-missing",
      type: "warning",
      category: "brand",
      title: "Chưa cấu hình Logo thương hiệu chính thức",
      detail: "Khuyến nghị thêm đường dẫn logoUrl để công cụ tìm kiếm và Schema hiển thị thương hiệu.",
    });
  } else {
    issues.push({
      id: "brand-logo-valid",
      type: "passed",
      category: "brand",
      title: "Logo thương hiệu hợp lệ",
      detail: `Đường dẫn logo: ${logoUrl}`,
    });
  }

  // Check 3: Old Domain Reference
  let hasOldDomain = false;
  if (cfg.global.canonicalOrigin.includes("shoptftmobile.com")) {
    hasOldDomain = true;
    issues.push({
      id: "brand-old-domain-canonical",
      type: "error",
      category: "brand",
      title: "Phát hiện domain cũ .com trong Canonical Origin",
      detail: `Canonical Origin đang trỏ tới domain cũ "${cfg.global.canonicalOrigin}". Bắt buộc phải là "https://www.shoptftmobile.net".`,
    });
  }

  for (const [pathKey, page] of Object.entries(cfg.pages)) {
    if (page.canonical?.includes("shoptftmobile.com")) {
      hasOldDomain = true;
      issues.push({
        id: `brand-old-domain-${pathKey}`,
        type: "error",
        category: "brand",
        page: pathKey,
        title: `Trang ${pathKey} tham chiếu tên miền cũ shoptftmobile.com`,
        detail: `Canonical URL "${page.canonical}" dùng tên miền cũ .com thay vì .net.`,
      });
    }
  }

  if (!hasOldDomain) {
    issues.push({
      id: "brand-no-old-domain",
      type: "passed",
      category: "brand",
      title: "Không còn tham chiếu tên miền cũ .com",
      detail: "Toàn bộ cấu hình hệ thống và canonical đều trỏ chuẩn xác về shoptftmobile.net.",
    });
  }

  // Check 4: Inconsistent Support Hours
  const supportHours = (cfg.global.supportHours || "").trim();
  if (!supportHours) {
    issues.push({
      id: "brand-hours-missing",
      type: "warning",
      category: "brand",
      title: "Chưa công bố khung giờ hỗ trợ khách hàng",
      detail: 'Cần thiết lập khung giờ hỗ trợ đồng nhất (chuẩn: "11:00 - 24:00 hàng ngày").',
    });
  } else if (supportHours.toLowerCase().includes("24/7")) {
    issues.push({
      id: "brand-hours-24-7",
      type: "warning",
      category: "brand",
      title: "Khung giờ hỗ trợ chứa cam kết 24/7 chưa sát thực tế",
      detail: 'Shop hoạt động thực tế 11:00 - 24:00. Không nên quảng bá "24/7" để tránh gây thất vọng cho khách thuê đêm muộn.',
    });
  } else {
    issues.push({
      id: "brand-hours-valid",
      type: "passed",
      category: "brand",
      title: "Khung giờ hỗ trợ khách hàng đồng nhất & sát thực tế",
      detail: `Khung giờ hiện tại: ${supportHours}`,
    });
  }

  // Check 5: Broken or Empty Social Links in Schema
  const sameAsList = cfg.schema.sameAs || [];
  let brokenSocial = false;
  if (sameAsList.length === 0) {
    issues.push({
      id: "brand-social-empty",
      type: "warning",
      category: "brand",
      title: "Chưa có liên kết mạng xã hội chính thức trong sameAs",
      detail: "Cần tối thiểu liên kết Zalo hoặc TikTok chính thức để kết nối thực thể thương hiệu.",
    });
  } else {
    for (const url of sameAsList) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        brokenSocial = true;
        issues.push({
          id: `brand-social-invalid-${encodeURIComponent(url.slice(0, 20))}`,
          type: "error",
          category: "brand",
          title: `Đường dẫn mạng xã hội không hợp lệ: "${url}"`,
          detail: "Mỗi URL trong danh sách sameAs phải bắt đầu bằng http:// hoặc https://.",
        });
      }
    }
    if (!brokenSocial) {
      issues.push({
        id: "brand-social-valid",
        type: "passed",
        category: "brand",
        title: `Hồ sơ mạng xã hội xác thực (${sameAsList.length} kênh)`,
        detail: sameAsList.join(", "),
      });
    }
  }

  // Check 6: Unverified Trust Claim & Buzzwords
  const trustUrl = (cfg.global.trustVerificationUrl || "").trim();
  let hasBuzzword = false;
  const buzzwords = ["uy tín số 1", "số 1 việt nam", "an toàn 100%", "rẻ nhất thị trường", "tốt nhất vịnh bắc bộ"];

  for (const [pathKey, page] of Object.entries(cfg.pages)) {
    const combined = `${page.title} ${page.description}`.toLowerCase();
    for (const bw of buzzwords) {
      if (combined.includes(bw)) {
        hasBuzzword = true;
        issues.push({
          id: `trust-buzzword-${pathKey}`,
          type: "warning",
          category: "brand",
          page: pathKey,
          title: `Phát hiện từ ngữ tâng bốc quá mức trên trang ${pathKey}`,
          detail: `Nội dung chứa cụm "${bw}". Nên thay bằng số liệu hoặc quy trình xác thực minh bạch.`,
        });
        break;
      }
    }
  }

  if (!trustUrl || !trustUrl.includes("checkscam.vn")) {
    issues.push({
      id: "trust-checkscam-missing",
      type: "warning",
      category: "brand",
      title: "Chưa cấu hình liên kết xác minh bảo hiểm Checkscam",
      detail: "Nên bổ sung link tra cứu bảo hiểm Checkscam để tăng độ uy tín với người dùng mới.",
    });
  } else {
    issues.push({
      id: "trust-checkscam-valid",
      type: "passed",
      category: "brand",
      title: "Bảo hiểm giao dịch Checkscam minh bạch",
      detail: `Đã xác thực liên kết bảo hiểm: ${trustUrl}`,
    });
  }

  if (!hasBuzzword) {
    issues.push({
      id: "trust-tone-honest",
      type: "passed",
      category: "brand",
      title: "Văn phong thương hiệu chân thực, không tâng bốc ảo",
      detail: "Không phát hiện các cụm từ phóng đại như 'uy tín số 1', '100% an toàn', tuân thủ tiêu chuẩn E-E-A-T.",
    });
  }

  const errors = issues.filter((i) => i.type === "error").length;
  const warnings = issues.filter((i) => i.type === "warning").length;
  const passed = issues.filter((i) => i.type === "passed").length;

  let healthStatus: SeoAuditReport["healthStatus"] = "excellent";
  if (errors > 0) healthStatus = "critical";
  else if (warnings > 2) healthStatus = "needs_attention";
  else if (warnings > 0) healthStatus = "good";

  return {
    timestamp: new Date().toISOString(),
    healthStatus,
    summary: {
      total: issues.length,
      errors,
      warnings,
      passed,
    },
    issues,
  };
}

/**
 * Kiểm tra toàn diện chất lượng Image SEO, OpenGraph & Fallback trên toàn hệ sinh thái
 */
export function runImageAudit(
  cfg: SeoConfigDatabase,
  accounts: any[] = [],
  blogPosts: BlogPost[] = []
): ImageHealthReport {
  const items: ImageHealthItem[] = [];

  // 1. Audit Core Pages OG Image
  for (const [pathKey, page] of Object.entries(cfg.pages)) {
    const og = page.ogImage || cfg.global.defaultOgImage;
    if (!og || og.trim() === "") {
      items.push({
        id: `page-og-missing-${pathKey}`,
        source: "page",
        title: `Trang ${page.name || pathKey}`,
        url: pathKey,
        issue: "missing_og",
        severity: "error",
        message: "Chưa cấu hình ảnh đại diện chia sẻ mạng xã hội (OpenGraph Image).",
      });
    }
  }

  // 2. Audit Product Account Images
  for (const acc of accounts) {
    const thumb = (acc.thumbnail || "").trim();
    const title = (acc.title || "").trim();

    if (!thumb) {
      items.push({
        id: `product-broken-${acc.id}`,
        source: "product",
        title: title || acc.code || acc.id,
        url: `/acc/${acc.id}`,
        issue: "broken",
        severity: "error",
        message: "Tài khoản thiếu URL ảnh đại diện thumbnail.",
      });
    }

    if (!title) {
      items.push({
        id: `product-alt-missing-${acc.id}`,
        source: "product",
        title: acc.code || acc.id,
        url: `/acc/${acc.id}`,
        issue: "missing_alt",
        severity: "error",
        message: "Thiếu tiêu đề tài khoản để tự động sinh thuộc tính Alt cho ảnh.",
      });
    }

    if (thumb.includes("images.unsplash.com") && thumb.includes("w=3000")) {
      items.push({
        id: `product-oversized-${acc.id}`,
        source: "product",
        title: title,
        url: `/acc/${acc.id}`,
        issue: "oversized",
        severity: "warning",
        message: "Ảnh Unsplash kích thước gốc quá lớn (3000px). Cần tối ưu về kích thước hiển thị card 450px.",
      });
    }
  }

  // 3. Audit Blog Post Images
  for (const post of blogPosts) {
    const cover = (post.coverImage || "").trim();
    const postTitle = (post.title || "").trim();

    if (!cover) {
      items.push({
        id: `blog-cover-missing-${post.id}`,
        source: "blog",
        title: postTitle || post.slug,
        url: `/blog/${post.slug}`,
        issue: "broken",
        severity: "error",
        message: "Bài viết thiếu ảnh bìa đại diện (Cover Image).",
      });
    }

    if (!postTitle) {
      items.push({
        id: `blog-alt-missing-${post.id}`,
        source: "blog",
        title: post.slug,
        url: `/blog/${post.slug}`,
        issue: "missing_alt",
        severity: "error",
        message: "Thiếu tiêu đề bài viết làm mô tả thuộc tính Alt cho ảnh bìa.",
      });
    }

    if (!post.seo?.ogImage && !cover) {
      items.push({
        id: `blog-og-missing-${post.id}`,
        source: "blog",
        title: postTitle,
        url: `/blog/${post.slug}`,
        issue: "missing_og",
        severity: "warning",
        message: "Chưa cấu hình OpenGraph image chuyên biệt, đang sử dụng fallback toàn trang.",
      });
    }

    if (cover.includes("images.unsplash.com") && cover.includes("w=3000")) {
      items.push({
        id: `blog-oversized-${post.id}`,
        source: "blog",
        title: postTitle,
        url: `/blog/${post.slug}`,
        issue: "oversized",
        severity: "warning",
        message: "Ảnh bìa Unsplash có kích thước gốc quá lớn, cần tối ưu cho desktop 1200px.",
      });
    }
  }

  const missingAlt = items.filter((i) => i.issue === "missing_alt").length;
  const brokenImage = items.filter((i) => i.issue === "broken").length;
  const missingOg = items.filter((i) => i.issue === "missing_og").length;
  const oversizedImage = items.filter((i) => i.issue === "oversized").length;
  const invalidAspectRatio = items.filter((i) => i.issue === "invalid_aspect_ratio").length;

  return {
    timestamp: new Date().toISOString(),
    totalChecked: Object.keys(cfg.pages).length + accounts.length + blogPosts.length,
    missingAlt,
    brokenImage,
    missingOg,
    oversizedImage,
    invalidAspectRatio,
    items,
  };
}

/**
 * Chạy kiểm toán cấu trúc liên kết nội bộ toàn website (Phase 5 Technical SEO)
 * Kiểm tra:
 * - Trang mồ côi (Orphan pages)
 * - Liên kết hỏng (Broken internal links, 404, old domain .com)
 * - Liên kết quá tải (Excessive links > 25)
 * - Bài viết Set 18 thiếu liên kết về Hub (/blog/tft-mua-18)
 * - Liên kết trỏ vào redirect (Redirect internal links)
 */
export function runInternalLinksAudit(
  cfg: SeoConfigDatabase,
  blogPosts: BlogPost[] = [],
  accounts: any[] = []
): InternalLinksAuditReport {
  const publishedPosts = blogPosts.filter((p) => p.status === "published");
  const postSlugs = new Set(publishedPosts.map((p) => `/blog/${p.slug}`));

  // All known crawlable routes
  const coreRoutes = [
    { path: "/", title: "Trang chủ", type: "page" as const },
    { path: "/shop", title: "Kho Acc", type: "page" as const },
    { path: "/thue-acc-tft-dtcl", title: "Thuê Acc TFT - ĐTCL", type: "page" as const },
    { path: "/ve-shop", title: "Về Shop", type: "page" as const },
    { path: "/huong-dan", title: "Hướng Dẫn Dịch Vụ", type: "guide" as const },
    { path: "/huong-dan/doi-thong-tin-acc-riot", title: "Đổi Thông Tin Acc Riot", type: "guide" as const },
    { path: "/blog", title: "Blog", type: "blog" as const },
    { path: "/blog/tft-mua-18", title: "TFT Mùa 18 Hub", type: "blog" as const },
  ];

  const staticRouteSet = new Set([
    ...coreRoutes.map((r) => r.path),
    "/login",
    "/admin",
  ]);

  const accountRouteSet = new Set(
    accounts.map((a) => {
      const cleanCode = a.code ? a.code.replace(/^MS:\s*/i, "").trim() : "";
      return `/acc/${cleanCode || a.id}`;
    })
  );

  // Inbound links counter map
  const inboundCount = new Map<string, number>();
  coreRoutes.forEach((r) => inboundCount.set(r.path, 0));
  publishedPosts.forEach((p) => inboundCount.set(`/blog/${p.slug}`, 0));

  // Core pages link to each other naturally (Navbar, Footer, Hero, CTA, Breadcrumbs)
  coreRoutes.forEach((r) => {
    inboundCount.set(r.path, (inboundCount.get(r.path) || 0) + 1);
  });

  const brokenLinks: Array<{ source: string; target: string; reason: string }> = [];
  const excessiveLinks: Array<{ path: string; totalLinks: number; warning: string }> = [];
  const missingHubLinks: Array<{ path: string; title: string; category: string }> = [];
  const redirectLinks: Array<{ source: string; target: string; destination: string }> = [];

  // Active redirect sources map
  const redirectMap = new Map<string, string>();
  (cfg.redirects || []).forEach((r) => {
    if (r.enabled) {
      redirectMap.set(r.source, r.destination);
    }
  });

  let totalInternalLinks = 0;

  // Audit each blog post content
  publishedPosts.forEach((post) => {
    const postPath = `/blog/${post.slug}`;
    const content = post.content || "";
    const rawMatches = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    const links = rawMatches.map((m) => ({ anchor: m[1], href: m[2] }));

    let outboundInternalCount = 0;
    let hasHubLink = false;

    const isSet18 =
      post.category === "TFT Mùa 18" ||
      post.category === "Meta & Đội Hình" ||
      post.tags?.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("set 18"));

    links.forEach(({ href }) => {
      if (href.startsWith("/") && !href.startsWith("//")) {
        outboundInternalCount++;
        totalInternalLinks++;
        const cleanTarget = href.split("?")[0].split("#")[0].trim();

        if (inboundCount.has(cleanTarget)) {
          inboundCount.set(cleanTarget, (inboundCount.get(cleanTarget) || 0) + 1);
        }

        if (cleanTarget === "/blog/tft-mua-18") {
          hasHubLink = true;
        }

        if (redirectMap.has(cleanTarget)) {
          redirectLinks.push({
            source: postPath,
            target: href,
            destination: redirectMap.get(cleanTarget) || "",
          });
        }

        const isValidTarget =
          staticRouteSet.has(cleanTarget) ||
          postSlugs.has(cleanTarget) ||
          accountRouteSet.has(cleanTarget) ||
          cleanTarget === "" ||
          href.startsWith("/#") ||
          href.includes("?");

        if (!isValidTarget) {
          brokenLinks.push({
            source: postPath,
            target: href,
            reason: "URL đích không tồn tại trong hệ thống (404)",
          });
        }
      } else if (href.includes("shoptftmobile.com")) {
        brokenLinks.push({
          source: postPath,
          target: href,
          reason: "Sử dụng tên miền cũ .com thay vì domain chuẩn .net",
        });
      }
    });

    if (isSet18 && !hasHubLink) {
      missingHubLinks.push({
        path: postPath,
        title: post.title,
        category: post.category,
      });
    }

    if (outboundInternalCount > 25) {
      excessiveLinks.push({
        path: postPath,
        totalLinks: outboundInternalCount,
        warning: `Có ${outboundInternalCount} liên kết nội bộ trong bài viết (khuyên dùng 2-8 liên kết để tránh loãng PageRank)`,
      });
    }
  });

  // Hub page links to all Set 18 articles
  publishedPosts.forEach((post) => {
    const postPath = `/blog/${post.slug}`;
    const isSet18 =
      post.category === "TFT Mùa 18" ||
      post.category === "Meta & Đội Hình" ||
      post.category === "Kinh nghiệm TFT" ||
      post.category === "Pet / Chibi / Sân Đấu" ||
      post.tags?.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("tft"));

    if (isSet18) {
      inboundCount.set(postPath, (inboundCount.get(postPath) || 0) + 1);
    }
  });

  // Detect orphan pages (0 inbound links)
  const orphanPages: Array<{ path: string; title: string; type: "blog" | "page" | "guide" }> = [];

  coreRoutes.forEach((r) => {
    if ((inboundCount.get(r.path) || 0) === 0) {
      orphanPages.push({ path: r.path, title: r.title, type: r.type });
    }
  });

  publishedPosts.forEach((p) => {
    const pPath = `/blog/${p.slug}`;
    if ((inboundCount.get(pPath) || 0) === 0) {
      orphanPages.push({ path: pPath, title: p.title, type: "blog" });
    }
  });

  let healthStatus: "excellent" | "good" | "needs_attention" | "critical" = "excellent";
  if (brokenLinks.length > 5 || orphanPages.length > 3) {
    healthStatus = "critical";
  } else if (brokenLinks.length > 0 || orphanPages.length > 0) {
    healthStatus = "needs_attention";
  } else if (missingHubLinks.length > 0 || redirectLinks.length > 0) {
    healthStatus = "good";
  }

  return {
    timestamp: new Date().toISOString(),
    healthStatus,
    totalPagesAudited: coreRoutes.length + publishedPosts.length,
    totalInternalLinks,
    orphanPages,
    brokenLinks,
    excessiveLinks,
    missingHubLinks,
    redirectLinks,
  };
}

/**
 * Đọc dữ liệu Google Search Console và phân tích Ranking Optimization
 */
export async function getSearchConsoleReport(
  period: GscPeriodKey = "28d"
): Promise<GscPerformanceReport> {
  let rawData: any = null;
  try {
    if (fs.existsSync(GSC_DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(GSC_DATA_FILE_PATH, "utf-8");
      rawData = JSON.parse(fileContent);
    }
  } catch (err) {
    console.warn("Lỗi đọc search-console-data.json:", err);
  }

  const selectedPeriodData =
    rawData?.periods?.[period] || rawData?.periods?.["28d"] || {};

  const summary: GscSummaryMetrics = selectedPeriodData.summary || {
    clicks: 4280,
    impressions: 86450,
    ctr: 4.95,
    avgPosition: 8.7,
    brandClicks: 1820,
    nonBrandClicks: 2460,
    nonBrandClicksPercentage: 57.48,
    brandImpressions: 16400,
    nonBrandImpressions: 70050,
    brandCtr: 11.1,
    nonBrandCtr: 3.51,
    brandAvgPosition: 1.4,
    nonBrandAvgPosition: 10.4,
  };

  const allQueries: GscQueryItem[] = selectedPeriodData.queries || [];
  const brandQueries = allQueries.filter((q) => q.group === "BRAND");
  const nonBrandQueries = allQueries.filter((q) => q.group !== "BRAND");

  const fallback28d = rawData?.periods?.["28d"] || {};
  const topPages: GscPagePerformance[] =
    selectedPeriodData.pages?.length > 0
      ? selectedPeriodData.pages
      : fallback28d.pages || [];
  const opportunities: RankingOpportunity[] =
    selectedPeriodData.opportunities?.length > 0
      ? selectedPeriodData.opportunities
      : fallback28d.opportunities || [];
  const cannibalization: CannibalizationIssue[] =
    selectedPeriodData.cannibalization?.length > 0
      ? selectedPeriodData.cannibalization
      : fallback28d.cannibalization || [];
  const contentGaps: ContentGapItem[] =
    selectedPeriodData.contentGaps?.length > 0
      ? selectedPeriodData.contentGaps
      : fallback28d.contentGaps || [];
  const blogPerformance: BlogSeoConversion[] =
    selectedPeriodData.blogPerformance?.length > 0
      ? selectedPeriodData.blogPerformance
      : fallback28d.blogPerformance || [];
  const funnel: FunnelMetrics = selectedPeriodData.funnel ||
    fallback28d.funnel || {
      organicVisits: summary.clicks,
      shopVisits: Math.round(summary.clicks * 0.5),
      productViews: Math.round(summary.clicks * 0.29),
      zaloClicks: Math.round(summary.clicks * 0.062),
      organicToShopRate: 50.0,
      shopToProductRate: 58.0,
      productToZaloRate: 21.4,
      overallConversionRate: 6.2,
    };

  const titleHistory: TitleChangeLog[] = rawData?.titleHistory || [];
  const contentOpportunities: ContentOpportunityItem[] = rawData?.contentOpportunities || [];

  return {
    period,
    summary,
    brandQueries,
    nonBrandQueries,
    topPages,
    opportunities,
    cannibalization,
    contentGaps,
    blogPerformance,
    funnel,
    titleHistory,
    contentOpportunities,
  };
}

/**
 * Đọc danh sách cơ hội mở rộng nội dung từ truy vấn tìm kiếm thực tế (Content Opportunities)
 */
export async function getContentOpportunities(): Promise<ContentOpportunityItem[]> {
  try {
    if (fs.existsSync(GSC_DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(GSC_DATA_FILE_PATH, "utf-8");
      const rawData = JSON.parse(fileContent);
      return rawData.contentOpportunities || [];
    }
  } catch (err) {
    console.warn("Lỗi đọc content opportunities:", err);
  }
  return [];
}

/**
 * Đọc danh sách Content Briefs phục vụ AI Draft & Admin Review
 */
export async function getContentBriefs(): Promise<ContentBrief[]> {
  try {
    if (fs.existsSync(GSC_DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(GSC_DATA_FILE_PATH, "utf-8");
      const rawData = JSON.parse(fileContent);
      return rawData.contentBriefs || [];
    }
  } catch (err) {
    console.warn("Lỗi đọc content briefs:", err);
  }
  return [];
}

/**
 * Lấy chi tiết một Content Brief theo ID
 */
export async function getContentBriefById(briefId: string): Promise<ContentBrief | null> {
  const briefs = await getContentBriefs();
  return briefs.find((b) => b.id === briefId) || null;
}

/**
 * Đọc lịch sử thay đổi tiêu đề (Title Testing / History)
 */
export async function getTitleChangeHistory(): Promise<TitleChangeLog[]> {
  try {
    if (fs.existsSync(GSC_DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(GSC_DATA_FILE_PATH, "utf-8");
      const rawData = JSON.parse(fileContent);
      return rawData.titleHistory || [];
    }
  } catch (err) {
    console.warn("Lỗi đọc title history:", err);
  }
  return [];
}

/**
 * AI Ranking Proposal Generator (Read-only Proposal Engine)
 * Lưu ý: Động cơ chỉ đưa ra đề xuất tối ưu (Proposal-only), không bao giờ tự động ghi đè trang live.
 */
export function generateAiRankingProposal(
  query: string,
  pageUrl: string,
  opportunityType: string
): {
  targetQuery: string;
  targetPage: string;
  proposedTitle: string;
  proposedMetaDescription: string;
  missingSections: string[];
  internalLinkAnchors: Array<{ sourcePage: string; anchorText: string }>;
  searchIntentNote: string;
  safeguardNote: string;
} {
  const cleanQ = query.trim().toLowerCase();

  let proposedTitle = `${query} | ShopTFTMobile`;
  let proposedMetaDescription = `Xem và lựa chọn tài khoản ${query} minh bạch tại ShopTFTMobile. Hỗ trợ giao dịch nhanh và an toàn.`;
  let missingSections = [
    "FAQ giải đáp các thắc mắc phổ biến về dịch vụ",
    "Bảng giá chi tiết theo giờ, ngày và combo thuê",
    "Cam kết bảo mật tài khoản và hỗ trợ trực tiếp qua Zalo (11:00 - 24:00)",
  ];
  let internalLinkAnchors = [
    { sourcePage: "/", anchorText: `dịch vụ ${query}` },
    { sourcePage: "/blog/tft-mua-18", anchorText: query },
  ];
  let searchIntentNote = "Ý định tìm kiếm kết hợp thông tin và thương mại.";

  if (cleanQ.includes("thuê acc tft") || cleanQ.includes("thue acc tft")) {
    proposedTitle = "Thuê Acc TFT - ĐTCL: Pet, Chibi & Sân Đấu | ShopTFTMobile";
    proposedMetaDescription =
      "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone tại ShopTFTMobile. Xem cách chọn acc, quy trình thuê và liên hệ hỗ trợ trực tiếp qua Zalo.";
    missingSections = [
      "So sánh chi tiết khác biệt giữa gói VIP và Clone",
      "Quy trình 3 bước nhận tài khoản và đổi mật khẩu Riot",
      "Chính sách bảo hiểm Checkscam và hỗ trợ khách hàng",
    ];
    internalLinkAnchors = [
      { sourcePage: "/blog/tft-mua-18", anchorText: "thuê acc TFT mùa 18" },
      { sourcePage: "/ve-shop", anchorText: "thuê acc TFT uy tín" },
      { sourcePage: "/huong-dan", anchorText: "thuê acc TFT an toàn" },
    ];
    searchIntentNote = "Commercial Intent: Người dùng tìm dịch vụ cho thuê uy tín, cần thông tin minh bạch về giá và trạng thái acc.";
  } else if (cleanQ.includes("mùa 18") || cleanQ.includes("mua 18")) {
    proposedTitle = "TFT Mùa 18 – Hướng Dẫn, Meta, Pet & Sân Đấu | ShopTFTMobile";
    proposedMetaDescription =
      "Cổng thông tin toàn diện về TFT Mùa 18 (Đại Ngàn Kỳ Bí): tổng hợp hướng dẫn, meta patch mới nhất, giáo án đội hình, cẩm nang Pet Chibi và kinh nghiệm leo rank.";
    missingSections = [
      "Tổng quan tộc hệ mới và cơ chế Tinh Linh (Wisps)",
      "Tier list đội hình chuẩn meta Patch 18.3b",
      "Bộ sưu tập Linh Thú Tí Nị và Sàn Đấu đổi nhạc đặc biệt",
    ];
    internalLinkAnchors = [
      { sourcePage: "/", anchorText: "TFT Mùa 18 Hub" },
      { sourcePage: "/shop", anchorText: "acc TFT Mùa 18" },
    ];
    searchIntentNote = "Content/Informational Intent: Game thủ tìm kiếm cẩm nang cập nhật và giáo án đội hình để leo rank.";
  } else if (cleanQ.includes("kho acc") || cleanQ.includes("acc tft")) {
    proposedTitle = "Kho Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile";
    proposedMetaDescription =
      "Xem kho acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP/Clone và mức giá tại ShopTFTMobile. Kiểm tra trạng thái acc và chọn tài khoản phù hợp.";
    missingSections = [
      "Bộ lọc nhanh theo tướng Tí Nị yêu thích",
      "Danh mục tài khoản sẵn sàng thuê ngay lập tức",
      "Hướng dẫn liên hệ giữ acc qua Zalo",
    ];
    internalLinkAnchors = [
      { sourcePage: "/thue-acc-tft-dtcl", anchorText: "xem kho acc TFT" },
      { sourcePage: "/blog/tft-mua-18", anchorText: "kho acc TFT Pet Chibi" },
    ];
    searchIntentNote = "Catalog Discovery: Người dùng muốn duyệt danh sách tài khoản cụ thể.";
  }

  return {
    targetQuery: query,
    targetPage: pageUrl,
    proposedTitle,
    proposedMetaDescription,
    missingSections,
    internalLinkAnchors,
    searchIntentNote,
    safeguardNote: "Khuyến nghị chỉ mang tính tham khảo (Proposal Only). Admin phải duyệt trước khi áp dụng.",
  };
}

/**
 * Đọc dữ liệu Backlink Monitor, Brand Mentions và Linkable Assets
 */
export async function getBacklinkMonitorReport(): Promise<BacklinkMonitorReport> {
  let raw: {
    backlinks: BacklinkItem[];
    brandMentions: BrandMentionItem[];
    linkableAssets: LinkableAssetItem[];
  } = {
    backlinks: [],
    brandMentions: [],
    linkableAssets: [],
  };

  try {
    if (fs.existsSync(BACKLINKS_FILE_PATH)) {
      const fileData = fs.readFileSync(BACKLINKS_FILE_PATH, "utf-8");
      raw = JSON.parse(fileData);
    }
  } catch (e) {
    console.warn("Lỗi đọc backlinks-data.json:", e);
  }

  const backlinks: BacklinkItem[] = Array.isArray(raw.backlinks) ? raw.backlinks : [];
  const brandMentions: BrandMentionItem[] = Array.isArray(raw.brandMentions) ? raw.brandMentions : [];
  const linkableAssets: LinkableAssetItem[] = Array.isArray(raw.linkableAssets) ? raw.linkableAssets : [];

  const uniqueDomains = new Set<string>();
  let dofollowCount = 0;
  let nofollowCount = 0;
  let ugcCount = 0;
  let brandMentionsCount = 0;
  let activeCount = 0;
  let redirectCount = 0;
  let brokenCount = 0;
  let lostCount = 0;
  let oldDomainComCount = 0;
  let oldDomainResolvedCount = 0;

  const targetCounts = new Map<string, { count: number; domains: Set<string> }>();
  const brokenTargetMap = new Map<string, number>();

  for (const b of backlinks) {
    if (b.sourceDomain) uniqueDomains.add(b.sourceDomain.toLowerCase());
    if (b.type === "dofollow") dofollowCount++;
    else if (b.type === "nofollow") nofollowCount++;
    else if (b.type === "ugc") ugcCount++;
    else if (b.type === "brand_mention") brandMentionsCount++;

    if (b.status === "active") activeCount++;
    else if (b.status === "301_redirect") redirectCount++;
    else if (b.status === "broken") brokenCount++;
    else if (b.status === "lost") lostCount++;

    const isComTarget = b.targetUrl.toLowerCase().includes("shoptftmobile.com");
    if (isComTarget) {
      oldDomainComCount++;
      if (b.status === "301_redirect") oldDomainResolvedCount++;
    }

    if (b.status === "broken") {
      brokenTargetMap.set(b.targetUrl, (brokenTargetMap.get(b.targetUrl) || 0) + 1);
    }

    // Top linked targets
    const normTarget = b.targetUrl.replace(/^https?:\/\/[^/]+/, "") || "/";
    const curr = targetCounts.get(normTarget) || { count: 0, domains: new Set<string>() };
    curr.count++;
    if (b.sourceDomain) curr.domains.add(b.sourceDomain.toLowerCase());
    targetCounts.set(normTarget, curr);
  }

  const brokenTargets = Array.from(brokenTargetMap.entries()).map(([targetUrl, count]) => {
    let suggestedRedirect = "/";
    if (targetUrl.includes("thue-acc") || targetUrl.includes("rent")) suggestedRedirect = "/thue-acc-tft-dtcl";
    else if (targetUrl.includes("shop") || targetUrl.includes("acc")) suggestedRedirect = "/shop";
    else if (targetUrl.includes("huong-dan") || targetUrl.includes("guide")) suggestedRedirect = "/huong-dan";
    else if (targetUrl.includes("pet") || targetUrl.includes("san-dau") || targetUrl.includes("mua-18")) suggestedRedirect = "/blog/tft-mua-18";
    return { targetUrl, count, suggestedRedirect };
  });

  const topLinkedPages = Array.from(targetCounts.entries())
    .map(([path, data]) => ({
      path,
      title: path === "/" ? "Trang chủ" : path,
      referringDomains: data.domains.size,
      backlinkCount: data.count,
    }))
    .sort((a, b) => b.backlinkCount - a.backlinkCount);

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalBacklinks: backlinks.length,
      totalReferringDomains: uniqueDomains.size,
      dofollowCount,
      nofollowCount,
      ugcCount,
      brandMentionsCount,
      activeCount,
      redirectCount,
      brokenCount,
      lostCount,
      oldDomainComCount,
      oldDomainResolvedCount,
    },
    backlinks,
    brandMentions,
    linkableAssets,
    brokenTargets,
    topLinkedPages,
  };
}

/**
 * Ghi đè toàn bộ dữ liệu Backlink
 */
export async function saveBacklinkData(data: {
  backlinks: BacklinkItem[];
  brandMentions: BrandMentionItem[];
  linkableAssets: LinkableAssetItem[];
}): Promise<boolean> {
  try {
    fs.writeFileSync(BACKLINKS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Lỗi lưu backlinks-data.json:", e);
    return false;
  }
}

/**
 * Thêm mới một bản ghi Backlink thủ công
 */
export async function addBacklinkItem(
  item: Omit<BacklinkItem, "id" | "firstSeen" | "lastSeen">
): Promise<BacklinkItem> {
  const current = await getBacklinkMonitorReport();
  const id = `bl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let domain = item.sourceDomain;
  if (!domain && item.sourceUrl) {
    try {
      domain = new URL(item.sourceUrl).hostname.replace(/^www\./, "");
    } catch {
      domain = item.sourceUrl;
    }
  }

  const newItem: BacklinkItem = {
    ...item,
    id,
    sourceDomain: domain || "unknown",
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };

  const updatedBacklinks = [newItem, ...current.backlinks];
  await saveBacklinkData({
    backlinks: updatedBacklinks,
    brandMentions: current.brandMentions,
    linkableAssets: current.linkableAssets,
  });

  return newItem;
}

/**
 * Cập nhật một bản ghi Backlink
 */
export async function updateBacklinkItem(
  id: string,
  updates: Partial<BacklinkItem>
): Promise<BacklinkItem | null> {
  const current = await getBacklinkMonitorReport();
  const idx = current.backlinks.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const updatedItem: BacklinkItem = {
    ...current.backlinks[idx],
    ...updates,
    lastSeen: new Date().toISOString(),
  };

  current.backlinks[idx] = updatedItem;
  await saveBacklinkData({
    backlinks: current.backlinks,
    brandMentions: current.brandMentions,
    linkableAssets: current.linkableAssets,
  });

  return updatedItem;
}

/**
 * Xóa một bản ghi Backlink
 */
export async function deleteBacklinkItem(id: string): Promise<boolean> {
  const current = await getBacklinkMonitorReport();
  const filtered = current.backlinks.filter((b) => b.id !== id);
  if (filtered.length === current.backlinks.length) return false;

  await saveBacklinkData({
    backlinks: filtered,
    brandMentions: current.brandMentions,
    linkableAssets: current.linkableAssets,
  });

  return true;
}

/**
 * Import danh sách Backlink từ CSV/Text
 */
export async function importBacklinksCsv(
  csvContent: string
): Promise<{ importedCount: number; errors: string[] }> {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { importedCount: 0, errors: ["Nội dung CSV trống."] };

  const current = await getBacklinkMonitorReport();
  const newItems: BacklinkItem[] = [];
  const errors: string[] = [];

  let startIdx = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes("source") && (firstLine.includes("target") || firstLine.includes("anchor"))) {
    startIdx = 1;
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
    if (parts.length < 2) {
      errors.push(`Dòng ${i + 1}: Không đủ cột (cần ít nhất Source URL và Target URL).`);
      continue;
    }

    const sourceUrl = parts[0];
    const targetUrl = parts[1];
    const anchorText = parts[2] || "ShopTFTMobile";
    const type = (parts[3]?.toLowerCase() as BacklinkType) || "dofollow";
    const status = (parts[4]?.toLowerCase() as BacklinkStatus) || "active";
    const notes = parts[5] || "Imported via CSV";

    let domain = "external";
    try {
      domain = new URL(sourceUrl).hostname.replace(/^www\./, "");
    } catch {
      domain = sourceUrl.slice(0, 30);
    }

    newItems.push({
      id: `bl-csv-${Date.now()}-${i}`,
      sourceUrl,
      sourceDomain: domain,
      targetUrl,
      anchorText,
      type: ["dofollow", "nofollow", "ugc", "brand_mention"].includes(type) ? type : "dofollow",
      status: ["active", "301_redirect", "broken", "lost"].includes(status) ? status : "active",
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      authorityCategory: "community",
      notes,
    });
  }

  if (newItems.length > 0) {
    await saveBacklinkData({
      backlinks: [...newItems, ...current.backlinks],
      brandMentions: current.brandMentions,
      linkableAssets: current.linkableAssets,
    });
  }

  return { importedCount: newItems.length, errors };
}

// ==========================================
// PHASE 11: SERP CTR & TITLE/META EXPERIMENTS
// ==========================================

const DEFAULT_SERP_REPORT: SerpExperimentsReport = {
  summary: {
    totalExperiments: 5,
    running: 1,
    inReview: 1,
    kept: 3,
    reverted: 0,
    avgCtrLift: 25.1,
    highPriorityOpportunities: 5,
  },
  experiments: [],
  opportunities: [],
  rewriteAudits: [],
  brandVsNonBrandCtr: {
    brandImpressions: 16400,
    brandClicks: 1820,
    brandCtr: 11.10,
    nonBrandImpressions: 70050,
    nonBrandClicks: 2460,
    nonBrandCtr: 3.51,
    expectedNonBrandBenchmark: 4.50,
  },
  organicConversionTracking: {
    totalOrganicVisits: 4280,
    shopVisits: 3120,
    productViews: 2480,
    zaloInquiries: 486,
    funnelShopRate: 72.9,
    funnelProductRate: 57.9,
    funnelZaloRate: 11.4,
  },
};

/**
 * Lấy toàn bộ báo cáo và dữ liệu thử nghiệm SERP CTR
 */
export async function getSerpExperimentsReport(): Promise<SerpExperimentsReport> {
  try {
    const loaded = await getCloudJson<SerpExperimentsReport>(
      SERP_EXPERIMENTS_KEY,
      SERP_EXPERIMENTS_FILE_PATH,
      DEFAULT_SERP_REPORT
    );

    if (loaded && typeof loaded === "object" && Array.isArray(loaded.experiments)) {
      const exps = loaded.experiments;
      const opps = Array.isArray(loaded.opportunities) ? loaded.opportunities : [];
      const rewrites = Array.isArray(loaded.rewriteAudits) ? loaded.rewriteAudits : [];

      const running = exps.filter((e) => e.status === "Running").length;
      const inReview = exps.filter((e) => e.status === "Review").length;
      const kept = exps.filter((e) => e.status === "Keep").length;
      const reverted = exps.filter((e) => e.status === "Revert").length;
      const completedWithLift = exps.filter((e) => e.ctrLiftPercentage !== undefined);
      const avgCtrLift =
        completedWithLift.length > 0
          ? +(
              completedWithLift.reduce((acc, cur) => acc + (cur.ctrLiftPercentage || 0), 0) /
              completedWithLift.length
            ).toFixed(1)
          : 0;

      const highPriorityCount = opps.filter((o) => o.priority === "HIGH").length;

      return {
        summary: {
          totalExperiments: exps.length,
          running,
          inReview,
          kept,
          reverted,
          avgCtrLift,
          highPriorityOpportunities: highPriorityCount,
        },
        experiments: exps,
        opportunities: opps,
        rewriteAudits: rewrites,
        brandVsNonBrandCtr: loaded.brandVsNonBrandCtr || DEFAULT_SERP_REPORT.brandVsNonBrandCtr,
        organicConversionTracking:
          loaded.organicConversionTracking || DEFAULT_SERP_REPORT.organicConversionTracking,
      };
    }
  } catch (err) {
    console.warn("Lỗi đọc serp-experiments, dùng default:", err);
  }

  return DEFAULT_SERP_REPORT;
}

/**
 * Lưu dữ liệu thử nghiệm SERP CTR
 */
export async function saveSerpExperimentsData(data: SerpExperimentsReport): Promise<boolean> {
  return await saveCloudJson(SERP_EXPERIMENTS_KEY, data, SERP_EXPERIMENTS_FILE_PATH);
}

/**
 * Thêm một thử nghiệm Title/Meta SERP mới
 */
export async function addSerpExperiment(
  item: Omit<SerpExperimentItem, "id">
): Promise<SerpExperimentItem> {
  const current = await getSerpExperimentsReport();
  const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Tự động tính CTR baseline
  const baselineCtr =
    item.baselineImpressions > 0
      ? +((item.baselineClicks / item.baselineImpressions) * 100).toFixed(2)
      : item.baselineCtr || 0;

  const newItem: SerpExperimentItem = {
    ...item,
    id,
    baselineCtr,
    status: item.status || "Running",
    startDate: item.startDate || new Date().toISOString(),
    reviewDate:
      item.reviewDate ||
      new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const updatedExperiments = [newItem, ...current.experiments];

  const updatedReport: SerpExperimentsReport = {
    ...current,
    experiments: updatedExperiments,
  };

  await saveSerpExperimentsData(updatedReport);
  return newItem;
}

/**
 * Cập nhật trạng thái một thử nghiệm (Running, Review, Keep, Revert)
 */
export async function updateSerpExperiment(
  id: string,
  updates: Partial<SerpExperimentItem>
): Promise<SerpExperimentItem | null> {
  const current = await getSerpExperimentsReport();
  const idx = current.experiments.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const existing = current.experiments[idx];
  const merged: SerpExperimentItem = {
    ...existing,
    ...updates,
  };

  // Tự động cập nhật CTR hiện tại và % Lift nếu có dữ liệu mới
  if (merged.currentImpressions && merged.currentImpressions > 0 && merged.currentClicks !== undefined) {
    merged.currentCtr = +((merged.currentClicks / merged.currentImpressions) * 100).toFixed(2);
    if (merged.baselineCtr > 0) {
      merged.ctrLiftPercentage = +(
        ((merged.currentCtr - merged.baselineCtr) / merged.baselineCtr) *
        100
      ).toFixed(1);
    }
  }

  current.experiments[idx] = merged;
  await saveSerpExperimentsData(current);
  return merged;
}

/**
 * Xóa một thử nghiệm SERP
 */
export async function deleteSerpExperiment(id: string): Promise<boolean> {
  const current = await getSerpExperimentsReport();
  const filtered = current.experiments.filter((e) => e.id !== id);
  if (filtered.length === current.experiments.length) return false;

  current.experiments = filtered;
  await saveSerpExperimentsData(current);
  return true;
}

export interface AiTitleVariant {
  type: "Intent-Driven" | "Feature-Driven" | "Action-Oriented" | "Authority-Trust";
  title: string;
  rationale: string;
  length: number;
}

export interface AiMetaVariant {
  type: "Commercial-Value" | "Discovery-Catalog" | "Security-Support";
  meta: string;
  rationale: string;
  length: number;
}

/**
 * Trợ lý AI sinh 4 biến thể Title tối ưu SERP CTR (Độ dài < 65 ký tự, không nhồi nhét, chuẩn Intent)
 */
export function generateAiTitleVariants(
  pageUrl: string,
  targetQuery: string,
  currentTitle?: string
): AiTitleVariant[] {
  const q = (targetQuery || "thuê acc tft").trim();
  const brand = "ShopTFTMobile";

  // Chuẩn hoá query viết hoa chữ cái đầu tự nhiên
  const qCap = q
    .split(" ")
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");

  if (pageUrl.includes("thue-acc") || q.toLowerCase().includes("thuê")) {
    return [
      {
        type: "Intent-Driven",
        title: `Thuê Acc TFT - ĐTCL Giá Tốt: Pet, Chibi & Sân Đấu | ${brand}`,
        rationale: "Trực diện nhu cầu tìm thuê, nêu rõ 3 loại cosmetic chính (Pet, Chibi, Sân Đấu).",
        length: `Thuê Acc TFT - ĐTCL Giá Tốt: Pet, Chibi & Sân Đấu | ${brand}`.length,
      },
      {
        type: "Feature-Driven",
        title: `Thuê Acc TFT VIP & Clone: Đủ Chibi Sân Sàn Hot | ${brand}`,
        rationale: "Nhấn mạnh hai phân khúc tài khoản VIP và Clone, thu hút game thủ cần acc rank hoặc skin.",
        length: `Thuê Acc TFT VIP & Clone: Đủ Chibi Sân Sàn Hot | ${brand}`.length,
      },
      {
        type: "Action-Oriented",
        title: `Thuê Acc TFT Uy Tín Từ 3K/h - Nhận Acc Trong 3 Phút | ${brand}`,
        rationale: "Kích hoạt CTR mạnh mẽ nhờ rào cản giá thấp (3K/h) và cam kết thời gian bàn giao tức thì.",
        length: `Thuê Acc TFT Uy Tín Từ 3K/h - Nhận Acc Trong 3 Phút | ${brand}`.length,
      },
      {
        type: "Authority-Trust",
        title: `Thuê Acc TFT An Toàn 100%: Bảo Hành Trọn Phiên | ${brand}`,
        rationale: "Đánh trúng nỗi lo bị back acc hoặc lỗi tài khoản khi thuê của người dùng mới.",
        length: `Thuê Acc TFT An Toàn 100%: Bảo Hành Trọn Phiên | ${brand}`.length,
      },
    ];
  }

  if (pageUrl.includes("shop") || q.toLowerCase().includes("kho acc")) {
    return [
      {
        type: "Intent-Driven",
        title: `Kho Acc TFT - ĐTCL: Lọc Pet Chibi & Sân Đấu Sẵn Sàng | ${brand}`,
        rationale: "Tập trung vào tính năng khám phá danh mục và tình trạng tài khoản còn trống.",
        length: `Kho Acc TFT - ĐTCL: Lọc Pet Chibi & Sân Đấu Sẵn Sàng | ${brand}`.length,
      },
      {
        type: "Feature-Driven",
        title: `100+ Acc TFT VIP & Clone: Đủ Tí Nị & Sân Đổi Nhạc | ${brand}`,
        rationale: "Dùng con số cụ thể (100+) tạo cảm giác phong phú, liệt kê sân hot nhất meta.",
        length: `100+ Acc TFT VIP & Clone: Đủ Tí Nị & Sân Đổi Nhạc | ${brand}`.length,
      },
      {
        type: "Action-Oriented",
        title: `Kho Acc TFT Sẵn Sàng Thuê Ngay - Bảng Giá Minh Bạch | ${brand}`,
        rationale: "Kêu gọi hành động chọn tài khoản chơi ngay kèm cam kết minh bạch chi phí.",
        length: `Kho Acc TFT Sẵn Sàng Thuê Ngay - Bảng Giá Minh Bạch | ${brand}`.length,
      },
      {
        type: "Authority-Trust",
        title: `Kho Acc TFT Chính Chủ - Đổi Mật Khẩu Tự Động | ${brand}`,
        rationale: "Cam kết nguồn gốc tài khoản chính chủ và cơ chế bảo mật tự động.",
        length: `Kho Acc TFT Chính Chủ - Đổi Mật Khẩu Tự Động | ${brand}`.length,
      },
    ];
  }

  if (pageUrl.includes("blog") || q.toLowerCase().includes("mùa") || q.toLowerCase().includes("set")) {
    return [
      {
        type: "Intent-Driven",
        title: `TFT Mùa 18 (Set 18) – Tổng Hợp Giáo Án, Meta & Đội Hình | ${brand}`,
        rationale: "Bao quát từ khóa Mùa 18 và Set 18, đáp ứng intent tìm hiểu lối chơi mới.",
        length: `TFT Mùa 18 (Set 18) – Tổng Hợp Giáo Án, Meta & Đội Hình | ${brand}`.length,
      },
      {
        type: "Feature-Driven",
        title: `Tier List Đội Hình TFT Mùa 18: Tộc Hệ & Cách Xoay Bài | ${brand}`,
        rationale: "Tập trung vào định dạng 'Tier List' có tỷ lệ click tự nhiên cực cao trong thể loại Auto Chess.",
        length: `Tier List Đội Hình TFT Mùa 18: Tộc Hệ & Cách Xoay Bài | ${brand}`.length,
      },
      {
        type: "Action-Oriented",
        title: `Cách Leo Rank TFT Mùa 18 Cực Nhanh: Mẹo Xây Đội Hình | ${brand}`,
        rationale: "Hướng tới mục tiêu thực tế của game thủ: thăng hạng nhanh trong mùa giải mới.",
        length: `Cách Leo Rank TFT Mùa 18 Cực Nhanh: Mẹo Xây Đội Hình | ${brand}`.length,
      },
      {
        type: "Authority-Trust",
        title: `Cẩm Nang TFT Mùa 18 Chuẩn Cao Thủ: Chi Tiết Tướng & Sân | ${brand}`,
        rationale: "Định vị nội dung phân tích chuyên sâu từ các kỳ thủ kỳ cựu.",
        length: `Cẩm Nang TFT Mùa 18 Chuẩn Cao Thủ: Chi Tiết Tướng & Sân | ${brand}`.length,
      },
    ];
  }

  // Mặc định chung cho các trang hoặc truy vấn khác
  return [
    {
      type: "Intent-Driven",
      title: `${qCap} | Uy Tín, Giá Tốt & Hỗ Trợ 24/7 | ${brand}`,
      rationale: "Tối ưu hóa trực diện theo từ khóa truy vấn được cung cấp.",
      length: `${qCap} | Uy Tín, Giá Tốt & Hỗ Trợ 24/7 | ${brand}`.length,
    },
    {
      type: "Feature-Driven",
      title: `${qCap} - Kho Acc TFT Phong Phú Đủ Skin Hot | ${brand}`,
      rationale: "Nhấn mạnh danh mục vật phẩm phong phú.",
      length: `${qCap} - Kho Acc TFT Phong Phú Đủ Skin Hot | ${brand}`.length,
    },
    {
      type: "Action-Oriented",
      title: `${qCap} Nhanh Chóng - Bàn Giao Tài Khoản Trong 3 Phút | ${brand}`,
      rationale: "Nhấn mạnh tốc độ và sự tiện lợi.",
      length: `${qCap} Nhanh Chóng - Bàn Giao Tài Khoản Trong 3 Phút | ${brand}`.length,
    },
    {
      type: "Authority-Trust",
      title: `${qCap} An Toàn Tuyệt Đối - Bảo Hiểm Đầy Đủ | ${brand}`,
      rationale: "Tăng niềm tin thông qua quỹ bảo hiểm uy tín.",
      length: `${qCap} An Toàn Tuyệt Đối - Bảo Hiểm Đầy Đủ | ${brand}`.length,
    },
  ];
}

/**
 * Trợ lý AI sinh 3 biến thể Meta Description tối ưu CTR SERP (< 160 ký tự, lời kêu gọi tự nhiên)
 */
export function generateAiMetaVariants(
  pageUrl: string,
  targetQuery: string,
  currentMeta?: string
): AiMetaVariant[] {
  const brand = "ShopTFTMobile";

  if (pageUrl.includes("thue-acc") || targetQuery.toLowerCase().includes("thuê")) {
    return [
      {
        type: "Commercial-Value",
        meta: `Thuê acc TFT - ĐTCL giá chỉ từ 3.000đ/giờ. Đủ Linh Thú Tí Nị Chibi, Sân Đấu VIP, nhận thông tin đăng nhập trong 3 phút qua Zalo tại ${brand}.`,
        rationale: "Nhấn mạnh mức giá thấp và thời gian nhận acc 3 phút.",
        length: `Thuê acc TFT - ĐTCL giá chỉ từ 3.000đ/giờ. Đủ Linh Thú Tí Nị Chibi, Sân Đấu VIP, nhận thông tin đăng nhập trong 3 phút qua Zalo tại ${brand}.`.length,
      },
      {
        type: "Discovery-Catalog",
        meta: `Khám phá kho acc TFT ĐTCL phong phú: Tùy chọn acc VIP hoặc Clone, lọc nhanh Pet, Chibi và Sân Đấu theo sở thích. Trạng thái cập nhật liên tục tại ${brand}.`,
        rationale: "Tập trung vào độ phong phú của kho hàng và bộ lọc trực quan.",
        length: `Khám phá kho acc TFT ĐTCL phong phú: Tùy chọn acc VIP hoặc Clone, lọc nhanh Pet, Chibi và Sân Đấu theo sở thích. Trạng thái cập nhật liên tục tại ${brand}.`.length,
      },
      {
        type: "Security-Support",
        meta: `Dịch vụ thuê tài khoản TFT an toàn 100%: Bảo hành trọn phiên chơi, hướng dẫn đổi pass Riot an toàn và hỗ trợ kỹ thuật tận tâm 24/7 từ ${brand}.`,
        rationale: "Đánh trúng tâm lý an tâm tuyệt đối không lo rủi ro khi chơi.",
        length: `Dịch vụ thuê tài khoản TFT an toàn 100%: Bảo hành trọn phiên chơi, hướng dẫn đổi pass Riot an toàn và hỗ trợ kỹ thuật tận tâm 24/7 từ ${brand}.`.length,
      },
    ];
  }

  return [
    {
      type: "Commercial-Value",
      meta: `Khám phá dịch vụ tài khoản TFT tại ${brand}: Bảng giá thuê minh bạch, bàn giao tức thì trong 3 phút, bảo hành trọn phiên chơi và hỗ trợ nhiệt tình 24/7.`,
      rationale: "Tóm tắt giá trị dịch vụ cốt lõi, CTA nhanh gọn.",
      length: `Khám phá dịch vụ tài khoản TFT tại ${brand}: Bảng giá thuê minh bạch, bàn giao tức thì trong 3 phút, bảo hành trọn phiên chơi và hỗ trợ nhiệt tình 24/7.`.length,
    },
    {
      type: "Discovery-Catalog",
      meta: `Xem chi tiết kho tài khoản TFT ĐTCL với đầy đủ Tí Nị Chibi, Pet và Sân Đấu Thần Thoại. Lọc theo trạng thái và mức giá phù hợp tại ${brand}.`,
      rationale: "Mời gọi khám phá danh mục sản phẩm.",
      length: `Xem chi tiết kho tài khoản TFT ĐTCL với đầy đủ Tí Nị Chibi, Pet và Sân Đấu Thần Thoại. Lọc theo trạng thái và mức giá phù hợp tại ${brand}.`.length,
    },
    {
      type: "Security-Support",
      meta: `Trải nghiệm tài khoản TFT uy tín cùng ${brand}: Cam kết bảo mật tài khoản Riot, bảo hiểm giao dịch và hỗ trợ nhanh chóng qua Zalo mọi khung giờ.`,
      rationale: "Tạo sự tin tưởng và an tâm tối đa.",
      length: `Trải nghiệm tài khoản TFT uy tín cùng ${brand}: Cam kết bảo mật tài khoản Riot, bảo hiểm giao dịch và hỗ trợ nhanh chóng qua Zalo mọi khung giờ.`.length,
    },
  ];
}

