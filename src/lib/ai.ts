/**
 * AI explanation module for flood risk results.
 *
 * AI is used ONLY to generate a plain-language explanation and
 * recommended actions for a risk score that was already calculated
 * by the deterministic rule engine in risk-engine.ts.
 *
 * AI does NOT compute the score. Score computation is entirely
 * handled by calculateFloodRisk() in risk-engine.ts.
 *
 * Configuration:
 *   OPENAI_API_KEY  — required for AI explanations (any OpenAI-compatible key)
 *   OPENAI_MODEL    — optional, defaults to "gpt-4o-mini"
 *   OPENAI_BASE_URL — optional, defaults to https://api.openai.com/v1
 *                     (can be pointed at Groq, Together AI, etc.)
 *
 * Fallback:
 *   If the AI call fails for any reason (missing key, network error,
 *   malformed response), a deterministic fallback explanation is returned.
 *   The app never crashes due to AI unavailability.
 */

import type {
  AiFloodExplanation,
  RainfallLevel,
  RiskLevel,
  VulnerabilityLevel,
} from "@/types/risk";

// ── Input payload ─────────────────────────────────────────────────────────────

export interface AiExplanationPayload {
  area: string;
  riskScore: number;
  riskLevel: RiskLevel;
  rainfallLevel: RainfallLevel;
  weatherSummary: string;
  vulnerabilityLevel: VulnerabilityLevel;
  activeFloodReportsCount: number;
  nearbyFloodPointsCount: number;
}

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Kamu adalah asisten AI untuk aplikasi pencegahan banjir bernama FloodRoute AI yang digunakan warga Jakarta. Tugasmu adalah menjelaskan skor risiko banjir menggunakan bahasa yang sederhana, mudah dipahami, tidak teknis, tenang, dan berorientasi keselamatan.

Aturan penting:
- Balas HANYA dalam format JSON, tanpa teks tambahan di luar JSON.
- Gunakan HANYA data yang disediakan di input. Jangan menambahkan fakta atau asumsi baru.
- Bahasa Indonesia yang baik dan natural.
- Nada: tenang, informatif, membantu, tidak menakut-nakuti berlebihan.
- Panjang "explanation" maksimal 80 kata.
- "actions" harus berupa array 3–4 string yang spesifik dan praktis.

Format JSON yang harus dikembalikan:
{
  "summary": "<ringkasan 1-2 kalimat>",
  "explanation": "<penjelasan mengapa risiko ini terjadi, maks 80 kata>",
  "actions": ["<tindakan 1>", "<tindakan 2>", "<tindakan 3>"]
}`;
}

function buildUserPrompt(payload: AiExplanationPayload): string {
  const levelLabel: Record<RiskLevel, string> = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
  };
  const rainfallLabel: Record<RainfallLevel, string> = {
    none: "tidak ada hujan",
    light: "hujan ringan",
    medium: "hujan sedang",
    heavy: "hujan lebat",
  };
  const vulnLabel: Record<VulnerabilityLevel, string> = {
    low: "rendah",
    medium: "sedang",
    high: "tinggi",
  };

  return `Jelaskan risiko banjir berikut untuk warga ${payload.area}:

- Skor risiko: ${payload.riskScore}/100
- Level risiko: ${levelLabel[payload.riskLevel]}
- Kondisi hujan saat ini: ${rainfallLabel[payload.rainfallLevel]}
- Ringkasan cuaca (dari BMKG): ${payload.weatherSummary}
- Tingkat kerentanan area: ${vulnLabel[payload.vulnerabilityLevel]}
- Laporan banjir aktif: ${payload.activeFloodReportsCount} laporan
- Titik rawan di sekitar: ${payload.nearbyFloodPointsCount} titik

