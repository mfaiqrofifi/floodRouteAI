// ── Primitive union types ──────────────────────────────────────────────────────

/** Flood risk severity level */
export type RiskLevel = "low" | "medium" | "high";

/** Rainfall intensity derived from BMKG weather codes */
export type RainfallLevel = "none" | "light" | "medium" | "heavy";

/** Baseline area vulnerability (topographic + infrastructure factor) */
export type VulnerabilityLevel = "low" | "medium" | "high";

// ── Signal aggregation ─────────────────────────────────────────────────────────

/**
 * All observable signals that feed the risk engine.
 * Each value comes from a deterministic, traceable source.
 */
export interface FloodRiskSignals {
  /** Rainfall intensity derived from BMKG forecast */
  rainfallLevel: RainfallLevel;
  /** Human-readable weather summary from BMKG */
  weatherSummary: string;
  /** Static vulnerability score for the selected area */
  vulnerabilityLevel: VulnerabilityLevel;
  /** Number of active flood reports (from DB or deterministic baseline) */
  activeFloodReportsCount: number;
  /** Number of known flood-prone points nearby (from DB or deterministic baseline) */
  nearbyFloodPointsCount: number;
  /** Optional water gate / flood-alert status */
  waterAlertStatus?: "normal" | "alert" | "danger";
}

// ── Risk engine result ─────────────────────────────────────────────────────────

export interface RiskEngineResult {
  /** Computed score 0–100 */
  score: number;
  /** Derived risk level from the score */
  level: RiskLevel;
  /** User-readable contributing factors in Bahasa Indonesia */
  factors: string[];
  /** Copy of the input signals (for transparency) */
  normalizedSignals: FloodRiskSignals;
}

// ── AI explanation ─────────────────────────────────────────────────────────────

/** Structured AI-generated explanation for the risk result */
export interface AiFloodExplanation {
  /** One or two sentence summary for the header */
  summary: string;
  /** Paragraph explaining why this risk level was assigned */
  explanation: string;
  /** Ordered list of recommended actions for the user */
  actions: string[];
}

// ── API request / response ─────────────────────────────────────────────────────

export interface CheckRiskRequest {
  city: string;
  area: string;
}

export interface FloodRiskResponse {
  area: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: string[];
  signals: FloodRiskSignals;
  ai: AiFloodExplanation;
  /** ISO 8601 timestamp of when this response was generated */
  timestamp: string;
}

export interface JakartaAreaCoordinates {
  lat: number;
  lng: number;
}

export interface JakartaAreaStatusItem {
  id: string;
  area: string;
  district: string;
  city: "Jakarta";
  coordinates: JakartaAreaCoordinates;
  score: number;
  status: RiskLevel;
  topFactors: string[];
  summary: string;
  updatedAt: string;
}

export interface JakartaAreaStatusResponse {
  items: JakartaAreaStatusItem[];
  timestamp: string;
}
