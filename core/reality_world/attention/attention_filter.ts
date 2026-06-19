// GroIntel RWS-2 — Attention Filter
import { AttentionDecision, AttentionDecisionValue, ATTENTION_THRESHOLDS, BUDGET_MAP, KernelBudget } from "./attention_types";
import { WorldEvent } from "../reality_stream/world_types";
import { Goal } from "../goals/goal_types";
import { AttentionScorer } from "./attention_scorer";

export class AttentionFilter {
  private scorer: AttentionScorer;

  constructor() {
    this.scorer = new AttentionScorer();
  }

  evaluate(event: WorldEvent, goals: Goal[]): AttentionDecision {
    const scores = this.scorer.score(event, goals);
    const total = scores.total;

    let dec: AttentionDecisionValue;
    if (total >= ATTENTION_THRESHOLDS.deep_analyze.min) dec = "deep_analyze";
    else if (total >= ATTENTION_THRESHOLDS.escalate.min) dec = "escalate";
    else if (total >= ATTENTION_THRESHOLDS.process.min) dec = "process";
    else if (total >= ATTENTION_THRESHOLDS.monitor.min) dec = "monitor";
    else dec = "ignore";

    return {
      event_id: event.id,
      decision: dec,
      score: total,
      reasons: [
        `goal_alignment:${scores.goal_alignment}`,
        `novelty:${scores.novelty}`,
        `urgency:${scores.urgency}`,
        `impact:${scores.impact}`,
      ],
      linked_goals: goals.filter(g => g.target_domains.includes(event.domain)).map(g => g.id),
      allocated_budget: BUDGET_MAP[dec],
      timestamp: new Date().toISOString(),
    };
  }

  shouldProcess(decision: AttentionDecision): boolean {
    return decision.decision === "process" || decision.decision === "escalate" || decision.decision === "deep_analyze";
  }

  getBudget(decision: AttentionDecision): KernelBudget {
    return BUDGET_MAP[decision.decision];
  }
}
