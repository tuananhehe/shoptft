"use client";

import React, { useState, useEffect } from "react";
import {
  DiscoveredProduct,
  getRecentlyViewed,
  clearRecentlyViewed,
} from "@/utils/product-discovery";
import { ProductCard, normalizeVipAccount, normalizeCloneAccount } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Clock, RotateCcw } from "lucide-react";

interface TFTRecentlyViewedProps {
  excludeId?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const TFTRecentlyViewed: React.FC<TFTRecentlyViewedProps> = ({
  excludeId,
  title = "Acc Đã Xem Gần Đây",
  subtitle = "Các tài khoản bạn vừa tham khảo trên thiết bị này",
  limit = 4,
}) => {
  const [recentAccounts, setRecentAccounts] = useState<DiscoveredProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const list = getRecentlyViewed();
    const filtered = excludeId
      ? list.filter((item) => item.id !== excludeId && item.code !== excludeId)
      : list;
    setRecentAccounts(filtered.slice(0, limit));
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("tft:recently_viewed_updated", handleUpdate);
    return () => window.removeEventListener("tft:recently_viewed_updated", handleUpdate);
  }, [excludeId, limit]);

  // Do not render anything if not mounted or empty list (Requirement 1)
  if (!mounted || recentAccounts.length === 0) {
    return null;
  }

  return (
    <div
      style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}
      className="mt-12 pt-8 border-t border-white/[0.08] space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
              {title}
            </h2>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => clearRecentlyViewed()}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          title="Xóa danh sách acc đã xem"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Xóa</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {recentAccounts.map((item, idx) => {
          const cardData = {
            id: item.id,
            code: item.code,
            type: item.type,
            title: item.title,
            thumbnail: item.thumbnail,
            price: item.price,
            priceUnit: item.priceUnit,
            status: item.status,
            mainPet: item.mainPet,
            allPetsSummary: item.allPetsSummary,
            arena: item.arena,
            rank: item.rank,
          };

          return (
            <Reveal key={item.id} delay={Math.min(idx * 40, 120)}>
              <ProductCard item={cardData} />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};
