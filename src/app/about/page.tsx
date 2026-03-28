import Link from "next/link";
import {
  Shield,
  Brain,
  Map,
  Users,
  Database,
  Phone,
  ArrowRight,
  CheckCircle,
  Info,
} from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const howItWorksSteps = [
  {
    icon: Database,
    title: "Pengumpulan Data",
    description:
      "Data curah hujan, ketinggian sungai, laporan komunitas, dan kondisi drainase dikumpulkan secara berkala dari berbagai sumber resmi dan sensor lapangan.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Brain,
    title: "Analisis AI",
    description:
      "Model AI memproses data tersebut untuk menghitung skor risiko banjir per area, mengidentifikasi rute aman, dan menghasilkan penjelasan dalam bahasa yang mudah dipahami.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Map,
    title: "Visualisasi Peta",
    description:
      "Hasil analisis ditampilkan sebagai overlay berwarna di peta interaktif, memperlihatkan zona banjir, rute aman, dan titik evakuasi secara real-time.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Users,
    title: "Laporan Komunitas",
    description:
      "Warga dapat melaporkan kondisi banjir secara langsung. Laporan yang terverifikasi memperkuat akurasi data dan memperbarui peta lebih cepat dari sensor otomatis.",
    color: "bg-amber-100 text-amber-600",
  },
];

const aiCapabilities = [
  "Menghitung skor risiko banjir berdasarkan data multi-faktor",
  "Membandingkan rute berdasarkan tingkat bahaya banjir",
  "Menjawab pertanyaan keselamatan dalam bahasa Indonesia",
  "Menghasilkan rekomendasi tindakan yang kontekstual",
  "Mendeteksi pola risiko berdasarkan waktu dan musim",
  "Merangkum kondisi kompleks menjadi panduan yang mudah dipahami",
];

