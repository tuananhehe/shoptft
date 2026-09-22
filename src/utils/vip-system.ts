/**
 * Hệ Thống Cấp Bậc VIP & Đặc Quyền Dành Cho Khách Hàng
 * ShopTFT Mobile - Tuấn Thái Bình
 */

export type VipTierId = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "CHALLENGER";

export interface VipTier {
  id: VipTierId;
  name: string;
  badge: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
  borderClass: string;
  cardBg: string;
  minOrders: number;
  minSpent: number; // VNĐ
  discountPercent: number; // 2% -> 10%
  freeTestHours: number; // Số vé trải nghiệm 2h miễn phí
  swapPerk: string; // Đặc quyền đổi acc
  supportPerk: string; // Đặc quyền hỗ trợ
  summary: string;
  benefits: string[];
}

export const VIP_TIERS: Record<VipTierId, VipTier> = {
  BRONZE: {
    id: "BRONZE",
    name: "VIP Đồng (Khách Mới)",
    badge: "🥉 VIP ĐỒNG",
    iconName: "Shield",
    colorClass: "text-amber-700",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    borderClass: "border-amber-300",
    cardBg: "from-amber-700/20 via-orange-800/10 to-stone-900",
    minOrders: 0,
    minSpent: 0,
    discountPercent: 2,
    freeTestHours: 1,
    swapPerk: "Hỗ trợ đổi acc ngay nếu tài khoản bị lỗi hoặc không đăng nhập được",
    supportPerk: "Hỗ trợ tiêu chuẩn qua Zalo Tuấn Thái Bình",
    summary: "Hạng khởi đầu cho mọi cờ thủ tham gia trải nghiệm ShopTFT Mobile",
    benefits: [
      "Giảm ngay 2% cho mọi đơn thuê tài khoản & dịch vụ",
      "Tặng 1 Voucher tân thủ trải nghiệm",
      "Bảo hành 100% tài khoản trong suốt thời gian thuê",
      "Hỗ trợ cài đặt & hướng dẫn đăng nhập tận tình qua Zalo",
    ],
  },
  SILVER: {
    id: "SILVER",
    name: "VIP Bạc (Khách Quen)",
    badge: "🥈 VIP BẠC",
    iconName: "ShieldCheck",
    colorClass: "text-slate-700",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    borderClass: "border-slate-300",
    cardBg: "from-slate-400/20 via-slate-600/10 to-slate-900",
    minOrders: 2,
    minSpent: 100000,
    discountPercent: 3,
    freeTestHours: 1,
    swapPerk: "Được đổi acc miễn phí trong 15 phút đầu nếu không ưng ý đội hình",
    supportPerk: "Ưu tiên hỗ trợ phản hồi nhanh dưới 5 phút",
    summary: "Dành cho khách hàng đã thuê từ 2 đơn hoặc chi tiêu từ 100.000đ",
    benefits: [
      "Giảm 3% trực tiếp vào mỗi hóa đơn thuê tài khoản",
      "Tặng 1 Vé Test Acc VIP 2 Giờ miễn phí",
      "Được đổi tài khoản khác trong 15 phút đầu nếu không ưng ý",
      "Kênh ưu tiên phản hồi siêu tốc từ Admin",
    ],
  },
  GOLD: {
    id: "GOLD",
    name: "VIP Vàng (Khách VIP)",
    badge: "🥇 VIP VÀNG",
    iconName: "Crown",
    colorClass: "text-amber-600",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-400",
    borderClass: "border-amber-400 shadow-amber-500/20",
    cardBg: "from-amber-500/30 via-yellow-600/15 to-stone-900",
    minOrders: 5,
    minSpent: 500000,
    discountPercent: 5,
    freeTestHours: 2,
    swapPerk: "Được đổi acc 1 lần / ngày hoàn toàn miễn phí khi đang thuê",
    supportPerk: "Kênh chat Zalo VIP 1-1 riêng với Tuấn Thái Bình",
    summary: "Dành cho khách hàng thân thiết thuê từ 5 đơn hoặc chi tiêu từ 500.000đ",
    benefits: [
      "Giảm 5% trọn đời toàn bộ dịch vụ & tài khoản trên Web",
      "Tặng 2 Vé Test Acc VIP 2 Giờ miễn phí",
      "Đặc quyền đổi sang acc khác 1 lần / ngày nếu muốn đổi phong cách",
      "Hỗ trợ tư vấn đội hình & mẹo leo rank trực tiếp từ Cao Thủ",
    ],
  },
  PLATINUM: {
    id: "PLATINUM",
    name: "VIP Bạch Kim (Chiến Thần)",
    badge: "💎 VIP BẠCH KIM",
    iconName: "Sparkles",
    colorClass: "text-cyan-600",
    badgeBg: "bg-cyan-100 text-cyan-900 border-cyan-400",
    borderClass: "border-cyan-400 shadow-cyan-500/20",
    cardBg: "from-cyan-500/30 via-blue-600/15 to-slate-900",
    minOrders: 10,
    minSpent: 1500000,
    discountPercent: 7,
    freeTestHours: 3,
    swapPerk: "Được đổi acc thoải mái 2 lần / ngày không cần lý do",
    supportPerk: "Bảo hiểm tài khoản 100% + Hỗ trợ bù giờ nếu game cập nhật",
    summary: "Dành cho các cờ thủ cày rank chuyên nghiệp thuê từ 10 đơn hoặc chi tiêu từ 1.500.000đ",
    benefits: [
      "Giảm 7% trực tiếp vào mọi hóa đơn",
      "Tặng 3 Vé Test Acc VIP 2 Giờ miễn phí hàng tháng",
      "Đổi acc thoải mái 2 lần / ngày bất kể thời điểm",
      "Tự động cộng thêm 30 phút bù giờ khi Riot bảo trì / update",
    ],
  },
  CHALLENGER: {
    id: "CHALLENGER",
    name: "VIP Thách Đấu (Đẳng Cấp Vô Cực)",
    badge: "👑 VIP THÁCH ĐẤU",
    iconName: "Flame",
    colorClass: "text-rose-600",
    badgeBg: "bg-gradient-to-r from-amber-500 to-rose-600 text-white border-rose-300",
    borderClass: "border-rose-400 shadow-rose-500/30",
    cardBg: "from-rose-600/30 via-purple-700/20 to-stone-900",
    minOrders: 20,
    minSpent: 4000000,
    discountPercent: 10,
    freeTestHours: 999,
    swapPerk: "Đặc quyền đổi acc không giới hạn bất kỳ lúc nào",
    supportPerk: "Hotline & Zalo VIP phục vụ 24/7 tức thì trong 30 giây",
    summary: "Đẳng cấp VIP cao nhất dành cho khách hàng VIP Legend với chi tiêu từ 4.000.000đ hoặc từ 20 đơn",
    benefits: [
      "Giảm tối đa 10% trọn đời toàn bộ dịch vụ của Shop",
      "Test acc VIP 2 Giờ miễn phí không giới hạn",
      "Đổi sang bất kỳ tài khoản nào trong kho bất kỳ lúc nào",
      "Được đặt trước acc độc quyền trước khi mở thuê công khai",
      "Được tặng quà tri ân sinh nhật & dịp lễ đặc biệt từ Shop",
    ],
  },
};

