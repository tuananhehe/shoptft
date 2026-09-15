import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAccountByIdOrSlug, getRelatedAccounts, getAllProductAccounts } from "@/utils/account-lookup";
import { AccountDetailView } from "./account-detail-view";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Sinh dynamic SEO metadata cho từng tài khoản (OpenGraph, Twitter preview khi gửi qua Zalo / Facebook)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const account = await getAccountByIdOrSlug(resolvedParams.id);

  if (!account) {
    return {
      title: "Không tìm thấy tài khoản | Shop Thuê Acc TFT Tuấn Thái Bình",
      description: "Tài khoản Đấu Trường Chân Lý không tồn tại hoặc đã được cập nhật mã số mới.",
    };
  }

  const priceFormatted = account.hourlyPrice
    ? `${account.hourlyPrice.toLocaleString("vi-VN")}đ/h`
    : account.price
    ? `${account.price.toLocaleString("vi-VN")}đ`
    : "Giá tốt";

  const title = `[${account.code}] ${account.title} - Thuê Acc TFT Rank ${account.rank} (${priceFormatted})`;
  const description = `${account.description} Bàn giao tự động 30s bởi Cựu Thách Đấu Tuấn Thái Bình (1.134 ĐNG - Bảo hiểm 30M Checkscam).`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: account.thumbnail,
          width: 800,
          height: 800,
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
    const popularAccounts = (await getAllProductAccounts()).slice(0, 4);

    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
        <TFTNavbar />
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-gaming">
              KHÔNG TÌM THẤY TÀI KHOẢN NÀY
            </h1>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Mã tài khoản <span className="font-mono font-bold text-orange-600">"{resolvedParams.id}"</span> có thể đã được cập nhật hoặc không còn tồn tại trong hệ thống.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Trang Chủ Tìm Acc Khác</span>
            </Link>
          </div>

          {popularAccounts.length > 0 && (
            <div className="pt-12 border-t border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Gợi Ý Các Tài Khoản Đang Có Sẵn:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {popularAccounts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/acc/${encodeURIComponent(item.code.replace(/^MS:\s*/i, "").trim() || item.id)}`}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all text-xs space-y-1 group"
                  >
                    <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="font-mono font-bold text-slate-900 truncate">
                      {item.code}
                    </div>
                    <div className="text-red-600 font-bold font-mono">
                      {(item.hourlyPrice || item.price || 15000).toLocaleString("vi-VN")}đ
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <TFTFooter />
      </main>
    );
  }

  const relatedAccounts = await getRelatedAccounts(account.id, 4);

  return <AccountDetailView account={account} relatedAccounts={relatedAccounts} />;
}
