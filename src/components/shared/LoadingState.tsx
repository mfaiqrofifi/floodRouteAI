import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = "Memuat data...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-5 animate-pulse",
        className,
      )}
    >
      <div className="h-3 bg-slate-200 rounded-full w-1/3 mb-3" />
      <div className="h-5 bg-slate-200 rounded-full w-2/3 mb-2" />
      <div className="h-3 bg-slate-100 rounded-full w-full mb-1.5" />
      <div className="h-3 bg-slate-100 rounded-full w-5/6" />
    </div>
  );
}
