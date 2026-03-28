"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircle,
  Info,
  MapPin,
  Send,
  Waves,
  Loader2,
  ArrowRight,
  Navigation,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import AlertBanner from "@/components/shared/AlertBanner";
import FloodReportCard from "@/components/shared/FloodReportCard";
import { isWithinJakartaArea } from "@/lib/geo/jakarta-area";
import type { FloodReportListResponse, FloodReportMapItem } from "@/types/report";

const ReportLocationPicker = dynamic(
  () => import("@/components/reports/ReportLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Memuat peta...
      </div>
    ),
  },
);

export default function ReportFloodPage() {
  const [latitude, setLatitude] = useState<number | null>(-6.2088);
  const [longitude, setLongitude] = useState<number | null>(106.8456);
  const [waterDepthCm, setWaterDepthCm] = useState(20);
  const [roadPassable, setRoadPassable] = useState(true);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<FloodReportMapItem | null>(
    null,
  );
  const [recentReports, setRecentReports] = useState<FloodReportMapItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const loadRecentReports = async () => {
    setLoadingReports(true);
    setReportsError(null);

    try {
      const res = await fetch("/api/flood-reports?limit=6", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat laporan (HTTP ${res.status}).`);
      }

      const data: FloodReportListResponse = await res.json();
      setRecentReports(data.reports);
    } catch (error) {
      setReportsError(
        error instanceof Error
          ? error.message
          : "Gagal memuat laporan terbaru.",
      );
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    void loadRecentReports();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (latitude === null || longitude === null) {
      setSubmitError("Pilih titik lokasi di peta terlebih dahulu.");
      return;
    }

    if (!isWithinJakartaArea(latitude, longitude)) {
      setSubmitError("Saat ini pelaporan hanya tersedia untuk wilayah DKI Jakarta.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/flood-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
          waterDepthCm,
          roadPassable,
          description,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error ?? "Gagal menyimpan laporan.");
      }

      setSubmittedReport(payload.report as FloodReportMapItem);
      setDescription("");
      setRoadPassable(true);
      setWaterDepthCm(20);
      await loadRecentReports();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Gagal menyimpan laporan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6">
        <SectionHeading
          title="Laporkan Banjir"
          subtitle="Kirim laporan singkat dari lokasi aman. Laporan langsung masuk ke sistem dan muncul di peta."
          badge="Laporan Komunitas"
        />
      </div>

      <div className="mb-8">
        <AlertBanner
          variant="warning"
          title="Laporkan Hanya dari Tempat yang Aman"
          message="Jangan membuat laporan sambil mengemudi atau berada dalam kondisi berbahaya. Keselamatan Anda tetap prioritas utama."
        />
      </div>

      {submittedReport && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-800">
                Laporan berhasil dikirim
              </p>
              <p className="text-sm text-green-700 mt-1">
                {submittedReport.locationTitle} tercatat dengan status{" "}
                <strong>{submittedReport.statusLabel}</strong> ({submittedReport.score}
                /100) dan sudah masuk ke peta.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/flood-map"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-900"
                >
                  Lihat di Peta <ArrowRight size={14} />
                </Link>
                <Link
                  href="/risk"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-900"
                >
                  Cek Status Area <Navigation size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                Pilih Lokasi Laporan
              </h2>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Cakupan Area Pelaporan
                </p>
                <p className="mt-1 text-sm text-blue-900 leading-relaxed">
                  Pelaporan saat ini hanya menerima titik di wilayah DKI Jakarta.
                  Garis batas biru pada peta menunjukkan area aktif yang bisa dipilih.
                </p>
              </div>

              <ReportLocationPicker
                latitude={latitude}
                longitude={longitude}
                onSelect={({ latitude: nextLat, longitude: nextLng }) => {
                  setLatitude(nextLat);
                  setLongitude(nextLng);
                }}
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude ?? ""}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude ?? ""}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500">
                  Titik laporan saat ini dibatasi untuk wilayah DKI Jakarta dan
                  area akan dideteksi otomatis di backend berdasarkan koordinat.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Waves size={16} className="text-blue-500" />
                Kondisi Lapangan
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kedalaman air (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={waterDepthCm}
                  onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kondisi jalan
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRoadPassable(true)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      roadPassable
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Masih bisa dilalui
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadPassable(false)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      !roadPassable
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Tidak bisa dilalui
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Deskripsi singkat
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Genangan menutup dua lajur dan motor mulai putar balik."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {description.length}/500 karakter
                </p>
              </div>
            </div>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan laporan...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Kirim Laporan Banjir
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">
              Cara Kerja MVP
            </h3>
            <ul className="space-y-3">
              {[
                "Klik titik lokasi di peta atau isi koordinat secara manual.",
                "Backend otomatis menentukan area Jakarta laporan Anda.",
                "Sistem menghitung skor bahaya sederhana dari kedalaman air dan akses jalan.",
                "Laporan langsung tersimpan ke Neon dan muncul di peta tanpa verifikasi admin.",
              ].map((tip, index) => (
                <li
                  key={tip}
                  className="flex items-start gap-2.5 text-xs text-slate-600"
                >
                  <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0 text-[10px]">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 text-center">
            <p className="text-3xl font-extrabold text-blue-700 mb-1">
              {recentReports.length}
            </p>
            <p className="text-xs text-slate-500">laporan terbaru termuat</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Data ini langsung berasal dari Neon PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <SectionHeading
          title="Laporan Terkini Komunitas"
          subtitle="Urutan terbaru lebih dulu, langsung dari Neon tanpa kartu mock."
          badge="Live"
        />

        {loadingReports ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 rounded-xl border border-slate-100 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        ) : reportsError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {reportsError}
          </div>
        ) : recentReports.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Belum ada laporan banjir tersimpan. Coba kirim laporan pertama dari
            peta di atas.
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentReports.map((report) => (
              <FloodReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
