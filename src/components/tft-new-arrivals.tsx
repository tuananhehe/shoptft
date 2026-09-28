"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TFTRentalAccount } from "@/data/tft-data";
import { mapRowToVipAccount } from "@/utils/supabase/accounts-service";
import { getAccountProductUrl } from "@/utils/account-lookup";
import {
  ProductCard,
  ProductCardSkeleton,
  normalizeVipAccount,
} from "@/components/product-card";
import { Sparkles } from "lucide-react";

interface TFTNewArrivalsProps {
  initialAccounts?: TFTRentalAccount[];
  onSelectAccount?: (account: TFTRentalAccount) => void;
}

export const TFTNewArrivals: React.FC<TFTNewArrivalsProps> = ({ initialAccounts = [], onSelectAccount }) => {
  const [newAccounts, setNewAccounts] = useState<TFTRentalAccount[]>(initialAccounts);
  const [isLoading, setIsLoading] = useState(initialAccounts.length === 0);

  useEffect(() => {
    if (initialAccounts && initialAccounts.length > 0) {
      setNewAccounts(initialAccounts);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    fetch("/api/accounts?type=VIP&limit=4")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((result) => {
        if (isMounted) {
          const rows = result.data || [];
          if (rows.length > 0) {
            setNewAccounts(rows.map((row: any, idx: number) => mapRowToVipAccount(row, idx)));
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Lỗi tải acc mới về:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialAccounts]);

  if (!isLoading && newAccounts.length === 0) {
    return null;
  }

  return (
    <section
      id="acc-moi-ve"
      className="scroll-mt-14 sm:scroll-mt-20 py-6 sm:py-9 lg:py-10 bg-[#090909] border-b border-white/[0.08] text-white relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] mb-2">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>MỚI LÊN KỆ</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight">
              Acc Mới Về
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-xl font-normal leading-relaxed">
              Những tài khoản TFT vừa được cập nhật vào kho.
            </p>
          </div>

          {/* Desktop CTA */}
          <Link
            href="/shop?sort=newest"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Xem tất cả acc mới →</span>
          </Link>
        </div>

        {/* Content: 4 Cards on Desktop / 2 Cards per row on Mobile */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {newAccounts.map((account, idx) => (
              <ProductCard
                key={account.id}
                item={normalizeVipAccount(account)}
                priority={idx === 0}
                onSelectAccount={onSelectAccount}
                onViewDetail={(item) => {
                  if (item.rawVip && onSelectAccount) {
                    onSelectAccount(item.rawVip);
                  } else {
                    window.location.href = getAccountProductUrl(item);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Mobile Bottom CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white py-2 px-4 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <span>Xem tất cả acc mới →</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
