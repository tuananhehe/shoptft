"use client";

import React, { useState, useEffect } from "react";
import {
  SurveyResponse,
  SurveySummary,
  SurveyConfig,
  SurveyRewardConfig,
  SurveyQuestion,
  SurveyQuestionType,
  getSurveysApi,
  deleteSurveyApi,
  getSurveyConfigApi,
  updateSurveyConfigApi,
  updateSurveyGiftStatusApi,

} from "@/utils/surveys-service";
import {
  getReviewsApi,
  updateReviewStatusApi,
  deleteReviewApi,
  CustomerReviewItem,
} from "@/utils/reviews-service";
import toast from "react-hot-toast";
import {
  ClipboardCheck,
  Star,
  Zap,
  Users,
  MessageSquare,
  Gift,
  Copy,
  Check,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Settings,
  Plus,
  Edit2,
  Save,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  X,
  ListFilter,
  Layers,
  MessageCircle,
  Phone,
  User,
  Clock,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import Link from "next/link";

const QUESTION_TYPE_LABELS: Record<SurveyQuestionType, { label: string; color: string }> = {
  SINGLE_CHOICE: { label: "Trắc nghiệm (1 đáp án)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  MULTIPLE_CHOICE: { label: "Tích chọn (Nhiều đáp án)", color: "bg-purple-50 text-purple-700 border-purple-200" },
  RATING_5: { label: "Đánh giá 1 - 5 Sao ⭐", color: "bg-amber-50 text-amber-700 border-amber-200" },
  RATING_10: { label: "Thang điểm NPS (1 - 10)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  TEXT: { label: "Văn bản ngắn", color: "bg-slate-50 text-slate-700 border-slate-200" },
  TEXTAREA: { label: "Đóng góp ý kiến (Văn bản dài)", color: "bg-orange-50 text-orange-700 border-orange-200" },
};

export default function AdminSurveysPage() {
  const [activeTab, setActiveTab] = useState<"REVIEWS" | "RESPONSES" | "SETTINGS">("REVIEWS");

  // TAB REVIEWS: Google & Web Reviews state
  const [reviews, setReviews] = useState<CustomerReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [reviewSearch, setReviewSearch] = useState<string>("");
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>("ALL");
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // TAB 1: Responses state
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [summary, setSummary] = useState<SurveySummary | null>(null);
  const [loadingResponses, setLoadingResponses] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [giftFilter, setGiftFilter] = useState<"ALL" | "PENDING" | "DELIVERED">("ALL");
  const [ratingFilter, setRatingFilter] = useState<"ALL" | 5 | 4 | "LOW">("ALL");
  const [copiedZaloId, setCopiedZaloId] = useState<string | null>(null);

  // TAB 2: Config / Builder state
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [activeRewardBranch, setActiveRewardBranch] = useState<"THUE_ACC" | "GDTG" | "WEBSITE">("THUE_ACC");


  // Question Modal state
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [newOptionInput, setNewOptionInput] = useState<string>("");

  const fetchSurveys = async () => {
    setLoadingResponses(true);
    try {
      const res = await getSurveysApi();
      if (res.success) {
        setSurveys(res.data);
        if (res.summary) setSummary(res.summary);
      } else {
        toast.error(res.error || "Không thể tải danh sách khảo sát!");
      }
    } catch {
      toast.error("Lỗi khi kết nối máy chủ!");
    } finally {
      setLoadingResponses(false);
    }
  };

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await getSurveyConfigApi();
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch {
      toast.error("Lỗi tải cấu hình khảo sát!");
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchAdminReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await getReviewsApi(true);
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch {
      console.warn("Lỗi tải đánh giá Admin");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
    fetchConfig();
    fetchAdminReviews();
  }, []);

  const handleToggleReviewApprove = async (review: CustomerReviewItem) => {
    const nextApproved = !review.isApproved;
    const toastId = toast.loading(nextApproved ? "Đang duyệt hiển thị..." : "Đang ẩn đánh giá...");
    try {
      const res = await updateReviewStatusApi(review.id, { isApproved: nextApproved });
      if (res.success && res.data) {
        toast.success(nextApproved ? "✅ Đã duyệt hiển thị công khai lên Trang Chủ!" : "Đã ẩn đánh giá khỏi Trang Chủ!", {
          id: toastId,
        });
        setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, isApproved: nextApproved } : r)));
      } else {
        toast.error(res.error || "Lỗi cập nhật trạng thái", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối", { id: toastId });
    }
  };

  const handleSaveAdminReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    const toastId = toast.loading("Đang lưu phản hồi...");
    try {
      const res = await updateReviewStatusApi(reviewId, { adminReply: replyText.trim() });
      if (res.success && res.data) {
        toast.success("✅ Đã lưu phản hồi thành công!", { id: toastId });
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, adminReply: replyText.trim(), adminReplyAt: new Date().toISOString() } : r))
        );
        setReplyingReviewId(null);
        setReplyText("");
      } else {
        toast.error(res.error || "Không thể lưu phản hồi", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ", { id: toastId });
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    const toastId = toast.loading("Đang xóa đánh giá...");
    try {
      const res = await deleteReviewApi(id);
      if (res.success) {
        toast.success("Đã xóa đánh giá thành công!", { id: toastId });
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(res.error || "Không thể xóa!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối", { id: toastId });
    }
  };

  const handleCopyZalo = (zalo: string, id: string) => {
    navigator.clipboard.writeText(zalo);
    setCopiedZaloId(id);
    toast.success(`Đã sao chép số Zalo: ${zalo}`, { icon: "📋" });
    setTimeout(() => setCopiedZaloId(null), 2500);
  };

  const handleToggleGiftDelivered = async (survey: SurveyResponse) => {
    const nextStatus = !survey.giftDelivered;
    const toastId = toast.loading(
      nextStatus ? "Đang đánh dấu ĐÃ TRAO QUÀ..." : "Đang chuyển về CHƯA TRAO QUÀ..."
    );
    try {
      const res = await updateSurveyGiftStatusApi(survey.id, nextStatus);
      if (res.success && res.data) {
        toast.success(
          nextStatus ? "✅ Đã đánh dấu ĐÃ TRAO QUÀ cho khách!" : "Đã chuyển về CHƯA TRAO QUÀ!",
          { id: toastId }
        );
        setSurveys((prev) =>
          prev.map((s) =>
            s.id === survey.id
              ? {
                  ...s,
                  giftDelivered: nextStatus,
                  giftDeliveredAt: nextStatus ? new Date().toISOString() : undefined,
                }
              : s
          )
        );
        if (summary) {
          const diff = nextStatus ? 1 : -1;
          setSummary((prev) =>
            prev
              ? {
                  ...prev,
                  giftDeliveredCount: Math.max(0, (prev.giftDeliveredCount || 0) + diff),
                  giftPendingCount: Math.max(0, (prev.giftPendingCount || 0) - diff),
                }
              : prev
          );
        }
      } else {
        toast.error(res.error || "Không thể cập nhật trạng thái trao quà!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi cập nhật!", { id: toastId });
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi khảo sát này?")) return;

    const toastId = toast.loading("Đang xóa...");
    try {
      const res = await deleteSurveyApi(id);
      if (res.success) {
        toast.success("Đã xóa phản hồi khảo sát!", { id: toastId });
        fetchSurveys();
      } else {
        toast.error(res.error || "Không thể xóa!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi xóa!", { id: toastId });
    }
  };

  // CONFIG BUILDER ACTIONS
  const handleSaveConfig = async (overrideConfig?: SurveyConfig) => {
    const targetConfig = overrideConfig || config;
    if (!targetConfig) return;
    setSavingConfig(true);
    const toastId = toast.loading("Đang lưu cấu hình câu hỏi & phần quà...");

    try {
      const res = await updateSurveyConfigApi(targetConfig);
      if (res.success && res.data) {
        setConfig(res.data);
        toast.success("✅ Đã lưu cấu hình khảo sát & quà tặng thành công!", { id: toastId });
      } else {
        toast.error(res.error || "Lưu cấu hình thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ khi lưu cấu hình!", { id: toastId });
    } finally {
      setSavingConfig(false);
    }
  };

  const toggleQuestionEnabled = async (qId: string) => {
    if (!config) return;
    const updated = config.questions.map((q) =>
      q.id === qId ? { ...q, enabled: !q.enabled } : q
    );
    const newConfig = { ...config, questions: updated };
    setConfig(newConfig);
    
    try {
      const res = await updateSurveyConfigApi(newConfig);
      if (res.success) {
        toast.success("✅ Đã lưu trạng thái câu hỏi!");
      }
    } catch {
      toast.error("Lỗi lưu trạng thái câu hỏi!");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!config) return;
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi biểu mẫu?")) return;
    const updated = config.questions.filter((q) => q.id !== qId);
    const newConfig = { ...config, questions: updated };
    setConfig(newConfig);

    const toastId = toast.loading("Đang xóa và cập nhật...");
    try {
      const res = await updateSurveyConfigApi(newConfig);
      if (res.success) {
        toast.success("✅ Đã xóa câu hỏi thành công!", { id: toastId });
      } else {
        toast.error(res.error || "Không thể lưu thay đổi!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu!", { id: toastId });
    }
  };

  const handleMoveQuestion = async (index: number, direction: "UP" | "DOWN") => {
    if (!config) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.questions.length) return;

    const updated = [...config.questions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const newConfig = { ...config, questions: updated };
    setConfig(newConfig);

    try {
      const res = await updateSurveyConfigApi(newConfig);
      if (res.success) {
        toast.success("✅ Đã cập nhật thứ tự câu hỏi!");
      }
    } catch {
      toast.error("Lỗi lưu thứ tự!");
    }
  };

  const openAddQuestionModal = () => {
    setEditingQuestion({
      id: `q_custom_${Date.now()}`,
      section: "Phần 3: Đóng Góp Ý Kiến Cải Tiến",
      title: "",
      subtitle: "",
      type: "SINGLE_CHOICE",
      options: ["Lựa chọn 1", "Lựa chọn 2"],
      required: false,
      enabled: true,
    });
    setNewOptionInput("");
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: SurveyQuestion) => {
    setEditingQuestion({ ...q, options: q.options ? [...q.options] : [] });
    setNewOptionInput("");
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestionModal = async () => {
    if (!editingQuestion || !config) return;
    if (!editingQuestion.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề câu hỏi!");
      return;
    }

    const exists = config.questions.some((q) => q.id === editingQuestion.id);
    let updatedQuestions: SurveyQuestion[];

    if (exists) {
      updatedQuestions = config.questions.map((q) =>
        q.id === editingQuestion.id ? editingQuestion : q
      );
    } else {
      updatedQuestions = [...config.questions, editingQuestion];
    }

    const newConfig = { ...config, questions: updatedQuestions };
    setConfig(newConfig);
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);

    const toastId = toast.loading("Đang lưu câu hỏi vào hệ thống...");
    try {
      const res = await updateSurveyConfigApi(newConfig);
      if (res.success && res.data) {
        setConfig(res.data);
        toast.success("✅ Đã lưu câu hỏi khảo sát thành công!", { id: toastId });
      } else {
        toast.error(res.error || "Lỗi lưu câu hỏi!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ khi lưu câu hỏi!", { id: toastId });
    }
  };

  const handleAddOptionToQuestion = () => {
    if (!editingQuestion || !newOptionInput.trim()) return;
    const opts = editingQuestion.options || [];
    setEditingQuestion({
      ...editingQuestion,
      options: [...opts, newOptionInput.trim()],
    });
    setNewOptionInput("");
  };

  const handleRemoveOptionFromQuestion = (index: number) => {
    if (!editingQuestion || !editingQuestion.options) return;
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.filter((_, idx) => idx !== index),
    });
  };

  const filteredSurveys = surveys.filter((s) => {
    // 1. Gift delivery filter
    if (giftFilter === "DELIVERED" && !s.giftDelivered) return false;
    if (giftFilter === "PENDING" && s.giftDelivered) return false;

    // 2. Rating filter
    if (ratingFilter === 5 && s.satisfactionRating !== 5) return false;
    if (ratingFilter === 4 && s.satisfactionRating !== 4) return false;
    if (ratingFilter === "LOW" && s.satisfactionRating > 3) return false;

    // 3. Search query: Name, Zalo / Phone, Feedback
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const rawPhone = q.replace(/[^0-9]/g, "");
      const matchName = s.customerName?.toLowerCase().includes(q);
      const matchZalo =
        s.customerZalo?.toLowerCase().includes(q) ||
        (rawPhone.length > 0 && s.customerZalo?.replace(/[^0-9]/g, "").includes(rawPhone));
      const matchSuggestion = s.improvementSuggestion?.toLowerCase().includes(q);
      const matchAdditions = s.requestedAdditions?.toLowerCase().includes(q);
      if (!matchName && !matchZalo && !matchSuggestion && !matchAdditions) {
        return false;
      }
    }

    return true;
  });

  const pendingGiftCount = surveys.filter((s) => !s.giftDelivered).length;
  const deliveredGiftCount = surveys.filter((s) => s.giftDelivered).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-orange-600" />
            <span>Quản Lý Khảo Sát & Ý Kiến Cải Tiến CSKH</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi ý kiến khách hàng, quản lý trao quà voucher tri ân và tùy biến biểu mẫu khảo sát
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/khao-sat"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Xem Trang Khảo Sát Khách</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Tabs: Reviews vs Responses vs Settings */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("REVIEWS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "REVIEWS"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Đánh Giá Khách Hàng ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RESPONSES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "RESPONSES"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Khảo Sát Chi Tiết ({surveys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "SETTINGS"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cài Đặt Câu Hỏi & Phần Quà</span>
          {config?.reward?.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB REVIEWS: ĐÁNH GIÁ & GÓP Ý KHÁCH HÀNG                    */}
      {/* ============================================================ */}
      {activeTab === "REVIEWS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Reviews Scorecards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Tổng Đánh Giá</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {reviews.length}
              </div>
              <div className="text-[11px] text-slate-500">Đánh giá ghi nhận</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                <span>Hiển Thị Trang Chủ</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                {reviews.filter((r) => r.isApproved !== false).length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">Đã duyệt công khai</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                <span>Có Số Zalo / SĐT</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
                {reviews.filter((r) => r.customerZalo && r.customerZalo.length > 0).length}
              </div>
              <div className="text-[11px] text-blue-700 font-medium">Khách để lại liên hệ</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                <span>Đánh Giá 5 Sao</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                {reviews.filter((r) => (r.rating || 5) === 5).length}
              </div>
              <div className="text-[11px] text-amber-700 font-medium">Khách khen ngợi</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                placeholder="🔍 Tìm theo Tên khách hàng, Email, Số Zalo, nội dung đánh giá..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
              />
              {reviewSearch && (
                <button
                  type="button"
                  onClick={() => setReviewSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-500 mr-1">Dịch vụ:</span>
              {[
                { id: "ALL", label: "Tất Cả" },
                { id: "THUE_ACC", label: "🎮 Thuê Acc" },
                { id: "CAY_THUE", label: "⚔️ Cày Rank" },
                { id: "COACHING", label: "🎙️ Coaching" },
                { id: "GDTG", label: "🛡️ GDTG" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setReviewCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    reviewCategoryFilter === c.id
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews
              .filter((r) => {
                if (reviewCategoryFilter !== "ALL" && r.category !== reviewCategoryFilter) return false;
                if (!reviewSearch.trim()) return true;
                const q = reviewSearch.toLowerCase().trim();
                return (
                  r.customerName?.toLowerCase().includes(q) ||
                  r.customerEmail?.toLowerCase().includes(q) ||
                  r.customerZalo?.includes(q) ||
                  r.comment?.toLowerCase().includes(q) ||
                  r.improvementSuggestion?.toLowerCase().includes(q)
                );
              })
              .map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs space-y-4 transition-all"
                >
                  {/* Review Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {rev.customerAvatar && rev.customerAvatar.startsWith("http") ? (
                        <img
                          src={rev.customerAvatar}
                          alt={rev.customerName}
                          className="w-10 h-10 rounded-xl object-cover border border-amber-300 shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm flex-shrink-0 border border-orange-200">
                          {rev.customerName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900">{rev.customerName}</h4>
                          {rev.isGoogleUser && (
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              Google User ✓
                            </span>
                          )}
                          {rev.vipTier && (
                            <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                              VIP {rev.vipTier}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                          {rev.customerEmail && <span>{rev.customerEmail}</span>}
                          {rev.customerZalo && (
                            <span className="flex items-center gap-1 font-mono text-slate-700">
                              • Zalo: {rev.customerZalo}
                              <button
                                onClick={() => handleCopyZalo(rev.customerZalo!, rev.id)}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Sao chép Zalo"
                              >
                                {copiedZaloId === rev.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>

                      <button
                        onClick={() => handleToggleReviewApprove(rev)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                          rev.isApproved !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {rev.isApproved !== false ? "✓ Đang Hiển Thị Web" : "✕ Đang Ẩn"}
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      "{rev.comment}"
                    </p>

                    {rev.improvementSuggestion && (
                      <div className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Góp ý thêm:</strong> {rev.improvementSuggestion}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Admin Reply Section */}
                  {rev.adminReply ? (
                    <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-950 flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
                          <span>Phản hồi từ Tuấn Thái Bình:</span>
                        </span>
                        <button
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setReplyText(rev.adminReply || "");
                          }}
                          className="text-[11px] text-orange-700 font-bold hover:underline cursor-pointer"
                        >
                          Sửa
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{rev.adminReply}</p>
                    </div>
                  ) : null}

                  {replyingReviewId === rev.id && (
                    <div className="p-3 bg-slate-50 border border-orange-300 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Viết phản hồi công khai tới khách hàng:
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập lời cảm ơn hoặc giải đáp thắc mắc..."
                        rows={2}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveAdminReply(rev.id)}
                          className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Lưu Phản Hồi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{rev.date}</span>
                      <span>• Dịch vụ: <strong className="text-slate-700">{rev.accountBought}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {replyingReviewId !== rev.id && !rev.adminReply && (
                        <button
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setReplyText(`Cảm ơn bạn đã ủng hộ Shop TFT Tuấn Thái Bình!`);
                          }}
                          className="px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold border border-orange-200 cursor-pointer"
                        >
                          💬 Trả Lời
                        </button>
                      )}

                      {rev.customerZalo && (
                        <a
                          href={`https://zalo.me/${rev.customerZalo.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 cursor-pointer"
                        >
                          Nhắn Zalo
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: KẾT QUẢ KHẢO SÁT & Ý KIẾN KHÁCH HÀNG                   */}
      {/* ============================================================ */}
      {activeTab === "RESPONSES" && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Scorecards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Tổng Khảo Sát</span>
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {summary.total}
                </div>
                <div className="text-[11px] text-slate-500">Ý kiến đã ghi nhận</div>
              </div>

              {/* Card Quà Chưa Trao */}
              <div
                onClick={() => setGiftFilter(giftFilter === "PENDING" ? "ALL" : "PENDING")}
                className={`p-4 rounded-2xl border shadow-xs space-y-1 transition-all cursor-pointer ${
                  giftFilter === "PENDING"
                    ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20"
                    : "bg-white border-slate-200/90 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                  <span>Quà Chưa Trao</span>
                  <Gift className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                  {pendingGiftCount}
                </div>
                <div className="text-[11px] text-amber-700 font-medium">Bấm để lọc chưa trao</div>
              </div>

              {/* Card Quà Đã Trao */}
              <div
                onClick={() => setGiftFilter(giftFilter === "DELIVERED" ? "ALL" : "DELIVERED")}
                className={`p-4 rounded-2xl border shadow-xs space-y-1 transition-all cursor-pointer ${
                  giftFilter === "DELIVERED"
                    ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20"
                    : "bg-white border-slate-200/90 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                  <span>Quà Đã Trao</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  {deliveredGiftCount}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Bấm để lọc đã trao</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Hài Lòng (CSAT)</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                  {summary.avgSatisfaction} / 5
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {summary.satisfactionRate}% Hài lòng
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Giới Thiệu (NPS)</span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">
                  {summary.avgRecommendScore} / 10
                </div>
                <div className="text-[11px] text-purple-700 font-medium">Sẵn sàng giới thiệu</div>
              </div>
            </div>
          )}

          {/* Filter Bar & Search: Tên, SĐT, Trạng thái quà & Rating */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            {/* Thanh Tìm Kiếm Đa Năng */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm kiếm theo Tên khách hàng, Số điện thoại / Zalo, nội dung góp ý..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Các nút bấm Bộ Lọc Trạng Thái Trao Quà & Số Sao */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              {/* Lọc Trạng Thái Trao Quà */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-orange-600" /> Trao quà:
                </span>
                <button
                  onClick={() => setGiftFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    giftFilter === "ALL"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Tất Cả ({surveys.length})
                </button>
                <button
                  onClick={() => setGiftFilter("PENDING")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    giftFilter === "PENDING"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  <span>🎁 Chưa Trao Quà</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    giftFilter === "PENDING" ? "bg-white text-amber-700" : "bg-amber-200 text-amber-900"
                  }`}>
                    {pendingGiftCount}
                  </span>
                </button>
                <button
                  onClick={() => setGiftFilter("DELIVERED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    giftFilter === "DELIVERED"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã Trao Quà</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    giftFilter === "DELIVERED" ? "bg-white text-emerald-700" : "bg-emerald-200 text-emerald-900"
                  }`}>
                    {deliveredGiftCount}
                  </span>
                </button>
              </div>

              {/* Lọc Theo Đánh Giá Sao */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Đánh giá:
                </span>
                <button
                  onClick={() => setRatingFilter("ALL")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ratingFilter === "ALL"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Tất Cả
                </button>
                <button
                  onClick={() => setRatingFilter(5)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    ratingFilter === 5
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>5 Sao</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </button>
                <button
                  onClick={() => setRatingFilter(4)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    ratingFilter === 4
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>4 Sao</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </button>
                <button
                  onClick={() => setRatingFilter("LOW")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ratingFilter === "LOW"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  ≤ 3★
                </button>
              </div>
            </div>
          </div>

          {/* Survey List */}
          <div className="space-y-4">
            {loadingResponses ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Đang tải dữ liệu khảo sát...
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700">Chưa có phản hồi khảo sát nào phù hợp!</h3>
                <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.</p>
              </div>
            ) : (
              filteredSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className={`p-5 sm:p-6 bg-white rounded-2xl border shadow-xs space-y-4 transition-all ${
                    survey.giftDelivered ? "border-slate-200 hover:border-slate-300" : "border-amber-300/80 hover:border-amber-400 shadow-amber-500/5"
                  }`}
                >
                  {/* Card Header: Tên khách, SĐT, Thời gian, Đánh giá & Xóa */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-black text-sm flex items-center justify-center border border-orange-200">
                        {(survey.customerName || "K").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">
                            {survey.customerName || "Khách Ẩn Danh"}
                          </h3>
                          {survey.customerZalo && (
                            <button
                              onClick={() => handleCopyZalo(survey.customerZalo!, survey.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Chạm để sao chép số điện thoại / Zalo"
                            >
                              {copiedZaloId === survey.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Đã chép SĐT</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{survey.customerZalo}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(survey.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-amber-800 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{survey.satisfactionRating} / 5</span>
                      </div>

                      <div className="text-xs font-bold px-2 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                        NPS: {survey.recommendScore}/10
                      </div>

                      <button
                        onClick={() => handleDeleteResponse(survey.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa phản hồi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* KHU VỰC TRAO QUÀ & XÁC NHẬN (TÍCH ĐÃ TRAO QUÀ / CHƯA TRAO QUÀ) */}
                  <div
                    className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      survey.giftDelivered
                        ? "bg-emerald-50/70 border-emerald-200"
                        : "bg-amber-50/70 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${
                          survey.giftDelivered
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white animate-pulse"
                        }`}
                      >
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-black uppercase ${
                              survey.giftDelivered ? "text-emerald-800" : "text-amber-900"
                            }`}
                          >
                            {survey.giftDelivered ? "ĐÃ TRAO QUÀ CHO KHÁCH" : "CHƯA TRAO QUÀ TRI ÂN"}
                          </span>
                          {survey.branch && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                              {survey.branch === "GDTG"
                                ? "🛡️ GDTG (Free < 1M)"
                                : survey.branch === "WEBSITE"
                                ? "💡 Báo Lỗi Web"
                                : "🎮 Thuê Acc"}
                            </span>
                          )}
                          {survey.rewardCode && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-orange-600 border border-orange-300">
                              Mã: {survey.rewardCode}
                            </span>
                          )}
                          {survey.giftDelivered && survey.giftDeliveredAt && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              (Lúc {new Date(survey.giftDeliveredAt).toLocaleString("vi-VN")})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {survey.customerZalo ? (
                            <>SĐT/Zalo nhận quà: <strong className="font-mono text-slate-900 font-bold">{survey.customerZalo}</strong></>
                          ) : (
                            <span className="text-slate-400 italic">Khách hàng không để lại SĐT/Zalo</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {survey.customerZalo && (
                        <a
                          href={`https://zalo.me/${survey.customerZalo.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Chào bạn, Shop TFT Tuấn Thái Bình đã nhận được khảo sát ý kiến của bạn! Phần quà tri ân của bạn là: ${survey.rewardCode || "Voucher"} (${survey.rewardTitle || "Ưu Đãi"}). Cảm ơn bạn đã đồng hành cùng Shop!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Nhắn Zalo Gửi Quà</span>
                        </a>
                      )}


                      <button
                        type="button"
                        onClick={() => handleToggleGiftDelivered(survey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          survey.giftDelivered
                            ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{survey.giftDelivered ? "Hủy Đã Trao" : "Tích Đã Trao Quà"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Services and Attributes */}
                  <div className="flex flex-wrap items-center gap-2">
                    {survey.servicesUsed.map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        🏷️ {srv}
                      </span>
                    ))}
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
                      {survey.deliverySpeed}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {survey.supportAttitude}
                    </span>
                  </div>

                  {/* Quality & Additions */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium">Chất lượng acc & Giá:</span>
                      <span className="font-bold text-slate-800">
                        {survey.accountQuality} • {survey.pricingPerception}
                      </span>
                    </div>
                    {survey.requestedAdditions && (
                      <div>
                        <span className="text-slate-500 block font-medium">Tướng tí nị / Sân đấu muốn thêm:</span>
                        <span className="font-bold text-orange-700">
                          💡 {survey.requestedAdditions}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Improvement Suggestion Highlight */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-orange-50/70 border border-orange-200/90 space-y-1">
                    <span className="text-xs font-extrabold text-orange-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                      <span>Ý Kiến Đóng Góp Cải Tiến Cho Shop:</span>
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      &ldquo;{survey.improvementSuggestion}&rdquo;
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CÀI ĐẶT CÂU HỎI & PHẦN QUÀ (SURVEY BUILDER)            */}
      {/* ============================================================ */}
      {activeTab === "SETTINGS" && config && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Save Sticky Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <span>Trình Quản Lý & Tùy Biến Biểu Mẫu Khảo Sát</span>
              </h3>
              <p className="text-xs text-slate-500">
                Thay đổi tại đây sẽ được áp dụng trực tiếp lên trang <strong>/khao-sat</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openAddQuestionModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-orange-600" />
                <span>+ Thêm Câu Hỏi Mới</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveConfig()}
                disabled={savingConfig}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? "Đang Lưu..." : "💾 Lưu Cấu Hình Khảo Sát"}</span>
              </button>
            </div>
          </div>

          {/* 1. Reward & Voucher Settings Card (Mỗi nhánh 1 phần quà riêng) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Thiết Lập Quà Tặng / Voucher Theo Từng Nhánh Dịch Vụ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Khách hàng hoàn thành khảo sát ở nhánh nào sẽ nhận được phần quà riêng của nhánh đó.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 self-start sm:self-center">
                <input
                  type="checkbox"
                  checked={
                    config.branchRewards?.[activeRewardBranch]?.enabled ?? config.reward?.enabled ?? true
                  }
                  onChange={(e) => {
                    const currentReward = config.branchRewards?.[activeRewardBranch] || { ...config.reward };
                    const updated = {
                      ...config,
                      branchRewards: {
                        ...(config.branchRewards || {}),
                        [activeRewardBranch]: { ...currentReward, enabled: e.target.checked },
                      },
                      ...(activeRewardBranch === "THUE_ACC" ? { reward: { ...config.reward, enabled: e.target.checked } } : {}),
                    };
                    setConfig(updated);
                  }}
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                />
                <span>Bật tặng quà cho nhánh này</span>
              </label>
            </div>

            {/* Branch Selector Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveRewardBranch("THUE_ACC")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRewardBranch === "THUE_ACC"
                    ? "bg-white text-orange-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Thuê Acc TFT</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRewardBranch("GDTG")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRewardBranch === "GDTG"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>GDTG TFT (Free &lt; 1M)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRewardBranch("WEBSITE")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRewardBranch === "WEBSITE"
                    ? "bg-white text-emerald-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Báo Lỗi &amp; Cải Thiện Web</span>
              </button>
            </div>

            {/* Active Branch Reward Form */}
            {(() => {
              const bReward = config.branchRewards?.[activeRewardBranch] || {
                enabled: true,
                voucherCode: activeRewardBranch === "THUE_ACC" ? "TRIAN-THUE50" : activeRewardBranch === "GDTG" ? "FREE-GDTG1M" : "WEB-TRIAN30",
                rewardTitle: activeRewardBranch === "THUE_ACC" ? "Voucher Giảm 50.000đ Thuê Acc VIP" : activeRewardBranch === "GDTG" ? "Miễn Phí 1 Lần GDTG (Dưới 1.000.000đ)" : "Voucher Tri Ân Cải Thiện Website 30.000đ",
                rewardDescription: activeRewardBranch === "THUE_ACC" ? "Giảm ngay 50.000đ khi gửi mã này qua Zalo Tuấn Thái Bình + Tặng 1 Acc Gacha 400 - 2000 Kỉ Vật (áp dụng cho đơn thuê acc VIP)." : activeRewardBranch === "GDTG" ? "Miễn phí 100% phí Giao Dịch Trung Gian cho đơn hàng dưới 1.000.000đ khi gửi mã này qua Zalo Tuấn Thái Bình." : "Voucher tri ân 30.000đ cho đơn hàng tiếp theo qua Zalo Tuấn Thái Bình nhằm cảm ơn sự đóng góp cải thiện hệ thống của bạn.",
                discountValue: activeRewardBranch === "THUE_ACC" ? 50000 : activeRewardBranch === "GDTG" ? 0 : 30000,
              };

              const updateField = (field: keyof SurveyRewardConfig, val: any) => {
                const currentReward = config.branchRewards?.[activeRewardBranch] || { ...bReward };
                const updated = {
                  ...config,
                  branchRewards: {
                    ...(config.branchRewards || {}),
                    [activeRewardBranch]: { ...currentReward, [field]: val },
                  },
                  ...(activeRewardBranch === "THUE_ACC" ? { reward: { ...config.reward, [field]: val } } : {}),
                };
                setConfig(updated);
              };

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Mã Voucher / Mã Ưu Đãi:
                    </label>
                    <input
                      type="text"
                      value={bReward.voucherCode}
                      onChange={(e) => updateField("voucherCode", e.target.value.toUpperCase())}
                      placeholder={activeRewardBranch === "GDTG" ? "VD: FREE-GDTG1M" : "VD: TRIAN-THUE50"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Tiêu Đề Phần Quà:
                    </label>
                    <input
                      type="text"
                      value={bReward.rewardTitle}
                      onChange={(e) => updateField("rewardTitle", e.target.value)}
                      placeholder="VD: Miễn Phí 1 Lần GDTG (Dưới 1.000.000đ)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Mô Tả / Quyền Lợi Sử Dụng:
                    </label>
                    <input
                      type="text"
                      value={bReward.rewardDescription}
                      onChange={(e) => updateField("rewardDescription", e.target.value)}
                      placeholder="VD: 🛡️ Miễn phí 100% phí Giao Dịch Trung Gian..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Giá Trị Giảm Giá (VNĐ):
                    </label>
                    <input
                      type="number"
                      value={bReward.discountValue || 0}
                      onChange={(e) => updateField("discountValue", Number(e.target.value) || 0)}
                      placeholder="VD: 50000 hoặc 0 (nếu là voucher free dịch vụ)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveConfig()}
                      disabled={savingConfig}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Cấu Hình Quà Tặng ({activeRewardBranch === "GDTG" ? "GDTG" : activeRewardBranch === "WEBSITE" ? "Website" : "Thuê Acc"})</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>


          {/* 2. Header & Introduction Text Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Tiêu Đề & Lời Ngỏ Gửi Đến Khách Hàng
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Tiêu Đề Biểu Mẫu:</label>
                <input
                  type="text"
                  value={config.header.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      header: { ...config.header, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Phụ Đề / Tác Giả:</label>
                <input
                  type="text"
                  value={config.header.subtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      header: { ...config.header, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Lời Dẫn Khảo Sát:</label>
                <textarea
                  rows={2}
                  value={config.header.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      header: { ...config.header, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveConfig()}
                  disabled={savingConfig}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Lời Dẫn & Tiêu Đề</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Questions List & Reorder */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Danh Sách Câu Hỏi Trong Biểu Mẫu ({config.questions.length} câu)
                </h3>
              </div>

              <button
                type="button"
                onClick={openAddQuestionModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Câu Hỏi</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.questions.map((q, idx) => {
                const typeInfo = QUESTION_TYPE_LABELS[q.type] || {
                  label: q.type,
                  color: "bg-slate-100 text-slate-700",
                };

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      q.enabled
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-slate-100/50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-400">#{idx + 1}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                          {q.branch && q.branch !== "ALL" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                              {q.branch === "THUE_ACC"
                                ? "🎮 Thuê Acc"
                                : q.branch === "GDTG"
                                ? "🛡️ GDTG"
                                : q.branch === "WEBSITE"
                                ? "💡 Báo Lỗi & Web"
                                : q.branch === "CAY_THUE"
                                ? "⚔️ Cày Thuê"
                                : q.branch}
                            </span>
                          )}

                          {q.required ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                              Bắt buộc *
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                              Tùy chọn
                            </span>
                          )}
                          {q.section && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              📂 {q.section}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-slate-900">{q.title}</h4>
                        {q.subtitle && (
                          <p className="text-[11px] text-slate-500">{q.subtitle}</p>
                        )}

                        {/* Options preview */}
                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveQuestion(idx, "UP")}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Di chuyển lên trên"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === config.questions.length - 1}
                          onClick={() => handleMoveQuestion(idx, "DOWN")}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Di chuyển xuống dưới"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleQuestionEnabled(q.id)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            q.enabled
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-200 text-slate-600 border-slate-300"
                          }`}
                          title={q.enabled ? "Đang bật (Chạm để ẩn)" : "Đang ẩn (Chạm để hiện)"}
                        >
                          {q.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{q.enabled ? "Hiện" : "Ẩn"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditQuestionModal(q)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 transition-colors cursor-pointer"
                          title="Chỉnh sửa câu hỏi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: THÊM / CHỈNH SỬA CÂU HỎI                              */}
      {/* ============================================================ */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-scaleUp space-y-4 p-5 sm:p-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {config?.questions.some((q) => q.id === editingQuestion.id)
                  ? "Chỉnh Sửa Câu Hỏi Khảo Sát"
                  : "Thêm Câu Hỏi Khảo Sát Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* Type selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Loại Câu Hỏi:</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      type: e.target.value as SurveyQuestionType,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="SINGLE_CHOICE">Trắc nghiệm (Chỉ chọn 1 đáp án)</option>
                  <option value="MULTIPLE_CHOICE">Tích chọn (Chọn được nhiều đáp án)</option>
                  <option value="RATING_5">Đánh giá 1 - 5 Sao ⭐</option>
                  <option value="RATING_10">Thang điểm NPS (1 - 10)</option>
                  <option value="TEXT">Văn bản ngắn (Một dòng)</option>
                  <option value="TEXTAREA">Văn bản dài (Ý kiến đóng góp)</option>
                </select>
              </div>

              {/* Branch selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Nhánh Dịch Vụ Áp Dụng:</label>
                <select
                  value={editingQuestion.branch || "ALL"}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      branch: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white font-medium"
                >
                  <option value="ALL">🌐 Tất cả các nhánh (Câu hỏi chung / Đánh giá cuối)</option>
                  <option value="THUE_ACC">🎮 Nhánh: Thuê Acc TFT (Tí Nị, Sân Đấu, Thời Gian)</option>
                  <option value="GDTG">🛡️ Nhánh: GDTG TFT (An Toàn, Check Mail, Phí TG)</option>
                  <option value="WEBSITE">💡 Nhánh: Báo Lỗi & Cải Thiện Website (Góp ý, giật lag, giao diện)</option>
                  <option value="CAY_THUE">⚔️ Nhánh: Cày Thuê TFT (Lưu trữ / Tùy chọn)</option>

                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Tiêu Đề Câu Hỏi:</label>
                <input
                  type="text"
                  value={editingQuestion.title}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, title: e.target.value })
                  }
                  placeholder="VD: Bạn biết đến Shop qua kênh truyền thông nào?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Section input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Thuộc Phân Mục (Section):</label>
                <input
                  type="text"
                  value={editingQuestion.section || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, section: e.target.value })
                  }
                  placeholder="VD: Phần 1: Trải Nghiệm Dịch Vụ & CSKH"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Subtitle / Placeholder */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Ghi Chú Phụ / Placeholder:</label>
                <input
                  type="text"
                  value={editingQuestion.subtitle || editingQuestion.placeholder || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      subtitle: e.target.value,
                      placeholder: e.target.value,
                    })
                  }
                  placeholder="VD: (Có thể chọn nhiều mục)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Options builder for Single & Multiple choice */}
              {(editingQuestion.type === "SINGLE_CHOICE" ||
                editingQuestion.type === "MULTIPLE_CHOICE") && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-800 block">
                    Danh Sách Các Lựa Chọn:
                  </label>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {(editingQuestion.options || []).map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <span className="font-medium text-slate-800">{opt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionFromQuestion(optIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddOptionToQuestion();
                        }
                      }}
                      placeholder="Gõ lựa chọn mới rồi bấm Thêm..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddOptionToQuestion}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              )}

              {/* Required Switch */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="font-bold text-slate-800 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingQuestion.required}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        required: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                  />
                  <span>Câu hỏi bắt buộc trả lời (*)</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveQuestionModal}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 cursor-pointer"
              >
                Cập Nhật Câu Hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
