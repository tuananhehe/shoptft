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
