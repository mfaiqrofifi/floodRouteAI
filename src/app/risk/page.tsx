"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Info,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FloodRiskResponse, RainfallLevel, RiskLevel } from "@/types/risk";
import { SUPPORTED_AREAS } from "@/lib/area-mapping";

const RISK_COLORS: Record<
  RiskLevel,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    dot: string;
    score: string;
  }
> = {
  low: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
    score: "text-green-600",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
    score: "text-amber-600",
  },
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
    score: "text-red-600",
  },
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Aman",
  medium: "Waspada",
  high: "Bahaya",
};

const RAINFALL_LABELS: Record<RainfallLevel, string> = {
  none: "Tidak ada hujan",
  light: "Hujan Ringan",
  medium: "Hujan Sedang",
  heavy: "Hujan Lebat",
};

const RAINFALL_COLORS: Record<RainfallLevel, string> = {
  none: "text-slate-500",
  light: "text-blue-500",
  medium: "text-blue-600",
  heavy: "text-indigo-700",
};

function ScoreArc({ score, level }: { score: number; level: RiskLevel }) {
  const colors = RISK_COLORS[level];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#22c55e";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold leading-none", colors.score)}>
          {score}
        </span>
        <span className="text-[10px] text-slate-500 font-medium mt-0.5">
          / 100
        </span>
      </div>
    </div>
  );
}

export default function RiskPage() {
  const [selectedArea, setSelectedArea] = useState<string>(SUPPORTED_AREAS[0]);
  const [result, setResult] = useState<FloodRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/risk/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: "Jakarta", area: selectedArea }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ??
            `Gagal memuat data (HTTP ${res.status}).`,
        );
      }

      const data: FloodRiskResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const colors = result ? RISK_COLORS[result.riskLevel] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
              <Shield size={11} />
              Cek Risiko Banjir
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Analisis Risiko Banjir Jakarta
          </h1>
          <p className="mt-2 text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl">
            Skor dihitung secara real-time dari data cuaca BMKG, kerentanan
            wilayah, dan laporan banjir aktif.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Pilih Wilayah Jakarta
          </label>

          <div className="grid grid-cols-1 gap-2.5 mb-4">
            {SUPPORTED_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={cn(
                  "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                  selectedArea === area
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300",
                )}
              >
                <MapPin
                  size={15}
                  className={
                    selectedArea === area ? "text-blue-600" : "text-slate-400"
                  }
                />
                {area}
                {selectedArea === area && (
                  <CheckCircle2
                    size={15}
                    className="ml-auto text-blue-600 shrink-0"
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-sm transition-all",
              loading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm",
            )}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengambil data BMKG...
              </>
            ) : (
              <>
                <Search size={16} />
                Cek Risiko Sekarang
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="mt-0.5 text-red-600">{error}</p>
              <button
                onClick={handleCheck}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900"
              >
                <RefreshCw size={11} />
                Coba lagi
              </button>
            </div>
          </div>
        )}
        {!hasSearched && !loading && (
          <div className="flex flex-col items-center text-center py-12 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
              <CloudRain size={28} className="text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1.5">
              Pilih wilayah dan cek risiko
            </h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Data cuaca diambil langsung dari BMKG dan dianalisis secara
              otomatis. Tidak ada nilai acak, semua berbasis data nyata.
            </p>
          </div>
        )}
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[80, 60, 100].map((w, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5"
              >
                <div
                  className="h-3 bg-slate-200 rounded-full mb-3"
                  style={{ width: `${w}%` }}
                />
                <div className="h-5 bg-slate-200 rounded-full w-1/2 mb-2" />
                <div className="h-3 bg-slate-100 rounded-full w-full mb-1.5" />
                <div className="h-3 bg-slate-100 rounded-full w-4/5" />
              </div>
            ))}
          </div>
        )}
        {result && colors && !loading && (
          <>
            <div
              className={cn(
                "rounded-2xl border p-5 shadow-sm",
                colors.bg,
                colors.border,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={13} className={colors.text} />
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        colors.text,
                      )}
                    >
                      {result.area}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Risiko Banjir Saat Ini
                  </h2>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full",
                      colors.badge,
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        colors.dot,
                      )}
                    />
                    {RISK_LABELS[result.riskLevel]}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5">
                    <CloudRain
                      size={13}
                      className={RAINFALL_COLORS[result.signals.rainfallLevel]}
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      {RAINFALL_LABELS[result.signals.rainfallLevel]}
                    </span>
                    <span className="text-xs text-slate-400">· Data BMKG</span>
                  </div>
                </div>
                <ScoreArc score={result.riskScore} level={result.riskLevel} />
              </div>
              {result.signals.weatherSummary && (
                <div className="mt-4 flex items-start gap-2 bg-white/60 rounded-xl p-3 border border-white/80">
                  <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.signals.weatherSummary}
                  </p>
                </div>
              )}
              <p className="mt-3 text-[11px] text-slate-400">
                Diperbarui:{" "}
                {new Date(result.timestamp).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Sinyal Risiko
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <SignalChip
                  label="Curah Hujan"
                  value={RAINFALL_LABELS[result.signals.rainfallLevel]}
                  icon={<CloudRain size={13} />}
                />
                <SignalChip
                  label="Kerentanan Area"
                  value={
                    {
                      low: "Rendah",
                      medium: "Sedang",
                      high: "Tinggi",
                    }[result.signals.vulnerabilityLevel]
                  }
                  icon={<Shield size={13} />}
                />
                <SignalChip
                  label="Laporan Aktif"
                  value={`${result.signals.activeFloodReportsCount} laporan`}
                  icon={<AlertTriangle size={13} />}
                />
                <SignalChip
                  label="Titik Rawan"
                  value={`${result.signals.nearbyFloodPointsCount} titik`}
                  icon={<MapPin size={13} />}
                />
              </div>
            </div>
            {result.factors.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Faktor Penyumbang Risiko
                </h3>
                <ul className="space-y-2.5">
                  {result.factors.map((factor, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <span
                        className={cn(
                          "mt-1.5 w-2 h-2 rounded-full shrink-0",
                          result.riskLevel === "high"
                            ? "bg-red-400"
                            : result.riskLevel === "medium"
                              ? "bg-amber-400"
                              : "bg-green-400",
                        )}
                      />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Ringkasan Hasil
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles size={10} className="text-blue-500" />
                    <span className="text-[11px] text-blue-600">
                      Penjelasan oleh AI · Skor dihitung oleh aturan BMKG
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed mb-4">
                {result.ai.summary}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                {result.ai.explanation}
              </p>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Tindakan yang Disarankan
                </p>
                <ul className="space-y-2">
                  {result.ai.actions.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <span className="mt-1 w-4 h-4 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/flood-map"
                className="flex items-center justify-between gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-colors shadow-sm group"
              >
                <span className="flex items-center gap-2">
                  <MapPin
                    size={16}
                    className="text-blue-500 group-hover:text-blue-600"
                  />
                  Peta Banjir
                </span>
                <ChevronRight
                  size={15}
                  className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <Link
                href="/safe-route"
                className="flex items-center justify-between gap-2 bg-blue-600 hover:bg-blue-700 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition-colors shadow-sm group"
              >
                <span className="flex items-center gap-2">
                  <Navigation size={16} />
                  Rute Aman
                </span>
                <ChevronRight
                  size={15}
                  className="text-blue-200 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SignalChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}


