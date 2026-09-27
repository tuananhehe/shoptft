import { NextRequest, NextResponse } from "next/server";
import {
  getMemberByUsername,
  verifyPassword,
  generateMemberSessionToken,
  recordLastLogin,
  toSafeMember,
} from "@/utils/members-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.",
        },
        { status: 400 }
      );
    }

    const member = await getMemberByUsername(username);

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin đăng nhập không chính xác.",
        },
        { status: 401 }
      );
    }

    // Kiểm tra trạng thái tài khoản bị khóa
    if (member.status === "LOCKED") {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản hiện không hoạt động. Vui lòng liên hệ ShopTFTMobile để được hỗ trợ.",
        },
        { status: 403 }
      );
    }

    const isMatch = verifyPassword(password, member.passwordHash, member.salt);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin đăng nhập không chính xác.",
        },
        { status: 401 }
      );
    }

    // Ghi nhận lần đăng nhập cuối
    await recordLastLogin(member.id);

    const { token, maxAgeSeconds } = generateMemberSessionToken(member);
    const safeUser = toSafeMember(member);
    const requiresProfileCompletion =
      !safeUser.full_name ||
      safeUser.full_name.trim() === "" ||
      !safeUser.zalo ||
      safeUser.zalo.trim() === "";

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: safeUser,
      token,
      requiresProfileCompletion,
    });

    // Set cookie
    response.cookies.set({
      name: "member_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSeconds,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Lỗi API login:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi máy chủ, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
