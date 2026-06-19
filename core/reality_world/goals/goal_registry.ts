// GroIntel RWS-2 — Goal Registry (10 default goals)
import { Goal, GoalType, GoalStatus } from "./goal_types";

let goalCounter = 0;
function genId(): string { return "goal_" + (++goalCounter).toString(16).padStart(6, "0"); }
function ts(): string { return new Date().toISOString(); }

const DEFAULT_GOAL_DEFS: Array<{
  name: string; description: string; type: GoalType; layer: number; domain: string;
  importance: number; urgency: number; civ_val: number; uncert_red: number; learn_val: number;
  target_domains: string[]; success_metrics: string[];
}> = [
  { name: "Improve Reality Fidelity", description: "Continuously reduce the gap between internal understanding and actual reality across all domains", type: "intelligence_goal", layer: 1, domain: "General", importance: 95, urgency: 80, civ_val: 90, uncert_red: 95, learn_val: 80, target_domains: ["General"], success_metrics: ["RealityFidelityScore", "PredictionAccuracy"] },
  { name: "Detect Emerging Opportunities", description: "Identify new growth opportunities across markets, technologies, and industries before they become obvious", type: "opportunity_detection_goal", layer: 1, domain: "Market", importance: 85, urgency: 70, civ_val: 85, uncert_red: 75, learn_val: 70, target_domains: ["Market", "Technology", "AI", "Business"], success_metrics: ["OpportunitiesDetected", "OpportunityConversion"] },
  { name: "Detect Emerging Risks", description: "Identify risks, threats, and potential failures before they materialize", type: "risk_monitoring_goal", layer: 1, domain: "General", importance: 90, urgency: 85, civ_val: 95, uncert_red: 80, learn_val: 70, target_domains: ["General"], success_metrics: ["RisksDetected", "EarlyWarningAccuracy"] },
  { name: "Improve Prediction Accuracy", description: "Make predictions more accurate across all domains through continuous validation and learning", type: "learning_goal", layer: 2, domain: "General", importance: 85, urgency: 70, civ_val: 80, uncert_red: 90, learn_val: 95, target_domains: ["General"], success_metrics: ["PredictionAccuracy", "ConfidenceCalibration"] },
  { name: "Increase Knowledge Density", description: "Expand the depth and breadth of knowledge across all observed domains", type: "intelligence_goal", layer: 2, domain: "General", importance: 75, urgency: 50, civ_val: 85, uncert_red: 85, learn_val: 90, target_domains: ["General"], success_metrics: ["KnowledgeDensity", "EntityCoverage"] },
  { name: "Track Civilization Health", description: "Monitor the overall health of civilization across innovation, trust, learning, and resilience dimensions", type: "civilization_goal", layer: 1, domain: "General", importance: 80, urgency: 60, civ_val: 100, uncert_red: 70, learn_val: 75, target_domains: ["Government", "Policy", "Education", "Healthcare", "Climate"], success_metrics: ["CivilizationHealthIndex", "TrustIndex"] },
  { name: "Understand Growth Patterns", description: "Discover and validate fundamental laws of how growth works across different contexts", type: "discovery_goal", layer: 2, domain: "Business", importance: 85, urgency: 55, civ_val: 90, uncert_red: 90, learn_val: 95, target_domains: ["Business", "Market", "Creator", "Community"], success_metrics: ["GrowthLawsDiscovered", "PatternValidationRate"] },
  { name: "Discover Capability Gaps", description: "Identify mismatches between capabilities needed and capabilities available across the ecosystem", type: "discovery_goal", layer: 2, domain: "Market", importance: 70, urgency: 60, civ_val: 75, uncert_red: 75, learn_val: 70, target_domains: ["Market", "Employment", "Education"], success_metrics: ["CapabilityGapsIdentified", "GapClosureRate"] },
  { name: "Monitor Trust Signals", description: "Track trust indicators across actors, institutions, and networks to detect deterioration early", type: "risk_monitoring_goal", layer: 1, domain: "General", importance: 80, urgency: 70, civ_val: 95, uncert_red: 70, learn_val: 65, target_domains: ["General"], success_metrics: ["TrustScore", "TrustDeteriorationAlerts"] },
  { name: "Learn From Prediction Failures", description: "Every prediction failure should produce actionable learning that improves future predictions", type: "learning_goal", layer: 2, domain: "General", importance: 80, urgency: 65, civ_val: 75, uncert_red: 85, learn_val: 100, target_domains: ["General"], success_metrics: ["PredictionFailureAnalysis", "LearningVelocity"] },
];

export class GoalRegistry {
  private goals: Map<string, Goal> = new Map();

  constructor() {
    for (const def of DEFAULT_GOAL_DEFS) {
      this.createFromDef(def);
    }
  }

  private createFromDef(def: typeof DEFAULT_GOAL_DEFS[0]): Goal {
    const goal: Goal = {
      id: genId(), name: def.name, description: def.description, type: def.type,
      layer: def.layer, domain: def.domain, priority: 0, status: "active",
      target_entities: [], target_domains: def.target_domains,
      success_metrics: def.success_metrics, constraints: [],
      progress: 0, importance: def.importance, urgency: def.urgency,
      civilization_value: def.civ_val, uncertainty_reduction: def.uncert_red,
      learning_value: def.learn_val, created_at: ts(), updated_at: ts(), confidence: 70,
    };
    goal.priority = this.calculatePriority(goal);
    this.goals.set(goal.id, goal);
    return goal;
  }

  register(goal: Goal): void {
    goal.priority = this.calculatePriority(goal);
    this.goals.set(goal.id, goal);
  }

  get(id: string): Goal | null { return this.goals.get(id) || null; }
  
  getAll(): Goal[] { return Array.from(this.goals.values()); }

  getActive(): Goal[] { return this.getAll().filter(g => g.status === "active"); }

  getByDomain(domain: string): Goal[] {
    return this.getAll().filter(g => g.target_domains.includes(domain));
  }

  getByType(type: GoalType): Goal[] {
    return this.getAll().filter(g => g.type === type);
  }

  activate(id: string): void {
    const g = this.goals.get(id);
    if (g) { g.status = "active"; g.updated_at = ts(); }
  }

  pause(id: string): void {
    const g = this.goals.get(id);
    if (g) { g.status = "paused"; g.updated_at = ts(); }
  }

  updateProgress(id: string, progress: number): void {
    const g = this.goals.get(id);
    if (g) { g.progress = Math.min(100, Math.max(0, progress)); g.updated_at = ts(); }
  }

  getRanked(): Goal[] {
    return this.getActive().sort((a, b) => b.priority - a.priority);
  }

  calculatePriority(goal: Partial<Goal>): number {
    const imp = goal.importance || 50;
    const urg = goal.urgency || 50;
    const civ = goal.civilization_value || 50;
    const unc = goal.uncertainty_reduction || 50;
    const lrn = goal.learning_value || 50;
    return Math.round(imp * 0.30 + urg * 0.20 + civ * 0.20 + unc * 0.15 + lrn * 0.15);
  }
}
