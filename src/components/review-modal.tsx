"use client";

import React, { useState } from "react";
import { submitReviewApi } from "@/utils/reviews-service";
import toast from "react-hot-toast";
import {
  X,
  Star,
  Send,
  User,
  Phone,
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STAR_LABELS: Record<number, string> = {
  1: "1 Sao: Cần cải thiện nhiều",
  2: "2 Sao: Chưa hài lòng",
  3: "3 Sao: Bình thường",
  4: "4 Sao: Rất hài lòng",
  5: "5 Sao: Cực kỳ tuyệt vời!",
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
    const toastId = toast.loading("Đang gửi đánh giá...");

    const categoryTitles: Record<string, string> = {
      THUE_ACC: "Thuê Acc VIP TFT",
      CAY_THUE: "Cày Rank ĐTCL",
      COACHING: "Coaching 1-1",
      GDTG: "Giao Dịch Trung Gian",
    };

    try {
      const res = await submitReviewApi({
        customerName: nameInput.trim(),
        customerZalo: zaloInput.trim() || undefined,
        rating,
        category,
        accountBought: categoryTitles[category] || "Dịch vụ ShopTFTMobile",
        comment: comment.trim(),
        improvementSuggestion: suggestion.trim() || undefined,
      });

      if (res.success) {
        toast.success("Cảm ơn bạn đã gửi đánh giá!", { id: toastId });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Gửi đánh giá không thành công", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi gửi đánh giá.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f11] text-white border border-white/[0.12] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-scaleIn my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#141416] border-b border-white/[0.08] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
            Gửi Đánh Giá & Góp Ý
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Ý kiến phản hồi từ bạn giúp shop liên tục hoàn thiện chất lượng phục vụ.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Customer Info (Name + Zalo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tên / Biệt danh:</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ví dụ: Hoàng Long, Minh Đức..."
                required
                className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Số Zalo (Tùy chọn):</span>
              </label>
              <input
                type="text"
                value={zaloInput}
                onChange={(e) => setZaloInput(e.target.value)}
                placeholder="0987.xxx.xxx"
                className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
          </div>

          {/* Rating (1 to 5 Stars) */}
          <div className="space-y-1.5 bg-[#141416] p-3.5 rounded-2xl border border-white/[0.08]">
            <label className="text-xs font-semibold text-zinc-300 block">
              Mức độ hài lòng của bạn:
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isActive = hoverRating ? s <= hoverRating : s <= rating;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          isActive ? "text-amber-400 fill-amber-400" : "text-zinc-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-medium text-zinc-400">
                {STAR_LABELS[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Dịch vụ đánh giá:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "THUE_ACC", label: "Thuê Acc TFT" },
                { id: "CAY_THUE", label: "Cày Rank ĐTCL" },
                { id: "COACHING", label: "Coaching 1-1" },
                { id: "GDTG", label: "Trung Gian" },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    category === c.id
                      ? "bg-white text-[#09090b] font-semibold border-white shadow-sm"
                      : "bg-[#141416] text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">
              Nhận xét của bạn: <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn khi thuê acc, sự hỗ trợ từ shop..."
              rows={3}
              required
              className="w-full p-3 bg-[#141416] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all resize-none"
            />
          </div>

          {/* Suggestion */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 block">
              Góp ý bổ sung (Tùy chọn):
            </label>
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Ví dụ: Bổ sung thêm acc có Sân đấu..."
              className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border border-white/10 font-medium text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-[#09090b] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Đang gửi..." : "Gửi đánh giá"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
