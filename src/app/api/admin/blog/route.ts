import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import {
  getBlogPosts,
  saveBlogPosts,
  BlogPost,
  slugify,
  calculateReadingTime,
} from "@/utils/blog-service";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

function sanitizeString(val: any): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * GET /api/admin/blog
 * Lấy danh sách toàn bộ bài viết (kể cả draft) cho quản trị viên
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const posts = await getBlogPosts({ status: "all" });

    const total = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const patchSensitive = posts.filter((p) => p.contentType === "patch-sensitive").length;

    return NextResponse.json({
      success: true,
      data: posts,
      stats: { total, published, drafts, patchSensitive },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tải danh sách bài viết" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blog
 * Tạo bài viết mới
 */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const title = sanitizeString(body.title);
    if (!title) {
      return NextResponse.json({ success: false, error: "Tiêu đề không được để trống" }, { status: 400 });
    }

    const posts = await getBlogPosts({ status: "all" });

    let slug = sanitizeString(body.slug) || slugify(title);
    // Ensure slug uniqueness
    let counter = 1;
    let finalSlug = slug;
    while (posts.some((p) => p.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const content = body.content || "";
    const now = new Date().toISOString();

    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: finalSlug,
      title,
      excerpt: sanitizeString(body.excerpt),
      content,
      coverImage: sanitizeString(body.coverImage) || "/banner-seo.jpg",
      category: body.category || "TFT Mùa 18",
      tags: Array.isArray(body.tags) ? body.tags.map(sanitizeString).filter(Boolean) : [],
      author: body.author || {
        name: "Tuấn Thái Bình",
        role: "Cựu Thách Đấu ĐTCL 1.134 ĐNG",
        avatar: "/avatar.jpg",
      },
      status: body.status || "draft",
      contentType: body.contentType || "seasonal",
      patch: sanitizeString(body.patch) || "18.3b",
      publishedAt: body.status === "published" ? now : "",
      updatedAt: now,
      readingTime: calculateReadingTime(content),
      featured: Boolean(body.featured),
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
      generatedByAi: Boolean(body.generatedByAi),
      suggestedCoverPrompt: sanitizeString(body.suggestedCoverPrompt),
      seo: {
        title: sanitizeString(body.seo?.title) || `${title} | ShopTFTMobile`,
        description: sanitizeString(body.seo?.description) || sanitizeString(body.excerpt),
        canonical: sanitizeString(body.seo?.canonical) || `https://www.shoptftmobile.net/blog/${finalSlug}`,
        ogImage: sanitizeString(body.seo?.ogImage) || sanitizeString(body.coverImage) || "/banner-seo.jpg",
        noindex: Boolean(body.seo?.noindex),
      },
    };

    posts.unshift(newPost);
    await saveBlogPosts(posts);

    return NextResponse.json({
      success: true,
      message: "Đã tạo bài viết mới thành công!",
      data: newPost,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tạo bài viết" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/blog
 * Cập nhật bài viết hiện có
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID bài viết" }, { status: 400 });
    }

    const posts = await getBlogPosts({ status: "all" });
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    const current = posts[index];
    const title = sanitizeString(body.title) || current.title;
    const content = body.content !== undefined ? body.content : current.content;
    const now = new Date().toISOString();

    const updatedPost: BlogPost = {
      ...current,
      ...body,
      id,
      title,
      slug: sanitizeString(body.slug) || current.slug,
      excerpt: sanitizeString(body.excerpt) || current.excerpt,
      content,
      coverImage: sanitizeString(body.coverImage) || current.coverImage,
      category: body.category || current.category,
      tags: Array.isArray(body.tags) ? body.tags.map(sanitizeString).filter(Boolean) : current.tags,
      status: body.status || current.status,
      contentType: body.contentType || current.contentType,
      patch: sanitizeString(body.patch) || current.patch,
      publishedAt: current.publishedAt || (body.status === "published" ? now : ""),
      updatedAt: now,
      readingTime: calculateReadingTime(content),
      featured: body.featured !== undefined ? Boolean(body.featured) : current.featured,
      faqs: Array.isArray(body.faqs) ? body.faqs : current.faqs,
      generatedByAi: body.generatedByAi !== undefined ? Boolean(body.generatedByAi) : current.generatedByAi,
      suggestedCoverPrompt: body.suggestedCoverPrompt !== undefined ? sanitizeString(body.suggestedCoverPrompt) : current.suggestedCoverPrompt,
      seo: {
        ...current.seo,
        ...(body.seo || {}),
        title: sanitizeString(body.seo?.title || current.seo?.title || title),
        description: sanitizeString(body.seo?.description || current.seo?.description || body.excerpt || current.excerpt),
        canonical: sanitizeString(body.seo?.canonical || current.seo?.canonical),
        ogImage: sanitizeString(body.seo?.ogImage || current.seo?.ogImage || body.coverImage || current.coverImage),
        noindex: body.seo?.noindex !== undefined ? Boolean(body.seo.noindex) : current.seo?.noindex,
      },
    };

    posts[index] = updatedPost;
    await saveBlogPosts(posts);

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật bài viết thành công!",
      data: updatedPost,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi cập nhật bài viết" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog?id=...
 * Xóa bài viết
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID bài viết" }, { status: 400 });
    }

    const posts = await getBlogPosts({ status: "all" });
    const filtered = posts.filter((p) => p.id !== id);

    await saveBlogPosts(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi xóa bài viết" },
      { status: 500 }
    );
  }
}
