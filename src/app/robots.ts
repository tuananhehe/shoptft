import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.shoptftmobile.net";

  const allowPatterns = [
    "/",
    "/shop",
    "/thue-acc-tft-dtcl",
    "/ve-shop",
    "/acc/*",
    "/huong-dan",
    "/huong-dan/*",
    "/blog",
    "/blog/*",
  ];

  const disallowPatterns = [
    "/admin",
    "/admin/*",
    "/profile",
    "/profile/*",
    "/login",
    "/register",
    "/pay/*",
    "/api/*",
    "/*?*search=*",
    "/*?*q=*",
    "/*?*sort=*",
    "/*?*price=*",
    "/*?*type=*",
    "/*?*focus=*",
    "/*?*page=*",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowPatterns,
        disallow: disallowPatterns,
      },
      {
        userAgent: "Googlebot",
        allow: allowPatterns,
        disallow: disallowPatterns,
      },
      {
        userAgent: "Bingbot",
        allow: allowPatterns,
        disallow: disallowPatterns,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: "www.shoptftmobile.net",
  };
}
