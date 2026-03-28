import { RiskLevel } from "./utils";

export interface AreaRisk {
  id: string;
  name: string;
  district: string;
  city: string;
  riskLevel: RiskLevel;
  riskScore: number;
  lastUpdated: string;
  description: string;
  factors: string[];
  coordinates: { lat: number; lng: number };
}

export interface FloodReport {
  id: string;
  location: string;
  district: string;
  waterLevel: "ankle" | "knee" | "waist" | "chest";
  waterLevelLabel: string;
  description: string;
  reportedAt: string;
  verified: boolean;
  reporterName: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  eta: string;
  distance: string;
  riskLevel: RiskLevel;
  floodPronePoints: number;
  description: string;
  recommended: boolean;
  roadNames: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  structured?: {
    summary?: string;
    reasons?: string[];
    action?: string;
  };
}

// ── Area Risk Data ─────────────────────────────────────────────────────────────

export const areaRisks: AreaRisk[] = [
  {
    id: "jak-barat",
    name: "Jakarta Barat",
    district: "Kali Deres",
    city: "Jakarta",
    riskLevel: "high",
    riskScore: 78,
    lastUpdated: "08 Mar 2026, 07:45 WIB",
    description:
      "Beberapa titik genangan aktif terdeteksi akibat hujan lebat sejak dini hari. Warga diimbau membatasi perjalanan.",
    factors: [
      "Curah hujan sangat tinggi (>100mm/jam)",
      "3 titik banjir aktif terdeteksi",
      "Laporan banjir lokal terkonfirmasi",
      "Jalan rendah dan drainase terbatas",
    ],
    coordinates: { lat: -6.1675, lng: 106.7635 },
  },
  {
    id: "jak-utara",
    name: "Jakarta Utara",
    district: "Pluit",
    city: "Jakarta",
    riskLevel: "high",
    riskScore: 81,
    lastUpdated: "08 Mar 2026, 07:30 WIB",
    description:
      "Kawasan Pluit dan sekitarnya mengalami banjir parah. Air mencapai ketinggian lutut di beberapa titik.",
    factors: [
      "Banjir rob dari laut",
      "Pompa air tidak optimal",
      "5 titik genangan aktif",
      "Akses jalan sebagian tertutup",
    ],
    coordinates: { lat: -6.1213, lng: 106.8095 },
  },
  {
    id: "jak-selatan",
    name: "Jakarta Selatan",
    district: "Kemang",
    city: "Jakarta",
    riskLevel: "medium",
    riskScore: 45,
    lastUpdated: "08 Mar 2026, 07:50 WIB",
    description:
      "Hujan deras perlu diwaspadai di area Kemang dan Cilandak. Potensi genangan di underpass dan jalan rendah.",
    factors: [
      "Curah hujan sedang hingga tinggi",
      "1 titik rawan banjir di dekat area",
      "Potensi genangan di persimpangan",
    ],
    coordinates: { lat: -6.2615, lng: 106.8106 },
  },
  {
    id: "jak-pusat",
    name: "Jakarta Pusat",
    district: "Sudirman",
    city: "Jakarta",
    riskLevel: "low",
    riskScore: 18,
    lastUpdated: "08 Mar 2026, 07:55 WIB",
    description:
      "Kondisi relatif aman. Drainase bekerja dengan baik. Perjalanan dapat dilakukan dengan normal.",
    factors: [
      "Curah hujan ringan",
      "Infrastruktur drainase baik",
      "Tidak ada laporan banjir terkini",
    ],
    coordinates: { lat: -6.2088, lng: 106.8456 },
  },
  {
    id: "jak-timur",
    name: "Jakarta Timur",
    district: "Kampung Melayu",
    city: "Jakarta",
    riskLevel: "high",
    riskScore: 72,
    lastUpdated: "08 Mar 2026, 07:15 WIB",
    description:
      "Sungai Ciliwung meluap menyebabkan banjir di Kampung Melayu dan area sekitarnya.",
    factors: [
      "Sungai Ciliwung meluap",
      "4 titik genangan aktif",
      "Laporan air setinggi lutut",
      "Beberapa akses jalan terganggu",
    ],
    coordinates: { lat: -6.2218, lng: 106.8651 },
  },
  {
    id: "manggarai",
    name: "Manggarai",
    district: "Tebet",
    city: "Jakarta Selatan",
    riskLevel: "medium",
    riskScore: 52,
    lastUpdated: "08 Mar 2026, 08:00 WIB",
    description:
      "Area Manggarai berstatus waspada. Potensi banjir kiriman dari hulu perlu diantisipasi.",
    factors: [
      "Air kiriman dari Bogor",
      "Pintu air Manggarai siaga 2",
      "Potensi meluap dalam 2-3 jam",
    ],
    coordinates: { lat: -6.2109, lng: 106.8502 },
  },
];

