/**
 * Client-safe AI summary types and fallback generator.
 *
 * ──────────────────────────────────────────────────────────
 * DATA SOURCE AUDIT — check-risk feature (2026-03-28)
 * ──────────────────────────────────────────────────────────
 * Field                 Source            Real-time?
 * ─────────────────     ───────────────   ───────────
 * Risk score (0-100)    LOCAL calculation  No  — static CITY_SIGNALS constants
 * Risk level            LOCAL calculation  No  — derived from score thresholds
 * Factors list          LOCAL calculation  No  — derived from CITY_SIGNALS
 * Description text      LOCAL template     No  — string interpolation
 * River/area names      LOCAL constants    No  — static districtRivers map
 * City signals          LOCAL constants    No  — static CITY_SIGNALS mock data
 *   (rainfall, waterLevel, floodReports, drainage)
 * AI explanation        GEMINI API         Yes — calls GEMINI_MODEL (default: gemini-2.5-flash)
 * AI fallback           LOCAL function     No  — used when Gemini unavailable
 *
 * IMPORTANT:
 * The current risk input signals (CITY_SIGNALS) are STATIC DEMO/BASELINE DATA.
 * They represent a typical rainy-season situation for each city and are NOT
 * pulled from a real-time source. To make this feature truly real-time, replace
 * CITY_SIGNALS in check-risk/page.tsx with live API calls, e.g.:
 *   - Rainfall: BMKG forecast API (see src/lib/bmkg.ts)
 *   - Flood reports: Supabase / BPBD Jakarta report feed
 *   - Water level status: PU Jakarta Pintu Air API
 * ──────────────────────────────────────────────────────────
 *
 * This file is intentionally kept free of any external SDK imports
 * so it can be safely imported by both client and server components.
 */

/** Shape of data sent to the AI explainer API route */
export interface GeminiRiskPayload {
  city: string;
  district: string;
  river: string;
  score: number;
  level: "low" | "medium" | "high";
  rainfall: string;
  waterLevel: string;
  floodReports: number;
  drainage: string;
  factors: string[];
  updatedAt: string;
}

/** Response returned by /api/check-risk/explain */
export interface AiSummaryResult {
  summary: string;
  factors: string[];
  recommendation: string;
  /** "gemini" = real Gemini response | "fallback" = local template */
  source: "gemini" | "fallback";
}

// ── Deterministic fallback — intentionally simpler than Gemini output ─────────
//
// This is clearly NOT AI-generated. The tone is shorter and more
// template-like on purpose, so it is visually distinguishable from
// a real Gemini response in the UI.

const LEVEL_LABEL: Record<string, string> = {
  high: "tinggi",
  medium: "sedang",
  low: "rendah",
};

const WATER_LABEL: Record<string, string> = {
  danger: "bahaya",
  alert: "siaga",
  normal: "normal",
};

const RAINFALL_LABEL: Record<string, string> = {
  high: "lebat",
  moderate: "sedang",
  low: "ringan",
};

/**
 * Generates a local fallback summary when Gemini is unavailable.
 * Uses the same input payload so it always references the correct city/district.
 *
 * Intentionally kept shorter and more factual than Gemini output.
 * Source tag: "fallback" — used by the UI to show "Ringkasan Otomatis" label.
 */
export function generateLocalFallback(p: GeminiRiskPayload): AiSummaryResult {
  const level = LEVEL_LABEL[p.level] ?? p.level;
  const rainfall = RAINFALL_LABEL[p.rainfall] ?? p.rainfall;
  const water = WATER_LABEL[p.waterLevel] ?? p.waterLevel;

  let summary: string;
  if (p.level === "high") {
    summary =
      `Risiko banjir di ${p.district} saat ini ${level} (skor ${p.score}/100). ` +
      `Hujan ${rainfall} dan kondisi ${p.river} berstatus ${water}. ` +
      `Terdapat ${p.floodReports} laporan banjir aktif.`;
  } else if (p.level === "medium") {
    summary =
      `${p.district} berstatus waspada dengan skor ${p.score}/100. ` +
      `Curah hujan ${rainfall} dan ${p.river} perlu dipantau.`;
  } else {
    summary =
      `Kondisi di ${p.district} relatif aman (skor ${p.score}/100). ` +
      `Tidak ada indikator banjir signifikan saat ini.`;
  }

  let recommendation: string;
  if (p.level === "high") {
    recommendation =
      `Hindari perjalanan tidak mendesak di sekitar ${p.district}. ` +
      `Bila terpaksa, pilih rute yang lebih tinggi.`;
  } else if (p.level === "medium") {
    recommendation = `Siapkan rute alternatif dan pantau kondisi cuaca setiap 30 menit.`;
  } else {
    recommendation = `Perjalanan bisa dilakukan normal. Tetap bawa payung dan pantau perkembangan cuaca.`;
  }

  return {
    summary,
    factors: p.factors.slice(0, 3),
    recommendation,
    source: "fallback",
  };
}
