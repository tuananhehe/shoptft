import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.shoptftmobile.net";

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
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/acc/*", "/ve-shop"],
        disallow: disallowPatterns,
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/shop", "/acc/*", "/ve-shop"],
        disallow: disallowPatterns,
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/shop", "/acc/*", "/ve-shop"],
        disallow: disallowPatterns,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: "www.shoptftmobile.net",
  };
}
