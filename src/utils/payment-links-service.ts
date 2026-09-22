/**
 * Service Quản Lý Link Thanh Toán Tạm Thời (Hạn 5 Phút)
 * ShopTFT Mobile - Tuấn Thái Bình
 */

import { BankConfig } from "./vietqr-helper";

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