const dataDisclaimer = [
  "Data banjir diperbarui setiap jam, bukan secara real-time detik-per-detik.",
  "Skor risiko adalah estimasi berbasis model, bukan jaminan kondisi lapangan.",
  "FloodRoute AI tidak bertanggung jawab atas keputusan perjalanan yang diambil berdasarkan data ini.",
  "Untuk situasi darurat, selalu hubungi BPBD (119) sebagai sumber otoritas resmi.",
  "Data curah hujan bersumber dari BMKG; data sungai dari Balai Besar Wilayah Sungai.",
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Hero */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 mb-4">
          Tentang Kami
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          FloodRoute AI
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Alat bantu berbasis AI untuk membantu warga Jakarta dan sekitarnya
          memahami risiko banjir, menemukan rute aman, dan membuat keputusan
          perjalanan yang lebih cerdas.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 lg:p-12 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
                Misi Kami
              </p>
              <h2 className="text-2xl lg:text-3xl font-extrabold mb-4 leading-tight">
                Teknologi untuk Keselamatan Komunitas
              </h2>
              <p className="text-blue-100 leading-relaxed text-sm mb-4">
                FloodRoute AI membantu pengguna menilai risiko banjir dan
                bepergian lebih aman melalui informasi banjir yang sadar-rute
                dan penjelasan keselamatan yang dihasilkan AI.
              </p>
              <p className="text-blue-200 text-sm leading-relaxed">
                Aplikasi ini dirancang sebagai alat bantu kesiapsiagaan, bukan
                pengganti layanan darurat resmi. Selalu prioritaskan instruksi
                dari BPBD dan pemerintah daerah.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Informasi banjir yang mudah diakses semua kalangan",
                "AI yang menjelaskan risiko tanpa jargon teknis",
                "Komunitas yang saling menjaga keselamatan bersama",
                "Data terbuka dan transparan untuk kepercayaan publik",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-blue-500/30 rounded-xl p-3"
                >
                  <CheckCircle
                    size={16}
                    className="text-green-300 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-blue-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16" id="cara-kerja">
        <SectionHeading
          title="Bagaimana FloodRoute AI Bekerja"
          subtitle="Empat tahap yang mengubah data banjir mentah menjadi panduan keselamatan yang mudah dipahami."
          align="center"
        />
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {howItWorksSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl ${step.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-2xl font-extrabold text-slate-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="mb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100 mb-4">
              Kemampuan AI
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              Apa yang Dilakukan AI
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              AI FloodRoute menggunakan model bahasa besar yang dikombinasikan
              dengan data geospasial dan hidrologi untuk menghasilkan analisis
              risiko yang dapat ditindaklanjuti.
            </p>
            <ul className="space-y-2.5">
              {aiCapabilities.map((cap, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <CheckCircle
                    size={15}
                    className="text-purple-500 mt-0.5 shrink-0"
                  />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 space-y-4 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-500 text-xs ml-2">
                ai-risk-engine.ts
              </span>
            </div>
            <p className="text-slate-500 text-xs">{"// Input data"}</p>
            <p className="text-blue-300 text-xs">
              const <span className="text-green-300">riskInput</span> = {"{"}
            </p>
            <p className="text-slate-400 text-xs pl-4">
              rainfall: <span className="text-amber-300">102</span>,{" "}
              <span className="text-slate-500">{"// mm/hr"}</span>
            </p>
            <p className="text-slate-400 text-xs pl-4">
              activeFloodPoints: <span className="text-amber-300">3</span>,
            </p>
            <p className="text-slate-400 text-xs pl-4">
              drainageLoad: <span className="text-amber-300">0.92</span>,
            </p>
            <p className="text-blue-300 text-xs">{"}"}</p>
            <p className="text-slate-500 text-xs mt-2">{"// AI output"}</p>
            <p className="text-purple-300 text-xs">return {"{"}</p>
            <p className="text-slate-400 text-xs pl-4">
              riskScore: <span className="text-red-400">78</span>,
            </p>
            <p className="text-slate-400 text-xs pl-4">
              level: <span className="text-green-300">&apos;high&apos;</span>,
            </p>
            <p className="text-slate-400 text-xs pl-4">
              safeRoutes: [<span className="text-green-300">&apos;B&apos;</span>
              , <span className="text-green-300">&apos;C&apos;</span>],
            </p>
            <p className="text-purple-300 text-xs">{"}"}</p>
          </div>
        </div>
      </div>

      {/* Data disclaimer */}
      <div className="mb-16" id="data">
        <SectionHeading
          title="Transparansi Data"
          subtitle="Keterbatasan dan sumber data yang digunakan aplikasi ini."
        />
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <h3 className="font-bold text-amber-900">Penting untuk Dipahami</h3>
          </div>
          <ul className="space-y-3">
            {dataDisclaimer.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-amber-800"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {[
            { src: "BMKG", label: "Data Curah Hujan", icon: "🌧️" },
            {
              src: "BBWS Ciliwung-Cisadane",
              label: "Data Ketinggian Sungai",
              icon: "🌊",
            },
            {
              src: "Laporan Komunitas",
              label: "Kondisi Lapangan Real-Time",
              icon: "📍",
            },
          ].map((d) => (
            <div
              key={d.src}
              className="bg-white border border-slate-100 rounded-xl p-4"
            >
              <p className="text-2xl mb-2">{d.icon}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {d.label}
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">{d.src}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety disclaimer */}
      <div className="mb-16" id="disclaimer">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 shrink-0">
              <Shield size={22} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-2">
                Pernyataan Keselamatan Penting
              </h3>
              <p className="text-sm text-red-800 leading-relaxed mb-4">
                FloodRoute AI adalah alat bantu kesiapsiagaan bencana berbasis
                teknologi — bukan pengganti penilaian akal sehat, instruksi
                resmi, atau layanan darurat. Dalam situasi yang mengancam jiwa,
                selalu prioritaskan keselamatan Anda dan ikuti instruksi dari
                otoritas setempat.
              </p>
              <p className="text-sm text-red-700 font-medium">
                Jika Anda dalam bahaya, segera hubungi 119 (BPBD) atau 112
                (Darurat Nasional).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community reporting */}
      <div className="mb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100 mb-4">
              Pelaporan Komunitas
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              Kekuatan Laporan Warga
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Sensor dan citra satelit memiliki keterbatasan. Laporan langsung
              dari warga yang berada di lapangan memberikan informasi kondisi
              banjir paling akurat dan cepat.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Setiap laporan yang terverifikasi otomatis memperbarui skor risiko
              area dan membantu warga lain mengambil keputusan perjalanan yang
              lebih aman.
            </p>
            <Link
              href="/report-flood"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Buat Laporan Sekarang <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { stat: "±5 menit", label: "Waktu verifikasi laporan rata-rata" },
              {
                stat: "3x lebih akurat",
                label: "Akurasi peta dengan laporan komunitas",
              },
              { stat: "24/7", label: "Pembaruan data laporan aktif" },
            ].map((s) => (
              <div
                key={s.stat}
                className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4"
              >
                <p className="text-xl font-extrabold text-green-700 w-32 shrink-0">
                  {s.stat}
                </p>
                <p className="text-sm text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact / CTA */}
      <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 text-center text-white">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-700 mx-auto mb-5">
          <Phone size={22} className="text-white" />
        </div>
        <h2 className="text-2xl font-extrabold mb-3">
          Butuh Bantuan atau Ada Pertanyaan?
        </h2>
        <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
          FloodRoute AI adalah proyek open-source yang dikembangkan untuk
          mendukung kesiapsiagaan banjir komunitas. Kami menyambut masukan dan
          kontribusi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Tanya AI Asisten <ArrowRight size={14} />
          </Link>
          <Link
            href="/risk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-600 transition-colors"
          >
            Cek Risiko Area Saya
          </Link>
        </div>
        <p className="text-slate-500 text-xs mt-6">
          Dikembangkan dengan ❤️ untuk keselamatan komunitas Jakarta • Data
          non-komersial
        </p>
      </div>
    </div>
  );
}
