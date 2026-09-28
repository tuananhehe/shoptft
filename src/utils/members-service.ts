import crypto from "crypto";
import path from "path";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";

export interface Member {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  full_name: string;
  zalo: string;
  status: "ACTIVE" | "LOCKED";
  role: "MEMBER";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type SafeMember = Omit<Member, "passwordHash" | "salt">;

const STORAGE_KEY = "shoptft_members.json";
const LOCAL_FILE_PATH = path.join(process.cwd(), "src", "data", "members.json");
const MEMBER_SESSION_SECRET =
  process.env.MEMBER_SESSION_SECRET ||
  "shoptft_member_secure_key_2026_tuanthaibinh_secret";

// 30 days session
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  try {
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return hash === verifyHash;
  } catch {
    return false;
  }
}

export interface MemberSessionData {
  id: string;
  username: string;
  role: "MEMBER";
  hasCompletedProfile: boolean;
  issuedAt: number;
  expiresAt: number;
}

function createSignature(payloadStr: string): string {
  return crypto
    .createHmac("sha256", MEMBER_SESSION_SECRET)
    .update(payloadStr)
    .digest("hex");
}

export function generateMemberSessionToken(member: Member): {
  token: string;
  expiresAt: number;
  maxAgeSeconds: number;
} {
  const now = Date.now();
  const expiresAt = now + SESSION_EXPIRY_MS;
  const hasCompletedProfile = Boolean(
    member.full_name &&
    member.full_name.trim().length >= 2 &&
    member.zalo &&
    member.zalo.trim().length >= 6
  );

  const data: MemberSessionData = {
    id: member.id,
    username: member.username,
    role: "MEMBER",
    hasCompletedProfile,
    issuedAt: now,
    expiresAt,
  };

  const payloadStr = JSON.stringify(data);
  const signature = createSignature(payloadStr);
  const token = Buffer.from(payloadStr).toString("base64") + "." + signature;

  return {
    token,
    expiresAt,
    maxAgeSeconds: Math.floor(SESSION_EXPIRY_MS / 1000),
  };
}

export function verifyMemberSessionToken(
  token?: string | null
): MemberSessionData | null {
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

    const data: MemberSessionData = JSON.parse(payloadStr);
    if (!data || data.role !== "MEMBER" || data.expiresAt < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function toSafeMember(member: Member, isAdmin: boolean = false): SafeMember {
  const { passwordHash, salt, ...safe } = member;
  if (!isAdmin) {
    delete safe.notes;
  }
  return safe;
}

export async function getMembers(): Promise<Member[]> {
  const list = await getCloudJson<Member[]>(STORAGE_KEY, LOCAL_FILE_PATH, []);
  return Array.isArray(list) ? list : [];
}

export async function saveMembers(members: Member[]): Promise<boolean> {
  return await saveCloudJson<Member[]>(STORAGE_KEY, members, LOCAL_FILE_PATH);
}

export async function getMemberById(id: string): Promise<Member | null> {
  const members = await getMembers();
  return members.find((m) => m.id === id) || null;
}

export async function getMemberByUsername(username: string): Promise<Member | null> {
  const normalized = username.trim().toLowerCase();
  const members = await getMembers();
  return members.find((m) => m.username.toLowerCase() === normalized) || null;
}

export async function createMember(data: {
  username: string;
  password: string;
  full_name?: string;
  zalo?: string;
  notes?: string;
  status?: "ACTIVE" | "LOCKED";
}): Promise<{ success: boolean; member?: SafeMember; error?: string }> {
  const normalizedUsername = data.username.trim().toLowerCase();

  if (!normalizedUsername || normalizedUsername.length < 3) {
    return {
      success: false,
      error: "Tên đăng nhập phải có ít nhất 3 ký tự.",
    };
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(normalizedUsername)) {
    return {
      success: false,
      error: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới hoặc gạch nối.",
    };
  }

  if (!data.password || data.password.length < 6) {
    return {
      success: false,
      error: "Mật khẩu phải có ít nhất 6 ký tự.",
    };
  }

  const existing = await getMemberByUsername(normalizedUsername);
  if (existing) {
    return {
      success: false,
      error: `Tài khoản "${normalizedUsername}" đã tồn tại trên hệ thống.`,
    };
  }

  const { hash, salt } = hashPassword(data.password);
  const now = new Date().toISOString();

  const newMember: Member = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: normalizedUsername,
    passwordHash: hash,
    salt,
    full_name: (data.full_name || "").trim(),
    zalo: (data.zalo || "").trim(),
    status: data.status || "ACTIVE",
    role: "MEMBER",
    notes: (data.notes || "").trim(),
    createdAt: now,
    updatedAt: now,
  };

  const members = await getMembers();
  members.unshift(newMember);
  const saved = await saveMembers(members);

  if (!saved) {
    return {
      success: false,
      error: "Không thể lưu dữ liệu thành viên vào hệ thống.",
    };
  }

  return {
    success: true,
    member: toSafeMember(newMember),
  };
}

export async function updateMember(
  id: string,
  updates: Partial<Pick<Member, "full_name" | "zalo" | "status" | "notes">>
): Promise<{ success: boolean; member?: SafeMember; error?: string }> {
  const members = await getMembers();
  const idx = members.findIndex((m) => m.id === id);

  if (idx === -1) {
    return { success: false, error: "Không tìm thấy tài khoản thành viên." };
  }

  const current = members[idx];
  const now = new Date().toISOString();

  const updated: Member = {
    ...current,
    ...(updates.full_name !== undefined
      ? { full_name: updates.full_name.trim() }
      : {}),
    ...(updates.zalo !== undefined ? { zalo: updates.zalo.trim() } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.notes !== undefined ? { notes: updates.notes.trim() } : {}),
    updatedAt: now,
  };

  members[idx] = updated;
  const saved = await saveMembers(members);

  if (!saved) {
    return { success: false, error: "Lưu thông tin thất bại." };
  }

  return { success: true, member: toSafeMember(updated) };
}

export async function resetMemberPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
  }

  const members = await getMembers();
  const idx = members.findIndex((m) => m.id === id);

  if (idx === -1) {
    return { success: false, error: "Không tìm thấy tài khoản thành viên." };
  }

  const { hash, salt } = hashPassword(newPassword);
  members[idx].passwordHash = hash;
  members[idx].salt = salt;
  members[idx].updatedAt = new Date().toISOString();

  const saved = await saveMembers(members);
  if (!saved) {
    return { success: false, error: "Không thể cập nhật mật khẩu." };
  }

  return { success: true };
}

export async function recordLastLogin(id: string): Promise<void> {
  const members = await getMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx !== -1) {
    members[idx].lastLoginAt = new Date().toISOString();
    await saveMembers(members);
  }
}
