// GroIntel INT-3 — Strategy Engine (read-only)
import { Strategy, StrategicContext, StrategyEvaluation, StrategyTrace } from "./strategy_types";
import { StrategicContextBuilder } from "./strategic_context_builder";
import { StrategicOptionGenerator } from "./strategic_option_generator";
import { StrategicFitEvaluator } from "./strategic_fit_evaluator";
import { TradeoffAnalyzer } from "./tradeoff_analyzer";
import { MoatAnalyzer } from "./moat_analyzer";
import { TimingAnalyzer } from "./timing_analyzer";

let stCounter = 0;
function genId(): string { return "strat_" + (++stCounter).toString(16).padStart(6, "0"); }
function trId(): string { return "strtrc_" + Math.random().toString(36).slice(2, 10); }

export class StrategyEngine {
  public readonly contextBuilder = new StrategicContextBuilder();
  public readonly optionGen = new StrategicOptionGenerator();
  public readonly fitEvaluator = new StrategicFitEvaluator();
  public readonly tradeoffAnalyzer = new TradeoffAnalyzer();
  public readonly moatAnalyzer = new MoatAnalyzer();
  public readonly timingAnalyzer = new TimingAnalyzer();

  run(entity: string, domain: string, goals: string[], risks: string[], opportunities: string[],
    simulations: string[] = [], plans: string[] = [], learning: string[] = []): { strategy: Strategy; trace: StrategyTrace } {
    const startTime = new Date();
    const steps: { step: number; action: string; output: string }[] = [];
    const strategyId = genId();

    // 1. Build context
    steps.push({ step: 1, action: "build_context", output: `Context for ${entity} in ${domain}` });
    const context = this.contextBuilder.build(entity, domain, goals, risks, opportunities, simulations, plans, learning);

    // 2. Generate options
    steps.push({ step: 2, action: "generate_options", output: "Generating 10 strategy options" });
    const options = this.optionGen.generate(context);

    // 3. Evaluate fit
    steps.push({ step: 3, action: "evaluate_fit", output: "Evaluating strategic fit across 7 dimensions" });
    const ranked = this.fitEvaluator.evaluateAll(options, context);

    // 4. Analyze tradeoffs
    steps.push({ step: 4, action: "analyze_tradeoffs", output: "Analyzing 7 strategic tradeoffs" });
    const tradeoffs = this.tradeoffAnalyzer.analyze();

    // 5. Analyze moat
    steps.push({ step: 5, action: "analyze_moat", output: "Analyzing 7 moat types" });
    const moats = this.moatAnalyzer.analyze(context);

    // 6. Analyze timing
    steps.push({ step: 6, action: "analyze_timing", output: "Assessing strategic timing" });
    const timing = this.timingAnalyzer.analyze(context);

    // 7. Select best option
    const selected = ranked[0] || null;
    const rejected = ranked.slice(1);
    steps.push({ step: 7, action: "select_option", output: `Selected: ${selected?.type || "none"}` });

    const avgFit = ranked.reduce((s, o) => s + o.fit_score, 0) / Math.max(1, ranked.length);
    const avgConf = ranked.reduce((s, o) => s + o.confidence, 0) / Math.max(1, ranked.length);

    const evaluation: StrategyEvaluation = {
      fit_score: Math.round(avgFit),
      upside_score: Math.round(ranked.reduce((s, o) => s + o.expected_upside, 0) / Math.max(1, ranked.length)),
      risk_score: Math.round(100 - avgConf),
      confidence: Math.round(avgConf * 0.6 + timing.confidence * 0.4),
      fit_components: { goal_alignment: 70, capability_fit: 65, market_fit: 60, timing_fit: 55, trust_fit: 60, learning_fit: 50, civilization_fit: 65 },
    };

    const strategy: Strategy = {
      id: strategyId, target_entity: entity, target_domain: domain,
      strategic_goal: goals[0] || "improve_growth_intelligence",
      context, options: ranked, selected_option: selected, rejected_options: rejected,
      tradeoffs, moats, timing, evaluation,
      confidence: evaluation.confidence,
      created_at: new Date().toISOString(),
    };

    const trace: StrategyTrace = {
      id: trId(), strategy_id: strategyId, steps,
      started_at: startTime.toISOString(),
      completed_at: new Date().toISOString(),
    };

    return { strategy, trace };
  }
}
