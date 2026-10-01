import {
  BlogPost,
  BlogPostRefreshDraft,
  BlogPostPreviousVersion,
  PostRefreshEvaluation,
  AiRefreshAnalysis,
  RefreshStatus,
  RefreshPriority,
  CURRENT_TFT_PATCH,
  CURRENT_TFT_SET,
} from "@/utils/blog-shared";

/**
 * Đếm số lượng internal link trỏ ra ngoài trong nội dung markdown
 */
export function countOutboundInternalLinks(content: string): number {
  if (!content) return 0;
  // Match markdown links starting with /: [text](/path) or href="/path"
  const mdMatches = content.match(/\[([^\]]+)\]\(((\/(shop|thue-acc|huong-dan|blog|ve-shop)[^)]*))\)/gi);
  const htmlMatches = content.match(/href=["']((\/(shop|thue-acc|huong-dan|blog|ve-shop)[^"']*))["']/gi);
  return (mdMatches ? mdMatches.length : 0) + (htmlMatches ? htmlMatches.length : 0);
}

/**
 * Đếm số lượng bài viết khác trỏ đến slug của bài viết hiện tại (inbound internal links)
 */
export function countInboundInternalLinks(slug: string, allPosts: BlogPost[]): number {
  if (!slug) return 0;
  const targetPattern = new RegExp(`\(/blog/${slug}[\)#\?]`, "i");
  let count = 0;
  for (const other of allPosts) {
    if (other.slug === slug) continue;
    if (targetPattern.test(other.content)) {
      count++;
    }
  }
  return count;
}

/**
 * Phát hiện nguy cơ trùng lặp từ khóa / ăn thịt từ khóa (Keyword Cannibalization)
 */
export function detectCannibalization(post: BlogPost, allPosts: BlogPost[]): string[] {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["va", "cua", "cac", "nhung", "cho", "trong", "tai", "bai", "acc"].includes(w));

  const postWords = new Set(normalize(post.title));
  if (postWords.size < 2) return [];

  const conflicting: string[] = [];

  for (const other of allPosts) {
    if (other.id === post.id) continue;
    const otherWords = normalize(other.title);
    let commonCount = 0;
    for (const w of otherWords) {
      if (postWords.has(w)) commonCount++;
    }
    // If overlapping >= 3 significant terms and category is same
    if (commonCount >= 3 && other.category === post.category) {
      conflicting.push(other.title);
    }
  }

  return conflicting;
}

/**
 * Hệ thống đánh giá SEO Refresh Rules tự động (Không dùng score giả 0-100)
 */
