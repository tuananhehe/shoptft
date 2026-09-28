import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { HomepageConfig } from "@/utils/homepage-service";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";

const STORAGE_KEY = "system/homepage-config.json";
const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "homepage-config.json");


const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  sections: {
    hero: true,
    alertBanner: true,
    vipShop: true,
    cloneShop: true,
    about: true,
    services: true,
    reviews: true,
    faq: true,
    floatingChat: false,
  },
  hero: {
    badge: "HỆ THỐNG THUÊ ACC TFT ĐTCL CHÍNH CHỦ // TUẤN THÁI BÌNH",
    titleLine1: "Shop Thuê Acc TFT ĐTCL",
    titleLine2: "Uy Tín Hàng Đầu",
    titleHighlight: "Việt Nam",
    subtitle:
      "ShopTFTMobile chuyên tài khoản TFT/ĐTCL Việt Nam uy tín, đa dạng từ giá rẻ đến VIP. Thông tin minh bạch, tư vấn chu đáo và bàn giao trực tiếp qua Zalo.",
    stats: [
      { id: "experience", label: "Gắn Bó Cùng ĐTCL", value: "5+ Năm" },
      { id: "insurance", label: "Quỹ Checkscam.vn", value: "30.000.000đ" },
      { id: "delivery", label: "Bàn Giao & Hỗ Trợ", value: "Trực Tiếp Zalo" },
      { id: "support", label: "Hỗ Trợ 1-1", value: "Cùng Chủ Shop" },
    ],
  },
  images: {
    heroCardImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    heroCardCode: "MS: 8899",
    heroCardChibi: "Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long",
    heroCardArena: "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)",
    heroCardPrice: "15.000đ/h",
    avatarUrl: "/avatar.jpg",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
  },
  alertBanner: {
    active: true,
    content:
      "🎁 Ưu đãi đặc biệt: Hỗ trợ tư vấn chọn acc và hướng dẫn đăng nhập trực tiếp qua Zalo Tuấn Thái Bình!",
  },
  seo: {
    metaTitle: "Tuấn Thái Bình TFT | Hệ Thống Thuê Acc ĐTCL - TFT Mobile Uy Tín",
    metaDescription:
      "ShopTFTMobile chuyên tài khoản TFT/ĐTCL Việt Nam uy tín, đa dạng từ giá rẻ đến VIP. Thông tin minh bạch, tư vấn chu đáo và bàn giao trực tiếp qua Zalo.",
    metaKeywords:
      "thuê acc tft, thuê acc đtcl, shop tft, tuấn thái bình tft, thuê acc tí nị, cày thuê đtcl, shop acc tft uy tín, shop tft mobile, thuê tài khoản đtcl, tí nị ahri, tí nị yasuo, coaching tft",
    canonicalUrl: "https://www.shoptftmobile.net/",
    ogTitle: "Tuấn Thái Bình TFT | Nền Tảng Thuê Acc ĐTCL Uy Tín",
    ogDescription:
      "ShopTFTMobile chuyên tài khoản TFT/ĐTCL Việt Nam uy tín, đa dạng từ giá rẻ đến VIP. Thông tin minh bạch, tư vấn chu đáo và bàn giao trực tiếp qua Zalo.",
    ogImage: "/banner-seo.jpg",
    faviconUrl: "/favicon.ico",
    bgImageUrl: "",
    bgColor: "#F8FAFC",
    googleVerification: "",
    author: "Tuấn Thái Bình",
  },
  pricing: {
    passChangeFee: 20000,
    rate2Hours: 3,
    rate7Days: 12,
    rate30Days: 30,
  },
  contact: {
    phoneZalo: "0352.867.283",
    checkscamFund: "30.000.000đ",
  },
  bank: {
    bankId: "ACB",
    bankName: "Ngân hàng TMCP Á Châu (ACB)",
    accountNumber: "23456789",
    accountHolder: "TUAN THAI BINH",
    qrTemplate: "compact2",
    transferSyntax: "THUE ACC {CODE}",
  },
  servicePackages: [
    {
      id: "srv-01",
      title: "Cày Rank ĐTCL (Cày tay trực tiếp)",
      badge: "HỖ TRỢ LEO RANK",
      price: "Từ 50.000đ / Bậc",
      popular: false,
      features: [
        "Cày tay trực tiếp bởi Tuấn Thái Bình (Cựu Thách Đấu 1.134 ĐNG)",
        "Đảm bảo an toàn tài khoản, đổi IP sạch tránh khóa acc",
        "Cập nhật tiến độ liên tục qua Zalo sau mỗi trận đấu",
        "Hỗ trợ tận tâm trong suốt quá trình cày rank",
      ],
    },
    {
      id: "srv-02",
      title: "Coaching 1-1 Bắt Meta & Tư Duy Xoay Bài",
      badge: "HOT NHẤT HIỆN TẠI",
      price: "150.000đ / Buổi (90 Phút)",
      popular: true,
      features: [
        "Voice 1-1 qua Discord/Zalo, xem màn hình và chỉ lỗi sai trực tiếp",
        "Hướng dẫn cách giữ máu, quản lý kinh tế và roll ở các round then chốt",
        "Giáo án độc quyền các đội hình Meta leo rank ổn định nhất",
        "Hỗ trợ giải đáp thắc mắc xoay bài qua Zalo sau buổi học",
      ],
    },
    {
      id: "srv-03",
      title: "Gói Duo Cùng Cựu Thách Đấu (Kèm Trực Tiếp)",
      badge: "NÂNG TẦM MMR",
      price: "100.000đ / Giờ (2-3 Trận)",
      popular: false,
      features: [
        "Duo trực tiếp cùng Tuấn Thái Bình trên acc phụ trình độ tương đương",
        "Call bài, chia sẻ tướng và giữ chuỗi thắng cùng bạn trong trận",
        "Cải thiện MMR nhanh chóng, không lo gặp đồng đội troll game",
        "Vừa leo rank vừa học hỏi tư duy đỉnh cao trong từng round",
      ],
    },
  ],
  faqs: [
    {
      id: "faq-01",
      q: "Sau khi gửi thông tin qua Zalo thì bao lâu tôi nhận được tài khoản?",
      a: "Sau khi bạn xác nhận mã tài khoản và hoàn tất chuyển khoản, Shop sẽ trực tiếp kiểm tra và bàn giao tài khoản kèm hướng dẫn đăng nhập an toàn qua tin nhắn Zalo.",
      category: "THUE_ACC",
      badge: "Bàn giao Zalo",
    },
    {
      id: "faq-02",
      q: "Tôi có cần phải đặt cọc khi thuê tài khoản không?",
      a: "Không cần đặt cọc. Bạn chỉ cần thanh toán đúng số tiền của gói thời gian bạn chọn (2h, 7 ngày, 30 ngày...). Không phát sinh bất kỳ chi phí thế chấp hay phụ phí ẩn nào.",
      category: "THUE_ACC",
      badge: "Không Cọc",
    },
    {
      id: "faq-03",
      q: "Nếu đang chơi mà tài khoản bị lỗi hoặc bị trùng pass thì shop xử lý ra sao?",
      a: "ShopTFTMobile cam kết hỗ trợ chu đáo trong suốt thời gian thuê. Nếu có bất kỳ sự cố gián đoạn nào, shop sẽ đổi ngay acc tương đương hoặc bù thêm giờ chơi nhanh chóng qua Zalo 0352.867.283.",
      category: "BAO_MAT",
      badge: "Hỗ trợ chu đáo",
    },
    {
      id: "faq-04",
      q: "Shop có bảo hiểm checkscam bảo chứng uy tín không?",
      a: "Có! Tuấn Thái Bình đã đóng Quỹ Bảo Hiểm 30.000.000đ trên diễn đàn Checkscam.vn uy tín hàng đầu Việt Nam bảo chứng số điện thoại 0352.867.283. Bạn hoàn toàn có thể kiểm tra công khai danh tính bất cứ lúc nào.",
      category: "THANH_TOAN",
      badge: "Quỹ 30M",
    },
    {
      id: "faq-05",
      q: "Tôi có thể đổi sang Tướng Tí Nị hoặc Sân Đấu khác trong thời gian thuê không?",
      a: "Hoàn toàn được! Bạn chỉ cần nhắn tin Zalo cho shop, nếu acc khác đang trống shop sẽ hỗ trợ chuyển đổi linh hoạt số giờ còn lại sang acc mới để bạn trải nghiệm.",
      category: "THUE_ACC",
      badge: "Đổi acc linh hoạt",
    },
    {
      id: "faq-06",
      q: "Chơi trên điện thoại (ĐTCL Mobile iOS / Android) hay PC có được không?",
      a: "Tất cả tài khoản của shop đều hỗ trợ đăng nhập đa nền tảng: Cả trên máy tính PC (Client Riot VNG) và điện thoại di động (ĐTCL Mobile iOS / Android) đều mượt mà.",
      category: "THUE_ACC",
      badge: "Hỗ trợ Mobile & PC",
    },
  ],
};

