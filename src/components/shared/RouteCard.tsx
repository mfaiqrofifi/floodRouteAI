import { cn, type RiskLevel } from "@/lib/utils";
import {
  Clock,
  Route,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import RiskBadge from "./RiskBadge";

interface RouteCardProps {
  id: string;
  name: string;
  eta: string;
  distance: string;
  riskLevel: RiskLevel;
  floodPronePoints: number;
  description: string;
  recommended?: boolean;
  roadNames?: string[];
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export default function RouteCard({
  id,
  name,
  eta,
  distance,
  riskLevel,
  floodPronePoints,
  description,
  recommended = false,
  roadNames = [],
  selected = false,
  onSelect,
  className,
}: RouteCardProps) {
  return (
    <div
      onClick={() => onSelect?.(id)}
      className={cn(
        "relative bg-white rounded-2xl border-2 shadow-card transition-all duration-200 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 p-5",
        selected ? "border-blue-500 shadow-blue-100" : "border-slate-100",
        onSelect && "cursor-pointer",
        className,
      )}
    >
      {recommended && (
        <div className="absolute -top-3 left-5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
            <CheckCircle2 size={11} />
            Direkomendasikan
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mt-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 mb-1">{name}</p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <RiskBadge level={riskLevel} size="sm" />
            {floodPronePoints > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangle size={10} />
                {floodPronePoints} titik rawan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                <Shield size={10} />
                Bebas titik rawan
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-slate-700">
          <Clock size={14} className="text-slate-400" />
          <span className="text-sm font-semibold">{eta}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Route size={14} className="text-slate-400" />
          <span className="text-sm">{distance}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-3">
        {description}
      </p>

      {roadNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {roadNames.map((road) => (
            <span
              key={road}
              className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5"
            >
              {road}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
