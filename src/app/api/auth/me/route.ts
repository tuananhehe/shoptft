import { NextRequest, NextResponse } from "next/server";
import {
  verifyMemberSessionToken,
  getMemberById,
  toSafeMember,
} from "@/utils/members-service";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("member_session")?.value;
    const headerToken = req.headers.get("x-member-token");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = verifyMemberSessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const member = await getMemberById(session.id);
    if (!member) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    if (member.status === "LOCKED") {
      const response = NextResponse.json({
        authenticated: false,
        user: null,
        locked: true,
        message: "Tài khoản của bạn đã bị khóa.",
      });
      response.cookies.delete("member_session");
      return response;
    }

    const safeUser = toSafeMember(member);
    const requiresProfileCompletion =
      !safeUser.full_name ||
      safeUser.full_name.trim() === "" ||
      !safeUser.zalo ||
      safeUser.zalo.trim() === "";

    return NextResponse.json({
      authenticated: true,
      user: safeUser,
      requiresProfileCompletion,
    });
  } catch (error) {
    console.error("Lỗi API /api/auth/me:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
