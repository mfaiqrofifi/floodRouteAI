import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Battery,
  Package,
  CloudRain,
  Phone,
  Shield,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  Battery,
  Package,
  CloudRain,
  Phone,
  Shield,
};

interface FloodTipCardProps {
  title: string;
  description: string;
  icon?: string;
  className?: string;
}

export default function FloodTipCard({
  title,
  description,
  icon = "Shield",
  className,
}: FloodTipCardProps) {
  const Icon = iconMap[icon] ?? Shield;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-card p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 mb-4">
        <Icon size={20} className="text-blue-600" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
