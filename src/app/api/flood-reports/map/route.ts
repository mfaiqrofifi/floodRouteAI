import { NextRequest, NextResponse } from "next/server";
import { listFloodReports } from "@/lib/reports/repository";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const area = req.nextUrl.searchParams.get("area") ?? undefined;
    const data = await listFloodReports(area, 100);

    return NextResponse.json(
      {
        reports: data.reports.map((report) => ({
          id: report.id,
          latitude: report.latitude,
          longitude: report.longitude,
          area: report.area,
          description: report.description,
          waterDepthCm: report.waterDepthCm,
          waterDepthLabel: report.waterDepthLabel,
          roadPassable: report.roadPassable,
          score: report.score,
          statusLabel: report.statusLabel,
          riskLevel: report.riskLevel,
          reportedAt: report.reportedAt,
          locationTitle: report.locationTitle,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[flood-reports/map] GET failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat marker laporan banjir." },
      { status: 500 },
    );
  }
}
