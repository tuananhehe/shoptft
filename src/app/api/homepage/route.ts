import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { HomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "@/utils/homepage-service";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";

const STORAGE_KEY = "system/homepage-config.json";
const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "homepage-config.json");

let memoryConfig: HomepageConfig = { ...DEFAULT_HOMEPAGE_CONFIG };

async function readConfig(): Promise<HomepageConfig> {
  const loaded = await getCloudJson<HomepageConfig>(
    STORAGE_KEY,
    CONFIG_FILE_PATH,
    DEFAULT_HOMEPAGE_CONFIG
  );
  if (loaded && typeof loaded === "object") {
    memoryConfig = {
      ...DEFAULT_HOMEPAGE_CONFIG,
      ...loaded,
      sections: { ...DEFAULT_HOMEPAGE_CONFIG.sections, ...(loaded.sections || {}) },
      hero: { ...DEFAULT_HOMEPAGE_CONFIG.hero, ...(loaded.hero || {}) },
      images: { ...DEFAULT_HOMEPAGE_CONFIG.images, ...(loaded.images || {}) },
      alertBanner: { ...DEFAULT_HOMEPAGE_CONFIG.alertBanner, ...(loaded.alertBanner || {}) },
      pricing: { ...DEFAULT_HOMEPAGE_CONFIG.pricing, ...(loaded.pricing || {}) } as any,
      contact: { ...DEFAULT_HOMEPAGE_CONFIG.contact, ...(loaded.contact || {}) } as any,
    };
  }
  return memoryConfig;
}

async function writeConfig(cfg: HomepageConfig): Promise<boolean> {
  memoryConfig = cfg;
  return await saveCloudJson(STORAGE_KEY, cfg, CONFIG_FILE_PATH);
}

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

/**
 * GET /api/homepage
 * Lấy toàn bộ cấu hình trang chủ
 */
export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, data: memoryConfig },
      { status: 500 }
    );
  }
}

function sanitizeCmsValue(val: any): any {
  if (typeof val === "string") {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeCmsValue);
  }
  if (val && typeof val === "object") {
    const cleaned: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      cleaned[k] = sanitizeCmsValue(val[k]);
    }
    return cleaned;
  }
  return val;
}

/**
 * PUT /api/homepage
 * Cập nhật cấu hình trang chủ (Admin)
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

    if (searchParams.get("action") === "reset") {
      await writeConfig(DEFAULT_HOMEPAGE_CONFIG);
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục cấu hình trang chủ về mặc định!",
        data: DEFAULT_HOMEPAGE_CONFIG,
      });
    }

    const rawBody = await req.json();
    const body = sanitizeCmsValue(rawBody);
    const current = await readConfig();

    const updatedConfig: HomepageConfig = {
      ...current,
      ...body,
      sections: {
        ...current.sections,
        ...(body.sections || {}),
      },
      hero: {
        ...current.hero,
        ...(body.hero || {}),
        stats: body.hero?.stats || current.hero.stats,
      },
      images: {
        ...current.images,
        ...(body.images || {}),
      },
      alertBanner: {
        ...current.alertBanner,
        ...(body.alertBanner || {}),
      },
      pricing: {
        ...(current.pricing || DEFAULT_HOMEPAGE_CONFIG.pricing!),
        ...(body.pricing || {}),
      },
      contact: {
        ...(current.contact || DEFAULT_HOMEPAGE_CONFIG.contact!),
        ...(body.contact || {}),
      },
      bank: {
        ...(current.bank || DEFAULT_HOMEPAGE_CONFIG.bank!),
        ...(body.bank || {}),
      },
      servicePackages: body.servicePackages || current.servicePackages,
      faqs: body.faqs || current.faqs,
    };

    await writeConfig(updatedConfig);

    return NextResponse.json({
      success: true,
      message: "Đã lưu cài đặt trang chủ thành công!",
      data: updatedConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi khi lưu cấu hình trang chủ" },
      { status: 500 }
    );
  }
}

