// GroIntel INT-6 — Decision Context Builder
import { DecisionContext } from "./decision_types";

export class DecisionContextBuilder {
  build(entity: string, domain: string, goal: string, 
    optimizations: string[] = [], strategies: string[] = [], plans: string[] = [],
    simulations: string[] = [], discoveries: string[] = [], risks: string[] = [],
    opportunities: string[] = [], predAcc = 70, rf = 65, lv = 50, cc = 5, ul = 40): DecisionContext {
    return {
      entity, domain, goal,
      optimization_id: optimizations[0] || null,
      strategy_id: strategies[0] || null,
      plan_id: plans[0] || null,
      simulation_id: simulations[0] || null,
      discovery_ids: discoveries,
      risk_ids: risks,
      opportunity_ids: opportunities,
      prediction_accuracy: predAcc, reality_fidelity: rf, learning_velocity: lv,
      contradiction_count: cc, uncertainty_level: ul,
    };
  }
}
