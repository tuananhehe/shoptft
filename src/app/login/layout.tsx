import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Đăng Nhập Thành Viên | ShopTFTMobile",
  },
  description: "Trang đăng nhập dành cho thành viên quản lý thông tin CSKH tại ShopTFTMobile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
