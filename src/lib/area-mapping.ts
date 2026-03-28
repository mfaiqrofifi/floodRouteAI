import type { VulnerabilityLevel } from "@/types/risk";

/**
 * Maps Jakarta area names to their BMKG ADM4 kelurahan codes.
 *
 * ADM4 codes follow the BPS (Statistics Indonesia) format:
 *   PP KK DD OOOO
 *   PP   = Province (31 = DKI Jakarta)
 *   KK   = City (71=Pusat, 72=Utara, 73=Barat, 74=Selatan, 75=Timur)
 *   DD   = District (kecamatan) number
 *   OOOO = Village (kelurahan) number
 *
 * We select 3 representative kelurahan per city area.
 * More codes can be added to improve forecast accuracy.
 *
 * TODO: Verify each code against the live BMKG API before deploying to production:
 *   curl "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<CODE>"
 */
export const AREA_TO_ADM4: Record<string, string[]> = {
  // Jakarta Pusat (3171)
  // Higher ground, government district. Less prone to flooding.
  "Jakarta Pusat": [
    "3171041001", // Senen — TODO: verify kelurahan suffix
    "3171071001", // Tanah Abang — TODO: verify
    "3171061001", // Menteng — TODO: verify
  ],

  // Jakarta Utara (3172)
  // Coastal area, severe land subsidence, tidal flooding risk.
  "Jakarta Utara": [
    "3172011001", // Penjaringan — TODO: verify
    "3172021001", // Tanjung Priok — TODO: verify
    "3172041001", // Koja — TODO: verify
  ],

  // Jakarta Barat (3173)
  // Low elevation, dense population, drainage capacity issues.
  "Jakarta Barat": [
    "3173011001", // Tambora — TODO: verify
    "3173071001", // Cengkareng — TODO: verify
    "3173031001", // Grogol Petamburan — TODO: verify
  ],

  // Jakarta Selatan (3174)
  // Relatively higher elevation. Better drainage but Ciliwung river risk.
  "Jakarta Selatan": [
    "3174011001", // Tebet — TODO: verify
    "3174051001", // Pasar Minggu — TODO: verify
    "3174071001", // Cilandak — TODO: verify
  ],

  // Jakarta Timur (3175)
  // Mixed elevation, Ciliwung and Cipinang river corridors.
  "Jakarta Timur": [
    "3175011001", // Matraman — TODO: verify
    "3175031001", // Jatinegara — TODO: verify
    "3175051001", // Cakung — TODO: verify
  ],
};

/**
 * Deterministic baseline vulnerability per Jakarta area.
 *
 * Based on:
 * - BPBD DKI Jakarta historical flood data
 * - Topographic elevation maps (DEMNAS)
 * - Drainage infrastructure capacity assessments
 * - Land subsidence rates (LIPI / Kementerian PUPR)
 *
 * This is a static input — NOT random, NOT from AI.
 * Update when official BPBD data is refreshed.
 */
export const AREA_VULNERABILITY: Record<string, VulnerabilityLevel> = {
  "Jakarta Barat": "high", // Lowest elevation, critical drainage issues, Kali Angke
  "Jakarta Utara": "high", // Coastal subsidence, tidal flooding, Pluit area
  "Jakarta Timur": "medium", // Ciliwung/Cipinang corridors, mixed elevation
  "Jakarta Selatan": "medium", // Higher elevation, pero Ciliwung kanan still at risk
  "Jakarta Pusat": "low", // Government zone, better infrastructure, higher ground
};

/**
 * Deterministic baseline flood context data per area.
 *
 * These values represent typical rainy-season (November–March) baselines
 * derived from BPBD DKI Jakarta historical flood event records.
 *
 * activeFloodReportsCount: typical number of active warga reports during peak rainy season
 * nearbyFloodPointsCount:  number of registered flood-prone points (titik rawan banjir)
 * waterAlertStatus:        typical Pintu Air (water gate) alert status in heavy rain
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO: Replace this static object with a live database query, e.g. Supabase:
 *
 *   const { data } = await supabase
 *     .from("flood_reports")
 *     .select("count", { count: "exact" })
 *     .eq("area", areaName)
 *     .eq("status", "active");
 *
 *   const { data: floodPoints } = await supabase
 *     .from("flood_points")
 *     .select("id")
 *     .eq("area", areaName);
 *
 *   const { data: waterAlert } = await supabase
 *     .from("water_gate_status")
 *     .select("status")
 *     .eq("area", areaName)
 *     .single();
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const AREA_BASELINE: Record<
  string,
  {
    activeFloodReportsCount: number;
    nearbyFloodPointsCount: number;
    waterAlertStatus: "normal" | "alert" | "danger";
  }
> = {
  "Jakarta Barat": {
    activeFloodReportsCount: 2,
    nearbyFloodPointsCount: 3,
    waterAlertStatus: "alert",
  },
  "Jakarta Utara": {
    activeFloodReportsCount: 3,
    nearbyFloodPointsCount: 3,
    waterAlertStatus: "alert",
  },
  "Jakarta Timur": {
    activeFloodReportsCount: 1,
    nearbyFloodPointsCount: 2,
    waterAlertStatus: "normal",
  },
  "Jakarta Selatan": {
    activeFloodReportsCount: 1,
    nearbyFloodPointsCount: 1,
    waterAlertStatus: "normal",
  },
  "Jakarta Pusat": {
    activeFloodReportsCount: 0,
    nearbyFloodPointsCount: 1,
    waterAlertStatus: "normal",
  },
};

/** Ordered list of supported area names for UI selectors and validation. */
export const SUPPORTED_AREAS = Object.keys(AREA_TO_ADM4);
