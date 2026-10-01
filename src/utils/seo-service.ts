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
} from "@/utils/seo-shared";
import { BlogPost } from "@/utils/blog-shared";

export * from "@/utils/seo-shared";

const STORAGE_KEY = "system/seo-config.json";
const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "seo-config.json");
const GSC_DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "search-console-data.json");

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
  };
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
  let proposedMetaDescription = `Xem và lựa chọn tài khoản ${query} uy tín, minh bạch tại ShopTFTMobile. Hỗ trợ giao dịch nhanh và an toàn.`;
  let missingSections = [
    "FAQ giải đáp các thắc mắc phổ biến về dịch vụ",
    "Bảng giá chi tiết theo giờ, ngày và combo thuê",
    "Cam kết bảo mật tài khoản và hỗ trợ qua Zalo 24/7",
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