export function evaluatePostRefreshStatus(
  post: BlogPost,
  allPosts: BlogPost[]
): PostRefreshEvaluation {
  const reasons: string[] = [];
  let isPatchStale = false;
  const isEvergreen = post.contentType === "evergreen";
  const isPatchSensitive = post.contentType === "patch-sensitive";

  // 1. Patch Check (Strict: Do not warn patch for evergreen!)
  if (isPatchSensitive) {
    const postPatch = (post.patch || "").trim().toLowerCase();
    const currentPatch = CURRENT_TFT_PATCH.trim().toLowerCase();

    if (!postPatch) {
      isPatchStale = true;
      reasons.push(`Bài viết dạng nhạy cảm bản vá nhưng chưa khai báo Patch`);
    } else if (postPatch !== currentPatch) {
      isPatchStale = true;
      reasons.push(`Patch cũ (${post.patch} so với phiên bản hiện tại ${CURRENT_TFT_PATCH})`);
    }
  }

  // 2. Updated Age Check
  const now = Date.now();
  const lastUpdated = new Date(post.updatedAt || post.publishedAt).getTime();
  const daysSinceUpdate = isNaN(lastUpdated) ? 999 : Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

  if (!isEvergreen && daysSinceUpdate > 90) {
    reasons.push(`Chưa cập nhật nội dung hơn 3 tháng (${daysSinceUpdate} ngày)`);
  } else if (!isEvergreen && daysSinceUpdate > 45 && isPatchSensitive) {
    reasons.push(`Chưa rà soát bản vá hơn 45 ngày`);
  }

  // 3. Metadata Quality Check
  const title = (post.title || "").trim();
  const desc = (post.seo?.description || post.excerpt || "").trim();

  if (title.length < 30) {
    reasons.push(`Tiêu đề ngắn (${title.length} ký tự, khuyến nghị >= 35 ký tự)`);
  } else if (title.length > 70) {
    reasons.push(`Tiêu đề dài (${title.length} ký tự, có thể bị Google cắt bớt)`);
  }

  if (desc.length < 75) {
    reasons.push(`Meta description yếu (${desc.length} ký tự, khuyến nghị 120-155 ký tự)`);
  }

  // 4. Internal Link Quality Check
  const outboundLinksCount = countOutboundInternalLinks(post.content);
  if (outboundLinksCount === 0) {
    reasons.push(`Thiếu internal links ra bài viết/shop (0 outbound link)`);
  }

  const inboundLinksCount = countInboundInternalLinks(post.slug, allPosts);
  const isOrphan = inboundLinksCount === 0 && allPosts.length > 3;
  if (isOrphan) {
    reasons.push(`Bài viết mồ côi (Orphan article) - Chưa có bài nào trong blog trỏ đến`);
  }

  // 5. Cannibalization Check
  const cannibalizationWith = detectCannibalization(post, allPosts);
  if (cannibalizationWith.length > 0) {
    reasons.push(`Trùng lặp chủ đề (Cannibalization) với: "${cannibalizationWith[0]}"`);
  }

  // 6. Search Console Metrics Evaluation (If integrated/present)
  const gsc = post.searchConsoleMetrics;
  let isCtrOpportunity = false;
  let isPositionOpportunity = false;

  if (gsc) {
    // High impressions but low CTR
    if (gsc.impressions >= 150 && gsc.ctr < 2.5) {
      isCtrOpportunity = true;
      reasons.push(`CTR thấp (${gsc.ctr.toFixed(1)}% / ${gsc.impressions} lượt xem tìm kiếm): Cơ hội tối ưu Title & Snippet`);
    }

    // Position on page 1-2 (8.0 - 20.0)
    if (gsc.position >= 8.0 && gsc.position <= 20.0) {
      isPositionOpportunity = true;
      reasons.push(`Vị trí trung bình ${gsc.position.toFixed(1)} (Top 8-20): Tiềm năng vào Top 3 qua mở rộng nội dung & FAQ`);
    }
  }

  // 7. Status Resolution
  let status: RefreshStatus = "Fresh";
  if (post.refreshDraft && post.refreshDraft.status === "pending_review") {
    status = "Needs Review";
  } else if (isPatchStale && post.patch && !post.patch.startsWith("18.3")) {
    status = "Outdated";
  } else if (isPatchStale || isOrphan || outboundLinksCount === 0 || cannibalizationWith.length > 0) {
    status = "Needs Review";
  } else if (isCtrOpportunity || isPositionOpportunity) {
    status = "SEO Opportunity";
  } else if (reasons.length > 0 && reasons.some((r) => r.includes("Meta description") || r.includes("hơn 3 tháng"))) {
    status = "Needs Review";
  } else {
    status = "Fresh";
  }

  // 8. Priority Resolution
  let priority: RefreshPriority = "Low";
  if (
    status === "Outdated" ||
    (isPatchStale && (gsc?.impressions || 0) > 200) ||
    (isCtrOpportunity && (gsc?.impressions || 0) > 300)
  ) {
    priority = "High";
  } else if (
    status === "SEO Opportunity" ||
    isOrphan ||
    outboundLinksCount === 0 ||
    cannibalizationWith.length > 0 ||
    daysSinceUpdate > 60
  ) {
    priority = "Medium";
  } else {
    priority = "Low";
  }

  return {
    status,
    priority,
    reasons,
    outboundLinksCount,
    inboundLinksCount,
    isOrphan,
    cannibalizationWith,
    isPatchStale,
    daysSinceUpdate,
  };
}

