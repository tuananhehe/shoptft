"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTHero } from "@/components/tft-hero";
import { TFTNewArrivals } from "@/components/tft-new-arrivals";
import { TFTCategoryDiscovery } from "@/components/tft-category-discovery";
import { TFTWhyChoose } from "@/components/tft-why-choose";
import { TFTRentalProcess } from "@/components/tft-rental-process";
import { TFTAdminIntro } from "@/components/tft-admin-intro";
import { TFTSeoSupportBlock } from "@/components/tft-seo-support-block";
import { TFTBlogPreview } from "@/components/tft-blog-preview";
import { TFTFaq } from "@/components/tft-faq";
import { TFTFinalCTA } from "@/components/tft-final-cta";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { TFTRentalAccount } from "@/data/tft-data";
import { BlogPost } from "@/utils/blog-shared";

const TFTAccountModal = dynamic(
  () => import("@/components/tft-account-modal").then((m) => m.TFTAccountModal),
  { ssr: false }
);

import { SectionErrorBoundary } from "@/components/error-boundary";

interface HomePageViewProps {
  initialNewAccounts?: TFTRentalAccount[];
  initialBlogPosts?: BlogPost[];
}

export function HomePageView({
  initialNewAccounts = [],
  initialBlogPosts = [],
}: HomePageViewProps) {
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

      {/* 5. Short SEO Support Block (120-180 words, internal link to /thue-acc-tft-dtcl) */}
      <SectionErrorBoundary sectionName="SeoSupport">
        <TFTSeoSupportBlock />
      </SectionErrorBoundary>

      {/* 6. Tại Sao Chọn ShopTFTMobile (Truthful Trust) */}
      <SectionErrorBoundary sectionName="WhyChoose">
        <TFTWhyChoose />
      </SectionErrorBoundary>

      {/* 7. Quy Trình Thuê Acc (3 steps) */}
      <SectionErrorBoundary sectionName="RentalProcess">
        <TFTRentalProcess />
      </SectionErrorBoundary>

      {/* 8. Short Admin Intro (Tuấn Thái Bình TFT & ShopTFTMobile) */}
      <SectionErrorBoundary sectionName="AdminIntro">
        <TFTAdminIntro />
      </SectionErrorBoundary>

      {/* 9. Blog Preview (max 3 articles) */}
      <SectionErrorBoundary sectionName="BlogPreview">
        <TFTBlogPreview posts={initialBlogPosts} />
      </SectionErrorBoundary>

      {/* 10. FAQ (6 questions with internal links) */}
      <SectionErrorBoundary sectionName="Faq">
        <TFTFaq />
      </SectionErrorBoundary>

      {/* 11. Final CTA */}
      <SectionErrorBoundary sectionName="FinalCTA">
        <TFTFinalCTA />
      </SectionErrorBoundary>

      {/* 12. Footer */}
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
