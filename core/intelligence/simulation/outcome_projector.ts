// GroIntel INT-1 — Outcome Projector
import { Scenario, ProjectedOutcome, ProjectionCase } from "./simulation_types";

let ocCounter = 0;
function genId(): string { return "out_" + (++ocCounter).toString(16).padStart(6, "0"); }

export class OutcomeProjector {
  project(scenario: Scenario): ProjectedOutcome[] {
    const base = this.baseOutcome(scenario);
    return [
      this.projectCase(scenario, "best_case"),
      this.projectCase(scenario, "base_case"),
      this.projectCase(scenario, "worst_case"),
      this.projectCase(scenario, "unexpected_case"),
    ];
  }

  private projectCase(scenario: Scenario, case_: ProjectionCase): ProjectedOutcome {
    const probMult = { best_case: 0.15, base_case: 0.45, worst_case: 0.15, unexpected_case: 0.10 };
    const impMult = { best_case: 1.5, base_case: 1.0, worst_case: -1.0, unexpected_case: -0.5 };

    return {
      id: genId(),
      scenario_id: scenario.id,
      case: case_,
      description: this.describe(scenario, case_),
      probability: Math.round(probMult[case_] * 100),
      confidence: Math.round(scenario.assumptions.reduce((s, a) => s + a.confidence, 0) / scenario.assumptions.length),
      required_conditions: this.conditions(scenario, case_),
      risks: case_ === "best_case" ? ["Overconfidence in positive outcome", "May miss downside signals"] : case_ === "worst_case" ? ["Downside may materialize", "Mitigation may be insufficient"] : [],
      opportunities: case_ === "best_case" ? ["Accelerate investment", "Capture market share"] : case_ === "base_case" ? ["Stable execution", "Incremental improvement"] : [],
      expected_impact: Math.round(50 * impMult[case_]),
    };
  }

  private describe(scenario: Scenario, case_: ProjectionCase): string {
    const base = `${scenario.type.replace(/_/g, " ")} for ${scenario.input.target_entity}`;
    switch (case_) {
      case "best_case": return `Optimistic — ${base} exceeds expectations within ${scenario.time_horizon_days} days`;
      case "base_case": return `Expected — ${base} progresses as predicted`;
      case "worst_case": return `Pessimistic — ${base} faces significant headwinds`;
      case "unexpected_case": return `Surprise — ${base} disrupted by unforeseen factor`;
    }
  }

  private conditions(scenario: Scenario, case_: ProjectionCase): string[] {
    const base = ["Current market conditions hold"];
    if (case_ === "best_case") base.push("Favorable market tailwinds", "Competitive advantage maintained");
    if (case_ === "worst_case") base.push("Market headwinds", "Competitive pressure increases");
    if (case_ === "unexpected_case") base.push("Black swan event", "Structural market change");
    return base;
  }

  private baseOutcome(scenario: Scenario): { probability: number; impact: number } {
    return { probability: 45, impact: 50 };
  }
}
