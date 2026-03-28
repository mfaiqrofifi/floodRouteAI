"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { JAKARTA_MAP_BOUNDS, isWithinJakartaArea } from "@/lib/geo/jakarta-area";
import JakartaBoundaryOverlay from "@/components/map/JakartaBoundaryOverlay";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ReportLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

function ClickHandler({
  onSelect,
}: {
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(event) {
      if (!isWithinJakartaArea(event.latlng.lat, event.latlng.lng)) {
        return;
      }

      onSelect({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function RecenterOnSelection({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMapEvents({});

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.setView([latitude, longitude], 14, { animate: true });
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function ReportLocationPicker({
  latitude,
  longitude,
  onSelect,
}: ReportLocationPickerProps) {
  return (
    <div className="h-72 rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer
        center={[-6.2088, 106.8456]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
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
        <ClickHandler onSelect={onSelect} />
        <RecenterOnSelection latitude={latitude} longitude={longitude} />
        {latitude !== null && longitude !== null && (
          <Marker position={[latitude, longitude]} />
        )}
      </MapContainer>
    </div>
  );
}
