"use client";

import React, { useState } from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTHero } from "@/components/tft-hero";
import { TFTShop } from "@/components/tft-shop";
import { TFTAbout } from "@/components/tft-about";
import { TFTServices } from "@/components/tft-services";
import { TFTReviews } from "@/components/tft-reviews";
import { TFTFAQ } from "@/components/tft-faq";
import { TFTFooter } from "@/components/tft-footer";
import { TFTAccountModal } from "@/components/tft-account-modal";
import { TFTFloatingChat } from "@/components/tft-floating-chat";
import { TFTRentalAccount } from "@/data/tft-data";

export default function HomePage() {
  const [selectedAccount, setSelectedAccount] = useState<TFTRentalAccount | null>(null);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-orange-500 selection:text-white flex flex-col justify-between relative pb-16 sm:pb-0">
      {/* 1. Sticky Navigation Bar */}
      <TFTNavbar />

      {/* 2. Hero Section: Persona & Rental Intro */}
      <TFTHero />

      {/* 3. Core TFT Account Rental Shop */}
      <TFTShop onSelectAccount={(acc) => setSelectedAccount(acc)} />

      {/* 4. About Me & Gamer Achievements */}
      <TFTAbout />

      {/* 5. Rank Boosting & Coaching 1-1 Services */}
      <TFTServices />

      {/* 6. Customer Reviews & Trust Verification */}
      <TFTReviews />

      {/* 7. FAQ Section */}
      <TFTFAQ />

      {/* 8. Footer */}
      <TFTFooter />

      {/* 9. Floating Zalo Chat Button (Góc dưới phải) */}
      <TFTFloatingChat />

      {/* Detail Rental Account & Fast Order Modal */}
      <TFTAccountModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </main>
  );
}
