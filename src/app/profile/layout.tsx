import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Hồ Sơ Thành Viên | ShopTFTMobile",
  },
  description: "Trang thông tin tài khoản thành viên và hỗ trợ CSKH tại ShopTFTMobile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
