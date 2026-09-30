import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { generateAiBlogArticle } from "@/utils/ai-blog-writer";
import { AiGenerateArticleRequest } from "@/utils/blog-shared";

export const runtime = "nodejs";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

/**
 * POST /api/admin/blog/ai-generate
 * Tạo bài viết blog & metadata SEO bằng AI
 */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        success: false,
        error: "Bạn đang thao tác tạo bài quá nhanh. Vui lòng đợi trong giây lát và thử lại!",
      },
      { status: 429 }
    );
  }

  try {
    const body: AiGenerateArticleRequest = await req.json();

    if (!body || !body.topic || typeof body.topic !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề bài viết muốn tạo!" },
        { status: 400 }
      );
    }

    const trimmedTopic = body.topic.trim();
    if (trimmedTopic.length === 0) {
      return NextResponse.json(
        { success: false, error: "Chủ đề bài viết không được để trống!" },
        { status: 400 }
      );
    }

    if (trimmedTopic.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Độ dài yêu cầu tối đa 1.000 ký tự!" },
        { status: 400 }
      );
    }

    // Call AI Blog Generator Provider
    const result = await generateAiBlogArticle(body);

    return NextResponse.json({
      success: true,
      message: "Tạo bài viết bằng AI thành công!",
      data: result,
    });
  } catch (error: any) {
    console.error("[API AI Blog Generate Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo bài lúc này. Nội dung hiện tại chưa bị thay đổi.",
      },
      { status: 500 }
    );
  }
}
