"use client";

import React, { useState } from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTHero } from "@/components/tft-hero";
import { TFTNewArrivals } from "@/components/tft-new-arrivals";
import { TFTCategoryDiscovery } from "@/components/tft-category-discovery";
import { TFTWhyChoose } from "@/components/tft-why-choose";
import { TFTRentalProcess } from "@/components/tft-rental-process";
import { TFTAdminIntro } from "@/components/tft-admin-intro";
import { TFTFaq } from "@/components/tft-faq";
import { TFTFinalCTA } from "@/components/tft-final-cta";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { TFTAccountModal } from "@/components/tft-account-modal";
import { TFTRentalAccount } from "@/data/tft-data";

import { SectionErrorBoundary } from "@/components/error-boundary";

interface HomePageViewProps {
  initialNewAccounts?: TFTRentalAccount[];
}

export function HomePageView({ initialNewAccounts = [] }: HomePageViewProps) {
  const [selectedAccount, setSelectedAccount] = useState<TFTRentalAccount | null>(null);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black flex flex-col justify-between relative">
      {/* 1. Header */}
      <TFTNavbar />

      {/* 2. Compact Modern Hero with single H1 */}
      <SectionErrorBoundary sectionName="Hero">
        <TFTHero />
      </SectionErrorBoundary>

      {/* 3. Acc Mới Về (4 recent accounts, sort=newest) */}
      <SectionErrorBoundary sectionName="NewArrivals">
        <TFTNewArrivals
          initialAccounts={initialNewAccounts}
          onSelectAccount={(acc) => setSelectedAccount(acc)}
        />
      </SectionErrorBoundary>

      {/* 4. Khám Phá Theo Nhu Cầu */}
      <SectionErrorBoundary sectionName="CategoryDiscovery">
        <TFTCategoryDiscovery />
      </SectionErrorBoundary>

      {/* 5. Tại Sao Chọn ShopTFTMobile (Minimal Trust) */}
      <SectionErrorBoundary sectionName="WhyChoose">
        <TFTWhyChoose />
      </SectionErrorBoundary>

      {/* 6. Quy Trình Thuê Acc (Manual Zalo) */}
      <SectionErrorBoundary sectionName="RentalProcess">
        <TFTRentalProcess />
      </SectionErrorBoundary>

      {/* 7. Short Admin Intro */}
      <SectionErrorBoundary sectionName="AdminIntro">
        <TFTAdminIntro />
      </SectionErrorBoundary>

      {/* 9. FAQ */}
      <SectionErrorBoundary sectionName="Faq">
        <TFTFaq />
      </SectionErrorBoundary>

      {/* 10. Final CTA */}
      <SectionErrorBoundary sectionName="FinalCTA">
        <TFTFinalCTA />
      </SectionErrorBoundary>

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
