// GroIntel RWS-2 — Attention Allocator
import { AttentionDecision, AttentionDecisionValue, KernelBudget, AttentionTrace } from "./attention_types";
import { WorldEvent } from "../reality_stream/world_types";
import { Goal } from "../goals/goal_types";

let traceCounter = 0;
function genId(): string { return "atn_" + (++traceCounter).toString(16).padStart(6, "0"); }

export class AttentionAllocator {
  allocate(event: WorldEvent, decision: AttentionDecision, goals: Goal[]): AttentionTrace {
    return {
      id: genId(),
      event_id: event.id,
      score_components: {
        goal_alignment: 50,
        novelty: 50,
        urgency: 50,
        impact: 50,
        uncertainty: 50,
        risk: 50,
        opportunity: 50,
      },
      linked_goals: decision.linked_goals,
      decision: decision.decision,
      reason: `Score ${decision.score}: ${decision.decision} — budget ${decision.allocated_budget}`,
      final_budget: decision.allocated_budget,
      timestamp: new Date().toISOString(),
    };
  }
}
