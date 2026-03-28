/**
 * POST /api/check-risk/explain
 *
 * Receives structured flood-risk signals, calls Gemini to generate a
 * natural-language explanation, and returns the result.
 *
 * This route keeps the GEMINI_API_KEY server-side — it is never
 * exposed to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateGeminiSummary } from "@/lib/gemini";
import type { GeminiRiskPayload } from "@/lib/riskSummary";

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

  const p = body as Partial<GeminiRiskPayload>;

  if (!p.city || !p.district) {
    return NextResponse.json(
      { error: 'Fields "city" and "district" are required.' },
      { status: 400 },
    );
  }

  // Ensure all required fields have sane defaults if caller omits some
  const payload: GeminiRiskPayload = {
    city: p.city,
    district: p.district,
    river: p.river ?? "Sungai setempat",
    score: p.score ?? 0,
    level: p.level ?? "low",
    rainfall: p.rainfall ?? "moderate",
    waterLevel: p.waterLevel ?? "normal",
    floodReports: p.floodReports ?? 0,
    drainage: p.drainage ?? "partial",
    factors: Array.isArray(p.factors) ? p.factors : [],
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  };

  const result = await generateGeminiSummary(payload);
  return NextResponse.json(result);
}