// ── Flood Reports ──────────────────────────────────────────────────────────────

export const floodReports: FloodReport[] = [
  {
    id: "rep-001",
    location: "Jl. Pluit Raya",
    district: "Pluit, Jakarta Utara",
    waterLevel: "knee",
    waterLevelLabel: "Setinggi lutut",
    description:
      "Air mulai masuk ke dalam rumah. Kendaraan roda dua tidak bisa melintas.",
    reportedAt: "08 Mar 2026, 06:45",
    verified: true,
    reporterName: "Warga Pluit",
  },
  {
    id: "rep-002",
    location: "Jl. Kampung Melayu Besar",
    district: "Kampung Melayu, Jakarta Timur",
    waterLevel: "knee",
    waterLevelLabel: "Setinggi lutut",
    description: "Jalan banjir, motor tidak bisa lewat. Warga mulai mengungsi.",
    reportedAt: "08 Mar 2026, 07:10",
    verified: true,
    reporterName: "Tim Relawan Timur",
  },
  {
    id: "rep-003",
    location: "Jl. Kali Deres",
    district: "Jakarta Barat",
    waterLevel: "ankle",
    waterLevelLabel: "Setinggi pergelangan kaki",
    description:
      "Genangan mulai terlihat sejak pukul 6 pagi. Masih bisa dilalui mobil.",
    reportedAt: "08 Mar 2026, 07:25",
    verified: false,
    reporterName: "Pengguna Anonim",
  },
  {
    id: "rep-004",
    location: "Pintu Air Manggarai",
    district: "Manggarai, Jakarta Selatan",
    waterLevel: "waist",
    waterLevelLabel: "Setinggi pinggang",
    description:
      "Pintu air Manggarai siaga 2. Banjir menggenangi pemukiman sekitar.",
    reportedAt: "08 Mar 2026, 07:55",
    verified: true,
    reporterName: "BPBD Jakarta",
  },
  {
    id: "rep-005",
    location: "Underpass Kemang",
    district: "Kemang, Jakarta Selatan",
    waterLevel: "ankle",
    waterLevelLabel: "Setinggi pergelangan kaki",
    description: "Genangan air di underpass. Kendaraan wajib hati-hati.",
    reportedAt: "08 Mar 2026, 08:05",
    verified: false,
    reporterName: "Pengguna Anonim",
  },
];

// ── Routes ─────────────────────────────────────────────────────────────────────

export const sampleRoutes: Route[] = [
  {
    id: "route-a",
    name: "Rute A — Via Tol Dalam Kota",
    origin: "Kemang, Jakarta Selatan",
    destination: "Sudirman, Jakarta Pusat",
    eta: "35 menit",
    distance: "12.4 km",
    riskLevel: "high",
    floodPronePoints: 2,
    description:
      "Rute tercepat namun melewati 2 titik rawan banjir aktif di sekitar Semanggi dan Grogol.",
    recommended: false,
    roadNames: [
      "Jl. Kemang Raya",
      "Tol Dalam Kota",
      "Exit Semanggi",
      "Jl. Sudirman",
    ],
  },
  {
    id: "route-b",
    name: "Rute B — Via Casablanca",
    origin: "Kemang, Jakarta Selatan",
    destination: "Sudirman, Jakarta Pusat",
    eta: "42 menit",
    distance: "14.1 km",
    riskLevel: "low",
    floodPronePoints: 0,
    description:
      "Rute lebih aman tanpa titik banjir aktif. Melewati jalan yang lebih tinggi dan drainase baik.",
    recommended: true,
    roadNames: [
      "Jl. Kemang Raya",
      "Jl. Casablanca",
      "Jl. HR Rasuna Said",
      "Jl. Sudirman",
    ],
  },
  {
    id: "route-c",
    name: "Rute C — Via Mampang",
    origin: "Kemang, Jakarta Selatan",
    destination: "Sudirman, Jakarta Pusat",
    eta: "38 menit",
    distance: "13.2 km",
    riskLevel: "medium",
    floodPronePoints: 1,
    description:
      "Rute alternatif dengan 1 titik waspada di area Mampang Prapatan. Dapat dilalui dengan hati-hati.",
    recommended: false,
    roadNames: [
      "Jl. Kemang Raya",
      "Jl. Mampang Prapatan",
      "Jl. Gatot Subroto",
      "Jl. Sudirman",
    ],
  },
];

