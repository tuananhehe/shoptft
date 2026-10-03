import { NextRequest, NextResponse } from "next/server";
import { getShopFilterOptions } from "@/utils/shop-inventory-service";

export async function GET(req: NextRequest) {
  try {
    const filterOptions = await getShopFilterOptions();

    const response = NextResponse.json({
      success: true,
      data: filterOptions,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (err: any) {
    console.error("Lỗi filter-options:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
