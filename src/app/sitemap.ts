import { MetadataRoute } from "next";
import { getAllProductAccounts } from "@/utils/account-lookup";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.shoptftmobile.net";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ve-shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const accounts = await getAllProductAccounts();
    const productRoutes: MetadataRoute.Sitemap = accounts.map((acc) => {
      const cleanCode = acc.code.replace(/^MS:\s*/i, "").trim();
      const slug = cleanCode || acc.id;
      return {
        url: `${baseUrl}/acc/${encodeURIComponent(slug)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...productRoutes];
  } catch (err) {
    console.error("Lỗi tạo sitemap sản phẩm:", err);
    return staticRoutes;
  }
}
