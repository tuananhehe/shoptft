import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

/**
 * Lấy URL miền chính xác (Canonical Base URL) cấu hình trong hệ thống
 */
function getCanonicalBaseUrl(): string {
  try {
    const configPath = path.join(process.cwd(), "src", "data", "homepage-config.json");
    if (fs.existsSync(configPath)) {
      const file = fs.readFileSync(configPath, "utf8");
      const json = JSON.parse(file);
      if (json?.seo?.canonicalUrl) {
        return json.seo.canonicalUrl.trim().replace(/\/+$/, "");
      }
    }
  } catch (err) {
    console.error("Lỗi đọc canonical URL cho sitemap:", err);
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  return "https://shoptftmobile.net";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getCanonicalBaseUrl();
  const now = new Date();

  // Chuẩn SEO Google & Bing:
  // 1. Chỉ chứa các URL canonical hợp lệ (200 OK)
  // 2. Tuyệt đối KHÔNG chứa hash (#shop, #clone-shop...) vì bot tìm kiếm sẽ báo lỗi URL không hợp lệ / không lập chỉ mục
  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
