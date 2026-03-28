/**
 * osrm.ts — Real routing via OSRM + AI flood-risk scoring
 *
 * Data flow:
 *  1. fetchScoredRoutes() calls router.project-osrm.org (free, no key needed)
 *  2. Each returned route geometry is scored against Jakarta flood-risk zones
 *  3. rankRoutes() applies mode-weighted scoring (safest / balanced / fastest)
 *
 * Routing API: https://router.project-osrm.org (OSRM Demo Server, HTTP/CORS OK)
 * Map tiles:   OpenStreetMap (used inside LeafletMap)
 */

import type { RiskLevel } from "@/lib/utils";

// ── Real Jakarta flood-risk zones (lat, lng, risk 0-100) ─────────────────────
// Sources: BPBD Jakarta historical flood data, topographic elevation data.
// NOTE: These are static reference zones for local scoring. Not real-time.
//       Plug in BPBD Jakarta API or BNPB open data for live updates.
export const FLOOD_ZONES = [
  { lat: -6.1147, lng: 106.7936, risk: 88 }, // Pluit (coastal, very prone)
  { lat: -6.1252, lng: 106.8165, risk: 82 }, // Penjaringan
  { lat: -6.139, lng: 106.8255, risk: 75 }, // Mangga Dua
  { lat: -6.1534, lng: 106.7285, risk: 80 }, // Kali Deres
  { lat: -6.165, lng: 106.75, risk: 70 }, // Cengkareng Timur
  { lat: -6.1667, lng: 106.7864, risk: 55 }, // Grogol
  { lat: -6.18, lng: 106.81, risk: 48 }, // Sawah Besar
  { lat: -6.214, lng: 106.852, risk: 65 }, // Kampung Melayu
  { lat: -6.214, lng: 106.846, risk: 58 }, // Manggarai (Ciliwung)
  { lat: -6.1583, lng: 106.9032, risk: 45 }, // Kelapa Gading
  { lat: -6.2088, lng: 106.8175, risk: 20 }, // Sudirman / SCBD
  { lat: -6.1992, lng: 106.8346, risk: 25 }, // Menteng
  { lat: -6.23, lng: 106.83, risk: 18 }, // Kuningan
  { lat: -6.2615, lng: 106.8136, risk: 35 }, // Kemang
  { lat: -6.3616, lng: 106.8874, risk: 12 }, // Cibubur
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Risk contribution of a single geographic point (0–100). */
function getPointRisk(lat: number, lng: number): number {
  let maxRisk = 8; // baseline low risk
  for (const zone of FLOOD_ZONES) {
    const dist = haversineKm(lat, lng, zone.lat, zone.lng);
    if (dist < 2.5) {
      const influence = zone.risk * Math.max(0, 1 - dist / 2.5);
      maxRisk = Math.max(maxRisk, influence);
    }
  }
  return Math.min(100, Math.round(maxRisk));
}

/** Aggregate route geometry into a risk score. */
function scoreGeometry(coords: [number, number][]): {
  riskScore: number;
  riskLevel: RiskLevel;
  floodProneSegments: number;
} {
  if (!coords.length)
    return { riskScore: 0, riskLevel: "low", floodProneSegments: 0 };
  const step = Math.max(1, Math.floor(coords.length / 40));
  const samples = coords.filter((_, i) => i % step === 0);
  const scores = samples.map(([lat, lng]) => getPointRisk(lat, lng));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const floodProneSegments = scores.filter((s) => s > 40).length;
  const riskScore = Math.round(avg);
  const riskLevel: RiskLevel = avg > 55 ? "high" : avg > 30 ? "medium" : "low";
  return { riskScore, riskLevel, floodProneSegments };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type FloodZone = (typeof FLOOD_ZONES)[number];
export type RouteMode = "safest" | "fastest" | "balanced";

/** A route with geometry + risk scoring but no mode-based ranking yet. */
export interface ScoredRoute {
  id: string;
  geometry: [number, number][]; // [lat, lng] for Leaflet
  distanceKm: number;
  durationMin: number;
  riskScore: number;
  riskLevel: RiskLevel;
  floodProneSegments: number;
}

/** A scored route enriched with mode-based ranking, badge, and explanation. */
export interface RankedRoute extends ScoredRoute {
  rank: number;
  recommended: boolean;
  badge?: string;
  explanation: string[];
}

// ── Explanation generator ─────────────────────────────────────────────────────

function buildExplanation(
  route: ScoredRoute,
  mode: RouteMode,
  rank: number,
): string[] {
  const lines: string[] = [];
  if (rank === 0) {
    if (mode === "safest")
      lines.push(
        `Skor risiko terendah (${route.riskScore}/100) — jalur paling aman berdasarkan analisis zona banjir.`,
      );
    else if (mode === "fastest")
      lines.push(
        `Waktu tempuh terpendek (${route.durationMin} menit) — pilihan tercepat saat ini.`,
      );
    else
      lines.push(
        `Keseimbangan terbaik: risiko ${route.riskScore}/100 dalam estimasi ${route.durationMin} menit.`,
      );
  }
  if (route.floodProneSegments === 0) {
    lines.push("Tidak melewati titik berpotensi tergenang di sepanjang rute.");
  } else {
    lines.push(
      `Melewati ${route.floodProneSegments} titik berpotensi tergenang — tetap waspada.`,
    );
  }
  lines.push(
    `Jarak: ${route.distanceKm.toFixed(1)} km · Estimasi: ${route.durationMin} menit.`,
  );
  return lines;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch routes from OSRM Demo Server, score each route against Jakarta
 * flood-risk zones, and return ScoredRoute[].
 *
 * OSRM uses (lng,lat) order; we convert to (lat,lng) for Leaflet.
 */
export async function fetchScoredRoutes(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<ScoredRoute[]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originLng},${originLat};${destLng},${destLat}` +
    `?alternatives=true&geometries=geojson&overview=full`;

  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error("Layanan routing tidak tersedia saat ini.");

  const data = (await res.json()) as {
    code: string;
    routes: Array<{
      geometry: { coordinates: [number, number][] };
      duration: number;
      distance: number;
    }>;
  };

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("Rute tidak ditemukan antara dua lokasi tersebut.");
  }

  return data.routes.slice(0, 3).map((r, i) => {
    // OSRM returns [lng, lat]; Leaflet wants [lat, lng]
    const geometry: [number, number][] = r.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng],
    );
    return {
      id: `route-${i}`,
      geometry,
      distanceKm: Math.round((r.distance / 1000) * 10) / 10,
      durationMin: Math.round(r.duration / 60),
      ...scoreGeometry(geometry),
    };
  });
}

/**
 * Re-rank already-scored routes for a given mode.
 * Call this whenever the user changes mode — no extra API request needed.
 *
 * Weights:
 *   safest   → risk 80%  · time 10%  · dist 10%
 *   fastest  → risk 20%  · time 60%  · dist 20%
 *   balanced → risk 50%  · time 30%  · dist 20%
 */
export function rankRoutes(
  scoredRoutes: ScoredRoute[],
  mode: RouteMode,
): RankedRoute[] {
  if (!scoredRoutes.length) return [];

  const maxTime = Math.max(...scoredRoutes.map((r) => r.durationMin));
  const maxDist = Math.max(...scoredRoutes.map((r) => r.distanceKm));

  const w =
    mode === "safest"
      ? { risk: 0.8, time: 0.1, dist: 0.1 }
      : mode === "fastest"
        ? { risk: 0.2, time: 0.6, dist: 0.2 }
        : { risk: 0.5, time: 0.3, dist: 0.2 };

  const sorted = [...scoredRoutes]
    .map((r) => ({
      ...r,
      _score:
        w.risk * (r.riskScore / 100) +
        w.time * (r.durationMin / (maxTime || 1)) +
        w.dist * (r.distanceKm / (maxDist || 1)),
    }))
    .sort((a, b) => a._score - b._score);

  const badgeLabel =
    mode === "safest"
      ? "Paling Aman"
      : mode === "fastest"
        ? "Tercepat"
        : "Terbaik";

  return sorted.map((routeWithScore, idx) => {
    const route: ScoredRoute = {
      id: routeWithScore.id,
      geometry: routeWithScore.geometry,
      distanceKm: routeWithScore.distanceKm,
      durationMin: routeWithScore.durationMin,
      riskScore: routeWithScore.riskScore,
      riskLevel: routeWithScore.riskLevel,
      floodProneSegments: routeWithScore.floodProneSegments,
    };

    return {
      ...route,
      rank: idx,
      recommended: idx === 0,
      badge: idx === 0 ? badgeLabel : undefined,
      explanation: buildExplanation(route, mode, idx),
    };
  });
}
