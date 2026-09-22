import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

/**
 * GET /auth/callback
 * Xử lý OAuth callback từ Google & Supabase
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error("Lỗi exchangeCodeForSession:", err);
    }
  }

  // Chuyển hướng người dùng về trang chủ
  return NextResponse.redirect(`${origin}${next}`);
}
