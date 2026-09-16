import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SurveyResponse, calculateSurveySummary } from "@/utils/surveys-service";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";

const SURVEYS_FILE_PATH = path.join(process.cwd(), "src/data/surveys.json");

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

function readSurveysFromFile(): SurveyResponse[] {
  try {
    if (fs.existsSync(SURVEYS_FILE_PATH)) {
      const data = fs.readFileSync(SURVEYS_FILE_PATH, "utf8");
      return JSON.parse(data) as SurveyResponse[];
    }
  } catch (err) {
    console.error("Lỗi đọc file surveys.json:", err);
  }
  return [];
}

function writeSurveysToFile(surveys: SurveyResponse[]): boolean {
  try {
    const dir = path.dirname(SURVEYS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SURVEYS_FILE_PATH, JSON.stringify(surveys, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Lỗi ghi file surveys.json:", err);
    return false;
  }
}

/**
 * GET /api/surveys
 * Dành cho Admin Dashboard để xem danh sách khảo sát và thống kê
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const allSurveys = readSurveysFromFile();

    // Sắp xếp khảo sát mới nhất lên đầu
    allSurveys.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const summary = calculateSurveySummary(allSurveys);

    return NextResponse.json({
      success: true,
      data: allSurveys,
      summary,
      totalCount: allSurveys.length,
    });
  } catch (err: any) {
    console.error("Lỗi GET /api/surveys:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ", data: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/surveys
 * Nhận phản hồi khảo sát công khai từ khách hàng
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.servicesUsed || !Array.isArray(body.servicesUsed) || body.servicesUsed.length === 0) {
      return NextResponse.json(
        { success: false, error: "Vui lòng chọn ít nhất 1 dịch vụ bạn đã từng sử dụng!" },
        { status: 400 }
      );
    }

    if (!body.improvementSuggestion || !body.improvementSuggestion.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng viết vài dòng góp ý điều Shop cần cải tiến nhé!" },
        { status: 400 }
      );
    }

    const allSurveys = readSurveysFromFile();
    const now = new Date();

    // Đọc cấu hình reward mới nhất từ survey-config.json nếu có
    let activeVoucherCode = "TRIAN-TFT20";
    let activeReward = undefined;
    const configPath = path.join(process.cwd(), "src/data/survey-config.json");
    try {
      if (fs.existsSync(configPath)) {
        const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (cfg?.reward?.voucherCode) {
          activeVoucherCode = cfg.reward.voucherCode;
          activeReward = cfg.reward;
        }
      }
    } catch {}

    const newSurvey: SurveyResponse = {
      id: `survey-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now.toISOString(),
      servicesUsed: body.servicesUsed,
      satisfactionRating: Math.max(1, Math.min(5, Math.round(Number(body.satisfactionRating) || 5))),
      deliverySpeed: body.deliverySpeed || "Siêu nhanh (< 1 phút)",
      supportAttitude: body.supportAttitude || "Rất nhiệt tình & chu đáo",
      accountQuality: body.accountQuality || "Đúng 100% như hình & mô tả",
      requestedAdditions: body.requestedAdditions ? body.requestedAdditions.trim() : undefined,
      pricingPerception: body.pricingPerception || "Hợp lý, vừa túi tiền",
      improvementSuggestion: body.improvementSuggestion.trim(),
      recommendScore: Math.max(1, Math.min(10, Math.round(Number(body.recommendScore) || 10))),
      customerName: body.customerName ? body.customerName.trim() : undefined,
      customerZalo: body.customerZalo ? body.customerZalo.trim() : undefined,
      customAnswers: body.customAnswers && typeof body.customAnswers === "object" ? body.customAnswers : undefined,
    };

    allSurveys.unshift(newSurvey);
    writeSurveysToFile(allSurveys);

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn đã đóng góp ý kiến quý báu cho Shop TFT Tuấn Thái Bình!",
      data: newSurvey,
      discountCode: activeVoucherCode,
      reward: activeReward,
    });
  } catch (err: any) {
    console.error("Lỗi POST /api/surveys:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi gửi khảo sát" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/surveys
 * Admin xóa câu trả lời khảo sát
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
        { success: false, error: "Vui lòng cung cấp ID khảo sát cần xóa!" },
        { status: 400 }
      );
    }

    const allSurveys = readSurveysFromFile();
    const filtered = allSurveys.filter((s) => s.id !== id);

    if (filtered.length === allSurveys.length) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy phản hồi khảo sát để xóa!" },
        { status: 404 }
      );
    }

    writeSurveysToFile(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa phản hồi khảo sát thành công!",
    });
  } catch (err: any) {
    console.error("Lỗi DELETE /api/surveys:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi xóa khảo sát" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/surveys
 * Admin cập nhật trạng thái đã trao quà / chưa trao quà cho khách hàng
 */
export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, giftDelivered, note } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID phản hồi khảo sát!" },
        { status: 400 }
      );
    }

    const allSurveys = readSurveysFromFile();
    const index = allSurveys.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy phản hồi khảo sát tương ứng!" },
        { status: 404 }
      );
    }

    const isDelivered = Boolean(giftDelivered);
    allSurveys[index] = {
      ...allSurveys[index],
      giftDelivered: isDelivered,
      giftDeliveredAt: isDelivered ? new Date().toISOString() : undefined,
      giftDeliveredNote: note !== undefined ? note : allSurveys[index].giftDeliveredNote,
    };

    writeSurveysToFile(allSurveys);

    return NextResponse.json({
      success: true,
      message: isDelivered ? "Đã đánh dấu ĐÃ TRAO QUÀ thành công!" : "Đã chuyển về CHƯA TRAO QUÀ!",
      data: allSurveys[index],
    });
  } catch (err: any) {
    console.error("Lỗi PATCH /api/surveys:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi cập nhật trạng thái trao quà" },
      { status: 500 }
    );
  }
}

