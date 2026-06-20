// GroIntel ROS-5 — Ethical Constraints
import { EthicalConstraint } from "./wisdom_types";

let eCounter = 0;
function genId(): string { return "ec_" + (++eCounter).toString(16).padStart(6, "0"); }

export class EthicalConstraintChecker {
  private constraintDefs: { type: string; description: string; check: (desc: string) => { triggered: boolean; severity: string; details: string } }[] = [
    {
      type: "irreversible_harm",
      description: "Decision could cause irreversible damage",
      check: (d: string) => {
        const triggered = d.includes("aggressive") || d.includes("irreversible") || d.includes("destroy");
        return { triggered, severity: triggered ? "high" : "none", details: triggered ? "Action may be irreversible" : "No irreversible harm detected" };
      },
    },
    {
      type: "truth_degradation",
      description: "Decision could degrade truth quality",
      check: (d: string) => {
        const triggered = d.includes("optimize") && !d.includes("truth");
        return { triggered, severity: triggered ? "medium" : "none", details: triggered ? "Optimization without truth preservation" : "No truth degradation risk" };
      },
    },
    {
      type: "knowledge_corruption",
      description: "Decision could corrupt knowledge",
      check: (d: string) => {
        const triggered = d.includes("override") || d.includes("ignore") || d.includes("edit");
        return { triggered, severity: triggered ? "critical" : "none", details: triggered ? "Risk of knowledge corruption" : "Knowledge integrity maintained" };
      },
    },
    {
      type: "trust_erosion",
      description: "Decision could erode trust",
      check: (d: string) => {
        const triggered = d.includes("manipulate") || d.includes("deceive") || d.includes("hide");
        return { triggered, severity: triggered ? "high" : "none", details: triggered ? "Trust erosion risk detected" : "Trust integrity maintained" };
      },
    },
    {
      type: "unsafe_optimization",
      description: "Optimization without safety bounds",
      check: (d: string) => {
        const triggered = d.includes("optimize") && !d.includes("safe");
        return { triggered, severity: triggered ? "medium" : "none", details: triggered ? "Optimization without explicit safety bounds" : "No unsafe optimization" };
      },
    },
    {
      type: "civilization_risk",
      description: "Decision risks civilization value",
      check: (d: string) => {
        const triggered = d.includes("short") && !d.includes("civil");
        return { triggered, severity: triggered ? "high" : "none", details: triggered ? "Short-term focus without civilization consideration" : "Civilization value considered" };
      },
    },
  ];

  check(decision: string): EthicalConstraint[] {
    return this.constraintDefs.map(c => {
      const result = c.check(decision.toLowerCase());
      return { id: genId(), type: c.type, description: c.description, severity: result.severity as any, triggered: result.triggered, details: result.details };
    });
  }

  hasCriticalViolations(assessment: EthicalConstraint[]): boolean {
    return assessment.some(a => a.severity === "critical" || a.severity === "high");
  }

  countTriggers(assessment: EthicalConstraint[]): number {
    return assessment.filter(a => a.triggered).length;
  }
}
