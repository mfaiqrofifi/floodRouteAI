/**
 * BMKG integration module.
 *
 * Source:
 * - BMKG public weather/forecast API
 *   https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={adm4_code}
 *
 * The module uses:
 * - current/nearest BMKG weather slot for current area conditions
 * - next 6 hours of BMKG forecast slots for short-term flood-risk prediction
 *
 * Responses are cached for 30 minutes to avoid excessive BMKG requests.
 */

import type { RainfallLevel } from "@/types/risk";
import { AREA_TO_ADM4 } from "./area-mapping";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";

const WEATHER_CODE_TO_RAINFALL: Record<number, RainfallLevel> = {
  60: "light",
  61: "light",
  63: "medium",
  65: "heavy",
  80: "heavy",
  95: "heavy",
  97: "heavy",
};

interface BmkgForecastSlot {
  datetime: string;
  local_datetime?: string;
  t: number;
  tcc: number;
  tp?: number;
  weather: number;
  wd: string;
  wd_deg: number;
  ws: number;
  hu: number;
  vs?: number;
  vs_text?: string;
  weather_desc: string;
  weather_desc_en?: string;
}

interface BmkgLokasi {
  adm4: string;
  desa: string;
  kecamatan: string;
  kotkab: string;
  provinsi: string;
  lat: string;
  lon: string;
}

interface BmkgAreaData {
  lokasi: BmkgLokasi;
  cuaca: BmkgForecastSlot[][];
}

interface BmkgApiResponse {
  data?: BmkgAreaData[];
}

export interface NormalizedWeatherData {
  adm4: string;
  kelurahan: string;
  kecamatan: string;
  localDateTime: string;
  weatherDesc: string;
  humidity: number;
  temperature: number;
  cloudCoverage: number;
  windSpeed: number;
  visibilityText: string;
  rainfallLevel: RainfallLevel;
  weatherCode: number;
}

export interface AreaWeatherSignal {
  rainfallLevel: RainfallLevel;
  weatherSummary: string;
  observedAt: string;
  next6hRainfallLevel: RainfallLevel;
  forecastSummary: string;
  dominantAreaName: string;
  warningLevel: "normal" | "alert" | "danger";
}

interface Adm4Signal {
  current: NormalizedWeatherData;
  next6hPeak: {
    rainfallLevel: RainfallLevel;
    weatherDesc: string;
    localDateTime: string;
  };
}

function rainfallSeverity(level: RainfallLevel): number {
  switch (level) {
    case "heavy":
      return 3;
    case "medium":
      return 2;
    case "light":
      return 1;
    case "none":
      return 0;
  }
}

function normalizeAdmCode(code: string): string {
  if (code.includes(".")) return code;

  const digitsOnly = code.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 10)}`;
  }

  if (digitsOnly.length === 6) {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 6)}`;
  }

  return code;
}

function buildBmkgCodeCandidates(code: string): string[] {
  const digitsOnly = code.replace(/\D/g, "");
  const candidates = new Set<string>();

  candidates.add(normalizeAdmCode(code));

  if (digitsOnly.length === 10) {
    candidates.add(normalizeAdmCode(digitsOnly.slice(0, 6)));
  }

  return Array.from(candidates);
}

function weatherCodeToRainfallLevel(code: number): RainfallLevel {
  return WEATHER_CODE_TO_RAINFALL[code] ?? "none";
}