/**
 * Tính toán cấp bậc VIP dựa trên số đơn hàng và tổng chi tiêu
 */
export function calculateVipTier(totalOrders: number, totalSpent: number): {
  currentTier: VipTier;
  nextTier: VipTier | null;
  progressPercent: number;
  ordersNeeded: number;
  spentNeeded: number;
} {
  const tiers: VipTier[] = [
    VIP_TIERS.BRONZE,
    VIP_TIERS.SILVER,
    VIP_TIERS.GOLD,
    VIP_TIERS.PLATINUM,
    VIP_TIERS.CHALLENGER,
  ];

  let currentTierIndex = 0;

  for (let i = tiers.length - 1; i >= 0; i--) {
    const t = tiers[i];
    if (totalOrders >= t.minOrders && totalSpent >= t.minSpent) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = tiers[currentTierIndex];
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      ordersNeeded: 0,
      spentNeeded: 0,
    };
  }

  const ordersNeeded = Math.max(0, nextTier.minOrders - totalOrders);
  const spentNeeded = Math.max(0, nextTier.minSpent - totalSpent);

  const prevSpent = currentTier.minSpent;
  const targetSpent = nextTier.minSpent;
  const spentProgress = targetSpent > prevSpent ? Math.min(100, Math.max(0, ((totalSpent - prevSpent) / (targetSpent - prevSpent)) * 100)) : 100;

  const prevOrders = currentTier.minOrders;
  const targetOrders = nextTier.minOrders;
  const ordersProgress = targetOrders > prevOrders ? Math.min(100, Math.max(0, ((totalOrders - prevOrders) / (targetOrders - prevOrders)) * 100)) : 100;

  const progressPercent = Math.round(Math.max(spentProgress, ordersProgress));

  return {
    currentTier,
    nextTier,
    progressPercent,
    ordersNeeded,
    spentNeeded,
  };
}
