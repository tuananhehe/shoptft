import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAccountByIdOrSlug, getRelatedAccounts } from "@/utils/account-lookup";
import { getSeoConfig, formatProductSeo } from "@/utils/seo-service";
import { AccountDetailView } from "./account-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Sinh dynamic SEO metadata cho từng tài khoản (OpenGraph, Twitter preview, Canonical)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const account = await getAccountByIdOrSlug(resolvedParams.id);

  if (!account || (account as any).status === "HIDDEN") {
    return {
      title: {
        absolute: "Không tìm thấy tài khoản | ShopTFTMobile",
      },
      description: "Tài khoản Đấu Trường Chân Lý không tồn tại hoặc đã được cập nhật.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seoConfig = await getSeoConfig();
  const cleanCode = account.code.replace(/^MS:\s*/i, "").trim();
  const canonicalOrigin = seoConfig.global.canonicalOrigin.replace(/\/+$/, "");
  const canonicalUrl = `${canonicalOrigin}/acc/${encodeURIComponent(cleanCode || account.id)}`;

  const formatted = formatProductSeo(account, seoConfig.productTemplate, seoConfig.global.siteName);
  const title = formatted.title;
  const description = formatted.description;
  const ogImg = account.thumbnail || formatted.ogImage || "/banner-seo.jpg";

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImg,
          width: 800,
          height: 600,
          alt: `${account.code} - ${account.title} | Acc TFT - ĐTCL`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AccountDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const account = await getAccountByIdOrSlug(resolvedParams.id);

  if (!account || (account as any).status === "HIDDEN") {
    notFound();
  }

  const relatedAccounts = await getRelatedAccounts(account.id, 6);
  const cleanCode = account.code.replace(/^MS:\s*/i, "").trim();
  const accountUrl = `https://www.shoptftmobile.net/acc/${encodeURIComponent(cleanCode || account.id)}`;

  const seoConfig = await getSeoConfig();
  const formatted = formatProductSeo(account, seoConfig.productTemplate, seoConfig.global.siteName);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang chủ",
            "item": "https://www.shoptftmobile.net",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Kho Acc",
            "item": "https://www.shoptftmobile.net/shop",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": account.title,
            "item": accountUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        "name": formatted.title,
        "description": formatted.description,
        "url": accountUrl,
        "inLanguage": "vi-VN",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <AccountDetailView account={account} relatedAccounts={relatedAccounts} />
    </>
  );
}
