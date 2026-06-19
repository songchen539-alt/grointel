// GroIntel INT-3 — Strategic Context Builder
import { StrategicContext } from "./strategy_types";

export class StrategicContextBuilder {
  build(entity: string, domain: string, goals: string[], risks: string[], opportunities: string[],
    simulations: string[] = [], plans: string[] = [], learning: string[] = [], horizon = 180): StrategicContext {
    return {
      entity, domain,
      current_position: `${domain} actor with ${goals.length} active goals, ${risks.length} risks, ${opportunities.length} opportunities`,
      active_goals: goals, risk_signals: risks, opportunity_signals: opportunities,
      simulations, plans, learning_history: learning,
      time_horizon_days: horizon,
    };
  }
}
