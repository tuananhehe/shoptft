"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart2,
  FileText,
  RotateCcw,
  Check,
  X,
  Eye,
  Info,
  Link2,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  BlogPost,
  BlogPostRefreshDraft,
  BlogPostPreviousVersion,
  PostRefreshEvaluation,
  AiRefreshAnalysis,
  RefreshStatus,
  RefreshPriority,
} from "@/utils/blog-shared";
import { ArticleDiffResult } from "@/utils/ai-content-refresh";

interface ContentRefreshItem {
  post: BlogPost;
  evaluation: PostRefreshEvaluation;
  diff?: ArticleDiffResult | null;
}

interface ContentRefreshSummary {
  total: number;
  needsReview: number;
  outdated: number;
  seoOpportunity: number;
  fresh: number;
}

export function ContentRefreshTab() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ContentRefreshItem[]>([]);
  const [summary, setSummary] = useState<ContentRefreshSummary>({
    total: 0,
    needsReview: 0,
    outdated: 0,
    seoOpportunity: 0,
    fresh: 0,
  });
  const [currentPatch, setCurrentPatch] = useState("18.3b");
  const [currentSeason, setCurrentSeason] = useState("TFT Mùa 18 – Đại Ngàn Kỳ Bí");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modal states
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    post: BlogPost;
    analysis: AiRefreshAnalysis;
  } | null>(null);

  const [generatingDraftId, setGeneratingDraftId] = useState<string | null>(null);
  const [activeDiffItem, setActiveDiffItem] = useState<{
    post: BlogPost;
    draft: BlogPostRefreshDraft;
    diff?: ArticleDiffResult | null;
  } | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedExcerpt, setEditedExcerpt] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  // Fetch refresh data from API
  const fetchRefreshData = async () => {
    try {
      setLoading(true);
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        headers: localToken ? { "x-admin-token": localToken } : {},
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.items || []);
        setSummary(data.data.summary || {});
        if (data.data.currentPatch) setCurrentPatch(data.data.currentPatch);
        if (data.data.currentSeason) setCurrentSeason(data.data.currentSeason);
      } else {
        toast.error(data.error || "Không thể tải dữ liệu Content Refresh!");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải danh sách Content Refresh!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefreshData();
  }, []);

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const post = item.post;
    const evalStatus = item.evaluation.status;
    const evalPriority = item.evaluation.priority;

    if (statusFilter !== "all" && evalStatus !== statusFilter) return false;
    if (priorityFilter !== "all" && evalPriority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchSlug = post.slug.toLowerCase().includes(q);
      const matchCat = post.category.toLowerCase().includes(q);
      const matchPatch = (post.patch || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchCat && !matchPatch) return false;
    }

    return true;
  });

  // Action: Analyze post by AI
  const handleAnalyze = async (post: BlogPost) => {
    setAnalyzingId(post.id);
    const toastId = toast.loading(`Đang phân tích bài viết bằng AI: "${post.title.slice(0, 30)}..."`);
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({ action: "analyze", postId: post.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.analysis) {
        toast.success("Phân tích AI hoàn tất!", { id: toastId });
        setAnalysisResult({
          post,
          analysis: data.data.analysis,
        });
      } else {
        toast.error(data.error || "Lỗi khi phân tích bài viết!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi gọi AI phân tích!", { id: toastId });
    } finally {
      setAnalyzingId(null);
    }
  };

  // Action: Generate refresh draft by AI
  const handleGenerateDraft = async (post: BlogPost) => {
    setGeneratingDraftId(post.id);
    const toastId = toast.loading(`AI đang tạo bản cập nhật cho: "${post.title.slice(0, 30)}..."`);
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({ action: "generate_draft", postId: post.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.draft) {
        toast.success("Đã tạo bản nháp cập nhật! (Chưa xuất bản)", { id: toastId });
        await fetchRefreshData();
        // Open Diff View
        setAnalysisResult(null);
        openDiffModal(post, data.data.draft, data.data.diff);
      } else {
        toast.error(data.error || "Lỗi khi tạo bản cập nhật!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi gọi AI tạo bản cập nhật!", { id: toastId });
    } finally {
      setGeneratingDraftId(null);
    }
  };

  // Open Diff Modal
  const openDiffModal = (
    post: BlogPost,
    draft: BlogPostRefreshDraft,
    diff?: ArticleDiffResult | null
  ) => {
    setActiveDiffItem({ post, draft, diff });
    setEditedTitle(draft.suggestedTitle);
    setEditedExcerpt(draft.suggestedExcerpt);
    setEditedContent(draft.suggestedContent);
    setEditMode(false);
  };

  // Action: Save Draft Edits
  const handleSaveDraftEdits = async () => {
    if (!activeDiffItem) return;
    setSavingAction(true);
    const toastId = toast.loading("Đang lưu chỉnh sửa bản nháp...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({
          action: "save_draft",
          postId: activeDiffItem.post.id,
          draftData: {
            suggestedTitle: editedTitle,
            suggestedExcerpt: editedExcerpt,
            suggestedContent: editedContent,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.draft) {
        toast.success("Đã lưu thay đổi vào bản nháp!", { id: toastId });
        setActiveDiffItem((prev) =>
          prev
            ? {
                ...prev,
                draft: data.data.draft,
                diff: data.data.diff,
              }
            : null
        );
        setEditMode(false);
        await fetchRefreshData();
      } else {
        toast.error(data.error || "Lỗi lưu bản nháp!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu bản nháp!", { id: toastId });
    } finally {
      setSavingAction(false);
    }
  };

  // Action: Approve & Publish
  const handleApprovePublish = async () => {
    if (!activeDiffItem) return;
    if (
      !confirm(
        `Xác nhận phê duyệt và xuất bản cập nhật bài viết: "${activeDiffItem.post.title}"?\n\n(Lưu ý: Nội dung live sẽ được cập nhật. Phiên bản hiện tại sẽ được lưu trữ an toàn để có thể khôi phục lại bất kỳ lúc nào).`
      )
    ) {
      return;
    }

    setSavingAction(true);
    const toastId = toast.loading("Đang phê duyệt và xuất bản...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({
          action: "approve",
          postId: activeDiffItem.post.id,
          draftData: editMode
            ? {
                suggestedTitle: editedTitle,
                suggestedExcerpt: editedExcerpt,
                suggestedContent: editedContent,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xuất bản cập nhật bài viết thành công!", { id: toastId });
        setActiveDiffItem(null);
        await fetchRefreshData();
      } else {
        toast.error(data.error || "Lỗi xuất bản!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi xuất bản!", { id: toastId });
    } finally {
      setSavingAction(false);
    }
  };

  // Action: Reject Draft
  const handleRejectDraft = async () => {
    if (!activeDiffItem) return;
    if (!confirm("Bạn có chắc chắn muốn hủy bỏ bản nháp cập nhật này?")) return;

    setSavingAction(true);
    const toastId = toast.loading("Đang hủy bản nháp...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({
          action: "reject",
          postId: activeDiffItem.post.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã hủy bỏ bản nháp cập nhật!", { id: toastId });
        setActiveDiffItem(null);
        await fetchRefreshData();
      } else {
        toast.error(data.error || "Lỗi hủy bản nháp!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi hủy bản nháp!", { id: toastId });
    } finally {
      setSavingAction(false);
    }
  };

  // Action: Restore Previous Version
  const handleRestoreVersion = async (post: BlogPost) => {
    if (
      !confirm(
        `Khôi phục lại phiên bản trước cho bài viết "${post.title}"?\n\nNội dung lưu trữ sẽ được đưa trở lại phiên bản live.`
      )
    ) {
      return;
    }

    const toastId = toast.loading("Đang khôi phục phiên bản trước...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({
          action: "restore",
          postId: post.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã khôi phục phiên bản trước thành công!", { id: toastId });
        await fetchRefreshData();
      } else {
        toast.error(data.error || "Lỗi khôi phục!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi khôi phục!", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Information & Refresh Season Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-base sm:text-lg font-heading font-bold text-gray-900">
              AI Content Refresh Engine (Làm Mới Nội Dung SEO)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tự động rà soát bài viết cũ, phát hiện bản vá lỗi thời, cơ hội CTR/Position và tạo bản nháp cập nhật bằng AI an toàn.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-gray-50 p-2.5 px-3 rounded-xl border border-gray-200">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Mùa giải hiện tại</span>
            <strong className="text-gray-900 font-semibold">{currentSeason}</strong>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Bản vá chuẩn</span>
            <strong className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Patch {currentPatch}
            </strong>
          </div>
          <button
            onClick={fetchRefreshData}
            title="Làm mới dữ liệu"
            className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition-colors ml-1 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter("Needs Review")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "Needs Review"
              ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
            <span>Cần xem lại</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-gray-900 mt-1">
            {summary.needsReview}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Patch cũ / Thiếu link / Yếu meta</div>
        </button>

        <button
          onClick={() => setStatusFilter("Outdated")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "Outdated"
              ? "bg-rose-500/10 border-rose-500/40 shadow-xs"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-700 font-semibold">
            <span>Lỗi thời</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-gray-900 mt-1">
            {summary.outdated}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Lệch nhiều bản vá</div>
        </button>

        <button
          onClick={() => setStatusFilter("SEO Opportunity")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "SEO Opportunity"
              ? "bg-sky-500/10 border-sky-500/40 shadow-xs"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-sky-700 font-semibold">
            <span>Cơ hội SEO</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-gray-900 mt-1">
            {summary.seoOpportunity}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">CTR thấp / Top 8-20 (Trang 2)</div>
        </button>

        <button
          onClick={() => setStatusFilter("Fresh")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "Fresh"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span>Tươi mới</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-heading font-bold text-gray-900 mt-1">
            {summary.fresh}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Đạt chuẩn SEO & Patch mới</div>
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, slug, patch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Outdated">Outdated</option>
            <option value="SEO Opportunity">SEO Opportunity</option>
            <option value="Fresh">Fresh</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-pointer"
          >
            <option value="all">Tất cả ưu tiên</option>
            <option value="High">Ưu tiên cao (High)</option>
            <option value="Medium">Ưu tiên vừa (Medium)</option>
            <option value="Low">Ưu tiên thấp (Low)</option>
          </select>

          {(statusFilter !== "all" || priorityFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* 4. Content Refresh Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Bài viết</th>
                <th className="p-3.5">Phân loại & Patch</th>
                <th className="p-3.5">Cập nhật</th>
                <th className="p-3.5">Trạng thái SEO</th>
                <th className="p-3.5">Lý do xem xét</th>
                <th className="p-3.5 text-right pr-5">Thao tác AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    <span>Đang nạp và đánh giá dữ liệu Content Refresh...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ post, evaluation, diff }) => {
                  const hasDraft = !!post.refreshDraft;
                  const hasPrevious = !!post.previousVersion;
                  const gsc = post.searchConsoleMetrics;

                  return (
                    <tr key={post.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* 1. Article Info */}
                      <td className="p-3.5 pl-5 max-w-xs">
                        <div className="font-semibold text-gray-900 line-clamp-1">{post.title}</div>
                        <div className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                          /blog/{post.slug}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium">
                            {post.category}
                          </span>
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-[10px] text-gray-500 hover:text-gray-900 flex items-center gap-0.5"
                          >
                            <span>Xem bài</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                          {hasDraft && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-semibold border border-amber-500/20">
                              Có bản nháp AI
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Type & Patch */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-gray-700">
                          {post.contentType === "evergreen"
                            ? "Evergreen (Bền vững)"
                            : post.contentType === "patch-sensitive"
                            ? "Patch-sensitive"
                            : "Seasonal (Mùa 18)"}
                        </div>
                        <div className="mt-1">
                          {post.patch ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                evaluation.isPatchStale
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              Patch {post.patch}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">Không gắn patch</span>
                          )}
                        </div>
                      </td>

                      {/* 3. Updated Date */}
                      <td className="p-3.5 whitespace-nowrap text-gray-600">
                        <div>{new Date(post.updatedAt || post.publishedAt).toLocaleDateString("vi-VN")}</div>
                        <div className="text-[10px] text-gray-400">
                          {evaluation.daysSinceUpdate} ngày trước
                        </div>
                      </td>

                      {/* 4. SEO Status & Priority */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div>
                          {evaluation.status === "Needs Review" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Needs Review</span>
                            </span>
                          )}
                          {evaluation.status === "Outdated" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <Clock className="w-3 h-3" />
                              <span>Outdated</span>
                            </span>
                          )}
                          {evaluation.status === "SEO Opportunity" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              <TrendingUp className="w-3 h-3" />
                              <span>SEO Opportunity</span>
                            </span>
                          )}
                          {evaluation.status === "Fresh" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Fresh</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-1">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${
                              evaluation.priority === "High"
                                ? "text-rose-600 font-bold"
                                : evaluation.priority === "Medium"
                                ? "text-amber-600"
                                : "text-gray-400"
                            }`}
                          >
                            Ưu tiên: {evaluation.priority}
                          </span>
                        </div>
                      </td>

                      {/* 5. Reasons & Metrics */}
                      <td className="p-3.5 max-w-sm">
                        <ul className="space-y-1">
                          {evaluation.reasons.length === 0 ? (
                            <li className="text-emerald-600 text-[11px] flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Nội dung đồng bộ và chuẩn SEO</span>
                            </li>
                          ) : (
                            evaluation.reasons.slice(0, 2).map((r, idx) => (
                              <li key={idx} className="text-gray-700 text-[11px] flex items-start gap-1">
                                <span className="text-amber-500">•</span>
                                <span className="line-clamp-1">{r}</span>
                              </li>
                            ))
                          )}
                        </ul>

                        {/* Search Console Metrics preview */}
                        {gsc && (
                          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-500 font-mono bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                            <span>Imp: {gsc.impressions}</span>
                            <span>CTR: {gsc.ctr.toFixed(1)}%</span>
                            <span>Vị trí: {gsc.position.toFixed(1)}</span>
                            <span className="text-gray-400">({gsc.periodLabel})</span>
                          </div>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td className="p-3.5 text-right pr-5 whitespace-nowrap space-y-1.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAnalyze(post)}
                            disabled={analyzingId === post.id}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{analyzingId === post.id ? "Đang phân tích..." : "Phân tích AI"}</span>
                          </button>

                          {hasDraft ? (
                            <button
                              onClick={() => openDiffModal(post, post.refreshDraft!, diff)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem bản nháp</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateDraft(post)}
                              disabled={generatingDraftId === post.id}
                              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${generatingDraftId === post.id ? "animate-spin" : ""}`} />
                              <span>{generatingDraftId === post.id ? "Đang tạo..." : "Tạo bản cập nhật"}</span>
                            </button>
                          )}
                        </div>

                        {hasPrevious && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleRestoreVersion(post)}
                              className="text-[10px] text-gray-500 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Khôi phục bản cũ</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: AI Analysis Details */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900">
                    Báo Cáo Phân Tích Nội Dung SEO (AI Insights)
                  </h3>
                  <p className="text-xs text-gray-500 truncate max-w-md">
                    {analysisResult.post.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnalysisResult(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vấn đề chính */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Vấn đề chính phát hiện:</span>
              </span>
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                {analysisResult.analysis.mainIssues.map((issue, idx) => (
                  <div key={idx} className="text-xs text-gray-800 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Đề xuất Tiêu đề & Meta Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Đề xuất Tiêu Đề mới:</span>
                <p className="text-xs font-semibold text-gray-900">{analysisResult.analysis.suggestedTitle}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Đề xuất Meta Description:</span>
                <p className="text-xs text-gray-700">{analysisResult.analysis.suggestedMetaDescription}</p>
              </div>
            </div>

            {/* Sections cần cập nhật hoặc thêm mới */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Đề xuất phần nội dung cần bổ sung / nâng cấp:
              </span>
              <ul className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs text-gray-700">
                {analysisResult.analysis.sectionsToUpdate.map((s, idx) => (
                  <li key={`upd-${idx}`} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">↻</span>
                    <span>{s}</span>
                  </li>
                ))}
                {analysisResult.analysis.sectionsToAdd.map((s, idx) => (
                  <li key={`add-${idx}`} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Internal Links đề xuất */}
            {analysisResult.analysis.internalLinks.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Internal Links đề xuất kết nối:</span>
                </span>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  {analysisResult.analysis.internalLinks.map((link, idx) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-gray-900 font-semibold">{link.text}</strong>
                        <div className="text-[10px] text-gray-500">{link.reason}</div>
                      </div>
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {link.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fact Safety Warnings */}
            {analysisResult.analysis.researchRequired.length > 0 && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1">
                <span className="font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Yêu cầu an toàn dữ liệu (Fact Safety):</span>
                </span>
                {analysisResult.analysis.researchRequired.map((req, idx) => (
                  <p key={idx} className="text-[11px] text-blue-700">
                    • {req}
                  </p>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                onClick={() => setAnalysisResult(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => handleGenerateDraft(analysisResult.post)}
                disabled={generatingDraftId === analysisResult.post.id}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-900 hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{generatingDraftId === analysisResult.post.id ? "Đang tạo bản nháp..." : "✨ Tạo bản cập nhật từ phân tích này"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Diff View & Approval Review */}
      {activeDiffItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-xs font-semibold">
                    Xem Thay Đổi (Diff Review)
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    ID: {activeDiffItem.post.id}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900 mt-1">
                  So sánh Bản Hiện Tại (Live) vs Bản Đề Xuất Cập Nhật (Draft)
                </h3>
              </div>
              <button
                onClick={() => setActiveDiffItem(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diff Metadata Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Current Live Meta */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">
                  Bản Đang Live
                </span>
                <div className="font-semibold text-gray-900">{activeDiffItem.post.title}</div>
                <div className="text-[11px] text-gray-600 line-clamp-2">
                  {activeDiffItem.post.seo?.description || activeDiffItem.post.excerpt}
                </div>
                <div className="text-[10px] font-mono text-gray-400 pt-1">
                  Patch: {activeDiffItem.post.patch || "N/A"}
                </div>
              </div>

              {/* Proposed AI Draft Meta */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                    Bản Cập Nhật AI Đề Xuất
                  </span>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-[10px] text-emerald-800 underline font-semibold cursor-pointer"
                  >
                    {editMode ? "Xem trước Diff" : "Chỉnh sửa bản nháp"}
                  </button>
                </div>
                {editMode ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-emerald-300 rounded bg-white"
                      placeholder="Tiêu đề cập nhật..."
                    />
                    <textarea
                      rows={2}
                      value={editedExcerpt}
                      onChange={(e) => setEditedExcerpt(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-emerald-300 rounded bg-white"
                      placeholder="Mô tả cập nhật..."
                    />
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-gray-900">{editedTitle}</div>
                    <div className="text-[11px] text-gray-700 line-clamp-2">{editedExcerpt}</div>
                    <div className="text-[10px] font-mono text-emerald-700 pt-1">
                      Patch: {activeDiffItem.draft.suggestedPatch || currentPatch}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content Section: Diff or Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {editMode ? "Trình chỉnh sửa nội dung bài viết:" : "Chi tiết thay đổi nội dung (Line-by-line Diff):"}
                </span>
                {!editMode && activeDiffItem.diff && (
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{activeDiffItem.diff.addedCount} dòng thêm
                    </span>
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      -{activeDiffItem.diff.removedCount} dòng bớt
                    </span>
                  </div>
                )}
              </div>

              {editMode ? (
                <textarea
                  rows={14}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-gray-900 bg-white"
                  placeholder="Nội dung markdown..."
                />
              ) : (
                <div className="p-4 rounded-2xl bg-gray-950 text-gray-100 font-mono text-xs max-h-96 overflow-y-auto space-y-1 select-text">
                  {activeDiffItem.diff && activeDiffItem.diff.chunks.length > 0 ? (
                    activeDiffItem.diff.chunks.map((chunk, idx) => {
                      if (chunk.type === "add") {
                        return (
                          <div key={idx} className="bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded">
                            + {chunk.text}
                          </div>
                        );
                      }
                      if (chunk.type === "remove") {
                        return (
                          <div key={idx} className="bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded">
                            - {chunk.text}
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="text-gray-400 px-2 py-0.5 opacity-80">
                          &nbsp;&nbsp;{chunk.text}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400">Không có thay đổi văn bản lớn.</div>
                  )}
                </div>
              )}
            </div>

            {/* Safety & Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleRejectDraft}
                disabled={savingAction}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer disabled:opacity-50"
              >
                ✕ Hủy bỏ bản nháp này
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDiffItem(null)}
                  disabled={savingAction}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 cursor-pointer disabled:opacity-50"
                >
                  Đóng
                </button>

                {editMode ? (
                  <button
                    onClick={handleSaveDraftEdits}
                    disabled={savingAction}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 cursor-pointer disabled:opacity-50"
                  >
                    💾 Lưu chỉnh sửa vào nháp
                  </button>
                ) : null}

                <button
                  onClick={handleApprovePublish}
                  disabled={savingAction}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>🚀 Áp dụng & Xuất bản Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
