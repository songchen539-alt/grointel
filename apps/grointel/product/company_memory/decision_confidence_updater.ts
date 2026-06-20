// GroIntel PRODUCT-2 — Decision Confidence Updater
import { DecisionConfidenceUpdate, DecisionMemory, RealityDiff } from "./company_memory_types";

export class DecisionConfidenceUpdater {
  update(decision: DecisionMemory, diff: RealityDiff): DecisionConfidenceUpdate {
    const prev = decision.current_confidence;
    let delta = 0;
    let direction: "increased" | "decreased" | "unchanged" | "obsolete" = "unchanged";
    let reason = "";

    if (diff.overall_impact === "high") {
      delta = -25; direction = "decreased";
      reason = "High-impact reality changes detected: goals, market, or budget changed significantly";
    } else if (diff.overall_impact === "medium") {
      delta = -10; direction = "decreased";
      reason = "Medium-impact reality changes detected: multiple fields changed";
    } else if (diff.overall_impact === "low") {
      delta = 5; direction = "increased";
      reason = "Minor reality changes detected — decision assumptions remain mostly valid";
    } else {
      direction = "unchanged";
      reason = "No significant reality changes — decision confidence maintained";
    }

    // Goal change is especially impactful
    if (diff.goal_changed) {
      delta -= 15; direction = "obsolete";
      reason = "Growth goal changed — previous decision may no longer be relevant";
    }

    const newConfidence = Math.max(0, Math.min(100, prev + delta));
    const now = new Date().toISOString();
    decision.current_confidence = newConfidence;
    decision.last_updated = now;
    decision.status = direction === "obsolete" ? "obsolete" : direction === "decreased" ? "weakened" : direction === "increased" ? "strengthened" : "active";
    decision.confidence_history.push({ timestamp: now, confidence: newConfidence, reason });

    return { decision_id: decision.decision_id, previous_confidence: prev, new_confidence: newConfidence, delta, direction, reason, updated_at: now };
  }
}
