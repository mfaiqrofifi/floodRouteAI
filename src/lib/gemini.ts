/**
 * Gemini AI service — SERVER-SIDE ONLY.
 *
 * Do NOT import this file in any client component ("use client").
 * It uses @google/generative-ai which must only run on the server.
 *
 * Called exclusively from: src/app/api/check-risk/explain/route.ts
 *
 * Setup:
 *   Add to .env.local:
 *     GEMINI_API_KEY=your_key_here
 *     GEMINI_MODEL=gemini-1.5-flash   (optional — defaults to gemini-1.5-flash)
 *
 *   Model choice rationale:
 *   • gemini-1.5-flash  → free tier: 1500 req/day, 15 RPM. Uses API v1 (not v1beta).
 *                        Best fit for structured JSON output on free keys.
 *   • gemini-2.0-flash  → limit: 0 on free tier — requires billing. Avoid.
 *   • gemini-2.5-flash  → thinking model; thinking tokens eat maxOutputTokens budget,
 *                        truncating the JSON. Not suitable without thinkingBudget:0.
 *
 *   Get a free key at: https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateLocalFallback,
  type AiSummaryResult,
  type GeminiRiskPayload,
} from "./riskSummary";

// ── Prompt builder ─────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
  high: "TINGGI",
  medium: "SEDANG",
  low: "RENDAH",
};
const RAINFALL_LABEL: Record<string, string> = {
  high: "lebat",
  moderate: "sedang",
  low: "ringan",
};
const WATER_LABEL: Record<string, string> = {
  danger: "bahaya (darurat)",
  alert: "siaga",
  normal: "normal",
};
const DRAINAGE_LABEL: Record<string, string> = {
  poor: "kapasitas sangat terbatas",
  partial: "berfungsi sebagian",
  good: "baik",
};

function buildPrompt(p: GeminiRiskPayload): string {
  const factorsList = p.factors.map((f, i) => `  ${i + 1}. ${f}`).join("\n");

  return `Kamu adalah asisten risiko banjir untuk warga Indonesia yang menggunakan aplikasi FloodRoute AI.

Tugas kamu: tulis penjelasan singkat risiko banjir dalam Bahasa Indonesia yang alami, spesifik, dan tidak terdengar seperti template otomatis.

ATURAN WAJIB:
- Gunakan HANYA data yang diberikan di bawah ini, jangan menambah asumsi
- Variasikan kalimat pembuka (jangan selalu mulai dengan "Kondisi di...")
- Jelaskan secara konkret mengapa risiko ini terjadi berdasarkan faktor yang tersedia
- Berikan saran praktis yang relevan untuk lokasi spesifik ini
- Nada: santai namun informatif, seperti laporan berita lokal yang ringkas
- Jangan lebay atau menakut-nakuti secara berlebihan
- Jangan membuat klaim pasti tentang kapan banjir akan terjadi

DATA RISIKO:
- Lokasi: ${p.district} (dekat ${p.river}), Kota ${p.city}
- Skor Risiko: ${p.score}/100 → Status ${LEVEL_LABEL[p.level] ?? p.level}
- Curah Hujan: ${RAINFALL_LABEL[p.rainfall] ?? p.rainfall}
- Kondisi Sungai/Air: ${WATER_LABEL[p.waterLevel] ?? p.waterLevel}
- Laporan Banjir Aktif: ${p.floodReports} laporan
- Drainase: ${DRAINAGE_LABEL[p.drainage] ?? p.drainage}
- Faktor penyumbang risiko:
${factorsList}
- Data per: ${p.updatedAt}

Kembalikan HANYA JSON valid berikut tanpa teks apapun di luar JSON:
{
  "summary": "<ringkasan 2-3 kalimat, spesifik ke lokasi dan kondisi saat ini>",
  "factors": ["<faktor kunci 1>", "<faktor kunci 2>", "<faktor kunci 3 jika ada>"],
  "recommendation": "<saran praktis 1-2 kalimat yang spesifik untuk ${p.district}, ${p.city}>"
}`;
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Calls Gemini to generate a natural-language flood risk explanation.
 *
 * Falls back to generateLocalFallback() if:
 *   - GEMINI_API_KEY is not set
 *   - Network request fails
 *   - Response is not valid JSON with required fields
 *
 * Never throws — always returns an AiSummaryResult.
 */
export async function generateGeminiSummary(
  payload: GeminiRiskPayload,
): Promise<AiSummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[CheckRisk] Gemini API key detected: false");
      console.log("[CheckRisk] AI response source: fallback (no API key)");
      console.log("[CheckRisk] fallback summary used:", payload);
    }
    return generateLocalFallback(payload);
  }

  const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

  if (process.env.NODE_ENV === "development") {
    console.log("[CheckRisk] Gemini API key detected: true");
    console.log("[CheckRisk] Gemini model used:", modelName);
    console.log("[CheckRisk] request started");
    console.log("[CheckRisk] AI request payload:", payload);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Pass apiVersion:"v1" to avoid the v1beta endpoint where gemini-1.5-flash
    // was removed. v1 is the stable API and supports JSON mode.
    const model = genAI.getGenerativeModel(
      {
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          // Forces complete, valid JSON output — no markdown fences, no truncation.
          responseMimeType: "application/json",
        },
      },
      { apiVersion: "v1" },
    );

    const prompt = buildPrompt(payload);
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    if (process.env.NODE_ENV === "development") {
      console.log("[CheckRisk] Gemini raw response:", rawText);
    }

    // responseMimeType:"application/json" means rawText is already valid JSON,
    // but strip any accidental whitespace/fences as defence-in-depth.
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(jsonText) as Partial<AiSummaryResult>;

    // Validate required shape
    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.factors) ||
      typeof parsed.recommendation !== "string"
    ) {
      throw new Error(
        "Gemini response missing required fields: " +
          JSON.stringify(Object.keys(parsed)),
      );
    }

    const response: AiSummaryResult = {
      summary: parsed.summary,
      factors: parsed.factors.filter((f): f is string => typeof f === "string"),
      recommendation: parsed.recommendation,
      source: "gemini",
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[CheckRisk] AI response source: gemini");
      console.log("[CheckRisk] Gemini parsed response:", response);
    }

    return response;
  } catch (err) {
    const is429 = err instanceof Error && err.message.includes("429");
    if (is429) {
      console.warn(
        "[CheckRisk] Gemini 429 — free-tier quota exhausted. " +
          "Falling back to local summary. Retry after rate-limit window.",
      );
    } else {
      console.error("[CheckRisk] Gemini call failed:", err);
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[CheckRisk] AI response source: fallback (gemini error)");
    }
    return generateLocalFallback(payload);
  }
}