function parseBmkgDatetime(raw: string): Date | null {
  if (!raw) return null;

  // Newer BMKG responses often use "YYYY-MM-DD HH:mm:ss"
  if (raw.includes("-") || raw.includes(":")) {
    const normalized = raw.replace(" ", "T");
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (raw.length < 12) return null;
  const year = parseInt(raw.slice(0, 4), 10);
  const month = parseInt(raw.slice(4, 6), 10) - 1;
  const day = parseInt(raw.slice(6, 8), 10);
  const hour = parseInt(raw.slice(8, 10), 10);
  const minute = parseInt(raw.slice(10, 12), 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  return new Date(year, month, day, hour, minute);
}

function formatBmkgDatetime(raw: string): string {
  const date = parseBmkgDatetime(raw);
  if (!date) return "N/A";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} WIB`;
}

function normalizeSlot(
  adm4: string,
  lokasi: BmkgLokasi,
  slot: BmkgForecastSlot,
): NormalizedWeatherData {
  const rawDatetime = slot.local_datetime ?? slot.datetime;
  return {
    adm4,
    kelurahan: lokasi.desa,
    kecamatan: lokasi.kecamatan,
    localDateTime: formatBmkgDatetime(rawDatetime),
    weatherDesc: slot.weather_desc,
    humidity: slot.hu,
    temperature: slot.t,
    cloudCoverage: slot.tcc,
    windSpeed: slot.ws,
    visibilityText:
      slot.vs_text ?? `${((slot.vs ?? 0) / 1000).toFixed(1)} km`,
    rainfallLevel: weatherCodeToRainfallLevel(slot.weather),
    weatherCode: slot.weather,
  };
}

function selectNearestSlot(slots: BmkgForecastSlot[]): BmkgForecastSlot | null {
  if (slots.length === 0) return null;

  const now = Date.now();
  const oneHourMs = 3_600_000;

  let bestSlot: BmkgForecastSlot | null = null;
  let bestDiff = Infinity;

  for (const slot of slots) {
    const rawDatetime = slot.local_datetime ?? slot.datetime;
    const slotDate = parseBmkgDatetime(rawDatetime);
    if (!slotDate) continue;

    const diff = slotDate.getTime() - now;
    if (diff >= -oneHourMs && diff < bestDiff) {
      bestDiff = diff;
      bestSlot = slot;
    }
  }

  return bestSlot ?? slots[0];
}

function selectPeakForecastWithinHours(
  slots: BmkgForecastSlot[],
  fromDate: Date,
  hours: number,
): BmkgForecastSlot | null {
  const horizonMs = hours * 3_600_000;

  const candidates = slots.filter((slot) => {
    const rawDatetime = slot.local_datetime ?? slot.datetime;
    const slotDate = parseBmkgDatetime(rawDatetime);
    if (!slotDate) return false;
    const diff = slotDate.getTime() - fromDate.getTime();
    return diff > 0 && diff <= horizonMs;
  });

  if (candidates.length === 0) return null;

  return candidates.reduce((prev, curr) => {
    const prevSeverity = rainfallSeverity(weatherCodeToRainfallLevel(prev.weather));
    const currSeverity = rainfallSeverity(weatherCodeToRainfallLevel(curr.weather));
    return currSeverity > prevSeverity ? curr : prev;
  });
}

async function fetchBmkgAreaData(adm4: string): Promise<BmkgAreaData | null> {
  const candidates = buildBmkgCodeCandidates(adm4);

  for (const candidate of candidates) {
    const url = `${BMKG_BASE_URL}?adm4=${encodeURIComponent(candidate)}`;

    try {
      const res = await fetch(url, {
        next: { revalidate: 1800 },
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        console.warn(`[BMKG] HTTP ${res.status} for adm4=${candidate}`);
        continue;
      }

      const json: BmkgApiResponse = await res.json();
      const areaData = json.data?.[0];

      if (!areaData?.cuaca || areaData.cuaca.length === 0) {
        console.warn(`[BMKG] Empty forecast payload for adm4=${candidate}`);
        continue;
      }

      return areaData;
    } catch (error) {
      console.error(`[BMKG] Fetch error for adm4=${candidate}:`, error);
    }
  }

  return null;
}

async function getAdm4Signal(adm4: string): Promise<Adm4Signal | null> {
  const areaData = await fetchBmkgAreaData(adm4);
  if (!areaData) return null;

  const allSlots = areaData.cuaca.flat();
  const currentSlot = selectNearestSlot(allSlots);
  if (!currentSlot) return null;

  const rawCurrentDatetime = currentSlot.local_datetime ?? currentSlot.datetime;
  const currentDate = parseBmkgDatetime(rawCurrentDatetime);
  if (!currentDate) return null;

  const nextPeakSlot =
    selectPeakForecastWithinHours(allSlots, currentDate, 6) ?? currentSlot;
  const rawPeakDatetime = nextPeakSlot.local_datetime ?? nextPeakSlot.datetime;

  return {
    current: normalizeSlot(adm4, areaData.lokasi, currentSlot),
    next6hPeak: {
      rainfallLevel: weatherCodeToRainfallLevel(nextPeakSlot.weather),
      weatherDesc: nextPeakSlot.weather_desc,
      localDateTime: formatBmkgDatetime(rawPeakDatetime),
    },
  };
}

export async function getBmkgForecastByAdm4(
  adm4: string,
): Promise<NormalizedWeatherData | null> {
  const signal = await getAdm4Signal(adm4);
  return signal?.current ?? null;
}

export async function getAreaWeatherSignal(
  areaName: string,
): Promise<AreaWeatherSignal> {
  const codes = AREA_TO_ADM4[areaName];

  if (!codes || codes.length === 0) {
    return {
      rainfallLevel: "none",
      weatherSummary: "Data cuaca tidak tersedia untuk area ini.",
      observedAt: new Date().toISOString(),
      next6hRainfallLevel: "none",
      forecastSummary: "Prediksi BMKG belum tersedia.",
      dominantAreaName: areaName,
      warningLevel: "normal",
    };
  }

  const results = await Promise.all(codes.map(getAdm4Signal));
  const valid = results.filter((result): result is Adm4Signal => result !== null);

  if (valid.length === 0) {
    return {
      rainfallLevel: "none",
      weatherSummary:
        "Data cuaca BMKG saat ini tidak dapat diakses. Status area tidak dapat diprediksi secara penuh.",
      observedAt: new Date().toISOString(),
      next6hRainfallLevel: "none",
      forecastSummary: "Prediksi BMKG belum tersedia.",
      dominantAreaName: areaName,
      warningLevel: "normal",
    };
  }

  const dominantCurrent = valid.reduce((prev, curr) =>
    rainfallSeverity(curr.current.rainfallLevel) >
    rainfallSeverity(prev.current.rainfallLevel)
      ? curr
      : prev,
  );

  const dominantForecast = valid.reduce((prev, curr) =>
    rainfallSeverity(curr.next6hPeak.rainfallLevel) >
    rainfallSeverity(prev.next6hPeak.rainfallLevel)
      ? curr
      : prev,
  );

  const avgHumidity = Math.round(
    valid.reduce((sum, item) => sum + item.current.humidity, 0) / valid.length,
  );
  const avgTemp = Math.round(
    valid.reduce((sum, item) => sum + item.current.temperature, 0) / valid.length,
  );

  const currentWindPart =
    dominantCurrent.current.windSpeed > 0
      ? `, angin ${dominantCurrent.current.windSpeed.toFixed(1)} m/s`
      : "";

  const weatherSummary =
    `${dominantCurrent.current.weatherDesc} di ${dominantCurrent.current.kecamatan}` +
    `, suhu sekitar ${avgTemp}C, kelembapan ${avgHumidity}%${currentWindPart}.` +
    ` Data BMKG ${dominantCurrent.current.localDateTime}.`;

  let warningLevel: "normal" | "alert" | "danger" = "normal";
  if (
    rainfallSeverity(dominantCurrent.current.rainfallLevel) >= 3 &&
    rainfallSeverity(dominantForecast.next6hPeak.rainfallLevel) >= 3
  ) {
    warningLevel = "danger";
  } else if (
    rainfallSeverity(dominantCurrent.current.rainfallLevel) >= 2 ||
    rainfallSeverity(dominantForecast.next6hPeak.rainfallLevel) >= 2
  ) {
    warningLevel = "alert";
  }

  const forecastSummary =
    rainfallSeverity(dominantForecast.next6hPeak.rainfallLevel) === 0
      ? `Prediksi 6 jam ke depan relatif stabil tanpa sinyal hujan signifikan dari BMKG.`
      : `Prediksi BMKG 6 jam ke depan menunjukkan potensi ${dominantForecast.next6hPeak.weatherDesc.toLowerCase()} paling dominan di ${dominantForecast.current.kecamatan} sekitar ${dominantForecast.next6hPeak.localDateTime}.`;

  return {
    rainfallLevel: dominantCurrent.current.rainfallLevel,
    weatherSummary,
    observedAt: dominantCurrent.current.localDateTime,
    next6hRainfallLevel: dominantForecast.next6hPeak.rainfallLevel,
    forecastSummary,
    dominantAreaName: dominantCurrent.current.kecamatan,
    warningLevel,
  };
}
