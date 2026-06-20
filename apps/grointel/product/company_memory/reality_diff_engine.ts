// GroIntel PRODUCT-2 — Reality Diff Engine
import { RealityDiff, RealityChange, CompanyRealitySnapshot } from "./company_memory_types";

export class RealityDiffEngine {
  private counter = 0;

  diff(oldSnap: CompanyRealitySnapshot, newSnap: CompanyRealitySnapshot): RealityDiff {
    const changes: RealityChange[] = [];

    const check = (field: string, oldVal: string, newVal: string, impact: "none"|"low"|"medium"|"high") => {
      if (oldVal !== newVal) changes.push({ field, before: oldVal, after: newVal, impact });
    };
    check("growth_goal", oldSnap.growth_goal, newSnap.growth_goal, "high");
    check("target_market", oldSnap.target_market, newSnap.target_market, "medium");
    check("budget_range", oldSnap.budget_range, newSnap.budget_range, "medium");
    check("timeline", oldSnap.timeline, newSnap.timeline, "low");

    const oldSignals = new Set(oldSnap.signals);
    const newSignals = new Set(newSnap.signals);
    const gained = newSnap.signals.filter(s => !oldSignals.has(s));
    const lost = oldSnap.signals.filter(s => !newSignals.has(s));

    const goalChanged = oldSnap.growth_goal !== newSnap.growth_goal;
    const marketChanged = oldSnap.target_market !== newSnap.target_market;
    const budgetChanged = oldSnap.budget_range !== newSnap.budget_range;
    const timelineChanged = oldSnap.timeline !== newSnap.timeline;

    const highCount = changes.filter(c => c.impact === "high").length;
    const medCount = changes.filter(c => c.impact === "medium").length;
    let overall: "none"|"low"|"medium"|"high" = "none";
    if (highCount > 0) overall = "high";
    else if (medCount > 1) overall = "medium";
    else if (changes.length > 0) overall = "low";

    return {
      diff_id: "diff_" + (++this.counter).toString(16).padStart(6, "0"),
      snapshot_a: oldSnap.snapshot_id, snapshot_b: newSnap.snapshot_id,
      changes, signal_gained: gained, signal_lost: lost,
      goal_changed: goalChanged, market_changed: marketChanged,
      budget_changed: budgetChanged, timeline_changed: timelineChanged,
      overall_impact: overall, computed_at: new Date().toISOString(),
    };
  }
}
