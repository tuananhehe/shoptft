"use client";

import React, { useState, useEffect } from "react";
import { useUserAuth, UserRentalItem } from "@/context/user-auth-context";
import { VIP_TIERS, VipTierId } from "@/utils/vip-system";
import { submitReviewApi } from "@/utils/reviews-service";
import toast from "react-hot-toast";
import {
  X,
  User,
  Crown,
  KeyRound,
  Gamepad2,
  Clock,
  ShieldCheck,
  Gift,
  Star,
  Copy,
  Check,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Send,
  AlertCircle,
  Phone,
  Zap,
} from "lucide-react";

export const UserProfileModal: React.FC = () => {
  const {
    user,
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
    useTestAccVoucher,
    requestSwapAccount,
  } = useUserAuth();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewCategory, setReviewCategory] = useState<"THUE_ACC" | "CAY_THUE" | "COACHING" | "GDTG">("THUE_ACC");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewSuggestion, setReviewSuggestion] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Swap modal state
  const [swappingRental, setSwappingRental] = useState<UserRentalItem | null>(null);
  const [swapReason, setSwapReason] = useState<string>("Muốn đổi sang tướng Tí Nị / Sân Đấu khác trải nghiệm");

  // Fast login fields (if not logged in)
  const [fastName, setFastName] = useState<string>("");
  const [fastEmail, setFastEmail] = useState<string>("");
  const [fastZalo, setFastZalo] = useState<string>("");

  useEffect(() => {
    if (user?.phoneZalo) {
      setPhoneInput(user.phoneZalo);
    }
  }, [user?.phoneZalo]);

  if (!isProfileModalOpen) return null;

  const handleCopy = (text: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`Đã sao chép ${label}!`, { icon: "📋" });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSavePhone = () => {
    if (!phoneInput.trim()) {
      toast.error("Vui lòng nhập Số Zalo hợp lệ!");
      return;
    }
    updatePhoneZalo(phoneInput.trim());
    setIsEditingPhone(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Vui lòng nhập vài dòng nhận xét đánh giá nhé!");
      return;
    }

    setIsSubmittingReview(true);
    const toastId = toast.loading("Đang gửi đánh giá tới Shop...");

    const categoryNames: Record<string, string> = {
      THUE_ACC: "Thuê Acc VIP TFT",
      CAY_THUE: "Cày Thuê Rank Cao Thủ/Thách Đấu",
      COACHING: "Coaching 1-1",
      GDTG: "Giao Dịch Trung Gian",
    };

    const res = await submitReviewApi({
      customerName: user?.name || fastName.trim() || "Cờ Thủ VIP",
      customerEmail: user?.email || fastEmail.trim() || undefined,
      customerAvatar: user?.avatar,
      customerZalo: user?.phoneZalo || fastZalo.trim() || undefined,
      vipTier: vipInfo.currentTier.id,
      rating: reviewRating,
      category: reviewCategory,
      accountBought: categoryNames[reviewCategory] || "Thuê Acc TFT",
      comment: reviewComment.trim(),
      improvementSuggestion: reviewSuggestion.trim() || undefined,
      verifiedTag: user ? `VIP ${vipInfo.currentTier.name.split(" ")[1] || "Đồng"}` : "Đã Xác Thực",
      isGoogleUser: Boolean(user?.provider === "google"),
    });

    setIsSubmittingReview(false);

    if (res.success) {
      toast.success("🎉 Cảm ơn bạn! Đánh giá đã được lưu vào hệ thống và duyệt hiển thị!", {
        id: toastId,
        icon: "⭐",
      });
      setReviewComment("");
      setReviewSuggestion("");
      openProfileModal("VIP");
    } else {
      toast.error(res.error || "Không thể gửi đánh giá!", { id: toastId });
    }
  };

  const handleConfirmSwap = async () => {
    if (!swappingRental) return;
    await requestSwapAccount(swappingRental.orderId, swapReason);
    setSwappingRental(null);
  };

  const formatRentalCountdown = (expiresAt?: string | null) => {
    if (!expiresAt) return { text: "Vô Cực ∞", isExpired: false, isExpiringSoon: false };
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { text: "Đã hết hạn", isExpired: true, isExpiringSoon: false };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return { text: `Còn ${days} ngày ${hours % 24}h`, isExpired: false, isExpiringSoon: false };
    if (hours > 0) return { text: `Còn ${hours}h ${mins}p`, isExpired: false, isExpiringSoon: hours < 1 };
    return { text: `Còn ${mins} phút`, isExpired: false, isExpiringSoon: true };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* ============================================================ */}
        {/* HEADER MODAL                                                 */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-orange-950 p-4 sm:p-6 text-white relative flex-shrink-0">
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md flex-shrink-0 bg-slate-800">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white">{user.name}</h3>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border shadow-sm ${vipInfo.currentTier.badgeBg}`}>
                      {vipInfo.currentTier.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-2 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl p-2.5 px-3.5 text-xs">
                <div className="text-center pr-3 border-r border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Giảm Giá VIP</span>
                  <span className="text-sm font-black text-amber-400">-{vipInfo.currentTier.discountPercent}%</span>
                </div>
                <div className="text-center pr-3 border-r border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Acc Đang Thuê</span>
                  <span className="text-sm font-black text-emerald-400">{activeRentals.length}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Vé Test 2H</span>
                  <span className="text-sm font-black text-cyan-400">
                    {user.vouchers.filter((v) => v.type === "FREE_TEST_2H" && !v.isUsed).length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">TRUNG TÂM THÀNH VIÊN SHOPTFT</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Đăng nhập bằng Google để nhận ngay đặc quyền VIP, quản lý tài khoản đang thuê và gửi đánh giá!
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={loginWithGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  <span>Đăng Nhập Google</span>
                </button>

                <button
                  onClick={() =>
                    quickLogin({
                      name: "Tuấn Anh (Google Test)",
                      email: "tuananh.tft@gmail.com",
                      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
                      phoneZalo: "0352.867.283",
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold text-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Test nhanh tài khoản Google trên môi trường Local"
                >
                  <span>Test Nhanh Local</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* NAVIGATION TABS                                              */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => openProfileModal("RENTALS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeProfileTab === "RENTALS"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Acc Đang Thuê</span>
              {activeRentals.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  {activeRentals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => openProfileModal("VIP")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeProfileTab === "VIP"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Cấp Bậc VIP & Đặc Quyền</span>
            </button>

            <button
              onClick={() => openProfileModal("REVIEW")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeProfileTab === "REVIEW"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Đánh Giá / Góp Ý</span>
            </button>

            <button
              onClick={() => openProfileModal("VOUCHERS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeProfileTab === "VOUCHERS"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Kho Ưu Đãi</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL BODY (SCROLLABLE)                                      */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: TÀI KHOẢN ĐANG THUÊ & ĐẾM NGƯỢC */}
          {activeProfileTab === "RENTALS" && (
            <div className="space-y-4">
              {/* Contact Zalo bar */}
              {user && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900">Số Zalo nhận mật khẩu: </span>
                      <span className="font-mono font-bold text-slate-800">
                        {user.phoneZalo || "Chưa cập nhật (Vui lòng điền)"}
                      </span>
                    </div>
                  </div>

                  {isEditingPhone ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Nhập số Zalo..."
                        className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold w-full sm:w-36 focus:outline-hidden"
                      />
                      <button
                        onClick={handleSavePhone}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold cursor-pointer"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer"
                    >
                      {user.phoneZalo ? "Sửa số Zalo" : "+ Thêm số Zalo ngay"}
                    </button>
                  )}
                </div>
              )}

              {activeRentals.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-orange-600" />
                      <span>Danh Sách Tài Khoản Đang Hoạt Động ({activeRentals.length})</span>
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ⚡ Hoạt Động 100%
                    </span>
                  </div>

                  {activeRentals.map((rental) => {
                    const countdown = formatRentalCountdown(rental.expiresAt);

                    return (
                      <div
                        key={rental.orderId}
                        className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs transition-all space-y-4"
                      >
                        {/* Top: Title & Countdown */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-black text-xs">
                                {rental.accountCode}
                              </span>
                              <h5 className="font-extrabold text-sm sm:text-base text-slate-900">
                                {rental.accountTitle}
                              </h5>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              Gói: <strong className="text-slate-700">{rental.packageName}</strong> • Mã đơn:{" "}
                              <span className="font-mono">{rental.orderId}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
                                countdown.isExpiringSoon
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{countdown.text}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Credentials */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 text-xs">
                          <div>
                            <span className="text-[11px] text-slate-400 font-bold block mb-1">
                              TÀI KHOẢN (RIOT ID / LOGIN):
                            </span>
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-800">
                              <span>{rental.accountLogin}</span>
                              <button
                                onClick={() => handleCopy(rental.accountLogin, `login-${rental.orderId}`, "Tài khoản")}
                                className="p-1 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                                title="Sao chép"
                              >
                                {copiedField === `login-${rental.orderId}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 font-bold block mb-1">
                              MẬT KHẨU ĐĂNG NHẬP:
                            </span>
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono font-bold text-orange-700">
                              <span>{rental.accountPass}</span>
                              <button
                                onClick={() => handleCopy(rental.accountPass, `pass-${rental.orderId}`, "Mật khẩu")}
                                className="p-1 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                                title="Sao chép"
                              >
                                {copiedField === `pass-${rental.orderId}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="text-[11px] text-slate-500 font-medium">
                            Hạn hết hạn:{" "}
                            <strong className="text-slate-800">
                              {rental.expiresAt ? new Date(rental.expiresAt).toLocaleString("vi-VN") : "Trọn đời ∞"}
                            </strong>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Đặc quyền VIP đổi acc */}
                            <button
                              onClick={() => setSwappingRental(rental)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                              <span>Đổi Acc (VIP)</span>
                            </button>

                            {/* Gia hạn Zalo */}
                            <a
                              href={`https://zalo.me/0352867283?text=${encodeURIComponent(
                                `Chào Tuấn, mình muốn gia hạn thêm giờ cho tài khoản [${rental.accountCode} - Đơn ${rental.orderId}]!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              <span>Gia Hạn Thêm Giờ</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    Bạn chưa có tài khoản nào đang thuê!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Khám phá ngay kho tài khoản TFT Thách Đấu, Cao Thủ với Tướng Tí Nị và Sân Đấu Thần Thoại cực HOT.
                  </p>
                  <button
                    onClick={() => {
                      closeProfileModal();
                      window.location.href = "/#shop";
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <span>Xem Kho Acc Cho Thuê Ngay</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CẤP BẬC VIP & 4 ĐẶC QUYỀN */}
          {activeProfileTab === "VIP" && (
            <div className="space-y-6">
              {/* Thẻ VIP CARD HOLOGRAM */}
              <div
                className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${vipInfo.currentTier.cardBg} border ${vipInfo.currentTier.borderClass} text-white shadow-xl`}
              >
                {/* Background glow & sparkles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-amber-300 block mb-1">
                        THẺ HỘI VIÊN VIP SHOPTFT MOBILE
                      </span>
                      <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        {vipInfo.currentTier.name}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
                      <Crown className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Progress Bar to next tier */}
                  <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Tiến trình lên hạng kế tiếp:</span>
                      {vipInfo.nextTier ? (
                        <span className="font-bold text-amber-300">
                          {vipInfo.nextTier.name} ({vipInfo.progressPercent}%)
                        </span>
                      ) : (
                        <span className="font-black text-rose-400">ĐÃ ĐẠT CẤP TỐI ĐA</span>
                      )}
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-500"
                        style={{ width: `${vipInfo.progressPercent}%` }}
                      />
                    </div>

                    {vipInfo.nextTier && (
                      <p className="text-[11px] text-slate-400">
                        Cần thêm <strong className="text-white">{vipInfo.ordersNeeded} đơn</strong> hoặc chi tiêu thêm{" "}
                        <strong className="text-amber-300">{vipInfo.spentNeeded.toLocaleString("vi-VN")}đ</strong> để lên{" "}
                        {vipInfo.nextTier.name}!
                      </p>
                    )}
                  </div>

                  {/* Card bottom info */}
                  <div className="flex items-end justify-between pt-2 text-xs border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 block">CHỦ THẺ:</span>
                      <span className="font-bold text-white uppercase">{user?.name || "KHÁCH HÀNG VIP"}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">CHI TIẾT ƯU ĐÃI:</span>
                      <span className="font-black text-amber-400 text-sm">
                        GIẢM TRỰC TIẾP {vipInfo.currentTier.discountPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 ĐẶC QUYỀN VIP LỚN */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  4 Đặc Quyền Dành Riêng Cho Bạn ({vipInfo.currentTier.badge})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Perk 1: Giảm giá */}
                  <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 hover:border-orange-300 transition-all space-y-2">
                    <div className="flex items-center gap-2 text-orange-700 font-extrabold text-xs uppercase">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span>Giảm Giá Tự Động {vipInfo.currentTier.discountPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Tất cả các tài khoản thuê và gói dịch vụ đều được tự động khấu trừ {vipInfo.currentTier.discountPercent}% khi thanh toán.
                    </p>
                  </div>

                  {/* Perk 2: Test acc 2h */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span>Vé Test Acc 2H Miễn Phí</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        {vipInfo.currentTier.freeTestHours} Vé / Đợt
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Được trải nghiệm miễn phí 2 tiếng cho bất kỳ acc VIP nào trong kho để test skin và sân đấu.
                    </p>
                  </div>

                  {/* Perk 3: Đổi acc */}
                  <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 hover:border-cyan-300 transition-all space-y-2">
                    <div className="flex items-center gap-2 text-cyan-800 font-extrabold text-xs uppercase">
                      <RotateCcw className="w-4 h-4 text-cyan-600" />
                      <span>Đổi Acc Không Ưng Ý</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {vipInfo.currentTier.swapPerk}
                    </p>
                  </div>

                  {/* Perk 4: Support VIP */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-300 transition-all space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Hỗ Trợ Ưu Tiên 24/7</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {vipInfo.currentTier.supportPerk}
                    </p>
                  </div>
                </div>
              </div>

              {/* BẢNG TỔNG QUAN 5 CẤP VIP */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Bảng Cấp Bậc VIP Toàn Hệ Thống
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {Object.values(VIP_TIERS).map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-3 rounded-xl border transition-all text-center space-y-1.5 ${
                        vipInfo.currentTier.id === tier.id
                          ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 font-bold"
                          : "bg-slate-50 border-slate-200 opacity-70"
                      }`}
                    >
                      <span className="text-[11px] block font-black">{tier.badge}</span>
                      <span className="text-xs font-black text-orange-600 block">Giảm {tier.discountPercent}%</span>
                      <span className="text-[10px] text-slate-500 block">
                        {tier.minOrders > 0 ? `Từ ${tier.minOrders} đơn` : "Mới tham gia"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ĐÁNH GIÁ & GÓP Ý CHÍNH CHỦ GOOGLE */}
          {activeProfileTab === "REVIEW" && (
            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-orange-900 flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold text-sm text-orange-950">
                    Gửi Đánh Giá & Góp Ý Tới ShopTFT Mobile
                  </h5>
                  <p className="text-slate-600 mt-0.5">
                    Ý kiến của bạn sẽ được lưu trực tiếp vào hệ thống và hiển thị công khai trên trang chủ kèm huy hiệu VIP của bạn!
                  </p>
                </div>
              </div>

              {/* User info check */}
              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Họ & Tên của bạn:</label>
                    <input
                      type="text"
                      value={fastName}
                      onChange={(e) => setFastName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Long"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email:</label>
                    <input
                      type="email"
                      value={fastEmail}
                      onChange={(e) => setFastEmail(e.target.value)}
                      placeholder="email@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Số Zalo (Nhận quà tri ân):</label>
                    <input
                      type="text"
                      value={fastZalo}
                      onChange={(e) => setFastZalo(e.target.value)}
                      placeholder="0352.xxx.xxx"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Rating stars selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-900 block mb-2">
                  1. Mức độ hài lòng của bạn về dịch vụ của Shop:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 sm:p-1.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            star <= reviewRating
                              ? "text-amber-500 fill-amber-500 drop-shadow-xs"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-orange-700">
                    {reviewRating === 5 && "🌟 5 Sao: Cực kỳ tuyệt vời!"}
                    {reviewRating === 4 && "😊 4 Sao: Rất hài lòng & chu đáo"}
                    {reviewRating === 3 && "🙂 3 Sao: Tạm ổn"}
                    {reviewRating === 2 && "😐 2 Sao: Chưa hài lòng"}
                    {reviewRating === 1 && "🙁 1 Sao: Rất thất vọng"}
                  </span>
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-900 block mb-2">
                  2. Dịch vụ bạn đã từng sử dụng:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: "THUE_ACC", label: "🎮 Thuê Acc TFT" },
                    { id: "CAY_THUE", label: "⚔️ Cày Thuê Rank" },
                    { id: "COACHING", label: "🎙️ Coaching 1-1" },
                    { id: "GDTG", label: "🛡️ GDTG Trung Gian" },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setReviewCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        reviewCategory === cat.id
                          ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="text-xs font-extrabold text-slate-900 block mb-1">
                  3. Nhận xét chi tiết về dịch vụ / tài khoản của bạn:
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ví dụ: Acc Ahri Tinh Quái cực phẩm, gửi pass chưa tới 1 phút, Tuấn tư vấn rất nhiệt tình..."
                  rows={3}
                  required
                  className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-200 leading-relaxed"
                />
              </div>

              {/* Improvement suggestion */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  4. Góp ý điều Shop cần cải thiện thêm (không bắt buộc):
                </label>
                <input
                  type="text"
                  value={reviewSuggestion}
                  onChange={(e) => setReviewSuggestion(e.target.value)}
                  placeholder="Ví dụ: Mong shop nhập thêm nhiều Tí Nị Akali, Gwen..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openProfileModal("RENTALS")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReview ? "Đang Gửi..." : "Gửi Đánh Giá Ngay"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: KHO VOUCHER & ƯU ĐÃI */}
          {activeProfileTab === "VOUCHERS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span>Kho Ưu Đãi & Vé Trải Nghiệm Của Bạn</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Free test 2h voucher */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/80 space-y-3 relative overflow-hidden">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] uppercase">
                    ĐẶC QUYỀN VIP
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                      2H
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900">Vé Test Acc 2H Miễn Phí</h5>
                      <span className="text-[11px] text-amber-700 font-bold">Mã: TEST2H-VIP</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Trải nghiệm 2 tiếng bất kỳ acc VIP nào trong kho để thử Tướng Tí Nị và Sân Đấu Thần Thoại.
                  </p>

                  <button
                    onClick={() => {
                      closeProfileModal();
                      window.location.href = "/#shop";
                      toast.success("Vui lòng chọn 1 acc trong kho và nhắn Zalo mã TEST2H-VIP để nhận pass miễn phí!");
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Dùng Vé Test Ngay
                  </button>
                </div>

                {/* Voucher 20k */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative overflow-hidden">
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase">
                    TRI ÂN
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                      -20K
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900">Mã Giảm Giá 20.000đ</h5>
                      <span className="text-[11px] text-orange-600 font-mono font-bold">TRIAN-TFT20</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Giảm 20.000đ cho mọi đơn thuê tài khoản hoặc dịch vụ qua Zalo Tuấn Thái Bình.
                  </p>

                  <button
                    onClick={() => handleCopy("TRIAN-TFT20", "vouch-20", "Mã giảm giá")}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedField === "vouch-20" ? "Đã Sao Chép!" : "Sao Chép Mã"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* FOOTER MODAL                                                 */}
        {/* ============================================================ */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
          {user ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <span className="text-slate-500 text-[11px]">Đăng nhập Google để đồng bộ dữ liệu</span>
          )}

          <div className="flex items-center gap-2">
            <a
              href="https://zalo.me/0352867283"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-orange-700 font-bold hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Hotline Zalo: 0352.867.283</span>
            </a>
          </div>
        </div>
      </div>

      {/* SWAP MODAL CONFIRMATION */}
      {swappingRental && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span>Kích Hoạt Quyền Đổi Acc VIP</span>
              </h4>
              <button
                onClick={() => setSwappingRental(null)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Bạn đang yêu cầu đổi tài khoản <strong className="text-slate-900">{swappingRental.accountCode}</strong> (Đơn{" "}
              {swappingRental.orderId}). Đặc quyền VIP của bạn cho phép đổi sang tài khoản tương đương ngay lập tức!
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Lý do muốn đổi:</label>
              <select
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden"
              >
                <option value="Muốn đổi sang tướng Tí Nị khác trải nghiệm">Muốn đổi sang tướng Tí Nị khác</option>
                <option value="Muốn đổi sang Sân Đấu Thần Thoại khác">Muốn đổi sang Sân Đấu khác</option>
                <option value="Tài khoản gặp sự cố / muốn đổi rank">Tài khoản gặp sự cố / muốn đổi rank</option>
                <option value="Đổi bài test meta mới">Đổi bài test meta mới</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSwappingRental(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSwap}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Xác Nhận Đổi Qua Zalo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
