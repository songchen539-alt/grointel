// GroIntel ROS-5 — Principle Registry (immutable principles)
import { Principle } from "./wisdom_types";

let pCounter = 0;
function genId(): string { return "pr_" + (++pCounter).toString(16).padStart(6, "0"); }

export class PrincipleRegistry {
  private principles: Map<string, Principle> = new Map();

  constructor() { this.initDefaults(); }

  private initDefaults(): void {
    const defaults: Omit<Principle, "id">[] = [
      { statement: "Reality before opinion", description: "Base decisions on observed reality, not assumptions", weight: 100, immutable: true, category: "epistemology" },
      { statement: "Evidence before confidence", description: "Confidence must be earned through evidence", weight: 95, immutable: true, category: "epistemology" },
      { statement: "Long-term before short-term", description: "Prioritize outcomes that compound over time", weight: 90, immutable: true, category: "temporal" },
      { statement: "Trust before growth", description: "Never sacrifice trust for short-term growth", weight: 85, immutable: true, category: "ethics" },
      { statement: "Learning before certainty", description: "Stay open to new evidence even when confident", weight: 80, immutable: true, category: "epistemology" },
      { statement: "Civilization before optimization", description: "The whole system matters more than local maxima", weight: 95, immutable: true, category: "ethics" },
      { statement: "Knowledge before assumptions", description: "Let verified knowledge override assumptions", weight: 88, immutable: true, category: "epistemology" },
      { statement: "Never optimize falsehood", description: "Do not optimize metrics at the cost of truth", weight: 100, immutable: true, category: "ethics" },
      { statement: "Reversibility before commitment", description: "Prefer reversible decisions when stakes are high", weight: 75, immutable: true, category: "decision" },
      { statement: "Transparency before speed", description: "Be explainable even when it slows decisions", weight: 70, immutable: true, category: "governance" },
    ];
    for (const d of defaults) this.principles.set(genId(), { ...d, id: genId() });
  }

  getAll(): Principle[] { return Array.from(this.principles.values()); }
  get(id: string): Principle | null { return this.principles.get(id) || null; }
  count(): number { return this.principles.size; }

  evaluateAgainst(decision_description: string): { principle: Principle; score: number; reason: string }[] {
    return this.getAll().map(p => {
      const d = decision_description.toLowerCase();
      let score = 75;
      const reasons: string[] = [];

      // Penalty patterns
      const aggressive = d.includes("aggressive") || d.includes("ignore");
      const optimize = d.includes("optimize");
      const deceptive = d.includes("deceive") || d.includes("manipulate") || d.includes("harm");
      const harmful = deceptive || aggressive || d.includes("violate");

      // Broad penalty for harmful decisions
      if (harmful) { score -= 15; reasons.push("Harmful approach detected"); }

      if (p.statement.toLowerCase().includes("reality") && (d.includes("ignore") || d.includes("assum"))) { score -= 10; reasons.push("Ignoring reality"); }
      if (p.statement.toLowerCase().includes("evidence") && aggressive) { score -= 10; reasons.push("Aggressive without evidence"); }
      if (p.statement.toLowerCase().includes("trust") && (deceptive || aggressive)) { score -= 20; reasons.push("Trust compromised"); }
      if (p.statement.toLowerCase().includes("civilization") && optimize) { score -= 10; reasons.push("Optimization may neglect civilization"); }
      if (p.statement.toLowerCase().includes("falsehood") && optimize) { score -= 15; reasons.push("Risk of optimizing falsehood"); }
      if (p.statement.toLowerCase().includes("reversible") && aggressive) { score -= 10; reasons.push("Aggressive reduces reversibility"); }
      if (p.statement.toLowerCase().includes("transparency") && deceptive) { score -= 15; reasons.push("Deception violates transparency"); }
      if (p.statement.toLowerCase().includes("learning") && d.includes("ignore")) { score -= 10; reasons.push("Ignoring impedes learning"); }

      // Bonus patterns
      if ((p.statement.toLowerCase().includes("learning") || p.statement.toLowerCase().includes("knowledge")) && (d.includes("learn") || d.includes("explore"))) { score += 10; reasons.push("Learning aligned"); }
      if (p.statement.toLowerCase().includes("trust") && d.includes("trust")) { score += 10; reasons.push("Trust prioritized"); }
      if (p.statement.toLowerCase().includes("truth") && d.includes("truth")) { score += 10; reasons.push("Truth maintained"); }

      return { principle: p, score: Math.max(0, Math.min(100, score)), reason: reasons.join("; ") || "Neutral" };
    });
  }
}
