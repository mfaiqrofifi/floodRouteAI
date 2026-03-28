import Link from "next/link";
import {
  Droplets,
  Mail,
  Twitter,
  Instagram,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const footerLinks = {
  fitur: [
    { href: "/risk", label: "Cek Risiko Banjir" },
    { href: "/flood-map", label: "Peta Banjir" },
    { href: "/safe-route", label: "Rute Aman" },
    { href: "/ai-assistant", label: "AI Asisten" },
    { href: "/report-flood", label: "Laporkan Banjir" },
  ],
  info: [
    { href: "/about", label: "Tentang Kami" },
    { href: "/about#how-it-works", label: "Cara Kerja" },
    { href: "/about#data", label: "Sumber Data" },
    { href: "/about#disclaimer", label: "Disclaimer" },
  ],
  darurat: [
    { href: "tel:119", label: "BPBD: 119" },
    { href: "tel:112", label: "Darurat: 112" },
    {
      href: "https://bpbd.jakarta.go.id",
      label: "BPBD Jakarta",
      external: true,
    },
    { href: "https://bmkg.go.id", label: "BMKG", external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> FloodRoute AI adalah alat bantu
              kesiapsiagaan, bukan pengganti informasi resmi BPBD atau layanan
              darurat. Selalu ikuti arahan otoritas setempat dalam kondisi
              darurat.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
                <Droplets size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">
                FloodRoute <span className="text-blue-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              Cek risiko banjir dan temukan rute lebih aman sebelum bepergian.
              Didukung AI untuk panduan keselamatan yang mudah dipahami.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:hello@floodrouteai.id"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Fitur */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Fitur</h4>
            <ul className="space-y-2.5">
              {footerLinks.fitur.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Informasi</h4>
            <ul className="space-y-2.5">
              {footerLinks.info.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak Darurat */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              Kontak Darurat
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.darurat.map(({ href, label, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                    {external && <ExternalLink size={11} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © 2026 FloodRoute AI. Dibuat untuk keselamatan masyarakat Indonesia.
          </p>
          <p className="text-xs text-slate-600">
            Data diperbarui setiap 15 menit dari sumber publik.
          </p>
        </div>
      </div>
    </footer>
  );
}
