import { cn } from "@/lib/utils";
import { MapPin, Clock, Waves, CarFront, ArrowUpRight } from "lucide-react";
import type { FloodReportMapItem } from "@/types/report";

const statusColors: Record<string, string> = {
  Aman: "text-green-700 bg-green-50 border-green-200",
  Waspada: "text-amber-700 bg-amber-50 border-amber-200",
  Bahaya: "text-red-700 bg-red-50 border-red-200",
};

interface FloodReportCardProps {
  report: FloodReportMapItem;
  compact?: boolean;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FloodReportCard({
  report,
  compact = false,
  className,
  active = false,
  onClick,
}: FloodReportCardProps) {
  const statusColor = statusColors[report.statusLabel] ?? statusColors.Waspada;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn("w-full text-left", onClick ? "cursor-pointer" : "cursor-default")}
    >
      <div
        className={cn(
          "bg-white rounded-xl border border-slate-100 shadow-card p-4 transition-all duration-200",
          onClick && "hover:shadow-card-hover hover:-translate-y-0.5",
          active && "border-blue-200 bg-blue-50/60 shadow-card-hover",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-900 truncate">
                {report.locationTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{report.area}</p>

            {!compact && (
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                {report.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full border",
                  statusColor,
                )}
              >
                {report.statusLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Waves size={11} />
                {report.waterDepthLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <CarFront size={11} />
                {report.roadPassable ? "Bisa dilalui" : "Tidak bisa dilalui"}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {new Date(report.reportedAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {onClick && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                <span>Lihat di Peta</span>
                <ArrowUpRight size={12} />
              </div>
            )}
          </div>

          <div className="shrink-0">
            <div className="text-xs font-semibold text-slate-600">
              {report.score}/100
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
