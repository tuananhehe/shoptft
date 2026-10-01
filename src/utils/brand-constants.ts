/**
 * SOURCE OF TRUTH CHO THƯƠNG HIỆU & THÔNG TIN LIÊN HỆ CHÍNH THỨC
 * ShopTFTMobile • Vận hành bởi Tuấn Thái Bình TFT
 */

export interface SocialChannel {
  platform: string;
  url: string;
  label: string;
  badge?: string;
  actionText?: string;
}

export const OFFICIAL_BRAND = {
  // 1. Tên Thương Hiệu Chuẩn Hóa
  siteName: "ShopTFTMobile",
  primaryBrand: "ShopTFTMobile",
  secondaryBrand: "Tuấn Thái Bình TFT",
  role: "Cựu Thách Đấu ĐTCL & Hệ Thống Thuê Acc Minh Bạch",

  // 2. Tên Miền & Xuất Xứ Chuẩn Xác
  officialDomain: "shoptftmobile.net",
  canonicalOrigin: "https://www.shoptftmobile.net",

  // 3. Kênh Liên Hệ & Hỗ Trợ Trực Tiếp
  phoneZalo: "0352.867.283",
  zaloUrl: "https://zalo.me/0352867283",
  supportHours: "11:00 - 24:00 hàng ngày",
  contactCta: "Liên hệ Zalo",
  rentalCta: "Thuê qua Zalo",

  // 4. Bằng Chứng & Bảo Hiểm Xác Thực
  insuranceFund: "30.000.000đ",
  checkscamUrl: "https://checkscam.vn/?qh_ss=0352867283",
  checkscamLabel: "Bảo hiểm 30M Checkscam",

  // 5. Tài Nguyên Hình Ảnh
  avatarUrl: "/avatar.jpg",
  defaultOgImage: "/banner-seo.jpg",

  // 6. Tác Giả & Đại Diện Thực Thể
  editorialAuthor: "ShopTFTMobile Editorial",
  founderName: "Tuấn Thái Bình",
  founderTitle: "Cựu Thách Đấu ĐTCL",

  // 7. Kênh Mạng Xã Hội Chính Thức (Không dùng link rác)
  socialChannels: [
    {
      platform: "TikTok",
      url: "https://tiktok.com/@shoptftmobile",
      label: "Kênh TikTok ShopTFTMobile",
      badge: "1K+ Followers",
      actionText: "Xem TikTok ➔",
    },
    {
      platform: "Zalo Group",
      url: "https://zalo.me/g/tfjsec788",
      label: "Cộng đồng Zalo ShopTFTMobile",
      badge: "900+ Thành viên",
      actionText: "Tham Gia Zalo ➔",
    },
    {
      platform: "Discord",
      url: "https://discord.gg/shoptftmobile",
      label: "Cộng đồng Discord Game",
      badge: "50+ Online",
      actionText: "Vào Discord ➔",
    },
  ] as SocialChannel[],
};
