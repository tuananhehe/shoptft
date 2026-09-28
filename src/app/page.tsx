"use client";

import React, { useState } from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTHero } from "@/components/tft-hero";
import { TFTNewArrivals } from "@/components/tft-new-arrivals";
import { TFTCategoryDiscovery } from "@/components/tft-category-discovery";
import { TFTWhyChoose } from "@/components/tft-why-choose";
import { TFTRentalProcess } from "@/components/tft-rental-process";
import { TFTReviews } from "@/components/tft-reviews";
import { TFTAdminIntro } from "@/components/tft-admin-intro";
import { TFTFaq } from "@/components/tft-faq";
import { TFTFinalCTA } from "@/components/tft-final-cta";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { TFTAccountModal } from "@/components/tft-account-modal";
import { TFTRentalAccount } from "@/data/tft-data";

export default function HomePage() {
  const [selectedAccount, setSelectedAccount] = useState<TFTRentalAccount | null>(null);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black flex flex-col justify-between relative">
      {/* 1. Header */}
      <TFTNavbar />

      {/* 2. Compact Modern Hero */}
      <TFTHero />

      {/* 3. Acc Mới Về (4 recent accounts, sort=newest) */}
      <TFTNewArrivals onSelectAccount={(acc) => setSelectedAccount(acc)} />

      {/* 4. Khám Phá Theo Nhu Cầu */}
      <TFTCategoryDiscovery />

      {/* 5. Tại Sao Chọn ShopTFTMobile (Minimal Trust) */}
      <TFTWhyChoose />

      {/* 6. Quy Trình Thuê Acc (Manual Zalo) */}
      <TFTRentalProcess />

      {/* 7. Feedback / Customer Reviews */}
      <TFTReviews />

      {/* 8. Short Admin Intro */}
      <TFTAdminIntro />

      {/* 9. FAQ */}
      <TFTFaq />

      {/* 10. Final CTA */}
      <TFTFinalCTA />

      {/* 11. Footer */}
      <TFTFooter />

      {/* Floating Bottom Bar for Mobile */}
      <TFTMobileBottomBar />

      {/* Account Order / Detail Modal */}
      <TFTAccountModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </main>
  );
}
