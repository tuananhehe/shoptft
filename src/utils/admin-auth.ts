/**
 * Admin Authentication & Security Utilities
 * ShopTFT Mobile - Tuấn Thái Bình
 */

import crypto from "crypto";

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tuanthaibinh8888";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "shoptft_secure_master_key_2026_tuanthaibinh";
const COOKIE_NAME = "admin_session";

// Thời gian hiệu lực phiên: 7 ngày (nhớ đăng nhập) hoặc 24 giờ
const SESSION_EXPIRY_REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_EXPIRY_DEFAULT_MS = 24 * 60 * 60 * 1000;

export interface AdminSessionData {
  role: "ADMIN";
  username: "tuanthaibinh";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Tạo chữ ký HMAC cho dữ liệu session
 */
function createSignature(payloadStr: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadStr)
    .digest("hex");
}

/**
 * Sinh chuỗi Session Token an toàn (Base64 + Signature)
 */
export function generateAdminSessionToken(remember: boolean = false): {
  token: string;
  expiresAt: number;
  maxAgeSeconds: number;
} {
  const now = Date.now();
  const durationMs = remember ? SESSION_EXPIRY_REMEMBER_MS : SESSION_EXPIRY_DEFAULT_MS;
  const expiresAt = now + durationMs;

  const data: AdminSessionData = {
    role: "ADMIN",
    username: "tuanthaibinh",
    issuedAt: now,
    expiresAt,
  };

  const payloadStr = JSON.stringify(data);
  const signature = createSignature(payloadStr);
  const token = Buffer.from(payloadStr).toString("base64") + "." + signature;

  return {
    token,
    expiresAt,
    maxAgeSeconds: Math.floor(durationMs / 1000),
  };
}

/**
 * Xác thực Session Token từ Cookie / Header
 */
export function verifyAdminSessionToken(token?: string | null): AdminSessionData | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [encodedPayload, receivedSignature] = token.split(".");
    if (!encodedPayload || !receivedSignature) return null;

    const payloadStr = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const expectedSignature = createSignature(payloadStr);

    if (receivedSignature !== expectedSignature) {
      return null;
    }

    const data: AdminSessionData = JSON.parse(payloadStr);
    if (!data || data.role !== "ADMIN" || data.expiresAt < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Lấy mật khẩu quản trị hiện tại (hỗ trợ lưu động hoặc biến môi trường)
 */
let memoryCustomPassword: string | null = null;

export function getMasterAdminPassword(): string {
  return memoryCustomPassword || DEFAULT_ADMIN_PASSWORD;
}

export function setMasterAdminPassword(newPass: string): void {
  memoryCustomPassword = newPass;
}

export function verifyAdminPassword(inputPass: string): boolean {
  if (!inputPass) return false;
  const currentPass = getMasterAdminPassword();
  return inputPass === currentPass;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
