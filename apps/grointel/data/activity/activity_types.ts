// GroIntel DATA-3 — Activity Types
export type ActivityCategory = "SEO" | "SEM" | "Paid Ads" | "Social Media" | "Creator Marketing" | "Influencer Campaign" | "Affiliate" | "PR" | "Podcast" | "Newsletter" | "Community" | "Referral" | "Events" | "Partnership" | "Sales Outreach" | "Product Launch" | "Market Entry" | "Localization" | "Hiring" | "AI Automation" | "Developer Relations" | "Customer Success" | "Retention" | "Pricing" | "Brand Campaign" | "Content Marketing";
export type ActivityStatus = "planned" | "started" | "executing" | "completed" | "validated" | "failed" | "cancelled";

export interface GrowthActivity {
  id: string; category: ActivityCategory; name: string; objective: string;
  owner_id: string; participant_ids: string[]; channels: string[];
  region: string; industry: string; duration_days: number; status: ActivityStatus;
  created_at: string; started_at: string | null; completed_at: string | null;
  validated_at: string | null; updated_at: string;
  confidence: number; version: number;
  history: { timestamp: string; change: string; status: ActivityStatus; confidence: number }[];
}

export interface GrowthObjective { id: string; activity_id: string; primary_goal: string; target_metric: string; target_value: number; kpis: string[]; }

export interface GrowthExecution { id: string; activity_id: string; channel: string; tactic: string; team_involved: string[]; tools_used: string[]; frequency: string; }

export interface GrowthOutcome { id: string; activity_id: string; traffic: number; leads: number; revenue: number; conversion_rate: number; followers_gained: number; engagement_rate: number; brand_lift: number; retention_rate: number; cac: number; ltv: number; roi: number; confidence: number; }

export interface GrowthBudget { id: string; activity_id: string; budget: number; currency: string; estimated_cost: number; actual_cost: number; pricing_model: string; resource_cost: number; }

export interface GrowthTimeline { id: string; activity_id: string; planned_start: string; planned_end: string; actual_start: string | null; actual_end: string | null; duration_days: number; time_to_result_days: number; }

export interface GrowthEvidence { id: string; activity_id: string; source: string; data: Record<string, unknown>; confidence: number; observed_at: string; }

export interface GrowthMetric { id: string; activity_id: string; metric_name: string; metric_value: number; unit: string; period: string; source: string; confidence: number; }

export interface GrowthStage { id: string; activity_id: string; stage: ActivityStatus; entered_at: string; exited_at: string | null; duration_hours: number; }

export interface ActivityTrace { id: string; action: string; activity_id: string; details: string; timestamp: string; }
