import path from "path";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";
import { BlogPost, BlogPostStatus, BlogPostCategory, isPatchStale } from "@/utils/blog-shared";

export * from "@/utils/blog-shared";

const STORAGE_KEY = "system/blog-posts.json";
const LOCAL_FILE_PATH = path.join(process.cwd(), "src", "data", "blog-posts.json");

let memoryPosts: BlogPost[] | null = null;

/**
 * Đọc toàn bộ danh sách bài viết blog từ Cloud/Local
 */
export async function getBlogPosts(options?: {
  status?: BlogPostStatus | "all";
  category?: string;
  tag?: string;
  limit?: number;
}): Promise<BlogPost[]> {
  try {
    const loaded = await getCloudJson<BlogPost[]>(
      STORAGE_KEY,
      LOCAL_FILE_PATH,
      []
    );

    let posts: BlogPost[] = Array.isArray(loaded) ? loaded : [];
    memoryPosts = posts;

    // Filter by status (default: only published)
    const targetStatus = options?.status ?? "published";
    if (targetStatus !== "all") {
      posts = posts.filter((p) => p.status === targetStatus);
    }

    // Filter by category
    if (options?.category) {
      const catLower = options.category.toLowerCase().trim();
      posts = posts.filter((p) => p.category.toLowerCase().trim() === catLower);
    }

    // Filter by tag
    if (options?.tag) {
      const tagLower = options.tag.toLowerCase().trim();
      posts = posts.filter((p) =>
        p.tags.some((t) => t.toLowerCase().trim() === tagLower)
      );
    }

    // Sort descending by publishedAt or updatedAt
    posts.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.updatedAt).getTime();
      const dateB = new Date(b.publishedAt || b.updatedAt).getTime();
      return dateB - dateA;
    });

    if (options?.limit && options.limit > 0) {
      return posts.slice(0, options.limit);
    }

    return posts;
  } catch (err) {
    console.warn("Lỗi đọc danh sách bài viết blog:", err);
    return memoryPosts || [];
  }
}

/**
 * Lấy chi tiết một bài viết theo slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts({ status: "all" });
  const cleanSlug = slug.toLowerCase().trim();
  const matched = posts.find((p) => p.slug.toLowerCase().trim() === cleanSlug);
  return matched || null;
}

/**
 * Lấy danh sách bài viết liên quan (ưu tiên cùng category, cùng season, loại trừ bài hiện tại)
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getBlogPosts({ status: "published" });

  const candidates = allPosts.filter((p) => p.id !== currentPost.id);

  // Score candidate relevance
  const scored = candidates.map((p) => {
    let score = 0;
    if (p.category === currentPost.category) score += 3;
    if (p.contentType === currentPost.contentType) score += 2;
    const commonTags = p.tags.filter((t) => currentPost.tags.includes(t));
    score += commonTags.length;
    return { post: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.post);
}

/**
 * Lưu danh sách bài viết blog lên Cloud & Local
 */
export async function saveBlogPosts(posts: BlogPost[]): Promise<boolean> {
  memoryPosts = posts;
  return await saveCloudJson(STORAGE_KEY, posts, LOCAL_FILE_PATH);
}
