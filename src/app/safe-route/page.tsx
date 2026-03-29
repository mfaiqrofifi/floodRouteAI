"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Navigation,
  Search,
  Clock,
  Route,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  MapPin,
  LocateFixed,
  X,
  Crosshair,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  ListTree,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import RiskBadge from "@/components/shared/RiskBadge";
import AlertBanner from "@/components/shared/AlertBanner";
import {
  geocodeQueryWithScope,
  reverseGeocodePoint,
  JAKARTA_PRESETS,
  type GeoResult,
} from "@/lib/geocoding";
import {
  isWithinJakartaArea,
  isWithinJavaBounds,
} from "@/lib/geo/jakarta-area";
import {
  fetchScoredRoutes,
  rankRoutes,
  type ScoredRoute,
  type RankedRoute,
  type RouteMode,
} from "@/lib/osrm";
import { cn } from "@/lib/utils";
import type { LeafletMapProps } from "@/components/map/LeafletMap";
const MapView = dynamic<LeafletMapProps>(
  () => import("@/components/map/LeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Memuat peta…</span>
        </div>
      </div>
    ),
  },
);

interface LocationInputProps {
  label: string;
  value: string;
  onTextChange: (v: string) => void;
  onLocationSelect: (r: GeoResult) => void;
  onClear: () => void;
  placeholder: string;
  dotClass: string;
  selectionActive?: boolean;
  searchError?: string | null;
  helperText?: string | null;
  searchScope?: "jakarta" | "java";
}

