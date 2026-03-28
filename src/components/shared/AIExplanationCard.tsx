import { cn } from "@/lib/utils";
import { Bot, Sparkles, FileText } from "lucide-react";

interface AIExplanationCardProps {
  explanation: string;
  summary?: string;
  reasons?: string[];
  action?: string;
  className?: string;
  title?: string;
  /**
   * Controls the source badge shown below the title.
   * "ai"       → "Didukung AI"      (Gemini or any real AI)
   * "fallback" → "Ringkasan Otomatis" (local template, no AI involved)
   * Defaults to "ai" for backward compatibility.
   */
  aiSource?: "ai" | "fallback";
}

export default function AIExplanationCard({
  explanation,
  summary,
  reasons,
  action,
  className,
  title = "Analisis AI",
  aiSource = "ai",
}: AIExplanationCardProps) {
  const isAi = aiSource === "ai";

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg",
            isAi ? "bg-blue-600" : "bg-slate-500",
          )}
        >
          {isAi ? (
            <Bot size={16} className="text-white" />
          ) : (
            <FileText size={16} className="text-white" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            {isAi ? (
              <>
                <Sparkles size={11} className="text-blue-500" />
                <span className="text-xs text-blue-600">Didukung AI</span>
              </>
            ) : (
              <>
                <FileText size={11} className="text-slate-400" />
                <span className="text-xs text-slate-500">
                  Ringkasan Otomatis
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {summary ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {summary}
          </p>

          {reasons && reasons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Alasan Utama
              </p>
              <ul className="space-y-1.5">
                {reasons.map((reason, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {action && (
            <div className="bg-white/70 rounded-xl p-3.5 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                Tindakan yang Disarankan
              </p>
              <p className="text-sm text-slate-800 leading-relaxed">{action}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
      )}
    </div>
  );
}
