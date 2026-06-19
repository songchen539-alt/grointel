// GroIntel INT-3 — Tradeoff Analyzer
import { StrategicTradeoff, TradeoffType } from "./strategy_types";

export class TradeoffAnalyzer {
  analyze(): StrategicTradeoff[] {
    return [
      { type: "speed_vs_quality", description: "Moving fast may reduce quality of analysis", chosen_side: "quality", sacrificed_side: "speed", severity: 40 },
      { type: "growth_vs_trust", description: "Aggressive growth may damage trust capital", chosen_side: "trust", sacrificed_side: "growth", severity: 50 },
      { type: "short_term_vs_long_term", description: "Short-term results may not build long-term capability", chosen_side: "long_term", sacrificed_side: "short_term", severity: 60 },
      { type: "risk_vs_upside", description: "Higher upside strategies carry more risk", chosen_side: "balanced", sacrificed_side: "maximum_upside", severity: 45 },
      { type: "focus_vs_diversification", description: "Focus is efficient but may miss opportunities", chosen_side: "focus", sacrificed_side: "diversification", severity: 35 },
      { type: "automation_vs_human_judgment", description: "Automation is faster but may miss nuance", chosen_side: "human_judgment", sacrificed_side: "automation", severity: 30 },
      { type: "scale_vs_reality_fidelity", description: "Scaling may reduce per-entity understanding", chosen_side: "reality_fidelity", sacrificed_side: "scale", severity: 55 },
    ];
  }
}
