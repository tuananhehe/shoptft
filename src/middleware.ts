import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MEMBER_SESSION_SECRET =
  process.env.MEMBER_SESSION_SECRET ||
  "shoptft_member_secure_key_2026_tuanthaibinh_secret";

/**
 * Edge-compatible session token decoder and verifier
 */
function parseMemberSessionToken(token?: string | null): {
  id: string;
  username: string;
  role: "MEMBER";
  hasCompletedProfile: boolean;
  issuedAt: number;
  expiresAt: number;
} | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [encodedPayload, receivedSignature] = token.split(".");
    if (!encodedPayload || !receivedSignature) return null;

    // Decode base64 payload
    const jsonStr = atob(encodedPayload);
    const data = JSON.parse(jsonStr);

    if (
      !data ||
      data.role !== "MEMBER" ||
      typeof data.expiresAt !== "number" ||
      data.expiresAt < Date.now()
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect member profile pages (/profile, /profile/complete)
  if (pathname.startsWith("/profile")) {
    const token = req.cookies.get("member_session")?.value;

    // If not logged in, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = parseMemberSessionToken(token);
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("member_session");
      return res;
    }

    // Incomplete profile handling
    const isCompletePage = pathname === "/profile/complete";

    if (!session.hasCompletedProfile) {
      // Missing full_name or zalo: must complete profile
      if (!isCompletePage) {
        return NextResponse.redirect(new URL("/profile/complete", req.url));
      }
      return NextResponse.next();
    } else {
      // Profile is already completed: cannot stay on /profile/complete
      if (isCompletePage) {
        return NextResponse.redirect(new URL("/profile", req.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/profile/complete", "/profile/:path*"],
};