/**
 * Phân tích chuyên sâu bài viết bằng AI (Server-side)
 */
export async function analyzePostForRefresh(
  post: BlogPost,
  allPosts: BlogPost[]
): Promise<AiRefreshAnalysis> {
  const evalResult = evaluatePostRefreshStatus(post, allPosts);

  // Suggestions for Title & Meta Description
  let suggestedTitle = post.title;
  let suggestedMetaDescription = post.seo?.description || post.excerpt;

  if (evalResult.isPatchStale && post.patch) {
    suggestedTitle = post.title.replace(new RegExp(post.patch, "gi"), CURRENT_TFT_PATCH);
    if (!suggestedTitle.includes(CURRENT_TFT_PATCH)) {
      suggestedTitle = `${suggestedTitle} (Patch ${CURRENT_TFT_PATCH})`;
    }
  } else if (evalResult.status === "SEO Opportunity") {
    // Make title more compelling and intent-clear without clickbait
    if (!suggestedTitle.includes("Mới Nhất") && !suggestedTitle.includes("Chi Tiết")) {
      suggestedTitle = `${suggestedTitle} – Hướng Dẫn Chi Tiết`;
    }
  }

  // Meta description optimization
  if (suggestedMetaDescription.length < 120 || evalResult.isPatchStale) {
    suggestedMetaDescription = `Cập nhật ${post.title} trong ${CURRENT_TFT_SET} (Patch ${CURRENT_TFT_PATCH}). Hướng dẫn chiến thuật chi tiết, tối ưu trang bị và mẹo thực chiến từ Tuấn Thái Bình.`.slice(0, 155);
  }

  // Sections to update and add
  const sectionsToUpdate: string[] = [];
  const sectionsToAdd: string[] = [];

  if (evalResult.isPatchStale) {
    sectionsToUpdate.push(`Cập nhật thông số tướng carry và mốc kích hoạt tộc hệ theo bản vá ${CURRENT_TFT_PATCH}`);
    sectionsToUpdate.push(`Điều chỉnh thứ tự ưu tiên trang bị (BiS Items) phù hợp meta mới nhất`);
  }

  if (!post.content.includes("FAQ") && !post.content.includes("Câu Hỏi Thường Gặp")) {
    sectionsToAdd.push("Bổ sung mục Câu Hỏi Thường Gặp (FAQ) để tăng cơ hội xuất hiện Featured Snippet trên Google");
  }

  if (post.content.length < 1200) {
    sectionsToAdd.push("Bổ sung bảng phân tích ưu nhược điểm và thời điểm roll tướng phù hợp từng giai đoạn");
  }

  // Proposed Internal Links
  const internalLinks: Array<{ text: string; url: string; reason: string }> = [];

  if (!post.content.includes("/blog/tft-mua-18")) {
    internalLinks.push({
      text: "Cẩm Nang TFT Mùa 18 Hub",
      url: "/blog/tft-mua-18",
      reason: "Kết nối bài viết vào Topic Cluster Hub chính của Mùa 18",
    });
  }

  if (!post.content.includes("/shop")) {
    internalLinks.push({
      text: "Kho Acc TFT VIP",
      url: "/shop",
      reason: "Điều hướng người đọc sang xem các tài khoản sở hữu skin / tướng tương ứng",
    });
  }

  if (!post.content.includes("/thue-acc-tft-dtcl")) {
    internalLinks.push({
      text: "Dịch Vụ Thuê Acc ĐTCL Uy Tín",
      url: "/thue-acc-tft-dtcl",
      reason: "Hỗ trợ chuyển đổi khách hàng có nhu cầu thuê acc",
    });
  }

  // Internal links from other articles
  for (const other of allPosts) {
    if (other.id !== post.id && other.category === post.category && internalLinks.length < 5) {
      if (!post.content.includes(`/blog/${other.slug}`)) {
        internalLinks.push({
          text: other.title,
          url: `/blog/${other.slug}`,
          reason: `Bài viết liên quan cùng chuyên mục "${post.category}"`,
        });
      }
    }
  }

  // Fact Safety & Research Required
  const researchRequired: string[] = [];
  if (evalResult.isPatchStale || post.contentType === "patch-sensitive") {
    researchRequired.push(`Cần kiểm chứng thông số bản vá ${CURRENT_TFT_PATCH} từ nguồn chính thức của Riot Games`);
    researchRequired.push("Không tự bịa tỉ lệ thắng (win rate), tỉ lệ chọn (pick rate) hoặc tier nếu chưa có dữ liệu đối chiếu");
  }

  const freshnessWarnings: string[] = [];
  if (evalResult.isPatchStale) {
    freshnessWarnings.push(`Nội dung đang đề cập Patch ${post.patch || "cũ"}, cần đối chiếu với meta ${CURRENT_TFT_PATCH}`);
  }

  return {
    status: evalResult.status,
    priority: evalResult.priority,
    reasons: evalResult.reasons,
    mainIssues: evalResult.reasons.length > 0 ? evalResult.reasons : ["Nội dung hiện tại đang tươi mới và chuẩn SEO."],
    suggestedTitle,
    suggestedMetaDescription,
    sectionsToUpdate,
    sectionsToAdd,
    internalLinks,
    researchRequired,
    freshnessWarnings,
  };
}

