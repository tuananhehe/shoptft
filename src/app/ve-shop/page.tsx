"use client";

import React from "react";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTAbout } from "@/components/tft-about";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";

export default function VeShopPage() {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#090909] text-white selection:bg-white selection:text-black flex flex-col justify-between relative pb-16 lg:pb-0">
      <TFTNavbar />
      <div className="pt-8">
        <TFTAbout />
      </div>
      <TFTFooter />
      <TFTMobileBottomBar />
    </main>
  );
}
