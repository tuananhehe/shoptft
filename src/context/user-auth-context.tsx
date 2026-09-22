"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { calculateVipTier, VipTier, VIP_TIERS } from "@/utils/vip-system";
import toast from "react-hot-toast";

export interface UserRentalItem {
  orderId: string;
  accountCode: string;
  accountTitle: string;
  accountType: "VIP" | "CLONE";
  accountLogin: string;
  accountPass: string;
  packageName: string;
  amount: number;
  startedAt: string;
  expiresAt: string | null;
  status: "RENTING" | "COMPLETED" | "EXPIRED";
  notes?: string;
}

export interface UserVoucherItem {
  id: string;
  code: string;
  title: string;
  description: string;
  type: "DISCOUNT" | "FREE_TEST_2H" | "GIFT";
  discountPercent?: number;
  isUsed: boolean;
  expiresAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phoneZalo?: string;
  provider: "google" | "custom" | "guest";
  totalOrders: number;
  totalSpent: number;
  vipPoints: number;
  vouchers: UserVoucherItem[];
  createdAt: string;
}

interface UserAuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  vipInfo: ReturnType<typeof calculateVipTier>;
  activeRentals: UserRentalItem[];
  rentalHistory: UserRentalItem[];
  isProfileModalOpen: boolean;
  activeProfileTab: "RENTALS" | "VIP" | "REVIEW" | "VOUCHERS";
  openProfileModal: (tab?: "RENTALS" | "VIP" | "REVIEW" | "VOUCHERS") => void;
  closeProfileModal: () => void;
  loginWithGoogle: () => Promise<void>;
  quickLogin: (info: { name: string; email: string; avatar?: string; phoneZalo?: string }) => void;
  logout: () => Promise<void>;
  updatePhoneZalo: (phone: string) => void;
  fetchUserRentals: () => Promise<void>;
  applyVipDiscount: (originalPrice: number) => { discountedPrice: number; discountAmount: number; discountPercent: number };
  useTestAccVoucher: (voucherId: string) => Promise<boolean>;
  requestSwapAccount: (orderId: string, reason: string) => Promise<boolean>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "shoptft_user_profile";

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRentals, setActiveRentals] = useState<UserRentalItem[]>([]);
  const [rentalHistory, setRentalHistory] = useState<UserRentalItem[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<"RENTALS" | "VIP" | "REVIEW" | "VOUCHERS">("RENTALS");

  // Load user from localStorage or Supabase on mount
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Kiểm tra session từ Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          const meta = authUser.user_metadata || {};
          const googleUser: UserProfile = {
            id: authUser.id,
            email: authUser.email || "user@gmail.com",
            name: meta.full_name || meta.name || authUser.email?.split("@")[0] || "Cờ Thủ VIP",
            avatar: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.id}`,
            phoneZalo: meta.phone_zalo || undefined,
            provider: "google",
            totalOrders: 0,
            totalSpent: 0,
            vipPoints: 0,
            vouchers: [],
            createdAt: authUser.created_at || new Date().toISOString(),
          };

          // Nạp dữ liệu bổ sung từ localStorage nếu đã có
          const savedStr = localStorage.getItem(USER_STORAGE_KEY);
          if (savedStr) {
            try {
              const saved = JSON.parse(savedStr);
              if (saved.id === authUser.id || saved.email === authUser.email) {
                googleUser.phoneZalo = saved.phoneZalo || googleUser.phoneZalo;
                googleUser.totalOrders = saved.totalOrders || 0;
                googleUser.totalSpent = saved.totalSpent || 0;
                googleUser.vipPoints = saved.vipPoints || 0;
                googleUser.vouchers = saved.vouchers || [];
              }
            } catch {}
          }

          setUser(googleUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(googleUser));
        } else {
          // 2. Nếu chưa có session Supabase, nạp từ local storage nếu đã đăng nhập trước đó
          const savedStr = localStorage.getItem(USER_STORAGE_KEY);
          if (savedStr) {
            try {
              const saved = JSON.parse(savedStr);
              if (saved && saved.email) {
                setUser(saved);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Lỗi khởi tạo Auth:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Lắng nghe thay đổi trạng thái Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser((prev) => {
          const updated: UserProfile = {
            id: session.user.id,
            email: session.user.email || prev?.email || "user@gmail.com",
            name: meta.full_name || meta.name || prev?.name || session.user.email?.split("@")[0] || "Cờ Thủ VIP",
            avatar: meta.avatar_url || meta.picture || prev?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
            phoneZalo: prev?.phoneZalo,
            provider: "google",
            totalOrders: prev?.totalOrders || 0,
            totalSpent: prev?.totalSpent || 0,
            vipPoints: prev?.vipPoints || 0,
            vouchers: prev?.vouchers || [],
            createdAt: prev?.createdAt || session.user.created_at || new Date().toISOString(),
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Tính toán cấp bậc VIP hiện tại của người dùng
  const vipInfo = calculateVipTier(user?.totalOrders || 0, user?.totalSpent || 0);

  // Tra cứu các đơn hàng và tài khoản đang thuê của người dùng
  const fetchUserRentals = useCallback(async () => {
    if (!user) {
      setActiveRentals([]);
      setRentalHistory([]);
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      if (user.email) queryParams.set("email", user.email);
      if (user.name) queryParams.set("name", user.name);
      if (user.phoneZalo) queryParams.set("phone", user.phoneZalo);

      const res = await fetch(`/api/user/rentals?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const active = json.data.filter((o: UserRentalItem) => o.status === "RENTING");
          const history = json.data.filter((o: UserRentalItem) => o.status !== "RENTING");
          setActiveRentals(active);
          setRentalHistory(history);

          // Cập nhật lại tổng số đơn và chi tiêu tích lũy nếu có dữ liệu thực tế
          if (json.totalOrders !== undefined && json.totalSpent !== undefined) {
            setUser((prev) => {
              if (!prev) return null;
              const updated: UserProfile = {
                ...prev,
                totalOrders: Math.max(prev.totalOrders, json.totalOrders),
                totalSpent: Math.max(prev.totalSpent, json.totalSpent),
                vipPoints: Math.round((Math.max(prev.totalSpent, json.totalSpent) / 1000)),
              };
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.warn("Lỗi tải thông tin tài khoản đang thuê:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserRentals();
    }
  }, [user?.email, user?.phoneZalo, fetchUserRentals]);

  // Đăng nhập Google
  const loginWithGoogle = async () => {
    const toastId = toast.loading("Đang mở kết nối đăng nhập Google...");
    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.warn("Supabase Google OAuth Redirect:", error.message);
        // Fallback popup/fast Google login nếu cần
        toast.error("Không thể chuyển hướng đăng nhập Google: " + error.message, { id: toastId });
      } else if (data?.url) {
        toast.success("Đang chuyển hướng sang Google...", { id: toastId });
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error("Lỗi đăng nhập Google: " + (err.message || "Vui lòng thử lại"), { id: toastId });
    }
  };

  // Đăng nhập nhanh (Quick Login / Demo Google Profile)
  const quickLogin = (info: { name: string; email: string; avatar?: string; phoneZalo?: string }) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: info.email.trim(),
      name: info.name.trim() || "Cờ Thủ TFT VIP",
      avatar: info.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${info.email}`,
      phoneZalo: info.phoneZalo?.trim(),
      provider: "google",
      totalOrders: 3,
      totalSpent: 350000,
      vipPoints: 350,
      vouchers: [
        {
          id: "vouch_test2h_1",
          code: "TEST2H-VIP",
          title: "Vé Test Acc VIP 2 Giờ Miễn Phí",
          description: "Đặc quyền VIP dành riêng cho bạn trải nghiệm mọi acc VIP trong kho!",
          type: "FREE_TEST_2H",
          isUsed: false,
        },
        {
          id: "vouch_trian_20",
          code: "TRIAN-TFT20",
          title: "Mã Giảm 20.000đ Tri Ân",
          description: "Áp dụng giảm 20.000đ cho đơn thuê tài khoản bất kỳ.",
          type: "DISCOUNT",
          discountPercent: 5,
          isUsed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    toast.success(`🎉 Xin chào ${newUser.name}! Đăng nhập thành công!`);
    setIsProfileModalOpen(true);
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setActiveRentals([]);
    setRentalHistory([]);
    localStorage.removeItem(USER_STORAGE_KEY);
    setIsProfileModalOpen(false);
    toast.success("Đã đăng xuất tài khoản!");
  };

  // Cập nhật số điện thoại / Zalo
  const updatePhoneZalo = (phone: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      phoneZalo: phone.trim(),
    };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    toast.success("Đã cập nhật Số Zalo nhận tài khoản!");
    fetchUserRentals();
  };

  // Áp dụng giảm giá VIP
  const applyVipDiscount = (originalPrice: number) => {
    const discountPercent = vipInfo.currentTier.discountPercent;
    const discountAmount = Math.round((originalPrice * (discountPercent / 100)) / 1000) * 1000;
    const discountedPrice = Math.max(0, originalPrice - discountAmount);
    return {
      discountedPrice,
      discountAmount,
      discountPercent,
    };
  };

  // Sử dụng vé Test Acc 2H miễn phí
  const useTestAccVoucher = async (voucherId: string): Promise<boolean> => {
    if (!user) return false;
    const voucherIndex = user.vouchers.findIndex((v) => v.id === voucherId && !v.isUsed);
    if (voucherIndex === -1) {
      toast.error("Vé test này đã được sử dụng hoặc không hợp lệ!");
      return false;
    }

    const updatedVouchers = [...user.vouchers];
    updatedVouchers[voucherIndex] = { ...updatedVouchers[voucherIndex], isUsed: true };
    const updatedUser = { ...user, vouchers: updatedVouchers };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    toast.success("🎮 Đã kích hoạt Vé Test Acc 2H miễn phí! Vui lòng chọn acc trong kho để nhận pass!", {
      duration: 5000,
    });
    return true;
  };

  // Yêu cầu đổi acc (Đặc quyền VIP)
  const requestSwapAccount = async (orderId: string, reason: string): Promise<boolean> => {
    toast.loading("Đang gửi yêu cầu đổi tài khoản tới Tuấn Thái Bình...");
    // Gửi webhook / notification hoặc mở Zalo
    const zaloMsg = `Chào Tuấn, mình là ${user?.name || "Khách VIP"} (${user?.phoneZalo || user?.email}). Mình muốn kích hoạt đặc quyền VIP đổi tài khoản cho đơn hàng [${orderId}]. Lý do: ${reason}`;
    const zaloUrl = `https://zalo.me/0352867283?text=${encodeURIComponent(zaloMsg)}`;
    setTimeout(() => {
      toast.dismiss();
      toast.success("Đã kích hoạt đặc quyền đổi acc! Đang kết nối Zalo Tuấn Thái Bình...");
      window.open(zaloUrl, "_blank");
    }, 800);
    return true;
  };

  const openProfileModal = (tab: "RENTALS" | "VIP" | "REVIEW" | "VOUCHERS" = "RENTALS") => {
    setActiveProfileTab(tab);
    setIsProfileModalOpen(true);
    if (user) fetchUserRentals();
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoading,
        vipInfo,
        activeRentals,
        rentalHistory,
        isProfileModalOpen,
        activeProfileTab,
        openProfileModal,
        closeProfileModal,
        loginWithGoogle,
        quickLogin,
        logout,
        updatePhoneZalo,
        fetchUserRentals,
        applyVipDiscount,
        useTestAccVoucher,
        requestSwapAccount,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth phải được sử dụng bên trong UserAuthProvider");
  }
  return context;
};
