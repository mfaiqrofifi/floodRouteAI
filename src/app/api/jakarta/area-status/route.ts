import { NextResponse } from "next/server";
import { getCachedJakartaAreaStatus } from "@/lib/jakarta-area-status";
import type { JakartaAreaStatusResponse } from "@/types/risk";

export async function GET(): Promise<NextResponse> {
  try {
    const data: JakartaAreaStatusResponse = await getCachedJakartaAreaStatus();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[jakarta/area-status] Failed to build area status:", error);
    return NextResponse.json(
      { error: "Gagal memuat status area Jakarta." },
      { status: 500 },
    );
  }
}
