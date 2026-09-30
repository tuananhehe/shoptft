import { MetadataRoute } from "next";
import { getAllProductAccounts } from "@/utils/account-lookup";
import { getSeoConfig } from "@/utils/seo-service";
import { getBlogPosts } from "@/utils/blog-service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoConfig = await getSeoConfig();
  const baseUrl = (seoConfig.global.canonicalOrigin || "https://www.shoptftmobile.net").replace(/\/+$/, "");

  // Stable build/release timestamp
  const buildDate = new Date("2026-09-30T00:00:00.000Z");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: buildDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: buildDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/thue-acc-tft-dtcl`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: buildDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/tft-mua-18`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ve-shop`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/huong-dan`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/huong-dan/doi-thong-tin-acc-riot`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const accounts = await getAllProductAccounts();
    productRoutes = accounts.map((acc) => {
      const cleanCode = acc.code.replace(/^MS:\s*/i, "").trim();
      const slug = cleanCode || acc.id;
      return {
        url: `${baseUrl}/acc/${encodeURIComponent(slug)}`,
        lastModified: buildDate,
        changeFrequency: "daily",
        priority: 0.8,
      };
    });
  } catch (err) {
    console.error("Lỗi tạo sitemap sản phẩm:", err);
  }

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await getBlogPosts({ status: "published" });
    blogRoutes = blogPosts
      .filter((post) => !post.seo?.noindex)
      .map((post) => {
        const lastMod = post.updatedAt || post.publishedAt;
        const validDate = lastMod ? new Date(lastMod) : buildDate;
        return {
          url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
          lastModified: isNaN(validDate.getTime()) ? buildDate : validDate,
          changeFrequency: "weekly" as const,
          priority: post.featured ? 0.85 : 0.75,
        };
      });
  } catch (err) {
    console.error("Lỗi tạo sitemap blog:", err);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
