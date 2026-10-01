"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  Link2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Plus,
  Upload,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  FileText,
  Share2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Check,
  X,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import {
  BacklinkMonitorReport,
  BacklinkItem,
  BrandMentionItem,
  LinkableAssetItem,
  BacklinkStatus,
  BacklinkType,
} from "@/utils/seo-shared";
import toast from "react-hot-toast";

interface BacklinksTabProps {
  report: BacklinkMonitorReport | null;
  onRefresh?: () => void;
  onAddBacklink?: (item: Omit<BacklinkItem, "id" | "firstSeen" | "lastSeen">) => Promise<boolean>;
  onUpdateBacklink?: (id: string, updates: Partial<BacklinkItem>) => Promise<boolean>;
  onDeleteBacklink?: (id: string) => Promise<boolean>;
  onImportCsv?: (csvContent: string) => Promise<{ importedCount: number; errors: string[] }>;
}

export function BacklinksTab({
  report,
  onRefresh,
  onAddBacklink,
  onUpdateBacklink,
  onDeleteBacklink,
  onImportCsv,
}: BacklinksTabProps) {
  const [subTab, setSubTab] = useState<"all" | "active" | "redirect" | "broken" | "mentions" | "assets">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklinkItem | null>(null);

  // Form states for manual add
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [formTargetUrl, setFormTargetUrl] = useState("https://www.shoptftmobile.net/");
  const [formAnchorText, setFormAnchorText] = useState("ShopTFTMobile");
  const [formType, setFormType] = useState<BacklinkType>("dofollow");
  const [formStatus, setFormStatus] = useState<BacklinkStatus>("active");
  const [formCategory, setFormCategory] = useState<BacklinkItem["authorityCategory"]>("community");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // CSV Import state
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
        <Globe className="w-8 h-8 text-gray-400 mx-auto animate-pulse" />
        <p className="text-xs text-gray-500 font-medium">Đang tải báo cáo Backlink Monitor...</p>
      </div>
    );
  }

  const { summary, backlinks, brandMentions, linkableAssets, brokenTargets, topLinkedPages } = report;

  // Filtered backlinks
  const filteredBacklinks = useMemo(() => {
    return backlinks.filter((b) => {
      // SubTab filter
      if (subTab === "active" && b.status !== "active") return false;
      if (subTab === "redirect" && b.status !== "301_redirect") return false;
      if (subTab === "broken" && b.status !== "broken" && b.status !== "lost") return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesSource = b.sourceUrl.toLowerCase().includes(q) || b.sourceDomain.toLowerCase().includes(q);
        const matchesTarget = b.targetUrl.toLowerCase().includes(q);
        const matchesAnchor = b.anchorText.toLowerCase().includes(q);
        const matchesNotes = (b.notes || "").toLowerCase().includes(q);
        if (!matchesSource && !matchesTarget && !matchesAnchor && !matchesNotes) return false;
      }

      return true;
    });
  }, [backlinks, subTab, searchTerm]);

  // Submit manual add
  const handleSaveBacklink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSourceUrl.trim() || !formTargetUrl.trim()) {
      toast.error("Vui lòng nhập Source URL và Target URL!");
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        if (onUpdateBacklink) {
          await onUpdateBacklink(editingItem.id, {
            sourceUrl: formSourceUrl.trim(),
            targetUrl: formTargetUrl.trim(),
            anchorText: formAnchorText.trim(),
            type: formType,
            status: formStatus,
            authorityCategory: formCategory,
            notes: formNotes.trim(),
          });
          toast.success("Đã cập nhật backlink!");
        }
      } else {
        if (onAddBacklink) {
          await onAddBacklink({
            sourceUrl: formSourceUrl.trim(),
            sourceDomain: "",
            targetUrl: formTargetUrl.trim(),
            anchorText: formAnchorText.trim(),
            type: formType,
            status: formStatus,
            authorityCategory: formCategory,
            notes: formNotes.trim(),
          });
          toast.success("Đã thêm backlink mới!");
        }
      }
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi thao tác");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: BacklinkItem) => {
    setEditingItem(item);
    setFormSourceUrl(item.sourceUrl);
    setFormTargetUrl(item.targetUrl);
    setFormAnchorText(item.anchorText);
    setFormType(item.type);
    setFormStatus(item.status);
    setFormCategory(item.authorityCategory);
    setFormNotes(item.notes || "");
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi backlink này khỏi danh sách theo dõi?")) return;
    try {
      if (onDeleteBacklink) {
        await onDeleteBacklink(id);
        toast.success("Đã xóa backlink!");
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast.error("Không thể xóa backlink!");
    }
  };

  const resetForm = () => {
    setFormSourceUrl("");
    setFormTargetUrl("https://www.shoptftmobile.net/");
    setFormAnchorText("ShopTFTMobile");
    setFormType("dofollow");
    setFormStatus("active");
    setFormCategory("community");
    setFormNotes("");
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) {
      toast.error("Vui lòng dán nội dung CSV!");
      return;
    }
    try {
      setImporting(true);
      if (onImportCsv) {
        const res = await onImportCsv(csvText);
        if (res.importedCount > 0) {
          toast.success(`Đã import thành công ${res.importedCount} backlink!`);
          setShowImportModal(false);
          setCsvText("");
          if (onRefresh) onRefresh();
        } else {
          toast.error(res.errors.join(", ") || "Không có dữ liệu hợp lệ để import!");
        }
      }
    } catch (err: any) {
      toast.error("Lỗi khi import CSV!");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
              <Globe className="w-4 h-4" />
            </span>
            <h2 className="font-heading font-bold text-sm text-gray-900">
              Giám Sát External Authority & Backlink Off-Site
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi referring domains, backlink tên miền cũ .com qua 301, brand mentions và các asset hút liên kết tự nhiên.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Backlink</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import CSV</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Referring Domains & Backlinks */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Referring Domains</span>
            <Globe className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-gray-900">
              {summary.totalReferringDomains}
            </span>
            <span className="text-xs text-gray-500">từ {summary.totalBacklinks} links</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-600 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
              {summary.dofollowCount} Dofollow
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
              {summary.nofollowCount} Nofollow
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
              {summary.ugcCount} UGC
            </span>
          </div>
        </div>

        {/* Card 2: Old .COM Backlinks Preserved */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Backlink Domain Cũ .com</span>
            <Share2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-emerald-600">
              {summary.oldDomainResolvedCount} / {summary.oldDomainComCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">100% 301 bảo toàn</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            Mọi link cũ trỏ shoptftmobile.com được 301 chuẩn sang .net, không mất link equity.
          </p>
        </div>

        {/* Card 3: Brand Mentions */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Brand Mentions</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-purple-600">
              {brandMentions.length}
            </span>
            <span className="text-xs text-gray-500">lượt nhắc thực tế</span>
          </div>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{brandMentions.filter((m) => m.hasLink).length} có link</span>
            <span className="mx-1 text-gray-300">•</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{brandMentions.filter((m) => !m.hasLink).length} unlinked mention</span>
          </div>
        </div>

        {/* Card 4: Broken & Lost Links */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Broken / Lost Backlinks</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-amber-600">
              {summary.brokenCount + summary.lostCount}
            </span>
            <span className="text-xs text-gray-500">
              ({summary.brokenCount} broken, {summary.lostCount} lost)
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            {brokenTargets.length > 0
              ? `Có ${brokenTargets.length} target 404 cần cấu hình 301 để phục hồi link equity.`
              : "Không có link gãy cần phục hồi."}
          </p>
        </div>
      </div>

      {/* 3. Broken Target Alert / Recovery Callout */}
      {brokenTargets.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Phát hiện liên kết ngoài trỏ vào trang 404 (Broken Backlink Opportunity)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Bên ngoài đang có backlink trỏ về{" "}
                <span className="font-mono font-semibold">{brokenTargets[0].targetUrl}</span>. Hãy thêm quy tắc 301 trỏ về{" "}
                <span className="font-mono font-semibold text-emerald-800">{brokenTargets[0].suggestedRedirect}</span> trong Tab Redirect để không bỏ phí sức mạnh liên kết!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Navigation Tabs & Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setSubTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === "all" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả ({backlinks.length})
          </button>
          <button
            onClick={() => setSubTab("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === "active" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Đang hoạt động ({summary.activeCount})
          </button>
          <button
            onClick={() => setSubTab("redirect")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === "redirect" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            301 từ .com ({summary.redirectCount})
          </button>
          <button
            onClick={() => setSubTab("broken")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === "broken" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Broken & Lost ({summary.brokenCount + summary.lostCount})
          </button>
          <button
            onClick={() => setSubTab("mentions")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === "mentions" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Brand Mentions ({brandMentions.length})
          </button>
          <button
            onClick={() => setSubTab("assets")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              subTab === "assets" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Linkable Assets ({linkableAssets.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo source, target, anchor..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
          />
        </div>
      </div>

      {/* 5. Main Content Area */}
      {subTab === "mentions" ? (
        /* TAB VIEW: BRAND MENTIONS */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-heading font-bold text-xs text-gray-900 uppercase tracking-wider">
              Danh Sách Brand Mentions Được Theo Dõi
            </h3>
            <span className="text-xs text-gray-500">{brandMentions.length} mentions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {brandMentions.map((bm) => (
              <div key={bm.id} className="p-4 hover:bg-gray-50/50 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] uppercase">
                      {bm.mentionedBrand}
                    </span>
                    <a
                      href={bm.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>{bm.sourceDomain}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {bm.hasLink ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã có Hyperlink
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold flex items-center gap-1">
                        <Info className="w-3 h-3" /> Unlinked Mention
                      </span>
                    )}

                    {bm.outreachPotential === "recommended" && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        Gợi ý Outreach
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border border-gray-100 leading-relaxed">
                  &ldquo;{bm.contextSnippet}&rdquo;
                </div>

                {bm.notes && (
                  <p className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">Khuyến nghị:</span> {bm.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : subTab === "assets" ? (
        /* TAB VIEW: LINKABLE ASSETS */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-xs text-gray-900 uppercase tracking-wider">
                Nội Dung Hút Backlink Tự Nhiên (Link-Worthy Content Assets)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Các trang tài nguyên sâu, cung cấp dữ liệu thật và công cụ để cộng đồng tự nguyện trích dẫn.
              </p>
            </div>
            <span className="text-xs text-gray-500">{linkableAssets.length} assets</span>
          </div>

          <div className="divide-y divide-gray-100">
            {linkableAssets.map((asset) => (
              <div key={asset.slug} className="p-4 hover:bg-gray-50/50 transition-colors space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold text-[10px] uppercase">
                      {asset.category}
                    </span>
                    <a
                      href={`https://www.shoptftmobile.net${asset.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>{asset.title}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-mono text-xs font-semibold self-start sm:self-auto">
                    {asset.referringDomainsCount} referring domains
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-700">Giá trị tham khảo:</span> {asset.whyLinkable}
                </p>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-gray-500 font-medium">Anchor tự nhiên:</span>
                  {asset.naturalAnchorExamples.map((ex, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-mono">
                      &quot;{ex}&quot;
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TAB VIEW: BACKLINK TABLE */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-heading font-bold text-xs text-gray-900 uppercase tracking-wider">
              Bảng Theo Dõi Backlink ({filteredBacklinks.length} bản ghi)
            </h3>
            <span className="text-[11px] text-gray-500">Cập nhật: {new Date(report.timestamp).toLocaleDateString("vi-VN")}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="p-3 pl-4">Nguồn (Source Domain & URL)</th>
                  <th className="p-3">Trang Đích (Target URL)</th>
                  <th className="p-3">Anchor Text</th>
                  <th className="p-3">Kiểu Link</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Ngày Phát Hiện</th>
                  <th className="p-3 pr-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBacklinks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-gray-500">
                      Không tìm thấy backlink nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredBacklinks.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Source */}
                      <td className="p-3 pl-4">
                        <div className="space-y-0.5 max-w-[220px]">
                          <div className="font-bold text-gray-900 truncate">{b.sourceDomain}</div>
                          <a
                            href={b.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline truncate block"
                            title={b.sourceUrl}
                          >
                            {b.sourceUrl}
                          </a>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="p-3">
                        <div className="max-w-[200px] truncate font-mono text-[11px] text-gray-700">
                          {b.targetUrl.includes("shoptftmobile.com") ? (
                            <span className="text-amber-700 font-semibold" title="Domain cũ .com (đã 301 sang .net)">
                              {b.targetUrl}
                            </span>
                          ) : (
                            b.targetUrl.replace("https://www.shoptftmobile.net", "") || "/"
                          )}
                        </div>
                        {b.targetUrl.includes("shoptftmobile.com") && (
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            ➔ 301 bảo toàn .net
                          </span>
                        )}
                      </td>

                      {/* Anchor */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-medium text-[11px]">
                          {b.anchorText}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            b.type === "dofollow"
                              ? "bg-emerald-50 text-emerald-700"
                              : b.type === "nofollow"
                              ? "bg-gray-100 text-gray-600"
                              : b.type === "ugc"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {b.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {b.status === "active" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                        {b.status === "301_redirect" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                            <Share2 className="w-3 h-3" /> 301 Redirect
                          </span>
                        )}
                        {b.status === "broken" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold">
                            <AlertCircle className="w-3 h-3" /> Broken (404)
                          </span>
                        )}
                        {b.status === "lost" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                            <X className="w-3 h-3" /> Lost
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3 text-[11px] text-gray-500 font-mono">
                        {new Date(b.firstSeen).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(b)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(b.id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Off-Site SEO Policy & Ethics Guidelines Box */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
            Chiến Lược & Nguyên Tắc Off-Site SEO Chuẩn E-E-A-T (Chống Phạt Thuật Toán)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>1. Tuyệt đối không Spam</span>
            </h4>
            <p>
              Không mua gói backlink tự động, không mạng PBN, không spam comment diễn đàn. Mọi backlink đều xuất phát từ hồ sơ thật hoặc bài trích dẫn tự nhiên.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-teal-300 flex items-center gap-1.5">
              <span>2. Quyết định Local SEO Online-Only</span>
            </h4>
            <p>
              Shop hoạt động 100% online giao dịch Zalo. Tuyệt đối không tạo địa chỉ Google Business ảo để đánh lừa thuật toán vị trí địa lý.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
              <span>3. Outreach Tự Nhiên & Giá Trị Thật</span>
            </h4>
            <p>
              Không gửi email xin link dofollow hàng loạt. Chỉ tiếp cận cộng đồng khi có cẩm nang Mùa 18 hoặc tài liệu đổi bảo mật Riot hữu ích cho độc giả.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Modal: Thêm / Sửa Backlink */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-sm text-gray-900">
                {editingItem ? "Chỉnh sửa Backlink" : "Thêm Backlink Mới Vào Theo Dõi"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBacklink} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase">Nguồn (Source URL) *</label>
                <input
                  type="url"
                  required
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  placeholder="https://community-tft.example/post/123"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase">Trang Đích (Target URL) *</label>
                <input
                  type="text"
                  required
                  value={formTargetUrl}
                  onChange={(e) => setFormTargetUrl(e.target.value)}
                  placeholder="https://www.shoptftmobile.net/blog/tft-mua-18"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase">Anchor Text</label>
                  <input
                    type="text"
                    value={formAnchorText}
                    onChange={(e) => setFormAnchorText(e.target.value)}
                    placeholder="ShopTFTMobile"
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase">Kiểu Link</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as BacklinkType)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="dofollow">Dofollow</option>
                    <option value="nofollow">Nofollow</option>
                    <option value="ugc">UGC (Cộng đồng)</option>
                    <option value="brand_mention">Brand Mention</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase">Trạng Thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as BacklinkStatus)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="active">Active (Hoạt động)</option>
                    <option value="301_redirect">301 Redirect (Bảo toàn)</option>
                    <option value="broken">Broken (404 cần sửa)</option>
                    <option value="lost">Lost (Đã mất)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase">Danh Mục Nguồn</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="profile">Hồ sơ chính thức (Profile)</option>
                    <option value="community">Cộng đồng / Mạng xã hội</option>
                    <option value="guide">Cẩm nang / Trích dẫn</option>
                    <option value="legacy_com">Tên miền cũ .com</option>
                    <option value="partner">Đối tác / Creator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase">Ghi Chú Đánh Giá</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú nguồn, bối cảnh bài viết..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Đang lưu..." : editingItem ? "Cập Nhật" : "Thêm Bản Ghi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Import Danh Sách Backlink Từ CSV / Text
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                Dán các dòng theo định dạng sau (có thể sao chép trực tiếp từ Excel hoặc Google Sheets):
              </p>
              <div className="p-2.5 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                Source,Target,Anchor,Type,Status,Notes<br />
                https://diendan.vn/thread,https://www.shoptftmobile.net/,ShopTFTMobile,dofollow,active,Backlink bài ghim
              </div>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Dán các dòng dữ liệu vào đây..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={importing}
                className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
              >
                {importing ? "Đang xử lý..." : "Tiến Hành Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