function LocationInput({
  label,
  value,
  onTextChange,
  onLocationSelect,
  onClear,
  placeholder,
  dotClass,
  selectionActive = false,
  searchError = null,
  helperText = null,
  searchScope = "jakarta",
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (v: string) => {
    onTextChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await geocodeQueryWithScope(v, searchScope);
        setSuggestions(results.slice(0, 6));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (r: GeoResult) => {
    onTextChange(r.shortName);
    onLocationSelect(r);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full",
            dotClass,
          )}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {loading ? (
          <Loader2
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
          />
        ) : value ? (
          <button
            onClick={() => {
              onClear();
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {open && (
        <div className="absolute z-[9999] w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          {suggestions.length > 0 ? (
            suggestions.map((r, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b last:border-0 border-slate-50"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">
                      {r.shortName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {r.displayName}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : value.trim().length < 2 ? (
            <div>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Lokasi Populer
              </p>
              {JAKARTA_PRESETS.slice(0, 6).map((p) => (
                <button
                  key={p.shortName}
                  onMouseDown={() => handleSelect(p)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors"
                >
                  <MapPin size={12} className="text-slate-300 shrink-0" />
                  <p className="text-xs text-slate-700">{p.shortName}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {selectionActive ? (
        <p className="mt-1.5 text-[11px] font-medium text-blue-600">
          Klik pada peta untuk memilih {label.toLowerCase()}.
        </p>
      ) : searchError ? (
        <p className="mt-1.5 text-[11px] text-red-500">{searchError}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

function RouteCard({
  route,
  selected,
  onSelect,
}: {
  route: RankedRoute;
  selected: boolean;
  onSelect: () => void;
}) {
  const borderColor = selected
    ? route.riskLevel === "low"
      ? "border-green-500 bg-green-50/30"
      : route.riskLevel === "medium"
        ? "border-amber-400 bg-amber-50/30"
        : "border-red-400 bg-red-50/30"
    : "border-slate-100 bg-white hover:border-blue-200";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5",
        borderColor,
      )}
    >
      {route.recommended && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow">
            <CheckCircle2 size={10} />
            {route.badge ?? "Direkomendasikan"}
          </span>
        </div>
      )}

      <div className="mt-1 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <RiskBadge level={route.riskLevel} size="sm" />
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
            {route.riskLevel === "low" ? (
              <Shield size={10} className="text-green-600" />
            ) : (
              <AlertTriangle size={10} className="text-amber-500" />
            )}
            Skor {route.riskScore}/100
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-1">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            {route.durationMin} mnt
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Route size={13} className="text-slate-400" />
          <span className="text-sm text-slate-600">{route.distanceKm} km</span>
        </div>
        {route.floodProneSegments > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <AlertTriangle size={9} />
            {route.floodProneSegments} titik rawan
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
        {route.explanation[0]}
      </p>
    </button>
  );
}

const MODE_OPTS: { id: RouteMode; label: string; active: string }[] = [
  {
    id: "safest",
    label: "Paling Aman",
    active: "bg-green-600 border-green-600 text-white",
  },
  {
    id: "balanced",
    label: "Seimbang",
    active: "bg-blue-600 border-blue-600 text-white",
  },
  {
    id: "fastest",
    label: "Tercepat",
    active: "bg-amber-500 border-amber-500 text-white",
  },
];

export default function SafeRoutePage() {
  const mapShellRef = useRef<HTMLDivElement>(null);
  const [originText, setOriginText] = useState("");
  const [destText, setDestText] = useState("");
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(
    null,
  );
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<RouteMode>("balanced");
  const [scoredRoutes, setScoredRoutes] = useState<ScoredRoute[]>([]);
  const [rankedRoutes, setRankedRoutes] = useState<RankedRoute[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSelection, setActiveSelection] = useState<
    "origin" | "destination" | null
  >(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [reverseLoading, setReverseLoading] = useState<
    "origin" | "destination" | null
  >(null);
  const [locatingOrigin, setLocatingOrigin] = useState(false);
  const [showMapHint, setShowMapHint] = useState(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showAllGuidance, setShowAllGuidance] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const originParam = params.get("origin");
    const originLat = params.get("originLat");
    const originLng = params.get("originLng");

    if (originParam) {
      setOriginText(originParam);
    }

    if (originLat && originLng) {
      const parsedLat = Number(originLat);
      const parsedLng = Number(originLng);

      if (
        !Number.isNaN(parsedLat) &&
        !Number.isNaN(parsedLng) &&
        isWithinJavaBounds(parsedLat, parsedLng)
      ) {
        setOriginCoords([parsedLat, parsedLng]);
        return;
      }
    }

    if (!originParam) return;

    const preset = JAKARTA_PRESETS.find(
      (p) =>
        p.shortName.toLowerCase() === originParam.toLowerCase() ||
        p.displayName.toLowerCase().includes(originParam.toLowerCase()) ||
        originParam.toLowerCase().includes(p.shortName.toLowerCase()),
    );
    if (preset) setOriginCoords([preset.lat, preset.lng]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scoredRoutes.length > 0) {
      const ranked = rankRoutes(scoredRoutes, mode);
      setRankedRoutes(ranked);
      setSelectedId(ranked[0]?.id ?? null);
      setSelectedStepIndex(null);
      setShowAllGuidance(false);
    }
  }, [mode, scoredRoutes]);

  useEffect(() => {
    setSelectedStepIndex(null);
  }, [selectedId]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsMapFullscreen(document.fullscreenElement === mapShellRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const applyLocation = useCallback(
    (kind: "origin" | "destination", result: GeoResult) => {
      if (kind === "origin" && !isWithinJavaBounds(result.lat, result.lng)) {
        setGeocodeError("Titik awal hanya didukung dari wilayah Pulau Jawa.");
        return;
      }

      if (kind === "destination" && !isWithinJakartaArea(result.lat, result.lng)) {
        setGeocodeError("Titik tujuan harus berada di wilayah DKI Jakarta.");
        return;
      }

      if (kind === "origin") {
        setOriginText(result.shortName);
        setOriginCoords([result.lat, result.lng]);
      } else {
        setDestText(result.shortName);
        setDestCoords([result.lat, result.lng]);
      }

      setGeocodeError(null);
      setActiveSelection(null);
      setError(null);
    },
    [],
  );

  const clearLocation = useCallback((kind: "origin" | "destination") => {
    if (kind === "origin") {
      setOriginText("");
      setOriginCoords(null);
    } else {
      setDestText("");
      setDestCoords(null);
    }

    setActiveSelection((prev) => (prev === kind ? null : prev));
    setScoredRoutes([]);
    setRankedRoutes([]);
    setSelectedId(null);
    setError(null);
  }, []);

  const resetRouteBuilder = () => {
    setOriginText("");
    setDestText("");
    setOriginCoords(null);
    setDestCoords(null);
    setActiveSelection(null);
    setGeocodeError(null);
    setScoredRoutes([]);
    setRankedRoutes([]);
    setSelectedId(null);
    setError(null);
  };

  const handleMapPointSelect = useCallback(
    async (kind: "origin" | "destination", coords: [number, number]) => {
      setReverseLoading(kind);
      try {
        const scope = kind === "origin" ? "java" : "jakarta";
        const result = await reverseGeocodePoint(coords[0], coords[1], scope);
        applyLocation(kind, result);
      } catch {
        setGeocodeError("Tidak dapat membaca label lokasi dari titik peta.");
      } finally {
        setReverseLoading(null);
      }
    },
    [applyLocation],
  );

  const handleSearch = useCallback(async () => {
    if (!originCoords || !destCoords) return;
    setLoading(true);
    setError(null);
    setScoredRoutes([]);
    setRankedRoutes([]);
    setSelectedId(null);
    try {
      const scored = await fetchScoredRoutes(
        originCoords[0],
        originCoords[1],
        destCoords[0],
        destCoords[1],
      );
      setScoredRoutes(scored);
      const ranked = rankRoutes(scored, mode);
      setRankedRoutes(ranked);
      setSelectedId(ranked[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message ?? "Gagal mengambil data rute. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [originCoords, destCoords, mode]);

  const handleUseCurrentLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeocodeError("Browser ini tidak mendukung akses lokasi GPS.");
      return;
    }

    setLocatingOrigin(true);
    setGeocodeError(null);
    setError(null);
    setActiveSelection(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));

          if (!isWithinJavaBounds(lat, lng)) {
            setGeocodeError(
              "Lokasi GPS Anda terdeteksi di luar Pulau Jawa. Saat ini titik awal hanya didukung dari wilayah Pulau Jawa.",
            );
            return;
          }

          const result = await reverseGeocodePoint(lat, lng, "java");
          applyLocation("origin", {
            ...result,
            lat,
            lng,
          });
        } catch {
          setGeocodeError("Lokasi GPS berhasil didapat, tetapi nama lokasinya gagal dibaca.");
        } finally {
          setLocatingOrigin(false);
        }
      },
      (geoError) => {
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Izinkan akses GPS di browser untuk memakai lokasi saat ini."
            : geoError.code === geoError.POSITION_UNAVAILABLE
              ? "Lokasi saat ini tidak tersedia. Coba lagi dalam beberapa saat."
              : geoError.code === geoError.TIMEOUT
                ? "Permintaan lokasi terlalu lama. Coba lagi."
                : "Gagal mengambil lokasi saat ini dari GPS.";

        setGeocodeError(message);
        setLocatingOrigin(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, [applyLocation]);

  const selectedRoute =
    rankedRoutes.find((route) => route.id === selectedId) ?? rankedRoutes[0] ?? null;
  const focusedStepGeometry =
    selectedStepIndex !== null
      ? (() => {
          const step = selectedRoute?.guidanceSteps[selectedStepIndex];
          if (!step || !selectedRoute) return [];
          return selectedRoute.geometry.slice(
            step.routeStartIndex,
            step.routeEndIndex + 1,
          );
        })()
      : [];
  const visibleGuidanceSteps = selectedRoute
    ? showAllGuidance
      ? selectedRoute.guidanceSteps
      : selectedRoute.guidanceSteps.slice(0, 5)
    : [];
  const canSearch = !!originCoords && !!destCoords && !loading;

  const handleToggleMapFullscreen = useCallback(async () => {
    if (!mapShellRef.current) return;

    if (document.fullscreenElement === mapShellRef.current) {
      await document.exitFullscreen();
      return;
    }

    await mapShellRef.current.requestFullscreen();
  }, []);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4 border-b border-slate-100 bg-white">
        <SectionHeading
          title="Temukan Rute Lebih Aman"
          subtitle="Rute nyata dari OpenStreetMap dengan penilaian risiko banjir per segmen"
          badge="Rute Aman"
          className="mb-0"
        />
      </div>
      <div className="flex-1 grid lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col bg-white border-r border-slate-100 overflow-y-auto max-h-[calc(100vh-130px)]">
          <div className="p-5 space-y-4 border-b border-slate-100">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Cakupan Area
              </p>
              <p className="mt-1 text-sm text-blue-900 leading-relaxed">
                Titik awal dapat dipilih dari wilayah Pulau Jawa, tetapi tujuan
                akhir harus berada di DKI Jakarta. Garis biru pada peta menandai area tujuan Jakarta.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Mode Pemilihan Titik
                  </p>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    Cari lokasi dengan autocomplete atau pilih langsung di peta.
                  </p>
                </div>
                <Sparkles size={16} className="text-blue-500 shrink-0" />
              </div>
            </div>

            <div className="space-y-2.5">
              <LocationInput
                label="Titik Awal"
                value={originText}
                onTextChange={(value) => {
                  setOriginText(value);
                  setOriginCoords(null);
                  setError(null);
                }}
                onLocationSelect={(r) => applyLocation("origin", r)}
                onClear={() => clearLocation("origin")}
                placeholder="Cari lokasi asal…"
                dotClass="bg-blue-500"
                selectionActive={activeSelection === "origin"}
                searchError={geocodeError}
                searchScope="java"
                helperText={
                  originCoords
                    ? `${originCoords[0].toFixed(5)}, ${originCoords[1].toFixed(5)}`
                    : "Titik awal bisa dari Pulau Jawa, GPS, atau klik di peta"
                }
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locatingOrigin}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locatingOrigin ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Mendeteksi GPS...
                    </>
                  ) : (
                    <>
                      <LocateFixed size={13} />
                      Lokasi Saya
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveSelection((prev) =>
                      prev === "origin" ? null : "origin",
                    )
                  }
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all",
                    activeSelection === "origin"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300",
                  )}
                >
                  <Crosshair size={13} />
                  Pilih Titik Awal di Peta
                </button>
                {originCoords && (
                  <button
                    type="button"
                    onClick={() => clearLocation("origin")}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <LocationInput
                label="Tujuan"
                value={destText}
                onTextChange={(value) => {
                  setDestText(value);
                  setDestCoords(null);
                  setError(null);
                }}
                onLocationSelect={(r) => applyLocation("destination", r)}
                onClear={() => clearLocation("destination")}
                placeholder="Cari lokasi tujuan…"
                dotClass="bg-red-500"
                selectionActive={activeSelection === "destination"}
                searchError={geocodeError}
                searchScope="jakarta"
                helperText={
                  destCoords
                    ? `${destCoords[0].toFixed(5)}, ${destCoords[1].toFixed(5)}`
                    : "Tujuan wajib berada di DKI Jakarta"
                }
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveSelection((prev) =>
                      prev === "destination" ? null : "destination",
                    )
                  }
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all",
                    activeSelection === "destination"
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-red-300",
                  )}
                >
                  <Crosshair size={13} />
                  Pilih Tujuan di Peta
                </button>
                {destCoords && (
                  <button
                    type="button"
                    onClick={() => clearLocation("destination")}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>
                {reverseLoading
                  ? "Membaca nama lokasi dari titik peta…"
                  : activeSelection === "origin"
                      ? "Klik peta untuk menentukan titik awal dari wilayah Pulau Jawa."
                      : activeSelection === "destination"
                        ? "Klik peta untuk menentukan tujuan di DKI Jakarta."
                      : "Titik awal bisa dari Pulau Jawa, sedangkan tujuan harus di DKI Jakarta."}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Prioritas Rute
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {MODE_OPTS.map(({ id, label, active }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-semibold transition-all",
                      mode === id
                        ? active
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={!canSearch}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Mencari rute…
                </>
              ) : (
                <>
                  <Search size={15} />
                  Cari Rute Aman
                </>
              )}
            </button>

            <button
              onClick={resetRouteBuilder}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Reset Titik Rute
            </button>
          </div>
          <div className="flex-1 p-5 space-y-4">
            {error && (
              <AlertBanner
                variant="danger"
                title="Gagal memuat rute"
                message={error}
              />
            )}

            {!loading && !rankedRoutes.length && !error && (
              <div className="text-center py-10">
                <Navigation size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">
                  Masukkan titik awal dan tujuan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Titik awal bisa dari Pulau Jawa, sedangkan tujuan harus di DKI Jakarta.
                </p>
              </div>
            )}

            {!loading && rankedRoutes.length > 0 && (
              <>
                <AlertBanner
                  variant="success"
                  title="Rute berhasil ditemukan"
                  message={rankedRoutes[0]?.explanation[0] ?? ""}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {rankedRoutes.length} Rute Tersedia
                    </p>
                    <span className="text-[10px] text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">
                      Mode: {MODE_OPTS.find((m) => m.id === mode)?.label}
                    </span>
                  </div>
                  {rankedRoutes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      selected={selectedId === route.id}
                      onSelect={() => setSelectedId(route.id)}
                    />
                  ))}
                </div>

                {selectedRoute && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                          Rekomendasi Jalur
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedRoute.guidanceSummary}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-700 border border-blue-200">
                        Rute dipilih
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] text-blue-700/80">
                          Klik salah satu langkah untuk menyorot segmen jalannya di peta.
                        </p>
                        {selectedRoute.guidanceSteps.length > 5 && (
                          <button
                            type="button"
                            onClick={() => setShowAllGuidance((prev) => !prev)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                          >
                            <ListTree size={11} />
                            {showAllGuidance
                              ? "Tampilkan ringkas"
                              : `Lihat semua (${selectedRoute.guidanceSteps.length})`}
                          </button>
                        )}
                      </div>
                      {visibleGuidanceSteps.map((step, index) => {
                        const actualIndex = showAllGuidance ? index : index;
                        return (
                        <button
                          type="button"
                          key={`${selectedRoute.id}-guidance-${actualIndex}`}
                          onClick={() =>
                            setSelectedStepIndex((prev) =>
                              prev === actualIndex ? null : actualIndex,
                            )
                          }
                          className={cn(
                            "w-full rounded-xl border p-3 text-left transition-all",
                            selectedStepIndex === actualIndex
                              ? "border-blue-300 bg-blue-50 shadow-sm"
                              : "border-white/70 bg-white/80 hover:border-blue-200 hover:bg-white",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                                selectedStepIndex === actualIndex
                                  ? "bg-blue-700"
                                  : "bg-blue-600",
                              )}
                            >
                              {actualIndex + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-slate-800">
                                  {step.instruction}
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  <ArrowRight size={10} />
                                  {step.distanceKm.toFixed(1).replace(".0", "")} km
                                </span>
                                {selectedStepIndex === actualIndex && (
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                    Disorot di peta
                                  </span>
                                )}
                              </div>
                              {step.warning && (
                                <p className="mt-1 text-xs text-amber-700">
                                  {step.warning}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Skor risiko dihitung per-segmen berdasarkan kedekatan dengan
                    zona rawan banjir Jakarta. Selalu perhatikan kondisi jalan
                    aktual sebelum berangkat.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <div
          ref={mapShellRef}
          className={cn(
            "relative h-[400px] bg-white lg:h-auto",
            isMapFullscreen && "h-screen",
          )}
        >
          <MapView
            routes={rankedRoutes}
            selectedRouteId={selectedId}
            originCoords={originCoords}
            destCoords={destCoords}
            originLabel={originText}
            destLabel={destText}
            activeSelection={activeSelection}
            focusedStepGeometry={focusedStepGeometry}
            resizeKey={isMapFullscreen ? "fullscreen" : "windowed"}
            onRouteSelect={setSelectedId}
            onMapPointSelect={handleMapPointSelect}
          />
          <button
            type="button"
            onClick={handleToggleMapFullscreen}
            className={cn(
              "absolute z-[1000] inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur hover:border-blue-300 hover:bg-blue-50",
              isMapFullscreen ? "top-4 left-4" : "bottom-4 right-4",
            )}
          >
            {isMapFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isMapFullscreen ? "Tutup layar penuh" : "Layar penuh"}
          </button>
          {showMapHint && (
            <div className="absolute top-4 right-4 z-[1000] max-w-xs rounded-2xl border border-blue-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Area Aktif
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    Garis biru menandai area tujuan DKI Jakarta. Titik awal boleh dipilih dari wilayah Pulau Jawa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapHint(false)}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Tutup informasi area aktif"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          {activeSelection && (
            <div
              className={cn(
                "absolute right-4 z-[1000] max-w-xs rounded-2xl border border-blue-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur",
                showMapHint ? "top-32" : "top-4",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {activeSelection === "origin"
                      ? "Mode pilih titik awal aktif"
                      : "Mode pilih tujuan aktif"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {activeSelection === "origin"
                      ? "Pilih titik awal dari wilayah Pulau Jawa."
                      : "Pilih tujuan yang berada di DKI Jakarta."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSelection(null)}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Tutup mode pilih titik"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
          {!rankedRoutes.length && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                <Navigation
                  size={22}
                  className="text-white mx-auto mb-2 opacity-60"
                />
                <p className="text-white text-sm font-medium opacity-80">
                  Masukkan rute untuk melihat perjalanan di peta
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

