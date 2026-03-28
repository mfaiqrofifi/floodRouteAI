import { unstable_cache } from "next/cache";
import { getAreaWeatherSignal, type AreaWeatherSignal } from "@/lib/bmkg";
import {
  AREA_BASELINE,
  AREA_VULNERABILITY,
  SUPPORTED_AREAS,
} from "@/lib/area-mapping";
import { getFloodReportMetrics } from "@/lib/reports/repository";
import { calculateFloodRisk } from "@/lib/risk-engine";
import type {
  FloodRiskSignals,
  JakartaAreaStatusItem,
  JakartaAreaStatusResponse,
  RiskLevel,
  VulnerabilityLevel,
} from "@/types/risk";

type WaterAlertStatus = "normal" | "alert" | "danger";

interface JakartaAreaMeta {
  id: string;
  area: (typeof SUPPORTED_AREAS)[number];
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface JakartaAreaRiskSnapshot {
  area: string;
  district: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: string[];
  signals: FloodRiskSignals;
  timestamp: string;
}

const JAKARTA_AREA_META: JakartaAreaMeta[] = [
  {
    id: "jak-barat",
    area: "Jakarta Barat",
    district: "Kali Deres",
    coordinates: { lat: -6.1675, lng: 106.7635 },
  },
  {
    id: "jak-utara",
    area: "Jakarta Utara",
    district: "Pluit",
    coordinates: { lat: -6.1213, lng: 106.8095 },
  },
  {
    id: "jak-selatan",
    area: "Jakarta Selatan",
    district: "Kemang",
    coordinates: { lat: -6.2615, lng: 106.8106 },
  },
  {
    id: "jak-pusat",
    area: "Jakarta Pusat",
    district: "Sudirman",
    coordinates: { lat: -6.2088, lng: 106.8456 },
  },
  {
    id: "jak-timur",
    area: "Jakarta Timur",
    district: "Kampung Melayu",
    coordinates: { lat: -6.2218, lng: 106.8651 },
  },
];

function buildAreaSummary(
  area: string,
  district: string,
  level: RiskLevel,
  score: number,
  weatherSignal: AreaWeatherSignal,
): string {
  const riskLabel =
    level === "high" ? "bahaya" : level === "medium" ? "waspada" : "aman";

  return `${area} (${district}) berstatus ${riskLabel} dengan skor ${score}/100. ${weatherSignal.weatherSummary} ${weatherSignal.forecastSummary}`;
}

function buildPredictiveFactors(
  weatherSignal: AreaWeatherSignal,
  vulnerabilityLevel: VulnerabilityLevel,
): string[] {
  const factors: string[] = [];

  if (weatherSignal.rainfallLevel === "heavy") {
    factors.push(
      `BMKG mendeteksi hujan lebat saat ini di sekitar ${weatherSignal.dominantAreaName}.`,
    );
  } else if (weatherSignal.rainfallLevel === "medium") {
    factors.push(
      `BMKG mendeteksi hujan sedang saat ini di sekitar ${weatherSignal.dominantAreaName}.`,
    );
  } else if (weatherSignal.rainfallLevel === "light") {
    factors.push(
      `BMKG mendeteksi hujan ringan saat ini di sekitar ${weatherSignal.dominantAreaName}.`,
    );
  }

  if (weatherSignal.next6hRainfallLevel === "heavy") {
    factors.push("Prediksi BMKG 6 jam ke depan menunjukkan potensi hujan lebat.");
  } else if (weatherSignal.next6hRainfallLevel === "medium") {
    factors.push("Prediksi BMKG 6 jam ke depan menunjukkan potensi hujan sedang.");
  }

  if (vulnerabilityLevel === "high") {
    factors.push("Wilayah ini memiliki kerentanan banjir historis yang tinggi.");
  } else if (vulnerabilityLevel === "medium") {
    factors.push("Wilayah ini memiliki kerentanan banjir menengah.");
  }

  return factors;
}

/**
 * BMKG warning signal adapter.
 *
 * This is prediction-oriented: the short-term BMKG outlook drives the alert
 * state instead of a hardcoded area-level water status.
 */
async function getAreaWarningSignal(
  weatherSignal: AreaWeatherSignal,
): Promise<WaterAlertStatus> {
  return weatherSignal.warningLevel;
}

/**
 * Optional Jakarta flood source integration point.
 *
 * Today:
 * - activeFloodReportsCount uses 0 until a real verified flood-report feed is connected
 * - nearbyFloodPointsCount still uses local static geography reference data
 */
async function getJakartaFloodContext(area: string): Promise<{
  activeFloodReportsCount: number;
  nearbyFloodPointsCount: number;
}> {
  const metrics = await getFloodReportMetrics();
  const baseline = AREA_BASELINE[area] ?? {
    activeFloodReportsCount: 0,
    nearbyFloodPointsCount: 1,
  };

  return {
    activeFloodReportsCount: metrics.byArea[area as keyof typeof metrics.byArea] ?? 0,
    nearbyFloodPointsCount:
      baseline.nearbyFloodPointsCount +
      Math.min(
        2,
        metrics.weightedByArea[area as keyof typeof metrics.weightedByArea] ?? 0,
      ),
  };
}

/**
 * Shared Jakarta source-of-truth pipeline.
 *
 * Source labels:
 * - BMKG public weather/forecast signal: getAreaWeatherSignal()
 * - BMKG warning signal: weatherSignal.warningLevel
 * - local risk scoring logic: calculateFloodRisk()
 * - optional Jakarta flood source integration point: getJakartaFloodContext()
 */
export async function getJakartaAreaRiskSnapshot(
  area: string,
): Promise<JakartaAreaRiskSnapshot> {
  const weatherSignal = await getAreaWeatherSignal(area);
  const floodContext = await getJakartaFloodContext(area);
  const waterAlertStatus = await getAreaWarningSignal(weatherSignal);
  const vulnerabilityLevel = AREA_VULNERABILITY[area] ?? "medium";
  const meta = JAKARTA_AREA_META.find((item) => item.area === area);

  const riskResult = calculateFloodRisk({
    area,
    rainfallLevel: weatherSignal.rainfallLevel,
    vulnerabilityLevel,
    activeFloodReportsCount: floodContext.activeFloodReportsCount,
    nearbyFloodPointsCount: floodContext.nearbyFloodPointsCount,
    waterAlertStatus,
  });

  const predictiveFactors = buildPredictiveFactors(
    weatherSignal,
    vulnerabilityLevel,
  );

  riskResult.normalizedSignals.weatherSummary =
    `${weatherSignal.weatherSummary} ${weatherSignal.forecastSummary}`;

  return {
    area,
    district: meta?.district ?? area,
    riskScore: riskResult.score,
    riskLevel: riskResult.level,
    factors: [...predictiveFactors, ...riskResult.factors].slice(0, 5),
    signals: riskResult.normalizedSignals,
    timestamp: new Date().toISOString(),
  };
}

async function buildJakartaAreaStatus(): Promise<JakartaAreaStatusResponse> {
  const snapshots = await Promise.all(
    JAKARTA_AREA_META.map(async (meta): Promise<JakartaAreaStatusItem> => {
      const snapshot = await getJakartaAreaRiskSnapshot(meta.area);
      const weatherSignal = await getAreaWeatherSignal(meta.area);

      return {
        id: meta.id,
        area: meta.area,
        district: meta.district,
        city: "Jakarta",
        coordinates: meta.coordinates,
        score: snapshot.riskScore,
        status: snapshot.riskLevel,
        topFactors: snapshot.factors.slice(0, 3),
        summary: buildAreaSummary(
          meta.area,
          snapshot.district,
          snapshot.riskLevel,
          snapshot.riskScore,
          weatherSignal,
        ),
        updatedAt: snapshot.timestamp,
      };
    }),
  );

  return {
    items: snapshots,
    timestamp: new Date().toISOString(),
  };
}

export const getCachedJakartaAreaStatus = unstable_cache(
  buildJakartaAreaStatus,
  ["jakarta-area-status-v2"],
  { revalidate: 600, tags: ["jakarta-area-status"] },
);
