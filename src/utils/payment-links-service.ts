/**
 * Service Quản Lý Link Thanh Toán Tạm Thời (Hạn 5 Phút)
 * ShopTFT Mobile - Tuấn Thái Bình
 */

import { BankConfig, buildVietQRUrl } from "./vietqr-helper";

export interface PaymentLinkData {
  id: string; // e.g. "PAY-A82B3C"
  accountCode: string;
  accountTitle: string;
  accountCategory?: "VIP" | "CLONE";
  thumbnail: string;
  packageName: string;
  durationHours: number;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrTemplate?: string;
  transferContent: string;
  qrUrl: string;
  createdAt: number; // timestamp ms
  expiresAt: number; // timestamp ms (createdAt + 5 * 60 * 1000)
  status: "ACTIVE" | "EXPIRED" | "COMPLETED";
}

/**
 * Cấu trúc nén dữ liệu thanh toán nhúng trực tiếp vào URL token
 */
interface CompactPaymentData {
  i: string; // id
  c: string; // accountCode
  t: string; // accountTitle
  k?: "VIP" | "CLONE"; // accountCategory
  u?: string; // thumbnail
  p: string; // packageName
  h: number; // durationHours
  a: number; // amount
  b: string; // bankId
  n: string; // bankName
  s: string; // accountNumber
  o: string; // accountHolder
  q?: string; // qrTemplate
  m: string; // transferContent
  cn?: string; // customerName
  cp?: string; // customerPhone
  ct: number; // createdAt
  et: number; // expiresAt
}

/**
 * Thời hạn của link thanh toán: 5 phút (300 giây)
 */
export const PAYMENT_LINK_DURATION_MS = 5 * 60 * 1000;

/**
 * Sinh mã ngẫu nhiên dạng PAY-XXXXXX
 */
export function generatePaymentLinkId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PAY-${code}`;
}

/**
 * Chuyển chuỗi UTF-8 sang Base64 URL-safe (hỗ trợ cả Browser và Node.js)
 */
export function toBase64Url(str: string): string {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (err) {
    console.error("Lỗi toBase64Url:", err);
    return "";
  }
}

/**
 * Chuyển Base64 URL-safe sang chuỗi UTF-8 (hỗ trợ cả Browser và Node.js)
 */
export function fromBase64Url(base64url: string): string {
  try {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("utf8");
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (err) {
    console.error("Lỗi fromBase64Url:", err);
    return "";
  }
}

/**
 * Mã hóa toàn bộ thông tin thanh toán thành token URL an toàn
 */
export function encodePaymentToken(data: PaymentLinkData): string {
  const compact: CompactPaymentData = {
    i: data.id,
    c: data.accountCode,
    t: data.accountTitle,
    k: data.accountCategory,
    u: data.thumbnail,
    p: data.packageName,
    h: data.durationHours,
    a: data.amount,
    b: data.bankId,
    n: data.bankName,
    s: data.accountNumber,
    o: data.accountHolder,
    q: data.qrTemplate,
    m: data.transferContent,
    cn: data.customerName,
    cp: data.customerPhone,
    ct: data.createdAt,
    et: data.expiresAt,
  };
  return toBase64Url(JSON.stringify(compact));
}

/**
 * Giải mã token URL thành dữ liệu thanh toán hoàn chỉnh
 */
export function decodePaymentToken(tokenStr: string): PaymentLinkData | null {
  try {
    if (!tokenStr || typeof tokenStr !== "string") return null;
    const jsonStr = fromBase64Url(tokenStr.trim());
    if (!jsonStr) return null;
    const compact: CompactPaymentData = JSON.parse(jsonStr);

    if (!compact || !compact.i || !compact.c || !compact.a) {
      return null;
    }

    const now = Date.now();
    const isExpired = compact.et ? now > compact.et : false;

    const qrUrl = buildVietQRUrl({
      bankId: compact.b || "ACB",
      accountNumber: compact.s || "23456789",
      accountHolder: compact.o || "TUAN THAI BINH",
      amount: compact.a,
      description: compact.m || `THUE ACC ${compact.c}`,
      template: compact.q || "compact2",
    });

    return {
      id: compact.i,
      accountCode: compact.c,
      accountTitle: compact.t || compact.c,
      accountCategory: compact.k || "VIP",
      thumbnail: compact.u || "",
      packageName: compact.p || "Gói Thuê Acc",
      durationHours: compact.h || 2,
      amount: compact.a,
      customerName: compact.cn,
      customerPhone: compact.cp,
      bankId: compact.b || "ACB",
      bankName: compact.n || "Ngân hàng TMCP Á Châu (ACB)",
      accountNumber: compact.s || "23456789",
      accountHolder: compact.o || "TUAN THAI BINH",
      qrTemplate: compact.q || "compact2",
      transferContent: compact.m || `THUE ACC ${compact.c}`,
      qrUrl,
      createdAt: compact.ct || now,
      expiresAt: compact.et || now + PAYMENT_LINK_DURATION_MS,
      status: isExpired ? "EXPIRED" : "ACTIVE",
    };
  } catch (err) {
    console.error("Lỗi decodePaymentToken:", err);
    return null;
  }
}

/**
 * Tạo link thanh toán hoàn chỉnh kèm token bảo mật tự thân (hoạt động 100% trên cả Web thật và Local)
 */
export function buildPaymentLinkUrl(origin: string, link: PaymentLinkData): string {
  const token = encodePaymentToken(link);
  const base = origin ? origin.replace(/\/+$/, "") : "";
  return `${base}/pay/${link.id}?d=${token}`;
}

/**
 * Định dạng tin nhắn gửi khách hàng qua Zalo / Messenger
 */
export function buildCustomerPaymentMessage(link: PaymentLinkData, fullPayUrl: string): string {
  return `Dạ Tuấn Thái Bình gửi bạn link thanh toán thuê acc ${link.accountCode} (${link.packageName}):\n` +
    `👉 Link thanh toán: ${fullPayUrl}\n` +
    `⏱️ Link có hiệu lực trong vòng 5 phút.\n` +
    `💰 Số tiền: ${link.amount.toLocaleString("vi-VN")}đ\n` +
    `🏦 Ngân hàng: ${link.bankId} (${link.bankName})\n` +
    `💳 STK: ${link.accountNumber} - Chủ TK: ${link.accountHolder}\n` +
    `📝 Nội dung CK: ${link.transferContent}\n\n` +
    `Bạn chỉ cần bấm vào link để quét mã QR VietQR thanh toán nhanh và chính xác nhất nhé!`;
}

