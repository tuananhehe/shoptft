import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { SurveyConfig } from "@/utils/surveys-service";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { getCloudJson, saveCloudJson } from "@/utils/cloud-config-store";

const STORAGE_KEY = "system/survey-config.json";
const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "survey-config.json");

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal = req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace("Bearer ", "");
  
  if (cookieVal && verifyAdminSessionToken(cookieVal)) return true;
  if (headerVal && verifyAdminSessionToken(headerVal)) return true;

  // Hỗ trợ local development
  if (process.env.NODE_ENV !== "production") {
    const host = req.headers.get("host") || "";
    if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.")) {
      return true;
    }
  }

  return false;
}

/**
 * GET /api/surveys/config
 * Công khai cho client /khao-sat và Admin
 */
export async function GET() {
  try {
    const config = await getCloudJson<SurveyConfig>(STORAGE_KEY, CONFIG_FILE_PATH);
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Chưa có cấu hình khảo sát" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
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

    const success = await saveCloudJson(STORAGE_KEY, body, CONFIG_FILE_PATH);
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

