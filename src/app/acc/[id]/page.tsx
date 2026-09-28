import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAccountByIdOrSlug, getRelatedAccounts } from "@/utils/account-lookup";
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

  if (!account) {
    return {
      title: "Không tìm thấy tài khoản | ShopTFTMobile",
      description: "Tài khoản Đấu Trường Chân Lý không tồn tại hoặc đã được cập nhật.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cleanCode = account.code.replace(/^MS:\s*/i, "").trim();
  const canonicalUrl = `https://shoptftmobile.net/acc/${encodeURIComponent(cleanCode || account.id)}`;
  const title = `${account.title} | ShopTFTMobile`;
  const description = `${account.title} (Mã số: ${account.code}, Rank: ${account.rank}). Bàn giao tài khoản thủ công qua Zalo, an toàn và bảo mật tại ShopTFTMobile.`;

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
          url: account.thumbnail,
          width: 800,
          height: 600,
          alt: `${account.code} - ${account.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [account.thumbnail],
    },
  };
}

export default async function AccountDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const account = await getAccountByIdOrSlug(resolvedParams.id);

  if (!account) {
    notFound();
  }

  const relatedAccounts = await getRelatedAccounts(account.id, 4);
  const cleanCode = account.code.replace(/^MS:\s*/i, "").trim();
  const accountUrl = `https://shoptftmobile.net/acc/${encodeURIComponent(cleanCode || account.id)}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "https://shoptftmobile.net",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Kho Acc",
        "item": "https://shoptftmobile.net/shop",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": account.title,
        "item": accountUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AccountDetailView account={account} relatedAccounts={relatedAccounts} />
    </>
  );
}
