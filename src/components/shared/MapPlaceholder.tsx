"use client";

import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Locate, Layers } from "lucide-react";
import { useState } from "react";

interface MapPlaceholderProps {
  className?: string;
  height?: string;
  showControls?: boolean;
  showOverlay?: boolean;
  showRoute?: boolean;
  activeFilters?: Record<string, boolean>;
}

export default function MapPlaceholder({
  className,
  height = "h-[400px]",
  showControls = true,
  showRoute = false,
  activeFilters,
}: MapPlaceholderProps) {
  const [_zoom, setZoom] = useState(1);
  const showZones = activeFilters ? activeFilters["zones"] !== false : true;
  const showEvac = activeFilters ? !!activeFilters["evacuation"] : false;
  const showRouteLayer =
    showRoute || (activeFilters ? !!activeFilters["routes"] : false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-700",
        height,
        className,
      )}
    >
      {/* ── SVG map canvas ──────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="800" height="600" fill="#1e2a38" />

        <defs>
          <pattern
            id="mapgrid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M50 0L0 0 0 50"
              fill="none"
              stroke="#263447"
              strokeWidth="0.8"
            />
          </pattern>
          <filter id="blur-flood" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="route-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="600" fill="url(#mapgrid)" />

        {/* ── Water bodies ─────────────────────────────────────────────── */}
        <path
          d="M0 0 L800 0 L800 60 Q600 80 400 55 Q200 30 0 70 Z"
          fill="#172a45"
          opacity="0.9"
        />
        <path
          d="M0 0 L800 0 L800 60 Q600 80 400 55 Q200 30 0 70 Z"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Ciliwung */}
        <path
          d="M520 0 Q510 80 480 140 Q450 200 430 260 Q410 320 420 380 Q430 440 410 500 Q390 560 370 600"
          fill="none"
          stroke="#1e4980"
          strokeWidth="7"
          opacity="0.85"
        />
        <path
          d="M520 0 Q510 80 480 140 Q450 200 430 260 Q410 320 420 380 Q430 440 410 500 Q390 560 370 600"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          opacity="0.22"
        />
        {/* Angke */}
        <path
          d="M80 0 Q90 120 70 220 Q55 300 75 400 Q85 460 60 600"
          fill="none"
          stroke="#1e4980"
          strokeWidth="5"
          opacity="0.7"
        />
        {/* Bekasi canal */}
        <path
          d="M700 0 Q710 100 690 200 Q680 280 700 380 Q710 450 690 600"
          fill="none"
          stroke="#1e4980"
          strokeWidth="4"
          opacity="0.6"
        />

        {/* ── Road network ─────────────────────────────────────────────── */}
        <ellipse
          cx="400"
          cy="310"
          rx="250"
          ry="180"
          fill="none"
          stroke="#2d3f55"
          strokeWidth="8"
          opacity="0.9"
        />
        <ellipse
          cx="400"
          cy="310"
          rx="250"
          ry="180"
          fill="none"
          stroke="#3d5068"
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M0 240 Q150 220 300 230 Q420 238 600 218 Q700 210 800 215"
          fill="none"
          stroke="#3d5068"
          strokeWidth="6"
        />
        <path
          d="M0 240 Q150 220 300 230 Q420 238 600 218 Q700 210 800 215"
          fill="none"
          stroke="#4d6480"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="200"
          y1="0"
          x2="180"
          y2="600"
          stroke="#2d3f55"
          strokeWidth="5"
        />
        <line
          x1="400"
          y1="0"
          x2="400"
          y2="600"
          stroke="#2d3f55"
          strokeWidth="5"
        />
        <line
          x1="600"
          y1="0"
          x2="610"
          y2="600"
          stroke="#2d3f55"
          strokeWidth="5"
        />
        <line
          x1="0"
          y1="150"
          x2="800"
          y2="155"
          stroke="#2d3f55"
          strokeWidth="3"
        />
        <line
          x1="0"
          y1="310"
          x2="800"
          y2="310"
          stroke="#2d3f55"
          strokeWidth="3"
        />
        <line
          x1="0"
          y1="460"
          x2="800"
          y2="455"
          stroke="#2d3f55"
          strokeWidth="3"
        />
        <line
          x1="0"
          y1="380"
          x2="800"
          y2="140"
          stroke="#263447"
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="100"
          x2="800"
          y2="380"
          stroke="#263447"
          strokeWidth="2"
        />
        <line
          x1="100"
          y1="0"
          x2="500"
          y2="600"
          stroke="#263447"
          strokeWidth="2"
        />
        {[80, 160, 240, 320, 480, 560, 640, 720].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="600"
            stroke="#243040"
            strokeWidth="1"
          />
        ))}
        {[100, 200, 350, 420, 520].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="800"
            y2={y}
            stroke="#243040"
            strokeWidth="1"
          />
        ))}
        <text
          x="305"
          y="226"
          fill="#4d6480"
          fontSize="9"
          fontFamily="monospace"
        >
          TOL DALAM KOTA
        </text>
        <text
          x="182"
          y="295"
          fill="#4d6480"
          fontSize="8"
          fontFamily="monospace"
          transform="rotate(-90 182 310)"
        >
          JL. ANGKE
        </text>
        <text
          x="408"
          y="295"
          fill="#4d6480"
          fontSize="8"
          fontFamily="monospace"
          transform="rotate(90 408 310)"
        >
          CILIWUNG
        </text>

        {/* ── Flood zone overlays ───────────────────────────────────────── */}
        {showZones && (
          <g>
            {/* Pluit — HIGH */}
            <path
              d="M55 75 Q110 65 165 80 Q200 90 195 130 Q190 165 150 170 Q100 175 65 155 Q35 138 40 110 Z"
              fill="#ef4444"
              opacity="0.18"
              filter="url(#blur-flood)"
            />
            <path
              d="M55 75 Q110 65 165 80 Q200 90 195 130 Q190 165 150 170 Q100 175 65 155 Q35 138 40 110 Z"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray="4 3"
            />
            {/* Kali Deres — HIGH */}
            <path
              d="M30 200 Q85 185 130 195 Q165 205 168 245 Q170 280 140 295 Q95 310 55 295 Q20 280 18 250 Z"
              fill="#ef4444"
              opacity="0.18"
              filter="url(#blur-flood)"
            />
            <path
              d="M30 200 Q85 185 130 195 Q165 205 168 245 Q170 280 140 295 Q95 310 55 295 Q20 280 18 250 Z"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray="4 3"
            />
            {/* Kampung Melayu — HIGH */}
            <path
              d="M590 220 Q640 210 690 225 Q730 238 725 275 Q720 310 680 318 Q635 325 600 308 Q568 292 570 260 Z"
              fill="#ef4444"
              opacity="0.18"
              filter="url(#blur-flood)"
            />
            <path
              d="M590 220 Q640 210 690 225 Q730 238 725 275 Q720 310 680 318 Q635 325 600 308 Q568 292 570 260 Z"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray="4 3"
            />
            {/* Manggarai — MEDIUM */}
            <path
              d="M360 310 Q410 300 445 318 Q475 335 468 365 Q460 390 425 398 Q385 405 360 385 Q340 368 345 342 Z"
              fill="#f59e0b"
              opacity="0.18"
              filter="url(#blur-flood)"
            />
            <path
              d="M360 310 Q410 300 445 318 Q475 335 468 365 Q460 390 425 398 Q385 405 360 385 Q340 368 345 342 Z"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray="4 3"
            />
            {/* Kemang — MEDIUM */}
            <path
              d="M310 420 Q360 408 400 420 Q430 432 425 462 Q420 490 385 498 Q345 505 315 488 Q292 472 295 448 Z"
              fill="#f59e0b"
              opacity="0.14"
              filter="url(#blur-flood)"
            />
            <path
              d="M310 420 Q360 408 400 420 Q430 432 425 462 Q420 490 385 498 Q345 505 315 488 Q292 472 295 448 Z"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              opacity="0.45"
              strokeDasharray="4 3"
            />
            {/* Sudirman — LOW */}
            <path
              d="M360 290 Q400 280 435 292 Q458 302 455 328 Q452 352 418 360 Q382 368 360 350 Q342 335 344 312 Z"
              fill="#22c55e"
              opacity="0.10"
            />
            <path
              d="M360 290 Q400 280 435 292 Q458 302 455 328 Q452 352 418 360 Q382 368 360 350 Q342 335 344 312 Z"
              fill="none"
              stroke="#22c55e"
              strokeWidth="1"
              opacity="0.35"
            />
          </g>
        )}

        {/* ── Evacuation points ─────────────────────────────────────────── */}
        {showEvac && (
          <g>
            {[
              { x: 390, y: 320, label: "GBK" },
              { x: 220, y: 350, label: "Lap. Roxy" },
              { x: 500, y: 430, label: "Lap. Condet" },
              { x: 150, y: 430, label: "RSUD Barat" },
            ].map(({ x, y, label }) => (
              <g key={label}>
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="#0f172a"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                <line
                  x1={x - 5}
                  y1={y}
                  x2={x + 5}
                  y2={y}
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <line
                  x1={x}
                  y1={y - 5}
                  x2={x}
                  y2={y + 5}
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <text
                  x={x + 13}
                  y={y + 4}
                  fill="#34d399"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* ── Route line ───────────────────────────────────────────────── */}
        {showRouteLayer && (
          <g filter="url(#route-glow)">
            <path
              d="M310 455 Q320 430 330 400 Q345 370 370 350 Q390 332 400 310"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="8 4"
              opacity="0.9"
            />
            <path
              d="M310 455 Q320 430 330 400 Q345 370 370 350 Q390 332 400 310"
              fill="none"
              stroke="#86efac"
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity="0.5"
            />
            <path
              d="M310 455 Q330 440 350 400 Q370 360 380 310 Q390 260 430 240"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="6 5"
              opacity="0.6"
            />
            <rect
              x="328"
              y="376"
              width="44"
              height="14"
              rx="3"
              fill="#052e16"
              opacity="0.85"
            />
            <text
              x="350"
              y="387"
              fill="#22c55e"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
            >
              AMAN
            </text>
            <rect
              x="358"
              y="280"
              width="48"
              height="14"
              rx="3"
              fill="#1c0606"
              opacity="0.85"
            />
            <text
              x="382"
              y="291"
              fill="#ef4444"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
            >
              RAWAN
            </text>
          </g>
        )}

        {/* ── Location markers ──────────────────────────────────────────── */}
        {[
          { x: 110, y: 125, label: "Pluit", risk: "high" },
          { x: 90, y: 248, label: "Kali Deres", risk: "high" },
          { x: 638, y: 265, label: "Kp. Melayu", risk: "high" },
          { x: 402, y: 320, label: "Sudirman", risk: "low" },
          { x: 355, y: 452, label: "Kemang", risk: "medium" },
          { x: 413, y: 357, label: "Manggarai", risk: "medium" },
        ].map(({ x, y, label, risk }) => {
          const color =
            risk === "high"
              ? "#ef4444"
              : risk === "medium"
                ? "#f59e0b"
                : "#22c55e";
          const bg =
            risk === "high"
              ? "#1c0606"
              : risk === "medium"
                ? "#1c1206"
                : "#052e16";
          return (
            <g key={label}>
              <circle
                cx={x}
                cy={y}
                r="7"
                fill={bg}
                stroke={color}
                strokeWidth="2"
                opacity="0.95"
              />
              <circle cx={x} cy={y} r="3" fill={color} opacity="0.9" />
              <rect
                x={x + 10}
                y={y - 9}
                width={label.length * 5.5 + 6}
                height="14"
                rx="3"
                fill="#0d1a2a"
                opacity="0.85"
              />
              <text
                x={x + 13}
                y={y + 2}
                fill="#e2e8f0"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* ── Attribution ───────────────────────────────────────────────── */}
        <rect
          x="0"
          y="585"
          width="800"
          height="15"
          fill="#0d1a2a"
          opacity="0.8"
        />
        <text x="6" y="595" fill="#475569" fontSize="8" fontFamily="monospace">
          FloodRoute AI · Demo · Data Simulasi · Jakarta Metropolitan Area
        </text>
      </svg>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
            className="flex items-center justify-center w-8 h-8 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-lg"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
            className="flex items-center justify-center w-8 h-8 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-lg"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-lg mt-1"
            aria-label="Locate"
          >
            <Locate size={14} />
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-lg"
            aria-label="Layers"
          >
            <Layers size={14} />
          </button>
        </div>
      )}

      {/* ── Scale ────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-7 right-3 flex items-center gap-1.5">
        <div className="h-px w-10 bg-slate-400 opacity-60" />
        <span className="text-slate-400 text-[10px] font-mono">5 km</span>
      </div>
    </div>
  );
}
