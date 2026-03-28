import type { RiskLevel } from "@/types/risk";

export type JakartaAreaName =
  | "Jakarta Barat"
  | "Jakarta Selatan"
  | "Jakarta Pusat"
  | "Jakarta Timur"
  | "Jakarta Utara";

export interface FloodReportRecord {
  id: string;
  latitude: number;
  longitude: number;
  area: JakartaAreaName;
  subArea: string | null;
  waterDepthCm: number;
  roadPassable: boolean;
  description: string;
  score: number;
  statusLabel: "Aman" | "Waspada" | "Bahaya";
  reportedAt: string;
}

export interface FloodReportMapItem extends FloodReportRecord {
  riskLevel: RiskLevel;
  locationTitle: string;
  waterDepthLabel: string;
}

export interface FloodReportCreateInput {
  latitude: number;
  longitude: number;
  waterDepthCm: number;
  roadPassable: boolean;
  description: string;
}

export interface FloodReportListResponse {
  reports: FloodReportMapItem[];
  total: number;
}

export interface FloodReportMetrics {
  totalReports: number;
  reportsToday: number;
  byArea: Record<JakartaAreaName, number>;
  weightedByArea: Record<JakartaAreaName, number>;
}
