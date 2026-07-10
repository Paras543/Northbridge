/**
 * Mirrors the backend Pydantic schemas exactly (app/core/graph/schemas.py)
 * and the DB models described in the backend audit (organizations, clients,
 * projects, documents, reports). Keep these in sync manually — if a
 * Pydantic field changes, this file needs the matching edit.
 */

// ---------- Graph / consultation schemas (app/core/graph/schemas.py) ----------

export type ProblemType =
  | "growth_expansion"
  | "cost_reduction"
  | "customer_retention"
  | "pricing"
  | "operational_efficiency"
  | "market_entry"
  | "risk_assessment"
  | "other";

export type Urgency = "low" | "medium" | "high";

export interface ClientBrief {
  core_question: string;
  problem_type: ProblemType;
  has_data: boolean;
  urgency: Urgency;
  data_description: string | null;
  constraints: string[];
}

export type SpecialistType = "market" | "financial" | "risk" | "operation";
export type Confidence = "high" | "low" | "moderate";

// ---- ML supporting_data shapes (app/core/ml/schemas.py) ----

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResult {
  metric_name: string;
  historical_points: number;
  forecast: ForecastPoint[];
  trend_direction: "increasing" | "decreasing" | "flat";
}

export interface ClusterProfile {
  cluster_id: number;
  size: number;
  description: string;
  representative_stats: Record<string, number>;
}

export interface SegmentationResult {
  n_clusters: number;
  profiles: ClusterProfile[];
}

export interface DriverResult {
  feature: string;
  importance: number;
  direction: "increases" | "decreases";
}

export interface DriverAnalysisResult {
  target_variable: string;
  drivers: DriverResult[];
}

// financial_report bundles both under one dict — see Financial_analyst node
export interface FinancialSupportingData {
  forecast: ForecastResult | null;
  drivers: DriverAnalysisResult | null;
}

// market_report's supporting_data IS a SegmentationResult directly (or null)
// risk_ops's supporting_data is currently always null (no ML target yet)
export type SupportingData =
  | SegmentationResult
  | FinancialSupportingData
  | null;

export interface SpecialistReport {
  specialist: SpecialistType;
  key_metrics: Record<string, number>;
  assumptions: string;
  findings: string[];
  confidence: Confidence;
  supporting_data: SupportingData;
}

export interface ChallengeCritique {
  target_specialist: SpecialistType;
  target_assumption: string;
  critique: string;
  severity: "minor" | "moderate" | "major";
}

export interface FinalRecommendation {
  recommendations: string;
  supporting_points: string[];
  disagreements: string[];
  risk_flags: string[];
}

export interface HumanFeedback {
  approved: boolean;
  requested_changes: string[];
  target_sections: SpecialistType | null;
}

export interface RevisionDecision {
  changed_meaningfully: boolean;
  reasoning: string;
  continue_loop: boolean;
  round_number: number;
}

// ---------- Case state / consultations API ----------

// CaseStatus is also defined as ConsultationStatus below — kept in sync
export type CaseStatus = "running" | "interrupted" | "completed";

export interface CaseState {
  thread_id: string;
  status: CaseStatus;
  // On "interrupted": data is the interrupt payload -> { recommendation, message }
  // On "completed": data is the full graph result dict (client_brief, market_report,
  // financial_report, Risk_report, final_recommendation, critiques, report_path, etc.)
  data: Record<string, unknown>;
}

export interface StartCaseRequest {
  raw_brief: string;
  project_id: string;
}

export interface ResumeCaseRequest {
  approved: boolean;
  request_changes: string[];
}

// ---------- DB-backed entities (organizations / clients / projects / documents / reports) ----------

export type TeamRole = "admin" | "consultant" | string; // backend audit didn't enumerate full TeamRole set — adjust if you have the exact enum

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  company_name: string;
  email: string;
  industry: string | null;
  notes: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

export type EmbeddingStatus =
  | "pending"
  | "extracted"
  | "extraction_failed"
  | "embedded"
  | "embedding_failed"
  | "no_chunks";

export interface Document {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  embedding_status: EmbeddingStatus;
  content_type: string;
  uploaded_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  name: string;
  content: string;
  case_thread_id: string;
  created_at: string;
}

// ---------- Retrieval ----------

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_name: string;
  project_id: string;
  chunk_index: number;
  content: string;
  similarity_score: number;
}


export type ConsultationStatus = "running" | "interrupted" | "completed";


export interface ConsultationSummary {
  id: string;
  thread_id: string;
  project_id: string;
  status: ConsultationStatus;
  raw_brief: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSummary {
  id: string;
  project_id: string;
  name: string;
  case_thread_id: string;
  created_at: string;
}

export interface ReportDetail extends ReportSummary {
  content: string;
}



