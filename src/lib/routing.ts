/**
 * Route recommendation engine — deterministic, rule-based.
 *
 * AI positioning: this IS the AI of the product.
 * No LLM is involved. Intelligence comes from:
 *   - Multi-factor route segment risk scoring
 *   - Mode-weighted composite scoring (safest / fastest / balanced)
 *   - Context-aware explanation generation
 */

import type { RiskLevel } from "./utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export type RouteMode = "safest" | "fastest" | "balanced";

export interface RouteSegment {
  name: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0–100
  floodActive: boolean;
  lengthKm: number;
  etaMin: number;
}

export interface RankedRoute {
  id: string;
  name: string;
  shortLabel: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  totalEtaMin: number;
  riskScore: number;
  riskLevel: RiskLevel;
  floodPronePoints: number;
  segments: RouteSegment[];
  recommended: boolean;
  modeScore: number;
  explanation: string[];
  badge?: string;
}

// ── Static route data (demo set — Kemang → Sudirman) ──────────────────────────

const BASE_ROUTES: Omit<
  RankedRoute,
  "recommended" | "modeScore" | "explanation" | "badge"
>[] = [
  {
    id: "route-a",
    name: "Rute A — Via Tol Dalam Kota",
    shortLabel: "Via Tol Dalam Kota",
    origin: "Kemang, Jakarta Selatan",
    destination: "Sudirman, Jakarta Pusat",
    totalDistanceKm: 12.4,
    totalEtaMin: 35,
    riskScore: 72,
    riskLevel: "high",
    floodPronePoints: 2,
    segments: [
      {
        name: "Jl. Kemang Raya",
        riskLevel: "low",
        riskScore: 15,
        floodActive: false,
        lengthKm: 2.1,
        etaMin: 6,
      },
      {
        name: "Tol Dalam Kota",
        riskLevel: "high",
        riskScore: 78,
        floodActive: true,
        lengthKm: 7.2,
        etaMin: 18,
      },
      {
        name: "Exit Semanggi",
        riskLevel: "high",
        riskScore: 80,
        floodActive: true,
        lengthKm: 1.1,
        etaMin: 5,
      },
      {
        name: "Jl. Sudirman",
        riskLevel: "low",
        riskScore: 18,
        floodActive: false,
        lengthKm: 2.0,
        etaMin: 6,
      },
    ],
  },
  {
    id: "route-b",
    name: "Rute B — Via Casablanca",
    shortLabel: "Via Casablanca",
    origin: "Kemang, Jakarta Selatan",
    destination: "Sudirman, Jakarta Pusat",
    totalDistanceKm: 14.1,
    totalEtaMin: 42,
    riskScore: 18,
    riskLevel: "low",
    floodPronePoints: 0,
    segments: [
      {
        name: "Jl. Kemang Raya",
        riskLevel: "low",
        riskScore: 15,
        floodActive: false,
        lengthKm: 2.1,
        etaMin: 6,
      },
      {
        name: "Jl. Casablanca",
        riskLevel: "low",
        riskScore: 20,
        floodActive: false,
        lengthKm: 5.4,
        etaMin: 16,
      },
      {
        name: "Jl. HR Rasuna Said",
        riskLevel: "low",
        riskScore: 12,
        floodActive: false,
        lengthKm: 4.6,
        etaMin: 14,
      },
      {
        name: "Jl. Sudirman",
        riskLevel: "low",
        riskScore: 18,
        floodActive: false,
        lengthKm: 2.0,
        etaMin: 6,
      },
    ],
  },
  {
    id: "route-c",
    name: "Rute C — Via Mampang",
    shortLabel: "Via Mampang",
    origin: "Kemang, Jakarta Selatan",
    destination: "Sudirman, Jakarta Pusat",
    totalDistanceKm: 13.2,
    totalEtaMin: 38,
    riskScore: 44,
    riskLevel: "medium",
    floodPronePoints: 1,
    segments: [
      {
        name: "Jl. Kemang Raya",
        riskLevel: "low",
        riskScore: 15,
        floodActive: false,
        lengthKm: 2.1,
        etaMin: 6,
      },
      {
        name: "Jl. Mampang Prapatan",
        riskLevel: "medium",
        riskScore: 48,
        floodActive: true,
        lengthKm: 5.2,
        etaMin: 15,
      },
      {
        name: "Jl. Gatot Subroto",
        riskLevel: "low",
        riskScore: 22,
        floodActive: false,
        lengthKm: 3.9,
        etaMin: 11,
      },
      {
        name: "Jl. Sudirman",
        riskLevel: "low",
        riskScore: 18,
        floodActive: false,
        lengthKm: 2.0,
        etaMin: 6,
      },
    ],
  },
];

