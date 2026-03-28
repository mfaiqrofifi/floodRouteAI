import { revalidatePath, revalidateTag } from "next/cache";
import { randomUUID } from "crypto";
import { getSql, hasDatabaseConfig } from "@/lib/db/neon";
import { detectJakartaArea } from "@/lib/geo/jakarta-area";
import {
  formatWaterDepthLabel,
  scoreFloodReport,
} from "@/lib/reports/scoring";
import type {
  FloodReportCreateInput,
  FloodReportListResponse,
  FloodReportMapItem,
  FloodReportMetrics,
  FloodReportRecord,
  JakartaAreaName,
} from "@/types/report";

const JAKARTA_AREAS: JakartaAreaName[] = [
  "Jakarta Barat",
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Timur",
  "Jakarta Utara",
];

let tableReady = false;

interface FloodReportRow {
  id: string;
  latitude: number;
  longitude: number;
  area: JakartaAreaName;
  sub_area: string | null;
  water_depth_cm: number;
  road_passable: boolean;
  description: string;
  score: number;
  status_label: "Aman" | "Waspada" | "Bahaya";
  reported_at: string;
}

interface FloodReportTotalsRow {
  total_reports: number;
  reports_today: number;
}

interface FloodReportAreaMetricRow {
  area: JakartaAreaName;
  report_count: number;
  weighted_count: number;
}

function mapRowToRecord(row: FloodReportRow): FloodReportRecord {
  return {
    id: row.id,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    area: row.area,
    subArea: row.sub_area,
    waterDepthCm: Number(row.water_depth_cm),
    roadPassable: row.road_passable,
    description: row.description,
    score: Number(row.score),
    statusLabel: row.status_label,
    reportedAt: row.reported_at,
  };
}

function toMapItem(report: FloodReportRecord): FloodReportMapItem {
  return {
    ...report,
    riskLevel:
      report.statusLabel === "Bahaya"
        ? "high"
        : report.statusLabel === "Waspada"
          ? "medium"
          : "low",
    locationTitle: report.subArea ? `${report.subArea}, ${report.area}` : report.area,
    waterDepthLabel: formatWaterDepthLabel(report.waterDepthCm),
  };
}

export async function ensureFloodReportsTable(): Promise<void> {
  if (!hasDatabaseConfig()) {
    throw new Error("DATABASE_URL is not configured for Neon.");
  }

  if (tableReady) return;

  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS flood_reports (
      id UUID PRIMARY KEY,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      area TEXT NOT NULL,
      sub_area TEXT,
      water_depth_cm INTEGER NOT NULL CHECK (water_depth_cm >= 0),
      road_passable BOOLEAN NOT NULL,
      description TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      status_label TEXT NOT NULL,
      reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS flood_reports_reported_at_idx
      ON flood_reports (reported_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS flood_reports_area_idx
      ON flood_reports (area)`;

  tableReady = true;
}

export async function createFloodReport(
  input: FloodReportCreateInput,
): Promise<FloodReportMapItem> {
  await ensureFloodReportsTable();

  const area = detectJakartaArea(input.latitude, input.longitude);
  const severity = scoreFloodReport(area, input.waterDepthCm, input.roadPassable);
  const sql = getSql();
  const id = randomUUID();

  const rows = (await sql`
    INSERT INTO flood_reports (
      id,
      latitude,
      longitude,
      area,
      sub_area,
      water_depth_cm,
      road_passable,
      description,
      score,
      status_label
    )
    VALUES (
      ${id},
      ${input.latitude},
      ${input.longitude},
      ${area},
      ${null},
      ${input.waterDepthCm},
      ${input.roadPassable},
      ${input.description},
      ${severity.score},
      ${severity.statusLabel}
    )
    RETURNING
      id,
      latitude,
      longitude,
      area,
      sub_area,
      water_depth_cm,
      road_passable,
      description,
      score,
      status_label,
      reported_at
  `) as FloodReportRow[];

  const report = toMapItem(mapRowToRecord(rows[0]));

  revalidateTag("jakarta-area-status");
  revalidatePath("/");
  revalidatePath("/flood-map");
  revalidatePath("/report-flood");

  return report;
}

export async function listFloodReports(
  area?: string,
  limit = 20,
): Promise<FloodReportListResponse> {
  if (!hasDatabaseConfig()) {
    return { reports: [], total: 0 };
  }

  await ensureFloodReportsTable();

  const sql = getSql();
  const cappedLimit = Math.min(Math.max(limit, 1), 100);

  const rows = (area
    ? await sql`
        SELECT
          id,
          latitude,
          longitude,
          area,
          sub_area,
          water_depth_cm,
          road_passable,
          description,
          score,
          status_label,
          reported_at
        FROM flood_reports
        WHERE area = ${area}
        ORDER BY reported_at DESC
        LIMIT ${cappedLimit}
      `
    : await sql`
        SELECT
          id,
          latitude,
          longitude,
          area,
          sub_area,
          water_depth_cm,
          road_passable,
          description,
          score,
          status_label,
          reported_at
        FROM flood_reports
        ORDER BY reported_at DESC
        LIMIT ${cappedLimit}
      `) as FloodReportRow[];

  return {
    reports: rows.map((row) => toMapItem(mapRowToRecord(row))),
    total: rows.length,
  };
}

export async function getFloodReportMetrics(): Promise<FloodReportMetrics> {
  if (!hasDatabaseConfig()) {
    const zeroByArea = Object.fromEntries(
      JAKARTA_AREAS.map((areaName) => [areaName, 0]),
    ) as Record<JakartaAreaName, number>;

    return {
      totalReports: 0,
      reportsToday: 0,
      byArea: zeroByArea,
      weightedByArea: { ...zeroByArea },
    };
  }

  await ensureFloodReportsTable();

  const sql = getSql();

  const totalsRows = (await sql`
    SELECT
      COUNT(*)::int AS total_reports,
      COUNT(*) FILTER (WHERE reported_at >= NOW() - INTERVAL '1 day')::int AS reports_today
    FROM flood_reports
  `) as FloodReportTotalsRow[];
  const totals = totalsRows[0];

  const byAreaRows = (await sql`
    SELECT
      area,
      COUNT(*)::int AS report_count,
      SUM(CASE WHEN road_passable THEN 1 ELSE 2 END)::int AS weighted_count
    FROM flood_reports
    GROUP BY area
  `) as FloodReportAreaMetricRow[];

  const byArea = Object.fromEntries(
    JAKARTA_AREAS.map((areaName) => [areaName, 0]),
  ) as Record<JakartaAreaName, number>;
  const weightedByArea = Object.fromEntries(
    JAKARTA_AREAS.map((areaName) => [areaName, 0]),
  ) as Record<JakartaAreaName, number>;

  for (const row of byAreaRows) {
    byArea[row.area] = Number(row.report_count);
    weightedByArea[row.area] = Number(row.weighted_count);
  }

  return {
    totalReports: Number(totals?.total_reports ?? 0),
    reportsToday: Number(totals?.reports_today ?? 0),
    byArea,
    weightedByArea,
  };
}
