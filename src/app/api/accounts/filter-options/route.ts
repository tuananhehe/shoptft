import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

function removeAccents(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Danh sách các Tướng Tí Nị / Chibi cơ sở phổ biến nhất trong ĐTCL để gom nhóm thông minh
const BASE_CHAMPIONS = [
  "Ahri", "Gwen", "Yasuo", "Yone", "Jinx", "Irelia", "Lee Sin", "Shyvana",
  "Aatrox", "Sett", "Kaisa", "Zed", "Akali", "Sona", "Morgana", "Tristana",
  "Teemo", "Vayne", "Senna", "Riven", "Pyke", "Katarina", "Warwick", "Kayle",
  "Ashe", "Ezreal", "Lux", "Malphite", "Vi", "Ekko", "Caitlyn", "Annie"
];

export async function GET(req: NextRequest) {
  try {
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("id, code, type, title, champions, arenas, features, status, hourly_price, price, daily_price, created_at");

    if (error) {
      console.warn("Lỗi tải filter options:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const allRows = accounts || [];

    // 1. Thống kê Pet / Chibi
    const petMap = new Map<string, number>();
    const baseGroupMap = new Map<string, number>();

    allRows.forEach((acc) => {
      // Từ mảng champions
      if (Array.isArray(acc.champions)) {
        acc.champions.forEach((champ: string) => {
          const c = (champ || "").trim();
          if (!c) return;
          petMap.set(c, (petMap.get(c) || 0) + 1);

          // Phân loại vào tướng cơ sở
          const normChamp = removeAccents(c);
          BASE_CHAMPIONS.forEach((base) => {
            if (normChamp.includes(removeAccents(base))) {
              baseGroupMap.set(base, (baseGroupMap.get(base) || 0) + 1);
            }
          });
        });
      }

      // Từ title của acc clone (ví dụ: K/DA Ahri Đột Phá, SIÊU PHẨM: Vayne)
      if (acc.type === "CLONE" && acc.title) {
        const normTitle = removeAccents(acc.title);
        BASE_CHAMPIONS.forEach((base) => {
          if (normTitle.includes(removeAccents(base))) {
            baseGroupMap.set(base, (baseGroupMap.get(base) || 0) + 1);
            // Thêm title vào danh sách pet cụ thể
            petMap.set(acc.title.trim(), (petMap.get(acc.title.trim()) || 0) + 1);
          }
        });
      }
    });

    // 2. Thống kê Sân đấu (loại trừ 'Chưa xác định' và rỗng)
    const arenaMap = new Map<string, number>();
    allRows.forEach((acc) => {
      if (Array.isArray(acc.arenas)) {
        acc.arenas.forEach((arena: string) => {
          const ar = (arena || "").trim();
          if (!ar || ar === "Chưa xác định") return;
          arenaMap.set(ar, (arenaMap.get(ar) || 0) + 1);
        });
      }
    });

    // Sắp xếp theo độ phổ biến (count giảm dần)
    const baseGroups = Array.from(baseGroupMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const specificPets = Array.from(petMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const arenas = Array.from(arenaMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Thống kê tổng số
    const stats = {
      total: allRows.length,
      vip: allRows.filter((r) => r.type === "VIP").length,
      clone: allRows.filter((r) => r.type === "CLONE").length,
      available: allRows.filter((r) => (r.status || "").toUpperCase() !== "RENTED").length,
      rented: allRows.filter((r) => (r.status || "").toUpperCase() === "RENTED").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        baseGroups,
        specificPets,
        arenas,
        stats,
      },
    });
  } catch (err: any) {
    console.error("Lỗi filter-options:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
