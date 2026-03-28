"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Layers,
  Filter,
  Clock,
  ChevronRight,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  LocateFixed,
  Navigation,
  Waves,
  ShieldAlert,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import RiskBadge from "@/components/shared/RiskBadge";
import MapLegend from "@/components/shared/MapLegend";
import FloodReportCard from "@/components/shared/FloodReportCard";
import { cn, getRiskColor } from "@/lib/utils";
import type { FloodMapLeafletProps } from "@/components/map/FloodMapLeaflet";
import type { JakartaAreaStatusItem, JakartaAreaStatusResponse } from "@/types/risk";
import type { FloodReportListResponse, FloodReportMapItem } from "@/types/report";

const FloodMapView = dynamic<FloodMapLeafletProps>(
  () => import("@/components/map/FloodMapLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Memuat peta...</span>
        </div>
      </div>
    ),
  },
);

const filterOptions = [
  { id: "zones", label: "Zona Banjir", defaultOn: true },
  { id: "reports", label: "Laporan Banjir", defaultOn: true },
  { id: "routes", label: "Rute Aman", defaultOn: false },
  { id: "evacuation", label: "Titik Evakuasi", defaultOn: false },
];

function formatUpdatedAt(value: string | null): string {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function FloodMapPage() {
  const [filters, setFilters] = useState<Record<string, boolean>>({
    zones: true,
    reports: true,
    routes: false,
    evacuation: false,
  });
  const [areaStatuses, setAreaStatuses] = useState<JakartaAreaStatusItem[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [areaStatusUpdatedAt, setAreaStatusUpdatedAt] = useState<string | null>(null);
  const [loadingAreaStatus, setLoadingAreaStatus] = useState(true);
  const [areaStatusError, setAreaStatusError] = useState<string | null>(null);
  const [reports, setReports] = useState<FloodReportMapItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const selectedArea = useMemo(
    () => areaStatuses.find((area) => area.id === selectedAreaId) ?? null,
    [areaStatuses, selectedAreaId],
  );
  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );
  const blockedRoadReports = useMemo(
    () => reports.filter((report) => !report.roadPassable).length,
    [reports],
  );
  const highestReport = useMemo(
    () => reports.reduce<FloodReportMapItem | null>(
      (highest, current) => (current.score > (highest?.score ?? -1) ? current : highest),
      null,
    ),
    [reports],
  );
  const highRiskAreas = useMemo(
    () => areaStatuses.filter((area) => area.status === "high").length,
    [areaStatuses],
  );

  const loadAreaStatus = async () => {
    setLoadingAreaStatus(true);
    setAreaStatusError(null);

    try {
      const res = await fetch("/api/jakarta/area-status", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat status area (HTTP ${res.status}).`);
      }

      const data: JakartaAreaStatusResponse = await res.json();
      setAreaStatuses(data.items);
      setAreaStatusUpdatedAt(data.timestamp);
      setSelectedAreaId((prev) =>
        prev && data.items.some((area) => area.id === prev)
          ? prev
          : data.items[0]?.id ?? null,
      );
    } catch (error) {
      setAreaStatusError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat status area.",
      );
      setAreaStatuses([]);
      setAreaStatusUpdatedAt(null);
      setSelectedAreaId(null);
    } finally {
      setLoadingAreaStatus(false);
    }
  };

  useEffect(() => {
    void loadAreaStatus();
  }, []);

  const loadReports = async () => {
    setLoadingReports(true);
    setReportsError(null);

    try {
      const res = await fetch("/api/flood-reports?limit=12", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat laporan (HTTP ${res.status}).`);
      }

      const data: FloodReportListResponse = await res.json();
      setReports(data.reports);
    } catch (error) {
      setReportsError(
        error instanceof Error
          ? error.message
          : "Gagal memuat laporan banjir.",
      );
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const toggleFilter = (id: string) => {
    setFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6">
        <SectionHeading
          title="Peta Banjir"
          subtitle="Lihat zona rawan banjir, titik genangan aktif, dan indikator keselamatan secara visual."
          badge="Peta Interaktif"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-slate-100 shadow-card">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Filter size={13} />
          Tampilkan:
        </div>
        {filterOptions.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => toggleFilter(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              filters[id]
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300",
            )}
          >
            <Layers size={11} />
            {label}
          </button>
        ))}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
          <LocateFixed size={11} />
          {loadingReports ? "Memuat titik laporan..." : `${reports.length} titik laporan`}
        </span>
        <Link
          href="/report-flood"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <AlertTriangle size={11} />
          Laporkan Titik
        </Link>
        <div className="ml-auto text-xs text-slate-400 flex items-center gap-1">
          <Clock size={11} />
          Diperbarui: {formatUpdatedAt(areaStatusUpdatedAt)}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-card">
            <FloodMapView
              filters={filters}
              selectedAreaId={selectedAreaId}
              selectedReportId={selectedReportId}
              onAreaSelect={(id) => {
                setSelectedReportId(null);
                setSelectedAreaId(id);
              }}
              onReportSelect={(id) => {
                setSelectedAreaId(null);
                setSelectedReportId(id);
              }}
              areaRisks={areaStatuses}
              floodReports={reports}
            />

            {!loadingReports && filters.reports && reports.length === 0 && (
              <div className="absolute top-4 left-4 z-[1000] max-w-xs rounded-2xl border border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Belum ada titik laporan
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Kirim laporan pertama untuk menampilkan titik banjir langsung di peta.
                </p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-[1000] hidden md:block">
              <MapLegend />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Aktivitas Laporan
                </p>
                <Waves size={16} className="text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loadingReports ? "..." : reports.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                titik laporan tampil di peta Jakarta saat ini
              </p>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-500">Akses jalan terganggu</p>
                <p className="text-sm font-semibold text-slate-800">
                  {loadingReports ? "..." : `${blockedRoadReports} laporan`}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sorotan Tertinggi
                </p>
                <ShieldAlert size={16} className="text-amber-500" />
              </div>
              {highestReport ? (
                <>
                  <p className="text-lg font-bold text-slate-900">
                    {highestReport.locationTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {highestReport.statusLabel} · {highestReport.score}/100
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {highestReport.description}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 leading-relaxed">
                  Belum ada laporan yang cukup untuk ditampilkan sebagai sorotan.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Aksi Cepat
                </p>
                <Navigation size={16} className="text-blue-300" />
              </div>
              <p className="text-lg font-bold">
                {highRiskAreas} area Jakarta sedang berstatus tinggi
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Buka rute aman atau kirim laporan baru untuk memperkaya kondisi lapangan.
              </p>
              <div className="mt-5 space-y-2">
                <Link
                  href="/safe-route"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 transition-colors"
                >
                  <span>Cari Rute Aman</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/report-flood"
                  className="flex items-center justify-between rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold hover:bg-blue-400 transition-colors"
                >
                  <span>Buat Laporan Baru</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedReport ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Detail Laporan
                </h3>
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {selectedReport.locationTitle}
                  </p>
                  <p className="text-xs text-slate-500">{selectedReport.area}</p>
                </div>
                <RiskBadge level={selectedReport.riskLevel} />
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Skor Laporan</span>
                  <span className="text-xs font-bold">
                    {selectedReport.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full",
                      selectedReport.riskLevel === "high"
                        ? "bg-red-500"
                        : selectedReport.riskLevel === "medium"
                          ? "bg-amber-500"
                          : "bg-green-500",
                    )}
                    style={{ width: `${selectedReport.score}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Kondisi
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedReport.waterDepthLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedReport.roadPassable
                      ? "Jalan masih bisa dilalui"
                      : "Jalan tidak bisa dilalui"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Catatan Pelaporan
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Koordinat
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedReport.latitude.toFixed(5)},{" "}
                    {selectedReport.longitude.toFixed(5)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatUpdatedAt(selectedReport.reportedAt)}
                </span>
                <span className="font-semibold text-slate-500">
                  {selectedReport.statusLabel}
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/report-flood"
                  className="flex-1 text-center py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buat Laporan
                </Link>
                <Link
                  href={`/safe-route?origin=${encodeURIComponent(selectedReport.area)}`}
                  className="flex-1 text-center py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Rute Aman
                </Link>
              </div>
            </div>
          ) : selectedArea ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Detail Area
                </h3>
                <button
                  onClick={() => setSelectedAreaId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-900">{selectedArea.area}</p>
                  <p className="text-xs text-slate-500">{selectedArea.district}</p>
                </div>
                <RiskBadge level={selectedArea.status} />
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Skor Risiko</span>
                  <span className="text-xs font-bold">{selectedArea.score}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      selectedArea.status === "high"
                        ? "bg-red-500"
                        : selectedArea.status === "medium"
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${selectedArea.score}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {selectedArea.summary}
              </p>

              <div className="space-y-1.5 mb-4">
                {selectedArea.topFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <AlertTriangle
                      size={11}
                      className="text-amber-500 shrink-0 mt-0.5"
                    />
                    {factor}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatUpdatedAt(selectedArea.updatedAt)}
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/risk"
                  className="flex-1 text-center py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Detail Risiko
                </Link>
                <Link
                  href={`/safe-route?origin=${encodeURIComponent(selectedArea.area)}`}
                  className="flex-1 text-center py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Rute Aman
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 text-center">
              <MapPin size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Klik titik laporan atau nama area di peta untuk melihat detail informasi
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm">
                Status Area
              </h3>
              <button
                onClick={() => void loadAreaStatus()}
                disabled={loadingAreaStatus}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400"
              >
                <RefreshCw size={12} className={loadingAreaStatus ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {loadingAreaStatus ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse flex items-center justify-between p-2.5 rounded-xl border bg-slate-50 border-slate-100"
                  >
                    <div className="h-3 bg-slate-200 rounded-full w-32" />
                    <div className="h-3 bg-slate-200 rounded-full w-8" />
                  </div>
                ))}
              </div>
            ) : areaStatusError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-700 mb-1">
                  Gagal memuat status area
                </p>
                <p className="text-xs text-red-600 mb-3">{areaStatusError}</p>
                <button
                  onClick={() => void loadAreaStatus()}
                  className="text-xs font-semibold text-red-700 hover:text-red-800"
                >
                  Coba lagi
                </button>
              </div>
            ) : areaStatuses.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">
                  Belum ada status area Jakarta yang tersedia.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {areaStatuses.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => {
                      setSelectedReportId(null);
                      setSelectedAreaId(area.id);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full p-2.5 rounded-xl border text-left transition-all",
                      selectedAreaId === area.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-slate-50 border-slate-100 hover:bg-blue-50/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          getRiskColor(area.status).dot,
                        )}
                      />
                      <div>
                        <span className="block text-xs font-medium text-slate-800">
                          {area.area}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {formatUpdatedAt(area.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">{area.score}</span>
                      <ChevronRight size={12} className="text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm">
                Titik Laporan
              </h3>
              <span className="text-xs font-semibold text-blue-600">
                {loadingReports ? "..." : reports.length}
              </span>
            </div>

            {loadingReports ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse h-12 rounded-xl border bg-slate-50 border-slate-100"
                  />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">
                  Belum ada titik laporan banjir yang tersimpan.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.slice(0, 5).map((report) => (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedAreaId(null);
                      setSelectedReportId(report.id);
                    }}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-all",
                      selectedReportId === report.id
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-100 bg-slate-50 hover:bg-blue-50/60",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {report.locationTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {report.waterDepthLabel} ·{" "}
                        {report.roadPassable
                          ? "Bisa dilalui"
                          : "Tidak bisa dilalui"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 w-2.5 h-2.5 rounded-full shrink-0",
                        report.riskLevel === "high"
                          ? "bg-red-500"
                          : report.riskLevel === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500",
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:hidden">
            <MapLegend />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            title="Laporan Terbaru"
            subtitle="Laporan banjir dari komunitas pengguna."
            className="mb-0"
          />
          <Link
            href="/report-flood"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <AlertTriangle size={13} />
            Buat Laporan
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingReports ? (
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 rounded-xl border border-slate-100 bg-slate-50 animate-pulse"
              />
            ))
          ) : reportsError ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {reportsError}
            </div>
          ) : reports.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Belum ada laporan banjir tersimpan untuk ditampilkan di peta.
            </div>
          ) : (
            reports.map((report) => (
              <FloodReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Transparansi Sumber Data
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Peta Dasar",
              value: "OpenStreetMap",
              tag: "REAL",
              tagColor: "bg-green-100 text-green-700",
            },
            {
              label: "Status Area",
              value: "BMKG current signal + prediksi 6 jam + local risk scoring backend",
              tag: "DERIVED",
              tagColor: "bg-blue-100 text-blue-700",
            },
            {
              label: "Signal Peringatan",
              value: "Prediksi pendek BMKG untuk warning level area",
              tag: "HYBRID",
              tagColor: "bg-amber-100 text-amber-700",
            },
            {
              label: "Laporan Banjir",
              value: "Laporan komunitas publik yang langsung tersimpan ke Neon",
              tag: "REAL",
              tagColor: "bg-green-100 text-green-700",
            },
          ].map(({ label, value, tag, tagColor }) => (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  {label}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tagColor}`}
                >
                  {tag}
                </span>
              </div>
              <p className="text-xs text-slate-500">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
