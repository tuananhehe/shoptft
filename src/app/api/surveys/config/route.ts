import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SurveyConfig } from "@/utils/surveys-service";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";

const CONFIG_FILE_PATH = path.join(process.cwd(), "src/data/survey-config.json");

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

function readSurveyConfig(): SurveyConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      return JSON.parse(data) as SurveyConfig;
    }
  } catch (err) {
    console.error("Lỗi đọc file survey-config.json:", err);
  }
  return null;
}

function writeSurveyConfig(config: SurveyConfig): boolean {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Lỗi ghi file survey-config.json:", err);
    return false;
  }
}

/**
 * GET /api/surveys/config
 * Công khai cho client /khao-sat và Admin
 */
export async function GET() {
  try {
    const config = readSurveyConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Chưa có cấu hình khảo sát" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (err: any) {
    console.error("Lỗi GET /api/surveys/config:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/surveys/config
 * Dành cho Admin cập nhật câu hỏi & phần quà
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as SurveyConfig;

    if (!body || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { success: false, error: "Cấu hình danh sách câu hỏi không hợp lệ!" },
        { status: 400 }
      );
    }

    const success = writeSurveyConfig(body);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Không thể lưu tệp cấu hình khảo sát!" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu cấu hình câu hỏi và phần quà khảo sát thành công!",
      data: body,
    });
  } catch (err: any) {
    console.error("Lỗi PUT /api/surveys/config:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi cập nhật cấu hình" },
      { status: 500 }
    );
  }
}
