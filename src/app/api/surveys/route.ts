import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { SurveyResponse, SurveyConfig, calculateSurveySummary } from "@/utils/surveys-service";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";

const SURVEYS_STORAGE_KEY = "system/surveys.json";
const SURVEY_CONFIG_STORAGE_KEY = "system/survey-config.json";
const SURVEYS_FILE_PATH = path.join(process.cwd(), "src/data/surveys.json");
const CONFIG_FILE_PATH = path.join(process.cwd(), "src/data/survey-config.json");

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

async function readSurveys(): Promise<SurveyResponse[]> {
  const data = await getCloudJson<SurveyResponse[]>(SURVEYS_STORAGE_KEY, SURVEYS_FILE_PATH, []);
  return Array.isArray(data) ? data : [];
}

async function writeSurveys(surveys: SurveyResponse[]): Promise<boolean> {
  return await saveCloudJson(SURVEYS_STORAGE_KEY, surveys, SURVEYS_FILE_PATH);
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
    const allSurveys = await readSurveys();

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

    const services = (Array.isArray(body.servicesUsed) && body.servicesUsed.length > 0)
      ? body.servicesUsed
      : ["Thuê Acc TFT"];

    const suggestion = (body.improvementSuggestion && body.improvementSuggestion.trim())
      ? body.improvementSuggestion.trim()
      : (body.requestedAdditions && body.requestedAdditions.trim())
        ? `Mong muốn bổ sung: ${body.requestedAdditions.trim()}`
        : "Khảo sát trải nghiệm dịch vụ Shop TFT Tuấn Thái Bình";

    const allSurveys = await readSurveys();
    const now = new Date();

    // Xác định nhánh khảo sát (THUE_ACC, GDTG, WEBSITE)
    const branchKey = (
      body.branch ||
      body.customAnswers?.selectedBranch ||
      (services[0]?.includes("GDTG") ? "GDTG" : services[0]?.includes("Website") || services[0]?.includes("Báo Lỗi") ? "WEBSITE" : "THUE_ACC")
    ) as string;

    // Đọc cấu hình reward theo nhánh từ cloud store / local
    let activeVoucherCode = "TRIAN-THUE50";
    let activeReward = undefined;
    try {
      const cfg = await getCloudJson<SurveyConfig>(SURVEY_CONFIG_STORAGE_KEY, CONFIG_FILE_PATH);
      if (cfg?.branchRewards && cfg.branchRewards[branchKey]) {
        activeReward = cfg.branchRewards[branchKey];
        activeVoucherCode = activeReward.voucherCode;
      } else if (cfg?.reward?.voucherCode) {
        activeVoucherCode = cfg.reward.voucherCode;
        activeReward = cfg.reward;
      }
    } catch {}

    const newSurvey: SurveyResponse = {
      id: `survey-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now.toISOString(),
      servicesUsed: services,
      satisfactionRating: Math.max(1, Math.min(5, Math.round(Number(body.satisfactionRating) || 5))),
      deliverySpeed: body.deliverySpeed || "Siêu nhanh (< 1 phút)",
      supportAttitude: body.supportAttitude || "Rất nhiệt tình & chu đáo",
      accountQuality: body.accountQuality || "Đúng 100% như hình & mô tả",
      requestedAdditions: body.requestedAdditions ? body.requestedAdditions.trim() : undefined,
      pricingPerception: body.pricingPerception || "Hợp lý, vừa túi tiền",
      improvementSuggestion: suggestion,
      recommendScore: Math.max(1, Math.min(10, Math.round(Number(body.recommendScore) || 10))),
      customerName: body.customerName ? body.customerName.trim() : "Khách Hàng TFT",
      customerZalo: body.customerZalo ? body.customerZalo.trim() : undefined,
      customAnswers: body.customAnswers && typeof body.customAnswers === "object" ? body.customAnswers : undefined,
      rewardCode: activeVoucherCode,
      rewardTitle: activeReward?.rewardTitle,
      branch: branchKey,
    };

    allSurveys.unshift(newSurvey);
    await writeSurveys(allSurveys);

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

    const allSurveys = await readSurveys();
    const filtered = allSurveys.filter((s) => s.id !== id);

    if (filtered.length === allSurveys.length) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy phản hồi khảo sát để xóa!" },
        { status: 404 }
      );
    }

    await writeSurveys(filtered);

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

    const allSurveys = await readSurveys();
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

    await writeSurveys(allSurveys);

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