/**
 * Tạo bản nháp cập nhật (Refresh Draft) an toàn bằng AI
 * Không bao giờ tự ý overwrite nội dung đang live!
 */
export async function generateRefreshDraft(
  post: BlogPost,
  analysis: AiRefreshAnalysis
): Promise<BlogPostRefreshDraft> {
  const currentPatch = CURRENT_TFT_PATCH;

  // Build enhanced markdown content
  let updatedContent = post.content;

  // 1. Update Patch references if patch-sensitive
  if (post.contentType === "patch-sensitive" && post.patch) {
    const patchRegex = new RegExp(`Patch\\s+${post.patch.replace(".", "\\.")}`, "gi");
    updatedContent = updatedContent.replace(patchRegex, `Patch ${currentPatch}`);
  }

  // 2. Insert FAQ section if missing
  if (!updatedContent.includes("Câu Hỏi Thường Gặp") && !updatedContent.includes("FAQ")) {
    const faqBlock = `\n\n---\n\n## Câu Hỏi Thường Gặp (FAQ)\n\n**Q: Làm thế nào để áp dụng chiến thuật này hiệu quả nhất ở phiên bản ${currentPatch}?**  
A: Bạn nên chú ý quan sát các lobby xung quanh để tránh bị tranh bài, đồng thời ưu tiên tối ưu trang bị chuẩn ở vòng 3-2.\n\n**Q: Tôi có thể trải nghiệm các Tướng Tí Nị và Sân Đấu tương ứng ở đâu?**  
A: Bạn có thể tham khảo [Kho Acc TFT](/shop) của ShopTFTMobile để thuê trải nghiệm tài khoản chính chủ uy tín với chi phí tiết kiệm.`;
    updatedContent += faqBlock;
  }

  // 3. Weave internal links if missing
  if (!updatedContent.includes("/blog/tft-mua-18")) {
    const linkAppendix = `\n\n> [!NOTE]\n> **Cập nhật liên tục**: Khám phá thêm toàn bộ meta và bảng xếp hạng đội hình mới nhất tại [Cẩm Nang TFT Mùa 18 Hub](/blog/tft-mua-18) và dịch vụ [Thuê Acc TFT](/thue-acc-tft-dtcl) uy tín bàn giao qua Zalo.`;
    updatedContent += linkAppendix;
  }

  return {
    id: `draft-${post.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    suggestedTitle: analysis.suggestedTitle || post.title,
    suggestedExcerpt: analysis.suggestedMetaDescription || post.excerpt,
    suggestedContent: updatedContent,
    suggestedPatch: post.contentType === "patch-sensitive" ? currentPatch : post.patch,
    suggestedSeo: {
      ...post.seo,
      title: `${analysis.suggestedTitle || post.title} | ShopTFTMobile`.slice(0, 68),
      description: (analysis.suggestedMetaDescription || post.seo?.description || post.excerpt).slice(0, 155),
      canonical: post.seo?.canonical || `https://www.shoptftmobile.net/blog/${post.slug}`,
    },
    analysisReasons: analysis.reasons,
    sectionsToUpdate: analysis.sectionsToUpdate,
    sectionsToAdd: analysis.sectionsToAdd,
    internalLinks: analysis.internalLinks,
    researchRequired: analysis.researchRequired,
    status: "pending_review",
  };
}

