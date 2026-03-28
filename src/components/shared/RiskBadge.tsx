import { cn, getRiskColor, getRiskLabel, type RiskLevel } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export default function RiskBadge({
  level,
  size = "md",
  showDot = true,
  className,
}: RiskBadgeProps) {
  const colors = getRiskColor(level);
  const label = getRiskLabel(level);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        colors.badge,
        sizeClasses[size],
        className,
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
      )}
      {label}
    </span>
  );
}
