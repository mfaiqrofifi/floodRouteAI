import { cn } from "@/lib/utils";

interface LegendItem {
  color: string;
  label: string;
  type?: "dot" | "line" | "marker";
}

const defaultLegendItems: LegendItem[] = [
  { color: "bg-green-500", label: "Aman" },
  { color: "bg-amber-500", label: "Waspada" },
  { color: "bg-red-500", label: "Rawan Banjir" },
  { color: "bg-blue-500", label: "Titik Evakuasi" },
];

interface MapLegendProps {
  items?: LegendItem[];
  className?: string;
}

export default function MapLegend({
  items = defaultLegendItems,
  className,
}: MapLegendProps) {
  return (
    <div
      className={cn(
        "bg-white/95 backdrop-blur-sm rounded-xl border border-slate-100 shadow-float p-4",
        className,
      )}
    >
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Legenda
      </h4>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className={cn("w-3 h-3 rounded-full shrink-0", item.color)} />
            <span className="text-xs text-slate-700">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">📍</span>
          <span className="text-xs text-slate-700">Laporan Banjir</span>
        </div>
      </div>
    </div>
  );
}
