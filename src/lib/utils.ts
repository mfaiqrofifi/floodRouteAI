import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RiskLevel = "low" | "medium" | "high";

export function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "low":
      return {
        text: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
        badge: "bg-green-100 text-green-700 border-green-200",
        dot: "bg-green-500",
        icon: "text-green-600",
      };
    case "medium":
      return {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        icon: "text-amber-600",
      };
    case "high":
      return {
        text: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        badge: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-500",
        icon: "text-red-600",
      };
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Aman";
    case "medium":
      return "Waspada";
    case "high":
      return "Bahaya";
  }
}
