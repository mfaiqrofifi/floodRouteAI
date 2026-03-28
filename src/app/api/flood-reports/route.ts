import { NextRequest, NextResponse } from "next/server";
import {
  createFloodReport,
  listFloodReports,
} from "@/lib/reports/repository";
import { isWithinJakartaArea } from "@/lib/geo/jakarta-area";
import type { FloodReportCreateInput } from "@/types/report";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const area = req.nextUrl.searchParams.get("area") ?? undefined;
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 20;

    const data = await listFloodReports(area, Number.isNaN(limit) ? 20 : limit);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[flood-reports] GET failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat laporan banjir." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<FloodReportCreateInput>;

    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      typeof body.waterDepthCm !== "number" ||
      typeof body.roadPassable !== "boolean" ||
      typeof body.description !== "string" ||
      body.description.trim().length < 3
    ) {
      return NextResponse.json(
        {
          error:
            "Payload laporan tidak valid. Latitude, longitude, waterDepthCm, roadPassable, dan description wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!isWithinJakartaArea(body.latitude, body.longitude)) {
      return NextResponse.json(
        {
          error: "Saat ini pelaporan hanya tersedia untuk wilayah DKI Jakarta.",
        },
        { status: 400 },
      );
    }

    const report = await createFloodReport({
      latitude: body.latitude,
      longitude: body.longitude,
      waterDepthCm: Math.max(0, Math.round(body.waterDepthCm)),
      roadPassable: body.roadPassable,
      description: body.description.trim(),
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("[flood-reports] POST failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan laporan banjir." },
      { status: 500 },
    );
  }
}
