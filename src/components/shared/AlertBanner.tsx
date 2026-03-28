import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle, X } from "lucide-react";

type AlertVariant = "info" | "warning" | "success" | "danger";

interface AlertBannerProps {
  variant?: AlertVariant;
  title: string;
  message?: string;
  className?: string;
  onDismiss?: () => void;
}

const variants: Record<
  AlertVariant,
  {
    bg: string;
    border: string;
    icon: React.ElementType;
    iconColor: string;
    titleColor: string;
    textColor: string;
  }
> = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    titleColor: "text-amber-800",
    textColor: "text-amber-700",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
    titleColor: "text-green-800",
    textColor: "text-green-700",
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
    iconColor: "text-red-600",
    titleColor: "text-red-800",
    textColor: "text-red-700",
  },
};

export default function AlertBanner({
  variant = "info",
  title,
  message,
  className,
  onDismiss,
}: AlertBannerProps) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        v.bg,
        v.border,
        className,
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", v.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", v.titleColor)}>{title}</p>
        {message && (
          <p className={cn("mt-0.5 text-sm", v.textColor)}>{message}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity",
            v.iconColor,
          )}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
