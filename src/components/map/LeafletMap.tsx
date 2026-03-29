"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RankedRoute } from "@/lib/osrm";
import {
  JAVA_MAP_BOUNDS,
  isWithinJakartaArea,
  isWithinJavaBounds,
} from "@/lib/geo/jakarta-area";
import JakartaBoundaryOverlay from "@/components/map/JakartaBoundaryOverlay";

// Fix Leaflet default icons broken by webpack/Next.js bundling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Auto-fit map to the selected route's bounding box
function BoundsFitter({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(coords as L.LatLngBoundsExpression, {
        padding: [50, 50],
        animate: true,
        duration: 0.6,
        maxZoom: 15,
      });
    }
  }, [map, coords]);
  return null;
}

function MarkerFitter({
  originCoords,
  destCoords,
}: {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (originCoords && destCoords) {
      map.fitBounds([originCoords, destCoords] as L.LatLngBoundsExpression, {
        padding: [60, 60],
        animate: true,
        duration: 0.6,
        maxZoom: 15,
      });
      return;
    }

    if (originCoords) {
      map.setView(originCoords, 15, {
        animate: true,
        duration: 0.5,
      });
      return;
    }

    if (destCoords) {
      map.setView(destCoords, 15, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [destCoords, map, originCoords]);

  return null;
}

function GuidanceStepFitter({
  stepGeometry,
}: {
  stepGeometry: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (!stepGeometry.length) return;

    if (stepGeometry.length === 1) {
      map.setView(stepGeometry[0], 16, {
        animate: true,
        duration: 0.5,
      });
      return;
    }

    map.fitBounds(stepGeometry as L.LatLngBoundsExpression, {
      padding: [80, 80],
      animate: true,
      duration: 0.6,
      maxZoom: 16,
    });
  }, [map, stepGeometry]);

  return null;
}

function MapClickSelector({
  activeSelection,
  onMapPointSelect,
}: {
  activeSelection: "origin" | "destination" | null;
  onMapPointSelect?: (
    kind: "origin" | "destination",
    coords: [number, number],
  ) => void;
}) {
  useMapEvents({
    click(event) {
      if (!activeSelection || !onMapPointSelect) return;
      if (
        activeSelection === "origin"
          ? !isWithinJavaBounds(event.latlng.lat, event.latlng.lng)
          : !isWithinJakartaArea(event.latlng.lat, event.latlng.lng)
      ) {
        return;
      }
      onMapPointSelect(activeSelection, [event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

const originIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:9999px;background:#2563eb;border:3px solid #ffffff;box-shadow:0 6px 16px rgba(37,99,235,0.35);"></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:9999px;background:#ef4444;border:3px solid #ffffff;box-shadow:0 6px 16px rgba(239,68,68,0.35);"></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Route colour per risk level + selected/unselected state
const ROUTE_COLOR: Record<string, string> = {
  low_sel: "#16a34a", // green  – safe & selected
  medium_sel: "#d97706", // amber  – medium & selected
  high_sel: "#dc2626", // red    – risky & selected
  unselected: "#94a3b8", // slate  – background routes
};

export interface LeafletMapProps {
  routes: RankedRoute[];
  selectedRouteId: string | null;
  originCoords: [number, number] | null; // [lat, lng]
  destCoords: [number, number] | null; // [lat, lng]
  originLabel?: string;
  destLabel?: string;
  activeSelection?: "origin" | "destination" | null;
  focusedStepGeometry?: [number, number][];
  onRouteSelect: (id: string) => void;
  onMapPointSelect?: (
    kind: "origin" | "destination",
    coords: [number, number],
  ) => void;
}

export default function LeafletMap({
  routes,
  selectedRouteId,
  originCoords,
  destCoords,
  originLabel,
  destLabel,
  activeSelection = null,
  focusedStepGeometry = [],
  onRouteSelect,
  onMapPointSelect,
}: LeafletMapProps) {
  const selected = routes.find((r) => r.id === selectedRouteId);
  const boundsCoords = selected?.geometry ?? routes[0]?.geometry ?? [];

  return (
    <MapContainer
      center={[-6.2088, 106.8175]} // Jakarta default centre
      zoom={9}
      style={{ height: "100%", width: "100%" }}
      zoomControl
      maxBounds={[
        [JAVA_MAP_BOUNDS.southWest.lat, JAVA_MAP_BOUNDS.southWest.lng],
        [JAVA_MAP_BOUNDS.northEast.lat, JAVA_MAP_BOUNDS.northEast.lng],
      ]}
      maxBoundsViscosity={1}
      minZoom={8}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <JakartaBoundaryOverlay dimOutside={false} />

      {/* Auto-fit to selected route */}
      {boundsCoords.length > 1 && <BoundsFitter coords={boundsCoords} />}
      {boundsCoords.length < 2 && (
        <MarkerFitter originCoords={originCoords} destCoords={destCoords} />
      )}
      {focusedStepGeometry.length > 0 && (
        <GuidanceStepFitter stepGeometry={focusedStepGeometry} />
      )}
      <MapClickSelector
        activeSelection={activeSelection}
        onMapPointSelect={onMapPointSelect}
      />

      {/* Draw all routes; highlight the selected one */}
      {routes.map((route) => {
        const isSel = route.id === selectedRouteId;
        const colorKey = isSel ? `${route.riskLevel}_sel` : "unselected";
        return (
          <Polyline
            key={route.id}
            positions={route.geometry}
            pathOptions={{
              color: ROUTE_COLOR[colorKey],
              weight: isSel ? 6 : 3,
              opacity: isSel ? 0.9 : 0.4,
              dashArray: isSel ? undefined : "10 7",
            }}
            eventHandlers={{ click: () => onRouteSelect(route.id) }}
          />
        );
      })}

      {focusedStepGeometry.length > 1 && (
        <Polyline
          positions={focusedStepGeometry}
          pathOptions={{
            color: "#2563eb",
            weight: 8,
            opacity: 0.9,
          }}
        />
      )}

      {/* Origin marker */}
      {originCoords && (
        <Marker position={originCoords} icon={originIcon}>
          <Popup>
            <div style={{ minWidth: "140px" }}>
              <strong>Titik Awal</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                {originLabel || "Lokasi awal dipilih"}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Destination marker */}
      {destCoords && (
        <Marker position={destCoords} icon={destinationIcon}>
          <Popup>
            <div style={{ minWidth: "140px" }}>
              <strong>Tujuan</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                {destLabel || "Lokasi tujuan dipilih"}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
