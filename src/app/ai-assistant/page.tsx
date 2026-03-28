import Link from "next/link";
import { Navigation, Map, ShieldCheck, ArrowRight, Cpu } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const coreFeatures = [
  {
    href: "/risk",
    icon: ShieldCheck,
    title: "Cek Risiko Banjir",
    description: "Masukkan lokasimu dan dapatkan skor risiko banjir secara instan berbasis data multi-faktor.",
    cta: "Cek Sekarang",
    color: "bg-blue-600 hover:bg-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    href: "/flood-map",
    icon: Map,
    title: "Peta Zona Banjir",
    description: "Lihat zona rawan banjir, laporan komunitas, dan titik evakuasi di peta real-time.",
    cta: "Buka Peta",
    color: "bg-slate-800 hover:bg-slate-900",
    iconBg: "bg-slate-100 text-slate-600",
  },
  {
    href: "/safe-route",
    icon: Navigation,
    title: "Rekomendasi Rute Aman",
    description: "Mesin AI kami membandingkan rute perjalananmu dan merekomendasikan jalur paling aman dari banjir.",
    cta: "Cari Rute",
    color: "bg-green-600 hover:bg-green-700",
    iconBg: "bg-green-100 text-green-600",
  },
];

export default function AIAssistantPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold mb-4">
          <Cpu size={13} />
          AI Terintegrasi
        </div>
        <SectionHeading
          title="Kecerdasan Ada di Setiap Fitur"
          subtitle="FloodRoute AI tidak menggunakan chatbot. Kecerdasan kami tertanam langsung di mesin rekomendasi rute dan analisis risiko — lebih akurat, lebih cepat, lebih actionable."
          className="mb-0"
        />
      </div>

      <div className="space-y-4 mb-10">
        {coreFeatures.map(({ href, icon: Icon, title, description, cta, color, iconBg }) => (
          <div key={href} className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${iconBg}`}>
              <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm mb-0.5">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
            <Link
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 ${color}`}
            >
              {cta}
              <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>

      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
        <p className="text-sm text-slate-600">
          Butuh bantuan langsung? Hubungi{" "}
          <a href="tel:119" className="font-semibold text-blue-600 hover:underline">
            119 ext 8
          </a>{" "}
          (BPBD Jakarta) atau kunjungi{" "}
          <a
            href="https://bpbd.jakarta.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:underline"
          >
            bpbd.jakarta.go.id
          </a>
          .
        </p>
      </div>
    </div>
  );
}
