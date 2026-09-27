"use client";

import React, { useState } from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTShop } from "@/components/tft-shop";
import { TFTAccountModal } from "@/components/tft-account-modal";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { TFTRentalAccount } from "@/data/tft-data";

export default function ShopPage() {
  const [selectedAccount, setSelectedAccount] = useState<TFTRentalAccount | null>(null);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#090909] text-white selection:bg-white selection:text-black flex flex-col justify-between relative pb-16 lg:pb-0">
      {/* Navigation */}
      <TFTNavbar />

      {/* Page Header (Compact & E-commerce Structured) */}
      <div className="pt-20 sm:pt-24 pb-3 sm:pb-4 bg-[#090909]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs text-zinc-500 font-normal">
              <li>
                <a href="/" className="hover:text-zinc-300 transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>/</li>
              <li className="text-zinc-300 font-medium">Kho Acc</li>
            </ol>
          </nav>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
            Kho Acc TFT
          </h1>
          <p className="mt-1 text-zinc-400 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Tìm tài khoản theo Pet, Chibi, Sân Đấu, loại acc và mức giá phù hợp.
          </p>
        </div>
      </div>

      {/* Shop Section */}
      <TFTShop alwaysExpanded onSelectAccount={(acc) => setSelectedAccount(acc)} />

      {/* Footer */}
      <TFTFooter />

      {/* Mobile Bottom Bar */}
      <TFTMobileBottomBar />

      {/* VIP Account Modal */}
      <TFTAccountModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </main>
  );
}
