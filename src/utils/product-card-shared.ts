import { TFTRentalAccount, TFTCloneAccount } from "@/data/tft-data";

/**
 * Định dạng tiền tệ Việt Nam (VNĐ) chuẩn: 15.000đ, 99.000đ, 1.200.000đ
 */
export function formatVND(amount?: number | null): string {
  if (amount == null || isNaN(amount)) return "0đ";
  return `${Number(amount).toLocaleString("vi-VN")}đ`;
}

/**
 * Interface thống nhất chuẩn hóa dữ liệu hiển thị cho Thẻ Sản Phẩm (Product Card)
 */
export interface ProductCardData {
  id: string;
  code: string;
  type: "VIP" | "CLONE";
  title: string;
  thumbnail: string;
  rank?: string;
  rankBadgeBg?: string;
  rankColor?: string;
  status: "AVAILABLE" | "RENTED" | string;
  rentedUntil?: string | null;
  price: number;
  priceUnit: string;
  mainPet?: string;
  extraPetsCount?: number;
  allPetsSummary?: string;
  arena?: string;
  features?: string[];
  description?: string;
  createdAt?: string;
  rawVip?: TFTRentalAccount;
  rawClone?: TFTCloneAccount;
}

/**
 * Chuẩn hóa tài khoản VIP thành ProductCardData
 */
export function normalizeVipAccount(
  account: TFTRentalAccount,
  priceMode: string = "AUTO"
): ProductCardData {
  const effectiveMode =
    account.priceDisplayType && account.priceDisplayType !== "AUTO"
      ? account.priceDisplayType
      : priceMode && priceMode !== "AUTO"
      ? priceMode
      : "HOURLY";

  let price = Number(account.hourlyPrice) || 15000;
  let priceUnit = " / Giờ";

  if (effectiveMode === "DAILY") {
    price = account.dailyPrice || (Number(account.hourlyPrice) || 15000) * 3;
    priceUnit = " / Ngày";
  } else if (effectiveMode === "LONG_TERM") {
    const baseValue =
      Number(account.accountValue) ||
      Number(account.periodPrice) ||
      Number(account.monthlyPrice) ||
      ((Number(account.hourlyPrice) || 15000) * 50) ||
      850000;
    price = Number(account.periodPrice) || Number(account.monthlyPrice) || baseValue;
    priceUnit = account.periodUnit || " / Trọn gói";
  } else if (effectiveMode === "CUSTOM") {
    price = account.customPrice || Number(account.hourlyPrice) || 15000;
    priceUnit = account.customPriceUnit ? ` ${account.customPriceUnit}` : "";
  }

  const allChibi = Array.isArray(account.allChibi) && account.allChibi.length > 0
    ? account.allChibi
    : account.mainChibi
    ? [account.mainChibi]
    : [];

  const mainPet = allChibi[0] || account.mainChibi || account.title;
  const extraPetsCount = Math.max(0, allChibi.length - 1);
  const allPetsSummary = extraPetsCount > 0 ? `${mainPet} +${extraPetsCount}` : mainPet;
  const arena = account.mainArena || (Array.isArray(account.allArenas) && account.allArenas[0]) || "";

  return {
    id: account.id,
    code: account.code,
    type: "VIP",
    title: account.title,
    thumbnail: account.thumbnail,
    rank: account.rank,
    rankBadgeBg: "bg-white/10 text-white border-white/15",
    rankColor: "text-white",
    status: account.status === "RENTED" ? "RENTED" : "AVAILABLE",
    rentedUntil: account.rentedUntil,
    price,
    priceUnit,
    mainPet,
    extraPetsCount,
    allPetsSummary,
    arena,
    description: account.description,
    createdAt: account.createdAt,
    rawVip: account,
  };
}

/**
 * Chuẩn hóa tài khoản CLONE thành ProductCardData
 */
export function normalizeCloneAccount(
  account: TFTCloneAccount,
  _priceMode: string = "AUTO"
): ProductCardData {
  const price = Number(account.price) || Number(account.periodPrice) || 79000;
  const priceUnit = " / Sở Hữu";
  const features = Array.isArray(account.features) ? account.features : [];
  const mainPet = account.title;

  return {
    id: account.id,
    code: account.code,
    type: "CLONE",
    title: account.title,
    thumbnail: account.thumbnail,
    rank: account.rankBadge || "UNRANKED",
    status: account.status === "RENTED" ? "RENTED" : "AVAILABLE",
    rentedUntil: account.rentedUntil,
    price,
    priceUnit,
    mainPet,
    allPetsSummary: mainPet,
    arena: "",
    features,
    description: account.description,
    createdAt: account.createdAt,
    rawClone: account,
  };
}
