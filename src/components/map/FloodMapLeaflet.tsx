"use client";

/**
 * FloodMapLeaflet.tsx - Real interactive Leaflet map for the Peta Banjir page.
 *
 * Data sources:
 * - Map tiles: OpenStreetMap (real, current)
 * - Flood zones: local overlay from osrm.ts (not real-time)
 * - Area status: GET /api/jakarta/area-status
 *   - BMKG public weather/forecast signal
 *   - BMKG warning signal adapter
 *   - local risk scoring logic
 *   - optional Jakarta flood source integration point
 * - Flood reports: public reports stored in Neon PostgreSQL
 * - Evacuation points: static Jakarta assembly points
 */

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FLOOD_ZONES } from "@/lib/osrm";
import type { JakartaAreaStatusItem } from "@/types/risk";
import type { FloodReportMapItem } from "@/types/report";
import { JAKARTA_MAP_BOUNDS } from "@/lib/geo/jakarta-area";
import JakartaBoundaryOverlay from "@/components/map/JakartaBoundaryOverlay";

// Fix broken Leaflet icons under webpack/Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const EVAC_POINTS = [
  { name: "GBK / Senayan", lat: -6.2185, lng: 106.8017 },
  { name: "Monas", lat: -6.1754, lng: 106.8272 },
  { name: "Taman BMW, Jak-Utara", lat: -6.1328, lng: 106.8652 },
  { name: "Lap. Roxy, Jak-Barat", lat: -6.1698, lng: 106.8021 },
  { name: "Lap. Condet, Jak-Timur", lat: -6.272, lng: 106.8784 },
  { name: "RSUD Jak-Barat", lat: -6.1676, lng: 106.764 },
];

function zoneColors(risk: number) {
  if (risk > 55) return { fill: "#ef4444", stroke: "#b91c1c" };
  if (risk > 30) return { fill: "#f59e0b", stroke: "#d97706" };
  return { fill: "#22c55e", stroke: "#16a34a" };
}

