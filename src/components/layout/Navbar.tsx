"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Droplets,
  Menu,
  X,
  Home,
  MapPin,
  Map,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Primary nav — the four pages that support the core user journey
const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/risk", label: "Cek Risiko", icon: MapPin },
  { href: "/flood-map", label: "Peta Banjir", icon: Map },
  { href: "/safe-route", label: "Rute Aman", icon: Navigation },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-slate-900 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <Droplets className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="text-base font-bold tracking-tight">
                FloodRoute <span className="text-blue-600">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(({ href, label }) => {
                const active =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA + Mobile Hamburger */}
            <div className="flex items-center gap-3">
              <Link
                href="/risk"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-150 shadow-sm"
              >
                <MapPin size={14} />
                Cek Risiko
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 z-50 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 font-bold text-slate-900"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="text-base font-bold">
              FloodRoute <span className="text-blue-600">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon
                  size={18}
                  className={active ? "text-blue-600" : "text-slate-400"}
                />
                <span className="flex-1">{label}</span>
                <ChevronRight
                  size={15}
                  className={active ? "text-blue-400" : "text-slate-300"}
                />
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Link
            href="/risk"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MapPin size={15} />
            Cek Risiko Banjir Sekarang
          </Link>
        </div>
      </aside>
    </>
  );
}
