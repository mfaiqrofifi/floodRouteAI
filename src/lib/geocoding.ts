export interface GeoResult {
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
}

import { isWithinJakartaArea } from "@/lib/geo/jakarta-area";

/** Predefined Jakarta locations with real coordinates for quick selection. */
export const JAKARTA_PRESETS: GeoResult[] = [
  {
    shortName: "Kemang",
    displayName: "Kemang, Jakarta Selatan",
    lat: -6.2615,
    lng: 106.8136,
  },
  {
    shortName: "Sudirman",
    displayName: "Sudirman, Jakarta Pusat",
    lat: -6.2088,
    lng: 106.8175,
  },
  {
    shortName: "Pluit",
    displayName: "Pluit, Jakarta Utara",
    lat: -6.1147,
    lng: 106.7936,
  },
  {
    shortName: "Penjaringan",
    displayName: "Penjaringan, Jakarta Utara",
    lat: -6.1252,
    lng: 106.8165,
  },
  {
    shortName: "Kali Deres",
    displayName: "Kali Deres, Jakarta Barat",
    lat: -6.1534,
    lng: 106.7285,
  },
  {
    shortName: "Kampung Melayu",
    displayName: "Kampung Melayu, Jakarta Timur",
    lat: -6.214,
    lng: 106.852,
  },
  {
    shortName: "Manggarai",
    displayName: "Manggarai, Jakarta Selatan",
    lat: -6.214,
    lng: 106.846,
  },
  {
    shortName: "Kelapa Gading",
    displayName: "Kelapa Gading, Jakarta Utara",
    lat: -6.1583,
    lng: 106.9032,
  },
  {
    shortName: "Menteng",
    displayName: "Menteng, Jakarta Pusat",
    lat: -6.1992,
    lng: 106.8346,
  },
  {
    shortName: "Kuningan",
    displayName: "Kuningan, Jakarta Selatan",
    lat: -6.23,
    lng: 106.83,
  },
  {
    shortName: "Cibubur",
    displayName: "Cibubur, Jakarta Timur",
    lat: -6.3616,
    lng: 106.8874,
  },
  {
    shortName: "Grogol",
    displayName: "Grogol, Jakarta Barat",
    lat: -6.1667,
    lng: 106.7864,
  },
];

/**
 * Geocode a search query via the server-side Nominatim proxy.
 * Falls back to matching against JAKARTA_PRESETS on failure.
 */
export async function geocodeQuery(query: string): Promise<GeoResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) return filterPresets(query);
    const data: Array<{ display_name: string; lat: string; lon: string }> =
      await res.json();
    if (!Array.isArray(data) || !data.length) return filterPresets(query);
    return data
      .map((r) => ({
        displayName: r.display_name,
        shortName: r.display_name.split(",").slice(0, 2).join(",").trim(),
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      }))
      .filter((r) => isWithinJakartaArea(r.lat, r.lng));
  } catch {
    return filterPresets(query);
  }
}

/**
 * Reverse geocode a point via the server-side Nominatim proxy.
 * Falls back to a coordinate label if no readable place is found.
 */
export async function reverseGeocodePoint(
  lat: number,
  lng: number,
): Promise<GeoResult> {
  const fallback = buildCoordinateResult(lat, lng);

  try {
    const res = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    );
    if (!res.ok) return fallback;

    const data = (await res.json()) as { display_name?: string };
    if (!data?.display_name) return fallback;

    const shortName = data.display_name.split(",").slice(0, 2).join(",").trim();

    return {
      displayName: data.display_name,
      shortName: shortName || fallback.shortName,
      lat,
      lng,
    };
  } catch {
    return fallback;
  }
}

export function buildCoordinateResult(lat: number, lng: number): GeoResult {
  return {
    displayName: `Titik peta ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    shortName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lat,
    lng,
  };
}

function filterPresets(query: string): GeoResult[] {
  const q = query.toLowerCase();
  return JAKARTA_PRESETS.filter(
    (p) =>
      p.shortName.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q),
  ).slice(0, 6);
}
