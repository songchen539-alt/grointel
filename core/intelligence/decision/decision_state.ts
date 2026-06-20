// GroIntel INT-6 — Decision State Integration
import { Decision } from "./decision_types";

export interface DecisionState {
  active_decisions: Decision[];
  decision_recommendations: Decision[];
  pending_approvals: Decision[];
  rejected_decisions: Decision[];
  deferred_decisions: Decision[];
  high_confidence_decisions: Decision[];
  decision_history: Decision[];
  decision_confidence: number;
  decision_risk_distribution: { low: number; medium: number; high: number };
}

export class DecisionStateManager {
  private history: Decision[] = [];

  record(d: Decision): void {
    this.history.push(d);
  }

  getState(): DecisionState {
    const active = this.history.filter(d => d.type === "recommend_action" || d.type === "choose_strategy" || d.type === "select_plan" || d.type === "allocate_resources" || d.type === "escalate_to_human");
    const recommendations = this.history.filter(d => d.type === "recommend_action" || d.type === "choose_strategy" || d.type === "select_plan" || d.type === "allocate_resources");
    const pending = this.history.filter(d => d.recommendation.approval.required && d.type !== "reject_action" && d.type !== "defer_decision");
    const rejected = this.history.filter(d => d.type === "reject_action");
    const deferred = this.history.filter(d => d.type === "defer_decision");
    const highConf = this.history.filter(d => d.recommendation.threshold.threshold_level === "high_confidence_recommendation");

    const avgConf = this.history.length > 0
      ? Math.round(this.history.reduce((s, d) => s + d.recommendation.option.confidence, 0) / this.history.length)
      : 0;

    const dist = { low: 0, medium: 0, high: 0 };
    for (const d of this.history) {
      const rl = d.recommendation.approval.risk_level;
      if (rl === "high") dist.high++;
      else if (rl === "medium") dist.medium++;
      else dist.low++;
    }

    return {
      active_decisions: active, decision_recommendations: recommendations,
      pending_approvals: pending, rejected_decisions: rejected,
      deferred_decisions: deferred, high_confidence_decisions: highConf,
      decision_history: this.history,
      decision_confidence: avgConf, decision_risk_distribution: dist,
    };
  }

  clear(): void { this.history = []; }
}
