import type { JakartaAreaName } from "@/types/report";

interface Point {
  lat: number;
  lng: number;
}

interface JakartaAreaShape {
  area: JakartaAreaName;
  polygon: Point[];
  center: Point;
}

export const JAKARTA_MAP_BOUNDS = {
  southWest: { lat: -6.38, lng: 106.695 },
  northEast: { lat: -6.07, lng: 106.98 },
} as const;

export const JAKARTA_AREA_SHAPES: JakartaAreaShape[] = [
  {
    area: "Jakarta Barat",
    center: { lat: -6.1675, lng: 106.7635 },
    polygon: [
      { lat: -6.115, lng: 106.695 },
      { lat: -6.115, lng: 106.79 },
      { lat: -6.235, lng: 106.79 },
      { lat: -6.235, lng: 106.695 },
    ],
  },
  {
    area: "Jakarta Utara",
    center: { lat: -6.1213, lng: 106.8095 },
    polygon: [
      { lat: -6.07, lng: 106.72 },
      { lat: -6.07, lng: 106.95 },
      { lat: -6.17, lng: 106.95 },
      { lat: -6.17, lng: 106.72 },
    ],
  },
  {
    area: "Jakarta Pusat",
    center: { lat: -6.1865, lng: 106.8341 },
    polygon: [
      { lat: -6.145, lng: 106.78 },
      { lat: -6.145, lng: 106.87 },
      { lat: -6.23, lng: 106.87 },
      { lat: -6.23, lng: 106.78 },
    ],
  },
  {
    area: "Jakarta Selatan",
    center: { lat: -6.2615, lng: 106.8106 },
    polygon: [
      { lat: -6.205, lng: 106.74 },
      { lat: -6.205, lng: 106.91 },
      { lat: -6.38, lng: 106.91 },
      { lat: -6.38, lng: 106.74 },
    ],
  },
  {
    area: "Jakarta Timur",
    center: { lat: -6.2218, lng: 106.8651 },
    polygon: [
      { lat: -6.15, lng: 106.84 },
      { lat: -6.15, lng: 106.98 },
      { lat: -6.38, lng: 106.98 },
      { lat: -6.38, lng: 106.84 },
    ],
  },
];

function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function distanceSquared(a: Point, b: Point): number {
  return (a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2;
}

export function isWithinJakartaBounds(latitude: number, longitude: number): boolean {
  return (
    latitude >= JAKARTA_MAP_BOUNDS.southWest.lat &&
    latitude <= JAKARTA_MAP_BOUNDS.northEast.lat &&
    longitude >= JAKARTA_MAP_BOUNDS.southWest.lng &&
    longitude <= JAKARTA_MAP_BOUNDS.northEast.lng
  );
}

export function isWithinJakartaArea(latitude: number, longitude: number): boolean {
  if (!isWithinJakartaBounds(latitude, longitude)) {
    return false;
  }

  const point = { lat: latitude, lng: longitude };
  return JAKARTA_AREA_SHAPES.some((shape) => pointInPolygon(point, shape.polygon));
}

export function detectJakartaArea(latitude: number, longitude: number): JakartaAreaName {
  const point = { lat: latitude, lng: longitude };

  const matched = JAKARTA_AREA_SHAPES.find((shape) =>
    pointInPolygon(point, shape.polygon),
  );

  if (matched) return matched.area;

  return JAKARTA_AREA_SHAPES.reduce((closest, current) =>
    distanceSquared(point, current.center) < distanceSquared(point, closest.center)
      ? current
      : closest,
  ).area;
}
