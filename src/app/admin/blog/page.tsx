"use client";

import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  Save,
  X,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Key,
  Wand2,
  Link2,
} from "lucide-react";
import {
  BlogPost,
  BlogPostCategory,
  BlogPostStatus,
  BlogContentType,
  BLOG_CATEGORIES,
  DEFAULT_AUTHOR,
  CURRENT_TFT_PATCH,
  slugify,
  calculateReadingTime,
  AiArticleLength,
  AiGenerateArticleRequest,
  AiArticleStructuredOutput,
} from "@/utils/blog-shared";

type FilterTab = "all" | "published" | "draft" | "set18" | "patch" | "missing_seo";

export default function AdminBlogManagerPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal / Drawer state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<"content" | "seo">("content");

  // AI Generator Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"full" | "rewrite" | "seo_only">("full");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState<BlogPostCategory | "auto">("auto");
  const [aiContentType, setAiContentType] = useState<BlogContentType | "auto">("auto");
  const [aiPatch, setAiPatch] = useState("");
  const [aiLength, setAiLength] = useState<AiArticleLength>("standard");
  const [aiApiKey, setAiApiKey] = useState("");
  const [showAiKeyInput, setShowAiKeyInput] = useState(false);
  const [aiShowAdvanced, setAiShowAdvanced] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState("");
  const [aiGeneratedNotice, setAiGeneratedNotice] = useState(false);

  // Load saved API key on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("admin_ai_api_key") || localStorage.getItem("admin_gemini_api_key") || "";
      if (savedKey) setAiApiKey(savedKey);
    }
  }, []);

  const handleOpenAiModal = (mode: "full" | "rewrite" | "seo_only" = "full") => {
    setAiMode(mode);
    if (mode === "full" && !editorOpen) {
      setEditingPost(null);
      setAiTopic("");
    } else if (mode === "rewrite") {
      setAiTopic(editingPost?.title ? `Viết lại bài viết: ${editingPost.title}` : "");
    } else if (mode === "seo_only") {
      setAiTopic(editingPost?.title ? `Tối ưu SEO cho bài: ${editingPost.title}` : "");
    } else {
      setAiTopic("");
    }
    setAiModalOpen(true);
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Vui lòng nhập chủ đề bài viết bạn muốn tạo!");
      return;
    }

    // Overwrite safety confirmation
    if (editingPost && (editingPost.title || (editingPost.content && editingPost.content.length > 50))) {
      const confirmed = window.confirm("Tạo lại sẽ thay thế nội dung hiện tại trong form. Bạn có chắc chắn muốn tiếp tục?");
      if (!confirmed) return;
    }

    // Save API key if updated
    if (typeof window !== "undefined" && aiApiKey.trim()) {
      localStorage.setItem("admin_ai_api_key", aiApiKey.trim());
    }

    setAiGenerating(true);
    setAiProgressStep("Đang phân tích chủ đề & cấu trúc meta...");

    const timer1 = setTimeout(() => {
      setAiProgressStep("Đang viết nội dung chi tiết & bảng chiến thuật...");
    }, 1200);

    const timer2 = setTimeout(() => {
      setAiProgressStep("Đang tối ưu tiêu đề, meta description & liên kết SEO...");
    }, 2800);

    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({
          topic: aiTopic,
          category: aiCategory === "auto" ? undefined : aiCategory,
          contentType: aiContentType === "auto" ? undefined : aiContentType,
          patch: aiPatch.trim() || undefined,
          length: aiLength,
          mode: aiMode,
          existingTitle: editingPost?.title,
          existingContent: editingPost?.content,
          apiKey: aiApiKey || undefined,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Không thể tạo bài lúc này. Nội dung hiện tại chưa bị thay đổi.");
      }

      const out: AiArticleStructuredOutput = json.data;

      if (aiMode === "seo_only") {
        setEditingPost((prev) => ({
          ...prev,
          tags: out.tags && out.tags.length > 0 ? out.tags : prev?.tags,
          seo: {
            ...prev?.seo,
            title: out.seo.metaTitle,
            description: out.seo.metaDescription,
            canonical: `https://www.shoptftmobile.net${out.seo.canonicalPath}`,
            noindex: false,
          },
        }));
        toast.success("✨ Đã tối ưu thẻ SEO bằng AI thành công!");
        setEditorTab("seo");
      } else {
        setEditingPost({
          id: aiMode === "rewrite" ? editingPost?.id : undefined,
          title: out.title,
          slug: out.slug,
          excerpt: out.excerpt,
          content: out.contentMarkdown,
          category: out.category,
          contentType: out.contentType,
          patch: out.patch || "",
          tags: out.tags,
          coverImage: (aiMode === "rewrite") ? (editingPost?.coverImage || "") : "",
          suggestedCoverPrompt: out.suggestedCoverPrompt,
          generatedByAi: true,
          status: "draft", // Always Draft
          author: DEFAULT_AUTHOR,
          seo: {
            title: out.seo.metaTitle,
            description: out.seo.metaDescription,
            canonical: `https://www.shoptftmobile.net${out.seo.canonicalPath}`,
            noindex: false,
          },
        });
        setAiGeneratedNotice(true);
        setEditorTab("content");
        setEditorOpen(true);
        toast.success("✨ Đã tạo bài viết bằng AI thành công! Mời bạn duyệt nội dung trước khi xuất bản.");
      }

      setAiModalOpen(false);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      toast.error(err.message || "Không thể tạo bài lúc này. Nội dung hiện tại chưa bị thay đổi.");
    } finally {
      setAiGenerating(false);
      setAiProgressStep("");
    }
  };

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/blog", {
        headers: localToken ? { "x-admin-token": localToken } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        toast.error(data.error || "Không thể tải danh sách bài viết!");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải danh sách bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Tab filter
      if (activeFilter === "published" && p.status !== "published") return false;
      if (activeFilter === "draft" && p.status !== "draft") return false;
      if (activeFilter === "set18" && p.category !== "TFT Mùa 18" && !p.tags.includes("tft mùa 18")) return false;
      if (activeFilter === "patch" && p.contentType !== "patch-sensitive") return false;
      if (activeFilter === "missing_seo") {
        const titleLen = (p.seo?.title || p.title).length;
        const descLen = (p.seo?.description || p.excerpt).length;
        if (titleLen >= 30 && titleLen <= 70 && descLen >= 80 && descLen <= 170) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = p.title.toLowerCase().includes(q);
        const inSlug = p.slug.toLowerCase().includes(q);
        const inCat = p.category.toLowerCase().includes(q);
        if (!inTitle && !inSlug && !inCat) return false;
      }

      return true;
    });
  }, [posts, activeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const draft = posts.filter((p) => p.status === "draft").length;
    const patchSensitive = posts.filter((p) => p.contentType === "patch-sensitive").length;
    return { total, published, draft, patchSensitive };
  }, [posts]);

  // Open Editor for New Post
  const handleCreateNew = () => {
    setEditingPost({
      title: "",
      slug: "",
      excerpt: "",
      content: "## Giới Thiệu\n\nNội dung mở đầu bài viết...\n\n---\n\n## Nội Dung Chi Tiết\n\nPhân tích chi tiết...",
      coverImage: "/banner-seo.jpg",
      category: "TFT Mùa 18",
      tags: ["tft mùa 18"],
      author: DEFAULT_AUTHOR,
      status: "draft",
      contentType: "seasonal",
      patch: CURRENT_TFT_PATCH,
      seo: {
        title: "",
        description: "",
        canonical: "",
        noindex: false,
      },
    });
    setEditorTab("content");
    setEditorOpen(true);
  };

  // Open Editor for Edit Post
  const handleEdit = (post: BlogPost) => {
    setEditingPost(JSON.parse(JSON.stringify(post)));
    setEditorTab("content");
    setEditorOpen(true);
  };

  // Duplicate Post
  const handleDuplicate = (post: BlogPost) => {
    const duplicated: Partial<BlogPost> = {
      ...JSON.parse(JSON.stringify(post)),
      id: undefined,
      title: `${post.title} (Bản sao)`,
      slug: `${post.slug}-copy`,
      status: "draft",
    };
    setEditingPost(duplicated);
    setEditorTab("content");
    setEditorOpen(true);
  };

  // Delete Post
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết: "${title}"?`)) return;

    const toastId = toast.loading("Đang xóa bài viết...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch(`/api/admin/blog?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: localToken ? { "x-admin-token": localToken } : {},
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa bài viết thành công!", { id: toastId });
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(data.error || "Xóa thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi xóa!", { id: toastId });
    }
  };

  // Save Post (Create or Update)
  const handleSavePost = async () => {
    if (!editingPost?.title?.trim()) {
      toast.error("Tiêu đề bài viết không được để trống!");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Đang lưu bài viết...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const isUpdating = Boolean(editingPost.id);

      const res = await fetch("/api/admin/blog", {
        method: isUpdating ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify(editingPost),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Lưu bài viết thành công!", { id: toastId });
        setEditorOpen(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        toast.error(data.error || "Lưu thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu bài viết!", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gray-100 text-gray-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-heading font-bold text-gray-900">
              Quản Trị Bài Viết & Blog SEO TFT
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý bài viết chuyên sâu Mùa 18, cập nhật meta patch, tối ưu thẻ SEO và liên kết nội bộ tự nhiên.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blog"
            target="_blank"
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Blog</span>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenAiModal("full")}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-700 hover:via-indigo-700 hover:to-amber-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>✨ Tạo bằng AI</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài viết mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tổng số bài</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Đã xuất bản</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.published}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Bản nháp (Draft)</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.draft}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Theo Patch</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.patchSensitive}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "all" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả ({posts.length})
          </button>
          <button
            onClick={() => setActiveFilter("published")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "published" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Xuất bản ({stats.published})
          </button>
          <button
            onClick={() => setActiveFilter("draft")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "draft" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Bản nháp ({stats.draft})
          </button>
          <button
            onClick={() => setActiveFilter("set18")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "set18" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            TFT Mùa 18
          </button>
          <button
            onClick={() => setActiveFilter("patch")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "patch" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Patch-sensitive ({stats.patchSensitive})
          </button>
          <button
            onClick={() => setActiveFilter("missing_seo")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "missing_seo" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cần tối ưu SEO
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, slug..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
          />
        </div>
      </div>

      {/* Table of Posts */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
            <span className="text-xs text-gray-500">Đang tải danh sách bài viết...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Bài viết</th>
                  <th className="px-4 py-3">Chuyên mục</th>
                  <th className="px-4 py-3">Mùa</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Phân loại</th>
                  <th className="px-4 py-3">Patch</th>
                  <th className="px-4 py-3">Độ tươi mới</th>
                  <th className="px-4 py-3">Sức khỏe SEO</th>
                  <th className="px-4 py-3">Ngày cập nhật</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPosts.map((post) => {
                  const titleLen = (post.seo?.title || post.title).length;
                  const descLen = (post.seo?.description || post.excerpt).length;
                  const isSeoOk = titleLen >= 30 && titleLen <= 70 && descLen >= 80 && descLen <= 170;

                  const isSet18 =
                    post.category === "TFT Mùa 18" ||
                    post.contentType === "seasonal" ||
                    post.contentType === "patch-sensitive" ||
                    post.tags.some((t) => t.toLowerCase().includes("18"));

                  const now = Date.now();
                  const updatedDate = new Date(post.updatedAt || post.publishedAt).getTime();
                  const ageDays = isNaN(updatedDate) ? 999 : (now - updatedDate) / (1000 * 60 * 60 * 24);

                  let freshnessStatus: "Fresh" | "Needs Review" | "Outdated" = "Fresh";
                  let freshnessBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";

                  if (post.contentType === "patch-sensitive") {
                    if (post.patch && post.patch.toLowerCase().trim() !== CURRENT_TFT_PATCH.toLowerCase().trim()) {
                      freshnessStatus = "Outdated";
                      freshnessBadge = "bg-red-50 text-red-700 border-red-200";
                    } else if (ageDays > 14) {
                      freshnessStatus = "Needs Review";
                      freshnessBadge = "bg-amber-50 text-amber-700 border-amber-200";
                    }
                  } else if (post.contentType === "seasonal") {
                    if (ageDays > 45) {
                      freshnessStatus = "Needs Review";
                      freshnessBadge = "bg-amber-50 text-amber-700 border-amber-200";
                    }
                  } else if (ageDays > 180) {
                    freshnessStatus = "Needs Review";
                    freshnessBadge = "bg-amber-50 text-amber-700 border-amber-200";
                  }

                  return (
                    <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Post Thumbnail & Title */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-12 h-8 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-gray-900 truncate" title={post.title}>
                                {post.title}
                              </h4>
                              {post.generatedByAi && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[9px] font-bold flex-shrink-0">
                                  AI
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 truncate block">
                              /blog/{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">
                          {post.category}
                        </span>
                      </td>

                      {/* Season */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                          isSet18 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-zinc-50 text-zinc-600 border-zinc-200"
                        }`}>
                          {isSet18 ? "Mùa 18" : "Evergreen"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {post.status === "published" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Xuất bản</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Bản nháp</span>
                          </span>
                        )}
                      </td>

                      {/* Content Type */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-gray-500 capitalize">
                        {post.contentType}
                      </td>

                      {/* Patch */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold">
                        {post.patch ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {post.patch}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Freshness Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${freshnessBadge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            freshnessStatus === "Fresh" ? "bg-emerald-500" : freshnessStatus === "Needs Review" ? "bg-amber-500" : "bg-red-500"
                          }`} />
                          <span>{freshnessStatus}</span>
                        </span>
                      </td>

                      {/* SEO Status Check */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isSeoOk ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đạt chuẩn</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium flex items-center gap-1 text-[11px]" title={`Title: ${titleLen} ký tự, Desc: ${descLen} ký tự`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Cần chỉnh</span>
                          </span>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-[11px]">
                        {new Date(post.updatedAt || post.publishedAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === "published" && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Xem trang web"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDuplicate(post)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Tạo bản sao"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Chỉnh sửa bài"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* POST EDITOR MODAL / SLIDE-OVER                                 */}
      {/* ============================================================== */}
      {editorOpen && editingPost && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Editor Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-gray-100 text-gray-900">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900">
                    {editingPost.id ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Hệ thống tự động tính thời gian đọc và kiểm tra độ dài SEO
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Tab Switcher */}
            <div className="px-5 pt-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setEditorTab("content")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  editorTab === "content"
                    ? "border-gray-950 text-gray-950"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Nội dung bài viết
              </button>
              <button
                onClick={() => setEditorTab("seo")}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  editorTab === "seo"
                    ? "border-gray-950 text-gray-950"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Cấu hình SEO & Preview
              </button>
            </div>

            {/* Editor Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {editorTab === "content" && (
                <div className="space-y-4">
                  {/* AI Banner Notice if generated by AI */}
                  {(editingPost.generatedByAi || aiGeneratedNotice) && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-purple-900 font-medium">
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span>✨ Bài viết được tạo bằng AI — hãy kiểm tra nội dung trước khi xuất bản.</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenAiModal("rewrite")}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Viết lại bằng AI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAiModal("seo_only")}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Tối ưu SEO
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Title & Slug */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Tiêu đề bài viết (H1)</label>
                    <input
                      type="text"
                      value={editingPost.title || ""}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingPost((prev) => ({
                          ...prev,
                          title: newTitle,
                          slug: prev?.slug ? prev.slug : slugify(newTitle),
                        }));
                      }}
                      placeholder="VD: Top Đội Hình Mạnh Nhất TFT Mùa 18..."
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Đường dẫn tĩnh (Slug URL)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">/blog/</span>
                      <input
                        type="text"
                        value={editingPost.slug || ""}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        placeholder="top-doi-hinh-manh-tft-mua-18"
                        className="flex-1 px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
                      />
                    </div>
                  </div>

                  {/* Metadata Row: Category, Status, ContentType, Patch */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Chuyên mục</label>
                      <select
                        value={editingPost.category || "TFT Mùa 18"}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            category: e.target.value as BlogPostCategory,
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50"
                      >
                        {BLOG_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Trạng thái</label>
                      <select
                        value={editingPost.status || "draft"}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            status: e.target.value as BlogPostStatus,
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50"
                      >
                        <option value="draft">Bản nháp (Draft)</option>
                        <option value="published">Xuất bản (Published)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Loại nội dung</label>
                      <select
                        value={editingPost.contentType || "seasonal"}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            contentType: e.target.value as BlogContentType,
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50"
                      >
                        <option value="seasonal">Theo mùa (Seasonal)</option>
                        <option value="patch-sensitive">Theo bản vá (Patch-sensitive)</option>
                        <option value="evergreen">Trường tồn (Evergreen)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Phiên bản Patch</label>
                      <input
                        type="text"
                        value={editingPost.patch || ""}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            patch: e.target.value,
                          }))
                        }
                        placeholder="VD: 18.3b"
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Đoạn tóm tắt (Excerpt)</label>
                    <textarea
                      rows={2}
                      value={editingPost.excerpt || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => ({
                          ...prev,
                          excerpt: e.target.value,
                        }))
                      }
                      placeholder="Mô tả ngắn gọn về nội dung bài viết..."
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                    />
                  </div>

                  {/* Cover Image & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">URL Ảnh đại diện (Cover Image)</label>
                      <input
                        type="text"
                        value={editingPost.coverImage || ""}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            coverImage: e.target.value,
                          }))
                        }
                        placeholder="/banner-seo.jpg hoặc https://..."
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                      />
                      {editingPost.suggestedCoverPrompt && (
                        <p className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-100 flex items-start gap-1.5 leading-relaxed mt-1">
                          <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-purple-600" />
                          <span><strong>Gợi ý AI cho ảnh bìa:</strong> {editingPost.suggestedCoverPrompt}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">Thẻ Tags (phân cách bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={editingPost.tags?.join(", ") || ""}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                          }))
                        }
                        placeholder="tft mùa 18, meta 18.3b, ahri..."
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                      />
                    </div>
                  </div>

                  {/* Markdown Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">
                        Nội dung chi tiết (Hỗ trợ Markdown: ## H2, ### H3, - list, bảng |)
                      </label>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {calculateReadingTime(editingPost.content || "")}
                      </span>
                    </div>
                    <textarea
                      rows={14}
                      value={editingPost.content || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl font-mono leading-relaxed focus:outline-hidden focus:border-gray-900"
                    />

                    {/* Internal Links Đề Xuất (Cluster SEO) */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-gray-500" />
                          <span>Internal links đề xuất (Bấm [Thêm] để chèn liên kết):</span>
                        </span>
                        <span className="text-[11px] text-gray-400">SEO Topic Cluster</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { label: "TFT Mùa 18 Hub", url: "/blog/tft-mua-18" },
                          { label: "Dịch Vụ Thuê Acc", url: "/thue-acc-tft-dtcl" },
                          { label: "Kho Acc TFT", url: "/shop" },
                          { label: "Đổi Thông Tin Riot", url: "/huong-dan/doi-thong-tin-acc-riot" },
                          ...posts
                            .filter((p) => p.id !== editingPost.id && p.status === "published")
                            .slice(0, 3)
                            .map((p) => ({ label: p.title, url: `/blog/${p.slug}` })),
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const snippet = `\n\nTham khảo thêm tại [${item.label}](${item.url}).\n`;
                              setEditingPost((prev) => ({
                                ...prev,
                                content: (prev?.content || "") + snippet,
                              }));
                              toast.success(`Đã thêm link: ${item.label}`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] text-gray-700 hover:text-black font-medium transition-colors cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[140px]">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "seo" && (
                <div className="space-y-5">
                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">SEO Meta Title</label>
                      <span
                        className={`text-[11px] font-mono ${
                          (editingPost.seo?.title || editingPost.title || "").length > 70
                            ? "text-red-500 font-bold"
                            : "text-gray-500"
                        }`}
                      >
                        {(editingPost.seo?.title || editingPost.title || "").length} / 65 ký tự khuyến nghị
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingPost.seo?.title || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => ({
                          ...prev,
                          seo: { ...(prev?.seo || {}), title: e.target.value },
                        }))
                      }
                      placeholder={editingPost.title || "Mặc định lấy tiêu đề bài viết..."}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">SEO Meta Description</label>
                      <span
                        className={`text-[11px] font-mono ${
                          (editingPost.seo?.description || editingPost.excerpt || "").length > 175
                            ? "text-red-500 font-bold"
                            : "text-gray-500"
                        }`}
                      >
                        {(editingPost.seo?.description || editingPost.excerpt || "").length} / 160 ký tự khuyến nghị
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={editingPost.seo?.description || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => ({
                          ...prev,
                          seo: { ...(prev?.seo || {}), description: e.target.value },
                        }))
                      }
                      placeholder={editingPost.excerpt || "Mặc định lấy phần tóm tắt bài viết..."}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                    />
                  </div>

                  {/* Canonical URL & Noindex */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Canonical URL Override</label>
                      <input
                        type="text"
                        value={editingPost.seo?.canonical || ""}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            seo: { ...(prev?.seo || {}), canonical: e.target.value },
                          }))
                        }
                        placeholder={`https://www.shoptftmobile.net/blog/${editingPost.slug || ""}`}
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingPost.seo?.noindex)}
                          onChange={(e) =>
                            setEditingPost((prev) => ({
                              ...prev,
                              seo: { ...(prev?.seo || {}), noindex: e.target.checked },
                            }))
                          }
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="font-semibold text-red-600">Chặn index (Noindex)</span>
                      </label>
                    </div>
                  </div>

                  {/* Google SERP Preview */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem trước trên kết quả tìm kiếm Google</span>
                    </span>

                    <div className="space-y-1">
                      <div className="text-[11px] text-gray-600 flex items-center gap-1">
                        <span className="font-semibold text-gray-800">ShopTFTMobile</span>
                        <span>›</span>
                        <span className="truncate">https://www.shoptftmobile.net/blog/{editingPost.slug || "slug"}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-blue-800 leading-snug line-clamp-1">
                        {editingPost.seo?.title || editingPost.title || "Tiêu đề bài viết trên Google"}
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                        {editingPost.seo?.description || editingPost.excerpt || "Mô tả bài viết sẽ hiển thị tại đây khi người dùng tìm kiếm trên Google."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
              <span className="text-xs text-gray-500">
                {editingPost.status === "published" ? "Trạng thái: Sẽ công khai trên website" : "Trạng thái: Lưu dưới dạng nháp (Draft)"}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-white transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu bài viết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AI BLOG GENERATOR MODAL                                        */}
      {/* ============================================================== */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900">
                    {aiMode === "rewrite"
                      ? "Viết lại bài viết bằng AI"
                      : aiMode === "seo_only"
                      ? "Tối ưu SEO bằng AI"
                      : "Tạo bài viết bằng AI"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Mô tả nội dung bạn muốn viết, AI sẽ tạo bài và tự điền toàn bộ form.
                  </p>
                </div>
              </div>

              <button
                onClick={() => !aiGenerating && setAiModalOpen(false)}
                disabled={aiGenerating}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Main Topic Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">
                    {aiMode === "seo_only" ? "Gợi ý định hướng SEO:" : "Bạn muốn viết bài gì?"}
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {aiTopic.length}/1000 ký tự
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value.slice(0, 1000))}
                  disabled={aiGenerating}
                  placeholder="VD: Viết bài hướng dẫn đội hình Ahri TFT Mùa 18 patch 18.3, gồm đội hình, trang bị, cách chơi đầu/trận/late game, ưu nhược điểm và FAQ."
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-2xl focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 leading-relaxed disabled:bg-gray-50"
                />
              </div>

              {/* Advanced Options Accordion */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => setAiShowAdvanced(!aiShowAdvanced)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Tùy chọn nâng cao</span>
                  </span>
                  {aiShowAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {aiShowAdvanced && (
                  <div className="p-4 pt-1 border-t border-gray-100 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Chuyên mục */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600">Chuyên mục</label>
                        <select
                          value={aiCategory}
                          onChange={(e) => setAiCategory(e.target.value as any)}
                          disabled={aiGenerating}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-hidden"
                        >
                          <option value="auto">Tự động nhận diện</option>
                          {BLOG_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Loại nội dung */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600">Loại nội dung</label>
                        <select
                          value={aiContentType}
                          onChange={(e) => setAiContentType(e.target.value as any)}
                          disabled={aiGenerating}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-hidden"
                        >
                          <option value="auto">Tự động nhận diện</option>
                          <option value="seasonal">Seasonal (Theo Mùa 18)</option>
                          <option value="patch-sensitive">Patch-sensitive (Theo Bản vá)</option>
                          <option value="evergreen">Evergreen (Vĩnh viễn/Hướng dẫn)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Patch */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600">Phiên bản Patch</label>
                        <input
                          type="text"
                          value={aiPatch}
                          onChange={(e) => setAiPatch(e.target.value)}
                          disabled={aiGenerating}
                          placeholder="Auto hoặc nhập VD: 18.3b"
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden"
                        />
                      </div>

                      {/* Độ dài bài viết */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-600">Độ dài bài viết</label>
                        <select
                          value={aiLength}
                          onChange={(e) => setAiLength(e.target.value as any)}
                          disabled={aiGenerating}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-hidden"
                        >
                          <option value="short">Ngắn (~800 - 1.200 từ)</option>
                          <option value="standard">Tiêu chuẩn (~1.500 - 2.000 từ)</option>
                          <option value="deep">Chuyên sâu (~2.500+ từ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional API Key Override */}
                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI API Key (Tùy chọn ghi đè Gemini / OpenAI / Groq)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAiKeyInput(!showAiKeyInput)}
                          className="text-[10px] text-purple-600 hover:underline cursor-pointer"
                        >
                          {showAiKeyInput ? "Ẩn" : "Nhập key riêng"}
                        </button>
                      </div>
                      {showAiKeyInput && (
                        <input
                          type="password"
                          value={aiApiKey}
                          onChange={(e) => setAiApiKey(e.target.value)}
                          placeholder="Nhập AIzaSy... hoặc sk-... (tự động lưu vào trình duyệt)"
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden"
                        />
                      )}
                      <p className="text-[10px] text-gray-400">
                        Hệ thống mặc định sử dụng server AI key hoặc bộ tổng hợp tự động nếu chưa cấu hình key riêng.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              {aiGenerating && (
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    <span className="text-xs font-semibold text-purple-900">
                      {aiProgressStep || "Đang khởi tạo tiến trình tạo bài..."}
                    </span>
                  </div>
                  <div className="w-full bg-purple-200/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 h-full w-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                disabled={aiGenerating}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-700 hover:via-indigo-700 hover:to-amber-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo nội dung...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {aiMode === "rewrite"
                        ? "✨ Viết lại bài viết"
                        : aiMode === "seo_only"
                        ? "✨ Tối ưu SEO"
                        : "✨ Tạo bài viết"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
