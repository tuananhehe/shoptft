import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

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
    console.error("Lỗi đọc canonical URL cho robots:", err);
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  return "https://shoptftmobile.net";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ""),
  };
}