export interface DiffChunk {
  type: "same" | "add" | "remove";
  text: string;
}

export interface ArticleDiffResult {
  addedCount: number;
  removedCount: number;
  changedSections: string[];
  chunks: DiffChunk[];
}

/**
 * Tính toán chênh lệch (Diff) giữa bản hiện tại và bản đề xuất AI
 */
export function computeContentDiff(original: string, updated: string): ArticleDiffResult {
  const origLines = (original || "").split("\n");
  const updLines = (updated || "").split("\n");

  const chunks: DiffChunk[] = [];
  let addedCount = 0;
  let removedCount = 0;
  const changedSections: string[] = [];

  const maxLines = Math.max(origLines.length, updLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oLine = origLines[i];
    const uLine = updLines[i];

    if (oLine === undefined && uLine !== undefined) {
      chunks.push({ type: "add", text: uLine });
      addedCount++;
      if (uLine.startsWith("## ")) changedSections.push(`+ ${uLine.replace("## ", "")}`);
    } else if (oLine !== undefined && uLine === undefined) {
      chunks.push({ type: "remove", text: oLine });
      removedCount++;
      if (oLine.startsWith("## ")) changedSections.push(`- ${oLine.replace("## ", "")}`);
    } else if (oLine === uLine) {
      chunks.push({ type: "same", text: oLine });
    } else {
      chunks.push({ type: "remove", text: oLine });
      chunks.push({ type: "add", text: uLine });
      removedCount++;
      addedCount++;
      if (uLine.startsWith("## ")) changedSections.push(`~ ${uLine.replace("## ", "")}`);
    }
  }

  return {
    addedCount,
    removedCount,
    changedSections,
    chunks,
  };
}

/**
 * Áp dụng bản nháp sau khi Admin đã duyệt (Approve & Publish)
 * Lưu lại phiên bản cũ vào previousVersion để có thể rollback an toàn!
 */
export function applyRefreshDraft(
  post: BlogPost,
  editedDraft?: Partial<BlogPostRefreshDraft>
): BlogPost {
  const draft = post.refreshDraft;
  if (!draft) return post;

  const previousVersion: BlogPostPreviousVersion = {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    patch: post.patch,
    seo: { ...post.seo },
    archivedAt: new Date().toISOString(),
  };

  const finalTitle = editedDraft?.suggestedTitle || draft.suggestedTitle || post.title;
  const finalContent = editedDraft?.suggestedContent || draft.suggestedContent || post.content;
  const finalExcerpt = editedDraft?.suggestedExcerpt || draft.suggestedExcerpt || post.excerpt;
  const finalPatch = editedDraft?.suggestedPatch || draft.suggestedPatch || post.patch;
  const finalSeo = editedDraft?.suggestedSeo || draft.suggestedSeo || post.seo;

  return {
    ...post,
    title: finalTitle,
    content: finalContent,
    excerpt: finalExcerpt,
    patch: finalPatch,
    seo: finalSeo,
    updatedAt: new Date().toISOString(),
    previousVersion,
    refreshDraft: null,
  };
}

/**
 * Khôi phục lại phiên bản trước (Rollback)
 */
export function restorePreviousVersion(post: BlogPost): BlogPost {
  if (!post.previousVersion) return post;

  const prev = post.previousVersion;

  return {
    ...post,
    title: prev.title,
    content: prev.content,
    excerpt: prev.excerpt,
    patch: prev.patch,
    seo: prev.seo,
    updatedAt: new Date().toISOString(),
    previousVersion: null,
  };
}
