import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title") || "ShopTFTMobile – Thuê Acc TFT & ĐTCL Uy Tín";
    const type = searchParams.get("type") || "general";
    const category = searchParams.get("category") || (type === "blog" ? "Cẩm Nang TFT" : "Kho Acc TFT");
    const badge = searchParams.get("badge") || "Tuấn Thái Bình TFT";
    const price = searchParams.get("price");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            backgroundImage: "radial-gradient(circle at 25px 25px, #18181b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #18181b 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            color: "#ffffff",
            padding: "60px 70px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle gold glow accent */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              filter: "blur(90px)",
            }}
          />

          {/* Top Bar: Brand & Badges */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000000",
                  fontWeight: 900,
                  fontSize: "24px",
                }}
              >
                T
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
                  ShopTFT<span style={{ color: "#f59e0b" }}>Mobile</span>
                </span>
                <span style={{ fontSize: "12px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  shoptftmobile.net
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#e4e4e7",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {category}
              </span>
              <span
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#fbbf24",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {badge}
              </span>
            </div>
          </div>

          {/* Center Content: Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "980px" }}>
            <h1
              style={{
                fontSize: title.length > 55 ? "44px" : "54px",
                fontWeight: 900,
                lineHeight: 1.18,
                letterSpacing: "-1.5px",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {title}
            </h1>
            {price && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#34d399" }}>
                  {price}
                </span>
                <span style={{ fontSize: "16px", color: "#a1a1aa" }}>
                  • Bàn giao an toàn qua Zalo
                </span>
              </div>
            )}
          </div>

          {/* Bottom Bar: Trust Indicators */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "28px", color: "#a1a1aa", fontSize: "15px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                🛡️ Bảo Hiểm 30M Checkscam
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                ⚡ Bàn Giao Zalo 1-1 Uy Tín
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                👑 Cựu Thách Đấu ĐTCL
              </span>
            </div>

            <span style={{ fontSize: "14px", color: "#71717a", fontFamily: "monospace" }}>
              Zalo: 0969.04.5505
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