const AREA_COLORS = {
  high: { fill: "#ef4444", stroke: "#b91c1c" },
  medium: { fill: "#f59e0b", stroke: "#d97706" },
  low: { fill: "#22c55e", stroke: "#16a34a" },
} as const;

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MapFocuser({
  area,
  report,
}: {
  area: JakartaAreaStatusItem | null;
  report: FloodReportMapItem | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (report) {
      map.setView([report.latitude, report.longitude], 15, {
        animate: true,
        duration: 0.5,
      });
      return;
    }

    if (area) {
      map.setView([area.coordinates.lat, area.coordinates.lng], 14, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [area, map, report]);

  return null;
}

export interface FloodMapLeafletProps {
  filters: Record<string, boolean>;
  selectedAreaId: string | null;
  selectedReportId?: string | null;
  onAreaSelect: (id: string) => void;
  onReportSelect?: (id: string) => void;
  areaRisks: JakartaAreaStatusItem[];
  floodReports?: FloodReportMapItem[];
}

export default function FloodMapLeaflet({
  filters,
  selectedAreaId,
  selectedReportId = null,
  onAreaSelect,
  onReportSelect,
  areaRisks,
  floodReports = [],
}: FloodMapLeafletProps) {
  const selectedArea = areaRisks.find((area) => area.id === selectedAreaId) ?? null;
  const selectedReport =
    floodReports.find((report) => report.id === selectedReportId) ?? null;

  return (
    <MapContainer
      center={[-6.2088, 106.8175]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl
      maxBounds={[
        [JAKARTA_MAP_BOUNDS.southWest.lat, JAKARTA_MAP_BOUNDS.southWest.lng],
        [JAKARTA_MAP_BOUNDS.northEast.lat, JAKARTA_MAP_BOUNDS.northEast.lng],
      ]}
      maxBoundsViscosity={1}
      minZoom={10}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <JakartaBoundaryOverlay showLabels />

      <MapFocuser area={selectedArea} report={selectedReport} />

      {filters.zones &&
        FLOOD_ZONES.map((zone, index) => {
          const color = zoneColors(zone.risk);
          return (
            <Circle
              key={index}
              center={[zone.lat, zone.lng]}
              radius={2200}
              pathOptions={{
                fillColor: color.fill,
                fillOpacity: 0.2,
                color: color.stroke,
                weight: 1,
                dashArray: "5 4",
              }}
            >
              <Popup>
                <span style={{ fontSize: "12px" }}>
                  Zona risiko{" "}
                  {zone.risk > 55
                    ? "Tinggi"
                    : zone.risk > 30
                      ? "Sedang"
                      : "Rendah"}{" "}
                  ({zone.risk}/100)
                </span>
              </Popup>
            </Circle>
          );
        })}

      {areaRisks.map((area) => {
        const color = AREA_COLORS[area.status];
        const isSelected = selectedAreaId === area.id;

        return (
          <CircleMarker
            key={area.id}
            center={[area.coordinates.lat, area.coordinates.lng]}
            radius={isSelected ? 18 : 13}
            pathOptions={{
              fillColor: color.fill,
              fillOpacity: isSelected ? 1 : 0.85,
              color: isSelected ? "#1e3a8a" : color.stroke,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{ click: () => onAreaSelect(area.id) }}
          >
            <Tooltip permanent direction="top" offset={[0, -14]}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                }}
              >
                {area.area}
              </span>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: "160px", lineHeight: "1.5" }}>
                <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                  {area.area}
                </p>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    margin: "0 0 4px",
                  }}
                >
                  {area.district}
                </p>
                <p style={{ fontSize: "12px", margin: "0 0 2px" }}>
                  Skor Risiko: <strong>{area.score}/100</strong>
                </p>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                  {formatUpdatedAt(area.updatedAt)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {filters.evacuation &&
        EVAC_POINTS.map((point) => (
          <CircleMarker
            key={point.name}
            center={[point.lat, point.lng]}
            radius={9}
            pathOptions={{
              fillColor: "#3b82f6",
              fillOpacity: 0.9,
              color: "#1d4ed8",
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <span style={{ fontSize: "11px", fontWeight: 600 }}>
                Titik Evakuasi: {point.name}
              </span>
            </Tooltip>
            <Popup>
              <div style={{ lineHeight: "1.5" }}>
                <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                  Titik Evakuasi
                </p>
                <p style={{ fontSize: "12px", margin: 0 }}>{point.name}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {filters.reports &&
        floodReports.map((report) => {
          const isSelected = selectedReportId === report.id;
          const statusStroke =
            report.riskLevel === "high"
              ? "#dc2626"
              : report.riskLevel === "medium"
                ? "#f59e0b"
                : "#16a34a";

          return (
            <CircleMarker
              key={`${report.id}-halo`}
              center={[report.latitude, report.longitude]}
              radius={isSelected ? 15 : 11}
              pathOptions={{
                fillColor: statusStroke,
                fillOpacity: isSelected ? 0.3 : 0.18,
                color: isSelected ? "#1e3a8a" : statusStroke,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onReportSelect?.(report.id),
              }}
            >
              <CircleMarker
                key={report.id}
                center={[report.latitude, report.longitude]}
                radius={isSelected ? 8 : 6}
                pathOptions={{
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                  color: "#ffffff",
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onReportSelect?.(report.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>
                    Titik laporan banjir
                  </span>
                </Tooltip>
                <Popup>
                  <div style={{ minWidth: "180px", lineHeight: "1.5" }}>
                    <p style={{ fontWeight: 700, margin: "0 0 2px" }}>
                      {report.locationTitle}
                    </p>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                        margin: "0 0 4px",
                      }}
                    >
                      {report.area}
                    </p>
                    <p style={{ fontSize: "12px", margin: "0 0 2px" }}>
                      Kedalaman air: {report.waterDepthLabel}
                    </p>
                    <p style={{ fontSize: "12px", margin: "0 0 2px" }}>
                      Akses jalan:{" "}
                      {report.roadPassable
                        ? "Masih bisa dilalui"
                        : "Tidak bisa dilalui"}
                    </p>
                    <p style={{ fontSize: "12px", margin: "0 0 2px" }}>
                      Status: <strong>{report.statusLabel}</strong> ({report.score}
                      /100)
                    </p>
                    <p style={{ fontSize: "12px", margin: "0 0 4px" }}>
                      {report.description}
                    </p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                      {formatUpdatedAt(report.reportedAt)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
}
