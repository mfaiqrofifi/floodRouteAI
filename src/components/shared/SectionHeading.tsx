import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  badge?: string;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  align = "left",
  badge,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center", className)}>
      {badge && (
        <span className="inline-block mb-3 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-2 text-slate-500 text-base leading-relaxed",
            align === "center" ? "max-w-2xl mx-auto" : "max-w-xl",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
