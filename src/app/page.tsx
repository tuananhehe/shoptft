"use client";

import React, { useState, useEffect } from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTHero } from "@/components/tft-hero";
import { TFTShop } from "@/components/tft-shop";
import { TFTCloneShop } from "@/components/tft-clone-shop";
import { TFTAbout } from "@/components/tft-about";
import { TFTServices } from "@/components/tft-services";
import { TFTReviews } from "@/components/tft-reviews";
import { TFTSurveyBanner } from "@/components/tft-survey-banner";
import { TFTFaq } from "@/components/tft-faq";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { TFTAccountModal } from "@/components/tft-account-modal";
import { TFTRentalAccount } from "@/data/tft-data";
import { HomepageConfig, getHomepageConfig } from "@/utils/homepage-service";
import defaultConfig from "@/data/homepage-config.json";

export default function HomePage() {
  const [selectedAccount, setSelectedAccount] = useState<TFTRentalAccount | null>(null);
  // Khởi tạo ngay lập tức với cấu hình đã setup sẵn trong JSON để load ra ngay tại 0.0s (không bị giật text mặc định)
  const [config, setConfig] = useState<HomepageConfig>(defaultConfig as unknown as HomepageConfig);

  useEffect(() => {
    async function loadConfig() {
      try {
        const liveConfig = await getHomepageConfig();
        if (liveConfig) {
          setConfig(liveConfig);
        }
      } catch (err) {
        console.warn("Dùng cấu hình trang chủ mặc định:", err);
      }
    }
    loadConfig();
  }, []);

  const sections = config?.sections || {
    hero: true,
    alertBanner: true,
    vipShop: true,
    cloneShop: true,
    about: true,
    services: true,
    reviews: true,
    faq: true,
    floatingChat: false,
  };

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-slate-900 selection:bg-orange-500 selection:text-white flex flex-col justify-between relative">
      {/* 1. Sticky Navigation Bar */}
      <TFTNavbar sectionsConfig={sections} />

      {/* 2. Hero Section: Persona & Rental Intro */}
      {sections.hero !== false && (
        <TFTHero heroConfig={config?.hero} imagesConfig={config?.images} />
      )}

      {/* 2.5. Mobile Quick Inventory Switcher (1-Chạm chuyển nhanh Kho VIP & Kho Clone) */}
      <div className="lg:hidden sticky top-[53px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2 px-3 shadow-xs">
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          <a
            href="#shop"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs text-center active:scale-95 transition-all truncate"
          >
            <span>👑 Kho VIP (Theo Giờ)</span>
          </a>
          <a
            href="#clone-shop"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold shadow-2xs text-center active:scale-95 transition-all truncate"
          >
            <span>⚡ Kho Clone (Sở Hữu)</span>
          </a>
        </div>
      </div>

      {/* 3. Core TFT Account Rental Shop */}
      {sections.vipShop !== false && (
        <TFTShop onSelectAccount={(acc) => setSelectedAccount(acc)} />
      )}

      {/* 3.5. Clone / Smurf Account Rental Shop (Thuê Dài Hạn) */}
      {sections.cloneShop !== false && <TFTCloneShop />}

      {/* 4. About Me & Gamer Achievements */}
      {sections.about !== false && <TFTAbout />}

      {/* 5. Rank Boosting & Coaching 1-1 Services */}
      {sections.services !== false && (
        <TFTServices packages={config?.servicePackages} />
      )}

      {/* 6. Customer Reviews & Trust Verification */}
      {sections.reviews !== false && <TFTReviews />}

      {/* 6.5. Customer Feedback & Improvement Survey Banner */}
      <TFTSurveyBanner />

      {/* 7. FAQ Section */}
      {sections.faq !== false && <TFTFaq customFaqs={config?.faqs} />}

      {/* 8. Footer */}
      <TFTFooter />

      {/* Floating Bottom Navigation Bar for Mobile */}
      <TFTMobileBottomBar />

      {/* Detail Rental Account & Fast Order Modal */}
      <TFTAccountModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </main>
  );
}
