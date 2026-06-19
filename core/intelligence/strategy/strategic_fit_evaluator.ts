// GroIntel INT-3 — Strategic Fit Evaluator
import { StrategicOption, StrategicContext } from "./strategy_types";

export class StrategicFitEvaluator {
  evaluate(option: StrategicOption, context: StrategicContext): number {
    const goalAlignment = context.active_goals.length > 0 ? 70 : 40;
    const capabilityFit = option.required_capabilities.length <= 3 ? 65 : 50;
    const marketFit = context.opportunity_signals.length > context.risk_signals.length ? 70 : 45;
    const timingFit = context.time_horizon_days >= option.time_horizon_days ? 75 : 40;
    const trustFit = context.risk_signals.length > 3 ? 40 : 65;
    const learningFit = context.learning_history.length > 0 ? 60 : 40;
    const civFit = option.type.includes("trust") || option.type.includes("ecosystem") ? 75 : 50;

    option.fit_score = Math.round(
      goalAlignment * 0.25 + capabilityFit * 0.20 + marketFit * 0.15 + timingFit * 0.15 +
      trustFit * 0.10 + learningFit * 0.10 + civFit * 0.05
    );

    return option.fit_score;
  }

  evaluateAll(options: StrategicOption[], context: StrategicContext): StrategicOption[] {
    for (const opt of options) this.evaluate(opt, context);
    return options.sort((a, b) => b.fit_score - a.fit_score);
  }
}
