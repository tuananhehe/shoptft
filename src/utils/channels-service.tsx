import React from "react";
import { Globe } from "lucide-react";

export type ChannelPlatform =
  | "tiktok"
  | "zalo"
  | "discord"
  | "facebook"
  | "youtube"
  | "telegram"
  | "website"
  | "other";

export interface CommunityChannelItem {
  id: string;
  platform: ChannelPlatform;
  title: string;
  subtitle: string;
  badge: string;
  link: string;
  buttonText: string;
  isActive: boolean;
  order: number;
}

// Platform Icon Components
export const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.12z" />
  </svg>
);

export const ZaloIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 4C12.954 4 4 12.059 4 22c0 5.748 3.01 10.864 7.747 14.204-.33 2.502-1.397 5.704-3.568 8.01a1 1 0 0 0 .977 1.637c4.68-.696 8.548-2.613 10.742-4.004A22.25 22.25 0 0 0 24 42c11.046 0 20-8.059 20-18S35.046 4 24 4z"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path
      d="M13.5 29.5V26.8l8.2-10.5H13.8V13.5h11.8v2.6L17.2 26.8h8.4v2.7H13.5zm14.8 0V13.5h4.1v16h-4.1zm7.8 0V13.5h4V26.5h5.8v3H36.1z"
      fill="currentColor"
    />
  </svg>
);

export const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z" />
  </svg>
);

export const getPlatformMeta = (platform: ChannelPlatform) => {
  switch (platform) {
    case "tiktok":
      return {
        name: "TikTok",
        icon: <TikTokIcon />,
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        iconBg: "bg-rose-50 text-rose-600 border-rose-200",
        buttonStyle: "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200",
      };
    case "zalo":
      return {
        name: "Zalo",
        icon: <ZaloIcon />,
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        iconBg: "bg-sky-50 text-sky-600 border-sky-200",
        buttonStyle: "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200",
      };
    case "discord":
      return {
        name: "Discord",
        icon: <DiscordIcon />,
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
        buttonStyle: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200",
      };
    case "facebook":
      return {
        name: "Facebook",
        icon: <FacebookIcon />,
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        iconBg: "bg-blue-50 text-blue-600 border-blue-200",
        buttonStyle: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
      };
    case "youtube":
      return {
        name: "YouTube",
        icon: <YouTubeIcon />,
        badgeBg: "bg-red-50 text-red-700 border-red-200",
        iconBg: "bg-red-50 text-red-600 border-red-200",
        buttonStyle: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
      };
    case "telegram":
      return {
        name: "Telegram",
        icon: <TelegramIcon />,
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        iconBg: "bg-sky-50 text-sky-600 border-sky-200",
        buttonStyle: "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200",
      };
    default:
      return {
        name: "Khác / Website",
        icon: <Globe className="w-6 h-6" />,
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
        buttonStyle: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200",
      };
  }
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("shoptft_admin_token");
    if (token) {
      headers["x-admin-token"] = token;
    }
  }
  return headers;
};

/**
 * Lấy danh sách kênh truyền thông
 */
export async function getChannels(onlyActive: boolean = false): Promise<CommunityChannelItem[]> {
  try {
    const res = await fetch(`/api/channels${onlyActive ? "?active=true" : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Lỗi kết nối /api/channels:", err);
    return [];
  }
}

/**
 * Thêm kênh truyền thông mới
 */
export async function createChannel(item: Partial<CommunityChannelItem>): Promise<{
  success: boolean;
  data?: CommunityChannelItem;
  error?: string;
}> {
  try {
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể tạo kênh mới!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ!" };
  }
}

/**
 * Cập nhật kênh truyền thông
 */
export async function updateChannel(item: Partial<CommunityChannelItem>): Promise<{
  success: boolean;
  data?: CommunityChannelItem;
  error?: string;
}> {
  try {
    const res = await fetch("/api/channels", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể cập nhật kênh!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ!" };
  }
}

/**
 * Xóa kênh truyền thông
 */
export async function deleteChannel(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/channels?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể xóa kênh!" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ!" };
  }
}

/**
 * Khôi phục danh sách kênh mặc định
 */
export async function resetChannelsToDefault(): Promise<{
  success: boolean;
  data?: CommunityChannelItem[];
  error?: string;
}> {
  try {
    const res = await fetch("/api/channels?action=reset", {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      return { success: false, error: result.error || "Không thể khôi phục mặc định!" };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ!" };
  }
}