// ── Chat Messages (sample AI conversation) ────────────────────────────────────

export const sampleChat: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Apakah aman untuk bepergian ke Sudirman sekarang?",
    timestamp: "08:12",
  },
  {
    id: "msg-2",
    role: "ai",
    content:
      "Berdasarkan data terkini, perjalanan ke area Sudirman relatif aman saat ini.",
    timestamp: "08:12",
    structured: {
      summary:
        "Jakarta Pusat (Sudirman) saat ini berstatus aman dengan skor risiko rendah (18/100).",
      reasons: [
        "Curah hujan ringan di area Sudirman",
        "Tidak ada laporan banjir aktif di sekitar area",
        "Infrastruktur drainase berfungsi dengan baik",
      ],
      action:
        "Anda dapat bepergian ke Sudirman. Gunakan Rute B via Casablanca untuk menghindari titik banjir di area lain.",
    },
  },
];

// ── Safety Tips ────────────────────────────────────────────────────────────────

export const safetyTips = [
  {
    id: 1,
    title: "Hindari Jalan Rendah",
    description:
      "Hindari melewati jalan yang tergenang atau berada di bawah permukaan normal saat hujan deras.",
    icon: "AlertTriangle",
  },
  {
    id: 2,
    title: "Siapkan Power Bank",
    description:
      "Pastikan ponsel terisi penuh dan bawa power bank untuk kondisi darurat.",
    icon: "Battery",
  },
  {
    id: 3,
    title: "Tas Tahan Air",
    description:
      "Gunakan tas kedap air atau lapisi tas dengan plastik untuk melindungi barang bawaan.",
    icon: "Package",
  },
  {
    id: 4,
    title: "Monitor Cuaca",
    description:
      "Cek prakiraan cuaca dan pembaruan rute sebelum berangkat, terutama pada pagi hari.",
    icon: "CloudRain",
  },
  {
    id: 5,
    title: "Kontak Darurat",
    description:
      "Simpan nomor darurat BPBD (119) dan pastikan keluarga mengetahui rencana perjalanan Anda.",
    icon: "Phone",
  },
  {
    id: 6,
    title: "Ikuti Arahan Petugas",
    description:
      "Selalu patuhi arahan petugas di lapangan dan jangan memaksakan diri melintas genangan tinggi.",
    icon: "Shield",
  },
];

// ── Quick action prompts for AI ────────────────────────────────────────────────

export const quickPrompts = [
  "Mengapa area saya berisiko?",
  "Apakah aman untuk bepergian sekarang?",
  "Apa yang harus saya siapkan sebelum berangkat?",
  "Mengapa rute ini direkomendasikan?",
  "Apa yang harus dilakukan jika jalan mulai tergenang?",
  "Bagaimana cara melaporkan banjir di area saya?",
];

// ── Stats for homepage ─────────────────────────────────────────────────────────

export const homepageStats = [
  { label: "Area Dipantau", value: "142", unit: "Titik" },
  { label: "Laporan Hari Ini", value: "38", unit: "Laporan" },
  { label: "Rute Aman Tersedia", value: "94", unit: "Rute" },
  { label: "Pengguna Aktif", value: "12.4K", unit: "Pengguna" },
];