Berikan penjelasan dan rekomendasi tindakan berdasarkan data di atas saja.`;
}

// ── Fallback generator ────────────────────────────────────────────────────────

/**
 * Returns a deterministic, non-random fallback explanation.
 * Used when the AI API is unavailable or returns an invalid response.
 */
export function generateFallbackExplanation(
  payload: AiExplanationPayload,
): AiFloodExplanation {
  const {
    area,
    riskScore,
    riskLevel,
    rainfallLevel,
    activeFloodReportsCount,
    nearbyFloodPointsCount,
  } = payload;

  const rainfallText: Record<RainfallLevel, string> = {
    none: "tidak terdeteksi hujan signifikan",
    light: "hujan ringan",
    medium: "hujan sedang",
    heavy: "hujan lebat",
  };

  if (riskLevel === "high") {
    return {
      summary: `Risiko banjir di ${area} saat ini TINGGI (${riskScore}/100). Harap waspada dan hindari area rawan.`,
      explanation:
        `Kombinasi ${rainfallText[rainfallLevel]}, kerentanan area yang tinggi, ` +
        `${activeFloodReportsCount} laporan banjir aktif, serta ${nearbyFloodPointsCount} titik rawan ` +
        `di sekitar menyebabkan skor risiko yang tinggi. Kondisi ini memerlukan kewaspadaan segera.`,
      actions: [
        "Hindari perjalanan yang tidak mendesak, terutama ke wilayah rendah",
        "Pantau informasi terkini dari BMKG dan BPBD DKI Jakarta",
        "Siapkan tas darurat dan dokumen penting di tempat mudah dijangkau",
        "Hubungi BPBD DKI Jakarta di nomor 112 jika terjadi darurat",
      ],
    };
  }

  if (riskLevel === "medium") {
    return {
      summary: `Risiko banjir di ${area} tergolong SEDANG (${riskScore}/100). Tetap berhati-hati.`,
      explanation:
        `Terpantau ${rainfallText[rainfallLevel]} di area ini. Dengan ${activeFloodReportsCount} laporan aktif ` +
        `dan ${nearbyFloodPointsCount} titik rawan di sekitar, kondisi berpotensi memburuk ` +
        `jika hujan terus meningkat.`,
      actions: [
        "Pantau perkembangan cuaca secara berkala melalui aplikasi BMKG",
        "Siapkan rute alternatif dan hindari jalan yang rawan genangan",
        "Simpan nomor darurat: BPBD 112, Posko Banjir Jakarta 1500-454",
      ],
    };
  }

  return {
    summary: `Risiko banjir di ${area} saat ini RENDAH (${riskScore}/100). Kondisi relatif aman.`,
    explanation:
      `Berdasarkan data cuaca (${rainfallText[rainfallLevel]}) dan kondisi lapangan, ` +
      `tidak ada indikator banjir yang signifikan di ${area} saat ini.`,
    actions: [
      "Tetap pantau informasi cuaca dari BMKG secara berkala",
      "Jaga kebersihan saluran drainase di sekitar rumah",
      "Gunakan fitur Peta Banjir untuk memantau kondisi area lain",
    ],
  };
}

// ── Main AI call ──────────────────────────────────────────────────────────────

/**
 * Calls the OpenAI-compatible chat completion API to generate a
 * natural-language flood risk explanation in Bahasa Indonesia.
 *
 * Falls back to generateFallbackExplanation() on any failure to ensure
 * the app always returns a valid, useful response.
 */
export async function generateFloodExplanation(
  payload: AiExplanationPayload,
): Promise<AiFloodExplanation> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[AI] OPENAI_API_KEY is not set — using deterministic fallback explanation.",
    );
    return generateFallbackExplanation(payload);
  }

  const baseUrl =
    process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ??
    "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const endpoint = `${baseUrl}/chat/completions`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(payload) },
        ],
        temperature: 0.3,
        max_tokens: 450,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(unreadable)");
      console.error(`[AI] API error ${res.status}: ${errText}`);
      return generateFallbackExplanation(payload);
    }

    const json = await res.json();
    const rawContent: string | undefined = json.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.warn("[AI] Empty content in API response — using fallback.");
      return generateFallbackExplanation(payload);
    }

    let parsed: Partial<AiFloodExplanation>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.warn(
        "[AI] Failed to parse JSON from AI response — using fallback.",
      );
      return generateFallbackExplanation(payload);
    }

    // Validate required shape
    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.explanation !== "string" ||
      !Array.isArray(parsed.actions) ||
      parsed.actions.length === 0
    ) {
      console.warn("[AI] Response missing required fields — using fallback.");
      return generateFallbackExplanation(payload);
    }

    return {
      summary: parsed.summary,
      explanation: parsed.explanation,
      actions: parsed.actions.filter((a): a is string => typeof a === "string"),
    };
  } catch (err) {
    console.error("[AI] Unexpected error during AI call:", err);
    return generateFallbackExplanation(payload);
  }
}
