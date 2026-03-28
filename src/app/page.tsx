import Link from "next/link";
import {
  MapPin,
  Navigation,
  Map,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  CloudRain,
  Search,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import QuickActionCard from "@/components/shared/QuickActionCard";
import RiskBadge from "@/components/shared/RiskBadge";
import StatCard from "@/components/shared/StatCard";
import { getCachedJakartaAreaStatus } from "@/lib/jakarta-area-status";
import { getFloodReportMetrics } from "@/lib/reports/repository";

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function HomePage() {
  const areaStatus = await getCachedJakartaAreaStatus();
  const reportMetrics = await getFloodReportMetrics();
  const sortedAreas = [...areaStatus.items].sort((a, b) => b.score - a.score);
  const topRiskAreas = sortedAreas.slice(0, 4);
  const highRiskAreas = sortedAreas.filter((area) => area.status === "high");
  const latestUpdatedAt =
    sortedAreas
      .map((area) => area.updatedAt)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ??
    areaStatus.timestamp;

  return (
    <div>
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2.5 text-white text-sm">
            <AlertTriangle size={15} className="shrink-0" />
            <p className="font-medium">
              <strong>Peringatan Aktif:</strong>{" "}
              {highRiskAreas.length > 0
                ? `${highRiskAreas.map((area) => area.area).join(" dan ")} berada pada status risiko tinggi. Batasi perjalanan yang tidak perlu.`
                : "Tidak ada area Jakarta dengan status risiko tinggi saat ini. Tetap pantau pembaruan cuaca sebelum bepergian."}
            </p>
            <Link
              href="/risk"
              className="ml-auto shrink-0 text-xs underline hover:no-underline whitespace-nowrap"
            >
              Lihat Detail →
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-50 via-white to-sky-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 mb-6">
                <Activity size={13} />
                Diperbarui {formatUpdatedAt(latestUpdatedAt)}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
                Tetap Selangkah <span className="text-blue-600">Lebih Aman</span>
                <br />
                dari Banjir
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Cek area rawan banjir, lihat rute yang lebih aman, dan dapatkan
                panduan keselamatan berbasis AI sebelum bepergian.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/risk"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Search size={16} />
                  Cek Risiko Sekarang
                </Link>
                <Link
                  href="/safe-route"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Navigation size={16} />
                  Temukan Rute Aman
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-float p-5 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status Terkini - Jakarta
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Backend Live
                  </span>
                </div>
                {topRiskAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {area.area}
                        </p>
                        <p className="text-xs text-slate-500">{area.district}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        {area.score}
                      </span>
                      <RiskBadge level={area.status} size="sm" />
                    </div>
                  </div>
                ))}
                <Link
                  href="/flood-map"
                  className="flex items-center justify-center gap-2 w-full py-2.5 mt-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  <Map size={14} />
                  Lihat Peta Lengkap
                  <ArrowRight size={13} />
                </Link>
              </div>
              <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {highRiskAreas.length} Area Bahaya
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Area Dipantau",
                value: String(areaStatus.items.length),
                unit: "Wilayah",
                icon: MapPin,
              },
              {
                label: "Area Bahaya",
                value: String(highRiskAreas.length),
                unit: "Wilayah",
                icon: AlertTriangle,
              },
              {
                label: "Laporan Hari Ini",
                value: String(reportMetrics.reportsToday),
                unit: "Laporan",
                icon: Navigation,
              },
              {
                label: "Total Laporan",
                value: String(reportMetrics.totalReports),
                unit: "Laporan",
                icon: AlertTriangle,
              },
            ].map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                icon={stat.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Apa yang ingin Anda lakukan?"
            subtitle="Akses fitur utama dengan cepat untuk perjalanan yang lebih aman."
            badge="Fitur Utama"
          />
          <div className="grid sm:grid-cols-3 gap-4">
            <QuickActionCard
              icon={MapPin}
              title="Cek Risiko Banjir"
              description="Cek kondisi banjir terkini di area atau kecamatan tertentu."
              href="/risk"
              color="blue"
            />
            <QuickActionCard
              icon={Map}
              title="Lihat Peta Banjir"
              description="Visualisasi zona rawan banjir, rute aman, dan titik evakuasi."
              href="/flood-map"
              color="indigo"
            />
            <QuickActionCard
              icon={Navigation}
              title="Temukan Rute Aman"
              description="Bandingkan rute dan hindari jalan rawan banjir sebelum berangkat."
              href="/safe-route"
              color="green"
            />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <SectionHeading
              title="Status Risiko Hari Ini"
              subtitle="Pembaruan backend terkini untuk lima wilayah Jakarta."
              className="mb-0"
            />
            <Link
              href="/flood-map"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Lihat semua <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedAreas.map((area) => (
              <Link
                key={area.id}
                href="/risk"
                className="group bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-base">
                      {area.area}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {area.district}
                    </p>
                  </div>
                  <RiskBadge level={area.status} />
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Skor Risiko</span>
                    <span className="text-xs font-bold text-slate-700">
                      {area.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        area.status === "high"
                          ? "bg-red-500"
                          : area.status === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {area.summary}
                </p>
                <div className="mt-3 space-y-1.5">
                  {area.topFactors.slice(0, 2).map((factor) => (
                    <div
                      key={factor}
                      className="flex items-start gap-2 text-xs text-slate-500"
                    >
                      <AlertTriangle
                        size={11}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {formatUpdatedAt(area.updatedAt)}
                  </span>
                  <span className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1">
                    Detail <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Cara Kerja FloodRoute AI"
            subtitle="Tiga langkah mudah untuk perjalanan yang lebih aman saat musim hujan."
            align="center"
            badge="Cara Kerja"
          />
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Search,
                title: "Pilih Area atau Rute",
                description:
                  "Masukkan nama area atau titik keberangkatan dan tujuan perjalanan Anda.",
              },
              {
                step: "02",
                icon: Map,
                title: "Analisis Data Banjir",
                description:
                  "Sistem memproses data cuaca, laporan banjir, dan kondisi jalan secara real-time.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Terima Panduan Aman",
                description:
                  "Dapatkan rekomendasi rute aman dan panduan AI yang mudah dipahami.",
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-float">
                    <Icon size={26} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm">
                <CloudRain size={28} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Siap pergi dengan lebih aman?
            </h2>
            <p className="text-blue-100 text-base mb-8 leading-relaxed">
              Cek kondisi banjir sekarang sebelum Anda berangkat. Gratis, mudah,
              dan selalu diperbarui.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/risk"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                <Search size={16} />
                Cek Risiko Banjir
              </Link>
              <Link
                href="/safe-route"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/40 text-white font-semibold rounded-xl border border-white/20 hover:bg-blue-500/60 transition-colors"
              >
                <Navigation size={16} />
                Temukan Rute Aman
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
