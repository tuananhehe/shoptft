export type BlogPostCategory =
  | "TFT Mùa 18"
  | "Meta & Đội Hình"
  | "Pet / Chibi / Sân Đấu"
  | "Hướng Dẫn Riot"
  | "Kinh nghiệm TFT";

export const BLOG_CATEGORIES: BlogPostCategory[] = [
  "TFT Mùa 18",
  "Meta & Đội Hình",
  "Pet / Chibi / Sân Đấu",
  "Hướng Dẫn Riot",
  "Kinh nghiệm TFT",
];

export type BlogContentType = "evergreen" | "seasonal" | "patch-sensitive";
export type BlogPostStatus = "published" | "draft" | "scheduled";

export interface BlogFaqItem {
  q: string;
  a: string;
}

export interface BlogPostSeo {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPostRefreshDraft {
  id: string;
  createdAt: string;
  suggestedTitle: string;
  suggestedExcerpt: string;
  suggestedContent: string;
  suggestedPatch?: string;
  suggestedSeo: BlogPostSeo;
  analysisReasons?: string[];
  sectionsToUpdate?: string[];
  sectionsToAdd?: string[];
  internalLinks?: Array<{ text: string; url: string; reason: string }>;
  researchRequired?: string[];
  status: "pending_review" | "approved" | "rejected";
}

export interface BlogPostPreviousVersion {
  title: string;
  content: string;
  excerpt: string;
  patch?: string;
  seo: BlogPostSeo;
  archivedAt: string;
}

export interface BlogSearchConsoleMetrics {
  clicks: number;
  impressions: number;
  ctr: number; // e.g. 1.8 (%)
  position: number; // e.g. 12.4
  period: "7d" | "28d" | "3mo";
  periodLabel: string; // e.g. "28 ngày qua"
  views?: number;
  conversions?: number;
}

export type RefreshStatus = "Fresh" | "Needs Review" | "Outdated" | "SEO Opportunity";
export type RefreshPriority = "High" | "Medium" | "Low";

export interface PostRefreshEvaluation {
  status: RefreshStatus;
  priority: RefreshPriority;
  reasons: string[];
  outboundLinksCount: number;
  inboundLinksCount: number;
  isOrphan: boolean;
  cannibalizationWith?: string[];
  isPatchStale: boolean;
  daysSinceUpdate: number;
}

export interface AiRefreshAnalysis {
  status: RefreshStatus;
  priority: RefreshPriority;
  reasons: string[];
  mainIssues: string[];
  suggestedTitle?: string;
  suggestedMetaDescription?: string;
  sectionsToUpdate: string[];
  sectionsToAdd: string[];
  internalLinks: Array<{ text: string; url: string; reason: string }>;
  researchRequired: string[];
  freshnessWarnings: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: BlogPostCategory;
  tags: string[];
  author: BlogAuthor;
  status: BlogPostStatus;
  contentType: BlogContentType;
  patch?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  featured?: boolean;
  faqs?: BlogFaqItem[];
  seo: BlogPostSeo;
  generatedByAi?: boolean;
  suggestedCoverPrompt?: string;
  refreshDraft?: BlogPostRefreshDraft | null;
  previousVersion?: BlogPostPreviousVersion | null;
  searchConsoleMetrics?: BlogSearchConsoleMetrics | null;
}

export type AiArticleLength = "short" | "standard" | "deep";

export interface AiGenerateArticleRequest {
  topic: string;
  category?: BlogPostCategory | "auto";
  contentType?: BlogContentType | "auto";
  patch?: string;
  length?: AiArticleLength;
  mode?: "full" | "rewrite" | "seo_only";
  existingContent?: string;
  existingTitle?: string;
  apiKey?: string;
}

export interface AiArticleStructuredOutput {
  title: string;
  slug: string;
  category: BlogPostCategory;
  contentType: BlogContentType;
  patch?: string | null;
  excerpt: string;
  tags: string[];
  contentMarkdown: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalPath: string;
    index: boolean;
  };
  suggestedCoverPrompt?: string;
  internalLinks?: Array<{ text: string; url: string }>;
  relatedTopics?: string[];
  hubLink?: { text: string; url: string };
  commercialLink?: { text: string; url: string };
}

export const DEFAULT_AUTHOR: BlogAuthor = {
  name: "Tuấn Thái Bình",
  role: "Cựu Thách Đấu ĐTCL 1.134 ĐNG",
  avatar: "/avatar.jpg",
};

export const CURRENT_TFT_PATCH = "18.3b";
export const CURRENT_TFT_SET = "TFT Mùa 18 – Đại Ngàn Kỳ Bí";

/**
 * Tạo slug chuẩn tiếng Việt và thân thiện với SEO
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Tính toán thời gian đọc trung bình dựa trên độ dài văn bản
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 220;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} phút đọc`;
}

/**
 * Kiểm tra xem bài viết theo patch có bị cũ so với patch hiện tại hay không
 */
export function isPatchStale(post: BlogPost, currentPatch: string = CURRENT_TFT_PATCH): boolean {
  if (post.contentType !== "patch-sensitive") return false;
  if (!post.patch) return false;
  return post.patch.trim().toLowerCase() !== currentPatch.trim().toLowerCase();
}
