import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FloodRoute AI — Cek Risiko Banjir & Temukan Rute Aman",
    template: "%s | FloodRoute AI",
  },
  description:
    "Cek risiko banjir di area Anda, lihat zona rawan di peta, dan temukan rute perjalanan yang lebih aman dengan panduan AI.",
  keywords: [
    "banjir",
    "Jakarta",
    "rute aman",
    "risiko banjir",
    "peringatan banjir",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-slate-50`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
