/**
 * Server-side proxy for Nominatim reverse geocoding.
 * Used when the user picks a point directly on the map.
 */
import {
  isWithinJakartaArea,
  isWithinJavaBounds,
} from "@/lib/geo/jakarta-area";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") ?? "";
  const lng = searchParams.get("lng") ?? "";
  const scope = searchParams.get("scope") ?? "jakarta";

  if (!lat.trim() || !lng.trim()) {
    return Response.json({});
  }

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (
    Number.isNaN(parsedLat) ||
    Number.isNaN(parsedLng) ||
    (scope === "java"
      ? !isWithinJavaBounds(parsedLat, parsedLng)
      : !isWithinJakartaArea(parsedLat, parsedLng))
  ) {
    return Response.json({});
  }

  const params = new URLSearchParams({
    lat,
    lon: lng,
    format: "jsonv2",
    zoom: "17",
    addressdetails: "0",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    {
      headers: {
        "User-Agent": "FloodRouteAI/1.0 (dicoding hackathon, non-commercial)",
        "Accept-Language": "id,en",
      },
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) return Response.json({});
  const data = await res.json();
  return Response.json(data);
}
