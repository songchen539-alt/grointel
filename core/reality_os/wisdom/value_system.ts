// GroIntel ROS-5 — Value System
import { CoreValue } from "./wisdom_types";

let vCounter = 0;
function genId(): string { return "val_" + (++vCounter).toString(16).padStart(6, "0"); }

export class ValueSystem {
  private values: Map<string, CoreValue> = new Map();

  constructor() { this.initDefaults(); }

  private initDefaults(): void {
    const defaults: Omit<CoreValue, "id">[] = [
      { name: "Truth", weight: 100, priority: 1, stability: 100, conflicts: ["expediency"], origin: "canon" },
      { name: "Trust", weight: 95, priority: 2, stability: 95, conflicts: ["speed", "growth"], origin: "canon" },
      { name: "Wisdom", weight: 90, priority: 3, stability: 90, conflicts: ["optimization"], origin: "canon" },
      { name: "Growth", weight: 80, priority: 4, stability: 75, conflicts: ["safety", "trust"], origin: "mission" },
      { name: "Learning", weight: 85, priority: 3, stability: 85, conflicts: ["certainty"], origin: "canon" },
      { name: "Civilization", weight: 95, priority: 1, stability: 100, conflicts: ["short_term_optimization"], origin: "canon" },
      { name: "Safety", weight: 90, priority: 2, stability: 95, conflicts: ["speed", "growth"], origin: "canon" },
    ];
    for (const d of defaults) this.values.set(genId(), { ...d, id: genId() });
  }

  getAll(): CoreValue[] { return Array.from(this.values.values()); }
  get(id: string): CoreValue | null { return this.values.get(id) || null; }
  findByName(name: string): CoreValue | null { return this.getAll().find(v => v.name === name) || null; }
  count(): number { return this.values.size; }

  evaluateAgainst(decisionDescription: string): { value: CoreValue; score: number; reason: string }[] {
    return this.getAll().map(v => {
      const d = decisionDescription.toLowerCase();
      let score = 80;
      const notes: string[] = [];

      const aggressive = d.includes("aggressive");
      const deceptive = d.includes("deceive") || d.includes("manipulate") || d.includes("harm");
      const ignore = d.includes("ignore");
      const optimize = d.includes("optimize");

      if (v.name === "Truth" && (aggressive || ignore || optimize)) { score -= 20; notes.push("Truth threatened"); }
      if (v.name === "Trust" && (deceptive || aggressive)) { score -= 25; notes.push("Trust compromised"); }
      if (v.name === "Safety" && aggressive) { score -= 20; notes.push("Aggressive approach risks safety"); }
      if (v.name === "Learning" && ignore) { score -= 15; notes.push("Ignoring reality impedes learning"); }
      if (v.name === "Civilization" && (aggressive || deceptive)) { score -= 15; notes.push("Civilization value at risk"); }
      if (v.name === "Wisdom" && aggressive) { score -= 20; notes.push("Aggression is not wisdom"); }

      if (v.name === "Learning" && (d.includes("learn") || d.includes("explore"))) { score += 10; notes.push("Exploration aligns with learning"); }
      if (v.name === "Trust" && d.includes("trust")) { score += 10; notes.push("Trust prioritized"); }
      if (v.name === "Growth" && d.includes("grow")) { score += 5; notes.push("Growth aligned"); }

      return { value: v, score: Math.max(0, Math.min(100, score)), reason: notes.join("; ") || "Aligned with value" };
    });
  }
}