let memoryConfig: HomepageConfig = { ...DEFAULT_HOMEPAGE_CONFIG };

async function readConfig(): Promise<HomepageConfig> {
  const loaded = await getCloudJson<HomepageConfig>(
    STORAGE_KEY,
    CONFIG_FILE_PATH,
    DEFAULT_HOMEPAGE_CONFIG
  );
  if (loaded && typeof loaded === "object") {
    memoryConfig = {
      ...DEFAULT_HOMEPAGE_CONFIG,
      ...loaded,
      sections: { ...DEFAULT_HOMEPAGE_CONFIG.sections, ...(loaded.sections || {}) },
      hero: { ...DEFAULT_HOMEPAGE_CONFIG.hero, ...(loaded.hero || {}) },
      images: { ...DEFAULT_HOMEPAGE_CONFIG.images, ...(loaded.images || {}) },
      alertBanner: { ...DEFAULT_HOMEPAGE_CONFIG.alertBanner, ...(loaded.alertBanner || {}) },
      pricing: { ...DEFAULT_HOMEPAGE_CONFIG.pricing, ...(loaded.pricing || {}) } as any,
      contact: { ...DEFAULT_HOMEPAGE_CONFIG.contact, ...(loaded.contact || {}) } as any,
    };
  }
  return memoryConfig;
}

