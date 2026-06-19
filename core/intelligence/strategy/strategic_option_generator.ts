// GroIntel INT-3 — Strategic Option Generator
import { StrategicOption, StrategyType, StrategicContext } from "./strategy_types";

let soCounter = 0;
function genId(): string { return "so_" + (++soCounter).toString(16).padStart(6, "0"); }

export class StrategicOptionGenerator {
  generate(context: StrategicContext): StrategicOption[] {
    return [
      this.make("focus_strategy", "Focus resources on core strength and deepen existing advantage", 70, 65, ["core_capability"], "moderate", 60),
      this.make("expansion_strategy", "Expand into adjacent markets or capabilities", 75, 50, ["market_knowledge", "capital"], "high", 75),
      this.make("differentiation_strategy", "Differentiate through unique capability or positioning", 65, 55, ["innovation", "brand"], "moderate", 70),
      this.make("partnership_strategy", "Build strategic partnerships to extend reach", 60, 60, ["partnership_development", "bd"], "low", 65),
      this.make("trust_building_strategy", "Invest in trust signals and transparency", 55, 70, ["compliance", "communication"], "low", 50),
      this.make("capability_building_strategy", "Develop new capabilities for future growth", 70, 55, ["talent", "learning"], "high", 80),
      this.make("risk_reduction_strategy", "Reduce exposure to identified risks", 50, 65, ["risk_management"], "moderate", 45),
      this.make("discovery_strategy", "Explore uncertain but high-upside opportunities", 60, 40, ["research", "experimentation"], "moderate", 85),
      this.make("market_entry_strategy", "Enter a new geographic or vertical market", 80, 45, ["localization", "market_intelligence"], "high", 90),
      this.make("ecosystem_strategy", "Build or join an ecosystem to create network effects", 75, 50, ["platform", "community"], "high", 100),
    ];
  }

  private make(type: StrategyType, hypothesis: string, upside: number, confidence: number, capabilities: string[], resources: string, horizon: number): StrategicOption {
    return {
      id: genId(), type, hypothesis, target_outcome: `${type.replace(/_/g, " ")} outcome`,
      required_capabilities: capabilities, required_resources: resources,
      expected_upside: upside, key_risks: [`${type} execution risk`],
      time_horizon_days: horizon, confidence, fit_score: 0,
    };
  }
}
