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
 * Lấy danh sách bài viết liên quan (ưu tiên cùng category, cùng season, patch, độ tươi mới)
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getBlogPosts({ status: "published" });

  const candidates = allPosts.filter(
    (p) => p.id !== currentPost.id && p.status === "published"
  );

  const isCurrentSet18 =
    currentPost.category === "TFT Mùa 18" ||
    currentPost.tags.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("set 18"));

  // Score candidate relevance
  const now = Date.now();
  const scored = candidates.map((p) => {
    let score = 0;

    // 1. Same category
    if (p.category === currentPost.category) score += 4;

    // 2. Same season
    const isTargetSet18 =
      p.category === "TFT Mùa 18" ||
      p.tags.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("set 18"));
    if (isCurrentSet18 && isTargetSet18) score += 3;

    // 3. Same patch / intent
    if (currentPost.patch && p.patch && currentPost.patch === p.patch) score += 3;
    if (p.contentType === currentPost.contentType) score += 2;

    // 4. Overlapping tags
    const commonTags = p.tags.filter((t) =>
      currentPost.tags.some((ct) => ct.toLowerCase().trim() === t.toLowerCase().trim())
    );
    score += commonTags.length * 1.5;

    // 5. Freshness boost (within last 30 days)
    const postDate = new Date(p.updatedAt || p.publishedAt).getTime();
    if (!isNaN(postDate)) {
      const ageDays = (now - postDate) / (1000 * 60 * 60 * 24);
      if (ageDays <= 30) score += 2;
      else if (ageDays <= 90) score += 1;
    }

    return { post: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, Math.max(1, limit)).map((s) => s.post);
}

/**
 * Lưu danh sách bài viết blog lên Cloud & Local
 */
export async function saveBlogPosts(posts: BlogPost[]): Promise<boolean> {
  memoryPosts = posts;
  return await saveCloudJson(STORAGE_KEY, posts, LOCAL_FILE_PATH);
}
