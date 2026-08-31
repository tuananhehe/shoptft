import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  generateAdminSessionToken,
  verifyAdminSessionToken,
  setMasterAdminPassword,
  ADMIN_COOKIE_NAME,
} from "@/utils/admin-auth";

/**
 * GET /api/admin/auth
 * Kiểm tra trạng thái phiên làm việc của Admin
 */
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const headerToken =
      req.headers.get("x-admin-token") ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const session = verifyAdminSessionToken(sessionCookie || headerToken);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        role: session.role,
        username: session.username,
        expiresAt: session.expiresAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 200 });
  }
}

/**
 * POST /api/admin/auth
 * Đăng nhập vào trang Admin với Mật khẩu Quản trị
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, remember } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mật khẩu quản trị!" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu quản trị không chính xác! Vui lòng thử lại." },
        { status: 401 }
      );
    }

    // Tạo session token
    const { token, maxAgeSeconds, expiresAt } = generateAdminSessionToken(!!remember);

    const response = NextResponse.json({
      success: true,
      token,
      message: "Xác thực quản trị viên thành công!",
      expiresAt,
    });

    // Thiết lập HTTP-Only Cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi xử lý đăng nhập máy chủ" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth
 * Đăng xuất khỏi trang Admin (xóa Cookie phiên)
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Đã đăng xuất khỏi hệ thống quản trị!",
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

/**
 * PUT /api/admin/auth
 * Đổi mật khẩu quản trị mới
 */
export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifyAdminSessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới!" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu mới phải có độ dài tối thiểu 6 ký tự!" },
        { status: 400 }
      );
    }

    const isCurrentValid = verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu hiện tại không đúng!" },
        { status: 400 }
      );
    }

    // Cập nhật mật khẩu mới
    setMasterAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: "Đã đổi mật khẩu quản trị viên thành công!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi đổi mật khẩu" },
      { status: 500 }
    );
  }
}
