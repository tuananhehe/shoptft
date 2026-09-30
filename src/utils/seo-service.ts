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
  DEFAULT_SEO_CONFIG,
  detectRedirectLoop,
} from "@/utils/seo-shared";
import { BlogPost } from "@/utils/blog-shared";

export * from "@/utils/seo-shared";

const STORAGE_KEY = "system/seo-config.json";
const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "seo-config.json");

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
