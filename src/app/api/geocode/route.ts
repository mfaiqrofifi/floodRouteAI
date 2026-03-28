/**
 * Server-side proxy for Nominatim geocoding.
 * Required to set a proper User-Agent (browser fetch cannot override it).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return Response.json([]);

  const params = new URLSearchParams({
    q: `${q} DKI Jakarta`,
    format: "json",
    limit: "6",
    countrycodes: "id",
    addressdetails: "0",
    bounded: "1",
    viewbox: "106.695,-6.07,106.98,-6.38",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent": "FloodRouteAI/1.0 (dicoding hackathon, non-commercial)",
        "Accept-Language": "id,en",
      },
      next: { revalidate: 300 }, // cache 5 min
    },
  );

  if (!res.ok) return Response.json([]);
  const data = await res.json();
  return Response.json(data);
}
