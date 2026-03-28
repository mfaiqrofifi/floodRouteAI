/**
 * POST /api/risk/check
 *
 * Orchestrates the full flood risk pipeline:
 *   1. Validate input
 *   2. Use the shared Jakarta source-of-truth pipeline
 *   3. Generate AI explanation
 *   4. Return structured JSON response
 *
 * The risk SCORE is always computed deterministically regardless of AI
 * availability. AI only generates the plain-language explanation and actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateFloodExplanation } from "@/lib/ai";
import { SUPPORTED_AREAS } from "@/lib/area-mapping";
import { getJakartaAreaRiskSnapshot } from "@/lib/jakarta-area-status";
import type { CheckRiskRequest, FloodRiskResponse } from "@/types/risk";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).area !== "string"
  ) {
    return NextResponse.json(
      { error: 'Missing required field: "area" (string).' },
      { status: 400 },
    );
  }

  const { area } = body as CheckRiskRequest;
  const trimmedArea = area.trim();

  if (!SUPPORTED_AREAS.includes(trimmedArea)) {
    return NextResponse.json(
      {
        error: `Area "${trimmedArea}" tidak didukung.`,
        supportedAreas: SUPPORTED_AREAS,
      },
      { status: 400 },
    );
  }

  const snapshot = await getJakartaAreaRiskSnapshot(trimmedArea);

  const aiExplanation = await generateFloodExplanation({
    area: trimmedArea,
    riskScore: snapshot.riskScore,
    riskLevel: snapshot.riskLevel,
    rainfallLevel: snapshot.signals.rainfallLevel,
    weatherSummary: snapshot.signals.weatherSummary,
    vulnerabilityLevel: snapshot.signals.vulnerabilityLevel,
    activeFloodReportsCount: snapshot.signals.activeFloodReportsCount,
    nearbyFloodPointsCount: snapshot.signals.nearbyFloodPointsCount,
  });

  const response: FloodRiskResponse = {
    area: trimmedArea,
    riskScore: snapshot.riskScore,
    riskLevel: snapshot.riskLevel,
    factors: snapshot.factors,
    signals: snapshot.signals,
    ai: aiExplanation,
    timestamp: snapshot.timestamp,
  };

  return NextResponse.json(response, { status: 200 });
}