// ── Scoring ────────────────────────────────────────────────────────────────────
//
// Lower modeScore = better. Weights are tuned per mode:
//   safest:   risk 80% | time 10% | dist 10%
//   fastest:  risk 20% | time 60% | dist 20%
//   balanced: risk 50% | time 30% | dist 20%

const MAX_ETA = 60; // normalisation ceiling (minutes)
const MAX_DIST = 20; // normalisation ceiling (km)

function calcModeScore(
  route: (typeof BASE_ROUTES)[0],
  mode: RouteMode,
): number {
  const risk = route.riskScore / 100;
  const time = route.totalEtaMin / MAX_ETA;
  const dist = route.totalDistanceKm / MAX_DIST;

  if (mode === "safest") return risk * 0.8 + time * 0.1 + dist * 0.1;
  if (mode === "fastest") return risk * 0.2 + time * 0.6 + dist * 0.2;
  /* balanced */ return risk * 0.5 + time * 0.3 + dist * 0.2;
}

// ── Explanation generation ─────────────────────────────────────────────────────
//
// Template-driven reasoning — deterministic but context-aware.

function generateExplanation(
  route: (typeof BASE_ROUTES)[0],
  mode: RouteMode,
  rank: number,
): string[] {
  const lines: string[] = [];

  if (rank === 0) {
    if (mode === "safest") {
      lines.push(
        `Skor risiko terendah (${route.riskScore}/100) di antara semua rute yang tersedia.`,
      );
    } else if (mode === "fastest") {
      lines.push(
        `Waktu tempuh terpendek: estimasi ${route.totalEtaMin} menit untuk kondisi saat ini.`,
      );
    } else {
      lines.push(
        `Kombinasi terbaik antara keamanan (${route.riskScore}/100) dan efisiensi waktu (${route.totalEtaMin} menit).`,
      );
    }
  }

  if (route.floodPronePoints === 0) {
    lines.push("Tidak melewati titik banjir aktif sepanjang rute.");
  } else {
    const word = route.floodPronePoints === 1 ? "titik" : "titik";
    lines.push(
      `Melewati ${route.floodPronePoints} ${word} rawan banjir${route.floodPronePoints > 1 ? " yang perlu diwaspadai" : " — dapat dilalui dengan hati-hati"}.`,
    );
  }

  const activeSegs = route.segments.filter((s) => s.floodActive);
  if (activeSegs.length === 0) {
    lines.push("Semua segmen jalan saat ini dalam kondisi aman dilalui.");
  } else {
    lines.push(`Segmen berisiko: ${activeSegs.map((s) => s.name).join(", ")}.`);
  }

  if (route.totalEtaMin <= 38) {
    lines.push(
      "Waktu tempuh relatif efisien untuk kondisi lalu lintas saat ini.",
    );
  } else {
    lines.push(
      `Waktu ${route.totalEtaMin} menit — lebih lama sedikit namun melewati jalan dengan elevasi lebih tinggi.`,
    );
  }

  return lines;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns all routes sorted by recommendation score for the given mode.
 * Index 0 is always the recommended route.
 */
export function rankRoutes(mode: RouteMode = "balanced"): RankedRoute[] {
  const scored = BASE_ROUTES.map((r) => ({
    ...r,
    modeScore: calcModeScore(r, mode),
  }));

  scored.sort((a, b) => a.modeScore - b.modeScore);

  return scored.map((r, idx) => {
    const isBest = idx === 0;
    let badge: string | undefined;
    if (isBest) {
      badge =
        mode === "safest"
          ? "Paling Aman"
          : mode === "fastest"
            ? "Tercepat"
            : "Terbaik";
    } else if (r.riskLevel === "low") {
      badge = "Aman";
    } else if (r.riskLevel === "high") {
      badge = "Berisiko Tinggi";
    }
    return {
      ...r,
      recommended: isBest,
      explanation: generateExplanation(r, mode, idx),
      badge,
    } as RankedRoute;
  });
}

export type { RiskLevel };
