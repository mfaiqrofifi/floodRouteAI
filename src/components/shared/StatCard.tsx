import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 shadow-card p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {unit && (
              <span className="text-xs text-slate-400 font-medium">{unit}</span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50">
            <Icon size={18} className="text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
