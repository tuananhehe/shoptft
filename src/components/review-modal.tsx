"use client";

import React, { useState } from "react";
import { submitReviewApi } from "@/utils/reviews-service";
import toast from "react-hot-toast";
import {
  X,
  Star,
  Send,
  MessageSquarePlus,
  Sparkles,
  User,
  Phone,
  CheckCircle2,
  Gift,
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STAR_LABELS: Record<number, string> = {
  1: "1 Sao: Cần cải thiện nhiều 🙁",
  2: "2 Sao: Chưa thực sự hài lòng 😐",
  3: "3 Sao: Tạm ổn / Bình thường 🙂",
  4: "4 Sao: Rất hài lòng & Chu đáo 😊",
  5: "5 Sao: Cực kỳ tuyệt vời! 🌟",
};

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<"THUE_ACC" | "CAY_THUE" | "COACHING" | "GDTG">("THUE_ACC");
  const [comment, setComment] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [zaloInput, setZaloInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameInput.trim()) {
      toast.error("Vui lòng nhập Tên hoặc Biệt danh của bạn!");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng viết vài dòng nhận xét đánh giá nhé!");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Đang lưu đánh giá vào hệ thống...");

    const categoryTitles: Record<string, string> = {
      THUE_ACC: "Thuê Acc VIP TFT",
      CAY_THUE: "Cày Thuê Rank Cao Thủ / Thách Đấu",
      COACHING: "Coaching 1-1 Bắt Meta",
      GDTG: "Giao Dịch Trung Gian TFT",
    };

    const res = await submitReviewApi({
      customerName: nameInput.trim(),
      customerZalo: zaloInput.trim() || undefined,
      rating,
      category,
      accountBought: categoryTitles[category] || "Dịch vụ TFT",
      comment: comment.trim(),
      improvementSuggestion: suggestion.trim() || undefined,
      verifiedTag: "Khách Đã Thuê Acc ⭐",
      isGoogleUser: false,
    });

    setSubmitting(false);

    if (res.success) {
      toast.success("🎉 Cảm ơn bạn! Đánh giá đã được lưu vào hệ thống và hiển thị lên web!", {
        id: toastId,
        icon: "⭐",
      });
      setComment("");
      setSuggestion("");
      setNameInput("");
      setZaloInput("");
      onClose();
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.error || "Không thể gửi đánh giá!", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
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
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
              <Gift className="w-3 h-3 text-amber-300" />
              <span>Đóng Góp Ý Kiến • Nhận Quà Tri Ân</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black font-gaming tracking-tight">
            GỬI ĐÁNH GIÁ & GÓP Ý TỚI TUẤN THÁI BÌNH
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            Mọi ý kiến đóng góp từ bạn sẽ được lưu trực tiếp vào hệ thống để nâng cao chất lượng dịch vụ!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Customer Info (Name + Zalo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Tên / Biệt danh của bạn:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ví dụ: Hoàng Long, Minh Đức..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Số Zalo (Nhận mã quà 20k):</span>
              </label>
              <input
                type="text"
                value={zaloInput}
                onChange={(e) => setZaloInput(e.target.value)}
                placeholder="0987.xxx.xxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Rating (1 to 5 Stars) */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="text-xs font-black text-slate-800 block">
              1. Bạn đánh giá chất lượng dịch vụ mấy sao?
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isActive = hoverRating ? s <= hoverRating : s <= rating;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isActive ? "text-amber-500 fill-amber-500" : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-orange-700">
                {STAR_LABELS[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
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
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    category === c.id
                      ? "bg-orange-600 text-white border-orange-600 shadow-xs scale-102"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800 block">
              3. Cảm nhận & nhận xét của bạn: <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn khi thuê acc, tốc độ giao acc, sự hỗ trợ từ shop..."
              rows={3}
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Suggestion */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              4. Góp ý điều bạn muốn Shop bổ sung thêm (Tùy chọn):
            </label>
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Ví dụ: Thêm skin Tí Nị Akali K/DA, mở thêm gói cày đêm..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
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
