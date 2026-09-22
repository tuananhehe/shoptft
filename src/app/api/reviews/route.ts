import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CustomerReviewItem } from "@/utils/reviews-service";
import { SurveyResponse } from "@/utils/surveys-service";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";

const REVIEWS_FILE_PATH = path.join(process.cwd(), "src/data/reviews.json");
const SURVEYS_FILE_PATH = path.join(process.cwd(), "src/data/surveys.json");

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

function readReviewsFromFile(): CustomerReviewItem[] {
  try {
    if (fs.existsSync(REVIEWS_FILE_PATH)) {
      const data = fs.readFileSync(REVIEWS_FILE_PATH, "utf8");
      return JSON.parse(data) as CustomerReviewItem[];
    }
  } catch (err) {
    console.error("Lỗi đọc file reviews.json:", err);
  }
  return [];
}

function writeReviewsToFile(reviews: CustomerReviewItem[]): boolean {
  try {
    const dir = path.dirname(REVIEWS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(reviews, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Lỗi ghi file reviews.json:", err);
    return false;
  }
}

// Đồng bộ sang surveys.json để hiển thị trong Admin Surveys Dashboard
function syncReviewToSurveys(review: CustomerReviewItem) {
  try {
    let surveys: SurveyResponse[] = [];
    if (fs.existsSync(SURVEYS_FILE_PATH)) {
      surveys = JSON.parse(fs.readFileSync(SURVEYS_FILE_PATH, "utf8"));
    }

    const categoryMap: Record<string, string> = {
      THUE_ACC: "Thuê Acc TFT",
      CAY_THUE: "Cày Thuê TFT & Coaching",
      GDTG: "GDTG TFT (Giao Dịch Trung Gian)",
      COACHING: "Coaching 1-1",
      ALL: "Thuê Acc TFT",
    };

    const newSurvey: SurveyResponse = {
      id: `survey-rev-${review.id}`,
      createdAt: review.createdAt,
      servicesUsed: [categoryMap[review.category] || "Thuê Acc TFT"],
      satisfactionRating: review.rating,
      deliverySpeed: "⚡ Siêu nhanh (< 1 phút)",
      supportAttitude: "🌟 Rất nhiệt tình & chu đáo",
      accountQuality: "🎯 Đúng 100% như hình & mô tả",
      pricingPerception: "Hợp lý, vừa túi tiền",
      improvementSuggestion: review.comment + (review.improvementSuggestion ? ` | Góp ý thêm: ${review.improvementSuggestion}` : ""),
      recommendScore: review.rating * 2, // Thang điểm 10
      customerName: review.customerName,
      customerZalo: review.customerZalo || review.customerEmail,
      giftDelivered: false,
      customAnswers: {
        isGoogleReview: true,
        googleAvatar: review.customerAvatar,
        customerEmail: review.customerEmail,
        vipTier: review.vipTier,
        accountBought: review.accountBought,
      },
    };

    const existingIdx = surveys.findIndex((s) => s.id === newSurvey.id);
    if (existingIdx !== -1) {
      surveys[existingIdx] = newSurvey;
    } else {
      surveys.unshift(newSurvey);
    }

    fs.writeFileSync(SURVEYS_FILE_PATH, JSON.stringify(surveys, null, 2), "utf8");
  } catch (err) {
    console.warn("Lỗi sync review sang surveys.json:", err);
  }
}

/**
 * GET /api/reviews
 * Trả về danh sách đánh giá khách hàng
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdminQuery = searchParams.get("admin") === "true";
    const isAdmin = isAuthorizedAdmin(req);

    const allReviews = readReviewsFromFile();

    // Sắp xếp mới nhất lên đầu
    allReviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Nếu là Admin thì lấy hết, nếu là khách thì chỉ lấy review đã duyệt (isApproved: true)
    const filteredReviews = (isAdminQuery && isAdmin) ? allReviews : allReviews.filter((r) => r.isApproved !== false);

    // Tính thống kê số sao
    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;

    filteredReviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, r.rating || 5));
      ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
      totalScore += star;
    });

    const total = filteredReviews.length;
    const avgRating = total > 0 ? Number((totalScore / total).toFixed(1)) : 5.0;

    return NextResponse.json({
      success: true,
      data: filteredReviews,
      total,
      avgRating,
      ratingBreakdown,
    });
  } catch (err: any) {
    console.error("Lỗi GET /api/reviews:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi lấy đánh giá", data: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Nhận đánh giá / góp ý mới từ khách hàng
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customerName = (body.customerName && body.customerName.trim())
      ? body.customerName.trim()
      : "Cờ Thủ ĐTCL";

    if (!body.comment || !body.comment.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng viết đôi lời nhận xét về trải nghiệm của bạn!" },
        { status: 400 }
      );
    }

    const allReviews = readReviewsFromFile();
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const newId = `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newReview: CustomerReviewItem = {
      id: newId,
      customerName: customerName,
      customerEmail: body.customerEmail ? body.customerEmail.trim() : undefined,
      customerAvatar: body.customerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customerName)}`,
      customerZalo: body.customerZalo ? body.customerZalo.trim() : undefined,
      vipTier: body.vipTier || "BRONZE",
      rating: Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5))),
      category: body.category || "THUE_ACC",
      accountBought: body.accountBought || "Dịch Vụ Trải Nghiệm TFT VIP",
      comment: body.comment.trim(),
      improvementSuggestion: body.improvementSuggestion ? body.improvementSuggestion.trim() : undefined,
      verifiedTag: body.isGoogleUser ? "Đã Xác Thực Google ⭐" : (body.verifiedTag || "Khách Trải Nghiệm"),
      isApproved: true, // Tự động duyệt để khách thấy ngay
      isGoogleUser: Boolean(body.isGoogleUser),
      createdAt: now.toISOString(),
      date: dateStr,
    };

    allReviews.unshift(newReview);
    writeReviewsToFile(allReviews);

    // Đồng bộ sang surveys.json để trang Admin Surveys hiển thị ngay
    syncReviewToSurveys(newReview);

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn đã gửi đánh giá & đóng góp ý kiến quý báu cho Shop TFT Tuấn Thái Bình!",
      data: newReview,
    });
  } catch (err: any) {
    console.error("Lỗi POST /api/reviews:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi gửi đánh giá" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews?id=rev-xxx
 * Admin cập nhật trạng thái duyệt, phản hồi đánh giá
 */
export async function PUT(req: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: "Thiếu ID đánh giá!" },
        { status: 400 }
      );
    }

    const allReviews = readReviewsFromFile();
    const index = allReviews.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đánh giá tương ứng!" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updatedReview: CustomerReviewItem = {
      ...allReviews[index],
      ...body,
      id: allReviews[index].id,
      createdAt: allReviews[index].createdAt,
    };

    if (body.adminReply !== undefined) {
      updatedReview.adminReply = body.adminReply;
      updatedReview.adminReplyAt = new Date().toISOString();
    }

    allReviews[index] = updatedReview;
    writeReviewsToFile(allReviews);

    return NextResponse.json({
      success: true,
      message: "Cập nhật đánh giá thành công!",
      data: updatedReview,
    });
  } catch (err: any) {
    console.error("Lỗi PUT /api/reviews:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi cập nhật" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews?id=rev-xxx
 * Admin xóa đánh giá
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
      return NextResponse.json(
        { success: false, error: "Thiếu ID đánh giá cần xóa!" },
        { status: 400 }
      );
    }

    const allReviews = readReviewsFromFile();
    const filtered = allReviews.filter((r) => r.id !== id);

    if (filtered.length === allReviews.length) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đánh giá để xóa!" },
        { status: 404 }
      );
    }

    writeReviewsToFile(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa đánh giá thành công!",
    });
  } catch (err: any) {
    console.error("Lỗi DELETE /api/reviews:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi xóa đánh giá" },
      { status: 500 }
    );
  }
}
