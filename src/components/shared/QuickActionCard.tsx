import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color?: "blue" | "green" | "amber" | "red" | "indigo";
  className?: string;
}

const colorMap = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    hover: "hover:border-blue-200 hover:bg-blue-50/30",
    arrowBg: "group-hover:bg-blue-600 group-hover:text-white",
  },
  green: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    hover: "hover:border-green-200 hover:bg-green-50/30",
    arrowBg: "group-hover:bg-green-600 group-hover:text-white",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    hover: "hover:border-amber-200 hover:bg-amber-50/30",
    arrowBg: "group-hover:bg-amber-600 group-hover:text-white",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    hover: "hover:border-red-200 hover:bg-red-50/30",
    arrowBg: "group-hover:bg-red-600 group-hover:text-white",
  },
  indigo: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    hover: "hover:border-indigo-200 hover:bg-indigo-50/30",
    arrowBg: "group-hover:bg-indigo-600 group-hover:text-white",
  },
};

export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color = "blue",
  className,
}: QuickActionCardProps) {
  const c = colorMap[color];

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-4 bg-white rounded-2xl border border-slate-100 shadow-card p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        c.hover,
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl shrink-0",
          c.iconBg,
        )}
      >
        <Icon size={22} className={c.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 text-base mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-snug">{description}</p>
      </div>
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 transition-all duration-200 shrink-0 mt-0.5",
          c.arrowBg,
        )}
      >
        <ArrowRight size={15} />
      </div>
    </Link>
  );
}
