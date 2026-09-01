"use client";

import React, { useState, useEffect } from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTHero } from "@/components/tft-hero";
import { TFTShop } from "@/components/tft-shop";
import { TFTCloneShop } from "@/components/tft-clone-shop";
import { TFTAbout } from "@/components/tft-about";
import { TFTServices } from "@/components/tft-services";
import { TFTReviews } from "@/components/tft-reviews";
import { TFTFaq } from "@/components/tft-faq";
import { TFTFooter } from "@/components/tft-footer";
import { TFTAccountModal } from "@/components/tft-account-modal";
import { TFTFloatingChat } from "@/components/tft-floating-chat";
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
    floatingChat: true,
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-orange-500 selection:text-white flex flex-col justify-between relative pb-16 sm:pb-0">
      {/* 1. Sticky Navigation Bar */}
      <TFTNavbar />

      {/* 2. Hero Section: Persona & Rental Intro */}
      {sections.hero !== false && (
        <TFTHero heroConfig={config?.hero} imagesConfig={config?.images} />
      )}

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

      {/* 7. FAQ Section */}
      {sections.faq !== false && <TFTFaq customFaqs={config?.faqs} />}

      {/* 8. Footer */}
      <TFTFooter />

      {/* 9. Floating Zalo Chat Button (Góc dưới phải) */}
      {sections.floatingChat !== false && <TFTFloatingChat />}

      {/* Detail Rental Account & Fast Order Modal */}
      <TFTAccountModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </main>
  );
}
