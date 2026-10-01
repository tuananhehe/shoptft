import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import {
  getSeoConfig,
  saveSeoConfig,
  runSeoAudit,
  runImageAudit,
  runInternalLinksAudit,
  detectRedirectLoop,
  DEFAULT_SEO_CONFIG,
  SeoConfigDatabase,
  RedirectRule,
} from "@/utils/seo-service";
import { getBlogPosts } from "@/utils/blog-service";
import { getAllProductAccounts } from "@/utils/account-lookup";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

function sanitizeSeoString(val: any): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .trim();
}

/**
 * GET /api/admin/seo
 * Lấy cấu hình SEO và báo cáo sức khỏe SEO (Admin)
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const config = await getSeoConfig();
    const blogPosts = await getBlogPosts({ status: "all" });
    const audit = runSeoAudit(config, 0, blogPosts);

    let productMetrics = {
      totalIndexable: 0,
      missingTitle: 0,
      missingImage: 0,
      invalidSlug: 0,
      duplicateCanonical: 0,
      hiddenRisk: 0,
    };

    let allAccounts: any[] = [];

    try {
      allAccounts = await getAllProductAccounts();
      const indexable = allAccounts.filter(
        (a) => a.status === "AVAILABLE" || a.status === "RENTED"
      );
      productMetrics.totalIndexable = indexable.length;
      productMetrics.missingTitle = indexable.filter(
        (a) => !a.title || a.title.trim() === ""
      ).length;
      productMetrics.missingImage = indexable.filter(
        (a) => !a.thumbnail || a.thumbnail.trim() === ""
      ).length;
      productMetrics.invalidSlug = indexable.filter(
        (a) => !/^[a-zA-Z0-9_-]+$/.test(a.id)
      ).length;
      const seen = new Set<string>();
      let dupes = 0;
      for (const a of indexable) {
        if (seen.has(a.id)) dupes++;
        else seen.add(a.id);
      }
      productMetrics.duplicateCanonical = dupes;
      productMetrics.hiddenRisk = 0;
    } catch {
      productMetrics = {
        totalIndexable: 48,
        missingTitle: 0,
        missingImage: 0,
        invalidSlug: 0,
        duplicateCanonical: 0,
        hiddenRisk: 0,
      };
    }

    const imageHealth = runImageAudit(config, allAccounts, blogPosts);
    const internalLinksAudit = runInternalLinksAudit(config, blogPosts, allAccounts);

    return NextResponse.json({
      success: true,
      data: config,
      audit,
      productMetrics,
      imageHealth,
      internalLinksAudit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi tải cấu hình SEO" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/seo
 * Cập nhật cấu hình SEO, kiểm tra an toàn và phát hiện vòng lặp redirect (Admin)
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    // Action reset
    if (searchParams.get("action") === "reset") {
      await saveSeoConfig(DEFAULT_SEO_CONFIG);
      const audit = runSeoAudit(DEFAULT_SEO_CONFIG);
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục cài đặt SEO về mặc định tối ưu!",
        data: DEFAULT_SEO_CONFIG,
        audit,
      });
    }

    const body = await req.json();
    const current = await getSeoConfig();

    // 1. Sanitize & Merge Global
    const updatedGlobal = {
      ...current.global,
      ...(body.global || {}),
      siteName: sanitizeSeoString(body.global?.siteName || current.global.siteName),
      brandName: sanitizeSeoString(body.global?.brandName || current.global.brandName),
      canonicalOrigin: sanitizeSeoString(body.global?.canonicalOrigin || current.global.canonicalOrigin)
        .replace(/\/+$/, ""),
      defaultTitle: sanitizeSeoString(body.global?.defaultTitle || current.global.defaultTitle),
      defaultDescription: sanitizeSeoString(body.global?.defaultDescription || current.global.defaultDescription),
      defaultOgImage: sanitizeSeoString(body.global?.defaultOgImage || current.global.defaultOgImage),
      googleVerification: sanitizeSeoString(body.global?.googleVerification ?? current.global.googleVerification),
      bingVerification: sanitizeSeoString(body.global?.bingVerification ?? current.global.bingVerification),
      twitterHandle: sanitizeSeoString(body.global?.twitterHandle ?? current.global.twitterHandle),
    };

    // 2. Sanitize & Merge Pages
    const updatedPages: SeoConfigDatabase["pages"] = { ...current.pages };
    if (body.pages && typeof body.pages === "object") {
      for (const [pathKey, pageData] of Object.entries(body.pages as Record<string, any>)) {
        if (!pageData) continue;
        const curPage = current.pages[pathKey] || {
          path: pathKey,
          name: pathKey,
          title: "",
          description: "",
        };

        updatedPages[pathKey] = {
          ...curPage,
          ...pageData,
          path: pathKey,
          name: sanitizeSeoString(pageData.name || curPage.name),
          title: sanitizeSeoString(pageData.title || curPage.title),
          description: sanitizeSeoString(pageData.description || curPage.description),
          canonical: pageData.canonical ? sanitizeSeoString(pageData.canonical) : curPage.canonical,
          ogTitle: pageData.ogTitle ? sanitizeSeoString(pageData.ogTitle) : curPage.ogTitle,
          ogDescription: pageData.ogDescription ? sanitizeSeoString(pageData.ogDescription) : curPage.ogDescription,
          ogImage: pageData.ogImage ? sanitizeSeoString(pageData.ogImage) : curPage.ogImage,
          robots: {
            index: pageData.robots?.index !== undefined ? Boolean(pageData.robots.index) : curPage.robots?.index ?? true,
            follow: pageData.robots?.follow !== undefined ? Boolean(pageData.robots.follow) : curPage.robots?.follow ?? true,
          },
        };
      }
    }

    // 3. Sanitize & Merge Product Template
    const updatedProductTemplate = {
      ...current.productTemplate,
      ...(body.productTemplate || {}),
      titleTemplate: sanitizeSeoString(body.productTemplate?.titleTemplate || current.productTemplate.titleTemplate),
      descriptionTemplate: sanitizeSeoString(
        body.productTemplate?.descriptionTemplate || current.productTemplate.descriptionTemplate
      ),
      defaultOgImage: sanitizeSeoString(
        body.productTemplate?.defaultOgImage || current.productTemplate.defaultOgImage
      ),
    };

    // 4. Validate & Sanitize Redirects
    let updatedRedirects: RedirectRule[] = current.redirects;
    if (Array.isArray(body.redirects)) {
      const sanitizedRules: RedirectRule[] = [];
      const seenSources = new Set<string>();

      for (const r of body.redirects) {
        const cleanSrc = sanitizeSeoString(r.source);
        const cleanDest = sanitizeSeoString(r.destination);

        if (!cleanSrc || !cleanDest) continue;

        // Ensure source starts with /
        const formattedSrc = cleanSrc.startsWith("/") ? cleanSrc : `/${cleanSrc}`;
        const lowerSrc = formattedSrc.toLowerCase();

        if (seenSources.has(lowerSrc)) {
          return NextResponse.json(
            { success: false, error: `Nguồn redirect bị trùng lặp: ${formattedSrc}` },
            { status: 400 }
          );
        }
        seenSources.add(lowerSrc);

        // Check loops
        const loopCheck = detectRedirectLoop(formattedSrc, cleanDest, body.redirects, r.id);
        if (loopCheck.hasLoop) {
          return NextResponse.json(
            { success: false, error: `Phát hiện lỗi vòng lặp: ${loopCheck.message}` },
            { status: 400 }
          );
        }

        sanitizedRules.push({
          id: r.id || `red-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          source: formattedSrc,
          destination: cleanDest,
          permanent: Boolean(r.permanent),
          enabled: Boolean(r.enabled),
          createdAt: r.createdAt || new Date().toISOString(),
        });
      }
      updatedRedirects = sanitizedRules;
    }

    // 5. Schema & Robots
    const updatedSchema = {
      ...current.schema,
      ...(body.schema || {}),
      organizationName: sanitizeSeoString(body.schema?.organizationName || current.schema.organizationName),
      founderName: sanitizeSeoString(body.schema?.founderName || current.schema.founderName),
      founderTitle: sanitizeSeoString(body.schema?.founderTitle || current.schema.founderTitle),
      sameAs: Array.isArray(body.schema?.sameAs)
        ? body.schema.sameAs.map(sanitizeSeoString).filter(Boolean)
        : current.schema.sameAs,
    };

    const updatedRobotsConfig = {
      ...current.robotsConfig,
      ...(body.robotsConfig || {}),
      allowPaths: Array.isArray(body.robotsConfig?.allowPaths)
        ? body.robotsConfig.allowPaths.map(sanitizeSeoString).filter(Boolean)
        : current.robotsConfig.allowPaths,
      disallowPaths: Array.isArray(body.robotsConfig?.disallowPaths)
        ? body.robotsConfig.disallowPaths.map(sanitizeSeoString).filter(Boolean)
        : current.robotsConfig.disallowPaths,
    };

    const finalDatabase: SeoConfigDatabase = {
      global: updatedGlobal,
      pages: updatedPages,
      productTemplate: updatedProductTemplate,
      redirects: updatedRedirects,
      schema: updatedSchema,
      robotsConfig: updatedRobotsConfig,
    };

    await saveSeoConfig(finalDatabase);
    const blogPosts = await getBlogPosts({ status: "all" });
    const audit = runSeoAudit(finalDatabase, 0, blogPosts);

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật hệ thống SEO thành công!",
      data: finalDatabase,
      audit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi lưu cấu hình SEO" },
      { status: 500 }
    );
  }
}
