// GroIntel APP-1 — Application Manifests (5 built-in)
import { ApplicationManifest } from "./application_types";

const now = "2026-06-20T18:00:00.000Z";

export const GROINTEL_MANIFEST: ApplicationManifest = {
  id: "grointel", name: "GroIntel", description: "Growth Intelligence — discover opportunities, optimize strategy, grow wisely",
  version: 1, domain: "growth", target_users: ["founders", "executives"],
  required_capabilities: ["reality.observe", "intelligence.discover", "intelligence.optimize", "intelligence.decide", "knowledge.query", "contribution.trace", "wisdom.judge"],
  required_agents: ["Opportunity Hunter", "Risk Sentinel", "Decision Advisor"],
  required_workflows: ["strategic_decision", "opportunity_discovery", "risk_monitoring"],
  permissions: ["read", "execute"], data_domains: ["growth", "market", "risk"],
  risk_level: "medium", created_at: now, updated_at: now,
};

export const TRADEINTEL_MANIFEST: ApplicationManifest = {
  id: "tradeintel", name: "TradeIntel", description: "Market & Trading Intelligence — simulate markets, plan trades, manage risk",
  version: 1, domain: "trading", target_users: ["traders", "analysts"],
  required_capabilities: ["reality.observe", "intelligence.simulate", "intelligence.plan", "wisdom.judge", "workflow.start", "knowledge.query"],
  required_agents: ["Risk Sentinel", "Decision Advisor"],
  required_workflows: ["strategic_decision", "risk_monitoring", "reality_event_analysis"],
  permissions: ["read", "execute"], data_domains: ["market", "risk", "economics"],
  risk_level: "high", created_at: now, updated_at: now,
};

export const RESEARCHINTEL_MANIFEST: ApplicationManifest = {
  id: "researchintel", name: "ResearchIntel", description: "Research Intelligence — explore, discover, validate, and organize knowledge",
  version: 1, domain: "research", target_users: ["researchers", "analysts"],
  required_capabilities: ["cognition.cognize", "cognition.graph.query", "intelligence.discover", "knowledge.query", "contribution.trace"],
  required_agents: ["Knowledge Curator", "Reality Observer"],
  required_workflows: ["reality_event_analysis", "prediction_validation"],
  permissions: ["read", "execute"], data_domains: ["knowledge", "research", "science"],
  risk_level: "low", created_at: now, updated_at: now,
};

export const POLICYINTEL_MANIFEST: ApplicationManifest = {
  id: "policyintel", name: "PolicyIntel", description: "Policy & Regulation Intelligence — analyze policy impact, forecast regulation trends",
  version: 1, domain: "policy", target_users: ["policy_analysts", "compliance"],
  required_capabilities: ["intelligence.simulate", "intelligence.strategize", "wisdom.judge", "knowledge.query", "cognition.graph.query"],
  required_agents: ["Reality Observer", "Decision Advisor"],
  required_workflows: ["strategic_decision", "risk_monitoring"],
  permissions: ["read", "execute", "approve"], data_domains: ["policy", "regulation", "law"],
  risk_level: "high", created_at: now, updated_at: now,
};

export const HEALTHINTEL_MANIFEST: ApplicationManifest = {
  id: "healthintel", name: "HealthIntel", description: "Healthcare Intelligence — monitor health data, predict outcomes, optimize care",
  version: 1, domain: "healthcare", target_users: ["clinicians", "researchers"],
  required_capabilities: ["reality.observe", "intelligence.discover", "intelligence.simulate", "intelligence.decide", "knowledge.query"],
  required_agents: ["Reality Observer", "Opportunity Hunter", "Risk Sentinel"],
  required_workflows: ["risk_monitoring", "prediction_validation", "reality_event_analysis"],
  permissions: ["read", "execute"], data_domains: ["health", "clinical", "research"],
  risk_level: "high", created_at: now, updated_at: now,
};

export const BUILTIN_MANIFESTS: ApplicationManifest[] = [
  GROINTEL_MANIFEST, TRADEINTEL_MANIFEST, RESEARCHINTEL_MANIFEST,
  POLICYINTEL_MANIFEST, HEALTHINTEL_MANIFEST,
];
