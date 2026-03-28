/**
 * Deterministic flood risk scoring engine.
 *
 * All risk scores are computed using explicit, rule-based logic.
 * AI is NOT involved in this calculation — every point is traceable
 * to a specific input signal and a documented scoring rule.
 *
 * Score breakdown (max 100):
 *   Rainfall score        0–35
 *   Area vulnerability    0–25
 *   Active reports        0–15
 *   Nearby flood points   0–15
 *   Water alert status    0–10
 *                        ─────
 *   Total (capped)        0–100
 *
 * Risk level thresholds:
 *   0–29   → low    (Aman)
 *   30–59  → medium (Waspada)
 *   60–100 → high   (Bahaya)
 */

import type {
  RainfallLevel,
  VulnerabilityLevel,
  RiskLevel,
  FloodRiskSignals,
  RiskEngineResult,
} from "@/types/risk";

// ── Input ─────────────────────────────────────────────────────────────────────

export interface RiskInput {
  area: string;
  rainfallLevel: RainfallLevel;
  vulnerabilityLevel: VulnerabilityLevel;
  activeFloodReportsCount: number;
  nearbyFloodPointsCount: number;
  waterAlertStatus?: "normal" | "alert" | "danger";
}

// ── Scoring sub-functions ─────────────────────────────────────────────────────

/**
 * Rainfall score (max 35).
 * Source: BMKG weather forecast → normalized RainfallLevel.
 */
function scoreRainfall(level: RainfallLevel): {
  score: number;
  factor: string | null;
} {
  switch (level) {
    case "heavy":
      return {
        score: 35,
        factor: "Curah hujan lebat terdeteksi di area ini",
      };
    case "medium":
      return {
        score: 20,
        factor: "Curah hujan sedang terdeteksi di area ini",
      };
    case "light":
      return {
        score: 10,
        factor: "Curah hujan ringan terdeteksi di area ini",
      };
    case "none":
      return { score: 0, factor: null };
  }
}

/**
 * Area vulnerability score (max 25).
 * Source: AREA_VULNERABILITY static mapping in area-mapping.ts.
 */
function scoreVulnerability(level: VulnerabilityLevel): {
  score: number;
  factor: string | null;
} {
  switch (level) {
    case "high":
      return {
        score: 25,
        factor: "Area termasuk wilayah yang sangat rawan banjir",
      };
    case "medium":
      return {
        score: 15,
        factor: "Area memiliki kerentanan banjir sedang",
      };
    case "low":
      return { score: 5, factor: null };
  }
}

/**
 * Active flood reports score (max 15).
 * Source: AREA_BASELINE (or future DB query) in area-mapping.ts.
 */
function scoreActiveReports(count: number): {
  score: number;
  factor: string | null;
} {
  if (count >= 4)
    return {
      score: 15,
      factor: `Terdapat ${count} laporan banjir aktif di area ini`,
    };
  if (count >= 2)
    return {
      score: 10,
      factor: `Terdapat ${count} laporan banjir aktif di area ini`,
    };
  if (count === 1)
    return { score: 5, factor: "Terdapat 1 laporan banjir aktif di area ini" };
  return { score: 0, factor: null };
}

/**
 * Nearby flood-prone points score (max 15).
 * Source: AREA_BASELINE (or future DB query) in area-mapping.ts.
 */
function scoreNearbyFloodPoints(count: number): {
  score: number;
  factor: string | null;
} {
  if (count >= 3)
    return {
      score: 15,
      factor: `Terdapat ${count} titik rawan banjir di sekitar area`,
    };
  if (count === 2)
    return {
      score: 12,
      factor: "Terdapat 2 titik rawan banjir di sekitar area",
    };
  if (count === 1)
    return {
      score: 8,
      factor: "Terdapat 1 titik rawan banjir di sekitar area",
    };
  return { score: 0, factor: null };
}

/**
 * Water alert / flood gate status score (max 10).
 * Source: AREA_BASELINE (or future Pintu Air API) in area-mapping.ts.
 */
function scoreWaterAlert(status: "normal" | "alert" | "danger" | undefined): {
  score: number;
  factor: string | null;
} {
  switch (status) {
    case "danger":
      return { score: 10, factor: "Status siaga air dalam kondisi BAHAYA" };
    case "alert":
      return { score: 5, factor: "Status siaga air dalam kondisi WASPADA" };
    default:
      return { score: 0, factor: null };
  }
}

// ── Level derivation ──────────────────────────────────────────────────────────

function deriveRiskLevel(score: number): RiskLevel {
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Computes a deterministic flood risk score and level for the given signals.
 *
 * Every factor that contributes to the score above zero produces a
 * human-readable Bahasa Indonesia factor string included in the result.
 * Factors with zero contribution are intentionally omitted to keep the
 * explanation focused.
 */
export function calculateFloodRisk(input: RiskInput): RiskEngineResult {
  const rainfall = scoreRainfall(input.rainfallLevel);
  const vulnerability = scoreVulnerability(input.vulnerabilityLevel);
  const reports = scoreActiveReports(input.activeFloodReportsCount);
  const floodPoints = scoreNearbyFloodPoints(input.nearbyFloodPointsCount);
  const waterAlert = scoreWaterAlert(input.waterAlertStatus);

  const rawScore =
    rainfall.score +
    vulnerability.score +
    reports.score +
    floodPoints.score +
    waterAlert.score;

  const score = Math.min(100, rawScore);
  const level = deriveRiskLevel(score);

  // Collect only the factors that actually contributed to the score
  const factors: string[] = [
    rainfall.factor,
    vulnerability.factor,
    reports.factor,
    floodPoints.factor,
    waterAlert.factor,
  ].filter((f): f is string => f !== null);

  // weatherSummary is filled in by the API route after BMKG fetch
  const normalizedSignals: FloodRiskSignals = {
    rainfallLevel: input.rainfallLevel,
    weatherSummary: "",
    vulnerabilityLevel: input.vulnerabilityLevel,
    activeFloodReportsCount: input.activeFloodReportsCount,
    nearbyFloodPointsCount: input.nearbyFloodPointsCount,
    waterAlertStatus: input.waterAlertStatus ?? "normal",
  };

  return { score, level, factors, normalizedSignals };
}
