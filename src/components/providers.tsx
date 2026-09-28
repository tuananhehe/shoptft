"use client";

import React from "react";
import { UserAuthProvider } from "@/context/user-auth-context";
import { TFTSearchModal } from "@/components/tft-search-modal";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserAuthProvider>
      {children}
      <TFTSearchModal />
    </UserAuthProvider>
  );
}
