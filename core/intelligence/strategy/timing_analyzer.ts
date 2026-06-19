// GroIntel INT-3 — Timing Analyzer
import { StrategicTiming, TimingAssessment, StrategicContext } from "./strategy_types";

export class TimingAnalyzer {
  analyze(context: StrategicContext): StrategicTiming {
    const hasRisks = context.risk_signals.length > 2;
    const hasOpps = context.opportunity_signals.length > 2;
    const hasPlans = context.plans.length > 0;
    const hasSims = context.simulations.length > 0;

    let assessment: TimingAssessment;
    let reasoning: string;
    let conf: number;

    if (hasRisks && !hasOpps) {
      assessment = "too_early";
      reasoning = "Risk signals dominate — conditions not yet favorable";
      conf = 60;
    } else if (hasOpps && !hasPlans) {
      assessment = "early";
      reasoning = "Opportunities detected but not yet validated through planning";
      conf = 65;
    } else if (hasOpps && hasPlans && hasSims) {
      assessment = "right_time";
      reasoning = "Opportunities validated by planning and simulation — optimal timing";
      conf = 80;
    } else if (hasRisks && hasOpps) {
      assessment = "late";
      reasoning = "Mixed signals — some windows closing while others open";
      conf = 55;
    } else {
      assessment = "too_late";
      reasoning = "No significant opportunities or risks detected — may have missed window";
      conf = 40;
    }

    return {
      assessment,
      reasoning,
      confidence: conf,
      window_months: assessment === "right_time" ? 12 : assessment === "early" ? 18 : 6,
    };
  }
}
