"use client";

import React from "react";
import { UserAuthProvider } from "@/context/user-auth-context";
import { UserProfileModal } from "@/components/user-profile-modal";
import { TFTSearchModal } from "@/components/tft-search-modal";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserAuthProvider>
      {children}
      <UserProfileModal />
      <TFTSearchModal />
      <TFTMobileBottomBar />
    </UserAuthProvider>
  );
}
