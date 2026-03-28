import { AREA_VULNERABILITY } from "@/lib/area-mapping";
import type { JakartaAreaName } from "@/types/report";
import type { RiskLevel, VulnerabilityLevel } from "@/types/risk";

export interface FloodReportSeverityResult {
  score: number;
  statusLabel: "Aman" | "Waspada" | "Bahaya";
  riskLevel: RiskLevel;
}

function vulnerabilityBase(level: VulnerabilityLevel): number {
  switch (level) {
    case "high":
      return 18;
    case "medium":
      return 10;
    case "low":
      return 4;
  }
}

function waterDepthScore(waterDepthCm: number): number {
  if (waterDepthCm >= 90) return 50;
  if (waterDepthCm >= 50) return 35;
  if (waterDepthCm >= 20) return 20;
  if (waterDepthCm >= 5) return 10;
  return 0;
}

export function scoreFloodReport(
  area: JakartaAreaName,
  waterDepthCm: number,
  roadPassable: boolean,
): FloodReportSeverityResult {
  const vulnerability = AREA_VULNERABILITY[area] ?? "medium";
  const baseScore = vulnerabilityBase(vulnerability);
  const depthScore = waterDepthScore(waterDepthCm);
  const roadPenalty = roadPassable ? 0 : 15;

  const score = Math.min(100, baseScore + depthScore + roadPenalty);

  if (score >= 65) {
    return { score, statusLabel: "Bahaya", riskLevel: "high" };
  }

  if (score >= 35) {
    return { score, statusLabel: "Waspada", riskLevel: "medium" };
  }

  return { score, statusLabel: "Aman", riskLevel: "low" };
}

export function formatWaterDepthLabel(waterDepthCm: number): string {
  if (waterDepthCm >= 90) return "Dalam (90+ cm)";
  if (waterDepthCm >= 50) return "Setinggi lutut";
  if (waterDepthCm >= 20) return "Setinggi betis";
  if (waterDepthCm >= 5) return "Genangan ringan";
  return "< 5 cm";
}