async function writeConfig(cfg: HomepageConfig): Promise<boolean> {
  memoryConfig = cfg;
  return await saveCloudJson(STORAGE_KEY, cfg, CONFIG_FILE_PATH);
}

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

/**
 * GET /api/homepage
 * Lấy toàn bộ cấu hình trang chủ
 */
export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, data: memoryConfig },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/homepage
 * Cập nhật cấu hình trang chủ (Admin)
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("action") === "reset") {
      await writeConfig(DEFAULT_HOMEPAGE_CONFIG);
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục cấu hình trang chủ về mặc định!",
        data: DEFAULT_HOMEPAGE_CONFIG,
      });
    }

    const body = await req.json();
    const current = await readConfig();

    const updatedConfig: HomepageConfig = {
      ...current,
      ...body,
      sections: {
        ...current.sections,
        ...(body.sections || {}),
      },
      hero: {
        ...current.hero,
        ...(body.hero || {}),
        stats: body.hero?.stats || current.hero.stats,
      },
      images: {
        ...current.images,
        ...(body.images || {}),
      },
      alertBanner: {
        ...current.alertBanner,
        ...(body.alertBanner || {}),
      },
      pricing: {
        ...(current.pricing || DEFAULT_HOMEPAGE_CONFIG.pricing!),
        ...(body.pricing || {}),
      },
      contact: {
        ...(current.contact || DEFAULT_HOMEPAGE_CONFIG.contact!),
        ...(body.contact || {}),
      },
      bank: {
        ...(current.bank || DEFAULT_HOMEPAGE_CONFIG.bank!),
        ...(body.bank || {}),
      },
      servicePackages: body.servicePackages || current.servicePackages,
      faqs: body.faqs || current.faqs,
    };

    await writeConfig(updatedConfig);

    return NextResponse.json({
      success: true,
      message: "Đã lưu cài đặt trang chủ thành công!",
      data: updatedConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi lưu cấu hình trang chủ" },
      { status: 500 }
    );
  }
}

