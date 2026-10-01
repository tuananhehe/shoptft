"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  Layers,
  Split,
  Eye,
  Link2,
  ShieldCheck,
  BookOpen,
  Filter,
  CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ContentOpportunityItem,
  ContentBrief,
  ContentOpportunityAction,
  ContentOpportunityPriority,
  SearchIntentType,
} from "@/utils/seo-shared";

interface ContentOpportunitiesTabProps {
  opportunities?: ContentOpportunityItem[];
  briefs?: ContentBrief[];
  onRefresh?: () => void;
}

export function ContentOpportunitiesTab({
  opportunities = [],
  briefs = [],
  onRefresh,
}: ContentOpportunitiesTabProps) {
  const [selectedActionFilter, setSelectedActionFilter] = useState<
    "all" | ContentOpportunityAction
  >("all");
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<
    "all" | SearchIntentType
  >("all");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<
    "all" | ContentOpportunityPriority
  >("all");

  const [activeBrief, setActiveBrief] = useState<ContentBrief | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Filter opportunities
  const filteredList = opportunities.filter((item) => {
    const matchAction =
      selectedActionFilter === "all" || item.recommendedAction === selectedActionFilter;
    const matchIntent =
      selectedIntentFilter === "all" || item.intent === selectedIntentFilter;
    const matchPriority =
      selectedPriorityFilter === "all" || item.priority === selectedPriorityFilter;
    return matchAction && matchIntent && matchPriority;
  });

  const highCount = opportunities.filter((o) => o.priority === "HIGH").length;
  const optExistingCount = opportunities.filter(
    (o) => o.recommendedAction === "Optimize Existing"
  ).length;
  const newCandidateCount = opportunities.filter(
    (o) => o.recommendedAction === "Create Article" || o.recommendedAction === "Create Guide"
  ).length;

  const handleOpenBrief = (opp: ContentOpportunityItem) => {
    if (opp.briefId) {
      const found = briefs.find((b) => b.id === opp.briefId);
      if (found) {
        setActiveBrief(found);
        return;
      }
    }

    // Dynamic brief creation if not pre-seeded
    const dynamicBrief: ContentBrief = {
      id: `dynamic-${opp.id}`,
      primaryQuery: opp.query,
      secondaryQueries: [`${opp.query} mới nhất`, `${opp.query} uy tín`, `${opp.query} hướng dẫn`],
      searchIntent: opp.intent,
      targetUrl: opp.existingPage || `/blog/${opp.query.toLowerCase().replace(/\s+/g, "-")}`,
      existingCompetingPages: opp.existingPage ? [opp.existingPage] : ["/blog/tft-mua-18"],
      requiredSections: [
        "1. Tổng quan Search Intent và nhu cầu người chơi",
        "2. Hướng dẫn chi tiết từng bước (Step-by-step)",
        "3. Bảng so sánh quyền lợi hoặc điểm rơi sức mạnh",
        "4. Liên kết tới kho tài khoản thực tế tại ShopTFTMobile",
      ],
      internalLinksIncoming: [{ page: "/blog/tft-mua-18", anchorText: opp.query }],
      internalLinksOutgoing: [
        { target: "/shop", anchorText: "kho acc TFT" },
        { target: "/thue-acc-tft-dtcl", anchorText: "thuê acc TFT" },
      ],
      contentType: opp.intent === "Guide" ? "guide" : opp.intent === "Commercial" ? "commercial_landing" : "blog_article",
      patchOrSeason: "TFT Mùa 18",
      freshnessRequirement: "Đánh giá lại mỗi khi Riot cập nhật patch cân bằng.",
      uniqueValueChecklist: [
        "Có dẫn chứng cụ thể từ game",
        "Có liên kết trực tiếp tới tài khoản sẵn sàng thuê",
        "Hình minh họa chuẩn UI không copy",
      ],
      status: "backlog",
      aiDraftProposal: {
        title: `${opp.query.charAt(0).toUpperCase() + opp.query.slice(1)} | ShopTFTMobile`,
        metaDescription: `Cẩm nang chi tiết về ${opp.query} tại ShopTFTMobile. Hướng dẫn chuẩn xác, phân tích chuyên sâu và hỗ trợ nhanh chóng qua Zalo.`,
        outline: [
          `Khái niệm và ý nghĩa của ${opp.query}`,
          "Phân tích chuyên sâu cho người chơi",
          "Cách áp dụng thực tế khi leo rank",
          "Tài khoản đề xuất liên quan",
        ],
        draftPreview: `Dựa trên dữ liệu tìm kiếm thực tế về ${opp.query}, nội dung này được biên soạn nhằm giải đáp trọn vẹn thắc mắc của người chơi...`,
      },
    };
    setActiveBrief(dynamicBrief);
  };

  const copyText = (text: string, type: "title" | "desc" | "brief") => {
    navigator.clipboard.writeText(text);
    if (type === "title") {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else if (type === "desc") {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    } else {
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    }
    toast.success("Đã copy vào bộ nhớ tạm!");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="font-heading font-bold text-sm sm:text-base text-gray-900">
              Mở Rộng Nội Dung Dựa Trên Truy Vấn Thực Tế (Content Opportunities)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Khai phá từ khóa từ dữ liệu Search Console thật. Tuân thủ nghiêm ngặt nguyên tắc: Ưu tiên tối ưu trang hiện có trước khi tạo trang mới, yêu cầu Content Brief trước khi AI soạn Draft, và Admin duyệt trước khi Publish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Rule Checklist Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1 text-xs">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>1. Existing Page First</span>
          </div>
          <p className="text-blue-700 text-[11px] leading-relaxed">
            Nếu query đã có trang đáp ứng tốt intent ({optExistingCount} từ khóa), ưu tiên cập nhật section, title và internal link; không tạo duplicate URL.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1 text-xs">
          <div className="font-bold text-purple-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>2. Bắt Buộc Có Content Brief</span>
          </div>
          <p className="text-purple-700 text-[11px] leading-relaxed">
            AI không được viết bài tùy tiện. Mọi bài viết mới ({newCandidateCount} bài đề xuất) phải có brief định hình Search Intent, Outline và Internal Link trước.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1 text-xs">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>3. Không Tạo Rác Cosmetic</span>
          </div>
          <p className="text-amber-700 text-[11px] leading-relaxed">
            Không tự động tạo hàng loạt trang <code className="font-mono">/pet/[name]</code> hay <code className="font-mono">/arena/[name]</code> nếu chưa có search demand thực tế chứng minh.
          </p>
        </div>
      </div>

      {/* 3. Opportunities Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Bảng Khai Thác Truy Vấn (SEO → Content Opportunities)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Phân loại rõ Intent, đánh giá trang hiện tại, lượng tìm kiếm và hành động đề xuất.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Action */}
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">Tất cả hành động</option>
              <option value="Optimize Existing">Tối ưu trang hiện có</option>
              <option value="Create Article">Tạo bài Blog mới</option>
              <option value="Create Guide">Tạo bài Hướng Dẫn mới</option>
              <option value="Monitor">Theo dõi thêm</option>
              <option value="Ignore">Bỏ qua (Không liên quan)</option>
            </select>

            {/* Filter Intent */}
            <select
              value={selectedIntentFilter}
              onChange={(e) => setSelectedIntentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">Tất cả Search Intent</option>
              <option value="Commercial">Commercial (Thương mại)</option>
              <option value="Informational">Informational (Thông tin/Meta)</option>
              <option value="Discovery">Discovery (Pet/Chibi/Sân Đấu)</option>
              <option value="Guide">Guide (Hướng dẫn Riot)</option>
              <option value="Brand">Brand (Thương hiệu)</option>
            </select>

            {/* Filter Priority */}
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="HIGH">Ưu tiên CAO ({highCount})</option>
              <option value="MEDIUM">Ưu tiên VỪA</option>
              <option value="LOW">Ưu tiên THẤP</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Truy vấn (Query)</th>
                <th className="py-3 px-3">Intent</th>
                <th className="py-3 px-4">Trang hiện tại (Existing Page)</th>
                <th className="py-3 px-3 text-right">Imp</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Vị trí</th>
                <th className="py-3 px-3 text-center">Hành động đề xuất</th>
                <th className="py-3 px-3 text-center">Ưu tiên</th>
                <th className="py-3 px-4 text-center">Content Brief</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">
                    Không có cơ hội nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredList.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{opp.query}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                        {opp.reason}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          opp.intent === "Commercial"
                            ? "bg-emerald-100 text-emerald-800"
                            : opp.intent === "Informational"
                            ? "bg-blue-100 text-blue-800"
                            : opp.intent === "Discovery"
                            ? "bg-purple-100 text-purple-800"
                            : opp.intent === "Guide"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {opp.intent}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {opp.existingPage ? (
                        <a
                          href={opp.existingPage}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-gray-600 hover:text-blue-600 hover:underline flex items-center gap-1 max-w-[180px] line-clamp-1"
                        >
                          <span className="truncate">{opp.existingPage}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-amber-700 font-medium text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Chưa có trang phù hợp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {opp.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-900">
                      {opp.clicks}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {opp.ctr.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      #{opp.position.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          opp.recommendedAction === "Optimize Existing"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : opp.recommendedAction === "Create Article" || opp.recommendedAction === "Create Guide"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : opp.recommendedAction === "Monitor"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {opp.recommendedAction}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          opp.priority === "HIGH"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : opp.priority === "MEDIUM"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opp.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenBrief(opp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-indigo-600" />
                        <span>Xem Brief</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CONTENT BRIEF MODAL */}
      {activeBrief && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900">
                    Content Brief &amp; Kế Hoạch Biên Soạn
                  </h3>
                  <p className="text-xs text-gray-500">
                    Từ khóa chính: <strong className="text-gray-900 font-mono">"{activeBrief.primaryQuery}"</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveBrief(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Guardrail Policy Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Chính sách kiểm soát chất lượng &amp; AI:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                AI chỉ được tạo Draft sau khi Brief đã xác định rõ mục tiêu. Nghiêm cấm Auto-publish; mọi nội dung phải qua Quản trị viên kiểm tra tính chuẩn xác trước khi công khai.
              </p>
            </div>

            {/* Brief Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-gray-500 text-[11px]">Search Intent:</span>
                <div className="font-bold text-gray-900">{activeBrief.searchIntent}</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-gray-500 text-[11px]">Trang đích mục tiêu (Target URL):</span>
                <div className="font-mono font-bold text-blue-700 truncate">{activeBrief.targetUrl}</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-gray-500 text-[11px]">Từ khóa phụ (Secondary Queries):</span>
                <div className="text-gray-800 font-medium">{activeBrief.secondaryQueries.join(", ")}</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-gray-500 text-[11px]">Mùa / Bản Patch:</span>
                <div className="font-semibold text-gray-900">{activeBrief.patchOrSeason || "TFT Mùa 18"}</div>
              </div>
            </div>

            {/* Cannibalization Check */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-amber-600" />
                <span>Kiểm tra xung đột trang nội bộ (Cannibalization Check):</span>
              </label>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                {activeBrief.existingCompetingPages.length > 0 ? (
                  <div>
                    Đã rà soát với các trang:{" "}
                    {activeBrief.existingCompetingPages.map((p, i) => (
                      <span key={i} className="inline-block px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono text-[10px] mr-1">
                        {p}
                      </span>
                    ))}
                    . Xác nhận nội dung mới có phân bổ intent độc lập, không triệt tiêu ranking của nhau.
                  </div>
                ) : (
                  <span className="text-emerald-700 font-semibold">Chưa có trang nào cạnh tranh intent này.</span>
                )}
              </div>
            </div>

            {/* Required Sections */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Các mục nội dung bắt buộc (Required Sections):</span>
              </label>
              <div className="space-y-1">
                {activeBrief.requiredSections.map((sec, i) => (
                  <div key={i} className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-900 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Links Map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Internal Link ĐẾN bài này (Inbound):</span>
                </label>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-[11px]">
                  {activeBrief.internalLinksIncoming.map((link, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="font-mono text-gray-600">{link.page}</span>
                      <span className="font-semibold text-emerald-700">Anchor: "{link.anchorText}"</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  <span>Internal Link TỪ bài này đi (Outbound):</span>
                </label>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-[11px]">
                  {activeBrief.internalLinksOutgoing.map((link, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="font-mono text-gray-600">{link.target}</span>
                      <span className="font-semibold text-blue-700">Anchor: "{link.anchorText}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Unique Value Checklist */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-gray-700">
                Giá trị độc nhất (Unique Value Requirement):
              </label>
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-purple-900 space-y-1 text-[11px]">
                {activeBrief.uniqueValueChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Draft Proposal Preview (if available) */}
            {activeBrief.aiDraftProposal && (
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Bản Phác Thảo AI Đề Xuất (AI Draft Proposal Preview)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(activeBrief.aiDraftProposal!.title, "title")}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      {copiedTitle ? "Đã copy Title" : "Copy Title"}
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => copyText(activeBrief.aiDraftProposal!.metaDescription, "desc")}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      {copiedDesc ? "Đã copy Meta" : "Copy Meta"}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="font-semibold text-gray-900 text-xs">
                    {activeBrief.aiDraftProposal.title}
                  </div>
                  <div className="text-[11px] text-gray-600 leading-relaxed">
                    {activeBrief.aiDraftProposal.metaDescription}
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 text-[11px] text-gray-700 italic">
                    "{activeBrief.aiDraftProposal.draftPreview}"
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() =>
                  copyText(
                    `CONTENT BRIEF: ${activeBrief.primaryQuery}\nTarget: ${activeBrief.targetUrl}\nIntent: ${activeBrief.searchIntent}\nSections:\n${activeBrief.requiredSections.join("\n")}`,
                    "brief"
                  )
                }
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBrief ? "Đã copy toàn bộ Brief" : "Copy Toàn Bộ Brief"}</span>
              </button>

              <button
                onClick={() => setActiveBrief(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Đóng Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
