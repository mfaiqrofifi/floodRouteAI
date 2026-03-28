"use client";

import { Polygon, Rectangle, Tooltip } from "react-leaflet";
import { JAKARTA_MAP_BOUNDS } from "@/lib/geo/jakarta-area";

interface JakartaBoundaryOverlayProps {
  showLabels?: boolean;
  dimOutside?: boolean;
}

export default function JakartaBoundaryOverlay({
  showLabels = false,
  dimOutside = true,
}: JakartaBoundaryOverlayProps) {
  const outerRing: [number, number][] = [
    [-85, -180],
    [-85, 180],
    [85, 180],
    [85, -180],
  ];
  const jakartaRing: [number, number][] = [
    [JAKARTA_MAP_BOUNDS.southWest.lat, JAKARTA_MAP_BOUNDS.southWest.lng],
    [JAKARTA_MAP_BOUNDS.southWest.lat, JAKARTA_MAP_BOUNDS.northEast.lng],
    [JAKARTA_MAP_BOUNDS.northEast.lat, JAKARTA_MAP_BOUNDS.northEast.lng],
    [JAKARTA_MAP_BOUNDS.northEast.lat, JAKARTA_MAP_BOUNDS.southWest.lng],
  ];
  const jakartaBounds: [[number, number], [number, number]] = [
    [JAKARTA_MAP_BOUNDS.southWest.lat, JAKARTA_MAP_BOUNDS.southWest.lng],
    [JAKARTA_MAP_BOUNDS.northEast.lat, JAKARTA_MAP_BOUNDS.northEast.lng],
  ];

  return (
    <>
      {dimOutside && (
        <Polygon
          positions={[outerRing, jakartaRing]}
          pathOptions={{
            stroke: false,
            fillColor: "#0f172a",
            fillOpacity: 0.18,
            fillRule: "evenodd",
          }}
        />
      )}

      <Rectangle
        bounds={jakartaBounds}
        pathOptions={{
          color: "#2563eb",
          weight: 3,
          opacity: 0.95,
          fillColor: "#60a5fa",
          fillOpacity: 0.04,
          dashArray: "10 8",
        }}
      >
        {showLabels && (
          <Tooltip permanent direction="center" opacity={1}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#1e3a8a",
                whiteSpace: "nowrap",
              }}
            >
              Area Aktif DKI Jakarta
            </span>
          </Tooltip>
        )}
      </Rectangle>
    </>
  );
}
