// GroIntel INT-3 — Moat Analyzer
import { StrategicMoat, StrategicContext } from "./strategy_types";

export class MoatAnalyzer {
  analyze(context: StrategicContext): StrategicMoat[] {
    return [
      { type: "data_moat", description: "Accumulated observations create barriers to entry", strength: Math.min(90, 50 + context.simulations.length * 5), durability_years: 5 },
      { type: "knowledge_moat", description: "Deep understanding of growth patterns compounds over time", strength: Math.min(95, 55 + context.learning_history.length * 5), durability_years: 8 },
      { type: "trust_moat", description: "Trust capital from reliable recommendations", strength: 60, durability_years: 10 },
      { type: "network_moat", description: "Network effects from connected participants", strength: Math.min(85, 40 + context.plans.length * 5), durability_years: 7 },
      { type: "capability_moat", description: "Unique cognitive capabilities that competitors lack", strength: 70, durability_years: 4 },
      { type: "learning_moat", description: "Learning velocity compounds advantage over time", strength: 75, durability_years: 6 },
      { type: "distribution_moat", description: "Reach across domains and geographies", strength: 55, durability_years: 3 },
    ];
  }
}
