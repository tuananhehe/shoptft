import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import seoConfig from "@/data/seo-config.json";

const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "shoptft_secure_master_key_2026_tuanthaibinh";

const MEMBER_SESSION_SECRET =
  process.env.MEMBER_SESSION_SECRET ||
  "shoptft_member_secure_key_2026_tuanthaibinh_secret";

/**
 * Standard Web Crypto HMAC-SHA256 signature verification (Edge & Node compatible)
 */
async function verifyHmacSha256(secret: string, data: string, signatureHex: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return false;
    const sigBytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
    return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
  } catch {
    return false;
  }
}

/**
 * Edge-compatible Admin session token verifier
 */
async function verifyAdminSession(token?: string | null): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  try {
    const [encodedPayload, receivedSignature] = token.split(".");
    if (!encodedPayload || !receivedSignature) return false;

    const payloadStr = atob(encodedPayload);
    const data = JSON.parse(payloadStr);

    if (
      !data ||
      data.role !== "ADMIN" ||
      typeof data.expiresAt !== "number" ||
      data.expiresAt < Date.now()
    ) {
      return false;
    }

    return await verifyHmacSha256(ADMIN_SESSION_SECRET, payloadStr, receivedSignature);
  } catch {
    return false;
  }
}

/**
 * Edge-compatible Member session token verifier
 */
async function verifyMemberSession(token?: string | null): Promise<{
  id: string;
  username: string;
  role: "MEMBER";
  hasCompletedProfile: boolean;
  issuedAt: number;
  expiresAt: number;
} | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [encodedPayload, receivedSignature] = token.split(".");
    if (!encodedPayload || !receivedSignature) return null;

    const payloadStr = atob(encodedPayload);
    const data = JSON.parse(payloadStr);

    if (
      !data ||
      data.role !== "MEMBER" ||
      typeof data.expiresAt !== "number" ||
      data.expiresAt < Date.now()
    ) {
      return null;
    }

    const isValid = await verifyHmacSha256(MEMBER_SESSION_SECRET, payloadStr, receivedSignature);
    if (!isValid) return null;

    return data;
  } catch {
    return null;
  }
}

function applySecurityHeaders(res: NextResponse, pathname: string): NextResponse {
  // Prevent clickjacking
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Prevent MIME type sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Restrict sensitive browser features
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Robots meta tag for private paths (defense-in-depth)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // -1. DOMAIN CANONICALIZATION (Apex -> WWW, and shoptftmobile.com -> shoptftmobile.net)
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase().split(":")[0];
  if (
    host === "shoptftmobile.com" ||
    host === "www.shoptftmobile.com" ||
    host === "shoptftmobile.net"
  ) {
    const canonicalUrl = new URL(req.url);
    canonicalUrl.protocol = "https:";
    canonicalUrl.host = "www.shoptftmobile.net";
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // 0. URL REDIRECTS (SEO Rules)
  const normalizedPathname = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const activeRedirects = (seoConfig as any)?.redirects || [];
  const matchedRedirect = activeRedirects.find((r: any) => {
    if (!r.enabled || !r.source) return false;
    const cleanSource = r.source.trim().length > 1 && r.source.trim().endsWith("/")
      ? r.source.trim().slice(0, -1)
      : r.source.trim();
    return cleanSource.toLowerCase() === normalizedPathname.toLowerCase();
  });
  if (matchedRedirect) {
    const dest = matchedRedirect.destination?.trim();
    if (dest) {
      const destUrl = dest.startsWith("http") ? new URL(dest) : new URL(dest, req.url);
      return NextResponse.redirect(destUrl, matchedRedirect.permanent ? 301 : 302);
    }
  }

  // 1. ADMIN AUTHORIZATION (Server-side route gate)
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const adminToken =
      req.cookies.get("admin_session")?.value ||
      req.cookies.get("shoptft_admin_session")?.value;
    const isValidAdmin = await verifyAdminSession(adminToken);

    if (isLoginPage) {
      if (isValidAdmin) {
        const adminUrl = new URL("/admin", req.url);
        return applySecurityHeaders(NextResponse.redirect(adminUrl), pathname);
      }
      return applySecurityHeaders(NextResponse.next(), pathname);
    }

    // All /admin/* routes require valid admin session
    if (!isValidAdmin) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      if (adminToken) {
        res.cookies.delete("admin_session");
        res.cookies.delete("shoptft_admin_session");
      }
      return applySecurityHeaders(res, pathname);
    }

    return applySecurityHeaders(NextResponse.next(), pathname);
  }

  // 2. MEMBER PROFILE PERMISSIONS & ROUTING
  if (pathname.startsWith("/profile")) {
    const token = req.cookies.get("member_session")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), pathname);
    }

    const session = await verifyMemberSession(token);
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("member_session");
      return applySecurityHeaders(res, pathname);
    }

    // Incomplete profile flow
    const isCompletePage = pathname === "/profile/complete";

    if (!session.hasCompletedProfile) {
      // Incomplete: redirect to /profile/complete
      if (!isCompletePage) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL("/profile/complete", req.url)),
          pathname
        );
      }
      return applySecurityHeaders(NextResponse.next(), pathname);
    } else {
      // Completed: cannot access /profile/complete again
      if (isCompletePage) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL("/profile", req.url)),
          pathname
        );
      }
      return applySecurityHeaders(NextResponse.next(), pathname);
    }
  }

  return applySecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
