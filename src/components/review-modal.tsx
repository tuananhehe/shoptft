"use client";

import React, { useState } from "react";
import { useUserAuth } from "@/context/user-auth-context";
import { submitReviewApi } from "@/utils/reviews-service";
import toast from "react-hot-toast";
import {
  X,
  Star,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, loginWithGoogle, quickLogin, vipInfo } = useUserAuth();

  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<"THUE_ACC" | "CAY_THUE" | "COACHING" | "GDTG">("THUE_ACC");
  const [comment, setComment] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [zaloInput, setZaloInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Vui lòng viết vài dòng nhận xét đánh giá nhé!");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Đang gửi đánh giá tới Shop...");

    const categoryTitles: Record<string, string> = {
      THUE_ACC: "Thuê Acc VIP TFT",
      CAY_THUE: "Cày Thuê Rank Cao Thủ / Thách Đấu",
      COACHING: "Coaching 1-1 Bắt Meta",
      GDTG: "Giao Dịch Trung Gian TFT",
    };

    const res = await submitReviewApi({
      customerName: user?.name || nameInput.trim() || "Cờ Thủ VIP",
      customerEmail: user?.email || emailInput.trim() || undefined,
      customerAvatar: user?.avatar,
      customerZalo: user?.phoneZalo || zaloInput.trim() || undefined,
      vipTier: user ? vipInfo.currentTier.id : "BRONZE",
      rating,
      category,
      accountBought: categoryTitles[category] || "Dịch vụ TFT",
      comment: comment.trim(),
      improvementSuggestion: suggestion.trim() || undefined,
      verifiedTag: user ? `VIP ${vipInfo.currentTier.name.split(" ")[1] || "Đồng"}` : "Đã Xác Thực",
      isGoogleUser: Boolean(user?.provider === "google"),
    });

    setSubmitting(false);

    if (res.success) {
      toast.success("🎉 Cảm ơn bạn! Đánh giá đã được lưu vào hệ thống và duyệt hiển thị!", {
        id: toastId,
        icon: "⭐",
      });
      setComment("");
      setSuggestion("");
      onClose();
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.error || "Không thể gửi đánh giá!", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-amber-100">
              Đóng Góp Ý Kiến
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black">GỬI ĐÁNH GIÁ & GÓP Ý TỚI TUẤN THÁI BÌNH</h3>
          <p className="text-xs text-orange-100 mt-1">
            Ý kiến chân thật từ bạn giúp Shop ngày càng hoàn thiện chất lượng dịch vụ tốt hơn!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Google Auth Status Check */}
          {user ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center gap-2.5">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-amber-300" />
                <div>
                  <span className="font-bold text-slate-900">{user.name}</span>
                  <span className="text-[10px] text-amber-700 font-bold block">{vipInfo.currentTier.badge}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                ✓ Đã Đăng Nhập Google
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">Đăng nhập nhanh với Google:</span>
                  <span>Để tự động gắn Avatar và Huy hiệu VIP vào đánh giá</span>
                </div>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-bold text-xs text-slate-800 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-3.5 h-3.5" />
                  <span>Google</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên của bạn:</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ví dụ: Hoàng Long"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Zalo (Nhận ưu đãi):</label>
                  <input
                    type="text"
                    value={zaloInput}
                    onChange={(e) => setZaloInput(e.target.value)}
                    placeholder="0352.xxx.xxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-1.5">
              1. Bạn đánh giá chất lượng dịch vụ mấy sao?
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= rating ? "text-amber-500 fill-amber-500" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-orange-700">
                {rating === 5 && "5 Sao: Cực kỳ tuyệt vời! 🌟"}
                {rating === 4 && "4 Sao: Rất hài lòng 😊"}
                {rating === 3 && "3 Sao: Bình thường 🙂"}
                {rating <= 2 && "Cần cải thiện 😐"}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-1.5">
              2. Dịch vụ bạn muốn đánh giá:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "THUE_ACC", label: "🎮 Thuê Acc TFT" },
                { id: "CAY_THUE", label: "⚔️ Cày Rank ĐTCL" },
                { id: "COACHING", label: "🎙️ Coaching 1-1" },
                { id: "GDTG", label: "🛡️ GDTG An Toàn" },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as any)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    category === c.id
                      ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-black text-slate-800 block mb-1">
              3. Cảm nhận & nhận xét của bạn:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn khi thuê acc hoặc dùng dịch vụ..."
              rows={3}
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Suggestion */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              4. Góp ý điều bạn muốn Shop bổ sung thêm:
            </label>
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Ví dụ: Thêm skin Tí Nị K/DA, mở thêm gói thuê đêm..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Đang Gửi..." : "Gửi Đánh Giá Ngay"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
