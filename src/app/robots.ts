import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://shoptftmobile.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/acc/*", "/ve-shop"],
        disallow: [
          "/admin",
          "/admin/*",
          "/profile",
          "/profile/*",
          "/pay/*",
          "/api/*",
          "/*?*search=*",
          "/*?*q=*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/shop", "/acc/*", "/ve-shop"],
        disallow: [
          "/admin",
          "/admin/*",
          "/profile",
          "/profile/*",
          "/pay/*",
          "/api/*",
          "/*?*search=*",
          "/*?*q=*",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/shop", "/acc/*", "/ve-shop"],
        disallow: [
          "/admin",
          "/admin/*",
          "/profile",
          "/profile/*",
          "/pay/*",
          "/api/*",
          "/*?*search=*",
          "/*?*q=*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: "shoptftmobile.net",
  };
}
